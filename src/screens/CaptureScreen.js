import React, { Component } from 'react';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import { RNCamera } from 'react-native-camera';
import BetterButton from '../components/BetterButton';

export default class CaptureScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            picUri: null
        };
    }

    render() {
        return (
            <View style={style.container}>
                <View style={style.camContainer}>
                    <RNCamera
                        style={{
                            width: 50, // this.getCameraDimensions().width,
                            height: 50 // this.getCameraDimensions().height
                        }}
                        ref={ref => {
                            this.camera = ref;
                        }}
                        androidCameraPermissionOptions={{
                            title: 'Permission to use camera',
                            message: 'We need your permission to use your camera',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                        captureAudio={false}
                    />
                </View>
                <View>
                    <BetterButton title="Capture" onPress={() => this.capturePicture()} style={style.button} />
                    <BetterButton title="Upload from gallery" style={style.buttonBottom} />
                </View>

                <Image source={{ uri: this.state.picUri }} style={style.result} />
            </View>
        );
    }

    async capturePicture() {
        if (!this.camera) return console.log('Camera not ready');

        const data = await this.camera.takePictureAsync();
        console.log('Picture taken', data);
        this.setState({
            picUri: data.uri
        });
    }

    getCameraDimensions() {
        const width = Dimensions.get('window').width - (style.container.padding * 2);
        const height = (width / 3) * 4;
        return {
            width,
            height
        };
    }
}

const style = StyleSheet.create({
    container: {
        padding: 16
    },

    camContainer: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },

    button: {
        marginBottom: 8
    },

    buttonBottom: {
        marginBottom: 16
    },

    result: {
        width: 300,
        height: 300
    }
});