import * as React from "react";
import { NativeEventEmitter, NativeModules, Platform, Linking } from "react-native";
import RNFileShareIntent from "react-native-file-share-intent";
import I18n from "i18n-js";

import { isInOwnerWorkspace } from "../../navigation/NavigationService";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";
import { ContentUri } from "../../types/contentUri";
import { contentUriAction } from "../../workspace/actions/contentUri";
import { FilterId } from "../../workspace/types/filters";

const navigate = (contentUri: ContentUri, dispatch) => {
  dispatch(contentUriAction(contentUri instanceof Array ? contentUri : [contentUri]));
  // check to see if already in workspace
  if (!isInOwnerWorkspace()) {
    mainNavNavigate("Workspace", {
      filter: FilterId.root,
      parentId: FilterId.root,
      title: I18n.t("workspace"),
      childRoute: "Workspace",
      childParams: {
        parentId: "owner",
        filter: FilterId.owner,
        title: I18n.t("owner"),
      },
    });
  }
};

export default function withLinkingAppWrapper<
  T extends {
    dispatch: any;
  }
>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  var wrapper!: React.ComponentType<T>;

  const wrapperFactory = platform => {
    switch (platform) {
      case "android":
        return class extends React.PureComponent<T> {
          eventEmitter: NativeEventEmitter | null = null;

          private intentHandler = (contentUri: ContentUri) => {
            navigate(contentUri, this.props.dispatch);
          };

          public componentDidMount() {
            RNFileShareIntent.getFilePath(this.intentHandler);
            this.eventEmitter = new NativeEventEmitter(NativeModules.RNFileShareIntent);
            this.eventEmitter.addListener("FileShareIntent", this.intentHandler);
          }

          public componentWillUnmount(): void {
            this.eventEmitter && this.eventEmitter.removeListener("FileShareIntent", this.intentHandler);
          }

          public render() {
            return <WrappedComponent {...this.props} />;
          }
        };
      case "ios":
        return class extends React.PureComponent<T> {
          private intentHandler = event => {
            const regexp = /path=(.*)$/;
            if (event != null && event.url != null && regexp.test(event.url)) {
              const rawContent = regexp.exec(event.url);
              const content = JSON.parse(decodeURIComponent(rawContent[1]));
              navigate(content, this.props.dispatch);
            }
          };

          public componentDidMount() {
            console.warn(Linking.getInitialURL());
            Linking.addEventListener("url", this.intentHandler);
          }

          public componentWillUnmount(): void {
            Linking.removeEventListener("url", this.intentHandler);
          }

          public render() {
            return <WrappedComponent {...this.props} />;
          }
        };
      default:
        return WrappedComponent;
    }
  };

  if (wrapper == undefined) {
    wrapper = wrapperFactory(Platform.OS);
  }

  return wrapper;
}
