import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Picker } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-community/async-storage';

import MoleListItem from '../components/MoleListItem';
import MatButton from '../components/MatButton';
import Utils from '../utils';

export default class MoleListScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loadedMoles: [],
            selectedLocation: Utils.bodyParts[0]
        };

        this.loadData();
    }

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('didFocus', () => {
            this.loadData();
        });
    }

    componentWillUnmount() {
        this.unsubscribe.remove();
    }

    async loadData() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const keyValues = await AsyncStorage.multiGet(keys);

            const moles = keyValues.map(keyValue => JSON.parse(keyValue[1]));
            this.setState({
                loadedMoles: moles
            });
        } catch (err) {
            ToastAndroid.show('Error loading moles', ToastAndroid.SHORT);
        }
    }

    render() {
        const locationPickerItems = Utils.bodyParts.map(bodyPart => {
            return <Picker.Item label={`${bodyPart} (${this.getMoleCount(bodyPart)})`} value={bodyPart} key={bodyPart} />
        });

        return (
            <View style={style.body}>
                <Picker selectedValue={this.state.selectedLocation} onValueChange={value => this.setState({ selectedLocation: value })}
                    mode="dropdown" style={style.locationPicker}>
                    {locationPickerItems}
                </Picker>

                <View style={style.header}>
                    <Text style={style.moleCount}>{this.state.loadedMoles.length} mole{this.state.loadedMoles.length === 1 ? '' : 's'} total</Text>
                    <MatButton title="New Image" onPress={() => this.addNewImage()} />
                </View>

                <ScrollView>
                    {this.getFilteredMoles().map(mole => <MoleListItem mole={mole} key={mole.id} />)}
                </ScrollView>
            </View>
        );
    }

    getMoleCount(bodyPart) {
        if (!bodyPart) return 0;
        let count = 0;
        this.state.loadedMoles.forEach(mole => {
            if (mole.location === bodyPart) count++;
        });
        return count;
    }

    addNewImage() {
        ImagePicker.showImagePicker({
            mediaType: 'photo'
        }, res => {
            if (res.didCancel || res.error) return;

            this.props.navigation.navigate('Analysis', { imageUri: res.uri });
        });
    }

    getFilteredMoles() {
        return this.state.loadedMoles.filter(mole => mole.location === this.state.selectedLocation);
    }
}

const style = StyleSheet.create({
    body: {
        paddingHorizontal: 16,
        paddingBottom: 16
    },

    locationPicker: {
        marginBottom: 8
    },

    header: {
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    moleCount: {
        fontSize: 14
    }
});