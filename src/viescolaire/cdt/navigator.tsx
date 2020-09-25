import { createStackNavigator } from "react-navigation-stack";
import Timetable from "./components/CdtTimetable";

import Homework from "./containers/Homework";
import HomeworkList from "./containers/HomeworkList";
import Session from "./containers/Session";

export default createStackNavigator(
  {
    HomeworkList,
    HomeworkPage: Homework,
    SessionPage: Session,
    CdtTimetable: Timetable,
  },
  {
    headerMode: "screen",
  }
);
