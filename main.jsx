"use strict";

var React = require('react');
var Datepicky = require('./datepicky.jsx');

React.render(
	<Datepicky inputId="datefield"/>,
	document.getElementById('pickerDiv')
);
