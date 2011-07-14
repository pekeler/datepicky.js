var createDatepicky = (function() {
    var registerEventHandler = window.addEventListener ?
        function(eventTarget, eventType, eventHandlerMethod, eventHandlerObject) {
            eventTarget.addEventListener(eventType, function(event) {
                eventHandlerMethod.call(eventHandlerObject, event);
            }, false);
        } :
        function(eventTarget, eventType, eventHandlerMethod, eventHandlerObject) {
            eventTarget.attachEvent('on' + eventType, function(event) {
                eventHandlerMethod.call(eventHandlerObject, event);
            });
        };

    function supportsInputEvents() {
        var element = document.createElement('input');
        var supported = ("oninput" in element);
        if (!supported) {
            element.setAttribute("oninput", "return;");
            supported = typeof element["oninput"] == "function";
        }
        return supported;
    }
    var INPUT_EVENT_NAME = supportsInputEvents() ? "input" : "propertychange";

    var WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    var MONTH_NAMES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    function dateToString(date) {
        return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    }
    
    function appendNewElement(name, parentNode, className, innerHTML) {
        var element = document.createElement(name);
        parentNode.appendChild(element);
        className && (element.className = className);
        innerHTML && (element.innerHTML = innerHTML);
        return element;
    }

    function paddedDatesByWeek(month, year, firstDayOfWeek) {
        var dates = [];
        var day = 1;
        var date;
        do {
            date = new Date(year, month - 1, day++, 0, 0, 0, 0);
            dates.push(date);
        } while (date.getDate() == day - 1);
        dates.pop();
        day--;

        var lastDayOfWeek = (firstDayOfWeek + 6) % 7;
        while (dates[dates.length - 1].getDay() != lastDayOfWeek) {
            dates.push(new Date(year, month - 1, day++, 0, 0, 0, 0));
        }

        day = 0;
        while (dates[0].getDay() != firstDayOfWeek) {
            dates.unshift(new Date(year, month - 1, day--, 0, 0, 0, 0));
        }

        var weeks = [];
        while (dates.length) {
            var week = [];
            for (var count = 1; count <= 7; count++) {
                week.push(dates.shift());
            }
            weeks.push(week);
        }
        return weeks;
    }
    
    function beginningOfDay(dateOrString) {
        if (typeof dateOrString == "string") {
            // if (dateOrString.length <= 5) {
            //     dateOrString.slice(0, 4) + "/01/01";
            // }
            var date = new Date(dateOrString.replace(/-/g, "/"));
            return date.getTime() ? date : null;
        } else {
            return new Date(dateOrString.getFullYear(), dateOrString.getMonth(), dateOrString.getDate());
        }
    }
    
    function normalizeDatesOrStrings(datesOrStrings) {
        var normalizedDates = [];
        var length = datesOrStrings.length;
        for (var index = 0; index < length; index++) {
            var date = beginningOfDay(datesOrStrings[index]);
            date && normalizedDates.push(date.getTime());
        }
        return normalizedDates;
    }
    
    function months(year, month) {
        return (year - 1) * 12 + month;
    }

    function Datepicky(inputId, divId, options) {
        this.processOptions(options);

        this.weeksOfDates = paddedDatesByWeek(this.month, this.year, this.firstDayOfWeek);

        this.inputDateField = document.getElementById(inputId);
        registerEventHandler(this.inputDateField, INPUT_EVENT_NAME, this.inputDateFieldChangeHandler, this);

        var datepicky = document.getElementById(divId);
        datepicky.className = "Datepicky";
        this.renderYearMonthSection(datepicky);
        this.renderDatesSection(datepicky);
        if (this.inputDateField.value) {
            this.inputDateFieldChangeHandler();
        } else if (this.defaultDate) {
            this.inputDateField.value = dateToString(this.defaultDate);
            this.inputDateFieldChangeHandler();
        } else {
            this.renderDates();
        }
    }
    
    Datepicky.prototype.processOptions = function(options) {
        options || (options = {});
        this.weekdayNames = options.weekdayNames || WEEKDAY_NAMES;
        this.monthNames = options.monthNames || MONTH_NAMES;
        this.invalidDateClassName = options.invalidDateClassName || "";
        this.disabledDays = options.disabledDays || [];
        this.disabledTimes = normalizeDatesOrStrings(options.disabledDates || []);
        this.firstDayOfWeek = typeof options.firstDayOfWeek == "undefined" ? 1 : options.firstDayOfWeek;
        if (options.minDate) {
            this.minDate = beginningOfDay(options.minDate);
            this.minMonths = months(this.minDate.getFullYear(), this.minDate.getMonth() + 1);
        }
        if (options.maxDate) {
            this.maxDate = beginningOfDay(options.maxDate);
            this.maxMonths = months(this.maxDate.getFullYear(), this.maxDate.getMonth() + 1);
        }
        var date;
        if (options.defaultDate) {
            this.defaultDate = beginningOfDay(options.defaultDate);
            date = this.defaultDate;
        } else if (options.defaultMonth) {
            if (typeof options.defaultMonth == "string") {
                var defaultMonthItems = options.defaultMonth.split("-");
                date = new Date(defaultMonthItems[0], defaultMonthItems[1] - 1);
            } else {
                date = options.defaultMonth;
            }
        } else {
            date = new Date()
        }
        this.month = date.getMonth() + 1;
        this.year = date.getFullYear();
    };

    Datepicky.prototype.renderYearMonthSection = function(parentNode) {
        var table = appendNewElement("table", parentNode, "YearMonth");
        var tbody = appendNewElement("tbody", table);
        var row = appendNewElement("tr", tbody);

        this.yearDownCell = appendNewElement("td", row, null, "&lt;");
        registerEventHandler(this.yearDownCell, "click", function() {this.changeYearAndMonth(-1, 0);}, this);

        this.yearCell = appendNewElement("td", row);

        this.yearUpCell = appendNewElement("td", row, null, "&gt;");
        registerEventHandler(this.yearUpCell, "click", function() {this.changeYearAndMonth(1, 0);}, this);

        this.monthDownCell = appendNewElement("td", row, null, "&lt;");
        registerEventHandler(this.monthDownCell, "click", function() {this.changeYearAndMonth(0, -1);}, this);

        this.monthCell = appendNewElement("td", row);

        this.monthUpCell = appendNewElement("td", row, null, "&gt;");
        registerEventHandler(this.monthUpCell, "click", function() {this.changeYearAndMonth(0, 1);}, this);
        
        this.updateYearMonthSection();
    };
    
    Datepicky.prototype.updateYearMonthSection = function() {
        this.monthCell.innerHTML = this.monthNames[this.month - 1];
        this.yearCell.innerHTML = this.year;
        var numberOfMonths = months(this.year, this.month);
        this.yearDownCell.className = (!this.minDate || numberOfMonths >= this.minMonths + 12) ? "Clickable" : "Other";
        this.yearUpCell.className = (!this.maxDate || numberOfMonths <= this.maxMonths - 12) ? "Clickable" : "Other";
        this.monthDownCell.className = (!this.minDate || numberOfMonths > this.minMonths) ? "Clickable" : "Other";
        this.monthUpCell.className = (!this.maxDate || numberOfMonths < this.maxMonths) ? "Clickable" : "Other";
    };

    Datepicky.prototype.changeYearAndMonth = function(yearDelta, monthDelta) {
        var newYear = this.year + yearDelta;
        var newMonth = this.month + monthDelta;
        if (newMonth == 13) {
            newMonth = 1;
            newYear++;
        } else if (newMonth == 0) {
            newMonth = 12;
            newYear--;
        }
        var newNumberOfMonths = months(newYear, newMonth);
        if ((!this.minDate || newNumberOfMonths >= this.minMonths) && (!this.maxDate || newNumberOfMonths <= this.maxMonths)) {
            this.month = newMonth;
            this.year = newYear;
            this.weeksOfDates = paddedDatesByWeek(this.month, this.year, this.firstDayOfWeek);
            this.renderDates();
            this.updateYearMonthSection();
        }
    };

    Datepicky.prototype.renderDatesSection = function(parentNode) {
        var table = appendNewElement("table", parentNode);
        var thead = appendNewElement("thead", table);
        var row = appendNewElement("tr", thead);
        for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
            appendNewElement("th", row, null, this.weekdayNames[this.weeksOfDates[0][dayIndex].getDay()]);
        }
        this.tbody = appendNewElement("tbody", table);
        registerEventHandler(this.tbody, "click", this.tbodyClickHandler, this);
    };

    Datepicky.prototype.renderDates = function() {
        for (var numberOfRows = this.tbody.rows.length; numberOfRows > 0; numberOfRows--) {
            this.tbody.deleteRow(-1);
        }
        var numberOfWeeks = this.weeksOfDates.length;
        for (var weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
            var row = appendNewElement("tr", this.tbody);
            for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
                var date = this.weeksOfDates[weekIndex][dayIndex];
                appendNewElement("td", row, this.dateIsSelectable(date) ? "Clickable" : 'Other', date.getDate());
            }
        }
    };
    
    Datepicky.prototype.dateIsSelectable = function(date) {
        var clickable = date.getMonth() + 1 == this.month;
        if (clickable) {
            if (this.minDate > date) {
                clickable = false;
            } else if (this.maxDate < date) {
                clickable = false;
            } else {
                var day = date.getDay();
                for (var index = this.disabledDays.length - 1; index >= 0; index--) {
                    if (this.disabledDays[index] == day) {
                        clickable = false;
                        break;
                    }
                }
                if (clickable) {
                    var time = date.getTime();
                    for (var index = this.disabledTimes.length - 1; index >= 0; index--) {
                        if (this.disabledTimes[index] == time) {
                            clickable = false;
                            break;
                        }
                    }
                }
            }
        }
        return clickable;
    };

    Datepicky.prototype.inputDateFieldChangeHandler = function(event) {
        var enteredString = this.inputDateField.value;
        var enteredDate = beginningOfDay(enteredString);
        var dateIsSelectable;
        if (enteredDate) {
            var enteredTime = enteredDate.getTime();
            this.changeYearAndMonth(enteredDate.getFullYear() - this.year, enteredDate.getMonth() + 1 - this.month);
            dateIsSelectable = this.dateIsSelectable(enteredDate);
            if (dateIsSelectable) {
                var weekIndex = 0;
                var dayIndex = 0;
                while (enteredTime != this.weeksOfDates[weekIndex][dayIndex].getTime()) {
                    dayIndex++;
                    if (dayIndex == 7) {
                        dayIndex = 0;
                        weekIndex++;
                    }
                }
                this.selectedDayCell = this.tbody.rows[weekIndex].cells[dayIndex];
                this.selectedDayCell.className = "Selected";
            }
        }
        if (this.invalidDateClassName) {
            var newClassName = enteredDate && dateIsSelectable ? "" : this.invalidDateClassName;
            (newClassName != this.inputDateField.className) && (this.inputDateField.className = newClassName); // prevent endless loop in IE
        }
    };

    Datepicky.prototype.tbodyClickHandler = function(event) {
        var clickedDayCell = event.target || event.srcElement;
        if (clickedDayCell.className == "Clickable") {
            if (this.selectedDayCell) {
                this.selectedDayCell.className = "Clickable";
            }
            this.selectedDayCell = clickedDayCell;
            this.selectedDayCell.className = "Selected";
            
            var weekIndex = 0;
            var dayIndex = 0;
            while (clickedDayCell != this.tbody.rows[weekIndex].cells[dayIndex]) {
                dayIndex++;
                if (dayIndex == 7) {
                    dayIndex = 0;
                    weekIndex++;
                }
            }
            var selectedDate = this.weeksOfDates[weekIndex][dayIndex];
            this.inputDateField.value = dateToString(selectedDate);
            if (this.invalidDateClassName) {
                this.inputDateField.className = "";
            }
        }
    };

    return function(inputId, divId, options) {
        new Datepicky(inputId, divId, options);
    };
})();
