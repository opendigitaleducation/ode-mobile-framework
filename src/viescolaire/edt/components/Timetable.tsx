import { PageContainer } from "../../../ui/ContainerContent";
import React from "react";
import { RefreshControl, View, Text, StyleSheet } from "react-native";
import I18n from "i18n-js";
import DateTimePicker from "../../../ui/DateTimePicker";
import Calendar from "../../../ui/Calendar";
import { TimetableProps, TimetableState } from "../containers/Timetable";
import { TextBold } from "../../../ui/Typography";
import { Icon } from "../../../ui";
import { getSessionInfo } from "../../../App";
import ChildPicker from "../../viesco/containers/ChildPicker";
import moment from "moment";

const adaptCourses = (courses, subjects, teachers) => {
  return courses.map(c => ({
    ...c,
    subject: subjects.find(s => s.subjectId === c.subjectId)?.subjectLabel,
    teacher: c.teacherIds ? teachers.find(t => t.id === c.teacherIds[0])?.displayName : undefined,
  }));
};

type TimetableComponentProps = TimetableProps &
  TimetableState & { updateSelectedDate: (newDate: moment.Moment) => void };

export default class Timetable extends React.PureComponent<TimetableComponentProps> {
  constructor(props) {
    super(props);
  }

  renderChildCourse = course => {
    return (
      <View style={style.courseView}>
        <View>
          <TextBold>{course.subject}</TextBold>
          <Text>{course.teacher}</Text>
        </View>
        {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 && (
          <View style={style.roomView}>
            <Icon name="pin_drop" size={16} />
            <Text>{course.roomLabels && course.roomLabels[0]}</Text>
          </View>
        )}
      </View>
    );
  };

  renderTeacherCourse = course => {
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];
    return (
      <View style={style.courseView}>
        <View style={style.infoView}>
          <TextBold style={{ fontSize: 20 }}>{className}</TextBold>
        </View>
        {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 && (
          <View style={style.roomView}>
            <Icon name="pin_drop" size={16} />
            <Text>{course.roomLabels && course.roomLabels[0]}</Text>
          </View>
        )}
      </View>
    );
  };

  renderHalf = course => {
    return (
      <View style={style.courseView}>
        <View>
          <TextBold>{course.subject}</TextBold>
          <Text>{course.teacher}</Text>
          {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 && (
            <View style={{ flexDirection: "row" }}>
              <Icon name="pin_drop" size={16} />
              <Text>{course.roomLabels && course.roomLabels[0]}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  public render() {
    const { startDate, selectedDate, courses, subjects, teachers, slots, updateSelectedDate } = this.props;
    return (
      <PageContainer>
        <RefreshControl style={{ flexDirection: "column-reverse" }} refreshing={courses.isFetching}>
          <View style={style.refreshContainer}>
            {getSessionInfo().type === "Relative" && <ChildPicker />}
            <View style={style.weekPickerView}>
              <Text>{I18n.t("viesco-edt-week-of")}</Text>
              <View>
                <DateTimePicker value={startDate} mode={"date"} onChange={updateSelectedDate} color={"#162EAE"} />
              </View>
            </View>
            <View style={style.calendarContainer}>
              <Calendar
                startDate={startDate}
                data={adaptCourses(courses.data, subjects.data, teachers.data)}
                renderElement={getSessionInfo().type === "Teacher" ? this.renderTeacherCourse : this.renderChildCourse}
                renderHalf={this.renderHalf}
                numberOfDays={6}
                slotHeight={70}
                mainColor={"#162EAE"}
                slots={slots.data}
                initialSelectedDate={selectedDate}
                hideSlots
              />
            </View>
          </View>
        </RefreshControl>
      </PageContainer>
    );
  }
}

const style = StyleSheet.create({
  refreshContainer: {
    height: "100%",
    zIndex: 0,
  },
  calendarContainer: { height: 1, flexGrow: 1 },
  courseView: {
    flexDirection: "row",
    padding: 5,
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  roomView: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  weekPickerView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0)",
    borderWidth: 1,
  },
  infoView: { paddingHorizontal: 15 },
});
