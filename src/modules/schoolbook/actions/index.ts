/**
 * Schoolbook actions
 */

import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../framework/util/session";
import moduleConfig from "../moduleConfig";
import { getUnacknowledgedChildrenIdsForParent, ISchoolbookWordReport } from "../reducer";
import { schoolbookService } from "../service";

/**
 * Fetch the details of a given schoolbook word.
 */
export const getSchoolbookWordDetailsAction = (schoolbookWordId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    // Get schoolbook word
    const schoolbookWordDetails = await schoolbookService.word.get(session, schoolbookWordId);
    return schoolbookWordDetails;
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] getSchoolbookWordDetailsAction failed`, e);
  }
};

/**
 * Acknowledge children for a given schoolbook word.
 */
export const acknowledgeSchoolbookWordActionForChildren = (schoolbookWordId: string, unacknowledgedChildrenIds: string[]) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    // Acknowledge word for each child
    const acknowledgements = unacknowledgedChildrenIds.map(unacknowledgedChildId =>
      schoolbookService.word.acknowledge(session, schoolbookWordId, unacknowledgedChildId)
    );
    await Promise.all(acknowledgements);
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] acknowledgeSchoolbookWordActionForChildren failed`, e);
  }
};

/**
 * Acknowledge children for a given schoolbook word.
 */
export const acknowledgeSchoolbookWordAction = (schoolbookWordData: ISchoolbookWordReport) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    const unacknowledgedChildrenIds = schoolbookWordData && getUnacknowledgedChildrenIdsForParent(session.user.id, schoolbookWordData);
    return await dispatch(acknowledgeSchoolbookWordActionForChildren(schoolbookWordData.word.id.toString(), unacknowledgedChildrenIds));
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] acknowledgeSchoolbookWordAction failed`, e);
  }
};