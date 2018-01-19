import * as React from "react"
import { Text } from "react-native"
import { NavigationActions, StackNavigator, TabNavigator } from "react-navigation"
import { IconOnOff } from "../components"
import { CommonStyles } from "../components/styles/common/styles"
import { layoutSize } from "../constants/layoutSize"
import { navigatorRef } from "../components/AppScreen"
import {TabBarBottomKeyboardAward} from "../components/ui/TabBarComponent";

export const navigator = routes =>
	TabNavigator(routes, {
        tabBarComponent: TabBarBottomKeyboardAward,
		swipeEnabled: true,
		tabBarPosition: "bottom",
		tabBarOptions: {
			activeTintColor: CommonStyles.mainColorTheme,
			inactiveTintColor: CommonStyles.mainColorTheme,
			labelStyle: {
				fontSize: layoutSize.LAYOUT_12,
				fontFamily: CommonStyles.primaryFontFamily,
				color: CommonStyles.textTabBottomColor,
			},
			style: {
				backgroundColor: CommonStyles.tabBottomColor,
				borderTopWidth: 1,
				borderTopColor: CommonStyles.borderColorLighter,
				elevation: 1,
			},
			indicatorStyle: {
				backgroundColor: "#ffffff", //hidden
			},
			showLabel: true,
			upperCaseLabel: false,
			showIcon: true,
		},
	})

const customAnimationFunc = () => ({
    screenInterpolator: () => {
        return null;
    },
});

export const stackNavigator = route =>
	StackNavigator(route, {
		navigationOptions: {
			headerTintColor: CommonStyles.mainColorTheme,
		},
        transitionConfig: customAnimationFunc,
	})

export const NestedTabNavigator = routes =>
	TabNavigator(routes, {
		backBehavior: "none",
		swipeEnabled: true,
		tabBarPosition: "top",
		tabBarOptions: {
			labelStyle: {
				fontSize: layoutSize.LAYOUT_13,
			},
			style: {
				backgroundColor: CommonStyles.tabBackgroundColor,
			},
			indicatorStyle: {
				backgroundColor: CommonStyles.selectColor,
			},
			showLabel: false,
			showIcon: true,
		},
	})

/**
 * return a navigationOptionsTitle object fill with its attributes
 * @param title      the title of the navigationOptionsTitle
 * @param iconName   the icon name
 */
export const navRootOptions = (title, iconName) => ({
	tabBarLabel: ({ focused }) => (
		<Text style={{ alignSelf: "center", color: focused ? CommonStyles.actionColor : CommonStyles.textTabBottomColor }}>{title}</Text>
	),
	tabBarIcon: ({ focused }) => <IconOnOff name={iconName} focused={focused} />,
})

export const navOptions = props => {
	return {
        headerStyle: {
            backgroundColor: CommonStyles.mainColorTheme,
            paddingHorizontal: layoutSize.LAYOUT_20
        },
        headerTitleStyle: {
            color: "white",
            alignSelf: "center",
            textAlign: "center",
            fontFamily: CommonStyles.primaryFontFamily,
            fontSize: layoutSize.LAYOUT_16,
        },
        ...props,
	}
}

export const navigate = (route, props = {}) => {
	return navigatorRef.dispatch(NavigationActions.navigate({ routeName: route, params: props }))
}

