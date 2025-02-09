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
    const date = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    const modalElement = document.getElementById("eventModal");
    const existingModal = bootstrap.Modal.getInstance(modalElement);
    if (existingModal) {
      existingModal.hide();
    }

    document.getElementById("eventDate").value = date.split(" ")[0];
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("eventTime").value = "";

    document.activeElement.blur();
    new bootstrap.Modal(modalElement).show();
  }

  function saveEvent() {
    let eventDate = document.getElementById("eventDate").value.trim();
    eventDate = eventDate.replace(/[^\d\-]/g, "");

    const title = document.getElementById("eventTitle").value.trim();
    const description = document
      .getElementById("eventDescription")
      .value.trim();
    const time = document.getElementById("eventTime").value;

    let [year, month, day] = eventDate.split("-").map(Number);
    const date = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

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
    let confirmSync = confirm("Do you want to sync with Google Calendar?");
    if (confirmSync) {
      handleAuthClick();
      addEventToGoogleCalendar(newEvent);
    }
    renderCalendar();
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
      // close the modal
      bootstrap.Modal.getInstance(document.getElementById("eventModal")).hide();
    }
  });

  // Event listener to open the modal when clicking on a day cell
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("day-cell")) {
      const day = e.target.textContent.trim();
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      openModal(day, month, year);
    }
  });
});

