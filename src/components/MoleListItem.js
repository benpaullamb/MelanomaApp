import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, TouchableNativeFeedback } from 'react-native';
import { withNavigation } from 'react-navigation';

import Utils from '../utils';

class MoleListItem extends Component {

    render() {
        const latestImage = this.props.mole.images[this.props.mole.images.length - 1];

        return (
            <TouchableNativeFeedback onPress={() => this.viewDetailScreen()}>
                <View style={style.container}>
                    <Image source={{ uri: latestImage.uri }} style={style.moleImage} />

                    <View style={style.section}>
                        <Text style={style.moleId}>{this.props.mole.id}</Text>
                        <Text style={style.moleInfo}>Latest image: {latestImage.date}</Text>
                        <Text style={style.moleInfo}>No. images: {this.props.mole.images.length}</Text>
                    </View>

                    <Text style={style.moleAI}>{Utils.toPercentage(latestImage.aiPrediction[1])}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }

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

export default withNavigation(MoleListItem);