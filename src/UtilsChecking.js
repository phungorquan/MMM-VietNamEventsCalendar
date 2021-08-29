/**
 * Check whether calendars{} is OK or not
 *
 * @returns {bool} - true is OK, false is !OK
 */
function isCalendarsAvailable(configs) {
    var isOK = true;
    if (configs.hasOwnProperty('calendars')) {
        for (var e in configs.calendars) {
            var event = configs.calendars[e];
            if (!event.hasOwnProperty('url') || !event.hasOwnProperty('color') || !event.hasOwnProperty('title')) {
                console.log("Please input 'url', 'color', and 'title' into personalDateEvent{}");
                isOK = false;
                break;
            }
            if (event.url == "" || event.color == "" || event.title == "") {
                console.log("Please input correctly 'url', 'color', and 'title' into personalDateEvent{}");
                isOK = false;
                break;
            }
        }
    } else {
        console.log("Please add personalDateEvent{} in defaults{} config in this file");
        isOK = false;
    }
    return isOK;
}
/**
 * Check whether personalDateEvent{} is OK or not
 *
 * @returns {bool} - true is OK, false is !OK
 */
function isPersonalEventsAvailable(configs) {
    var isOK = true;
    if (configs.hasOwnProperty('personalDateEvent')) {
        for (var e in configs.personalDateEvent) {
            var event = configs.personalDateEvent[e];
            if (!event.hasOwnProperty('day') || !event.hasOwnProperty('month') || !event.hasOwnProperty('title')) {
                console.log("Please input 'day', 'month', and 'title' into personalDateEvent{}");
                isOK = false;
                break;
            }
        }
    } else {
        console.log("Please add personalDateEvent{} in defaults{} config in this file");
        isOK = false;
    }
    return isOK;
}