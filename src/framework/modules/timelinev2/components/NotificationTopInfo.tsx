/**
 * Information about a timeline notification. Displayed in the header.
 */
import * as React from "react";
import { Text } from "react-native";
import I18n from "i18n-js";
import moment from "moment";
import { connect } from "react-redux";

import { CenterPanel, Header, LeftPanel } from "../../../../ui/ContainerContent";
import { BadgeAvatar } from "../../../../ui/BadgeAvatar";
import { HtmlContentView } from "../../../../ui/HtmlContentView";
import { APPBADGES } from "../appBadges";
import { ITimelineNotification } from "../../../util/notifications";
import theme from "../../../util/theme";
import { FontWeight } from "../../../components/text";
import { getUserSession, IUserSession } from "../../../util/session";
import { IGlobalState } from "../../../../AppStore";

const NotificationTopInfo = ({ notification, session }: { notification: ITimelineNotification, session: IUserSession}) => {
  const message = notification && notification.message;
  const type = notification && notification.type;
  const date = notification && notification.date;
  const sender = notification && notification.sender;
  const resource = notification && notification.resource;

  let formattedMessage = message;
  if (message) {
    const isSenderMe = sender && sender.id === session.user.id;
    if (resource && resource.name) formattedMessage = formattedMessage.replace(resource.name, ` ${resource.name} `);
    if (sender && sender.displayName) formattedMessage = formattedMessage.replace(/<br.*?>/, "").replace(sender.displayName, `${sender.displayName} `);
    if (isSenderMe) formattedMessage = formattedMessage.replace(sender && sender.displayName, `${sender.displayName} ${I18n.t("me-indicator")} `);
  }

  return (
    <Header>
      <LeftPanel>
        <BadgeAvatar
          avatars={[sender || require("../../../../../assets/images/system-avatar.png")]}
          badgeContent={APPBADGES[type] && APPBADGES[type].icon}
          badgeColor={APPBADGES[type] && APPBADGES[type].color}
          customStyle={{left: undefined, right: 0}}
        />
      </LeftPanel>
      <CenterPanel>
        <HtmlContentView
          html={formattedMessage}
          opts={{
            hyperlinks: false,
            textFormatting: false,
            textColor: false,
            audio: false,
            video: false,
            iframes: false,
            images: false,
            ignoreLineBreaks: true,
            globalTextStyle: {
              color: theme.color.text.regular,
              fontSize: 12,
              fontWeight: "400"
            },
            linkTextStyle: {
              fontWeight: FontWeight.SemiBold,
              color: theme.color.text.heavy
            }
          }}
        />
        <Text style={{ color: theme.color.text.light, fontSize: 12 }}>
          {moment(date).fromNow()}
        </Text>
      </CenterPanel>
    </Header>
  );
}

const mapStateToProps: (s: IGlobalState) => ({ session: IUserSession }) = (s) => {
  return {
    session: getUserSession(s)
  }
};

export default connect(mapStateToProps)(NotificationTopInfo);
