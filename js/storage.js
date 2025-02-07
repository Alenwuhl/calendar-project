// take the events from the local storage
function getEventsFromStorage() {
  let events = JSON.parse(localStorage.getItem("events")) || [];

  if (!Array.isArray(events)) {
    events = [];
  }

  // sort the events
  events.sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    return a.time.localeCompare(b.time);
  });

  return events;
}

// Save event to local storage
function saveEventToStorage(event) {
    let events = getEventsFromStorage();

    if (typeof event === "object" && event !== null && typeof event.date === "string") {
        // Validate the date format
        if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(event.date)) {
            console.error("Invalid date format in event:", event.date);
            return;
        }
        events.push(event);
    } else {
        console.error("Invalid event object to save:", event);
        return;
    }

    localStorage.setItem("events", JSON.stringify(events));
}


function clearEventsFromStorage() {
  localStorage.setItem("events", JSON.stringify([]));
}

// Update the calendar events
function updateCalendarEvents(currentDate) {
  let eventStorage = getEventsFromStorage();
  document.querySelectorAll(".day-cell").forEach((cell) => {
    const day = cell.querySelector(".date-number")?.textContent.trim();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const key = `${year}-${month}-${day}`;

    let eventContainer = cell.querySelector(".event-container");
    if (!eventContainer) {
      eventContainer = document.createElement("div");
      eventContainer.classList.add("event-container");
      cell.appendChild(eventContainer);
    }
    eventContainer.innerHTML = "";

    let dayEvents = eventStorage.filter((e) => e.date === key);
    if (dayEvents.length > 0) {
      cell.classList.add("event-day");
      dayEvents.forEach((event) => {
        let eventElement = document.createElement("span");
        eventElement.textContent = `${event.title} (${event.time})`;
        eventElement.classList.add(
          event.isJag ? "holiday-event" : "event-card"
        );
        eventContainer.appendChild(eventElement);
      });
    } else {
      cell.classList.remove("event-day");
    }
  });
}
