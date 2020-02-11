import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, PermissionsAndroid, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import MatButton from '../components/MatButton';
import MatTextField from '../components/MatTextField';
import MatDatePicker from '../components/MatDatePicker';
import MatPicker from '../components/MatPicker';
import Utils from '../utils';

export default class AnalysisScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            id: null,
            location: 'Back',
            imageUri: this.props.navigation.getParam('imageUri'),
            date: null,
            aiPrediction: [Math.random(), Math.random()]
        };

        const mole = this.props.navigation.getParam('mole');
        if (mole) {
            this.state = {
                ...this.state,
                id: mole.id,
                location: mole.location
            };
        }
    }

    async componentDidMount() {
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (res !== PermissionsAndroid.RESULTS.GRANTED) {
            ToastAndroid.show('This app requires permission to save images to your phones storage', ToastAndroid.SHORT);
        }
    }

    render() {
        return (
            <View style={style.body}>
                <Image source={{ uri: this.state.imageUri }} style={style.moleImage} />

                <View style={style.section}>
                    <Text style={style.sectionHeading}>AI Prediction</Text>
                    <Text style={style.goodAIPrediction}>Benign: {Utils.toPercentage(this.state.aiPrediction[0])}</Text>
                    <Text>Melanoma: {Utils.toPercentage(this.state.aiPrediction[1])}</Text>
                </View>

                <View style={style.section}>
                    <Text style={style.sectionHeading}>Details</Text>

                    <MatTextField label="ID" text={this.state.id} onChangeText={text => this.setState({ id: text })}
                        required={true} placeholder="Upper back mole 1" style={style.input} />

                    <MatDatePicker label="Date" onDateChange={date => this.setState({ date })}
                        required={true} style={style.input} />

                    <MatPicker label="Location" items={Utils.bodyParts} pickedItem={this.state.location}
                        onValueChange={value => this.setState({ location: value })} required={true} />
                </View>

                <View style={style.footer}>
                    <MatButton title="Save" onPress={() => this.saveData()} />
                </View>
            </View>
        );
    }

    async saveData() {
        if (!this.state.id || !this.state.location || !this.state.date) {
            return ToastAndroid.show('The ID, date, and location fields are required.', ToastAndroid.LONG);
        }

        const mole = this.createMoleFromState();

        try {
            const existingMoleJSON = await AsyncStorage.getItem(mole.id);

            if (existingMoleJSON) {
                this.saveToExistingMole(existingMoleJSON, mole);
            } else {
                await AsyncStorage.setItem(mole.id, JSON.stringify(mole));
            }

            this.props.navigation.navigate('MoleList');

        } catch (err) {
            ToastAndroid.show('Error saving new mole', ToastAndroid.SHORT);
        }
    }

    createMoleFromState() {
        return {
            id: this.state.id,
            location: this.state.location,
            images: [
                {
                    uri: this.state.imageUri,
                    date: this.state.date,
                    aiPrediction: this.state.aiPrediction
                }
            ]
        };
    }

    async saveToExistingMole(existingMoleJSON, mole) {
        const existingMole = JSON.parse(existingMoleJSON);
        existingMole.images.push(mole.images[0]);
        try {
            await AsyncStorage.setItem(existingMole.id, JSON.stringify(existingMole));
        } catch (err) {
            ToastAndroid.show('Error saving to existing mole', ToastAndroid.SHORT);
        }
    }
}

const style = StyleSheet.create({
    body: {
        padding: 16
    },

    moleImage: {
        width: null,
        height: 200,
        marginBottom: 16
    },

    goodAIPrediction: {
        marginBottom: 4,
        color: 'green',
        fontWeight: 'bold'
    },

    section: {
        marginBottom: 16
    },

    sectionHeading: {
        marginBottom: 8,
        fontSize: 18
    },

    input: {
        marginBottom: 8
    },

    footer: {
        alignItems: 'flex-end'
    }
});