import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { signatureService } from "../service/signature";
import { ISignature, actionTypes } from "../state/signature";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<ISignature>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function getSignatureAction() {
  return async (dispatch: Dispatch) => {
    try {
      //dispatch(dataActions.request());
      return await signatureService.getSignature();
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function putSignatureAction(signatureData: string, isGlobalSignature: boolean) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await signatureService.putSignature(signatureData, isGlobalSignature);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
