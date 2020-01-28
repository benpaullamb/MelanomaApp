import React, { Component } from 'react';
import 'react-native-gesture-handler';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import MoleListScreen from './src/screens/MoleListScreen';
import MoleDetailScreen from './src/screens/MoleDetailScreen';

const AppNavigator = createStackNavigator({
	MoleList: {
		screen: MoleListScreen,
		navigationOptions: {
			title: 'My Moles: Right Leg'
		}
	},

	MoleDetail: {
		screen: MoleDetailScreen,
		navigationOptions: {
			title: 'My Mole: Mole 1'
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