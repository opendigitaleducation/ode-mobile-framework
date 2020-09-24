import { createAsyncActionTypes, AsyncState } from "../../infra/redux/async2";
import signatureConfig from "../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface ISignature {
  preference: {
    useSignature: boolean;
    signature: string;
  };
  id: string;
  zimbraENTSignatureExists: boolean;
}

// THE STATE --------------------------------------------------------------------------------------

export type ISignatureState = AsyncState<ISignature>;

export const initialState: ISignature = {
  preference: {
    useSignature: false,
    signature: "",
  },
  id: "",
  zimbraENTSignatureExists: false,
};

export const getSignatureState = (globalState: any) =>
  signatureConfig.getLocalState(globalState).signature as ISignatureState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(signatureConfig.createActionType("SIGNATURE"));
