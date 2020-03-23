import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableNativeFeedback } from 'react-native';

export default class MatButton extends Component {

    render() {
        return (
            // Touchable Native has ripple effects on Android
            <TouchableNativeFeedback onPress={() => this.onPress()}>
                {/* Can inherit styles given to this component */}
                <View style={[style.button, this.props.style]}>
                    <Text style={style.text}>{this.props.title}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }

    // Calls any supplied listener when pressed
    onPress() {
        if (this.props.onPress) this.props.onPress();
    }
}

// Styled to match the material design
const style = StyleSheet.create({
    button: {
        height: 36,
        minWidth: 64,
        paddingHorizontal: 16,
        // Creates a box shadow that makes it look like it's floating
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