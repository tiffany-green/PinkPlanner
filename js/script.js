const PINKPLANNER_FEED_URL =
    "https://script.google.com/macros/s/AKfycbw1XwN-NLZNGibVRrbiu9nsyqWIvfFzVnCZThyTUqNYNWrI8nDNmivIqlo43Vhcat6yVA/exec";

let allCalendarEvents = [];

let displayedYear =
    new Date().getFullYear();

let displayedMonth =
    new Date().getMonth();

let feedScript = null;
let feedTimeout = null;


window.onload = function () {

    updateHeaderDate();

    buildCalendar(
        displayedYear,
        displayedMonth,
        []
    );

    setupMonthNavigation();

    loadCalendarFeed();


    // Refresh Google Calendar automatically
    // every 10 minutes.
    setInterval(
        loadCalendarFeed,
        10 * 60 * 1000
    );
};



function loadCalendarFeed() {

    const status =
        document.getElementById(
            "google-status"
        );


    if (status) {
        status.textContent =
            "Syncing Google Calendar... 🌸";
    }


    // Remove the previous feed request
    // before making a new one.
    if (feedScript) {
        feedScript.remove();
        feedScript = null;
    }


    if (feedTimeout) {
        clearTimeout(feedTimeout);
    }


    feedScript =
        document.createElement(
            "script"
        );


    feedScript.src =
        `${PINKPLANNER_FEED_URL}?t=${Date.now()}`;


    feedScript.onerror =
        function () {

            if (status) {
                status.textContent =
                    "Calendar sync could not be loaded.";
            }

            console.error(
                "PinkPlanner feed failed to load."
            );
        };


    document.body.appendChild(
        feedScript
    );


    // If Google never answers,
    // show an error instead of
    // saying "syncing" forever.
    feedTimeout =
        setTimeout(
            function () {

                if (
                    status &&
                    status.textContent.includes(
                        "Syncing"
                    )
                ) {
                    status.textContent =
                        "Calendar sync timed out.";
                }

            },
            15000
        );
}



/*
    Google Apps Script calls this
    automatically when the feed loads.
*/
window.pinkPlannerCalendarCallback =
    function (data) {

        if (feedTimeout) {
            clearTimeout(feedTimeout);
        }


        if (
            !data ||
            !Array.isArray(data.events)
        ) {

            console.error(
                "PinkPlanner received invalid calendar data:",
                data
            );

            const status =
                document.getElementById(
                    "google-status"
                );

            if (status) {
                status.textContent =
                    "Calendar data could not be read.";
            }

            return;
        }


        allCalendarEvents =
            data.events;


        allCalendarEvents.sort(
            (a, b) =>
                eventStartDate(a) -
                eventStartDate(b)
        );


        console.log(
            "PinkPlanner automatically synced:",
            allCalendarEvents
        );


        buildCalendar(
            displayedYear,
            displayedMonth,
            allCalendarEvents
        );


        showUpcomingEvents(
            allCalendarEvents
        );


        const status =
            document.getElementById(
                "google-status"
            );


        if (status) {

            const syncTime =
                new Date()
                    .toLocaleTimeString(
                        "en-US",
                        {
                            hour: "numeric",
                            minute: "2-digit"
                        }
                    );


            status.textContent =
                `Google Calendar synced ✓ ${syncTime}`;
        }
    };



function updateHeaderDate() {

    const now =
        new Date();


    const heading =
        document.querySelector(
            "header h1"
        );


    const year =
        document.querySelector(
            "header p"
        );


    if (heading) {

        heading.textContent =
            now.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            );
    }


    if (year) {

        year.textContent =
            now.getFullYear();
    }
}



