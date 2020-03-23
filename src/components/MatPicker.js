import React, { Component } from 'react';
import { Picker } from 'react-native';

import MatInput from './MatInput';

// Drop down input
export default class MatPicker extends Component {

    constructor(props) {
        super(props);
        // Displays the given item or the first item if none is supplied
        this.state = {
            pickedItem: this.props.pickedItem || this.props.items[0]
        };
    }

    render() {
        // Drop down items generated from list supplied to this component
        const pickerItems = this.props.items.map(item => {
            return <Picker.Item label={item} value={item} key={item} />;
        });

        return (
            // Wrapped in a styled input component
            <MatInput label={this.props.label} required={this.props.required} style={this.props.style}>
                <Picker selectedValue={this.state.pickedItem} onValueChange={value => this.onValueChange(value)}
                    mode="dropdown">
                    {pickerItems}
                </Picker>
            </MatInput>
        );
    }

    // Calls any supplied listener when changed
    onValueChange(value) {
        this.setState({ pickedItem: value });
        if (this.props.onValueChange) this.props.onValueChange(value);
    }
}