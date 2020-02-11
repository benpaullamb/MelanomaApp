import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';

export default class InputGroup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: props.text || ''
        };
    }

    render() {
        return (
            <View style={[style.group, this.props.style]}>
                <Text style={style.label}>{this.props.label}{this.props.required ? '*' : ''}</Text>
                <TextInput value={this.state.text} onChangeText={text => this.onChangeText(text)}
                    placeholder={this.props.placeholder} placeholderTextColor="lightgray" style={style.input} />
            </View>
        );
    }

    onChangeText(text) {
        this.setState({
            text
        });
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