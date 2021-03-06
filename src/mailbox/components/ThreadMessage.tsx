import * as React from "react";
import { View, ScrollView, ViewStyle, TouchableOpacity } from "react-native";
import style from "glamorous-native";
import I18n from "i18n-js";

import { CommonStyles } from "../../styles/common/styles";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { DateView } from "../../ui/DateView";
import { HtmlContentView } from "../../ui/HtmlContentView";
import { IRemoteAttachment } from "../../ui/Attachment";
import { ConversationMessageStatus } from "../actions/sendMessage";
import { AttachmentGroup } from "../../ui/AttachmentGroup";
import { getSessionInfo } from "../../App";
import { Trackers } from "../../infra/tracker";
import { Icon } from "../../ui/icons/Icon";
import { A } from "../../ui/Typography";
import { separateMessageHistory, separateHistoryElements } from "../utils/messageHistory";

export const MessageBubble = ({ 
    contentHtml,
    historyHtml,
    onShowHistory,
    showHistory = false,
    hasAttachments,
    isMine,
    canScroll = false,
    style,
    containerStyle
  }:
  {
    contentHtml: string,
    historyHtml?: string[] | string,
    onShowHistory?: () => void,
    showHistory?: boolean,
    hasAttachments?: boolean,
    isMine?: boolean,
    canScroll?: boolean,
    style?: ViewStyle,
    containerStyle?: ViewStyle
  }) => {
  const htmlOpts = {
    globalTextStyle: {
      color: isMine ? "white" : CommonStyles.textColor,
      fontFamily: CommonStyles.primaryFontFamily,
      fontSize: 14
    },
    ...(isMine
      ? {
        linkTextStyle: {
          color: "white",
          textDecorationLine: "underline"
        }
      }
      : null),
    textColor: !isMine
  }
  const htmlEmptyMessage = I18n.t("conversation-emptyMessage");
  const bubbleStyle = {
    alignSelf: "stretch",
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "100%"
  }
  const style2 = {
    ...style,
    elevation: 2,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
    backgroundColor: isMine ? CommonStyles.iconColorOn : "white",
    alignSelf: "stretch"
  }

  const content = 
    <View style={bubbleStyle} onStartShouldSetResponder={canScroll ? () => true : undefined}>
    <HtmlContentView
      html={contentHtml}
      emptyMessage={htmlEmptyMessage}
      opts={htmlOpts}
    />
    {historyHtml
      ? <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}
          onPress={onShowHistory}
        >
          <Icon
            name="arrow_down"
            color={isMine ? "white" : CommonStyles.actionColor}
            style={!showHistory ? {transform: [{ rotate: "270deg" }]} : {marginRight: 2}}
          />
          <A style={{ color: isMine ? "white" : CommonStyles.actionColor }}>
          {I18n.t(showHistory ? "conversation-historyHide" : "conversation-historyShow")}
          </A>
        </TouchableOpacity>
      : null
    }
    {showHistory
      ? typeof historyHtml === "string"
        ? <HtmlContentView
            html={historyHtml}
            emptyMessage={htmlEmptyMessage}
            opts={htmlOpts}
          />
        : <IndentedHistory
            historyHtml={historyHtml}
            htmlEmptyMessage={htmlEmptyMessage}
            htmlOpts={htmlOpts}
          />
      : null
    }
  </View>;

  return canScroll
    ? <ScrollView
        style={style2}
        contentContainerStyle={[containerStyle, hasAttachments && { marginBottom: 3 }]}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>
    : <View style={style2}>
        {content}
      </View>
};

const IndentedHistory = ({historyHtml, htmlEmptyMessage, htmlOpts}) => {
    let accumulatedHistory: JSX.Element | null = null;
    historyHtml.reverse().forEach((message, index) => {
      accumulatedHistory =
        <View
          style={{
            borderLeftWidth: 1,
            borderLeftColor: CommonStyles.missingGrey,
            paddingLeft: 12,
            marginLeft: 5,
            marginTop: index === historyHtml.length-1 ? 20 : 40
          }}
        >
          <HtmlContentView
            html={message}
            emptyMessage={htmlEmptyMessage}
            opts={htmlOpts}
          />
          {accumulatedHistory}
        </View>
    });

    return accumulatedHistory;
}

const MessageStatus = ({ status, date }) => {
  if (status === undefined || status === ConversationMessageStatus.sent)
    return <DateView date={date} />;
  else if (status === ConversationMessageStatus.sending)
    return (
      <MessageStatusText>
        {I18n.t("conversation-sendingMessage")}
      </MessageStatusText>
    );
  else if (status === ConversationMessageStatus.failed)
    return (
      <MessageStatusText style={{ color: CommonStyles.error, fontSize: 12 }}>
        {I18n.t("conversation-failedSent")}
      </MessageStatusText>
    );
};

