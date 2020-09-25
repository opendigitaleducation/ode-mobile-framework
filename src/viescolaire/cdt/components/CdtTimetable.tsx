import { PageContainer } from "../../../ui/ContainerContent";
import React from "react";
import { RefreshControl, View, Text, StyleSheet } from "react-native";
import I18n from "i18n-js";
import DateTimePicker from "../../../ui/DateTimePicker";
import Calendar from "../../../ui/Calendar";
import { TimetableProps, TimetableState } from "../containers/CdtTimetable";
import { TextBold } from "../../../ui/Typography";
import { Icon } from "../../../ui";
import moment from "moment";
import { TouchableOpacity } from "react-native-gesture-handler";
import { homeworkDetailsAdapter, sessionDetailsAdapter } from "../../utils/cdt";

const adaptCourses = (courses, homeworks, sessions) => {
  return courses.map(c => ({
    ...c,
    homework: homeworks.data.find(h => h.due_date.isAfter(c.startDate, "s") && h.due_date.isBefore(c.endDate, "s")),
    session: sessions.data.find(s => s.date.isAfter(c.startDate, "s") && s.date.isBefore(c.endDate, "s")),
  }));
};

type TimetableComponentProps = TimetableProps &
  TimetableState & { updateSelectedDate: (newDate: moment.Moment) => void };

export default class Timetable extends React.PureComponent<TimetableComponentProps> {
  renderCourse = course => {
    const { navigation, subjects } = this.props;
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];
    return (
      <View style={style.courseView}>
        <View style={style.infoView}>
          <TextBold style={{ fontSize: 20 }}>{className}</TextBold>
        </View>
        <View style={style.buttonsView}>
          <TouchableOpacity
            onPress={
              course.homework ?
              () => navigation.navigate("HomeworkPage", homeworkDetailsAdapter(course.homework, subjects.data))
              : () => true
            }>
            <Icon name="file-document-outline" size={24} color={course.homework ? "#FF9700" : "grey"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              course.session ?
              () => navigation.navigate("SessionPage", sessionDetailsAdapter(course.session, subjects.data, []))
              : () => true
            }>
            <Icon name="inbox" size={24} color={course.session ? "#2BAB6F" : "grey"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  public render() {
    const { startDate, selectedDate, courses, slots, updateSelectedDate, homeworks, sessions } = this.props;
    return (
      <PageContainer>
        <RefreshControl style={{ flexDirection: "column-reverse" }} refreshing={courses.isFetching}>
          <View style={style.refreshContainer}>
            <View style={style.weekPickerView}>
              <Text>{I18n.t("viesco-edt-week-of")}</Text>
              <View>
                <DateTimePicker value={startDate} mode={"date"} onChange={updateSelectedDate} color={"#00AB6F"} />
              </View>
            </View>
            <View style={style.calendarContainer}>
              <Calendar
                startDate={startDate}
                data={adaptCourses(courses.data, homeworks.data, sessions.data)}
                renderElement={this.renderCourse}
                numberOfDays={6}
                slotHeight={70}
                mainColor={"#00AB6F"}
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
  buttonsView: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
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
