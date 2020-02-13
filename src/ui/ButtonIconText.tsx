import style from "glamorous-native";
import * as React from "react";
import { CommonStyles } from "../styles/common/styles";
import { Icon } from "./icons/Icon";
import { layoutSize } from "../styles/common/layoutSize";
import { TextBold15 } from "./text";
import { StyleSheet } from "react-native";
import FloatingAction from "./FloatingButton/FloatingAction";

export interface ButtonTextIconProps {
  onPress: () => any;
  children?: any;
  disabled?: boolean;
  name: string;
  size?: number;
  style?: any;
  whiteSpace?: string;
}

const Container = style.view(
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  (props: any) => ({
    style: props.style ? props.style : null,
  })
);

const TouchableOpacity = style.touchableOpacity( {
    alignItems: "center",
    justifyContent: "center",
    width: layoutSize.LAYOUT_50,
    height: layoutSize.LAYOUT_50,
    borderRadius: layoutSize.LAYOUT_25,
    backgroundColor: CommonStyles.profileTypes.Student,
  });

export const ButtonIconText = ({ name, onPress, children, size, style }: ButtonTextIconProps) => {
  return (
    <>
      <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
        <Icon color="white" size={size ? size : layoutSize.LAYOUT_25} name={name} />
      </TouchableOpacity>
      <TextBold15>{children}</TextBold15>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    ...getButtonShadow(),
  },
});

export default FloatingAction;

export function getButtonShadow() {
  return {
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12},
    shadowOpacity: 0.58,
    shadowRadius: 16,
  };
};

export function getMenuShadow() {
  return {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
  };
};

