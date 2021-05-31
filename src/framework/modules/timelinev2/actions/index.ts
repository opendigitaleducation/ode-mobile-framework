/**
 * Timeline v2 actions
 */

import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../session";
import moduleConfig from "../moduleConfig";
import { ITimeline_State } from "../reducer";
import * as notifDfinitionsState from "../reducer/notifDefinitions";
import { loadNotificationsDefinitionsAction } from "./notifDefinitions";

export const loadNotificationsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());
    let state = moduleConfig.getState(getState()) as ITimeline_State;
    // 1 - Load notification definitions if necessary
    if (!notifDfinitionsState.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
      await dispatch(loadNotificationsDefinitionsAction());
    }
    state = moduleConfig.getState(getState());
    // 2 - Load notification settings if necessary

    // 3 - Load notifications

  } catch (e) {
    console.warn(`[${moduleConfig.name}] loadNotificationsAction failed`, e);
  }
};
