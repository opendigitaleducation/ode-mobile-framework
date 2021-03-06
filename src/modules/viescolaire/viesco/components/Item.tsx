import * as React from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";

import { CommonStyles } from "../../../../styles/common/styles";
import TouchableOpacity from "../../../../ui/CustomTouchableOpacity";

const styleConstant = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  containerShadow: {
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
    elevation: 3,
  },
});

type ItemProps = {
  style?: StyleProp<ViewStyle>;
  color?: string;
  selected?: boolean;
  onPress?: () => any;
  disabled?: boolean;
};

enum SidedComponentDirection {
  Left,
  Right,
  Top,
  Bottom,
}

type SidedItemProps = ItemProps & { shadow?: boolean; color: string; side: SidedComponentDirection };

/**
 * Item for VieSco.
 * Selected and color props must be provided together, otherwise they are ignored
 * @param style
 * @param selected  the status of selection
 * @param color     the color of the border, if the component is selected
 * @param onPress
 * @param children
 */
export const Item: React.FunctionComponent<ItemProps> = ({ style, selected, color, onPress, children, disabled }) => {
  const selectedStyle = color && selected ? { borderWidth: 2, borderColor: color } : {};

  return (
    <TouchableOpacity
      disabled={onPress == null || disabled}
      style={[styleConstant.container, selectedStyle, style]}
      onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

/**
 * Item with shadow
 * @param props
 */
const ShadowedItem: React.FunctionComponent<ItemProps> = ({ style, ...rest }) => (
  <Item style={[styleConstant.containerShadow, style]} {...rest} />
);

/**
 * Item with a border colored
 * @param props
 */
const SidedItem: React.FunctionComponent<SidedItemProps> = props => {
  const { side, shadow, style, ...rest } = props;

  const ItemComponent = shadow ? ShadowedItem : Item;

  const getStyleFromSide: (side: SidedComponentDirection, color: string) => ViewStyle = (side, color) => {
    switch (side) {
      case SidedComponentDirection.Left:
        return { borderLeftColor: color, borderLeftWidth: 6 };
      case SidedComponentDirection.Right:
        return { borderRightColor: color, borderRightWidth: 6 };
      case SidedComponentDirection.Top:
        return { borderTopColor: color, borderTopWidth: 6 };
      case SidedComponentDirection.Bottom:
        return { borderBottomColor: color, borderBottomWidth: 12 };
    }
  };

  return <ItemComponent style={[getStyleFromSide(side, props.color), style]} {...rest} />;
};

/**
 * Offer a shortcut for item with left colored
 * @param props
 */
export const LeftColoredItem: React.FunctionComponent<Omit<SidedItemProps, "side">> = props => (
  <SidedItem side={SidedComponentDirection.Left} {...props} />
);

/**
 * Offer a shortcut for item with bottom colored
 * @param props
 */
export const BottomColoredItem: React.FunctionComponent<Omit<SidedItemProps, "side">> = props => (
  <SidedItem side={SidedComponentDirection.Bottom} {...props} />
);
