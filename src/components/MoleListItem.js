import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, TouchableNativeFeedback } from 'react-native';
import { withNavigation } from 'react-navigation';

class MoleListItem extends Component {

    render() {
        const mostRecentImage = this.props.mole.images[this.props.mole.images.length - 1];

        return (
            <TouchableNativeFeedback onPress={() => this.viewDetailScreen()}>
                <View style={style.container}>
                    <Image source={{ uri: mostRecentImage.uri }} style={style.image} />

                    <View style={style.infoSection}>
                        <Text style={style.mainText}>{this.props.mole.id}</Text>
                        <Text style={style.secondaryText}>Latest image: {mostRecentImage.date}</Text>
                        <Text style={style.secondaryText}>No. images: {this.props.mole.images.length}</Text>
                    </View>

                    <Text style={style.metaText}>{this.toPercentage(mostRecentImage.aiPrediction)}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }

    viewDetailScreen() {
        this.props.navigation.navigate('MoleDetail', { mole: this.props.mole });
    }

    toPercentage(decimal) {
        return `${(decimal * 100).toFixed(2)}%`
    }
}

const style = StyleSheet.create({
    container: {
        paddingVertical: 16,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray'
    },

    image: {
        width: 64,
        height: 64,
        marginRight: 16
    },

    infoSection: {
        marginRight: 16,
        flexShrink: 1
    },

    mainText: {
        fontSize: 16,
    },

    secondaryText: {
        fontSize: 14,
        color: 'gray',
    },

    metaText: {
        color: 'green'
    }
});

export default withNavigation(MoleListItem);