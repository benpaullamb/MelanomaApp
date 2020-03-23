import React, { Component } from 'react';
import { View, StyleSheet, TouchableNativeFeedback, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import MatInput from './MatInput';

export default class MatDatePicker extends Component {

    constructor(props) {
        super(props);

        // The date might change so it's stored in state
        this.state = {
            showCalendar: false,
            date: null
        };
    }

    render() {
        // Show "select a date" or the date if they already have
        let result;
        if (this.state.date) {
            result = <Text style={style.date}>{this.state.date}</Text>;
        } else {
            result = <Text style={style.placeholder}>Select a date</Text>;
        }

        return (
            // Wrapped in a styled input component
            <MatInput label={this.props.label} required={this.props.required} style={this.props.style} labelStyle={style.label}>
                {
                    // The calendar, only shown if it's enabled
                    this.state.showCalendar &&
                    <DateTimePicker mode="date" display="calendar" value={new Date()} onChange={(e, date) => this.setDate(date)} />
                }

                {/* A touchable region surrounding the date that shows the calender */}
                <TouchableNativeFeedback onPress={() => this.setState({ showCalendar: true })}>
                    {result}
                </TouchableNativeFeedback>
            </MatInput>
        );
    }

    // Formats the date using Moment before doing anything with it
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