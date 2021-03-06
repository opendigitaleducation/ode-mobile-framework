import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../../infra/redux/async2";
import { groupListService } from "../services/group";
import { actionTypes, IGroupList } from "../state/group";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IGroupList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchGroupListAction(classes: string, student: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await groupListService.get(classes, student);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
