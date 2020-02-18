import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { hasNotch } from "react-native-device-info";
import { ThunkDispatch } from "redux-thunk";
import { TextInput, TouchableWithoutFeedback, TouchableOpacity, FlatList } from "react-native-gesture-handler";
import { View, KeyboardAvoidingView, Platform, Keyboard, ImageBackground } from "react-native";

import { Icon, Loading } from "../../ui";
import { HeaderBackAction, HeaderAction } from "../../ui/headers/NewHeader";
import { GridAvatars } from "../../ui/avatars/GridAvatars";
import { TextBold, TextLight } from "../../ui/text";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { A } from "../../ui/Typography";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { PageContainer } from "../../myAppMenu/components/NewContainerContent";
import { IBlog } from "../state/publishableBlogs";
import { IUserInfoState } from "../../user/state/info";
import { CommonStyles } from "../../styles/common/styles";
import { publishBlogPostAction } from "../actions/publish";
import pickFile from "../../infra/actions/pickFile";
import { uploadAction } from "../../workspace/actions/upload";
import { ContentUri } from "../../types/contentUri";
import { FilterId } from "../../workspace/types";

export interface ICreatePostDataProps {
  user: IUserInfoState;
  publishing: boolean;
  workspaceItems: object;
}

export interface ICreatePostEventProps {
  onUploadPostDocuments: (images: ContentUri[]) => void;
  onPublishPost: (blog: IBlog, title: string, content: string, uploadedPostDocuments?: object) => void;
}

export interface ICreatePostOtherProps {
  navigation: NavigationScreenProp<NavigationState>;
}

export interface ICreatePostState {
  title: string;
  content: string;
  images: ContentUri[];
}

export type ICreatePostPageProps = ICreatePostDataProps & ICreatePostEventProps & ICreatePostOtherProps;

