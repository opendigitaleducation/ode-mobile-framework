import * as React from "react";
import { View, StyleSheet } from "react-native";
import moment from "moment";
import I18n from "i18n-js";

import { Text, TextBold } from "../../../ui/text";
import { PageContainer } from "../../../ui/ContainerContent";
import { LeftColoredItem } from "../../viesco/components/Item";
import { Icon } from "../../../ui";
import { HtmlContentView } from "../../../ui/HtmlContentView";

const style = StyleSheet.create({
  sessionPart: { paddingVertical: 8, paddingHorizontal: 15 },
  pageTitle: { color: "#AFAFAF", textTransform: "uppercase" },
  title: { fontSize: 18 },
  subtitle: { color: "#AFAFAF", marginBottom: 15 },
  course: { fontWeight: "bold", textTransform: "uppercase" }
});

export default class DisplayHomework extends React.PureComponent<{getfunction:any}, {sessionData:any}> {
  constructor(props) {
    super(props);
    this.state = {
      sessionData: {}
    }

    this.datprops = this.datprops.bind(this);
    this.datprops();
  }
  
  datprops = async () => {
    let getSessionData = {};
    try {
      getSessionData = await this.props.getfunction;
      this.setState({sessionData: getSessionData});
    }
    catch(e) {
      this.setState({sessionData: getSessionData});
    }
  }

  public render() {
    return (
      <PageContainer>
        <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
          <LeftColoredItem shadow style={{ alignItems: "flex-end", flexDirection: "row" }} color="#00ab6f">
            { this.state.sessionData.description ?
              <>
                <Icon size={20} color="#00ab6f" name="reservation" />
                <Text>&emsp;{moment(this.state.sessionData.date).format("DD/MM/YY")}</Text>
                <Text style={style.course}>&emsp;{this.state.sessionData.subject_id}</Text>
              </>
              : null
            }
          </LeftColoredItem>
        </View>

        <View style={[style.sessionPart]}>
          <Text style={ style.pageTitle }>{I18n.t("viesco-session")}</Text>
          <TextBold style={style.title}>{this.state.sessionData.title}</TextBold>
          { this.state.sessionData.description ?
            <HtmlContentView html = {this.state.sessionData.description} />
            : null
          }
        </View>
      </PageContainer>
    );
  };
}
