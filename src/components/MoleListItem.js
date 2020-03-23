import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, TouchableNativeFeedback } from 'react-native';
import { withNavigation } from 'react-navigation';

import Utils from '../utils';

// A complex item extracted into its own component
// Used for each item in the list on the home screen
class MoleListItem extends Component {

    render() {
        // Displays the latest image 
        const latestImage = this.props.mole.images[this.props.mole.images.length - 1];

        return (
            // All wrapped in a touchable region
            <TouchableNativeFeedback onPress={() => this.viewDetailScreen()}>
                <View style={style.container}>
                    {/* Image of the mole */}
                    <Image source={{ uri: latestImage.uri }} style={style.moleImage} />

                    {/* Basic text info about it */}
                    <View style={style.section}>
                        <Text style={style.moleId}>{this.props.mole.id}</Text>
                        <Text style={style.moleInfo}>Latest image: {latestImage.date}</Text>
                        <Text style={style.moleInfo}>No. images: {this.props.mole.images.length}</Text>
                    </View>

                    {/* It's benign rating as a % */}
                    <Text style={style.moleAI}>{Utils.toPercentage(latestImage.aiPrediction[1])}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }

    // Goes to the full detail screen about this mole
    viewDetailScreen() {
        this.props.navigation.navigate('MoleDetail', { mole: this.props.mole });
    }
}

const style = StyleSheet.create({
    container: {
        paddingVertical: 16,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray'
    },

    moleImage: {
        width: 64,
        height: 64,
        marginRight: 16
    },

    section: {
        marginRight: 16,
        flexShrink: 1
    },

    moleId: {
        fontSize: 16,
    },

    moleInfo: {
        fontSize: 14,
        color: 'gray',
    },

    moleAI: {
        color: 'green'
    }
});

// Wrapping the component, by passing it through this third party function first,
// allows us to access the navigation system from inside this component (normally only whole screens can)
// So we can access data passed to this
export default withNavigation(MoleListItem);