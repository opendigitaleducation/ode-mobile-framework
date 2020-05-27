import * as React from "react";
import { View } from "react-native";

import { TextBold, Text } from "../../../ui/text";
import { LeftColoredItem } from "../../viesco/components/Item";

export const SessionItem = ({ matiere, author }: any) => (
  <LeftColoredItem innerContainerStyle={{ alignItems: "center", flexDirection: "row" }} color={"#2bab6f"}>
    <View style={{ flex: 1, justifyContent: "space-evenly" }}>
      <TextBold>{matiere}</TextBold>
      <Text>{author}</Text>
    </View>
  </LeftColoredItem>
);
