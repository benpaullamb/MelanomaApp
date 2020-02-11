import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableNativeFeedback } from 'react-native';

export default class MatButton extends Component {

    render() {
        return (
            <TouchableNativeFeedback onPress={() => this.onPress()}>
                <View style={[style.button, this.props.style]}>
                    <Text style={style.text}>{this.props.title}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }

    onPress() {
        if (this.props.onPress) this.props.onPress();
    }
}

const style = StyleSheet.create({
    button: {
        height: 36,
        minWidth: 64,
        paddingHorizontal: 16,
        elevation: 2,
        borderRadius: 4,
        justifyContent: 'center',
        backgroundColor: '#4fc3f7'
    },

    text: {
        textAlign: 'center',
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase'
    }
});