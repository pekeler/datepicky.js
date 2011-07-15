# datepicker.js

datepicky.js is a standalone JavaScript date picker for the only date format that matters, ISO 8601 (YYYY-MM-DD).

## Dependencies

None.

## Supported browsers

- IE6
- IE7
- IE8
- IE9
- FF5
- Chrome 14
- Safari 5
- Opera 11.5

## How to use

Use `createDatepicky()` to render the date picker and bind it to an input element of type text or date. The first parameter is the id of the input element, the second parameter is the id of a div which will contain the datepicker. The third parameter is a hash for customizations, it is optional.

```javascript
createDatepicky(dateInputId, pickerDivId, {});
```

### Customizations

- defaultDate
- defaultMonth
- disabledDays
- disabledDates
- minDate
- maxDate
- firstDayOfWeek
- weekdayNames
- monthNames
- invalidDateClassName

Take a look at the [demo](http://pekeler.github.com/datepicky.js/demo.html) to learn more about the customizations.
