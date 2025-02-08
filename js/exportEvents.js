function exportToICal() {
  let events = getEventsFromStorage();
  if (!events.length) {
    alert("No events to export.");
    return;
  }

  let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//My Calendar//EN\n`;

  events.forEach((event) => {
    let startDate =
      event.date.replace(/-/g, "") + "T" + event.time.replace(":", "") + "00Z";
    let endDate = startDate;

    icsContent += `BEGIN:VEVENT\n`;
    icsContent += `SUMMARY:${event.title}\n`;
    icsContent += `DESCRIPTION:${event.description}\n`;
    icsContent += `DTSTART:${startDate}\n`;
    icsContent += `DTEND:${endDate}\n`;
    icsContent += `END:VEVENT\n`;
  });

  icsContent += `END:VCALENDAR`;

  let blob = new Blob([icsContent], { type: "text/calendar" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "events.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// async function addEventToGoogleCalendar(event) {
//     if (!googleApiReady) {
//         ini
//     }
//     const calendarEvent = {
//       summary: event.title,
//       description: event.description,
//       start: { dateTime: `${event.date}T${event.time}:00` },
//       end: { dateTime: `${event.date}T${event.time}:00` },
//     };
  
//     try {
//       let response = await gapi.client.calendar.events.insert({
//         calendarId: "primary",
//         resource: calendarEvent,
//       });
//       console.log("Evento agregado a Google Calendar:", response);
//     } catch (error) {
//       console.error("Error al agregar evento a Google Calendar:", error);
//     }
//   }
  


// document.addEventListener("DOMContentLoaded", function () {
//   document.getElementById("exportICal").addEventListener("click", exportToICal);
//   document
//     .getElementById("syncGoogle")
//     .addEventListener("click", addEventToGoogleCalendar);
// });