export class CreatePostPage_Unconnected extends React.PureComponent<ICreatePostPageProps, ICreatePostState> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t(`createPost-newPost-${navigation.getParam("postType")}`),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: navigation.getParam('uploadingPostDocuments')
          ? <Loading
              small
              customColor={CommonStyles.lightGrey} 
              customStyle={{ paddingHorizontal: 18 }}
            />
          : <HeaderAction
              navigation={navigation}
              title={I18n.t('createPost-publishAction')}
              onPress={() => navigation.getParam('onPublishPost') && navigation.getParam('onPublishPost')()}
              disabled={
                navigation.getParam('publishing', false)
                || navigation.getParam('title', '').length === 0
                || navigation.getParam('content', '').length === 0
              }
            />
      },
      navigation
    );
  };

  constructor(props: ICreatePostPageProps) {
    super(props);
    this.state = {
      title: '',
      content: '',
      images: []
    }
    this.props.navigation.setParams({
      onPublishPost: this.handlePublishPost.bind(this)
    })
  }

  render() {
    const { title, content, images } = this.state;
    const { user, navigation } = this.props;
    return <KeyboardAvoidingView
      enabled
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? hasNotch() ? 100 : 76 : undefined} // 🍔 Big-(M)Hack of the death : On iOS KeyboardAvoidingView not working properly.
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ height: '100%' }}>
        <PageContainer style={{ flex: 1 }}>
          <ConnectionTrackingBar />

          <View style={{
            paddingHorizontal: 20,
            paddingVertical: 20,
            flexDirection: "row",
            justifyContent: "center",
            flex: 0
          }}>
            <View style={{
              justifyContent: "center",
              width: 45,
              height: 45
            }}>
              <GridAvatars users={[user.id!]} />
            </View>
            <View style={{
              alignItems: "flex-start",
              flex: 1,
              justifyContent: "center",
              marginHorizontal: 6,
              padding: 2
            }}>
              <TextBold>{user.displayName}</TextBold>
              <TextLight numberOfLines={1}>{(navigation.getParam('blog') as IBlog)?.title}</TextLight>
            </View>
          </View>

          <TextBold style={{ paddingHorizontal: 20 }}>{I18n.t('createPost-create-titleField')}</TextBold>
          <TextInput
            numberOfLines={1}
            placeholder={I18n.t('createPost-create-titlePlaceholder')}
            value={title}
            onChangeText={text => {
              this.setState({ title: text });
              navigation.setParams({ title: text })
            }}
            style={{
              marginHorizontal: 20,
              marginTop: 10, marginBottom: 20,
              padding: 5,
              backgroundColor: CommonStyles.tabBottomColor,
              borderColor: CommonStyles.borderBottomItem,
              borderWidth: 1,
              borderRadius: 1
            }}
          />

          <TextBold style={{ paddingLeft: 20, paddingRight: 10 }}>{I18n.t('createPost-create-contentField')}</TextBold>
          <TextInput
            style={{
              marginHorizontal: 20,
              marginTop: 10,
              marginBottom: 20,
              padding: 5,
              flex: images.length > 0 ? 2 : 3,
              backgroundColor: CommonStyles.tabBottomColor,
              borderColor: CommonStyles.borderBottomItem,
              borderWidth: 1,
              borderRadius: 1
            }}
            placeholder={I18n.t('createPost-create-contentPlaceholder')}
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={text => {
              this.setState({ content: text });
              navigation.setParams({ content: text })
            }}
          />

          <View
            style={{
              marginHorizontal: 20,
              marginTop: 10,
              marginBottom: 20,
              padding: 5,
              flex: 1,
              backgroundColor: CommonStyles.tabBottomColor,
              borderColor: CommonStyles.borderBottomItem,
              borderWidth: 1,
              borderRadius: 1,
              justifyContent: "center",
            }}
            >
              <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() => {
                  pickFile(true)
                    .then(selectedImage => {
                      this.setState({ images: [...images, selectedImage] })
                    })
                }}
              >
                <A>{I18n.t('createPost-create-mediaField')}</A>
                <Icon
                  name="camera-on"
                  size={22}
                  color={CommonStyles.actionColor}
                />
              </TouchableOpacity>
              {images.length > 0 &&
                <FlatList 
                  data={images}
                  contentContainerStyle={{ paddingTop: 10 }}
                  horizontal
                  renderItem={({ item, index }) => {
                    return(
                      <ImageBackground
                        source={{ uri: item.uri }}
                        resizeMode="cover"
                        style={{ 
                          width: 100,
                          height: 100,
                          marginRight: index === images.length - 1 ? 0 : 5
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            let imagesToPublish = [...images];
                            imagesToPublish.splice(index, 1);
                            this.setState({ images: imagesToPublish });
                          }}
                        >
                          <Icon
                            name="close"
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              paddingVertical: 4,
                              paddingHorizontal: 4,
                              backgroundColor: CommonStyles.white,
                            }}
                          />
                        </TouchableOpacity>
                      </ImageBackground>
                    )
                  }}
                />
              }
            </View>
        </PageContainer>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  }

  componentDidUpdate(prevProps: ICreatePostPageProps) {
    const { publishing, navigation } = this.props;
    if (prevProps.publishing !== publishing) {
      navigation.setParams({ 'publishing': publishing });
    }
  }

  async handlePublishPost() {
    const { onPublishPost, onUploadPostDocuments, navigation } = this.props;
    const { title, content, images} = this.state;

    let uploadedPostDocuments = undefined;
    if (images.length > 0) {
      navigation.setParams({ uploadingPostDocuments: true })
      uploadedPostDocuments = await onUploadPostDocuments(images)
    }

    onPublishPost(
      navigation.getParam('blog') as IBlog,
      title,
      content,
      uploadedPostDocuments
    );
  }
}

export default connect(
  (state: any) => ({
    user: state.user.info,
    publishing: state.timeline.publishStatus.publishing,
  }),
  (dispatch: ThunkDispatch<any, any, any>) => ({
    onUploadPostDocuments: async (images: ContentUri[]) => dispatch(uploadAction(FilterId.protected, images)),
    onPublishPost: (blog: IBlog, title: string, content: string, uploadedPostDocuments?: object) => {
      dispatch(publishBlogPostAction(blog, title, content, uploadedPostDocuments));
    },
  })
)(CreatePostPage_Unconnected);