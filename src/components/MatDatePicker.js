import React, { Component } from 'react';
import { View, StyleSheet, TouchableNativeFeedback, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import MatInput from './MatInput';

export default class MatDatePicker extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showCalendar: false,
            date: null
        };
    }

    render() {
        let result;
        if (this.state.date) {
            result = <Text style={style.date}>{this.state.date}</Text>;
        } else {
            result = <Text style={style.placeholder}>Select a date</Text>;
        }

        return (
            <MatInput label={this.props.label} required={this.props.required} style={this.props.style} labelStyle={style.label}>
                {
                    this.state.showCalendar &&
                    <DateTimePicker mode="date" display="calendar" value={new Date()} onChange={(e, date) => this.setDate(date)} />
                }

                <TouchableNativeFeedback onPress={() => this.setState({ showCalendar: true })}>
                    {result}
                </TouchableNativeFeedback>
            </MatInput>
        );
    }

    setDate(date) {
        const formattedDate = moment(date).format('DD/MM/YYYY');

        this.setState({
            date: formattedDate,
            showCalendar: false
        });

        if (this.props.onDateChange) this.props.onDateChange(formattedDate);
    }
}

const style = StyleSheet.create({
    label: {
        fontSize: 12,
        marginBottom: 4
    },

    date: {
        fontSize: 16
    },

    placeholder: {
        fontSize: 16,
        color: 'lightgray'
    }
});