import I18n from "i18n-js";
import userConfig from "../config";
import { Dispatch, AnyAction } from "redux";
import Conf from "../../../ode-framework-conf";
import { signedFetchJson } from "../../infra/fetchWithCache";
import { notifierShowAction } from "../../infra/notifier/actions";
import { ThunkDispatch } from "redux-thunk";
import { Trackers } from "../../infra/tracker";

// TYPES

export interface IUpdatableProfileValues {
  displayName?: string,
  email?: string,
  homePhone?: string,
  mobile?: string,
  loginAlias?: string;
  picture?: string;
  photo?: string;
}

// ACTION TYPES

export const actionTypeProfileUpdateRequested = userConfig.createActionType("PROFILE_UPDATE_REQUESTED");
export const actionTypeProfileUpdateSuccess = userConfig.createActionType("PROFILE_UPDATE_SUCCESS");
export const actionTypeProfileUpdateError = userConfig.createActionType("PROFILE_UPDATE_ERROR");

// ACTION BUILDERS

const profileUpdateActionBuilder = (type: string) => (updatedProfileValues: IUpdatableProfileValues) => ({
  type,
  updatedProfileValues
})

export const profileUpdateRequestedAction = profileUpdateActionBuilder(actionTypeProfileUpdateRequested);

export const profileUpdateSuccessAction = profileUpdateActionBuilder(actionTypeProfileUpdateSuccess);

export const profileUpdateErrorAction = profileUpdateActionBuilder(actionTypeProfileUpdateError);

// THUNKS

export function profileUpdateAction(updatedProfileValues: IUpdatableProfileValues, updateAvatar: boolean) {
  return async (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>, getState: () => any) => {
    const notifierId = `profile${updateAvatar ? "One" : "Two"}`;
    const notifierSuccessText = I18n.t(`ProfileChange${updateAvatar ? "Avatar" : ""}Success`);
    const getNotifierErrorText = () => {
      if (updateAvatar) {
        return updatedProfileValues.picture === ""
          ? I18n.t("ProfileDeleteAvatarError")
          : I18n.t("ProfileChangeAvatarErrorAssign")
      } else {
        return I18n.t("ProfileChangeError");
      }
    }

    if (!Conf.currentPlatform) throw new Error("must specify a platform");
    for (const index in updatedProfileValues) {
      if (updatedProfileValues.hasOwnProperty(index)) {
        if (index.match(/Valid/) ||
          updatedProfileValues[index as keyof IUpdatableProfileValues] === getState().user.info[index]) {
          delete updatedProfileValues[index as keyof IUpdatableProfileValues];
        }
      }
    }

    dispatch(profileUpdateRequestedAction(updatedProfileValues));
    try {
      const userId = getState().user.info.id;
      const reponse = await signedFetchJson(
        `${Conf.currentPlatform.url}/directory/user${updateAvatar ? "book" : ""}/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedProfileValues)
        }
      );
      if ((reponse as any)['error']) {
        throw new Error((reponse as any)['error']);
      }
      dispatch(profileUpdateSuccessAction(updateAvatar ? {photo: updatedProfileValues.picture} : updatedProfileValues));
      dispatch(notifierShowAction({
        id: notifierId,
        text: notifierSuccessText,
        icon: 'checked',
        type: 'success'
      }));
      Trackers.trackEvent("Profile", "UPDATE");
    } catch (e) {
      console.warn(e);
      dispatch(profileUpdateErrorAction(updatedProfileValues));

      if ((e as Error).message.match(/loginAlias/)) {
        dispatch(notifierShowAction({
          id: notifierId,
          text: I18n.t("ProfileChangeLoginError"),
          icon: 'close',
          type: 'error'
        }));
        Trackers.trackEvent("Profile", "UPDATE ERROR", "ProfileChangeLoginError");
      } else {
        dispatch(notifierShowAction({
          id: notifierId,
          text: getNotifierErrorText(),
          icon: 'close',
          type: 'error'
        }));
        Trackers.trackEvent("Profile", "UPDATE ERROR", `${updateAvatar ? "Avatar" : "Profile"}ChangeError`);
      }
    }
  }
}

