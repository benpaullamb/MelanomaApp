import React, { Component } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import BetterButton from '../components/BetterButton';

export default class MoleDetailScreen extends Component {

    render() {
        const mole = this.props.navigation.getParam('mole');
        const mostRecentImage = mole.images[mole.images.length - 1];

        return (
            <View style={style.container}>
                <Image source={{ uri: mostRecentImage.uri }} style={style.image} />

                <View style={style.infoSection}>
                    <Text style={style.title}>{mole.id}</Text>
                    <Text style={style.info}>Location: {mole.location}</Text>
                    <Text style={style.info}>Latest image: {mostRecentImage.date}</Text>
                    <Text style={style.info}>Latest risk score: {this.toPercentage(mostRecentImage.aiPrediction)}</Text>
                    <Text style={style.info}>No. images: {mole.images.length}</Text>
                </View>

                <View style={style.buttons}>
                    <BetterButton title="Delete" onPress={() => this.deleteMole()} style={style.button} />
                    <BetterButton title="New Image" onPress={() => this.analyseNewImage()} style={style.button} />
                    <BetterButton title="Save" onPress={() => this.saveInfo()} style={style.lastButton} />
                </View>

                <BetterButton title="Compare Over Time" onPress={() => this.compareOverTime()} />
            </View>
        );
    }

    toPercentage(decimal) {
        return `${(decimal * 100).toFixed(2)}%`
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
        marginRight: 8,
        flex: 1
    },

    lastButton: {
        flex: 1
    }
});