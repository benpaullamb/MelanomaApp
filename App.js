import React, { Component } from 'react';
import 'react-native-gesture-handler';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import CaptureScreen from './src/screens/CaptureScreen';
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
	},

	Capture: {
		screen: CaptureScreen,
		navigationOptions: {
			title: 'Capture a New Image'
		}
	}
}, {
	initialRouteName: 'Capture'
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {

	render() {
		return <AppContainer />;
	}
}