import I18n from "i18n-js";
import React from "react";
import Toast from "react-native-tiny-toast";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { putSignatureAction } from "../actions/signature";
import SignatureModalComponent from "../components/SignatureModal";
import { getSignatureState } from "../state/signature";

type SignatureModalProps = {
  signature: string;
  show: boolean;
  closeModal: () => any;
  putSignature: (signatureData: string, isGlobalSignature: boolean) => any;
  successCallback: () => any;
};

type MoveToFolderModalState = {
  signature: string;
  isGlobalSignature: boolean;
  isUpdated: boolean;
};

class SignatureModal extends React.Component<SignatureModalProps, MoveToFolderModalState> {
  constructor(props) {
    super(props);

    this.state = {
      signature: "",
      isGlobalSignature: false,
      isUpdated: false,
    };
  }

  componentDidUpdate = () => {
    if (!this.state.isUpdated && this.props.signature !== this.state.signature)
      this.setState({ isUpdated: true, signature: this.props.signature });
  };

  setSignature = (text: string) => {
    this.setState({ signature: text });
  };

  setGlobalSignature = (isGlobal: boolean) => {
    this.setState({ isGlobalSignature: isGlobal });
  };

  toggleGlobal = () => {
    const { isGlobalSignature } = this.state;
    this.setState({ isGlobalSignature: !isGlobalSignature });
  };

  confirm = async () => {
    const { putSignature, successCallback } = this.props;
    const { signature, isGlobalSignature } = this.state;
    this.props.closeModal();

    if (!signature) return;
    else {
      try {
        await putSignature(signature, isGlobalSignature);
        Toast.show(I18n.t("zimbra-signature-added"), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });
      } catch (e) {
        Toast.show(I18n.t("zimbra-signature-error"), {
          position: Toast.position.BOTTOM,
        });
      }
    }
    successCallback();
  };

  public render() {
    return (
      <SignatureModalComponent
        {...this.props}
        signature={this.state.signature}
        isGlobalSignature={this.state.isGlobalSignature}
        setSignature={this.setSignature}
        setGlobalSignature={this.setGlobalSignature}
        toggleGlobal={this.toggleGlobal}
        confirm={this.confirm}
      />
    );
  }
}

const mapStateToProps = (state: any) => {
  const { data, isFetching } = getSignatureState(state);
  return {
    signatureMail: data.preference,
    isFetching,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      putSignature: putSignatureAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SignatureModal);
