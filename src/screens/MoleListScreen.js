import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Picker } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-community/async-storage';
import MoleListItem from '../components/MoleListItem';
import BetterButton from '../components/BetterButton';

export default class MoleListScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            moles: []
        };

        this.bodyParts = ['Back', 'Front Torso', 'Right Arm', 'Left Arm', 'Right Leg', 'Left Leg', 'Head']
    }

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('didFocus', () => {
            this.loadData();
        });
        // this.clearData();
    }

    componentWillUnmount() {
        this.unsubscribe.remove();
    }

    async clearData() {
        try {
            await AsyncStorage.clear();
        } catch (err) {
            console.log(err);
        }
    }

    async loadData() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const keyValues = await AsyncStorage.multiGet(keys);

            const moles = keyValues.map(keyValue => JSON.parse(keyValue[1]));
            this.setState({
                moles
            });
        } catch (err) {

        }
    }

    render() {
        const bodyPartItems = this.bodyParts.map(bodyPart => {
            return <Picker.Item label={bodyPart} value={bodyPart} key={bodyPart} />
        });

        return (
            <View style={style.container}>
                <Picker mode="dropdown" style={style.picker}>
                    {bodyPartItems}
                </Picker>

                <View style={style.top}>
                    <Text style={style.count}>{this.state.moles.length} moles</Text>
                    <BetterButton title="New Image" onPress={() => this.addNewImage()} />
                </View>

                <ScrollView>
                    {this.state.moles.map(mole => <MoleListItem mole={mole} key={mole.id} />)}
                </ScrollView>
            </View>
        );
    }

    addNewImage() {
        ImagePicker.showImagePicker({
            mediaType: 'photo'
        }, res => {
            if (res.didCancel || res.error) return;

            this.props.navigation.navigate('Analysis', { picUri: res.uri });
        });
    }
}

const style = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 16
    },

    picker: {
        marginBottom: 8
    },

    top: {
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    count: {
        fontSize: 14
    }
});