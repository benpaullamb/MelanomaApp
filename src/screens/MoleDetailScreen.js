import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, ToastAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';

import MatButton from '../components/MatButton';
import Utils from '../utils';

export default class MoleDetailScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            mole: this.props.navigation.getParam('mole')
        };
    }

    render() {
        const latestImage = this.state.mole.images[this.state.mole.images.length - 1];

        return (
            <View style={style.body}>
                <Image source={{ uri: latestImage.uri }} style={style.moleImage} />

                <View style={style.main}>
                    <Text style={style.moleId}>{this.state.mole.id}</Text>
                    <Text style={style.moleInfo}>Chance of Melanoma (latest): {Utils.toPercentage(latestImage.aiPrediction[1])}</Text>
                    <Text style={style.moleInfo}>Latest image: {latestImage.date}</Text>
                    <Text style={style.moleInfo}>Location: {this.state.mole.location}</Text>
                    <Text style={style.moleInfo}>No. images: {this.state.mole.images.length}</Text>
                </View>

                <MatButton title="New Image" onPress={() => this.analyseNewImage()} style={style.button} />
                <MatButton title="Compare Over Time" onPress={() => this.compareOverTime()} style={style.button} />
                <MatButton title="Delete" onPress={() => this.requestDelete()} style={style.button} />
            </View>
        );
    }

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

    async deleteMole() {
        try {
            await AsyncStorage.removeItem(this.state.mole.id);
            this.props.navigation.navigate('MoleList');
        } catch (err) {
            ToastAndroid.show('Error deleting mole', ToastAndroid.SHORT);
        }
    }

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

const style = StyleSheet.create({
    body: {
        padding: 16
    },

    moleImage: {
        height: 200,
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