import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import MoleListItem from './src/components/MoleListItem';

export default class App extends Component {

	render() {
		return (
			<View style={style.container}>
				<Text style={style.count}>3 moles</Text>
				<ScrollView>
					<MoleListItem />
					<MoleListItem />
					<MoleListItem />
				</ScrollView>
			</View>
		);
	}
}

const style = StyleSheet.create({
	container: {
		padding: 16
	},

	count: {
		marginBottom: 16,
		fontSize: 14
	}
});