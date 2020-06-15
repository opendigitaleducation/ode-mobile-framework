import React, { Component } from "react";
import { AppRegistry, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import RNFSI from "react-native-file-share-intent";

class Share extends Component {

  async componentDidMount() {
    try {
      this.state = await RNFSI.getFile();
      const bundleId = DeviceInfo.getBundleId();
      const link = bundleId.replace(".share-intent", "") + "://upload?path=" + encodeURIComponent(JSON.stringify(this.state));

      RNFSI.openURL(link);
      RNFSI.close();
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    return (
      <View />
    );
  }
}

AppRegistry.registerComponent("Share", () => Share);
