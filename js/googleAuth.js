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
        console.error("Auth error:", resp);
        return;
      }
      localStorage.setItem("google_access_token", resp.access_token);
      gapi.client.setToken({ access_token: resp.access_token }); // Asigna el token a gapi
    },
  });
}

// Handle the auth in the click
async function handleAuthClick() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp) => {
      if (resp.error !== undefined) {
        console.error("Auth error:", resp);
        reject(resp.error);
        return;
      }
      localStorage.setItem("google_access_token", resp.access_token);
      gapi.client.setToken({ access_token: resp.access_token });
      resolve(resp.access_token); // Resolvemos la promesa con el token
    };

    // Si el token no está en localStorage, solicitamos autenticación con Google
    if (!localStorage.getItem("google_access_token")) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  });
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
    console.error("error getting the events:", err);
    return;
  }

  const events = response.result.items;
  if (!events || events.length == 0) {
    document.getElementById("content").innerText = "events not found.";
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
const addEventToGoogleCalendar = async (event) => {
  let token = localStorage.getItem("google_access_token");

  if (!token) {
    console.warn(
      "No access token found. Trying to authenticate with Google..."
    );
    await handleAuthClick(); // try to authenticate
    token = localStorage.getItem("google_access_token");
    if (!token) {
      console.error(
        "Could not authenticate with Google. Try again later."
      );
      alert("Could not authenticate with Google. Try again later.");
      return;
    }
  }

  const eventDateTime = `${event.date}T${event.time}:00`;
  const timeZone = "Asia/Jerusalem"; 

  var calendarEvent = {
    summary: event.title,
    location: "Google Meet",
    description: event.description || "Sin descripción",
    start: {
      dateTime: eventDateTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: `${event.date}T${addOneHour(event.time)}`,
      timeZone: timeZone,
    },
    attendees: [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 1440 }, 
        { method: "popup", minutes: 10 },
      ],
    },
  };

  try {
    gapi.client.setApiKey(null); // remove the API key of the link

    gapi.client.setToken({ access_token: token });
    const reqData = {
      calendarId: "primary",
      resource: calendarEvent,
    };

    const request = await gapi.client.calendar.events.insert(reqData);

    const calendarEventLink = request.result.htmlLink;
    console.log("Event added successfully:", calendarEventLink);
    alert("✅ Event added to your Google Calendar!");
  } catch (error) {
    console.error("Error al agregar el evento:", error);
    document.getElementById("content").innerText =
      "Error al agregar el evento.";
  }
};

function addOneHour(time) {
  let [hours, minutes] = time.split(":").map(Number);
  hours = (hours + 1) % 24; // Para evitar que pase de 23
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
}