export default class ThreadMessage extends React.PureComponent<
  {
    attachments: Array<IRemoteAttachment>;
    id: string;
    threadId: string;
    body: string;
    date: any;
    displayNames: any[];
    from: string;
    to: string[]; // User Ids of the receivers
    toName: string[]; // User names of the receivers
    status: ConversationMessageStatus;
    onOpenImage: (
      imageIndex: number,
      images: Array<{ src: string; alt: string }>
    ) => void;
    selected?: boolean;
  },
  {
    showHistory: boolean;
  }
  > {

  constructor(props) {
    super(props);
    this.state = {
      showHistory: false,
    };
  }

  public render() {
    const {
      attachments,
      body,
      date,
      from = "",
      status,
      id,
      threadId,
      displayNames
    } = this.props;
    const { showHistory } = this.state;
    const separatedBody = separateMessageHistory(body);
    const messageHtml = separatedBody.messageHtml;
    const historyHtml = id === threadId ? separatedBody.historyHtml : undefined;
    const separatedHistoryHtml = historyHtml && separateHistoryElements(historyHtml);
    const hasAttachments = attachments && attachments.length > 0;
    const isMine = from === getSessionInfo().userId;
    // medium-text is used to write previous sender
    // should be replaced with better selector for stability

    if (!(body || attachments)) {
      return <View />;
    }

    const getSenderText = (displayNames: Array<[string, string, boolean]>, from: string) => {
      if (isMine) {
        return getSessionInfo().displayName;
      } else if (displayNames) {
        const res = displayNames.find(el => el && el[0] === from);
        if (res) {
          return res[1];
        } else return I18n.t("unknown-user");
      } else return I18n.t("unknown-user");
    }
    const senderText = getSenderText(displayNames, from);

    return (
      <MessageBlock style={{
        flex: 0,
        backgroundColor: this.props.selected ? CommonStyles.nonLue : undefined,
        borderWidth: 8,
        borderColor: CommonStyles.lightGrey
      }}>
        <MessageContainer style={{ flex: 0 }}>
          <MessageInfos style={{ flex: 0 }}>
            <MessageInfosDetails style={{ flex: 0 }}>
              <AvatarContainer style={{ flex: 0 }}>
                <SingleAvatar size={30} userId={from} />
              </AvatarContainer>
              <View style={{ flex: 1 }}>
                <ReceiverText numberOfLines={1} ellipsizeMode="tail">
                  {senderText}
                </ReceiverText>
              </View>
              <MessageInfosStatus style={{ flex: 0 }}>
                <MessageStatus status={status} date={date} />
              </MessageInfosStatus>
            </MessageInfosDetails>
          </MessageInfos>
          {body
            ? <MessageBubble
                contentHtml={messageHtml}
                historyHtml={separatedHistoryHtml}
                onShowHistory={() => this.setState({ showHistory: !showHistory })}
                showHistory={showHistory}
                hasAttachments={hasAttachments}
                isMine={isMine}
              />
            : null
          }
          {hasAttachments
            ? <AttachmentGroup
              attachments={attachments}
              containerStyle={{ flex: 1, marginLeft: 25 }}
              onDownload={() => Trackers.trackEvent("Conversation", "DOWNLOAD ATTACHMENT", "Read mode")}
              onError={() => Trackers.trackEvent("Conversation", "DOWNLOAD ATTACHMENT ERROR", "Read mode")}
              onDownloadAll={() => Trackers.trackEvent("Conversation", "DOWNLOAD ALL ATTACHMENTS", "Read mode")}
              onOpen={() => Trackers.trackEvent("Conversation", "OPEN ATTACHMENT", "Read mode")}
            />
            : null
          }
        </MessageContainer>
      </MessageBlock>
    );
  }
}

const AvatarContainer = style.view({
  alignItems: "flex-start",
  height: 35,
  justifyContent: "center",
  width: 35
});
const MessageInfos = style.view({
  alignItems: "center",
  alignSelf: "stretch",
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 0
});
const MessageInfosDetails = style.view({
  alignItems: "center",
  flexDirection: "row"
});
const MessageInfosStatus = style.view({
  paddingTop: 5
});
const MessageContainer = style.view({
  alignItems: "flex-start",
  flex: 1,
  flexDirection: "column"
});
const MessageStatusText = style.text({
  fontSize: 12,
  paddingBottom: 5
});
const ReceiverText = style.text({
  fontSize: 11
});
const MessageBlock = style.view({
  alignItems: "flex-end",
  flex: 1,
  flexDirection: "row",
  justifyContent: "flex-start",
  marginRight: 0,
  padding: 15 - 8
});
