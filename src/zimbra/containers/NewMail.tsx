import I18n from "i18n-js";
import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp, NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import pickFile from "../../infra/actions/pickFile";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { Icon, Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { Header as HeaderComponent } from "../../ui/headers/Header";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { trashMailsAction } from "../actions/mail";
import { fetchMailContentAction, clearMailContentAction } from "../actions/mailContent";
import {
  sendMailAction,
  makeDraftMailAction,
  updateDraftMailAction,
  addAttachmentAction,
  deleteAttachmentAction,
} from "../actions/newMail";
import { getSignatureAction } from "../actions/signature";
import NewMailComponent from "../components/NewMail";
import { newMailService, ISearchUsers, IUser } from "../service/newMail";
import { getMailContentState, IMail } from "../state/mailContent";
import MailContentMenu from "../components/MailContentMenu";
import SignatureModal from "../containers/SignatureModal";
import { getSignatureState } from "../state/signature";

enum DraftType {
  NEW,
  DRAFT,
  REPLY,
  REPLY_ALL,
  FORWARD,
}

type StateTypes = {
  inputName: string;
  text: string;
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  searchTo: ISearchUsers;
  searchCc: ISearchUsers;
  searchBcc: ISearchUsers;
};

interface ICreateMailEventProps {
  sendMail: (mailDatas: object, draftId: string, inReplyTo: string) => void;
  searchUsers: (search: string) => void;
  makeDraft: (mailDatas: object, inReplyTo: string, methodReply: string) => void;
  updateDraft: (mailId: string, mailDatas: object) => void;
  trashMessage: (mailId: string[]) => void;
  postAttachments: (draftId: string, files: any[]) => void;
  deleteAttachment: (draftId: string, attachmentId: string) => void;
  fetchMailContentAction: (mailId: string) => void;
  getSignatureAction: () => void;
  clearContent: () => void;
}

interface ICreateMailOtherProps {
  navigation: any;
  remainingUsers: IUser[];
  pickedUsers: IUser[];
  mail: IMail;
}

interface ICreateMailState {
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  subject: string;
  body: string;
  attachments: string[];

  searchTo: ISearchUsers;
  searchCc: ISearchUsers;
  searchBcc: ISearchUsers;
  inputName: string;
  prevBody: string;
  isUpdated: boolean;
  isShownHeaderMenu: boolean;
  isShownSignatureModal: boolean;
  signature: string;
}

type NewMailContainerProps = ICreateMailEventProps & ICreateMailOtherProps;

class NewMailContainer extends React.PureComponent<NewMailContainerProps, ICreateMailState> {
  defaultState = {
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    body: "",
    attachments: [],
    prevBody: "",
    isUpdated: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      to: [],
      cc: [],
      bcc: [],
      subject: "",
      body: "",
      attachments: [],
      searchTo: [],
      searchCc: [],
      searchBcc: [],
      inputName: "",
      prevBody: "",
      isUpdated: false,
      isShownHeaderMenu: false,
      isShownSignatureModal: false,
      signature: "",
    };
  }

  componentDidMount = () => {
    if (this.props.navigation.state.params.mailId !== undefined) {
      this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
    } else {
      this.props.clearContent();
      this.setState(this.defaultState);
    }
    this.props.getSignatureAction();
  };

  updateStateValue = (toUsers, ccUsers, bccUsers, subjectText, bodyText) => {
    this.setState({ to: toUsers, cc: ccUsers, bcc: bccUsers, subject: subjectText, body: bodyText });
  };

  updatePrevBody = prevBodyText => {
    this.setState({ prevBody: prevBodyText });
  };

  setSearchUsers = async (text: string, inputName: string) => {
    const resultUsers = await newMailService.getSearchUsers(text);
    const key = inputName === "to" ? "searchTo" : inputName === "cc" ? "searchCc" : "searchBcc";
    const newState = { ...this.state };
    newState[key as keyof StateTypes] = resultUsers.users;
    this.setState(newState);
    return resultUsers.users;
  };

  handleInputChange = (text: string, inputName: string) => {
    switch (inputName) {
      case "to":
        return text.length > 2 ? this.setSearchUsers(text, inputName) : this.setState({ searchTo: [] });
      case "cc":
        return text.length > 2 ? this.setSearchUsers(text, inputName) : this.setState({ searchCc: [] });
      case "bcc":
        return text.length > 2 ? this.setSearchUsers(text, inputName) : this.setState({ searchBcc: [] });
      case "subject":
        this.setState({ subject: text });
        break;
      case "body":
        this.setState({ body: text });
        break;
    }
    this.setState({ isUpdated: true });
  };

  pickUser = (user, inputName) => {
    const key = inputName === "to" ? "to" : inputName === "cc" ? "cc" : "bcc";
    const keySearch = inputName === "to" ? "searchTo" : inputName === "cc" ? "searchCc" : "searchBcc";

    const newState = { ...this.state };
    if (this.state[key].findIndex(u => u.id === user.id) === -1) {
      if (this.state[keySearch].findIndex(u => u.id === user.id) !== -1) {
        newState[keySearch as keyof StateTypes] = this.state[keySearch].filter(function(person) {
          return person !== user;
        });
      }
    }
    newState[key as keyof StateTypes] = [...this.state[key], user];
    this.setState(newState);
    this.setState({ isUpdated: true });
  };

  unpickUser = (user, inputName) => {
    const key = inputName === "to" ? "to" : inputName === "cc" ? "cc" : "bcc";
    const keySearch = inputName === "to" ? "searchTo" : inputName === "cc" ? "searchCc" : "searchBcc";

    if (this.state[key].findIndex(u => u.id === user.id) !== -1) {
      const newState = { ...this.state };
      newState[key as keyof StateTypes] = this.state[key].filter(function(person) {
        return person !== user;
      });
      newState[keySearch as keyof StateTypes] = [...this.state[keySearch], user];
      this.setState(newState);
      this.setState({ isUpdated: true });
    }
  };

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        header: null,
      },
      navigation
    );
  };

  manageDraftMail = (forceDraft = false) => {
    const { navigation } = this.props;
    const { to, cc, bcc, subject, body, prevBody, attachments } = this.state;
    if (
      forceDraft ||
      to.length > 0 ||
      cc.length > 0 ||
      bcc.length > 0 ||
      subject !== "" ||
      body !== "" ||
      attachments.length > 0
    ) {
      const currBody =
        navigation.state.params.type === "REPLY" ||
        navigation.state.params.type === "REPLY_ALL" ||
        navigation.state.params.type === "FORWARD"
          ? body + "\n-------------------\n" + prevBody
          : body;
      const mailDatas = {
        to: to.map(elem => (elem.id && elem.id !== undefined ? elem.id : elem)),
        cc: cc.map(elem => (elem.id && elem.id !== undefined ? elem.id : elem)),
        bcc: bcc.map(elem => (elem.id && elem.id !== undefined ? elem.id : elem)),
        subject: subject,
        body: currBody !== "" ? `<div>${currBody.replace(/\n/g, "<br>")}</div>` : body,
        attachments: attachments,
      };
      if (this.props.navigation.state.params.type === "DRAFT") {
        this.props.updateDraft(this.props.navigation.state.params.mailId, mailDatas);
      } else {
        if (navigation.state.params.type === "REPLY" || navigation.state.params.type === "REPLY_ALL")
          this.props.makeDraft(mailDatas, navigation.state.params.mailId, "");
        if (navigation.state.params.type === "FORWARD")
          this.props.makeDraft(mailDatas, navigation.state.params.mailId, "F");
        else this.props.makeDraft(mailDatas, "", "");
      }
    }
  };

  goBack = isMakeDraft => {
    if (this.props.navigation.state.params.mailId !== undefined) {
      if (isMakeDraft === "isDraft" && this.state.isUpdated) this.manageDraftMail();
      const { navigation } = this.props;
      navigation.state.params.onGoBack();
      navigation.dispatch(NavigationActions.back());
    } else if (this.props.navigation.state.params.type === "NEW") {
      if (isMakeDraft === "isDraft") this.manageDraftMail();
      this.props.navigation.navigate(this.props.navigation.state.params.currentFolder);
    }
    this.setState(this.defaultState);
  };

  delete = () => {
    if (this.props.navigation.state.params.type === "DRAFT") {
      this.props.trashMessage([this.props.navigation.state.params.mailId]);
      this.goBack("isNotDraft");
    } else if (this.props.navigation.state.params.type === "NEW") {
      this.props.navigation.navigate(this.props.navigation.state.params.currentFolder);
      this.setState(this.defaultState);
    }
  };

  handleSendNewMail = () => {
    const { navigation } = this.props;
    const { to, cc, bcc, subject, body, prevBody } = this.state;
    const { attachments } = this.props.mail;
    if (to.length === 0 && cc.length === 0 && bcc.length === 0) {
      Toast.show(I18n.t("zimbra-missing-receiver"), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: "95%", backgroundColor: "black" },
      });
      return;
    }
    const currBody =
      navigation.state.params.type === "REPLY" ||
      navigation.state.params.type === "REPLY_ALL" ||
      navigation.state.params.type === "FORWARD"
        ? body + "\n-------------------\n" + prevBody
        : body;
    const mailDatas = {
      to: to.map(elem => (elem.id && elem.id !== undefined ? elem.id : elem)),
      cc: cc.map(elem => (elem.id && elem.id !== undefined ? elem.id : elem)),
      bcc: bcc.map(elem => (elem.id && elem.id !== undefined ? elem.id : elem)),
      subject: subject,
      body: currBody !== "" ? `<div>${currBody.replace(/\n/g, "<br>")}</div>` : body,
      attachments: attachments,
    };
    const mailId = navigation.state.params.mailId !== undefined ? navigation.state.params.mailId : "";
    if (navigation.state.params.type === "NEW") {
      if (attachments !== undefined && attachments.length === 0) this.props.sendMail(mailDatas, "", "");
      else this.props.sendMail(mailDatas, this.props.mail.id, "");
    } else if (navigation.state.params.type === "DRAFT") this.props.sendMail(mailDatas, mailId, "");
    else if (
      navigation.state.params.type === "REPLY" ||
      navigation.state.params.type === "REPLY_ALL" ||
      navigation.state.params.type === "FORWARD"
    )
      this.props.sendMail(mailDatas, "", mailId);
    this.goBack("isNotDraft");

    Toast.show(I18n.t("zimbra-send-mail"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  askForAttachment = () => {
    let promise;
    if (this.props.mail.id === undefined) promise = this.manageDraftMail(true);
    else promise = Promise.resolve();

    pickFile().then(contentUri => {
      this.props.postAttachments(this.props.mail.id, [contentUri]);
    });
  };

  updateSignature = (signatureText: string) => {
    this.setState({ signature: signatureText });
  };

  addedSignature = () => {
    this.props.getSignatureAction();
    Toast.show(I18n.t("zimbra-signature-added"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  public showSignatureModal = () => { 
    this.setState({ isShownSignatureModal: true });
  };

  public closeSignatureModal = () => {
    this.setState({ isShownSignatureModal: false });
  };

  public showMenu = () => {
    const { isShownHeaderMenu } = this.state;
    this.setState({
      isShownHeaderMenu: !isShownHeaderMenu,
    });
  };

  public render() {
    const { isShownHeaderMenu, isShownSignatureModal } = this.state;
    const menuData = [
      { text: I18n.t("zimbra-signature-add"), icon: "pencil", onPress: this.showSignatureModal },
      { text: I18n.t("zimbra-delete"), icon: "delete", onPress: this.delete },
    ];
    return (
      <>
        <PageContainer>
          <HeaderComponent color={CommonStyles.secondary}>
            <HeaderAction onPress={() => this.goBack("isDraft")} name="back" />
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => this.askForAttachment()}>
                <Icon name="attachment" size={24} color="white" style={{ marginRight: 10 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.handleSendNewMail.bind(this)}>
                <Icon name="outbox" size={24} color="white" style={{ marginRight: 10 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.showMenu()}>
                <Icon name="more_vert" size={24} color="white" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>
          </HeaderComponent>
          <ConnectionTrackingBar />
          {this.props.isFetching ? (
            <Loading />
          ) : (
            <NewMailComponent
              {...this.state}
              {...this.props}
              mail={this.props.mail}
              handleInputChange={this.handleInputChange}
              pickUser={this.pickUser}
              unpickUser={this.unpickUser}
              updateStateValue={this.updateStateValue}
              updatePrevBody={this.updatePrevBody}
              deleteAttachment={this.props.deleteAttachment}
              updateSignature={this.updateSignature}
            />
          )}
        </PageContainer>
        <MailContentMenu onClickOutside={this.showMenu} show={isShownHeaderMenu} data={menuData} />
        <SignatureModal
          signature={this.state.signature}
          show={isShownSignatureModal}
          closeModal={this.closeSignatureModal}
          successCallback={this.addedSignature}
        />
      </>
    );
  }
}

const mapStateToProps = (state: any) => {
  const { isFetching, data } = getMailContentState(state);
  const signatureMail = getSignatureState(state);

  return {
    mail: data,
    isFetching,
    signatureMail,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      sendMail: sendMailAction,
      makeDraft: makeDraftMailAction,
      updateDraft: updateDraftMailAction,
      trashMessage: trashMailsAction,
      postAttachments: addAttachmentAction,
      deleteAttachment: deleteAttachmentAction,
      clearContent: clearMailContentAction,
      fetchMailContentAction,
      getSignatureAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NewMailContainer);
