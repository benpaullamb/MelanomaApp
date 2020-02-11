import React, { Component } from 'react';
import { Picker } from 'react-native';

import MatInput from './MatInput';

export default class MatPicker extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pickedItem: this.props.pickedItem || this.props.items[0]
        };
    }

    render() {
        const pickerItems = this.props.items.map(item => {
            return <Picker.Item label={item} value={item} key={item} />;
        });

        return (
            <MatInput label={this.props.label} required={this.props.required} style={this.props.style}>
                <Picker selectedValue={this.state.pickedItem} onValueChange={value => this.onValueChange(value)}
                    mode="dropdown">
                    {pickerItems}
                </Picker>
            </MatInput>
        );
    }

    onValueChange(value) {
        this.setState({ pickedItem: value });
        if (this.props.onValueChange) this.props.onValueChange(value);
    }
}