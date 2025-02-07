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
  // async function getJaguim(year, month) {
  //   try {
  //     let response = await fetch(
  //       `https://www.hebcal.com/holidays?cfg=json&year=${year}&month=${month}&geo=none&maj=on&min=on&mod=on`
  //     );
  //     let data = await response.json();
  //     let jaguim = data.items || [];

  //     let events = getEventsFromStorage();
  //     jaguim.forEach((jag) => {
  //       let [gYear, gMonth, gDay] = jag.date.split("T")[0].split("-").map(Number);
  //       let key = `${gYear}-${gMonth}-${gDay}`;

  //       if (!events.some((e) => e.title === jag.title && e.date === key)) {
  //         events.push({
  //           title: jag.title,
  //           description: "Jewish holiday",
  //           time: "All day",
  //           date: key,
  //           isJag: true,
  //         });
  //       }
  //     });

  //     localStorage.setItem("events", JSON.stringify(events));
  //     return jaguim;
  //   } catch (error) {
  //     console.error("Error fetching Jewish holidays:", error);
  //     return [];
  //   }
  // }

  async function renderCalendar() {
    calendar.innerHTML = "";

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();
    let currentDay = currentDate.getDay();
    let firstDay = new Date(year, month, 1).getDay();
    let lastDay = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = currentDate.toLocaleString("en-GB", {
      month: "long",
      year: "numeric",
    });

    let events = getEventsFromStorage();
    console.log("events from storage: ", events);

    let day = 1;
    for (let i = 0; i < 6; i++) {
      let row = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        let cell = document.createElement("td");
        cell.classList.add("day-cell");

        if (i === 0 && j < firstDay) {
          cell.textContent = "";
        } else if (day > lastDay) {
          break;
        } else {
          let key = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`;
          //let key = ${year}-${month + 1}-${day};
          console.log("key: ", key);

          let dateSpan = document.createElement("span");
          dateSpan.textContent = day;
          dateSpan.classList.add("date-number");
          cell.appendChild(dateSpan);

          let hebrewDateSpan = document.createElement("small");
          hebrewDateSpan.classList.add("hebrew-date");

          HebrewDateManager.getHebrewDate(year, month + 1, day).then(
            (hebrewDate) => {
              hebrewDateSpan.textContent = hebrewDate;
            }
          );

          cell.appendChild(hebrewDateSpan);

          let eventContainer = document.createElement("div");
          eventContainer.classList.add("event-container");
          cell.appendChild(eventContainer);
          //cell.appendChild(eventContainer);
          

          let dayEvents = events.filter((event) => event.date === key);
          dayEvents.forEach((event) => {
            console.log("eventDate: ", event.date);
            
            let eventElement = document.createElement("span");
            console.log("eventElement: ", eventElement);
            eventElement.textContent = `${event.title} (${event.time})`;
            console.log("eventElement.textContrente: ", eventElement.textContent);
            
            eventElement.classList.add(
              event.isJag ? "jag-event" : "event-card"
            );
            eventContainer.appendChild(eventElement);
            console.log("eventContainer después de appendChild: ", eventContainer);
            
          });
          let currentDate = new Date(year, month, day);
          if (
            currentDate.getDate() === today.getDate()
          ) {
            console.log("today: ", today);
            cell.classList.add("today"); // to highlight today's date
          } else if (currentDate < today) {
            cell.classList.add("past-day"); // to highlight past days
            cell.classList.add("disabled");
          }
          day++;
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
  });

  nextButton.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  toggleWeeklyViewButton.addEventListener("click", function () {
    window.location.href = "../views/weekly.html";
  });

  renderCalendar();
});