/**
 * This module will display your personal google calendar and VietNam events
 * Author: Anh Quan Tong 
 * Youtube: Anh Quan Tong
 * Github: phungorquan
 */
// namespace VN carlendar
var ns_VNCal = {
    numOfUrls: 0, // numOfUrls from "config.js"
    arrUrls: [], // Save all urls
    titleArr: [], // Save all event title to send notification once
    alertOnce: true, // Flag to support titleArr above
    currentCalIndex: 0, // This variable will save switch counter
    getInterval: 0
};
Module.register("MMM-VietNamEventsCalendar", {
    defaults: {
        maximumEntries: 10, // Total Maximum Entries
        maximumNumberOfDays: 365,
        showLocation: true,
        maxTitleLength: 20,
        wrapEvents: true, // wrap events to multiple lines breaking at maxTitleLength
        maxTitleLines: 3,
        fetchInterval: 1 * 60 * 1000, // Update every 1 minutes.
        animationSpeed: 500,
        displayButton: true, // Display button to switch between calendars
        displayLunarDate: true,
        displayEndTime: true,
        dateEndFormat: "LT(DD/MM)",
        defaultColor: "White",
        colored: true,
        lunarColor: "LightGreen",
        tableClass: "xsmall",
        displayLunarEvents: true,
        calendars: [{
            url: "",
            color: "",
            title: ""
        }],
        displayPersonalEvents: true,
        personalDateEvent: [{
            day: 14,
            month: 8,
            title: "- After ghost day :D",
        }]
    },
    // Define required css.
    getStyles: function() {
        return ["MMM-VietNamEventsCalendar.css", "font-awesome.css"];
    },
    // Define required scripts.
    getScripts: function() {
        return ["moment.js", "VietNamCal.js"];
    },
    // Define required translations.
    getTranslations: function() {
        // The translations for the default modules are defined in the core translation files.
        // Therefore we can just return false. Otherwise we should have returned a dictionary.
        // If you're trying to build your own module including translations, check out the documentation.
        if (config.language == "vi") return {
            vi: "translations/vi.json" // Vietnamese 
        }
        else return false;
    },
    /**
     * Return title to display
     *
     * @return {string} - Title will be displayed
     */
    getHeader: function() {
        var result = "";
        if (ns_VNCal.currentCalIndex == 0) {
            result = this.translate("ALL EVENTS ARE COMING");
        } else {
            if (this.config.displayLunarEvents && ns_VNCal.currentCalIndex == ns_VNCal.numOfUrls + 1) {
                result = this.translate("LUNAR CALENDAR");
            }
            // Display title at screen which have correspondingly google calendars 
            else {
                var myAvailableElement = ns_VNCal.currentCalIndex - 1; // We need to minus by 1 when using with arr[]
                // If user has input field "name"
                if (this.config.calendars[myAvailableElement].hasOwnProperty("title")) {
                    result = this.config.calendars[myAvailableElement].title;
                } else {
                    // E.g: https://calendar.google.com/calendar/ical/anhquantong77%40gmail.com/public/basic.ics
                    // -> anhquantong77
                    var str = ns_VNCal.arrUrls[myAvailableElement];
                    var pattern = /ical\/[^%]*/g;
                    var getGmailAccount = str.match(pattern);
                    result = this.translate("EVENT OF - ") + getGmailAccount;
                }
            }
        }
        return result;
    },
    start: function() {
        this.addPersonalEvents();
        if (ns_VNCal.numOfUrls == 0) { // This condition will avoid do too much time when re-invoke start())
            Log.log("Starting module: " + this.name);
            // Set locale to setup time format environment.
            moment.updateLocale(config.language, {
                longDateFormat: {
                    LT: "HH:mm"
                },
                calendar: {
                    sameDay: '[Hôm nay, ]DD/MM[<br>]LT',
                    nextDay: '[Ngày mai, ]DD/MM[<br>]LT',
                    nextWeek: 'dd[,] DD/MM [<br>]LT',
                    lastDay: '[Hôm qua ]LT',
                    lastWeek: 'dddd [rồi ]LT',
                    sameElse: 'L'
                },
            });
        }
        // For first load
        for (var c in this.config.calendars) {
            var calendar = this.config.calendars[c];
            calendar.url = calendar.url.replace("webcal://", "http://");
            this.addCalendar(calendar.url);
            // Trigger ADD_CALENDAR every fetchInterval to make sure there is always a calendar
            // fetcher running on the server side.
        }
        var self = this;
        // Clear interval in case this.start() are re-invoked
        clearInterval(ns_VNCal.getInterval);
        ns_VNCal.getInterval = setInterval(function() {
            for (var c in self.config.calendars) {
                var calendar = self.config.calendars[c];
                calendar.url = calendar.url.replace("webcal://", "http://");
                self.addCalendar(calendar.url);
                // Trigger ADD_CALENDAR every fetchInterval to make sure there is always a calendar
                // fetcher running on the server side.
            }
            self.switchCalendar("All"); // Switch to first calendar (All calendar will be displayed)
            ns_VNCal.titleArr = [];
        }, self.config.fetchInterval); // Update calendar every fetchInterval minnute
        ns_VNCal.numOfUrls = ns_VNCal.arrUrls.length; // Restart numOfUrls
        if (ns_VNCal.numOfUrls == 0) // This condition will avoid assigning urls too much when re-invoke start()
        {
            ns_VNCal.numOfUrls = this.config.calendars.length;
            for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                ns_VNCal.arrUrls.push(this.config.calendars[i].url); // Save all urls to ns_VNCal.arrUrls
            }
        }
        this.calendarData = {};
        this.loaded = false;
    },
    /**
     * Check whether personalDateEvent{} is OK or not
     *
     * @returns {bool} - true is OK, false is !OK
     */
    isPersonalEventsAvailable: function() {
        var isOK = true;
        if (this.config.hasOwnProperty('personalDateEvent')) {
            for (var e in this.config.personalDateEvent) {
                var event = this.config.personalDateEvent[e];
                if (!event.hasOwnProperty('day') || !event.hasOwnProperty('month') || !event.hasOwnProperty('title')) {
                    console.log("Please input 'day', 'month', and 'title' into personalDateEvent{}");
                    isOK = false;
                    break;
                } else {
                    if (typeof(event.day) != 'number' || typeof(event.month) != 'number') {
                        console.log("Please input number into 'day' and 'month'");
                        isOK = false;
                        break;
                    }
                }
            }
        } else {
            console.log("Please add personalDateEvent{} in defaults{} config in this file");
            isOK = false;
        }
        return isOK;
    },
    /**
     * This func will add personal events from personalDateEvent{} into Lunar array to display in month
     *
     */
    addPersonalEvents: function() {
        if (this.config.displayPersonalEvents && this.isPersonalEventsAvailable()) {
            var eventArr = this.config.personalDateEvent;
            for (e in eventArr) {
                var day2Digits = ("0" + eventArr[e].day).slice(-2);
                var month2Digits = ("0" + eventArr[e].month).slice(-2);
                var isExist = false;
                // Check whether events were added to array or not, because it will be overlaped after requested interval time
                for (dlElement in DL[eventArr[e].month - 1]) {
                    var strCombine = day2Digits + "/" + month2Digits + eventArr[e].title;
                    if (DL[eventArr[e].month - 1][dlElement] == strCombine) {
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    DL[eventArr[e].month - 1] = sortDayINC(eventArr[e].day, eventArr[e].month, eventArr[e].title);
                }
            }
        }
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification === "CALENDAR_EVENTS") {
            if (this.hasCalendarURL(payload.url)) {
                this.calendarData[payload.url] = payload.events;
                this.loaded = true;
            }
        } else if (notification === "FETCH_ERROR") {
            Log.error("Calendar Error. Could not fetch calendar: " + payload.url);
            this.loaded = true;
        } else if (notification === "INCORRECT_URL") {
            // Check whether myUrl is DUMMY(self-defined) or Wrong(wrong url input)
            if (payload.url != "DUMMY HIDEN") {
                if (ns_VNCal.numOfUrls > 0 && this.config.calendars[0].url != "") Log.error("Calendar Error. Incorrect url: " + payload.url);
            }
        }
        this.updateDom(this.config.animationSpeed);
    },
    getDom: function() {
        var events = this.createEventList();
        var wrapper = document.createElement("table");
        wrapper.className = this.config.tableClass;
        if (events.length === 0) {
            if (this.loaded) {
                wrapper.innerHTML = this.translate("EMPTYPERSONALCALENDAR") + "<br>";
            } else {
                // Only show loading when there is not Lunar Calendars
                if (ns_VNCal.numOfUrls > 0) {
                    if (ns_VNCal.currentCalIndex != this.config.calendars.length + 1 && ns_VNCal.currentCalIndex != 0) wrapper.innerHTML = this.translate("LOADING") + "<br>";
                }
            }
            wrapper.className = this.config.tableClass + " dimmed";
        } else {
            for (var e in events) {
                var existTitle = false;
                var event = events[e];
                var eventWrapper = document.createElement("tr");
                // Color calendars
                for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                    if (event.url === ns_VNCal.arrUrls[i]) {
                        if (this.config.calendars[i].hasOwnProperty("color")) {
                            eventWrapper.style.color = this.config.calendars[i].color;
                        } else {
                            eventWrapper.style.color = this.config.defaultColor;
                        }
                    }
                }
                eventWrapper.className = "normal";
                // Title
                var titleWrapper = document.createElement("td");
                titleWrapper.innerHTML = this.titleTransform(event.title);
                titleWrapper.style.fontFamily = "Roboto,bold";
                titleWrapper.className = "time bold ";
                // Time
                var timeWrapper = document.createElement("td");
                var timeStr = "";
                timeWrapper.style.fontFamily = "Roboto,bold"; // Xiu add font
                eventWrapper.appendChild(titleWrapper);
                // Define second, minute, hour, and day variables
                var now = new Date();
                var oneSecond = 1000; // 1,000 milliseconds
                var oneMinute = 60000; // oneSec * 60
                var oneHour = 3600000; // oneMin * 60
                var oneDay = 86400000; // oneHour * 24
                // If event occur all day
                if (event.fullDayEvent) {
                    timeStr = moment(event.startDate, "x").format('[Hôm nay]');
                    timeStr += "<br> Cả ngày đến " + moment(event.endDate - oneDay, "x").format(this.config.dateEndFormat);
                } else {
                    if (event.startDate >= new Date()) {
                        timeStr = moment(event.startDate, "x").calendar();
                        // Check < 5' to pop-up alert
                        if ((event.startDate - now) < (5 * oneMinute)) {
                            for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                                if (ns_VNCal.titleArr[i] == event.title) {
                                    existTitle = true;
                                    break;
                                }
                            }
                            if (!existTitle) {
                                ns_VNCal.alertOnce = true;
                                ns_VNCal.titleArr.push(event.title);
                            }
                        }
                    } else {
                        timeStr = this.translate("RUNNING") + moment(event.endDate, "x").fromNow(true)
                        timeStr += "<br>" + moment(event.startDate, "x").format(this.config.dateEndFormat);
                    }
                    // If startDate > a week -> display Date
                    if (moment(event.startDate, "x")._i - Date.now() > oneDay * 7) {
                        timeStr += "<br>" + moment(event.startDate, "x").format("LT");
                    }
                    // Display endTime
                    if (this.config.displayEndTime) {
                        timeStr += " - " + moment(event.endDate, "x").format(this.config.dateEndFormat);
                    }
                }
                timeWrapper.innerHTML = timeStr;
                timeWrapper.className = "time bold ";
                eventWrapper.appendChild(timeWrapper);
                wrapper.appendChild(eventWrapper);
                // Location
                if (this.config.showLocation) {
                    var myLocation = this.translate("No location");
                    if (event.location !== false) {
                        myLocation = event.location;
                    }
                    var locationRow = document.createElement("tr");
                    locationRow.className = "normal xsmall";
                    locationRow.style.fontFamily = "Courier New, monospace";
                    locationRow.style.fontStyle = "italic";
                    locationRow.style.textAlign = "left";
                    locationRow.style.letterSpacing = "0.5px";
                    var descCell = document.createElement("td");
                    descCell.className = "location";
                    descCell.colSpan = "1";
                    descCell.innerHTML = this.titleTransform(myLocation);
                    locationRow.appendChild(descCell);
                    wrapper.appendChild(locationRow);
                    // Display a line to separate peronalCal and lunarCal
                    if (this.config.displayLunarEvents && ns_VNCal.currentCalIndex == 0 && e == events.length - 1) {
                        var lineCol = document.createElement("td");
                        lineCol.colSpan = "2";
                        var getLine = document.createElement("hr");
                        getLine.style.border = "0.5px solid #666";
                        lineCol.appendChild(getLine);
                        wrapper.appendChild(lineCol);
                    }
                }
            }
        }
        if (ns_VNCal.titleArr.length != 0 && ns_VNCal.alertOnce) {
            ns_VNCal.alertOnce = false;
            var combineEventName = ""
            for (var i = 0; i < ns_VNCal.titleArr.length; i++) {
                combineEventName += ns_VNCal.titleArr[i] + "<br>";
            }
            var audio = new Audio('modules/MMM-VietNamEventsCalendar/resources/Alarm.mp3');
            audio.play();
            this.sendNotification("SHOW_ALERT", {
                type: "alert",
                title: "<h2>" + combineEventName + "</h2>",
                message: "EVENT IS COMING",
                timer: 7000
            });
        }
        // VIETNAM EVENTS
        var getNow = new Date();
        var getMonth = ("0" + (getNow.getMonth() + 1)).slice(-2);
        var getYear = getNow.getFullYear();
        if (this.config.displayLunarEvents == true && (ns_VNCal.currentCalIndex == 0 || ns_VNCal.currentCalIndex == ns_VNCal.numOfUrls + 1)) {
            var getVNEvent = getEvent(getNow.getMonth());
            var maxEntries = getVNEvent.length;
            if (this.config.maximumEntries <= maxEntries) {
                maxEntries = this.config.maximumEntries
            }
            for (var i = 0; i < maxEntries; i++) {
                var getTitle = getVNEvent[i].split('-'); // [date/month],[title]
                var secondSplit = getTitle[0].split('/'); // [date],[month]
                var getLunarInfo = getLunarDate(parseInt(secondSplit[0]), parseInt(secondSplit[1]), getYear);
                var getLunarDay = ("0" + getLunarInfo.day).slice(-2);
                var getLunarMonth = ("0" + getLunarInfo.month).slice(-2);
                var getDOW = TUAN[(getLunarInfo.jd + 1) % 7];
                var eventWrapper = document.createElement("tr");
                eventWrapper.style.color = this.config.lunarColor;
                // Title
                var titleWrapper = document.createElement("td");
                titleWrapper.innerHTML = this.titleTransform(getTitle[1]);
                titleWrapper.style.fontFamily = "Roboto,bold";
                //titleWrapper.style.cssFloat = "left";
                eventWrapper.appendChild(titleWrapper);
                wrapper.appendChild(eventWrapper);
                // Time
                var timeWrapper = document.createElement("td");
                timeWrapper.style.fontFamily = "Roboto,bold"; // Xiu add font
                if (this.config.displayLunarDate) {
                    timeWrapper.innerHTML = getDOW + ", " + getTitle[0] + "<sup style = 'font-size: 15px; vertical-align: top; position: relative; top: 4px; '>(" + getLunarDay + "/" + getLunarMonth + ")</sup>";
                } else {
                    timeWrapper.innerHTML = getDOW + ", " + getTitle[0];
                }
                timeWrapper.style.cssFloat = "right";
                timeWrapper.className = "time bold ";
                eventWrapper.appendChild(timeWrapper);
                wrapper.appendChild(eventWrapper);
            }
        }
        // Create a button with css = switchBtn, onClick event = switchCalendar()
        if (this.config.displayButton == true) {
            var switchBtn = document.createElement("BUTTON");
            switchBtn.setAttribute("id", "idLunarSwitch");
            switchBtn.innerHTML = this.translate("SWITCH CALENDARS");
            switchBtn.addEventListener("click", () => this.switchCalendar());
            switchBtn.className = "calendarSwitchBtn"; // This is Xiu's CSS 
            wrapper.appendChild(switchBtn);
        }
        return wrapper;
    },
    // Switch calendar from external notification
    notificationReceived: function(notification, payload, sender) {
        if (notification == "SWITCH_CALENDAR") {
            this.switchCalendar(); // Switch next calendar
        } else if (notification == "SWITCH_ALL_CALENDAR") {
            this.switchCalendar("All"); // Switch to first calendar (All calendar will be displayed)
        }
    },
    /**
     * This func will be switched to next calendar inside ns_VNCal.arrUrls[] until reach to the last one
     *
     * @param {string} mode, "All" is when standing at first screen, !All is other one
     *
     */
    switchCalendar: function(mode = "!All") {
        // If the mirror has more than 1 calendar url
        if (ns_VNCal.numOfUrls > 0 && this.config.calendars[0].url != "") {
            if (mode == "All") {
                //this.config.displayLunarEvents = true;
                for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                    this.config.calendars[i].url = ns_VNCal.arrUrls[i];
                }
                // Reset counter
                ns_VNCal.currentCalIndex = 0;
                this.start(); // Re-invoke to update
            } else {
                // Show personalCal
                if (ns_VNCal.currentCalIndex < ns_VNCal.numOfUrls) {
                    // Display only 1 calendar at [0] with each element[ns_VNCal.currentCalIndex]
                    // hide the other by "DUMMY HIDEN"
                    this.config.calendars[0].url = ns_VNCal.arrUrls[ns_VNCal.currentCalIndex];
                    for (var i = 1; i < ns_VNCal.numOfUrls; i++) {
                        this.config.calendars[i].url = "DUMMY HIDEN";
                    }
                    ns_VNCal.currentCalIndex++;
                }
                // Show lunarCal
                else if (ns_VNCal.currentCalIndex == ns_VNCal.numOfUrls) {
                    this.config.calendars[0].url = "DUMMY HIDEN";
                    ns_VNCal.currentCalIndex++;
                    if (!this.config.displayLunarEvents) {
                        for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                            this.config.calendars[i].url = ns_VNCal.arrUrls[i];
                        }
                        // Reset counter
                        ns_VNCal.currentCalIndex = 0;
                    }
                }
                // Show all
                else {
                    for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                        this.config.calendars[i].url = ns_VNCal.arrUrls[i];
                    }
                    // Reset counter
                    ns_VNCal.currentCalIndex = 0;
                }
                this.start(); // Re-invoke to update
            }
        }
    },
    /*
     ***************************************************************************
     **************** SOURCE CODE BELOW FROM DEFAULT CALENDAR   ****************
     ***************************************************************************
     */
    /**
     * Check if this config contains the calendar url.
     *
     * @param {string} url, Url to look for
     * @returns {bool} - Has calendar url
     */
    hasCalendarURL: function(url) {
        for (var c in this.config.calendars) {
            var calendar = this.config.calendars[c];
            if (calendar.url === url) {
                return true;
            }
        }
        return false;
    },
    /**
     * Creates the sorted list of all events.
     *
     * @return {array} - Array with events.
     */
    createEventList: function() {
        var events = [];
        var today = moment().startOf("day");
        var now = new Date();
        var future = moment().startOf("day").add(this.config.maximumNumberOfDays, "days").toDate();
        for (var c in this.calendarData) {
            var calendar = this.calendarData[c];
            for (var e in calendar) {
                var event = JSON.parse(JSON.stringify(calendar[e])); // clone object
                if (event.endDate < now) {
                    continue;
                }
                if (this.listContainsEvent(events, event)) {
                    continue;
                }
                event.url = c;
                event.today = event.startDate >= today && event.startDate < (today + 24 * 60 * 60 * 1000);
                var maxCount = Math.ceil(((event.endDate - 1) - moment(event.startDate, "x").endOf("day").format("x")) / (1000 * 60 * 60 * 24)) + 1;
                events.push(event);
            }
        }
        events.sort(function(a, b) {
            return a.startDate - b.startDate;
        });
        return events.slice(0, this.config.maximumEntries);
    },
    listContainsEvent: function(eventList, event) {
        for (var evt of eventList) {
            if (evt.title === event.title && parseInt(evt.startDate) === parseInt(event.startDate)) {
                return true;
            }
        }
        return false;
    },
    /**
     * Requests node helper to add calendar url.
     *
     * @param {string} url, Url of google calendar
     */
    addCalendar: function(url) {
        this.sendSocketNotification("ADD_CALENDAR", {
            url: url,
            fetchInterval: this.config.fetchInterval,
            maximumEntries: this.config.maximumEntries,
            maximumNumberOfDays: this.config.maximumNumberOfDays
        });
    },
    /**
     * Shortens a string if it's longer than maxLength and add a ellipsis to the end
     *
     * @param {string} string, Text string to shorten
     * @param {number} maxLength, The max length of the string
     * @param {boolean} wrapEvents, Wrap the text after the line has reached maxLength
     * @param {number} maxTitleLines, The max number of vertical lines before cutting event title
     * @returns {string} - The shortened string
     */
    shorten: function(string, maxLength, wrapEvents, maxTitleLines) {
        if (typeof string !== "string") {
            return "";
        }
        if (wrapEvents === true) {
            var temp = "";
            var currentLine = "";
            var words = string.split(" ");
            var line = 0;
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                if (currentLine.length + word.length < (typeof maxLength === "number" ? maxLength : 25) - 1) { // max - 1 to account for a space
                    currentLine += (word + " ");
                } else {
                    line++;
                    if (line > maxTitleLines - 1) {
                        if (i < words.length) {
                            currentLine += "&hellip;";
                        }
                        break;
                    }
                    if (currentLine.length > 0) {
                        temp += (currentLine + "<br>" + word + " ");
                    } else {
                        temp += (word + "<br>");
                    }
                    currentLine = "";
                }
            }
            return (temp + currentLine).trim();
        } else {
            if (maxLength && typeof maxLength === "number" && string.length > maxLength) {
                return string.trim().slice(0, maxLength) + "&hellip;";
            } else {
                return string.trim();
            }
        }
    },
    /**
     * Transforms the title of an event for usage.
     * Replaces parts of the text as defined in config.titleReplace.
     *
     * @param {string} title, Title will be transformed
     * @returns {string} - The transformed title.
     */
    titleTransform: function(title) {
        title = this.shorten(title, this.config.maxTitleLength, this.config.wrapEvents, this.config.maxTitleLines);
        return title;
    },
});