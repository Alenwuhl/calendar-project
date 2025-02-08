const monthYear = document.getElementById("monthYear");
const calendar = document.getElementById("calendarBody");

// Current date (changes when the user clicks on the next or previous button)
let currentDate = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
);
// Today's date (never changes)
let today = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
);

const renderCalendar = () => {
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

        let dayEvents = events.filter((event) => event.date === key);
        dayEvents.forEach((event) => {

          let eventElement = document.createElement("span");
          eventElement.textContent = `${event.title} (${event.time})`;

          eventElement.classList.add(event.isJag ? "jag-event" : "event-card");
          eventContainer.appendChild(eventElement);
        });
        let currentDate = new Date(year, month, day);
        if (
          currentDate.getFullYear() === today.getFullYear() &&
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getDay() === today.getDay() &&
          currentDate.getDate() === today.getDate()
        ) {
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
};

document.addEventListener("DOMContentLoaded", async function () {
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const toggleWeeklyViewButton = document.getElementById(
    "toggleWeeklyViewButton"
  );
  await getJaguim(new Date().getFullYear());  // Obtiene y almacena los jaguim
    renderCalendar();  


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
// get the jaguim
async function getJaguim(year) {
  try {
      let response = await fetch(`https://www.hebcal.com/hebcal?v=1&year=${year}&cfg=json&maj=on&min=on&mod=on`);
      let data = await response.json();
      
      let jaguim = data.items || [];

      // get events from localStorage
      let events = JSON.parse(localStorage.getItem("events")) || [];

      jaguim.forEach((jag) => {
          let [gYear, gMonth, gDay] = jag.date.split("T")[0].split("-").map(Number);
          let key = `${gYear}-${gMonth.toString().padStart(2, "0")}-${gDay.toString().padStart(2, "0")}`;

          // check if the event is already in the events array
          if (!events.some((e) => e.title === jag.title && e.date === key)) {
              events.push({
                  title: jag.title,
                  description: jag.memo || "Jewish holiday",
                  time: "All day",
                  date: key,
                  isJag: true,
              });
          }
      });

      // save events in localStorage
      localStorage.setItem("events", JSON.stringify(events));

      console.log("Jaguim guardados en localStorage:", events);
      return jaguim;
  } catch (error) {
      console.error("Error fetching Jewish holidays:", error);
      return [];
  }
}