function buildCalendar(
    year,
    month,
    events
) {

    const now =
        new Date();


    const monthTitle =
        document.querySelector(
            ".calendar-card h2"
        );


    const calendar =
        document.querySelector(
            ".calendar"
        );


    if (
        !monthTitle ||
        !calendar
    ) {
        return;
    }


    displayedYear =
        year;


    displayedMonth =
        month;


    monthTitle.textContent =
        new Date(
            year,
            month,
            1
        ).toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendar.innerHTML =
        "";


    const firstWeekday =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();



    // Blank spaces before the 1st
    for (
        let i = 0;
        i < firstWeekday;
        i++
    ) {

        const blank =
            document.createElement(
                "div"
            );


        blank.classList.add(
            "empty-day"
        );


        calendar.appendChild(
            blank
        );
    }



    // Build every day
    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayBox =
            document.createElement(
                "div"
            );


        dayBox.classList.add(
            "day-box"
        );



        // Highlight today
        if (
            year ===
                now.getFullYear() &&

            month ===
                now.getMonth() &&

            day ===
                now.getDate()
        ) {

            dayBox.classList.add(
                "today"
            );
        }



        const dayNumber =
            document.createElement(
                "div"
            );


        dayNumber.classList.add(
            "day-number"
        );


        dayNumber.textContent =
            day;


        dayBox.appendChild(
            dayNumber
        );



        const dayKey =
            makeDateKey(
                year,
                month + 1,
                day
            );



        const eventsForDay =
            events.filter(
                event =>
                    eventOccursOnDate(
                        event,
                        dayKey
                    )
            );



        eventsForDay
            .slice(0, 3)
            .forEach(
                event => {

                    const eventItem =
                        document.createElement(
                            "div"
                        );


                    eventItem.classList.add(
                        "calendar-event",
                        event.className
                    );


                    eventItem.textContent =
                        `${event.icon} ${event.title}`;


                    dayBox.appendChild(
                        eventItem
                    );
                }
            );



        if (
            eventsForDay.length > 3
        ) {

            const more =
                document.createElement(
                    "div"
                );


            more.classList.add(
                "more-events"
            );


            more.textContent =
                `+${eventsForDay.length - 3} more`;


            dayBox.appendChild(
                more
            );
        }


        calendar.appendChild(
            dayBox
        );
    }


    updateYearOverview();
}



function setupMonthNavigation() {

    const arrows =
        document.querySelectorAll(
            ".month-arrow"
        );


    if (
        arrows.length >= 2
    ) {

        arrows[0].style.cursor =
            "pointer";


        arrows[1].style.cursor =
            "pointer";


        arrows[0].addEventListener(
            "click",
            function () {
                changeMonth(-1);
            }
        );


        arrows[1].addEventListener(
            "click",
            function () {
                changeMonth(1);
            }
        );
    }



    const monthButtons =
        document.querySelectorAll(
            ".months span"
        );


    monthButtons.forEach(
        (button, index) => {

            button.style.cursor =
                "pointer";


            button.addEventListener(
                "click",
                function () {

                    displayedMonth =
                        index;


                    buildCalendar(
                        displayedYear,
                        displayedMonth,
                        allCalendarEvents
                    );
                }
            );
        }
    );
}



function changeMonth(amount) {

    displayedMonth +=
        amount;


    if (
        displayedMonth > 11
    ) {

        displayedMonth =
            0;


        displayedYear++;
    }


    if (
        displayedMonth < 0
    ) {

        displayedMonth =
            11;


        displayedYear--;
    }


    buildCalendar(
        displayedYear,
        displayedMonth,
        allCalendarEvents
    );
}



function updateYearOverview() {

    const monthButtons =
        document.querySelectorAll(
            ".months span"
        );


    monthButtons.forEach(
        (button, index) => {

            button.classList.remove(
                "active-month"
            );


            if (
                index ===
                displayedMonth
            ) {

                button.classList.add(
                    "active-month"
                );
            }
        }
    );
}



function eventOccursOnDate(
    event,
    dayKey
) {

    if (
        event.isAllDay
    ) {

        return (
            dayKey >=
                event.start &&

            dayKey <
                event.end
        );
    }



    const start =
        new Date(
            event.start
        );


    const end =
        new Date(
            event.end
        );


    const startKey =
        localDateKey(
            start
        );


    const endKey =
        localDateKey(
            end
        );


    return (
        dayKey >=
            startKey &&

        dayKey <=
            endKey
    );
}



