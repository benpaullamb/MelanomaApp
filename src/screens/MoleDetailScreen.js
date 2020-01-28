import React, { Component } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import BetterButton from '../components/BetterButton';

export default class MoleDetailScreen extends Component {

    render() {
        return (
            <View style={style.container}>
                <Image source={require('../images/cartoon-mole.jpg')} style={style.image} />

                <View style={style.infoSection}>
                    <Text style={style.title}>Mole 1</Text>
                    <Text style={style.info}>Precise location: Right of the knee</Text>
                    <Text style={style.info}>Latest image: 22/02/2020</Text>
                    <Text style={style.info}>Latest risk score: 15%</Text>
                    <Text style={style.info}>No. images: 2</Text>
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

    deleteMole() {

    }

    analyseNewImage() {

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