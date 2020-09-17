import * as React from "react";
import { View } from "react-native";
import moment from "moment";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import I18n from "i18n-js";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { connect } from "react-redux";
import { getCoursesListState } from "../state/courses";
import { bindActionCreators } from "redux";
import { fetchCourseListAction, fetchCourseListFromTeacherAction } from "../actions/courses";
import { getSubjectsListState } from "../../viesco/state/subjects";
import { getPersonnelListState } from "../../viesco/state/personnel";
import { fetchSlotListAction } from "../actions/slots";
import { getSlotsListState } from "../state/slots";
import { getSelectedChildStructure, getSelectedChildGroup } from "../../viesco/state/children";
import { getSessionInfo } from "../../../App";
import { INavigationProps } from "../../../types";
import Timetable from "../components/Timetable";
import { getSelectedStructure } from "../../viesco/state/structure";

export type TimetableProps = {
  courses: any;
  subjects: any;
  teachers: any;
  slots: any;
  structure: any;
  group: string;
  teacherId: string;
  fetchChildCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, group: string) => any;
  fetchTeacherCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    teacherId: string
  ) => any;
  fetchSlots: (structureId: string) => any;
} & INavigationProps;

export type TimetableState = {
  startDate: moment.Moment;
  selectedDate: moment.Moment;
};

class TimetableContainer extends React.PureComponent<TimetableProps, TimetableState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("viesco-timetable"),
        headerLeft: () => <HeaderBackAction navigation={navigation} />,
        headerRight: () => <View />,
        headerStyle: {
          backgroundColor: "#162EAE",
        },
      },
      navigation
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf("week"),
      selectedDate: moment(),
    };
  }

  fetchCourses = () => {
    const { startDate } = this.state;
    const { fetchTeacherCourses, fetchChildCourses, structure, group, teacherId } = this.props;
    if (getSessionInfo().type === "Teacher")
      fetchTeacherCourses(structure.id, startDate, startDate.clone().endOf("week"), teacherId);
    else fetchChildCourses(structure.id, startDate, startDate.clone().endOf("week"), group);
  };

  componentDidMount() {
    const { structure } = this.props;
    this.fetchCourses();
    this.props.fetchSlots(structure.id);
  }

  componentDidUpdate(prevProps, prevState) {
    const { startDate, selectedDate } = this.state;
    const { structure, group, fetchSlots } = this.props;

    // on selected date change
    if (!prevState.selectedDate.isSame(selectedDate, "day"))
      this.setState({ startDate: selectedDate.clone().startOf("week") });

    // on week, structure, group change
    if (
      !prevState.startDate.isSame(startDate, "day") ||
      structure.id !== prevProps.structure.id ||
      group !== prevProps.group
    )
      this.fetchCourses();

    // on structure change
    if (structure.id !== prevProps.structure.id) fetchSlots(structure.id);
  }

  updateSelectedDate = (newDate: moment.Moment) => {
    this.setState({
      selectedDate: newDate,
      startDate: newDate.clone().startOf("week"),
    });
  };

  public render() {
    return (
      <Timetable
        {...this.props}
        startDate={this.state.startDate}
        selectedDate={this.state.selectedDate}
        updateSelectedDate={this.updateSelectedDate}
      />
    );
  }
}

const mapStateToProps = (state: any): any => ({
  courses: getCoursesListState(state),
  subjects: getSubjectsListState(state),
  teachers: getPersonnelListState(state),
  slots: getSlotsListState(state),
  structure:
    getSessionInfo().type === "Student"
      ? getSessionInfo().administrativeStructures[0]
      : getSessionInfo().type === "Relative"
      ? getSelectedChildStructure(state)
      : { id: getSelectedStructure(state) },
  group: getSessionInfo().type === "Student" ? getSessionInfo().realClassesNames[0] : getSelectedChildGroup(state),
  teacherId: getSessionInfo().id,
});

const mapDispatchToProps = (dispatch: any): any =>
  bindActionCreators(
    {
      fetchChildCourses: fetchCourseListAction,
      fetchTeacherCourses: fetchCourseListFromTeacherAction,
      fetchSlots: fetchSlotListAction,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimetableContainer);
