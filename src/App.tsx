// RN Imports
import * as React from "react";
import { initI18n } from "./framework/util/i18n";
import { StatusBar, View, AppState, AppStateStatus } from "react-native";
import * as RNLocalize from "react-native-localize";
import "react-native-gesture-handler";

// Polyfills
import 'ts-polyfill/lib/es2019-object';

// Redux
import { Provider, connect } from "react-redux";

// JS
import Conf from "../ode-framework-conf";

// ODE Mobile Framework Modules
import { Trackers } from './infra/tracker';

// ODE Mobile Framework Redux
import { refreshToken } from "./user/actions/login";
import { loadCurrentPlatform, selectPlatform } from "./user/actions/platform";
import { isInActivatingMode } from "./user/selectors";
import { checkVersionThenLogin } from "./user/actions/version";

// Main Screen
import AppScreen from "./AppScreen";

// Style
import { CommonStyles } from './styles/common/styles';
import SplashScreen from "react-native-splash-screen";

import messaging from '@react-native-firebase/messaging';

// Functionnal modules // THIS IS UGLY. it is a workaround for include matomo tracking.
// require("./timelinev2");
require("./mailbox");
//require("./zimbra");
//require("./pronote");
//require("./lvs");
require("./homework");
require("./workspace");
//require("./viescolaire");
require("./myAppMenu");
//require("./support");
require("./user");

// Store
import { createMainStore } from "./AppStore";
import { IUserAuthState } from "./user/reducers/auth";
import { IUserInfoState } from "./user/state/info";

// App Conf
import "./infra/appConf";
import { AppPushNotificationHandlerComponent } from "./framework/util/notifications/cloudMessaging";

// Disable Yellow Box on release builds.
if (__DEV__) {
  // tslint:disable-next-line:no-console
  console.disableYellowBox = true;
}

class AppStoreUnconnected extends React.Component<
  { currentPlatformId: string; store: any },
  {}
  > {
  private notificationOpenedListener?: () => void;
  private onTokenRefreshListener?: () => void;

  public render() {
    return (
      <Provider store={this.props.store}>
        <View style={{ flex: 1 }}>
          <StatusBar
            backgroundColor={CommonStyles.statusBarColor}
            barStyle="light-content"
          />
          <AppPushNotificationHandlerComponent>
            <AppScreen />
          </AppPushNotificationHandlerComponent>
        </View>
      </Provider>
    );
  }

  public async componentDidMount() {

    // Event handlers
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    AppState.addEventListener('change', this.handleAppStateChange);

    // Tracking
    await Trackers.init();
    Trackers.trackEvent('Application', 'STARTUP');
    // await Trackers.test();

    // console.log("APP did mount");
    if (!this.props.currentPlatformId) {
      // If only one platform in conf => auto-select it.
      if (Conf.platforms && Object.keys(Conf.platforms).length === 1) {
        await this.props.store.dispatch(selectPlatform(Object.keys(Conf.platforms)[0]));
        await this.startupLogin();
      } else {
        // console.log("awaiting get platform id");
        const loadedPlatformId = await this.props.store.dispatch(loadCurrentPlatform());
        if (loadedPlatformId) await this.startupLogin();
      }
    }
    if (this.props.currentPlatformId) {
      await this.startupLogin();
    }
    SplashScreen.hide();

    this.handleAppStateChange('active'); // Call this manually after Tracker is set up
  }

  public async componentDidUpdate(prevProps: any) {
    if (!this.onTokenRefreshListener)
      this.onTokenRefreshListener = messaging()
        .onTokenRefresh(fcmToken => {
          this.handleFCMTokenModified(fcmToken);
        });
  }

  private async startupLogin() {
    // console.log("startup login");
    //IF WE ARE NOT IN ACTIVATION MODE => TRY TO LOGIN => ELSE STAY ON ACTIVATION PAGE
    if (!isInActivatingMode(this.props.store.getState())) {
      // Auto Login if possible
      this.props.store.dispatch(checkVersionThenLogin(true));
    }
  }

  public componentWillUnmount() {
    RNLocalize.removeEventListener("change", this.handleLocalizationChange);
    AppState.removeEventListener('change', this.handleAppStateChange);
    if (this.notificationOpenedListener) this.notificationOpenedListener();
    if (this.onTokenRefreshListener) this.onTokenRefreshListener();
  }

  private handleLocalizationChange = () => {
    initI18n()
    this.forceUpdate();
  };

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('[App State] now in active mode');
      Trackers.trackEvent('Application', 'DISPLAY');
    } else if (nextAppState === 'background') {
      console.log('[App State] now in background mode');
    }
  }

  private handleFCMTokenModified = (fcmToken: any) => {
    this.props.store.dispatch(refreshToken(fcmToken));
  };
}

function connectWithStore(store: any, WrappedComponent: any, ...args: [any?, any?, any?, any?]) {
  const ConnectedWrappedComponent = connect(...args)(WrappedComponent);
  return (props: any) => {
    return <ConnectedWrappedComponent {...props} store={store} />;
  };
}

const theStore: any = { store: undefined };
const getStore = () => {
  // console.log("get the store", theStore.store);
  if (theStore.store == undefined) theStore.store = createMainStore();
  // console.log("the store is", theStore.store);
  return theStore.store;
}

const mapStateToProps = (state: any) => ({
  currentPlatformId: state.user.auth.platformId,
  store: getStore(),
});

export const AppStore = () => {
  return connectWithStore(
    getStore(),
    AppStoreUnconnected,
    mapStateToProps
  )
};

export default AppStore();

export const getSessionInfo = () => ({
  ...(getStore().getState() as any).user.info
}) as IUserInfoState & IUserAuthState;