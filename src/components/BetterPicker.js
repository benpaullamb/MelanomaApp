import React, { Component } from 'react';
import { View, StyleSheet, Text, Picker } from 'react-native';

export default class BetterPicker extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pickedItem: this.props.items[0]
        };
    }

    render() {
        const items = this.props.items.map(item => {
            return <Picker.Item label={item} value={item} key={item} />;
        });

        return (
            <View style={[style.group, this.props.style]}>
                <Text style={style.label}>{this.props.label}</Text>

                <Picker selectedValue={this.state.pickedItem} mode="dropdown" onValueChange={value => this.onValueChange(value)}>
                    {items}
                </Picker>
            </View>
        );
    }

    onValueChange(value) {
        this.setState({ pickedItem: value });

        if (this.props.onValueChange) this.props.onValueChange(value);
    }
}

const style = StyleSheet.create({
    group: {
        paddingHorizontal: 12,
        paddingTop: 8,
        borderBottomWidth: 1
    },

    label: {
        fontSize: 12
    }
});