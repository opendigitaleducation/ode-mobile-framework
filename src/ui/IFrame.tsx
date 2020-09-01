import React from "react";
import { View, Platform, StatusBar, ViewStyle, TouchableOpacity, SafeAreaView } from "react-native";
import WebView from "react-native-webview";
import I18n from "i18n-js";

import { Loading } from ".";
import { mainNavNavigate } from "../navigation/helpers/navHelper";
import { FullScreenAction } from "./FullScreenAction";
import { hasNotch } from "react-native-device-info";
import { iosStatusBarHeight } from "./headers/Header";
import { Italic } from "./Typography";

export class IFrame extends React.Component<
{
  source: string;
  style?: ViewStyle;
  navigation: any;
},
{
  httpError: boolean;
}
> {
  state = {
    httpError: false
  }

  render() {
    const { source, style={}, navigation } = this.props;
    const { httpError } = this.state;
    const fullScreenSource = navigation && navigation.getParam("source");
    const isEducationApp = source && source.includes("learningapps.org") || source && source.includes("educaplay.com");
    
    return (
      // "overflow: hidden" prevents a display bug on Android
      <SafeAreaView style={{flex: 1, overflow: "hidden", ...style}}>
        {fullScreenSource ? <StatusBar backgroundColor="rgba(0,0,0,0.90)" barStyle="dark-content" /> : null}
        <TouchableOpacity
          activeOpacity={1}
          style={{ 
            flex: 1,
            backgroundColor: "#eeeeee",
            aspectRatio: fullScreenSource ? undefined : isEducationApp ? 4/3 : 16/9,
            justifyContent: httpError ? "center" : undefined,
            alignItems: httpError ? "center" : undefined,
          }}
        >
          {httpError
            ? <Italic>{I18n.t("common-ErrorLoadingResource")}</Italic>
            : <WebView
                  style={{ alignSelf: "stretch"}}
                  source={{ uri: source || fullScreenSource }}
                  renderLoading={() => (
                    <View
                      style={{
                        backgroundColor: "#eeeeee",
                        height: "100%",
                        width: "100%"
                      }}
                    >
                      <Loading />
                    </View>
                  )}
                  scrollEnabled={false}
                  startInLoadingState
                  mediaPlaybackRequiresUserAction
                  onHttpError={() => this.setState({httpError: true})}
                  /* On Android, the status bar is by default visible, even when a video is playing fullscreen */
                  /* Thanks for the tip, Nabil ! :) */
                  {...(Platform.OS === "android"
                    ? {
                        injectedJavaScript: `
                          let isFullscreen = false;
                          function check() {
                            if (isFullscreen) {
                              window.postMessage("-fullscreen-off");
                            } else {
                              window.postMessage("-fullscreen-on");
                            }
                            isFullscreen = !isFullscreen;
                          }
                          document.addEventListener('webkitfullscreenchange', function(e) {
                              check();
                          }, false);
                          document.addEventListener('mozfullscreenchange', function(e) {
                              check();
                          }, false);
                          document.addEventListener('fullscreenchange', function(e) {
                              check();
                          }, false);
                        `,
                        onMessage: (data: any) => {
                          if (data.nativeEvent.data === "-fullscreen-off")
                            StatusBar.setHidden(false);
                          else if (data.nativeEvent.data === "-fullscreen-on")
                            StatusBar.setHidden(true);
                        }
                      }
                    : {})
                  }
                />
          }
        </TouchableOpacity>
        {isEducationApp
          ? <FullScreenAction
              icon="fullscreen-on"
              action={() => mainNavNavigate("iframeModal", {source})}
              customStyle={{top: 5, right: 5}}
            />
          : null
        }
        {fullScreenSource
          ? <FullScreenAction
              icon="fullscreen-off"
              action={() => navigation.goBack()}
              customStyle={{top: Platform.OS === "ios" ? hasNotch() ? iosStatusBarHeight + 30 : 25 : 0}}
            />
          : null
        }
      </SafeAreaView>
    );
  }
}
