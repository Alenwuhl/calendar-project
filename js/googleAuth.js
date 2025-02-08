const CLIENT_ID =
  "647090334577-k8j5vm82nmtk5bocrghpn6g11t27a168.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";
const API_KEY = 'AIzaSyCvRSx2T8yKHdP3X65Rzq-epZKqyb8w7iA';

let tokenClient;
  let gapiInited = false;
  let gisInited = false;


// Callback after the Google API is loaded
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
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
    callback: '', // is set later
  });
  gisInited = true;
}

// Handle the auth in the click
async function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    localStorage.setItem("google_access_token", resp.access_token); // save the token
    await listUpcomingEvents();
  };

  // if the token is not in the local storage, request auth
  if (!localStorage.getItem("google_access_token")) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // if the token is in the local storage
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

// manage the signout
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
  }
}

// print the upcoming events
async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime',
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    console.error("Error al obtener los eventos:", err);
    document.getElementById('content').innerText = "No se pudieron cargar los eventos.";
    return;
  }

  const events = response.result.items;
  if (!events || events.length == 0) {
    document.getElementById('content').innerText = 'No se encontraron eventos.';
    return;
  }

  const output = events.reduce(
    (str, event) => `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
    'Eventos:\n'
  );
  
  document.getElementById('content').innerText = output;
}

// add an event to the Google Calendar
const addEventToGoogleCalendar = async (event) => {
  let token = localStorage.getItem("google_access_token");

  if (!token) {
    console.warn(
      "⚠ No hay un Access Token válido. Intentando obtener uno nuevo..."
    );
    await handleAuthClick();  // try to authenticate
    token = localStorage.getItem("google_access_token");
  }

  const calendarEvent = {
    summary: "Google I/O 2015",
    location: "800 Howard St., San Francisco, CA 94103",
    description: "A chance to hear more about Google's developer products.",
    start: {
      date: "2020-05-28"
    },
    end: {
      date: "2020-05-29"
    }
  };

  try {
    const request = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: calendarEvent,
      headers: {
        Authorization: `Bearer ${token}`  // access token
      }
    });

    const calendarEventLink = request.result.htmlLink;
    console.log("Evento agregado a Google Calendar:", calendarEventLink);
    
    document.getElementById('content').innerText = `Evento agregado: ${calendarEventLink}`;
  } catch (error) {
    console.error("Error al agregar el evento:", error);
    document.getElementById('content').innerText = "Error al agregar el evento.";
  }
};
