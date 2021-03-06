/**
 * HomeworkPage
 *
 * Display page for all homework in a calendar-like way.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *    `diaryId` - displayed diaryId.
 *    `tasksByDay` - list of data.
 *
 *    `onMount` - fired when component did mount.
 *    `onRefresh` - fired when the user ask to refresh the list.
 *    `onSelect` - fired when the user touches a displayed task.
 *
 *    `navigation` - React Navigation instance.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import ViewOverflow from "react-native-view-overflow";

import moment from "moment";

// Components
import { RefreshControl, SectionList, Text } from "react-native";
const { View } = style;

import { FlatButton, Loading } from "../../ui";
import DEPRECATED_ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";

import HomeworkTimeline from "./HomeworkTimeline";
import HomeworkDayCheckpoint from "./HomeworkDayCheckpoint";
import HomeworkCard from "./HomeworkCard";

// Type definitions
import { IHomeworkTask } from "../reducers/tasks";
import { IHomeworkDiary } from "../reducers/diaryList";

// Misc
import today from "../../utils/today";
import { NavigationScreenProp } from "react-navigation";
import { CommonStyles } from "../../styles/common/styles";

// Props definition -------------------------------------------------------------------------------

export interface IHomeworkPageDataProps {
  isFetching?: boolean;
  diaryId?: string;
  didInvalidate?: boolean;
  diaryInformation?: IHomeworkDiary
  tasksByDay?: Array<{
    id: string;
    date: moment.Moment;
    tasks: IHomeworkTask[];
  }>;
}

export interface IHomeworkPageEventProps {
  onFocus?: () => void;
  onRefresh?: (diaryId: string) => void;
  onSelect?: (diaryId: string, date: moment.Moment, itemId: string) => void;
  onScrollBeginDrag?: () => void;
}

export interface IHomeworkPageOtherProps {
  navigation?: NavigationScreenProp<{}>;
}

interface IHomeworkPageState {
  fetching: boolean;
  pastDateLimit: moment.Moment;
}

export type IHomeworkPageProps = IHomeworkPageDataProps &
  IHomeworkPageEventProps &
  IHomeworkPageOtherProps &
  IHomeworkPageState;

// Main component ---------------------------------------------------------------------------------

export class HomeworkPage extends React.PureComponent<IHomeworkPageProps, {}> {
  constructor(props) {
    super(props);
  }
  public state={
    fetching: false,
    pastDateLimit: today()
  }

  getDerivedStateFromProps(nextProps: any, prevState: any) {
    if (nextProps.isFetching !== prevState.fetching) {
      return { fetching: nextProps.isFetching};
   } else return null;
  }

  componentDidUpdate(prevProps: any) {
    const { isFetching, diaryId } = this.props;
    
    if (prevProps.isFetching !== isFetching) {
      this.setState({ fetching: isFetching });
    }
    if (prevProps.diaryId !== diaryId) {
      this.setState({ pastDateLimit: today() })
    }
  }

  // Render

  public render() {
    const { isFetching, didInvalidate } = this.props;
    const pageContent = isFetching && didInvalidate
      ? this.renderLoading()
      : this.renderList();

    return (
      <PageContainer>
        <DEPRECATED_ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }

  private renderList() {
    const {
      diaryId,
      tasksByDay,
      navigation,
      onRefresh,
      onSelect,
      onScrollBeginDrag
    } = this.props;
    const { fetching, pastDateLimit } = this.state
    const data = tasksByDay ? tasksByDay.map(day => ({
      title: day.date,
      data: day.tasks.map(task => ({
        ...task,
        date: day.date
      }))
    })) : [];
    const pastHomework = data.filter(item => item.title.isBefore(today(), "day"));
    const remainingPastHomework = pastHomework.filter(item => item.title.isBefore(pastDateLimit, "day"));
    const displayedPastHomework = pastHomework.filter(item => item.title.isBetween(pastDateLimit, today(), "day", "[)"));
    const futureHomework = data.filter(item => item.title.isSameOrAfter(today(), "day"));
    const displayedHomework = [...displayedPastHomework, ...futureHomework];
    const hasPastHomeWork = pastHomework.length > 0;
    const noRemainingPastHomework = remainingPastHomework.length === 0;
    const noFutureHomeworkHiddenPast = futureHomework.length === 0 && pastDateLimit.isSame(today(), "day");

    return (
      <View style={{ flex: 1 }}> 
        {noFutureHomeworkHiddenPast
          ? null
          : <>
              <HomeworkTimeline />
              <View 
                style={{ 
                  backgroundColor: CommonStyles.lightGrey,
                  height: 15,
                  marginLeft: 50,
                  width: "100%",
                  position: "absolute",
                  zIndex: 1,
                  top: 0
                }}
              />
            </>
        }
        <SectionList
          contentContainerStyle={noFutureHomeworkHiddenPast ? { flex: 1 } : null}
          sections={displayedHomework}
          CellRendererComponent={ViewOverflow} /* TS-ISSUE : CellRendererComponent is an official FlatList prop */
          stickySectionHeadersEnabled
          renderSectionHeader={({ section: { title } }) => (
            <HomeworkDayCheckpoint
              nb={title.date()}
              text={title.format("dddd D MMMM YYYY")}
              active={title.isSame(today(), "day")}
            />
          )}
          renderItem={({ item, index }) => (
            <HomeworkCard
              key={item.id}
              title={item.title}
              content={item.content}
              onPress={() => {
                onSelect!(diaryId!, item.date, item.id);
                navigation!.navigate("HomeworkTask", { "title": item.title });
              }}
            />
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={fetching}
              onRefresh={() => {
                this.setState({ fetching: true });
                onRefresh(diaryId);
              }}
            />
          }
          onScrollBeginDrag={() => onScrollBeginDrag()}
          ListHeaderComponent={hasPastHomeWork
            ? <View style={{height: 45, justifyContent: "center", alignItems: "center", marginTop: 15}}>
                {noRemainingPastHomework
                  ? <Text style={{fontStyle: "italic", color: CommonStyles.grey}}>
                      {I18n.t("homework-previousNoMore")}
                    </Text>
                  : <FlatButton
                      loading={false}
                      title={I18n.t("homework-previousSee")}
                      onPress={() => {
                        const newestRemainingPastHW = remainingPastHomework[remainingPastHomework.length-1];
                        const newestRemainingPastHWDate = newestRemainingPastHW.title;
                        const newestRemainingPastHWWeekStart = moment(newestRemainingPastHWDate).startOf("isoWeek");
                        this.setState({pastDateLimit: newestRemainingPastHWWeekStart});
                      }}
                    />
                }
              </View>
            : null 
          }
          ListFooterComponent={noFutureHomeworkHiddenPast ? null : <View style={{height: 15}}/>}
          ListEmptyComponent={noFutureHomeworkHiddenPast
            ? <EmptyScreen
                imageSrc={require("../../../assets/images/empty-screen/homework.png")}
                imgWidth={265.98}
                imgHeight={279.97}
                text={I18n.t("homework-emptyScreenText")}
                title={I18n.t("homework-emptyScreenTitle")}
                customStyle={{ marginBottom: hasPastHomeWork ? 60 : 0 }}
              />
            : null
          }
        />
      </View>
    );
  }

  private renderLoading() {
    return <Loading />;
  }
}

export default HomeworkPage;
