// Import React Native
import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, ToastAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';

// Import components
import MatButton from '../components/MatButton';
import Utils from '../utils';

export default class MoleDetailScreen extends Component {

    constructor(props) {
        super(props);

        // Loads the mole selected from the list on the previous screen
        this.state = {
            mole: this.props.navigation.getParam('mole')
        };
    }

    render() {
        // Displays the latest image 
        const latestImage = this.state.mole.images[this.state.mole.images.length - 1];

        return (
            <View style={style.body}>
                {/* Image of the mole */}
                <Image source={{ uri: latestImage.uri }} style={style.moleImage} />

                {/* All mole text info */}
                <View style={style.main}>
                    <Text style={style.moleId}>{this.state.mole.id}</Text>
                    <Text style={style.moleInfo}>Chance of Melanoma (latest): {Utils.toPercentage(latestImage.aiPrediction[1])}</Text>
                    <Text style={style.moleInfo}>Latest image: {latestImage.date}</Text>
                    <Text style={style.moleInfo}>Location: {this.state.mole.location}</Text>
                    <Text style={style.moleInfo}>No. images: {this.state.mole.images.length}</Text>
                </View>

                {/* Buttons to add new images and delete this mole (comparing not yet implemented) */}
                <MatButton title="New Image" onPress={() => this.analyseNewImage()} style={style.button} />
                <MatButton title="Compare Over Time" onPress={() => this.compareOverTime()} style={style.button} />
                <MatButton title="Delete" onPress={() => this.requestDelete()} style={style.button} />
            </View>
        );
    }

    // Delete wrapper that double checks with the user first
    requestDelete() {
        Alert.alert('Delete Mole', 'Are you sure you want to delete this mole?', [
            {
                text: 'Cancel'
            },
            {
                text: 'OK',
                onPress: () => this.deleteMole()
            }
        ]);
    }

    // Deletes this mole from local storage and returns to the home screen
    async deleteMole() {
        try {
            await AsyncStorage.removeItem(this.state.mole.id);
            this.props.navigation.navigate('MoleList');
        } catch (err) {
            ToastAndroid.show('Error deleting mole', ToastAndroid.SHORT);
        }
    }

    // Loads the third party image picker and sends the result to the analysis screen
    // (along with the existing mole data so they may be connected in storage)
    analyseNewImage() {
        ImagePicker.showImagePicker({
            mediaType: 'photo'
        }, res => {
            if (res.didCancel || res.error) return;

            this.props.navigation.navigate('Analysis', { imageUri: res.uri, mole: this.state.mole });
        });
    }

    compareOverTime() {
        ToastAndroid.show('Sorry, this feature is not implemented yet.', ToastAndroid.LONG);
    }
}

// Define the style
const style = StyleSheet.create({
    body: {
        padding: 16
    },

    moleImage: {
        height: 200,
        // Null lets the image fill the available width
        width: null,
        marginBottom: 16
    },

    main: {
        marginBottom: 16
    },

    moleId: {
        marginBottom: 8,
        fontSize: 20
    },

    moleInfo: {
        fontSize: 16
    },

    button: {
        marginBottom: 16
    }
});