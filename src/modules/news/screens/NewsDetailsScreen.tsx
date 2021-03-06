import * as React from "react";
import { View, FlatList, RefreshControl, Linking } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";
import I18n from "i18n-js";
import moment from "moment";

import type { IGlobalState } from "../../../AppStore";
import type { INews, INewsComment } from "../reducer";

import moduleConfig from "../moduleConfig";
import withViewTracking from "../../../framework/util/tracker/withViewTracking";
import { PageView } from "../../../framework/components/page";
import { IResourceUriNotification, ITimelineNotification } from "../../../framework/util/notifications";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderSubtitle, HeaderTitle } from "../../../framework/components/header";
import NotificationTopInfo from "../../../framework/modules/timelinev2/components/NotificationTopInfo";
import { getNewsDetailsAction } from "../actions";
import { Trackers } from "../../../framework/util/tracker";
import { TextPreview } from "../../../ui/TextPreview";
import { CommonStyles } from "../../../styles/common/styles";
import Conf from "../../../../ode-framework-conf";
import { GridAvatars } from "../../../ui/avatars/GridAvatars";
import { HtmlContentView } from "../../../ui/HtmlContentView";
import { Icon } from "../../../framework/components/icon";
import { LoadingIndicator } from "../../../framework/components/loading";
import { ListItem } from "../../../framework/components/listItem";
import { TextSemiBold, TextLight } from "../../../framework/components/text";
import theme from "../../../framework/util/theme";
import { FlatButton } from "../../../ui";
import { newsUriCaptureFunction } from "../service";


// TYPES ==========================================================================================

export interface INewsDetailsScreenDataProps {
  // Add data props here
};
export interface INewsDetailsScreenEventProps {
  handleGetNewsDetails(newsId: { threadId: string, infoId: string }): Promise<INews | undefined>;
};
export interface INewsDetailsScreenNavParams {
  notification: ITimelineNotification & IResourceUriNotification;
};
export type INewsDetailsScreenProps = INewsDetailsScreenDataProps
  & INewsDetailsScreenEventProps
  & NavigationInjectedProps<Partial<INewsDetailsScreenNavParams>>;

export enum NewsDetailsLoadingState {
  PRISTINE, INIT, REFRESH, DONE
}
export interface INewsDetailsScreenState {
  loadingState: NewsDetailsLoadingState;
  newsData: INews | undefined;
  errorState: boolean;
};

// COMPONENT ======================================================================================

