function exportToICal() {
    let events = getEventsFromStorage();
    if (!events.length) {
        alert("No events to export.");
        return;
    }

    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//My Calendar//EN\n`;
    
    events.forEach(event => {
        let startDate = event.date.replace(/-/g, "") + "T" + event.time.replace(":", "") + "00Z";
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

function addEventToGoogleCalendar(event) {
    let startDate = event.date.replace(/-/g, "") + "T" + event.time.replace(":", "") + "00Z";
    let endDate = startDate; // 🔹 Podrías hacer que dure 1 hora sumando tiempo

    let googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE`;
    googleCalendarUrl += `&text=${encodeURIComponent(event.title)}`;
    googleCalendarUrl += `&dates=${startDate}/${endDate}`;
    googleCalendarUrl += `&details=${encodeURIComponent(event.description)}`;
    googleCalendarUrl += `&sf=true&output=xml`;

    window.open(googleCalendarUrl, "_blank"); // 🔹 Abre Google Calendar en una nueva pestaña
}


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("exportICal").addEventListener("click", exportToICal);
    document.getElementById("syncGoogle").addEventListener("click", syncWithGoogleCalendar);
});
