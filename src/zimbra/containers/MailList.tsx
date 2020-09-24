import * as React from "react";
import { NavigationDrawerProp } from "react-navigation-drawer";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import I18n from "i18n-js";

import { fetchCountAction } from "../actions/count";
import { fetchMailListAction, fetchMailListFromFolderAction } from "../actions/mailList";
import MailList from "../components/MailList";
import { getFolderListState } from "../state/folders";
import { getMailListState, IMail } from "../state/mailList";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { PageContainer } from "../../ui/ContainerContent";
import { Header as HeaderComponent } from "../../ui/headers/Header";
import { CommonStyles } from "../../styles/common/styles";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { Text } from "../../ui/Typography";
import { View, TouchableOpacity } from "react-native";
import { Icon } from "../../ui";
import Toast from "react-native-tiny-toast";
import { toggleReadAction, moveMailsToFolderAction, trashMailsAction, deleteMailsAction } from "../actions/mail";
import MoveModal from "../containers/MoveToFolderModal";

// ------------------------------------------------------------------------------------------------

type MailListContainerProps = {
  navigation: NavigationDrawerProp<any>;
  setMails: (mailList: any) => any;
  fetchMailList: (page: number, key: string) => any;
  fetchCount: (ids: string[]) => any;
  fetchMailFromFolder: (folderName: string, page: number) => any;
  toggleRead: (mailIds: string[], read: boolean) => any,
  moveMailsToFolder: (mailIds: string[], folderId: string) => any,
  trashMails: (mailIds: string[]) => any;
  deleteMails: (mailIds: string[]) => any;
  isPristine: boolean;
  isFetching: boolean;
  notifications: any;
  folders: any;
};

type MailListContainerState = {
  mails: any;
  unsubscribe: any;
  fetchRequested: boolean;
  isHeaderSelectVisible: boolean;
  isShownModal: boolean;
};

class MailListContainer extends React.PureComponent<MailListContainerProps, MailListContainerState> {
  constructor(props) {
    super(props);
    this.state = {
      mails: [],
      unsubscribe: this.props.navigation.addListener("didFocus", () => {
        this.forceUpdate();
      }),
      fetchRequested: false,
      isHeaderSelectVisible: false,
      isShownModal: false,
    };
  }

  setMails = mailList => {
    this.setState({ mails: mailList });
  };

  private fetchMails = (page = 0) => {
    this.setState({ fetchRequested: true });
    const key = this.props.navigation.getParam("key");
    const folderName = this.props.navigation.getParam("folderName");
    if (!folderName || folderName === undefined) this.props.fetchMailList(page, key);
    else this.props.fetchMailFromFolder(folderName, page);
  };

  fetchCompleted = () => {
    this.setState({ fetchRequested: false });
  };

  public componentDidMount() {
    this.fetchMails();
  }

  componentDidUpdate(prevProps) {
    const folderName = this.props.navigation.getParam("folderName");
    if (folderName !== prevProps.navigation.getParam("folderName")) {
      this.fetchMails();
    }
  }

  componentWillUnmount() {
    this.state.unsubscribe();
  }

  deleteSelectedMails = () => {
    let listSelected = this.getListSelectedMails();
    let mailsIds = [] as string[];
    listSelected.map(mail => mailsIds.push(mail.id));

    const { navigation } = this.props;
    const isTrashed = navigation.getParam("isTrashed");
    if (isTrashed) this.props.deleteMails(mailsIds);
    this.props.trashMails(mailsIds);
    Toast.show(I18n.t("zimbra-message-deleted"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });

    this.onUnselectListMails();
  };

  mailsMoved = () => {
    let listSelected = this.getListSelectedMails();
    Toast.show(listSelected.length > 0 ? I18n.t("zimbra-messages-moved") : I18n.t("zimbra-message-moved"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  public showModal = () => {
    this.setState({ isShownModal: true });
  };

  public closeModal = () => {
    this.setState({ isShownModal: false });
    this.onUnselectListMails();
  };

  markSelectedMailsAsUnread = () => {
    let listSelected = this.getListSelectedMails();
    let mailsIds = [] as string[];
    listSelected.map(mail => mailsIds.push(mail.id));
    let isRead = listSelected.findIndex(mail => mail.unread === false) >= 0 ? false : true;
    this.props.toggleRead(mailsIds, isRead);
    this.onUnselectListMails();
  };

  getListSelectedMails = () => {
    let listSelected = [] as IMail[];
    this.state.mails.map(mail => (mail.isChecked ? listSelected.push(mail) : null));
    return listSelected;
  };

  selectMails = () => {
    if (this.getListSelectedMails().length > 0) this.setState({ isHeaderSelectVisible: true });
    else this.setState({ isHeaderSelectVisible: false });
  }

  onUnselectListMails = (goBack = false) => {
    this.setState({ isHeaderSelectVisible: false });
    if (!goBack) this.fetchMails(0);
  };

  renderSelectedMailsHeader = () => {
    return (
      <>
        <HeaderComponent color={CommonStyles.secondary}>
          <HeaderAction onPress={() => this.onUnselectListMails(true)} name="chevron-left1" />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "400" }}>{this.getListSelectedMails().length}</Text>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => this.markSelectedMailsAsUnread()}>
              <Icon name="email" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.showModal()}>
              <Icon name="package-up" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.deleteSelectedMails()}>
              <Icon name="delete" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>
        </HeaderComponent>

        <MoveModal
          mail={this.getListSelectedMails()}
          show={this.state.isShownModal}
          closeModal={this.closeModal}
          successCallback={this.mailsMoved}
        />
      </>
    );
  };

  public render() {
    return (
      <>
        <PageContainer>
          {this.state.isHeaderSelectVisible && this.renderSelectedMailsHeader()}

          <MailList
            {...this.props}
            setMails={this.setMails}
            fetchMails={this.fetchMails}
            isTrashed={this.props.navigation.getParam("key") === "trash"}
            fetchRequested={this.state.fetchRequested}
            fetchCompleted={this.fetchCompleted}
            selectMails={this.selectMails}
            unselectListMails={this.onUnselectListMails}
          />
        </PageContainer>
      </>
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailListState(state);

  if (data !== undefined && data.length > 0) {
    for (let i = 0; i <= data.length - 1; i++) {
      data[i]["isChecked"] = false;
    }
  }

  const folders = getFolderListState(state);

  // Format props
  return {
    isPristine,
    isFetching,
    notifications: data,
    folders,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchMailList: fetchMailListAction,
      fetchMailFromFolder: fetchMailListFromFolderAction,
      fetchCount: fetchCountAction,
      toggleRead: toggleReadAction,
      moveMailsToFolder: moveMailsToFolderAction,
      trashMails: trashMailsAction,
      deleteMails: deleteMailsAction,
    },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

export default withViewTracking("zimbra")(connect(mapStateToProps, mapDispatchToProps)(MailListContainer));
