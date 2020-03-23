import React, { Component } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import MatInput from './MatInput';

export default class MatTextField extends Component {

    constructor(props) {
        super(props);
        // Displays the given text or '' if none is supplied
        this.state = {
            text: props.text || ''
        };
    }

    render() {
        return (
            // Wrapped in a styled input component
            <MatInput label={this.props.label} required={this.props.required} style={this.props.style}>
                <TextInput value={this.state.text} onChangeText={text => this.onChangeText(text)}
                    placeholder={this.props.placeholder} placeholderTextColor="lightgray" style={style.input} />
            </MatInput>

        );
    }

    // Calls any supplied listener when changed
    onChangeText(text) {
        this.setState({ text });
        if (this.props.onChangeText) this.props.onChangeText(text);
    }
}

const style = StyleSheet.create({
    input: {
        padding: 0,
        fontSize: 16
    }
});