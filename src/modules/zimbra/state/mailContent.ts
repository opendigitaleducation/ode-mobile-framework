/* eslint-disable flowtype/no-types-missing-file-annotation */
import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import mailConfig from "../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface IMail {
  id: string;
  date: moment.Moment;
  state: string;
  unread: boolean;
  from: string;
  to: [];
  cc: [];
  bcc: [];
  displayNames: [];
  hasAttachment: boolean;
  attachments: [];
  subject: string;
  body: string;
  response: boolean;
  systemFolder: string;
  parent_id: string;
  thread_id: string;
}

export type IMailContent = IMail[];

// THE STATE --------------------------------------------------------------------------------------

export type IMailContentState = AsyncState<IMailContent>;

export const initialState: IMailContent = [];

export const getMailContentState = (globalState: any) =>
  mailConfig.getState(globalState).mailContent as IMailContentState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType("MAIL_CONTENT"));
