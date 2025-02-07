import { HebrewDateManager } from "./hebrewDates.js";

document.addEventListener("DOMContentLoaded", function () {
  const weekDaysContainer = document.getElementById("weekDays");
  const weekRangeTitle = document.getElementById("weekRange");
  const prevWeekButton = document.getElementById("prevWeek");
  const nextWeekButton = document.getElementById("nextWeek");
  const toggleMonthViewButton = document.getElementById("toggleMonthView");

  let currentDate = new Date();

  function getWeekRange(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  async function loadWeekView() {
    if (!weekDaysContainer) {
      console.error("El contenedor de la vista semanal no está presente.");
      return;
    }

    const { start, end } = getWeekRange(currentDate);
    weekRangeTitle.textContent = `${formatDate(start)} - ${formatDate(end)}`;

    weekDaysContainer.innerHTML = "";

    for (let i = 0; i < 7; i++) {
      let day = new Date(start);
      day.setDate(start.getDate() + i);
      let dayKey = `${day.getFullYear()}-${
        day.getMonth() + 1
      }-${day.getDate()}`;

      let dayColumn = document.createElement("div");
      dayColumn.classList.add("day-column");

      let dayTitle = document.createElement("h5");
      dayTitle.textContent = formatDate(day);
      dayColumn.appendChild(dayTitle);

      let hebrewDateSpan = document.createElement("small");
      hebrewDateSpan.classList.add("hebrew-date");
      hebrewDateSpan.textContent = await HebrewDateManager.getHebrewDate(
        day.getFullYear(),
        day.getMonth() + 1,
        day.getDate()
      );

      let events = getEventsFromStorage()[dayKey] || [];
      events.sort((a, b) => a.time.localeCompare(b.time));

      let eventContainer = document.createElement("div");
      eventContainer.classList.add("event-container");

      if (events.length === 0) {
        eventContainer.innerHTML = "<p style='color:gray;'>No events</p>";
      }

      events.forEach((event) => {
        let eventCard = document.createElement("div");
        eventCard.classList.add("event-card");
        eventCard.innerHTML = `<strong>${event.title}</strong><br>${event.description}<br><small>${event.time}</small>`;
        eventContainer.appendChild(eventCard);
      });

      dayColumn.appendChild(eventContainer);
      weekDaysContainer.appendChild(dayColumn);
    }
  }

  prevWeekButton.addEventListener("click", function () {
    currentDate.setDate(currentDate.getDate() - 7);
    loadWeekView();
  });

  nextWeekButton.addEventListener("click", function () {
    currentDate.setDate(currentDate.getDate() + 7);
    loadWeekView();
  });

  toggleMonthViewButton.addEventListener("click", function () {
    window.location.href = "../views/index.html";
  });

  loadWeekView();
});
