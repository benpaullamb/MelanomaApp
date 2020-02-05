import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import BetterButton from '../components/BetterButton';
import InputGroup from '../components/InputGroup';
import DatePicker from '../components/DatePicker';
import BetterPicker from '../components/BetterPicker';

export default class AnalysisScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            id: null,
            location: 'Back',
            pic: this.props.navigation.getParam('picUri'),
            date: null,
            aiPrediction: Math.random()
        };

        const mole = this.props.navigation.getParam('mole');
        if (mole) {
            this.state = {
                ...this.state,
                id: mole.id,
                location: mole.location
            };
        }

        this.bodyParts = ['Back', 'Front Torso', 'Right Arm', 'Left Arm', 'Right Leg', 'Left Leg', 'Head']
    }

    async componentDidMount() {
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (res !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('The save button will not work');
        }
    }

    render() {
        return (
            <View style={style.container}>
                <Image source={{ uri: this.state.pic }} style={style.image} />

                <View style={style.group}>
                    <Text style={style.colTitle}>AI Prediction</Text>
                    <Text style={style.goodResult}>Benign: 78%</Text>
                    <Text>Melanoma: 22%</Text>
                </View>

                <View style={style.group}>
                    <Text style={style.colTitle}>Details</Text>

                    <InputGroup label="ID" placeholder="Upper back mole 1" onChangeText={text => this.setState({ id: text })} style={style.inputGroup} />

                    <DatePicker label="Date" onDateChange={date => this.setState({ date })} style={style.inputGroup} />

                    <BetterPicker label="Location" items={this.bodyParts} onValueChange={value => this.setState({ location: value })} />
                </View>

                <View style={style.buttons}>
                    <BetterButton title="Save" onPress={() => this.saveData()} />
                </View>
            </View>
        );
    }

    async saveData() {
        if (!this.state.id || !this.state.location || !this.state.date) return console.log('Missing inputs');

        try {
            const mole = {
                id: this.state.id,
                location: this.state.location,
                images: [
                    {
                        uri: this.state.pic,
                        date: this.state.date,
                        aiPrediction: this.state.aiPrediction
                    }
                ]
            };

            console.log(JSON.stringify(mole));

            await AsyncStorage.setItem(mole.id, JSON.stringify(mole));

            this.props.navigation.navigate('MoleList');

        } catch (err) {
            console.log(err);
        }
    }

    // async savePicture() {
    //     if (!this.state.pic) return;
    //     try {
    //         // const res = await CameraRoll.save(this.state.pic, {
    //         //     type: 'photo',
    //         //     album: 'Melanoma App'
    //         // });

    //         const savedImageUri = await CameraRoll.saveToCameraRoll(this.state.pic, 'photo');
    //         this.saveData(savedImageUri);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }

    // To be used elsewhere
    // async getAppPhotos() {
    //     const res = await CameraRoll.getPhotos({
    //         first: 10,
    //         groupTypes: 'Album',
    //         groupName: 'Melanoma App'
    //     });

    //     const photoUris = res.edges.map(edge => {
    //         const image = edge.node.image;
    //         return {
    //             uri: image.uri,
    //             width: image.width,
    //             height: image.height,
    //             filename: image.filename,
    //             timestamp: edge.node.timestamp
    //         };
    //     });
    //     console.log(photoUris);
    // }
}

const style = StyleSheet.create({
    container: {
        padding: 16
    },

    image: {
        width: null,
        height: 200,
        marginBottom: 16
    },

    goodResult: {
        marginBottom: 4,
        color: 'green',
        fontWeight: 'bold'
    },

    group: {
        marginBottom: 16
    },

    colTitle: {
        marginBottom: 8,
        fontSize: 18
    },

    inputGroup: {
        marginBottom: 8
    },

    buttons: {
        alignItems: 'flex-end'
    }
});