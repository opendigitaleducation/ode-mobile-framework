import { Dispatch } from "redux";

import { progressAction, progressEndAction, progressInitAction } from "../../infra/actions/progress";
import { newMailService } from "../service/newMail";

export function sendMailAction(mailDatas, draftId: string, InReplyTo: string) {
  return async () => {
    try {
      await newMailService.sendMail(mailDatas, draftId, InReplyTo);
    } catch (errmsg) {
      console.error("ERROR new mail: ", errmsg);
    }
  };
}

export function makeDraftMailAction(mailDatas, inReplyTo: string, isForward: boolean) {
  return async (dispatch: Dispatch) => {
    return await newMailService.makeDraftMail(mailDatas, inReplyTo, isForward);
  };
}

export function updateDraftMailAction(mailId: string, mailDatas) {
  return async () => {
    return await newMailService.updateDraftMail(mailId, mailDatas);
  };
}

export function addAttachmentAction(mailId: string, attachment: any) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(progressInitAction());
      const handleProgress = progress => dispatch(progressAction(progress));
      const newAttachments = await newMailService.addAttachment(mailId, attachment, handleProgress);
      dispatch(progressEndAction());
      return newAttachments;
    } catch (errmsg) {
      console.log("ERROR uploading attachment", errmsg);
      dispatch(progressEndAction());
      throw errmsg;
    }
  };
}

export function deleteAttachmentAction(mailId: string, attachmentId: string) {
  return async (dispatch: Dispatch) => await newMailService.deleteAttachment(mailId, attachmentId);
}
