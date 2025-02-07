document.addEventListener("DOMContentLoaded", function () {
  // Load the modal
  fetch("../views/modal.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("beforeend", data);

      const eventForm = document.getElementById("eventForm");
      if (eventForm) {
        eventForm.addEventListener("submit", (e) => {
          e.preventDefault();
          saveEvent();
        });
      }
    });

  //to open de modal
  function openModal(day, month, year) {
    const date = `${year}-${month + 1}-${day}`;

    const modalElement = document.getElementById("eventModal");
    const existingModal = bootstrap.Modal.getInstance(modalElement);
    if (existingModal) {
      existingModal.hide();
    }

    document.getElementById("eventDate").value = date;
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("eventTime").value = "";

    document.activeElement.blur();
    new bootstrap.Modal(modalElement).show();
  }

  function saveEvent() {
    const date = document.getElementById("eventDate").value.trim();
    const title = document.getElementById("eventTitle").value.trim();
    const description = document
      .getElementById("eventDescription")
      .value.trim();
    const time = document.getElementById("eventTime").value;

    if (!title || !time) {
      alert("Title and time are required!");
      return;
    }

    let newEvent = {
      title,
      description,
      time,
      date,
    };

    saveEventToStorage(newEvent);
    bootstrap.Modal.getInstance(document.getElementById("eventModal")).hide();
    updateCalendarEvents();
  }

  function updateCalendarEvents() {
    const storedEvents = getEventsFromStorage();
    document.querySelectorAll(".day-cell").forEach((cell) => {
      const day = cell.textContent.trim();
      const month = new Date().getMonth();
      const year = new Date().getFullYear();
      const key = `${year}-${month + 1}-${day}`;

      cell.innerHTML = ""; // clean the cell

      // add the day number
      let dateSpan = document.createElement("span");
      dateSpan.textContent = day;
      dateSpan.classList.add("date-number");
      cell.appendChild(dateSpan);

      // add the event container
      let eventContainer = document.createElement("div");
      eventContainer.classList.add("event-container");
      cell.appendChild(eventContainer);

      // add the event to the cell
      if (!Array.isArray(storedEvents[key])) {
        storedEvents[key] = storedEvents[key] ? [storedEvents[key]] : [];
      }
      storedEvents[key].forEach((event) => {
        let eventElement = document.createElement("span");
        eventElement.textContent = `${event.title} (${event.time})`;
        eventElement.classList.add("event-card");

        // different for the jaguim
        if (event.isJag) {
          eventElement.classList.add("jag-event");
        }

        // add the animation
        eventElement.style.animation = "eventAppear 0.3s ease-in-out";
      });
    });
  }

  // Event listener to submit the form
  document.addEventListener("submit", function (e) {
    if (e.target && e.target.id === "eventForm") {
      e.preventDefault();

      const key = document.getElementById("eventDate").value;
      const title = document.getElementById("eventTitle").value.trim();
      const description = document
        .getElementById("eventDescription")
        .value.trim();
      const time = document.getElementById("eventTime").value;

      if (!title || !time) {
        alert("Title and time are required!");
        return;
      }

      // save the events in the local storage
      saveEventToStorage(key, { title, description, time });

      // close the modal
      bootstrap.Modal.getInstance(document.getElementById("eventModal")).hide();

      // update the calendar
      updateCalendarEvents();
    }
  });

  // Event listener to open the modal when clicking on a day cell
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("day-cell")) {
      const day = e.target.textContent.trim();
      const month = new Date().getMonth();
      const year = new Date().getFullYear();
      openModal(day, month, year);
    }
  });

  updateCalendarEvents();
});

async function fetchJaguim(year, month) {
  try {
    let response = await fetch(
      `https://www.hebcal.com/holidays?cfg=json&year=${year}&month=${month}&geo=none&maj=on&min=on&mod=on`
    );
    let data = await response.json();
    let jaguim = data.items || [];

    let events = getEventsFromStorage();

    jaguim.forEach((jag) => {
      let [gYear, gMonth, gDay] = jag.date.split("T")[0].split("-").map(Number);
      let key = `${gYear}-${gMonth}-${gDay}`; 

      if (!events.some((e) => e.title === jag.title && e.date === key)) {
        events.push({
          title: jag.title,
          description: "Jewish holiday",
          time: "All day",
          date: key, 
          isJag: true,
        });
      }
    });

    localStorage.setItem("events", JSON.stringify(events));
  } catch (error) {
    console.error("Error fetching the Jaguim:", error);
  }
}