function showUpcomingEvents(
    events
) {

    const panels =
        document.querySelectorAll(
            ".panel"
        );


    let panel =
        null;


    panels.forEach(
        candidate => {

            const heading =
                candidate.querySelector(
                    "h3"
                );


            if (
                heading &&
                heading.textContent.trim() ===
                    "Upcoming Events"
            ) {

                panel =
                    candidate;
            }
        }
    );


    if (!panel) {

        console.error(
            "Upcoming Events panel not found."
        );

        return;
    }



    panel.innerHTML =
        "<h3>Upcoming Events</h3>";



    const todayKey =
        localDateKey(
            new Date()
        );



    const upcoming =
        events
            .filter(
                event => {

                    if (
                        event.isAllDay
                    ) {

                        return (
                            event.end >
                            todayKey
                        );
                    }


                    return (
                        new Date(
                            event.end
                        ) >=
                        new Date()
                    );
                }
            )
            .slice(
                0,
                8
            );



    if (
        upcoming.length === 0
    ) {

        panel.innerHTML +=
            "<p>No upcoming events found.</p>";

        return;
    }



    upcoming.forEach(
        event => {

            const formattedDate =
                formatEventStartDate(
                    event
                );


            const item =
                document.createElement(
                    "p"
                );


            item.classList.add(
                "upcoming-event"
            );


            item.textContent =
                `${event.icon} ${event.title} — ${formattedDate}`;


            panel.appendChild(
                item
            );
        }
    );
}



function formatEventStartDate(
    event
) {

    if (
        event.isAllDay
    ) {

        const parts =
            event.start
                .split("-")
                .map(Number);


        const date =
            new Date(
                parts[0],
                parts[1] - 1,
                parts[2],
                12,
                0,
                0
            );


        return (
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric"
                }
            )
        );
    }


    return (
        new Date(
            event.start
        ).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        )
    );
}



function eventStartDate(
    event
) {

    if (
        event.isAllDay
    ) {

        const parts =
            event.start
                .split("-")
                .map(Number);


        return new Date(
            parts[0],
            parts[1] - 1,
            parts[2],
            12,
            0,
            0
        );
    }


    return new Date(
        event.start
    );
}



function localDateKey(
    date
) {

    return makeDateKey(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    );
}



function makeDateKey(
    year,
    month,
    day
) {

    const paddedMonth =
        String(month)
            .padStart(
                2,
                "0"
            );


    const paddedDay =
        String(day)
            .padStart(
                2,
                "0"
            );


    return (
        `${year}-${paddedMonth}-${paddedDay}`
    );
}
/* =========================================
   LIVE WEATHER - VALENCIA CA 91355
   ========================================= */

async function updateWeather() {
    const weatherElement =
        document.querySelector(".weather");

    if (!weatherElement) {
        return;
    }

    try {
        const latitude = 34.40185;
        const longitude = -118.570014;

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,weather_code` +
            `&temperature_unit=fahrenheit` +
            `&timezone=America%2FLos_Angeles`;

        const response =
            await fetch(weatherURL);

        if (!response.ok) {
            throw new Error(
                `Weather request failed: ${response.status}`
            );
        }

        const data =
            await response.json();

        const temperature =
            Math.round(
                data.current.temperature_2m
            );

        const weatherCode =
            data.current.weather_code;

        const icon =
            weatherIcon(weatherCode);

        weatherElement.textContent =
            `${icon} ${temperature}°`;

        console.log(
            "PinkPlanner weather updated:",
            temperature,
            weatherCode
        );

    } catch (error) {

        console.error(
            "PinkPlanner weather error:",
            error
        );

        weatherElement.textContent =
            "🌤️ --°";
    }
}


function weatherIcon(code) {

    /* Clear */
    if (code === 0) {
        return "☀️";
    }

    /* Mostly clear */
    if (
        code === 1 ||
        code === 2
    ) {
        return "🌤️";
    }

    /* Cloudy */
    if (code === 3) {
        return "☁️";
    }

    /* Fog */
    if (
        code === 45 ||
        code === 48
    ) {
        return "🌫️";
    }

    /* Drizzle */
    if (
        code >= 51 &&
        code <= 57
    ) {
        return "🌦️";
    }

    /* Rain */
    if (
        code >= 61 &&
        code <= 67
    ) {
        return "🌧️";
    }

    /* Snow */
    if (
        code >= 71 &&
        code <= 77
    ) {
        return "❄️";
    }

    /* Rain showers */
    if (
        code >= 80 &&
        code <= 82
    ) {
        return "🌦️";
    }

    /* Snow showers */
    if (
        code === 85 ||
        code === 86
    ) {
        return "🌨️";
    }

    /* Thunderstorms */
    if (
        code >= 95
    ) {
        return "⛈️";
    }

    return "🌤️";
}


/* Load weather when PinkPlanner starts */
updateWeather();


/* Refresh weather every 10 minutes */
setInterval(
    updateWeather,
    10 * 60 * 1000
);
