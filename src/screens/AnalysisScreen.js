// Import React Native
import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, PermissionsAndroid, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

// Import components
import MatButton from '../components/MatButton';
import MatTextField from '../components/MatTextField';
import MatDatePicker from '../components/MatDatePicker';
import MatPicker from '../components/MatPicker';
import Utils from '../utils';

export default class AnalysisScreen extends Component {

    constructor(props) {
        super(props);

        // Initialize any information that is going to be displayed on this page and might change
        this.state = {
            id: null,
            // Default location is 'back' as this is the most common
            location: 'Back',
            // Receives image from previous screen
            imageUri: this.props.navigation.getParam('imageUri'),
            date: null,
            // AI prediction is random until real AI model is exported into this app
            aiPrediction: [Math.random(), Math.random()]
        };

        // If we're given a mole, load that info as we're updating it instead of creating a new one
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
        // Make sure we have the user's permission to save images as we'll be doing that on this screen
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (res !== PermissionsAndroid.RESULTS.GRANTED) {
            ToastAndroid.show('This app requires permission to save images to your phones storage', ToastAndroid.SHORT);
        }
    }

    render() {
        return (
            <View style={style.body}>
                {/* Image of the mole */}
                <Image source={{ uri: this.state.imageUri }} style={style.moleImage} />

                {/* AI prediction results */}
                <View style={style.section}>
                    <Text style={style.sectionHeading}>AI Prediction</Text>
                    <Text style={style.goodAIPrediction}>Benign: {Utils.toPercentage(this.state.aiPrediction[0])}</Text>
                    <Text>Melanoma: {Utils.toPercentage(this.state.aiPrediction[1])}</Text>
                </View>

                {/* Input details for saving */}
                <View style={style.section}>
                    <Text style={style.sectionHeading}>Details</Text>

                    {/* ID */}
                    <MatTextField label="ID" text={this.state.id} onChangeText={text => this.setState({ id: text })}
                        required={true} placeholder="Upper back mole 1" style={style.input} />

                    {/* Date */}
                    <MatDatePicker label="Date" onDateChange={date => this.setState({ date })}
                        required={true} style={style.input} />

                    {/* Location */}
                    <MatPicker label="Location" items={Utils.bodyParts} pickedItem={this.state.location}
                        onValueChange={value => this.setState({ location: value })} required={true} />
                </View>

                {/* Save button */}
                <View style={style.footer}>
                    <MatButton title="Save" onPress={() => this.saveData()} />
                </View>
            </View>
        );
    }

    // Saves the inputted data to the local storage and returns to the home screen
    async saveData() {
        // If we're missing any information, don't save
        if (!this.state.id || !this.state.location || !this.state.date) {
            return ToastAndroid.show('The ID, date, and location fields are required.', ToastAndroid.LONG);
        }

        const mole = this.createMoleFromState();

        try {
            // Check if this mole already exists under this ID
            const existingMoleJSON = await AsyncStorage.getItem(mole.id);

            if (existingMoleJSON) {
                // Just updates the mole by adding the new image if it does
                this.saveToExistingMole(existingMoleJSON, mole);
            } else {
                // Otherwise it's saved under its ID
                await AsyncStorage.setItem(mole.id, JSON.stringify(mole));
            }

            // Go back to the home screen
            this.props.navigation.navigate('MoleList');

        } catch (err) {
            ToastAndroid.show('Error saving new mole', ToastAndroid.SHORT);
        }
    }

    // Stores this screens state in a formatted object 
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

    // Adds an image from a new mole to an existing moles JSON and saves it in local storage
    async saveToExistingMole(existingMoleJSON, mole) {
        // Converts JSON to object
        const existingMole = JSON.parse(existingMoleJSON);
        // Adds the new image
        existingMole.images.push(mole.images[0]);
        // Tries to save it in local storage with the existing ones ID
        try {
            await AsyncStorage.setItem(existingMole.id, JSON.stringify(existingMole));
        } catch (err) {
            ToastAndroid.show('Error saving to existing mole', ToastAndroid.SHORT);
        }
    }
}

// Define the style
const style = StyleSheet.create({
    body: {
        padding: 16
    },

    moleImage: {
        // Null lets the image fill the available width
        width: null,
        height: 200,
        marginBottom: 16
    },

    // Uses flex box
    footer: {
        alignItems: 'flex-end'
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
    }
});