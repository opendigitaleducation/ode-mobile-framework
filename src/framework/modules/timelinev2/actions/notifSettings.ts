import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../util/session";
import moduleConfig from "../moduleConfig";
import { ITimeline_State } from "../reducer";
import * as notifDefinitionsStateHandler from "../reducer/notifDefinitions";
import { loadNotificationsDefinitionsAction } from "./notifDefinitions";
import { actions as notifFilterSettingsActions, INotifFilterSettings } from "../reducer/notifSettings/notifFilterSettings"
import { actions as pushNotifsSettingsActions, IPushNotifsSettings } from "../reducer/notifSettings/pushNotifsSettings"
import { getItemJson, setItemJson } from "../../../util/storage";
import { pushNotifsService } from "../service";

export const loadNotificationFiltersSettingsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        dispatch(notifFilterSettingsActions.request());
        const session = getUserSession(getState());
        // 1 - Load notification definitions if necessary
        let state = moduleConfig.getState(getState()) as ITimeline_State;
        if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
            await dispatch(loadNotificationsDefinitionsAction());
        }
        state = moduleConfig.getState(getState());

        // 2 - Load notif settings from Async Storage
        const asyncStorageKey = `${moduleConfig.name}.notifFilterSettings`;
        let settings: INotifFilterSettings = await getItemJson(asyncStorageKey) || {};
        const defaults = Object.fromEntries(state.notifDefinitions.notifFilters.map(v => [v.type, v.type === "MESSAGERIE" ? false : true])); // TODO: beautify 
        settings = {...defaults, ...settings};

        // 3 - Save loaded notif settings for persistency
        await setItemJson(asyncStorageKey, settings);
        dispatch(notifFilterSettingsActions.receipt(settings));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] loadNotificationsSettingsAction failed`, e);
        dispatch(notifFilterSettingsActions.error(e));
    }
}

export const setFiltersAction = (selectedFilters: INotifFilterSettings) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        const asyncStorageKey = `${moduleConfig.name}.notifFilterSettings`;
        dispatch(notifFilterSettingsActions.setRequest(selectedFilters));
        await setItemJson(asyncStorageKey, selectedFilters);
        dispatch(notifFilterSettingsActions.setReceipt(selectedFilters));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] setFilterAction failed`, e);
        dispatch(notifFilterSettingsActions.setError(selectedFilters));
    }
}

export const loadPushNotifsSettingsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        dispatch(pushNotifsSettingsActions.request());
        const session = getUserSession(getState());
        // 1 - Load notification definitions if necessary
        let state = moduleConfig.getState(getState()) as ITimeline_State;
        if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
            await dispatch(loadNotificationsDefinitionsAction());
        }
        state = moduleConfig.getState(getState());

        // 2 - Load notif settings from API
        const pushNotifsSettings = await pushNotifsService.list(session);
        dispatch(pushNotifsSettingsActions.receipt(pushNotifsSettings));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] loadPushNotifsSettingsAction failed`, e);
        dispatch(pushNotifsSettingsActions.error(e));
    }
}

export const updatePushNotifsSettingsAction = (changes: IPushNotifsSettings) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        console.log("updatePushNotifsSettingsAction");
        dispatch(pushNotifsSettingsActions.setRequest(changes));
        const session = getUserSession(getState());
        await pushNotifsService.set(session, changes);
        dispatch(pushNotifsSettingsActions.setReceipt(changes));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] updatePushNotifsSettingsAction failed`, e);
        dispatch(pushNotifsSettingsActions.setError(e));
    }
}