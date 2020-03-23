import React, { Component } from 'react';
import 'react-native-gesture-handler';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

// Import the screens
import MoleListScreen from './src/screens/MoleListScreen';
import MoleDetailScreen from './src/screens/MoleDetailScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';

// Link them to a navigator, each with a title to display at the top
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
	// Home page
	initialRouteName: 'MoleList'
});

// Wrap the navigator in an app
const AppContainer = createAppContainer(AppNavigator);

// Display the app
export default class App extends Component {

	render() {
		return <AppContainer />;
	}
}