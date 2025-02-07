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
  async function getJewishHolidays(year, month) {
    try {
      let response = await fetch(
        `https://www.hebcal.com/holidays?cfg=json&year=${year}&month=${month}&geo=none&maj=on&min=on&mod=on`
      );
      let data = await response.json();
      return data.items; // return the jaguim
    } catch (error) {
      console.error("Error fetching Jewish holidays:", error);
      return [];
    }
  }

  async function renderCalendar() {
    // To clear the claendar
    calendar.innerHTML = "";

    // define the different variables
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();
    let firstDay = new Date(year, month, 1).getDay();
    let lastDay = new Date(year, month + 1, 0).getDate();

    // to set the title of the calendar
    monthYear.textContent = currentDate.toLocaleString("en-GB", {
      month: "long",
      year: "numeric",
    });

    let holidays = await getJewishHolidays(year, month + 1);

    let date = 1;
    for (let i = 0; i < 6; i++) {
      let row = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        let cell = document.createElement("td");
        cell.classList.add("day-cell");

        if (i === 0 && j < firstDay) {
          cell.textContent = ""; // empties cells before the first day of the month
        } else if (date > lastDay) {
          break; // stops the loop when find the last day of the month
        } else {
          // add the day number
          let dateSpan = document.createElement("span");
          dateSpan.textContent = date;
          dateSpan.classList.add("date-number");
          // add the hebrew date
          let hebrewDateSpan = document.createElement("small");
          hebrewDateSpan.classList.add("hebrew-date");
          hebrewDateSpan.textContent = await HebrewDateManager.getHebrewDate(
            year,
            month + 1,
            date
          );

          let eventContainer = document.createElement("div");
          eventContainer.classList.add("event-container");
          cell.appendChild(dateSpan);
          cell.appendChild(hebrewDateSpan);
          cell.appendChild(eventContainer);

          let key = `${year}-${month + 1}-${date}`;
          let storedEvents = getEventsFromStorage();
          if (storedEvents[key] && storedEvents[key].length > 0) {
            cell.classList.add("event-day");
            storedEvents[key].forEach((event) => {
              let eventElement = document.createElement("span");
              eventElement.textContent = `${event.title} (${event.time})`;
              eventContainer.appendChild(eventElement);
            });
          }
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
          // add the jaguim
          if (holidays.length > 0) {
            holidays.forEach((holiday) => {
              if (holiday.date === `${year}-${month + 1}-${date}`) {
                let holidayElement = document.createElement("span");
                holidayElement.textContent = holiday.title;
                holidayElement.classList.add("holiday");
                eventContainer.prepend(holidayElement);
                cell.classList.add("holiday-day");
              }
            });
          }
          date++;
        }
        row.appendChild(cell); // appends the cell to the row
      }
      calendar.appendChild(row); // appends the row to the calendar
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
