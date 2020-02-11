import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, ToastAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import BetterButton from '../components/BetterButton';

export default class MoleDetailScreen extends Component {

    render() {
        const mole = this.props.navigation.getParam('mole');
        console.log('Loaded mole', mole);
        const mostRecentImage = mole.images[mole.images.length - 1];

        return (
            <View style={style.container}>
                <Image source={{ uri: mostRecentImage.uri }} style={style.image} />

                <View style={style.infoSection}>
                    <Text style={style.title}>{mole.id}</Text>
                    <Text style={style.info}>Location: {mole.location}</Text>
                    <Text style={style.info}>Latest image: {mostRecentImage.date}</Text>
                    <Text style={style.info}>Chance of Melanoma (latest): {this.toPercentage(mostRecentImage.aiPrediction)}</Text>
                    <Text style={style.info}>No. images: {mole.images.length}</Text>
                </View>

                <BetterButton title="New Image" onPress={() => this.analyseNewImage()} style={style.button} />
                <BetterButton title="Compare Over Time" onPress={() => this.compareOverTime()} style={style.button} />
                <BetterButton title="Delete" onPress={() => this.requestDelete()} style={style.button} />
            </View>
        );
    }

    toPercentage(decimal) {
        return `${(decimal * 100).toFixed(2)}%`
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
            const mole = this.props.navigation.getParam('mole');
            await AsyncStorage.removeItem(mole.id);
            this.props.navigation.navigate('MoleList');
        } catch (err) {
            console.log(err);
        }
    }

    analyseNewImage() {
        ImagePicker.showImagePicker({
            mediaType: 'photo'
        }, res => {
            if (res.didCancel || res.error) return;

            const mole = this.props.navigation.getParam('mole');

            this.props.navigation.navigate('Analysis', { picUri: res.uri, mole });
        });
    }

    saveInfo() {

    }

    compareOverTime() {
        ToastAndroid.show('Sorry, this feature is not implemented yet.', ToastAndroid.LONG);
    }
}

const style = StyleSheet.create({
    container: {
        padding: 16
    },

    image: {
        height: 200,
        width: null,
        marginBottom: 16
    },

    infoSection: {
        marginBottom: 16
    },

    title: {
        marginBottom: 8,
        fontSize: 20
    },

    info: {
        fontSize: 16
    },

    buttons: {
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    button: {
        marginBottom: 16
    },

    lastButton: {
        flex: 1
    }
});