import React, { Component } from 'react';
import 'react-native-gesture-handler';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import MoleListScreen from './src/screens/MoleListScreen';
import MoleDetailScreen from './src/screens/MoleDetailScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';

const AppNavigator = createStackNavigator({
	MoleList: {
		screen: MoleListScreen,
		navigationOptions: {
			title: 'My Moles'
		}
	},

	MoleDetail: {
		screen: MoleDetailScreen,
		navigationOptions: {
			title: 'Mole Details'
		}
	},

	Analysis: {
		screen: AnalysisScreen,
		navigationOptions: {
			title: 'Mole Analysis'
		}
	}
}, {
	initialRouteName: 'MoleList'
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {

	render() {
		return <AppContainer />;
	}
}