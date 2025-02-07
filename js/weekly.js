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
    let weeklyContainer = document.querySelector(".weekly-container");
    weeklyContainer.classList.add("fade");

    setTimeout(() => {
      weeklyContainer.classList.remove("fade");
    }, 500);

    if (!weekDaysContainer) {
      console.error("The weekDaysContainer element is not found.");
      return;
    }

    const { start, end } = getWeekRange(currentDate);
    weekRangeTitle.textContent = `${formatDate(start)} - ${formatDate(end)}`;

    weekDaysContainer.innerHTML = "";
    let today = new Date();

    let storedEvents = getEventsFromStorage();

    for (let i = 0; i < 7; i++) {
      let day = new Date(start);
      day.setDate(start.getDate() + i);
      let dayKey = `${day.getFullYear()}-${
        day.getMonth() + 1
      }-${day.getDate()}`;

      let dayColumn = document.createElement("div");
      dayColumn.classList.add("day-column");

      if (
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear()
      ) {
        dayColumn.classList.add("today-weekly");
      }

      let dayHeader = document.createElement("div");
      dayHeader.classList.add("day-header");

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
      console.log("date", await HebrewDateManager.getHebrewDate(2025, 2, 8));

      // add the title and the hebrew date to the day header
      dayHeader.appendChild(dayTitle);
      dayHeader.appendChild(hebrewDateSpan);

      // add the day header to the day column
      dayColumn.appendChild(dayHeader);

      let events = storedEvents[dayKey] || [];
      events.sort((a, b) => (a.isHoliday ? -1 : 1));

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
