import { combineReducers } from "redux";

import count from "./count";
import folders from "./folders";
import mailContent from "./mailContent";
import mailList from "./mailList";
import quota from "./quota";
import signature from "./signature";

const rootReducer = combineReducers({
  mailList,
  folders,
  quota,
  mailContent,
  count,
  signature,
});
export default rootReducer;
