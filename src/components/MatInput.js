import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default class MatInput extends Component {

    render() {
        return (
            <View style={[style.container, this.props.style]}>
                <Text style={[style.label, this.props.labelStyle]}>{this.props.label}{this.props.required ? '*' : ''}</Text>

                {this.props.children}
            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1
    },

    label: {
        fontSize: 12
    }
});