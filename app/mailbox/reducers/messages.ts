/**
 * Conversation messages state reducer
 * Flattened list of all loaded messages.
 */
import moment from "moment";

import { IArrayById } from "../../infra/collections";
import asyncReducer from "../../infra/redux/async";

import { actionTypes, actionTypeSetRead } from "../actions/messages";
import {
  actionTypeMessageSendError,
  actionTypeMessageSendRequested,
  actionTypeMessageSent
} from "../actions/sendMessage";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IConversationMessage {
  // It's like an IMessage ! LOL !
  id: string; // Message's own id
  parentId: string; // Id of the message that it reply to
  subject: string; // Subject of the message
  body: string; // Content of the message. It's HTML.
  from: string; // User id of the sender
  fromName: string; // Name of the sender
  to: string[]; // User Ids of the receivers
  toName: string[]; // Name of the receivers
  cc: string[]; // User Ids of the copy receivers
  ccName: string[]; // Name of the copy receivers
  displayNames: string[][]; // [0: id, 1: displayName] for each person concerned by this message.
  date: moment.Moment; // DateTime of the message
  threadId: string; // Id of the thread (Id of the first message in this thread).
  unread: boolean; // Self-explaining
  rownum: number; // number of the message in the thread (starting from 1 from the newest to the latest).
  status: ConversationMessageStatus; // sending status of the message
}

export type IConversationMessageList = IArrayById<IConversationMessage>;
export type IConversationMessageNativeArray = IConversationMessage[]; // Used when th order of received data needs to be kept.

export enum ConversationMessageStatus {
  sent,
  sending,
  failed
}
// HELPERS ---------------------------------------------------------------------------------------
//TODO find a better way to automatically compute toName array from displayNames. should it stay in reducers?
function addToNames(message: IConversationMessage) {
  const toName = [];
  if (message.displayNames) {
    message.displayNames.forEach(dN => {
      const id = dN[0];
      if (id != message.from) {
        const name = dN[1];
        toName.push(name);
      }
    });
  }
  message.toName = toName;
  return message;
}
// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IConversationMessageList = {};

const conversationThreadListReducer = (
  state: IConversationMessageList = stateDefault,
  action
) => {
  // console.log("REDUCER TEST", action.type);
  switch (action.type) {
    case actionTypes.received:
      // action contains, `data`, `receivedAt` (not used)
      // console.log("reducer : messages data merged.");
      for (let id in action.data) {
        const message = action.data[id];
        //compute toName array (because it is not sent by backend)
        addToNames(message);
      }
      return {
        ...state,
        ...action.data // if a message already exists with its Id, it is replaced.
      };
    case actionTypeSetRead:
      // action contains, `messageIds`
      // console.log("reducer : messages data marked as read.");
      const result = { ...state };
      for (const messageId of action.messageIds) {
        result[messageId].unread = false;
      }
      return result;
    case actionTypeMessageSendRequested:
      // action contains `data: IConversationMessage`
      // console.log("reducer: (messages) send message request", action);
      return {
        ...state,
        [action.data.id]: action.data
      };
    case actionTypeMessageSent:
      // action contains, `data: IConversationMessage (with newId and oldId instead of id)`
      //console.log("reducer: (messages) send message ok", action);
      const result2 = { ...state };
      result2[action.data.newId] = result2[action.data.oldId];
      result2[action.data.newId].status = ConversationMessageStatus.sent;
      result2[action.data.newId].id = action.data.newId;
      result2[action.data.newId].to = action.data.to;
      addToNames(result2[action.data.newId]);
      delete result2[action.data.oldId];
      return result2;
    case actionTypeMessageSendError:
      // action contains, `data: IConversationMessage`
      // console.log("reducer: (messages) send message error", action);
      const result3 = { ...state };
      result3[action.data.oldId].to = action.data.to;
      result3[action.data.oldId].status = ConversationMessageStatus.failed;
      addToNames(result3[action.data.newId]);
      return result3;
    default:
      return state;
  }
};

export default asyncReducer<IConversationMessageList>(
  conversationThreadListReducer,
  actionTypes
);
