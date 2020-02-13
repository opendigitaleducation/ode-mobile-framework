import React, { Component } from "react";
import { FlatList, Keyboard, Platform, StyleSheet, View } from "react-native";
import FloatingActionItem from "./FloatingActionItem";
import { layoutSize } from "../../styles/common/layoutSize";
import { CommonStyles } from "../../styles/common/styles";
import { IFloatingProps, IMenuItem } from "../types";
import { ISelected } from "../Toolbar/Toolbar";
import TouchableOpacity from "../CustomTouchableOpacity";
import { ButtonIconText } from "..";
import { getMenuShadow } from "../ButtonIconText";
import { iosStatusBarHeight } from "../headers/Header";


class FloatingAction extends Component<IFloatingProps & ISelected, IState> {
  state = {
    active: false,
  };

  visible = true;

  reset = () => {
    this.setState({
      active: false,
    });
  };

  animateButton = () => {
    const { active } = this.state;

    Keyboard.dismiss();

    if (!active) {
      this.setState({
        active: true,
      });
    } else {
      this.reset();
    }
  };

  handleEvent = (event: any): void => {
    const { onEvent } = this.props;

    if (onEvent) {
      onEvent(event);
    }
    this.reset();
  };

  renderMainButton() {
    const { menuItems } = this.props;
    const iconName = this.state.active ? "close" : "add";

    if (!menuItems || menuItems.length === 0) {
      return null;
    }

    return <ButtonIconText style={styles.button} name={iconName} onPress={this.animateButton} />;
  }

  renderActions() {
    const { menuItems } = this.props;
    const { active } = this.state;

    if (!active || !menuItems || menuItems.length === 0) {
      return undefined;
    }

    return (
      <FlatList
        contentContainerStyle={styles.actions}
        data={menuItems}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item: IMenuItem) => item.id}
        renderItem={({ item }) => <FloatingActionItem item={item} onEvent={this.handleEvent.bind(this)} />}
      />
    );
  }

  render() {
    const { selected } = this.props;

    if (selected.length) {
      return null;
    }

    const { menuItems } = this.props;
    const { active } = this.state;

    if (active) {
      return (
        <>
          {this.renderMainButton()}
          <TouchableOpacity onPress={this.animateButton} style={styles.overlayActions}>
            {this.renderActions()}
          </TouchableOpacity>
        </>
      );
    }

    if (!active || (menuItems && menuItems.length === 0)) {
      return this.renderMainButton();
    }

    return null;
  }
}

interface IState {
  active: boolean;
}

const styles = StyleSheet.create({
  actions: {
    borderRadius: layoutSize.LAYOUT_4,
    overflow: "visible",
    backgroundColor: "#ffffff",
    position: "absolute",
    right: 12,
    top: 78,
    width: layoutSize.LAYOUT_200,
    zIndex: 5,
    ...getMenuShadow()
  },
  button: {
    position: "absolute",
    right: 20,
    top: Platform.OS === "ios" ? iosStatusBarHeight + 24 : 24,
    zIndex: 5,
  },
  overlayActions: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: Platform.OS === "ios" ? iosStatusBarHeight : 0,
  },
  separator: {
    borderBottomColor: CommonStyles.borderColorVeryLighter,
    borderBottomWidth: 1,
    width: "100%",
  },
});

export default FloatingAction;

