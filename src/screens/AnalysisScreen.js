import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, PermissionsAndroid } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import BetterButton from '../components/BetterButton';
import InputGroup from '../components/InputGroup';
import DatePicker from '../components/DatePicker';
import BetterPicker from '../components/Picker';

export default class AnalysisScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pic: this.props.navigation.getParam('picUri'),
            bodyParts: ['Back', 'Front Torso', 'Right Arm', 'Left Arm', 'Right Leg', 'Left Leg', 'Head']
        };
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

                    <InputGroup label="ID" placeholder="Shoulder mole 1" style={style.inputGroup} />

                    <DatePicker label="Date" style={style.inputGroup} />

                    <BetterPicker items={this.state.bodyParts} label="Location" />
                </View>

                <View style={style.buttons}>
                    <BetterButton title="Save" onPress={() => this.savePicture()} />
                </View>
            </View>
        );
    }

    async savePicture() {
        if (!this.state.pic) return;
        try {
            const res = await CameraRoll.save(this.state.pic, {
                type: 'photo',
                album: 'Melanoma App'
            });
            console.log(res);
        } catch (err) {
            console.log(err);
        }
    }

    // To be used elsewhere
    async getAppPhotos() {
        const res = await CameraRoll.getPhotos({
            first: 10,
            groupTypes: 'Album',
            groupName: 'Melanoma App'
        });

        const photoUris = res.edges.map(edge => {
            const image = edge.node.image;
            return {
                uri: image.uri,
                width: image.width,
                height: image.height,
                filename: image.filename,
                timestamp: edge.node.timestamp
            };
        });
        console.log(photoUris);
    }
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