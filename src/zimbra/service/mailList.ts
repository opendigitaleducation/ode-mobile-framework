import moment from "moment";

import {fetchJSONWithCache} from "../../infra/fetchWithCache";
import {IMailList} from "../state/mailList";

// Data type of what is given by the backend.
export type IMailListBackend = {
  id: string;
  date: string;
  subject: string;
  parent_id: string;
  thread_id: string;
  state: string;
  unread: boolean;
  response: boolean;
  hasAttachment: boolean;
  systemFolder: string;
  to: [];
  cc: [];
  bcc: [];
  displayNames: [];
  attachments: [];
  from: string;
}[];

const mailListAdapter: (data: IMailListBackend) => IMailList = data => {
  let result = [] as IMailList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    date: moment(item.date),
    subject: item.subject,
    parent_id: item.parent_id,
    thread_id: item.thread_id,
    state: item.state,
    unread: item.unread,
    response: item.response,
    hasAttachment: item.hasAttachment,
    systemFolder: item.systemFolder,
    to: item.to,
    cc: item.cc,
    bcc: item.bcc,
    displayNames: item.displayNames,
    attachments: item.attachments,
    from: item.from,
  }));
  return result;
};

export const mailListService = {
  get: async (page, folder = "inbox") => {
    switch (folder) {
      case "inbox":
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Inbox&page=${page}&unread=false`));
      case "sendMessages":
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Sent&page=${page}&unread=false`));
      case "drafts":
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Drafts&page=${page}&unread=false`));
      case "trash":
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Trash&page=${page}&unread=false`));
      case "spams":
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Junk&page=${page}&unread=false`));
      default:
        return [];
    }
  },
  getFromFolder: async (folderLocation: string, page: number = 1) => {
    return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Inbox/${folderLocation}&page=${page}`));
  },
};
