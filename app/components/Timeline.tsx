import * as React from "react";
import { ListView, View } from "react-native";
import { Portal } from "./Portal";
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { navOptions } from "../styles/StyleConf";
import { MediaLibrary } from "../../entcore/workspace";

export class Timeline extends React.Component<{ navigation: any }, { dataSource: any }> {
    dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    static navigationOptions = () => {
        return navOptions('Nouveautés', { 
        headerLeft: <Icon name="mail-outline" size={ 30 } />,
        headerRight: <Icon name="mail-outline" size={ 30 } />
    })};

    constructor(props){
        super(props);
        this.state = {
            dataSource: this.dataSource.cloneWithRows([])
        };
        this.start();
    }

    async start(){
        await MediaLibrary.sharedDocuments.sync();
        console.log(MediaLibrary.sharedDocuments.documents.all.map(d => d.myRights));
    }

    loadNext(){}

    render(){
        return (
            <Portal navigation={ this.props.navigation }>
                <ListView
                    dataSource={ this.state.dataSource }
                    renderRow={ (thread) => (
                        <View>
                        </View>
                        
                    )}
                    onEndReached={ () => this.loadNext() }
                />
            </Portal>
        )
    }
}