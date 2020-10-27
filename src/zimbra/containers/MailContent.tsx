import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp, NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { toggleReadAction, trashMailsAction, deleteMailsAction } from "../actions/mail";
import { fetchMailContentAction } from "../actions/mailContent";
import MailContent from "../components/MailContent";
import MailContentMenu from "../components/MailContentMenu";
import MoveModal from "../containers/MoveToFolderModal";
import { getMailContentState } from "../state/mailContent";

class MailContentContainer extends React.PureComponent<any, any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: `${navigation.getParam("subject")}`,
        headerLeft: () => {
          const goBack = navigation.getParam("getGoBack", navigation.goBack);

          return <HeaderAction onPress={() => goBack()} name="back" />;
        },
        headerRight: () => {
          const showMenu = navigation.getParam("showMenu");

          return (
            <View style={{ flexDirection: "row" }}>
              {showMenu && <HeaderAction style={{ alignSelf: "flex-end" }} onPress={showMenu} name="more_vert" />}
            </View>
          );
        },
        headerStyle: {
          backgroundColor: CommonStyles.primary,
        },
      },
      navigation
    );
  };

  constructor(props) {
    super(props);

    this.state = {
      mailId: this.props.navigation.state.params.mailId,
      showMenu: false,
      showModal: false,
    };
  }
  public componentDidMount() {
    this.props.navigation.setParams({ showMenu: this.showMenu, subject: this.props.navigation.state.params.subject });
    this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
  }

  public componentDidUpdate() {
    if (this.props.navigation.state.params.mailId !== this.state.mailId) {
      this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
    }
  }

  public showMenu = () => {
    const { showMenu } = this.state;
    this.setState({
      showMenu: !showMenu,
    });
  };

  public showModal = () => {
    this.setState({
      showModal: true,
    });
  };

  public closeModal = () => {
    this.setState({
      showModal: false,
    });
  };

  mailMoved = () => {
    const { navigation } = this.props;
    navigation.state.params.onGoBack();
    navigation.navigate("inbox", { key: "inbox", folderName: undefined });
    Toast.show(I18n.t("zimbra-message-moved"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  markAsRead = () => this.props.toggleRead([this.props.mail.id], false);

  move = () => this.props.moveToInbox([this.props.mail.id]);

  delete = async () => {
    const { navigation } = this.props;
    const isTrashed = navigation.getParam("isTrashed");
    if (isTrashed) await this.props.deleteMails([this.props.mail.id]);
    else await this.props.trashMails([this.props.mail.id]);
    this.goBack();
    Toast.show(I18n.t("zimbra-message-deleted"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation.state.params.onGoBack();
    navigation.dispatch(NavigationActions.back());
  };

  public render() {
    const { mail } = this.props;
    const { showMenu, showModal } = this.state;
    const menuData = [
      { text: I18n.t("zimbra-mark-unread"), icon: "email", onPress: this.markAsRead },
      { text: I18n.t("zimbra-move"), icon: "unarchive", onPress: this.showModal },
      // { text: I18n.t("zimbra-download-all"), icon: "download", onPress: () => {} },
      { text: I18n.t("zimbra-delete"), icon: "delete", onPress: this.delete },
    ];
    return (
      <>
        <MailContent {...this.props} delete={this.delete} />
        <MoveModal mail={mail} show={showModal} closeModal={this.closeModal} successCallback={this.mailMoved} />
        <MailContentMenu onClickOutside={this.showMenu} show={showMenu} data={menuData} />
      </>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailContentState(state);

  return {
    isPristine,
    isFetching,
    mail: data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchMailContentAction,
      toggleRead: toggleReadAction,
      trashMails: trashMailsAction,
      deleteMails: deleteMailsAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MailContentContainer);
