import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, TouchableNativeFeedback } from 'react-native';
import { withNavigation } from 'react-navigation';

class MoleListItem extends Component {

    render() {
        return (
            <TouchableNativeFeedback onPress={() => this.viewDetailScreen()}>
                <View style={style.container}>
                    <Image source={require('../images/cartoon-mole.jpg')} style={style.image} />

                    <View style={style.infoSection}>
                        <Text style={style.mainText}>Mole 1</Text>
                        <Text style={style.secondaryText}>Precise location: right of the knee</Text>
                        <Text style={style.secondaryText}>Latest image: 22/02/2020</Text>
                    </View>

                    <Text style={style.metaText}>15%</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }

    viewDetailScreen() {
        this.props.navigation.navigate('MoleDetail');
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