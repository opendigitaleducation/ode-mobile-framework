import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../../infra/redux/async2";
import viescoConfig from "../../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface ICourses {
  id: string;
  subjectId: string;
  classes: string[];
  structureId: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  roomLabels: string[];
  groups: string[];
  registerId: string;
}

export type ICoursesList = ICourses[];

// THE STATE --------------------------------------------------------------------------------------

export type ICoursesListState = AsyncState<ICoursesList>;

export const initialState: ICoursesList = [];

export const getCoursesListState = (globalState: any) =>
  viescoConfig.getState(globalState).presences.coursesList as ICoursesListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType("TEACHER_COURSES"));
