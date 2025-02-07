document.addEventListener("DOMContentLoaded", function () {
    //load de modal from other file
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
  
    //function to open de modal
    function openModal(day, month, year) {
      const key = `${year}-${month + 1}-${day}`; // month +1 because months start from january 0
  
      // to be sure that the modal is not already open
      const modalElement = document.getElementById("eventModal");
      const existingModal = bootstrap.Modal.getInstance(modalElement);
      if (existingModal) {
        existingModal.hide();
      }
  
      const storedEvents = getEventsFromStorage();
      const eventData = storedEvents[key] || {};
  
      document.getElementById("eventDate").value = key;
      document.getElementById("eventTitle").value = eventData.title || "";
      document.getElementById("eventDescription").value = eventData.description || "";
      document.getElementById("eventTime").value = eventData.time || "";
      document.activeElement.blur();
      new bootstrap.Modal(document.getElementById("eventModal")).show();
    }
  
    function updateCalendarEvents() {
      const storedEvents = getEventsFromStorage();
      document.querySelectorAll(".day-cell").forEach((cell) => {
        const day = cell.textContent.trim();
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        const key = `${year}-${month + 1}-${day}`;
  
        cell.innerHTML = ""; // clear the cell
  
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
          eventContainer.appendChild(eventElement);
        });
      });
    }
  
    // Event listener to submit the form
    document.addEventListener("submit", function (e) {
      if (e.target && e.target.id === "eventForm") {
        e.preventDefault();
  
        const key = document.getElementById("eventDate").value;
        const title = document.getElementById("eventTitle").value.trim();
        const description = document.getElementById("eventDescription").value.trim();
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