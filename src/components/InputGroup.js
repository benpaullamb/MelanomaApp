import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';

export default class InputGroup extends Component {

    render() {
        return (
            <View style={[style.inputGroup, this.props.style]}>
                <Text style={style.inputLabel}>{this.props.label}</Text>
                <TextInput onChangeText={text => this.onChangeText(text)} placeholder={this.props.placeholder} style={style.input} />
            </View>
        );
    }

    onChangeText(text) {
        if (this.props.onChangeText) this.props.onChangeText(text);
    }
}

const style = StyleSheet.create({
    inputGroup: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomWidth: 1,
        backgroundColor: 'lightgray'
    },

    inputLabel: {
        fontSize: 12
    },

    input: {
        padding: 0,
        fontSize: 16
    }
});