export class NewsDetailsScreen extends React.PureComponent<
    INewsDetailsScreenProps,
    INewsDetailsScreenState
    > {

  // DECLARATIONS =================================================================================

  state: INewsDetailsScreenState = {
    loadingState: NewsDetailsLoadingState.PRISTINE,
    newsData: undefined,
    errorState: false,
  }

  // RENDER =======================================================================================

  render() {
    const { loadingState, errorState } = this.state;
    return (
      <>
        {this.renderHeader()}
        <PageView>
          {[NewsDetailsLoadingState.PRISTINE, NewsDetailsLoadingState.INIT].includes(loadingState)
          ? <LoadingIndicator />
          : errorState
            ? this.renderError()
            : this.renderContent()
        }
        </PageView>
      </>
    );
  }

  renderHeader() {
    const { navigation } = this.props;
    const { newsData } = this.state;
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderLeft>
            <HeaderAction iconName="back" onPress={() => navigation.navigate("timeline")}/>
          </HeaderLeft>
          <HeaderCenter>
            {newsData?.title
              ? <>
                  <HeaderTitle>{newsData?.title}</HeaderTitle>
                  <HeaderSubtitle>{I18n.t("timeline.newsDetailsScreen.title")}</HeaderSubtitle>
                </>
              : <HeaderTitle>{I18n.t("timeline.newsDetailsScreen.title")}</HeaderTitle>
            }
          </HeaderCenter>
        </HeaderRow>
      </FakeHeader>
    )
  }

  renderError() {
    return <TextSemiBold>{"Error"}</TextSemiBold> // ToDo: great error screen here
  }

  renderContent() {
    const { loadingState, newsData } = this.state;
    const newsComments = newsData?.comments;
    return (
      <FlatList
        data={newsComments}
        renderItem={({ item }: { item: INewsComment }) => this.renderComment(item)}
        keyExtractor={(item: INewsComment) => item._id.toString()}
        ListHeaderComponent={this.renderNewsDetails()}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 12, backgroundColor: theme.color.background.card }}
        refreshControl={
          <RefreshControl
            refreshing={[NewsDetailsLoadingState.REFRESH, NewsDetailsLoadingState.INIT].includes(loadingState)}
            onRefresh={() => this.doRefresh()}
          />
        }
      />
    );
  }

  renderNewsDetails() {
    const { navigation } = this.props;
    const { newsData } = this.state;
    const notification = navigation.getParam("notification");
    const resourceUri = notification?.resource.uri;
    const newsContent = newsData?.content;
    const newsComments = newsData?.comments;
    const hasComments = newsComments && newsComments.length > 0;
    if (!notification) return this.renderError();
    return (
      <View>
        <View style={{ paddingHorizontal: 16 }}>
          <NotificationTopInfo notification={notification}/>
          <HtmlContentView
            html={newsContent}
            onDownload={() => Trackers.trackEvent("News", "DOWNLOAD ATTACHMENT", "Read mode")}
            onError={() => Trackers.trackEvent("News", "DOWNLOAD ATTACHMENT ERROR", "Read mode")}
            onDownloadAll={() => Trackers.trackEvent("News", "DOWNLOAD ALL ATTACHMENTS", "Read mode")}
            onOpen={() => Trackers.trackEvent("News", "OPEN ATTACHMENT", "Read mode")}
          />
          {resourceUri
            ? <View style={{ marginTop: 10 }}>
                <FlatButton
                  title={I18n.t("common.openInBrowser")}
                  customButtonStyle={{backgroundColor: theme.color.tertiary.light}}
                  customTextStyle={{color: theme.color.secondary.regular}}
                  onPress={() => {
                    //TODO: create generic function inside oauth (use in myapps, etc.)
                    if (!Conf.currentPlatform) {
                      console.warn("Must have a platform selected to redirect the user");
                      return null;
                    }
                    const url = `${(Conf.currentPlatform as any).url}${resourceUri}`;
                    Linking.canOpenURL(url).then(supported => {
                      if (supported) {
                        Linking.openURL(url);
                      } else {
                        console.warn("[news] Don't know how to open URI: ", url);
                      }
                    });
                    Trackers.trackEvent("News", "GO TO", "View in Browser");
                  }}
                />
              </View>
            : null
          }
        </View>
        {hasComments
          ? <ListItem
              style={{ 
                justifyContent: "flex-start",
                shadowColor: theme.color.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                elevation: 2,
                borderBottomColor: undefined,
                borderBottomWidth: undefined,
                marginTop: 10,
                marginBottom: 4
              }}
              leftElement={
                <Icon
                  name="new_comment"
                  color={theme.color.tertiary.regular}
                  size={16}
                  style={{ marginRight: 5 }}
                />
              }
              rightElement={
                <TextLight>
                  {newsComments!.length} {I18n.t(`common.comment${newsComments!.length > 1 ? "s" : ""}`)}
                </TextLight>
              }
            />
          : null
        }
      </View>
    );
  }

  renderComment(newsComment: INewsComment) {
    return (
      <ListItem
        style={{ justifyContent: "flex-start", backgroundColor: theme.color.secondary.extraLight }}
        leftElement={
          <GridAvatars
            users={[newsComment.owner || require("../../../../assets/images/resource-avatar.png")]}
            fallback={require("../../../../assets/images/resource-avatar.png")}
          />
        }
        rightElement={
          <View style={{marginLeft: 15}}>
            <View style={{ flexDirection: "row" }}>
              <TextSemiBold
                numberOfLines={2}
                style={{ fontSize: 12, marginRight: 5, maxWidth: "70%" }}
              >
                {newsComment.username}
              </TextSemiBold>
              <TextLight style={{ fontSize: 10 }}>
                {moment(newsComment.created).fromNow()}
              </TextLight>
            </View>
            <TextPreview
              textContent={newsComment.comment}
              numberOfLines={5}
              textStyle={{
                color: CommonStyles.textColor,
                fontFamily: CommonStyles.primaryFontFamily,
                fontSize: 12,
                marginTop: 5
              }}
              expandMessage={I18n.t("common.readMore")}
              expansionTextStyle={{ fontSize: 12 }}
            />
          </View>
        }
      />
    )
  }

  // LIFECYCLE ====================================================================================

  componentDidMount() {
    this.doInit();
  }

  // METHODS ======================================================================================
  
  async doInit() {
    try {
      this.setState({ loadingState: NewsDetailsLoadingState.INIT });
      await this.doGetNewsDetails();
    } finally {
      this.setState({ loadingState: NewsDetailsLoadingState.DONE });
    }
  }

  async doRefresh() {
    try {
      this.setState({ loadingState: NewsDetailsLoadingState.REFRESH });
      await this.doGetNewsDetails();
    } finally {
      this.setState({ loadingState: NewsDetailsLoadingState.DONE });
    }
  }

  async doGetNewsDetails() {
    try {
      const { navigation, handleGetNewsDetails } = this.props;
      const notification = navigation.getParam("notification");
      const resourceUri = notification?.resource.uri;
      if (!resourceUri) {
        throw new Error("[doGetNewsDetails] failed to call api (resourceUri is undefined)");
      }
      const newsId = newsUriCaptureFunction(resourceUri);
      const { threadId, infoId} = newsId;
      if (!threadId || !infoId) {
        throw new Error(`[doGetNewsDetails] failed to capture resourceUri "${resourceUri}": ${{threadId, infoId}}`);
      }
      const newsData = await handleGetNewsDetails(newsId as Required<typeof newsId>);
      this.setState({newsData});
    } catch (e) {
      // ToDo: Error handling
      this.setState({ errorState: true });
      console.warn(`[${moduleConfig.name}] doGetNewsDetails failed`, e);
    }
  }
}

// UTILS ==========================================================================================

  // Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => INewsDetailsScreenDataProps = (s) => ({});

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => INewsDetailsScreenEventProps = (dispatch, getState) => ({
  handleGetNewsDetails: async (newsId: { threadId: string, infoId: string }) => { return await dispatch(getNewsDetailsAction(newsId)) as unknown as INews | undefined; } // TS BUG: dispatch mishandled
})

const NewsDetailsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(NewsDetailsScreen);
export default NewsDetailsScreen_Connected;
