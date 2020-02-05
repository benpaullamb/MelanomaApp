import React, { Component } from 'react';
import { View, StyleSheet, TouchableNativeFeedback, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

export default class DatePicker extends Component {

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
            result = <Text style={style.result}>{this.state.date}</Text>;
        } else {
            result = <Text style={style.placeholder}>Select a date</Text>;
        }

        return (
            <View style={[style.group, this.props.style]}>
                {
                    this.state.showCalendar &&
                    <DateTimePicker mode="date" display="calendar" value={new Date()} onChange={(e, date) => this.setDate(date)} />
                }

                <Text style={style.label}>{this.props.label}</Text>

                <TouchableNativeFeedback onPress={() => this.setState({ showCalendar: true })}>
                    {result}
                </TouchableNativeFeedback>
            </View>
        );
    }

    setDate(date) {
        this.setState({
            date: moment(date).format('DD/MM/YYYY'),
            showCalendar: false
        });
    }
}

const style = StyleSheet.create({
    group: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1
    },

    label: {
        fontSize: 12,
        marginBottom: 4
    },

    result: {
        fontSize: 16
    },

    placeholder: {
        fontSize: 16,
        color: 'lightgray'
    }
});