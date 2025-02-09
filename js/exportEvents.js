// to export events to a .ics file
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

