const CLIENT_ID =
  "647090334577-k8j5vm82nmtk5bocrghpn6g11t27a168.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar";
const API_KEY = "AIzaSyCvRSx2T8yKHdP3X65Rzq-epZKqyb8w7iA";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Callback after the Google API is loaded
function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

// initialize the Google API client
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
  });
  gapiInited = true;
}

// load the Google Identity Services
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      if (resp.error) {
        console.error("❌ Error en la autenticación:", resp);
        return;
      }
      console.log("✅ Token recibido:", resp.access_token);
      localStorage.setItem("google_access_token", resp.access_token);
      gapi.client.setToken({ access_token: resp.access_token }); // Asigna el token a gapi
    },
  });
}

// Handle the auth in the click
async function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    localStorage.setItem("google_access_token", resp.access_token); // save the token
    // await listUpcomingEvents();
  };

  // if the token is not in the local storage, request auth
  if (!localStorage.getItem("google_access_token")) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // if the token is in the local storage
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

// manage the signout
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    document.getElementById("content").innerText = "";
    document.getElementById("authorize_button").innerText = "Authorize";
    document.getElementById("signout_button").style.visibility = "hidden";
  }
}

// print the upcoming events
async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    console.error("Error al obtener los eventos:", err);
    document.getElementById("content").innerText =
      "No se pudieron cargar los eventos.";
    return;
  }

  const events = response.result.items;
  if (!events || events.length == 0) {
    document.getElementById("content").innerText = "No se encontraron eventos.";
    return;
  }

  const output = events.reduce(
    (str, event) =>
      `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
    "Eventos:\n"
  );

  document.getElementById("content").innerText = output;
}

// add an event to the Google Calendar
const addEventToGoogleCalendar = async () => {
  let token = localStorage.getItem("google_access_token");

  if (!token) {
    console.warn(
      "⚠ No hay un Access Token válido. Intentando obtener uno nuevo..."
    );
    await handleAuthClick(); // Intentar autenticar
    token = localStorage.getItem("google_access_token");
  }

  const calendarEvent = {
    summary: "Event title",
    location: "Google Meet",
    description: "Event description",
    start: {
      dateTime: "2021-09-01T09:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: "2021-09-01T17:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
    attendees: [{ email: "abc@google.com" }, { email: "xyz@google.com" }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 1440 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  try {
    const response = await fetch(
      "https://content.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Evento agregado a Google Calendar:", result.htmlLink);

    document.getElementById(
      "content"
    ).innerText = `Evento agregado: ${result.htmlLink}`;
  } catch (error) {
    console.error("Error al agregar el evento:", error);
    document.getElementById("content").innerText =
      "Error al agregar el evento.";
  }
};
// add an event to the Google Calendar
// const addEventToGoogleCalendar = async (event) => {
//   let token = localStorage.getItem("google_access_token");

//   if (!token) {
//     console.warn(
//       "⚠ No hay un Access Token válido. Intentando obtener uno nuevo..."
//     );
//     await handleAuthClick(); // try to authenticate
//     token = localStorage.getItem("google_access_token");
//   }

//   var calendarEvent = {
//     "summary": "Event title",
//     "location": "Google Meet",
//     "description": "Event description",
//     "start": {
//       "dateTime": "2021-09-01T09:00:00-07:00",
//       "timeZone": "America/Los_Angeles"
//     },
//     "end": {
//       "dateTime": "2021-09-01T17:00:00-07:00",
//       "timeZone": "America/Los_Angeles"
//     },
//     "recurrence": ["RRULE:FREQ=DAILY;COUNT=2"],
//     "attendees": [{ "email": "abc@google.com" }, { "email": "xyz@google.com" }],
//     "reminders": {
//       "useDefault": false,
//       "overrides": [
//         { "method": "email", "minutes": 1440 },
//         { "method": "popup", "minutes": 10 }
//       ]
//     }
//   }

// try {
//   const request = await gapi.client.calendar.events.insert({
//     calendarId: "primary",
//     resource: calendarEvent,
//     headers: {
//       Authorization: `Bearer ${token}`, // access token
//     },
//   });
//   console.log('request: ', request);

//   const calendarEventLink = request.result.htmlLink;
//   console.log("Evento agregado a Google Calendar:", calendarEventLink);

//   document.getElementById(
//     "content"
//   ).innerText = `Evento agregado: ${calendarEventLink}`;
// } catch (error) {
//   console.error("Error al agregar el evento:", error);
//   document.getElementById("content").innerText =
//     "Error al agregar el evento.";
// }
