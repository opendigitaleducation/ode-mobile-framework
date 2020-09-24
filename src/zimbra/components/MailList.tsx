import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, RefreshControl, Dimensions, FlatList } from "react-native";
import { SafeAreaView } from "react-navigation";
import { NavigationDrawerProp } from "react-navigation-drawer";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { Header, LeftPanel, CenterPanel, PageContainer } from "../../ui/ContainerContent";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { Text, TextBold } from "../../ui/text";
import { IMail } from "../state/mailContent";

type MailListProps = {
  notifications: any;
  mails: any;
  isFetching: boolean;
  setMails: (mails: any) => any;
  fetchCompleted: () => any;
  fetchMails: (page: number) => any;
  fetchCount: (ids: string[]) => any;
  selectMails: () => any;
  unselectListMails: () => any;
  folders: any;
  isTrashed: boolean;
  fetchRequested: boolean;
  isHeaderSelectVisible: boolean;
  navigation: NavigationDrawerProp<any>;
};

type MailListState = {
  indexPage: number;
  mails: any;
  nextPageCallable: boolean;
};

export default class MailList extends React.PureComponent<MailListProps, MailListState> {
  constructor(props) {
    super(props);

    const { notifications } = this.props;
    this.state = {
      indexPage: 0,
      mails: notifications,
      nextPageCallable: false,
    };
    this.props.setMails(notifications);
  }

  componentDidUpdate(prevProps) {
    const { notifications, isFetching, fetchCompleted } = this.props;
    if (this.state.indexPage === 0 && !isFetching && prevProps.isFetching && this.props.fetchRequested) {
      this.props.setMails(notifications);
      this.setState({ mails: notifications });
      fetchCompleted();
    }

    if (
      notifications !== prevProps.notifications &&
      this.state.indexPage > 0 &&
      prevProps.isFetching &&
      !isFetching &&
      this.props.fetchRequested
    ) {
      const { mails } = this.state;
      const joinedList = mails.concat(this.props.notifications);
      this.props.setMails(joinedList);
      this.setState({ mails: joinedList });
      fetchCompleted();
    }
  }

  hasShadow = isShadow => {
    return isShadow ? styles.shadow : null;
  };

  containerStyle = isChecked => {
    return !isChecked ? null : styles.containerMailSelected;
  };

  selectItem = mailInfos => {
    mailInfos.isChecked = !mailInfos.isChecked;
    let indexMail = this.state.mails.findIndex(item => item.id === mailInfos.id);
    let newList = Object.assign([], this.state.mails);
    newList[indexMail] = mailInfos;

    this.props.setMails(newList);
    this.setState({ mails: newList });
    this.props.selectMails();
  };

  renderMailContent = mailInfos => {
    if (mailInfos.state === "DRAFT" && mailInfos.systemFolder === "DRAFT") {
      this.props.navigation.navigate("newMail", {
        type: "DRAFT",
        mailId: mailInfos.id,
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchCount(this.props.folders.data.map(f => f.id));
        },
      });
    } else {
      this.props.navigation.navigate("mailDetail", {
        mailId: mailInfos.id,
        subject: mailInfos.subject,
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchCount(this.props.folders.data.map(f => f.id));
        },
        isTrashed: this.props.isTrashed,
      });
    }
  };

  private renderMailItemInfos(mailInfos) {
    let contact = ["", ""];
    if (mailInfos.systemFolder === "INBOX") contact = mailInfos.displayNames.find(item => item[0] === mailInfos.from);
    else contact = mailInfos.displayNames.find(item => item[0] === mailInfos.to[0]);
    if (contact === undefined) contact = ["", I18n.t("zimbra-unknown")];
    return (
      <TouchableOpacity
        onPress={() => {
          this.renderMailContent(mailInfos);
        }}
        //onLongPress={() => this.selectItem(mailInfos)}
      >
        <Header
          style={[styles.containerMail, this.containerStyle(mailInfos.isChecked), this.hasShadow(mailInfos.unread)]}>
          <LeftPanel>
            {mailInfos.unread && <Icon name="mail" size={18} color="#FC8500" />}
            <SingleAvatar userId={mailInfos.from} />
          </LeftPanel>
          <CenterPanel>
            <View style={styles.mailInfos}>
              {contact &&
                (mailInfos.unread ? (
                  <TextBold style={styles.mailInfoSender} numberOfLines={1}>
                    {contact[1]}
                  </TextBold>
                ) : (
                  <Text style={styles.mailInfoSender} numberOfLines={1}>
                    {contact[1]}
                  </Text>
                ))}
              <Text style={styles.greyColor}>{moment(mailInfos.date).format("dddd LL")}</Text>
            </View>
            <View style={styles.mailInfos}>
              <Text style={{ flex: 1, color: "#AFAFAF" }} numberOfLines={1}>
                {mailInfos.subject}
              </Text>
              {mailInfos.hasAttachment && (
                <Icon style={{ alignSelf: "flex-end" }} name="attached" size={18} color="black" />
              )}
            </View>
          </CenterPanel>
        </Header>
      </TouchableOpacity>
    );
  }

  onChangePage = () => {
    if (!this.props.isFetching && this.props.notifications !== undefined) {
      const { indexPage } = this.state;
      const currentPage = indexPage + 1;
      this.setState({ indexPage: currentPage });
      this.props.fetchMails(currentPage);
    }
  };

  refreshMailList = () => {
    this.props.fetchMails(0);
    this.setState({ indexPage: 0 });
    this.props.unselectListMails();
  };

  public render() {
    return (
      <PageContainer>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={this.state.mails && this.state.mails.length > 0 ? this.state.mails : []}
          renderItem={({ item }) => this.renderMailItemInfos(item)}
          extraData={this.state.mails}
          keyExtractor={(item: IMail) => item.id}
          refreshControl={
            <RefreshControl refreshing={this.props.isFetching} onRefresh={() => this.refreshMailList()} />
          }
          onEndReachedThreshold={0.001}
          onScrollBeginDrag={() => this.setState({ nextPageCallable: true })}
          onEndReached={() => {
            if (this.state.nextPageCallable) {
              this.setState({ nextPageCallable: false });
              this.onChangePage();
            }
          }}
          ListEmptyComponent={
            <View style={{ flex: 1 }}>
              <EmptyScreen
                imageSrc={require("../../../assets/images/empty-screen/empty-mailBox.png")}
                imgWidth={265.98}
                imgHeight={279.97}
                title={I18n.t("zimbra-empty-mailbox")}
              />
            </View>
          }
        />
      </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
  containerMail: {
    marginTop: 5,
    marginHorizontal: 8,
    maxWidth: Dimensions.get("window").width - 16,
    padding: 10,
    backgroundColor: "white",
  },
  containerMailSelected: {
    backgroundColor: "#C5E6F2",
  },
  mailInfos: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  mailInfoSender: { flex: 1 },
  greyColor: { color: "#AFAFAF" },
  shadow: {
    elevation: 4,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
});
