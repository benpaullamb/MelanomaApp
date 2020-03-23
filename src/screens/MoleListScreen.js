// Import React Native
import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Picker } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-community/async-storage';

// Import components
import MoleListItem from '../components/MoleListItem';
import MatButton from '../components/MatButton';
import Utils from '../utils';

export default class MoleListScreen extends Component {

    constructor(props) {
        super(props);

        // Initialize any information that is going to be displayed on this page and might change
        this.state = {
            loadedMoles: [],
            // Default location is 'back' as this is the most common
            selectedLocation: Utils.bodyParts[0]
        };

        // Asynchronous data loads can't be done directly in the constructor
        this.loadData();
    }

    componentDidMount() {
        // Re-loads the data if the user comes back to this screen to display any changed moles
        this.unsubscribe = this.props.navigation.addListener('didFocus', () => {
            this.loadData();
        });
    }

    componentWillUnmount() {
        // Have to unsubscribe for memory reasons
        this.unsubscribe.remove();
    }

    // Loads all moles saved in local storage
    async loadData() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const keyValues = await AsyncStorage.multiGet(keys);

            const moles = keyValues.map(keyValue => JSON.parse(keyValue[1]));
            this.setState({
                loadedMoles: moles
            });
        } catch (err) {
            // If there was an error in any of this, show the user with a toast
            ToastAndroid.show('Error loading moles', ToastAndroid.SHORT);
        }
    }

    render() {
        // Drop down items generated from list of body parts in a common utility file
        const locationPickerItems = Utils.bodyParts.map(bodyPart => {
            return <Picker.Item label={`${bodyPart} (${this.getMoleCount(bodyPart)})`} value={bodyPart} key={bodyPart} />
        });

        return (
            <View style={style.body}>
                {/* Location drop down */}
                <Picker selectedValue={this.state.selectedLocation} onValueChange={value => this.setState({ selectedLocation: value })}
                    mode="dropdown" style={style.locationPicker}>
                    {locationPickerItems}
                </Picker>

                {/* Total mole count and new image button */}
                <View style={style.header}>
                    <Text style={style.moleCount}>{this.state.loadedMoles.length} mole{this.state.loadedMoles.length === 1 ? '' : 's'} total</Text>
                    <MatButton title="New Image" onPress={() => this.addNewImage()} />
                </View>

                {/* List of all moles filtered by location */}
                <ScrollView>
                    {this.getFilteredMoles().map(mole => <MoleListItem mole={mole} key={mole.id} />)}
                </ScrollView>
            </View>
        );
    }

    // Returns the number of moles on a given body part
    getMoleCount(bodyPart) {
        if (!bodyPart) return 0;
        let count = 0;
        this.state.loadedMoles.forEach(mole => {
            if (mole.location === bodyPart) count++;
        });
        return count;
    }

    // Loads the third party image picker and sends the result to the analysis screen
    addNewImage() {
        ImagePicker.showImagePicker({
            mediaType: 'photo'
        }, res => {
            if (res.didCancel || res.error) return;

            this.props.navigation.navigate('Analysis', { imageUri: res.uri });
        });
    }

    // Filters the moles
    getFilteredMoles() {
        return this.state.loadedMoles.filter(mole => mole.location === this.state.selectedLocation);
    }
}

// Define the style
const style = StyleSheet.create({
    body: {
        paddingHorizontal: 16,
        paddingBottom: 16
    },

    locationPicker: {
        marginBottom: 8
    },

    // Uses flex box
    header: {
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    moleCount: {
        fontSize: 14
    }
});