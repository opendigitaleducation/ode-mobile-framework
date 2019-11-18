/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import {
  asyncActionTypes,
} from "../../infra/redux/async";
import workspaceConfig from "../config";
import { IItems, IFiltersParameters, IItem } from "../types";
import { getFolders } from "./helpers/folders";
import { getDocuments } from "./helpers/documents";

// ACTION LIST ------------------------------------------------------------------------------------


export const actionTypes = asyncActionTypes(
  workspaceConfig.createActionType("WORKSPACE_LIST")
);

export function workspaceListInvalidated() {
  return { type: actionTypes.invalidated };
}

export function workspaceListRequested() {
  return { type: actionTypes.requested };
}

export function workspaceListReceived(data: IItems<IItem>, id: string | undefined) {
  return { type: actionTypes.received, data, id, receivedAt: Date.now() };
}

export function workspaceListFetchError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

/**
 * Calls a fetch operation to get workspace list from the backend.
 * Dispatches WORKSPACE_LIST_REQUESTED, WORKSPACE_LIST_RECEIVED, and WORKSPACE_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchWorkspaceList(parameters: IFiltersParameters) {
  return async (dispatch: any, state: any) => {
    dispatch(workspaceListRequested());

    try {
      let [dataFolders, dataDocuments] = await Promise.all([getFolders(parameters), getDocuments(parameters)]);

      dispatch(workspaceListReceived({ ...dataFolders, ...dataDocuments }, parameters.parentId));
    } catch (errmsg) {
      dispatch(workspaceListFetchError(errmsg));
    }
  };
}
