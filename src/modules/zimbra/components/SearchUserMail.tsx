import * as React from "react";
import { TextInput, View, ViewStyle, Dimensions } from "react-native";
import { TouchableOpacity, FlatList } from "react-native-gesture-handler";

import { CommonStyles, IOSShadowStyle } from "../../../styles/common/styles";
import { Text } from "../../../ui/text";
import { newMailService } from "../service/newMail";
import { getProfileColor } from "../utils/userColor";

const UserOrGroupSearch = ({ selectedUsersOrGroups, onChange }) => {
  const [search, updateSearch] = React.useState("");
  const [foundUsersOrGroups, updateFoundUsersOrGroups] = React.useState([]);
  const searchTimeout = React.useRef();

  const filterUsersOrGroups = found => selectedUsersOrGroups.every(selected => selected.id !== found.id);
  React.useEffect(() => {
    if (search.length >= 3) {
      updateFoundUsersOrGroups([]);
      window.clearTimeout(searchTimeout.current);
      searchTimeout.current = window.setTimeout(() => {
        newMailService.searchUsers(search).then(({ groups, users }) => {
          const filteredUsers = users.filter(filterUsersOrGroups);
          const filteredGroups = groups.filter(filterUsersOrGroups);
          updateFoundUsersOrGroups([...filteredUsers, ...filteredGroups]);
        });
      }, 500);
    }

    return () => {
      updateFoundUsersOrGroups([]);
      window.clearTimeout(searchTimeout.current);
    };
  }, [search]);

  const removeUser = id => onChange(selectedUsersOrGroups.filter(user => user.id !== id));
  const addUser = userOrGroup => {
    onChange([
      ...selectedUsersOrGroups,
      { displayName: userOrGroup.name || userOrGroup.displayName, id: userOrGroup.id },
    ]);
    updateSearch("");
  };

  return (
    <View style={{ overflow: "visible", marginHorizontal: 5, flex: 1 }}>
      <SelectedList selectedUsersOrGroups={selectedUsersOrGroups} onItemClick={removeUser} />
      <Input value={search} onChangeText={updateSearch} onSubmit={() => addUser({ displayName: search, id: search })} />
      <FoundList foundUserOrGroup={foundUsersOrGroups} addUser={addUser} />
    </View>
  );
};

const Input = ({ value, onChangeText, onSubmit }) => {
  const textInputStyle = {
    flex: 1,
    height: 40,
    color: CommonStyles.textColor,
    borderBottomColor: "#EEEEEE",
    borderBottomWidth: 2,
  } as ViewStyle;

  return (
    <TextInput
      autoCorrect={false}
      autoCapitalize="none"
      style={textInputStyle}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
    />
  );
};

const FoundList = ({ foundUserOrGroup, addUser }) => {
  const absoluteListStyle = {
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 10,
    backgroundColor: "white",
    elevation: CommonStyles.elevation,
    maxHeight: Dimensions.get("window").height * 0.25,
    flexGrow: 1,
    ...IOSShadowStyle,
  } as ViewStyle;

  const FoundUserOrGroup = ({ profile, displayName, onPress }) => {
    const [color, setColor] = React.useState(CommonStyles.lightGrey);
    React.useEffect(() => {
      setColor(getProfileColor(profile));
    }, [profile]);

    return (
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", marginVertical: 5, marginLeft: 10 }}
        onPress={onPress}>
        <Text numberOfLines={1} lineHeight={30} ellipsizeMode="tail">
          <Text
            style={{
              color,
            }}>
            {"\u25CF "}
          </Text>
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  return foundUserOrGroup.length > 0 ? (
    <View>
      <FlatList
        style={absoluteListStyle}
        data={foundUserOrGroup}
        renderItem={({ item }) => (
          <FoundUserOrGroup
            profile={item.profile}
            displayName={item.name || item.displayName}
            onPress={() => addUser(item)}
          />
        )}
      />
    </View>
  ) : (
    <View />
  );
};

//Selected Item

const SelectedList = ({ selectedUsersOrGroups, onItemClick }) => {
  const SelectedUserOrGroup = ({ onClick, displayName }) => {
    const itemStyle = {
      backgroundColor: CommonStyles.primaryLight,
      borderRadius: 3,
      padding: 5,
      margin: 2,
    } as ViewStyle;

    const userLabel = { color: CommonStyles.primary, textAlignVertical: "center" } as ViewStyle;

    return (
      <TouchableOpacity onPress={onClick} style={itemStyle}>
        <Text style={userLabel}>{displayName}</Text>
      </TouchableOpacity>
    );
  };

  return selectedUsersOrGroups.length > 0 ? (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {selectedUsersOrGroups.map(userOrGroup => (
        <SelectedUserOrGroup
          key={userOrGroup.id}
          onClick={() => onItemClick(userOrGroup.id)}
          displayName={userOrGroup.displayName}
        />
      ))}
    </View>
  ) : (
    <View />
  );
};

export default UserOrGroupSearch;
