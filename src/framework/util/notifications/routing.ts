/**
 * Notification routing
 * Router operations on opeening a notification
 */

import { Action, AnyAction } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { Trackers } from "../tracker";

// Module Map

export interface INotifHandlerTrackInfo {
	action: string, value?: number
}
export interface INotifHandlerReturnType {
	managed: number;
	trackInfo?: INotifHandlerTrackInfo
}

export type NotifHandlerThunk = ThunkAction<Promise<INotifHandlerReturnType>, any, void, AnyAction>;
export type NotifHandlerThunkAction = (notification: IAbstractNotification, trackCategory: false | string) => NotifHandlerThunk;

export interface INotifHandlerDefinition {
	type: string;
	"event-type"?: string | string[];
	notifHandlerAction: NotifHandlerThunkAction
};

const registeredNotifHandlers: INotifHandlerDefinition[] = [];
export const registerNotifHandler = (def: INotifHandlerDefinition) => {
	registeredNotifHandlers.push(def);
	return def;
}
export const registerNotifHandlers = (def: INotifHandlerDefinition[]) => {
	return def.map(d => registerNotifHandler(d));
}
export const getRegisteredNotifHandlers = () => registeredNotifHandlers;

// Notif Handler Action

const defaultNotificationActions: { [k: string]: NotifHandlerThunkAction } = {
	moduleRedirection: (n, trackCategory) => async (dispatch, getState) => {
		const rets = await Promise.all(registeredNotifHandlers.map(async def => {
			if (n.type !== def.type) return false;
			const eventTypeArray = typeof def["event-type"] === 'string'
				? [def["event-type"]]
				: def["event-type"];
			if (eventTypeArray !== undefined && !eventTypeArray.includes(n["event-type"])) return false;
			if ((n as ITimelineNotification).message && (n as ITimelineNotification).date && (n as ITimelineNotification).id) { /**/// #44727 tmp fix. Copied from timelineRedirection.
				const thunkAction = def.notifHandlerAction(n, trackCategory);
				const ret = await (dispatch(thunkAction) as unknown as Promise<INotifHandlerReturnType>); // TS BUG ThunkDispatch is treated like a regular Dispatch
				trackCategory && ret.trackInfo && Trackers.trackEvent(trackCategory, ret.trackInfo.action, `${n.type}.${n["event-type"]}`, ret.trackInfo.value);
				return ret;
			} else {
				/**/// #44727 tmp fix. Copied from timelineRedirection.
				/**/    trackCategory && Trackers.trackEvent(trackCategory, 'Timeline', `${n.type}.${n["event-type"]}`);
				/**/	mainNavNavigate('timeline', {
				/**/		notification: n
				/**/    });
				/**/	return { managed: 1 };
				/**///
			}
		}));
		return {
			managed: rets.reduce((total, ret) => total + (ret ? ret.managed : 0), 0)
		};
	},

	legacyRedirection: (n, trackCategory) => async (dispatch, getState) => {
		const legacyThunkAction = legacyHandleNotificationAction(
			n.backupData.params as unknown as NotificationData,
			getState().user?.auth?.apps
		) as ThunkAction<Promise<number>, any, any, AnyAction>;
		// No tracking here, they're defined in legacyActions themselves.
		return {
			managed: await (dispatch(legacyThunkAction) as unknown as Promise<number>)
		}
	},

	webRedirection: (n, trackCategory) => async (dispatch, getState) => {
		const notifWithUri = getAsResourceUriNotification(n);
		if (!notifWithUri) {
			console.log(`[cloudMessaging] notification ${n.type}.${n["event-type"]} has no resource uri.`);
			return { managed: 0 };
		}
		if ((n as ITimelineNotification).message && (n as ITimelineNotification).date && (n as ITimelineNotification).id) { /**/// #44727 tmp fix. Copied from timelineRedirection.
			trackCategory && Trackers.trackEvent(trackCategory, 'Browser', `${n.type}.${n["event-type"]}`);
			mainNavNavigate('timeline/goto', {
				notification: notifWithUri
			})
			return { managed: 1 };
		} else {
			/**/// #44727 tmp fix. Copied from timelineRedirection.
			/**/    trackCategory && Trackers.trackEvent(trackCategory, 'Timeline', `${n.type}.${n["event-type"]}`);
			/**/	mainNavNavigate('timeline', {
			/**/		notification: n
			/**/    });
			/**/	return { managed: 1 };
			/**///
		}
	},

	timelineRedirection: (n, trackCategory) => async (dispatch, getState) => {
		trackCategory && Trackers.trackEvent(trackCategory, 'Timeline', `${n.type}.${n["event-type"]}`);
		mainNavNavigate('timeline', {
			notification: n
		});
		return { managed: 1 };

	}
}

export const defaultNotificationActionStack = [
	defaultNotificationActions.moduleRedirection,
	defaultNotificationActions.legacyRedirection,
	defaultNotificationActions.webRedirection,
	defaultNotificationActions.timelineRedirection,
];

export const handleNotificationAction = (notification: IAbstractNotification, actionStack: NotifHandlerThunkAction[], trackCategory: false | string = false) =>
	async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
		let manageCount = 0;
		for (const action of actionStack) {
			if (manageCount) return;
			const ret = await dispatch(action(notification, trackCategory)) as unknown as INotifHandlerReturnType;
			manageCount += ret.managed;
			ret.trackInfo && trackCategory && Trackers.trackEvent(trackCategory, ret.trackInfo.action, 'Post-routing', ret.trackInfo.value);
		}
	}

// LEGACY ZONE ====================================================================================

import legacyModuleDefinitions from "../../../AppModules";
import { getAsResourceUriNotification, IAbstractNotification, ITimelineNotification } from ".";
import { mainNavNavigate } from "../../../navigation/helpers/navHelper";

export interface NotificationData {
	resourceUri: string
}
export interface NotificationHandler {
	(notificationData: NotificationData, apps: string[], trackCategory: string | false): Promise<boolean>
}
export interface NotificationHandlerFactory<S, E, A extends Action> {
	(dispatch: ThunkDispatch<S, E, A>, getState: () => S): NotificationHandler;
}

export const legacyHandleNotificationAction = (data: NotificationData, apps: string[], trackCategory: false | string = "Push Notification") =>
	async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
		// function for calling handlerfactory
		let manageCount = 0;
		const call = async (notifHandlerFactory: NotificationHandlerFactory<any, any, any>) => {
			try {
				const managed = await notifHandlerFactory(dispatch, getState)(data, apps, trackCategory);
				if (managed) {
					manageCount++;
				}
			} catch (e) {
				console.warn("[pushNotification] Failed to dispatch handler: ", e);
			}
		}
		// timeline is not a functional module
		// await call(legacyTimelineHandlerFactory); This is commented becasue timeline v2 developpement.
		// notify functionnal module
		for (let handler of legacyModuleDefinitions) {
			if (handler && handler.config && handler.config.notifHandlerFactory) {
				const func = await handler.config.notifHandlerFactory();
				await call(func);
			}
		}

		return manageCount;

	}

// END LEGACY ZONE