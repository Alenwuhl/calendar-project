import { HebrewDateManager } from "./hebrewDates.js";

document.addEventListener("DOMContentLoaded", function () {
  const monthYear = document.getElementById("monthYear");
  const calendar = document.getElementById("calendarBody");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const toggleWeeklyViewButton = document.getElementById(
    "toggleWeeklyViewButton"
  );

  // Current date (changes when the user clicks on the next or previous button)
  let currentDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
  );
  // Today's date (never changes)
  let today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
  );
  console.log("current date: ", currentDate);

  // get the jaguim
  async function getJaguim(year, month) {
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
      return jaguim;
    } catch (error) {
      console.error("Error fetching Jewish holidays:", error);
      return [];
    }
  }
  
  async function renderCalendar() {
    calendar.innerHTML = "";

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();
    let firstDay = new Date(year, month, 1).getDay();
    let lastDay = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = currentDate.toLocaleString("en-GB", {
      month: "long",
      year: "numeric",
    });

    let events = getEventsFromStorage();

    let date = 1;
    for (let i = 0; i < 6; i++) {
      let row = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        let cell = document.createElement("td");
        cell.classList.add("day-cell");

        if (i === 0 && j < firstDay) {
          cell.textContent = "";
        } else if (date > lastDay) {
          break;
        } else {
          let key = `${year}-${month + 1}-${date}`;

          let dateSpan = document.createElement("span");
          dateSpan.textContent = date;
          dateSpan.classList.add("date-number");
          cell.appendChild(dateSpan);

          let hebrewDateSpan = document.createElement("small");
          hebrewDateSpan.classList.add("hebrew-date");

          HebrewDateManager.getHebrewDate(year, month + 1, date).then(
            (hebrewDate) => {
              hebrewDateSpan.textContent = hebrewDate;
            }
          );

          cell.appendChild(hebrewDateSpan); // ✅ Se agrega solo al DOM

          let eventContainer = document.createElement("div");
          eventContainer.classList.add("event-container");
          cell.appendChild(eventContainer);

          let dayEvents = events.filter((event) => event.date === key);
          dayEvents.forEach((event) => {
            let eventElement = document.createElement("span");
            eventElement.textContent = `${event.title} (${event.time})`;
            eventElement.classList.add(
              event.isJag ? "holiday-event" : "event-card"
            );
            eventContainer.appendChild(eventElement);
          });
          if (
            date === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
          ) {
            console.log("today: ", today);
            cell.classList.add("today"); // to highlight today's date
          } else if (new Date(year, month, date) < today) {
            cell.classList.add("past-day"); // to highlight past days
            cell.classList.add("disabled");
          }
          date++;
        }
        row.appendChild(cell);
      }
      calendar.appendChild(row);
    }
  }

  // Event listeners for the previous and next buttons
  prevButton.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    updateCalendarEvents(currentDate);
  });

  nextButton.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    updateCalendarEvents(currentDate);
  });

  toggleWeeklyViewButton.addEventListener("click", function () {
    window.location.href = "../views/weekly.html";
  });

  renderCalendar();
  updateCalendarEvents(currentDate);
});
