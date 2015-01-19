"use strict";

var React = require('react');

var CalendarControl = React.createClass({
	downHandler: function(event) {
		this.props.onChange(this.props.number - 1);
	},
	upHandler: function(event) {
		this.props.onChange(this.props.number + 1);
	},
	render: function() {
		return (
			<div className="CalendarControl">
				<div className="Clickable" onClick={this.downHandler}>&lt;</div>
				<div>{this.props.number}</div>
				<div className="Clickable" onClick={this.upHandler}>&gt;</div>
			</div>
		);
	}
});

var WeekdayNames = React.createClass({
	render: function() {
		var weeknames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
		var tableHeaderCells = weeknames.concat(weeknames).slice(this.props.firstDayOfWeek, this.props.firstDayOfWeek + 7).map(function(dayName) {
			return (
				<th key={dayName}>{dayName}</th>
			);
		});
		return (
			<thead>
				<tr>
					{tableHeaderCells}
				</tr>
			</thead>
		);
	}
});

var Monthdays = React.createClass({
	paddedDatesByWeek: function(year, month, firstDayOfWeek) {
		var weeks = [];
		var week = [];
		var date = new Date(year, month, 1, 0, 0, 0, 0);
		var lastDayOfMonthDate = new Date(year, month + 1, 0, 0, 0, 0, 0);
		var dayOfMonth = 1 - ((7 + date.getDay() - firstDayOfWeek) % 7);
		while (date <= lastDayOfMonthDate || date.getDay() !== firstDayOfWeek) {
			date = new Date(year, month, dayOfMonth++, 0, 0, 0, 0);
			week.push(date);
			if (week.length === 7) {
				weeks.push(week);
				week = [];
			}
		}
		return weeks;
	},
	classNameForDate: function(date) {
		var month = date.getMonth();
		var year = date.getFullYear();
		if (this.props.date && year == this.props.date.getFullYear() && month == this.props.date.getMonth() && date.getDate() == this.props.date.getDate()) {
			return 'Selected';
		} else if (month == this.props.month) {
			return 'Clickable';
		} else {
			return 'Other';
		}
	},
	getInitialState: function() {
		return {weeks: this.paddedDatesByWeek(this.props.year, this.props.month, this.props.firstDayOfWeek)};
	},
	selectHandler: function(event) {
		if (event.target.className == 'Clickable') {
			var date = new Date(parseInt(event.target.getAttribute('data-date')));
			this.props.onSelect(date);
		}
	},
	render: function() {
		var rows = this.state.weeks.map(function(weekdayDates) {
			var row = weekdayDates.map(function(weekdayDate) {
				return (
					<td data-date={weekdayDate.getTime()} key={weekdayDate.getTime()} className={this.classNameForDate(weekdayDate)}>{weekdayDate.getDate()}</td>
				);
			}, this);
			return (
				<tr key={weekdayDates[0].getTime()}>{row}</tr>
			);
		}, this);
		return (
			<tbody onClick={this.selectHandler}>
				{rows}
			</tbody>
		);
	}
});

var Datepicky = React.createClass({
	getDefaultProps: function() {
		return {firstDayOfWeek: 1};
	},
	getInitialState: function() {
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth();
		return {year: year, month: month, date: null};
	},
	componentDidMount: function() {
		this.props.inputElement = document.getElementById(this.props.inputId);
		this.props.inputElement.addEventListener('input', this.inputHandler);
		if (this.props.inputElement.value) {
			this.inputHandler();
		}
	},
	componentWillUnmount: function() {
		this.props.inputElement.removeEventListener('input', this.inputHandler);
	},
	componentDidUpdate: function(prevProps, prevState) {
		var dateString = this.state.date.getFullYear() + "-" + ("0" + (this.state.date.getMonth() + 1)).slice(-2) + "-" + ("0" + this.state.date.getDate()).slice(-2);
		this.props.inputElement.value = dateString;
	},
	inputHandler: function() {
		var string = this.props.inputElement.value;
		var date = new Date(string.replace(/-/g, "/"));
		if (date.getTime()) {
			var year = date.getFullYear();
			var month = date.getMonth();
			this.setState({year: year, month: month, date: date});
		}
	},
	yearChangeHandler: function(newYear) {
		this.setState({year: newYear});
	},
	monthChangeHandler: function(newMonth) {
		newMonth--;
		if (newMonth > 11) {
			var year = this.state.year + 1;
			var month = newMonth - 12;
			this.setState({year: year, month: month});
		} else if (newMonth < 0) {
			var year = this.state.year - 1;
			var month = newMonth + 12;
			this.setState({year: year, month: month});
		} else {
			this.setState({month: newMonth});
		}
	},
	selectHandler: function(date) {
		this.setState({date: date});
	},
	render: function() {
		return (
			<div className="Datepicky">
				<div className="CalendarControls">
					<CalendarControl number={this.state.year} onChange={this.yearChangeHandler} />
					<CalendarControl number={this.state.month + 1} onChange={this.monthChangeHandler} />
				</div>
				<table>
					<WeekdayNames firstDayOfWeek={this.props.firstDayOfWeek} />
					<Monthdays key={this.state.year*100 + this.state.month} date={this.state.date} year={this.state.year} month={this.state.month} firstDayOfWeek={this.props.firstDayOfWeek} onSelect={this.selectHandler} />
				</table>
			</div>
		);
	}
});

module.exports = Datepicky;
