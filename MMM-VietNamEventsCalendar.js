/**
 * This module will display your personal google calendar and VietNam events
 * Author: Anh Quan Tong 
 * Youtube: Anh Quan Tong
 * Github: phungorquan
 */
// namespace VN carlendar
var ns_VNCal = {
    numOfUrls: 0, // numOfUrls from calendar[], +1 if displayLunarEvents is true
    arrUrls: [], // Save all urls
    titleArr: [], // Save all event title to send notification once
    alertOnce: true, // Flag to support titleArr above
    currentPage: 0,
    audio: {}
};
Module.register("MMM-VietNamEventsCalendar", {
    defaults: {
        maximumEntries: 10, // Total Maximum Entries
        maximumNumberOfDays: 365,
        maxTitleLength: 20,
        maxTitleLines: 3,
        wrapEvents: true, // Wrap events to multiple lines breaking at 'maxTitleLength'
        fetchInterval: 1 * 60 * 1000, // Update every minute.
        animationSpeed: 500, // Animation speed when switch page
        tableClass: "xsmall",
        displayPageIndicator: true, // Page indicator text not follow array[] rule
        displaySwitchBtn: true, // Display button to switch between calendars
        moveToPageAfterInterval: true, // Allow switch to page 'pageAfterInterval' after 'fetchInterval'
        pageAfterInterval: 0, // Follow array rule, 0(All - first page), 1(first google calendar),...(last page - VietNam events)
        displayEndTime: true, // Display end time of event
        dateEndFormat: "LT(DD/MM)", // end time format
        colored: true, // Allow color google calendars from 'calendar.color'
        defaultColor: "White", // Default color of google calendars if didn't input 'calendar.color'
        durationWillAlert: 5 * 60 * 1000, // 5min is default
        alertSoundFile: "ClearAnnouce.wav", // Sound files, please check in resources/ to know what we have
        alertSoundTimer: 1 * 5 * 1000, // Audio will be repeated and alert will be displayed in 5sec
        displayLocation: true,
        calendars: [{
            url: "",
            color: "",
            title: ""
        }],
        lunarColor: "LightGreen", // VietNam events color
        displayLunarEvents: true,
        displayLunarDate: true, // Alow display lunar date
        displayPersonalEvents: true,
        personalDateEvent: [{
            day: 7,
            month: 7,
            title: "Xiu's birth day",
        }]
    },
    // Define required css.
    getStyles: function() {
        return ["MMM-VietNamEventsCalendar.css", "font-awesome.css"];
    },
    // Define required scripts.
    getScripts: function() {
        return ["moment.js", "modules/MMM-VietNamEventsCalendar/include/VietNamEvents.js", "modules/MMM-VietNamEventsCalendar/src/VietNamCal.js", "modules/MMM-VietNamEventsCalendar/src/UtilsChecking.js"];
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
        if (ns_VNCal.currentPage == 0) {
            result = this.translate("ALL_EVENTS_ARE_COMING");
        } else {
            if (this.config.displayLunarEvents && ns_VNCal.currentPage == ns_VNCal.numOfUrls) {
                result = this.translate("LUNAR_VIETNAM_EVENTS");
            }
            // Display title at screen which have correspondingly google calendars 
            else {
                var myAvailableElement = ns_VNCal.currentPage - 1; // We need to minus by 1 when using with arr[]
                // If user has input field "title"
                if (this.config.calendars[myAvailableElement].hasOwnProperty("title")) {
                    if (this.config.calendars[myAvailableElement].title.length != 0) {
                        result = this.config.calendars[myAvailableElement].title;
                    } else {
                        // E.g: https://calendar.google.com/calendar/ical/anhquantong77%40gmail.com/public/basic.ics
                        // -> anhquantong77
                        var str = ns_VNCal.arrUrls[myAvailableElement];
                        var pattern = /ical\/[^%]*/i;
                        var getGmailAccount = str.match(pattern).toString().replace("ical/", "");
                        result = this.translate("EVENT OF - ") + getGmailAccount;
                    }
                } else {
                    result = this.translate("EMPTY_CALENDAR_TITLE");
                }
            }
        }
        return result;
    },
    start: function() {
        initVietNamEvents(this);
        ns_VNCal.audio = new Audio('modules/MMM-VietNamEventsCalendar/resources/' + this.config.alertSoundFile);
        this.addPersonalEvents();
        if (ns_VNCal.numOfUrls == 0) { // This condition will avoid do too much time when re-invoke start())
            Log.log("Starting module: " + this.name);
            // Set locale to setup time format environment.
            moment.updateLocale(config.language, {
                longDateFormat: {
                    LT: "HH:mm"
                },
                calendar: {
                    sameDay: '[' + this.translate("TODAY") + ', ]DD/MM[<br>]LT',
                    nextDay: '[' + this.translate("TOMORROW") + ', ]DD/MM[<br>]LT',
                    nextWeek: 'dd[,] DD/MM [<br>]LT',
                    lastDay: '[' + this.translate("YESTERDAY") + ' ]LT',
                    lastWeek: 'dddd [r???i ]LT',
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
        setInterval(function() {
            for (var c in self.config.calendars) {
                var calendar = self.config.calendars[c];
                calendar.url = calendar.url.replace("webcal://", "http://");
                self.addCalendar(calendar.url);
                // Trigger ADD_CALENDAR every fetchInterval to make sure there is always a calendar
                // fetcher running on the server side.
            }
            if (self.config.moveToPageAfterInterval) {
                if (self.config.pageAfterInterval <= ns_VNCal.numOfUrls) {
                    ns_VNCal.currentPage = self.config.pageAfterInterval;
                } else {
                    ns_VNCal.currentPage = 0;
                    console.log("Please input correctly calendar page, Remember minus 1 because it's not follow Array[] rule");
                }
            }
        }, self.config.fetchInterval); // Update calendar every fetchInterval minnute
        if (isCalendarsAvailable(this.config)) {
            ns_VNCal.numOfUrls = this.config.calendars.length; // Get numOfUrls
            for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                ns_VNCal.arrUrls.push(this.config.calendars[i].url); // Save all urls to ns_VNCal.arrUrls
            }
            // Increase by 1 if display lunar events
            if (this.config.displayLunarEvents) {
                ns_VNCal.numOfUrls++;
            }
        }
        this.calendarData = {};
        this.loaded = false;
    },
    /**
     * This func will add personal events from personalDateEvent{} into Solar array to display in month
     *
     */
    addPersonalEvents: function() {
        if (this.config.displayPersonalEvents && isPersonalEventsAvailable(this.config)) {
            var eventArr = this.config.personalDateEvent;
            for (e in eventArr) {
                DLObj[eventArr[e].month - 1] = addEventToDL(parseInt(eventArr[e].day), parseInt(eventArr[e].month), eventArr[e].title);
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
            if (isCalendarsAvailable(this.config)) {
                Log.error("Calendar Error. Incorrect url: " + payload.url);
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
                if (ns_VNCal.currentPage != ns_VNCal.numOfUrls) {
                    wrapper.innerHTML = this.translate("EMPTY_PERSONAL_CALENDAR") + "<br>";
                }
            } else {
                // Only show loading when there is not Lunar Calendars
                if (ns_VNCal.numOfUrls > 0) {
                    if (ns_VNCal.currentPage != ns_VNCal.numOfUrls && ns_VNCal.currentPage != 0) {
                        wrapper.innerHTML = this.translate("LOADING") + "<br>";
                    }
                }
            }
            wrapper.className = this.config.tableClass + " dimmed";
        } else {
            for (var e in events) {
                var existTitle = false;
                var event = events[e];
                var eventWrapper = document.createElement("tr");
                eventWrapper.className = "normal";
                if (ns_VNCal.currentPage != 0) {
                    if (event.url != ns_VNCal.arrUrls[ns_VNCal.currentPage - 1]) continue;
                }
                // Color calendars, if user not input 'color' -> get 'defaultColor'
                for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                    if (event.url === ns_VNCal.arrUrls[i]) {
                        if (this.config.colored && this.config.calendars[i].hasOwnProperty("color")) {
                            if (this.config.calendars[i].color.length != 0) {
                                eventWrapper.style.color = this.config.calendars[i].color;
                            } else {
                                eventWrapper.style.color = this.config.defaultColor;
                            }
                        } else {
                            eventWrapper.style.color = this.config.defaultColor;
                        }
                    }
                }
                // Title
                var titleWrapper = document.createElement("td");
                titleWrapper.innerHTML = this.titleTransform(event.title);
                titleWrapper.className = "title bold";
                // Time
                var timeWrapper = document.createElement("td");
                timeWrapper.className = "time bold";
                var timeStr = "";
                eventWrapper.appendChild(titleWrapper);
                // Define second, minute, hour, and day variables
                var now = new Date();
                var oneSecond = 1000; // 1,000 milliseconds
                var oneMinute = 60000; // oneSec * 60
                var oneHour = 3600000; // oneMin * 60
                var oneDay = 86400000; // oneHour * 24
                // If event occur all day
                if (event.fullDayEvent) {
                    timeStr = moment(event.startDate, "x").format('[H??m nay]');
                    timeStr += "<br> C??? ng??y ?????n " + moment(event.endDate - oneDay, "x").format(this.config.dateEndFormat);
                } else {
                    if (event.startDate >= new Date()) {
                        timeStr = moment(event.startDate, "x").calendar();
                        // Request alert if duration < this.config.durationWillAlert
                        if ((event.startDate - now) < (this.config.durationWillAlert)) {
                            for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                                if (ns_VNCal.titleArr[i] == event.title) {
                                    existTitle = true;
                                    break;
                                }
                            }
                            if (!existTitle) {
                                // Get calendars and titles
                                var str = ns_VNCal.arrUrls[e];
                                var pattern = /ical\/[^%]*/g;
                                var getGmailAccount = str.match(pattern).toString().replace("ical/", "");
                                ns_VNCal.titleArr.push(getGmailAccount + ": " + event.title);
                            }
                        }
                    } else {
                        timeStr = this.translate("RUNNING") + moment(event.endDate, "x").fromNow(true);
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
                eventWrapper.appendChild(timeWrapper);
                wrapper.appendChild(eventWrapper);
                // Location
                if (this.config.displayLocation) {
                    var myLocation = this.translate("NO_LOCATION");
                    if (event.location !== false) {
                        myLocation = event.location;
                    }
                    var locationRow = document.createElement("tr");
                    var contentCell = document.createElement("td");
                    contentCell.className = "location xsmall";
                    contentCell.colSpan = "2";
                    contentCell.innerHTML = this.titleTransform(myLocation);
                    locationRow.appendChild(contentCell);
                    wrapper.appendChild(locationRow);
                }
            }
        }
        // Create 2 col span for VietNam events
        var vnEventsUIRow = document.createElement("tr");
        var vnEventsUICol = document.createElement("td");
        vnEventsUICol.colSpan = "2";
        vnEventsUICol.appendChild(this.loadVietNamEventsUI());
        vnEventsUIRow.appendChild(vnEventsUICol);
        wrapper.appendChild(vnEventsUIRow);
        return wrapper;
    },
    /**
     * This func will display VietNam events
     *
     * @return {tr} - Rows contain VietNam events
     *
     */
    loadVietNamEventsUI: function() {
        var wrapper = document.createElement("tr");
        // Handle play sound and alert when events are coming
        if (ns_VNCal.titleArr.length != 0 && ns_VNCal.alertOnce) {
            console.log("ALERT EVENT IS COMING");
            // Disable re-invoked too much time
            ns_VNCal.alertOnce = false;
            // Stop currently audio
            ns_VNCal.audio.pause();
            ns_VNCal.audio.loop = true; // Repeated allow
            ns_VNCal.audio.play();
            // Set event to repeat sound
            ns_VNCal.audio.addEventListener('ended', function() {
                this.currentTime = 0;
                if (ns_VNCal.audio.loop) {
                    this.play();
                }
            }, false);
            var self = this;
            var combineEventName = ""
            for (var i = 0; i < ns_VNCal.titleArr.length; i++) {
                combineEventName += ns_VNCal.titleArr[i] + "<br>";
            }
            // Send to display alert
            this.sendNotification("SHOW_ALERT", {
                type: "notification",
                title: '<b>' + this.translate("EVENT_IS_COMING") + '</b>',
                message: "<b>" + combineEventName + "</b>",
                timer: self.config.alertSoundTimer
            });
            // Delay a time, then reset variables for next alert
            var intervalAlert = setInterval(function() {
                clearInterval(intervalAlert);
                ns_VNCal.alertOnce = true;
                ns_VNCal.titleArr = [];
                ns_VNCal.audio.loop = false;
            }, self.config.alertSoundTimer);
        }
        // VIETNAM EVENTS
        if (this.config.displayLunarEvents && (ns_VNCal.currentPage == 0 || ns_VNCal.currentPage == ns_VNCal.numOfUrls)) {
            // Display a line to separate peronalCal and lunarCal only in last page, and on first page if has no google calendar object
            if (ns_VNCal.currentPage == 0 && ns_VNCal.numOfUrls != 0) {
                var separateRow = document.createElement("tr");
                var separateCell = document.createElement("td");
                separateCell.colSpan = "2";
                var getLine = document.createElement("hr");
                getLine.className = "separateLine";
                separateCell.appendChild(getLine);
                separateRow.appendChild(separateCell);
                wrapper.appendChild(separateRow);
            }
            var getNow = new Date();
            var getYear = getNow.getFullYear();
            var getVNEvent = DLObj[getNow.getMonth()];
            var maxEventQuantity = getVNEvent.length;
            if (this.config.maximumEntries <= maxEventQuantity) {
                maxEventQuantity = this.config.maximumEntries
            }
            for (var i = 0; i < maxEventQuantity; i++) {
                var eventArr = getVNEvent[i];
                if (eventArr.hasOwnProperty("evShow")) {
                    if (!eventArr.evShow) continue;
                }
                var getLunarInfo = getLunarDate(parseInt(eventArr.evDate), parseInt(eventArr.evMonth), getYear);
                var getLunarDay = ("0" + getLunarInfo.day).slice(-2);
                var getLunarMonth = ("0" + getLunarInfo.month).slice(-2);
                var getDOW = TUAN[(getLunarInfo.jd + 1) % 7];
                // DOM
                var eventWrapper = document.createElement("tr");
                eventWrapper.style.color = this.config.lunarColor;
                // Title
                var titleWrapper = document.createElement("td");
                titleWrapper.innerHTML = this.titleTransform(eventArr.evTitle);
                titleWrapper.className = "title bold";
                eventWrapper.appendChild(titleWrapper);
                wrapper.appendChild(eventWrapper);
                // Time
                var timeWrapper = document.createElement("td");
                timeWrapper.innerHTML = getDOW + ", " + eventArr.evDate + "/" + eventArr.evMonth;
                timeWrapper.className = "time bold";
                if (this.config.displayLunarDate) {
                    var supTimeWrapper = document.createElement("sup");
                    supTimeWrapper.innerHTML = "(" + getLunarDay + "/" + getLunarMonth + ")";
                    supTimeWrapper.className = "bottomLunarDate bold";
                    timeWrapper.appendChild(supTimeWrapper);
                }
                eventWrapper.appendChild(timeWrapper);
                wrapper.appendChild(eventWrapper);
            }
        }
        // Create switch buttons
        if (this.config.displaySwitchBtn && isCalendarsAvailable(this.config)) {
            var buttonsRow = document.createElement("tr");
            var buttonsCell = document.createElement("td");
            buttonsCell.colSpan = "2";
            var preBtn = document.createElement("BUTTON");
            var nextBtn = document.createElement("BUTTON");
            preBtn.innerHTML = "<---";
            preBtn.addEventListener("click", () => this.switchCalendar("PRE"));
            preBtn.className = "calendarSwitchBtn";
            buttonsCell.appendChild(preBtn);
            // Page indicator
            if (this.config.displayPageIndicator) {
                var indicatorPages = document.createElement("span");
                indicatorPages.className = "indicatorPages bold";
                indicatorPages.innerHTML = " " + parseInt(ns_VNCal.currentPage + 1) + "/" + parseInt(ns_VNCal.numOfUrls + 1) + " ";
                buttonsCell.appendChild(indicatorPages);
            }
            else
            {
                // If doesn't show indicator, re-set width of buttons for better UI
                preBtn.style.width = "175px";
                nextBtn.style.width = "175px";
            }
            nextBtn.innerHTML = "--->";
            nextBtn.addEventListener("click", () => this.switchCalendar("NEXT"));
            nextBtn.className = "calendarSwitchBtn";
            buttonsCell.appendChild(nextBtn);
            buttonsRow.appendChild(buttonsCell);
            wrapper.appendChild(buttonsRow);
        }
        else if (!this.config.displaySwitchBtn && isCalendarsAvailable(this.config))
        {
            // Page indicator without buttons
            if (this.config.displayPageIndicator) {
                var indicatorRow = document.createElement("tr");
                var indicatorCell = document.createElement("td");
                indicatorCell.colSpan = "2";
                var indicatorPages = document.createElement("BUTTON");
                indicatorPages.className = "indicatorPagesWithoutSwitchButton";
                indicatorPages.innerHTML = " " + parseInt(ns_VNCal.currentPage + 1) + "/" + parseInt(ns_VNCal.numOfUrls + 1) + " ";
                indicatorCell.appendChild(indicatorPages);
                indicatorRow.appendChild(indicatorCell);
                wrapper.appendChild(indicatorRow);
            }
        }
        return wrapper;
    },
    // Switch calendar from external notification
    notificationReceived: function(notification, payload, sender) {
        if (notification == "PREVIOUS_CALENDAR") {
            this.switchCalendar("PRE");
        } else if (notification == "NEXT_CALENDAR") {
            this.switchCalendar("NEXT");
        } else if (notification == "SWITCH_TO_ALL_CALENDARS") {
            this.switchCalendar("ALL"); // Switch to first calendar (All calendar will be displayed)
        }
    },
    /**
     * This func will be switched to pre/next calendar inside ns_VNCal.arrUrls[]
     *
     * @param {string} mode, "ALL" is at page 0
     *
     */
    switchCalendar: function(mode) {
        // Switch button only works when we have more than 1 google calendar
        if (isCalendarsAvailable(this.config)) {
            if (mode == "ALL") {
                ns_VNCal.currentPage = 0;
            } else if (mode == "PRE") {
                if (ns_VNCal.currentPage == 0) {
                    ns_VNCal.currentPage = ns_VNCal.numOfUrls; // Last page
                } else {
                    ns_VNCal.currentPage--;
                }
            } else if (mode == "NEXT") {
                // Last page
                if (ns_VNCal.currentPage == ns_VNCal.numOfUrls) {
                    ns_VNCal.currentPage = 0;
                } else {
                    ns_VNCal.currentPage++;
                }
            }
            this.updateDom(this.config.animationSpeed);
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