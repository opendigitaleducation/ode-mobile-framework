import * as React from "react";
import { View } from "react-native";
import moment from "moment";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import I18n from "i18n-js";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { connect } from "react-redux";
import { getCoursesListState } from "../../edt/state/courses";
import { bindActionCreators } from "redux";
import { fetchCourseListFromTeacherAction } from "../../edt/actions/courses";
import { fetchSlotListAction } from "../../edt/actions/slots";
import { getSlotsListState } from "../../edt/state/slots";
import { getSessionInfo } from "../../../App";
import { INavigationProps } from "../../../types";
import { getSelectedStructure } from "../../viesco/state/structure";
import Timetable from "../components/CdtTimetable";
import { fetchHomeworkListAction } from "../actions/homeworks";
import { fetchSessionListAction } from "../actions/sessions";
import { getSessionsListState } from "../state/sessions";
import { getHomeworksListState } from "../state/homeworks";
import { getSubjectsListState } from "../../viesco/state/subjects";

export type TimetableProps = {
  courses: any;
  sessions: any;
  homeworks: any;
  slots: any;
  subjects: any;
  structure: any;
  teacherId: string;
  fetchTeacherCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    teacherId: string
  ) => any;
  fetchHomeworks: (structureId: string, startDate: string, endDAte: string) => any;
  fetchSessions: (structureId: string, startDate: string, endDAte: string) => any;
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
          backgroundColor: "#00AB6F",
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
    const { fetchTeacherCourses, fetchHomeworks, fetchSessions, structure, teacherId } = this.props;
    fetchTeacherCourses(structure.id, startDate, startDate.clone().endOf("week"), teacherId);
    fetchSessions(
      structure.id,
      startDate.format("YY-MM-DD"),
      startDate
        .clone()
        .endOf("week")
        .format("YY-MM-DD")
    );
    fetchHomeworks(
      structure.id,
      startDate.format("YY-MM-DD"),
      startDate
        .clone()
        .endOf("week")
        .format("YY-MM-DD")
    );
  };

  componentDidMount() {
    const { structure } = this.props;
    this.fetchCourses();
    this.props.fetchSlots(structure.id);
  }

  componentDidUpdate(prevProps, prevState) {
    const { startDate, selectedDate } = this.state;
    const { structure, fetchSlots } = this.props;

    // on selected date change
    if (!prevState.selectedDate.isSame(selectedDate, "day"))
      this.setState({ startDate: selectedDate.clone().startOf("week") });

    // on week, structure change
    if (!prevState.startDate.isSame(startDate, "day") || structure.id !== prevProps.structure.id) this.fetchCourses();

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
  slots: getSlotsListState(state),
  structure: { id: getSelectedStructure(state) },
  teacherId: getSessionInfo().id,
  sessions: getSessionsListState(state),
  homeworks: getHomeworksListState(state),
});

const mapDispatchToProps = (dispatch: any): any =>
  bindActionCreators(
    {
      fetchTeacherCourses: fetchCourseListFromTeacherAction,
      fetchHomeworks: fetchHomeworkListAction,
      fetchSessions: fetchSessionListAction,
      fetchSlots: fetchSlotListAction,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimetableContainer);
