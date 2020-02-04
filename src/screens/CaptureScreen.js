import React, { Component } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-picker';
import BetterButton from '../components/BetterButton';

export default class CaptureScreen extends Component {

    render() {
        return (
            <View style={style.container}>
                <View style={style.camContainer}>
                    <RNCamera
                        style={{
                            width: this.getCameraDimensions().width,
                            height: this.getCameraDimensions().height
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
                    <BetterButton title="Upload from gallery" onPress={() => this.uploadFromGallery()} style={style.buttonBottom} />
                </View>
            </View>
        );
    }

    async capturePicture() {
        if (!this.camera) return console.log('Camera not ready');

        const data = await this.camera.takePictureAsync();
        console.log('Picture taken', data);

        this.props.navigation.navigate('Analysis', {
            picUri: data.uri
        });
    }

    async uploadFromGallery() {
        ImagePicker.showImagePicker({
            takePhotoButtonTitle: null,
            mediaType: 'photo'

        }, res => {
            if (res.didCancel || res.error) return;

            this.props.navigation.navigate('Analysis', { picUri: res.uri });
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
    }
});