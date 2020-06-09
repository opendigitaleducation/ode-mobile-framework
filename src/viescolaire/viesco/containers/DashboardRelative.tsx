import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import DashboardComponent from "../components/DashboardRelative";

class Dashboard extends React.PureComponent<any> {
  // public componentDidMount() {
  //   this.props.getChildrenList();
  //   this.props.getHomeworks();
  //   this.props.getLastEval();
  // }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  // const children = state.children;
  // const homeworks = state.homeworks;
  // const lastEval = state.devoirs;

  const homeworks = [
    { subject: "Mathématiques", type: "Controle", completed: true },
    { subject: "Science de la Vie & De La Terre ", type: "Exercice Maison", completed: false },
  ];
  const evaluations = [
    { subject: "Mathématiques", date: "23/03/2020", note: "15/20" },
    { subject: "Histoire-Géographie", date: "25/03/2020", note: "10/20" },
    { subject: "Mathématiques", date: "18/03/2020", note: "11/20" },
  ];
  const children = [
    { displayName: "Thiméo ABABAB", id: "totoatat" },
    { displayName: "Timoté KEBAB", id: "hehehehe" },
    { displayName: "Karen CHIANTE", id: "ahhahahhahaha" },
  ];

  return {
    children,
    homeworks,
    evaluations,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  // return bindActionCreators({ getChildrenList, getHomeworks, getLastEval }, dispatch);
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps)(Dashboard);