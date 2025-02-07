// take the events from the local storage
function getEventsFromStorage() {
    return JSON.parse(localStorage.getItem("events")) || {};
}

// Save event to local storage
function saveEventToStorage(dateKey, event) {
    let eventStorage = getEventsFromStorage();

    // The key is the date, and the value is an array of events
    if (!eventStorage[dateKey]) {
        eventStorage[dateKey] = [];
    }

    // Check if the event already exists
    let exists = eventStorage[dateKey].some(e => e.title === event.title && e.time === event.time);
    if (!exists) {
        eventStorage[dateKey].push(event);
        localStorage.setItem("events", JSON.stringify(eventStorage));
    }
}

// Update the calendar events
function updateCalendarEvents(currentDate) {
    let eventStorage = getEventsFromStorage();
    document.querySelectorAll(".day-cell").forEach((cell) => {
        const day = cell.querySelector(".date-number")?.textContent.trim();
        const month = currentDate.getMonth() + 1; // actual month
        const year = currentDate.getFullYear();
        const key = `${year}-${month}-${day}`;

        let eventContainer = cell.querySelector(".event-container");
        if (!eventContainer) {
            eventContainer = document.createElement("div");
            eventContainer.classList.add("event-container");
            cell.appendChild(eventContainer);
        }
        eventContainer.innerHTML = ""; // clear the event container

        if (eventStorage[key] && eventStorage[key].length > 0) {
            cell.classList.add("event-day");
            eventStorage[key].forEach((event) => {
                let eventElement = document.createElement("span");
                eventElement.textContent = `${event.title} (${event.time})`;
                eventContainer.appendChild(eventElement);
            });
        } else {
            cell.classList.remove("event-day");
        }
    });
}
