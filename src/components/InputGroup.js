import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';

export default class InputGroup extends Component {

    render() {
        return (
            <View style={[style.group, this.props.style]}>
                <Text style={style.label}>{this.props.label}</Text>
                <TextInput onChangeText={text => this.onChangeText(text)} placeholder={this.props.placeholder} placeholderTextColor="lightgray" style={style.input} />
            </View>
        );
    }

    onChangeText(text) {
        if (this.props.onChangeText) this.props.onChangeText(text);
    }
}

const style = StyleSheet.create({
    group: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1
    },

    label: {
        fontSize: 12
    },

    input: {
        padding: 0,
        fontSize: 16
    }
});