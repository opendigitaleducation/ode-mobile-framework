import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { getSelectedChild } from "../../viesco/state/children";
import { getPersonnelListState } from "../../viesco/state/personnel";
import { getSubjectsListState } from "../../viesco/state/subjects";
import { fetchChildHomeworkAction, fetchHomeworkListAction, updateHomeworkProgressAction } from "../actions/homeworks";
import { fetchChildSessionAction, fetchSessionListAction } from "../actions/sessions";
import HomeworkList from "../components/HomeworkList";
import { getHomeworksListState } from "../state/homeworks";
import { getSessionsListState } from "../state/sessions";

type HomeworkListProps = {
  homeworks: any;
  sessions: any;
  personnel: any;
  subjects: any;
  navigation: NavigationScreenProp<any>;
  childId: string;
  structureId: string;
  fetchChildHomeworks: any;
  fetchChildSessions: any;
  fetchHomeworks: any;
  fetchSessions: any;
  updateHomeworkProgress: any;
};

type HomeworkListState = {
  switchValue: boolean;
  startDate: moment.Moment;
  endDate: moment.Moment;
  startHomeworksDate: moment.Moment;
  endHomeworksDate: moment.Moment;
  startSessionsDate: moment.Moment;
  endSessionsDate: moment.Moment;
};

class HomeworkListRelativeContainer extends React.PureComponent<HomeworkListProps, HomeworkListState> {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: false,
      startDate: moment(),
      endDate: moment().add(1, "week"),
      startHomeworksDate: moment(),
      endHomeworksDate: moment(),
      startSessionsDate: moment(),
      endSessionsDate: moment(),
    };
  }

  updateHomeworks = () => {
    const { startHomeworksDate, endHomeworksDate } = this.state;
    const { structureId, childId } = this.props;
    const startDateString = startHomeworksDate.format("YYYY-MM-DD");
    const endDateString = endHomeworksDate.format("YYYY-MM-DD");
    if (this.props.navigation.state.params.user_type === "Relative")
      this.props.fetchChildHomeworks(childId, structureId, startDateString, endDateString);
    else this.props.fetchHomeworks(structureId, startDateString, endDateString);
  };

  updateSessions = async () => {
    const { startSessionsDate, endSessionsDate } = this.state;
    const { structureId, childId } = this.props;
    const startDateString = startSessionsDate.format("YYYY-MM-DD");
    const endDateString = endSessionsDate.format("YYYY-MM-DD");
    if (this.props.navigation.state.params.user_type === "Relative")
      this.props.fetchChildSessions(childId, startDateString, endDateString);
    else this.props.fetchSessions(structureId, startDateString, endDateString);
  };

  onStartDateChange = startDate => {
    if (this.state.switchValue) {
      this.setState({ startDate, startSessionsDate: startDate });
      this.updateSessions();
    } else {
      this.setState({ startDate, startHomeworksDate: startDate });
      this.updateHomeworks();
    }
  };

  onEndDateChange = endDate => {
    if (this.state.switchValue) {
      this.setState({ endDate, endSessionsDate: endDate });
      this.updateSessions();
    } else {
      this.setState({ endDate, endHomeworksDate: endDate });
      this.updateHomeworks();
    }
  };

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    const diaryTitle = navigation.getParam("diaryTitle");

    return standardNavScreenOptions(
      {
        title: diaryTitle || I18n.t("Homework"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerStyle: {
          backgroundColor: "#2BAB6F",
        },
      },
      navigation
    );
  };

  public componentDidMount() {
    const { structureId, childId } = this.props;
    const { startDate, endDate } = this.state;
    const startDateString = startDate.format("YYYY-MM-DD");
    const endDateString = endDate.format("YYYY-MM-DD");
    if (this.props.navigation.state.params.user_type === "Relative") {
      this.props.fetchChildHomeworks(childId, structureId, startDateString, endDateString);
      this.props.fetchChildSessions(childId, startDateString, endDateString);
    } else {
      this.props.fetchHomeworks(structureId, startDateString, endDateString);
      this.props.fetchSessions(structureId, startDateString, endDateString);
    }
  }

  public componentDidUpdate(prevProps) {
    if (prevProps.childId !== this.props.childId) {
      this.updateHomeworks();
      this.updateSessions();
    }
  }

  private toggleSwitch = value => {
    this.setState({ switchValue: value });
    const { startDate, endDate, startHomeworksDate, endHomeworksDate, startSessionsDate, endSessionsDate } = this.state;
    // fetching homeworks/sessions on switch only if last fetch was with different dates
    if (value) {
      if (
        startDate.format("YYMMDD") !== startSessionsDate.format("YYMMDD") ||
        endDate.format("YYMMDD") !== endSessionsDate.format("YYMMDD")
      ) {
        this.setState({ startSessionsDate: startDate, endSessionsDate: endDate }, () => {
          this.updateSessions();
        });
      }
    } else {
      if (
        startDate.format("YYMMDD") !== startHomeworksDate.format("YYMMDD") ||
        endDate.format("YYMMDD") !== endHomeworksDate.format("YYMMDD")
      ) {
        this.setState({ startHomeworksDate: startDate, endHomeworksDate: endDate }, () => {
          this.updateHomeworks();
        });
      }
    }
  };

  public render() {
    return (
      <HomeworkList
        {...this.props}
        {...this.state}
        onStartDateChange={this.onStartDateChange}
        onEndDateChange={this.onEndDateChange}
        toggleSwitch={this.toggleSwitch}
      />
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    homeworks: getHomeworksListState(state),
    sessions: getSessionsListState(state),
    personnel: getPersonnelListState(state),
    subjects: getSubjectsListState(state),
    childId: getSelectedChild(state),
    structureId:
      getSessionInfo().type === "Student"
        ? getSessionInfo().administrativeStructures[0].id
        : getSessionInfo().schools.find(school =>
            getSessionInfo()
              .childrenStructure.filter(struct => struct.children.some(c => c.id === getSelectedChild(state)))
              .map(r => r.structureName)
              .includes(school.name)
          ).id,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchChildHomeworks: fetchChildHomeworkAction,
      fetchChildSessions: fetchChildSessionAction,
      fetchHomeworks: fetchHomeworkListAction,
      fetchSessions: fetchSessionListAction,
      updateHomeworkProgress: updateHomeworkProgressAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkListRelativeContainer);