const CLIENT_ID =
  "647090334577-k8j5vm82nmtk5bocrghpn6g11t27a168.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";
const API_KEY = 'AIzaSyCvRSx2T8yKHdP3X65Rzq-epZKqyb8w7iA';
// const API_KEY = 'AIzaSyAIKfLRaz6PgFWxgad3er1eqRC8IOal5xU';

// let googleApiReady = false;
// let accessToken = localStorage.getItem("google_access_token") || null;

// // Cargar la nueva API de Google Identity Services
// function loadGoogleIdentityAPI() {
//   return new Promise((resolve, reject) => {
//     let script = document.createElement("script");
//     script.src = "https://accounts.google.com/gsi/client";
//     script.async = true;
//     script.defer = true;
//     script.onload = () => resolve();
//     script.onerror = () =>
//       reject(new Error("No se pudo cargar Google Identity API"));
//     document.body.appendChild(script);
//   });
// }

// async function initGoogleIdentity() {
//   await loadGoogleIdentityAPI();
//   google.accounts.id.initialize({
//     client_id: CLIENT_ID,
//     callback: handleCredentialResponse,
//     ux_mode: "popup",
//   });
//   google.accounts.id.prompt();
// }

// async function handleCredentialResponse(response) {
//   console.log("Credenciales recibidas:", response);

//   // Guardamos el ID Token en localStorage
//   localStorage.setItem("google_id_token", response.credential);
//   console.log("ID Token guardado en localStorage:", response.credential);

//   // Obtener el Access Token intercambiando el ID Token
//   await exchangeToken(response.credential);
// }

// async function exchangeToken(idToken) {
//   try {
//     let response = await fetch("https://oauth2.googleapis.com/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         client_id: CLIENT_ID,
//         grant_type: "authorization_code",
//         redirect_uri: "postmessage",  // Confirmar redirección correcta
//         code: idToken, // ID Token devuelto por Google Identity Services
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(
//         "No se pudo intercambiar el ID Token por un Access Token"
//       );
//     }

//     let data = await response.json();
//     accessToken = data.access_token;
//     localStorage.setItem("google_access_token", accessToken);
//     console.log("✅ Access Token obtenido y guardado:", accessToken);

//     googleApiReady = true;
//   } catch (error) {
//     console.error("❌ Error al obtener el Access Token:", error);
//   }
// }

// async function loadGapiClient() {
//   return new Promise((resolve, reject) => {
//     if (typeof gapi === "undefined") {
//       let script = document.createElement("script");
//       script.src = "https://apis.google.com/js/api.js";
//       script.async = true;
//       script.defer = true;
//       script.onload = () => resolve();
//       script.onerror = () => reject(new Error("No se pudo cargar gapi."));
//       document.body.appendChild(script);
//     } else {
//       resolve();
//     }
//   });
// }

// async function initGoogleApi() {
//   await loadGapiClient();

//   return new Promise((resolve, reject) => {
//     gapi.load("client", async () => {
//       try {
//         await gapi.client.init({
//           clientId: CLIENT_ID,
//           discoveryDocs: DISCOVERY_DOCS,
//           scope: SCOPES,
//         });

//         console.log("✅ Google API Client inicializado correctamente.");
//         googleApiReady = true;
//         resolve();
//       } catch (error) {
//         console.error("❌ Error al inicializar Google API Client:", error);
//         reject(error);
//       }
//     });
//   });
// }

// // Sincronizar evento con Google Calendar
// async function addEventToGoogleCalendar(event) {
//   let token = localStorage.getItem("google_access_token");

//   if (!token) {
//     console.warn(
//       "⚠ No hay un Access Token válido. Intentando obtener uno nuevo..."
//     );
//     await handleAuthClick();  // Intenta autenticarse si el token no está disponible
//     token = localStorage.getItem("google_access_token");
//   }

//   const calendarEvent = {
//     summary: event.title,
//     description: event.description,
//     start: { dateTime: `${event.date}T${event.time}:00+02:00` }, // UTC+2 (Jerusalem)
//     end: { dateTime: `${event.date}T${event.time}:00+02:00` },
//   };

//   try {
//     let response = await fetch(
//       "https://www.googleapis.com/calendar/v3/calendars/primary/events",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(calendarEvent),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(
//         `Error en la API de Google Calendar: ${response.statusText}`
//       );
//     }

//     let data = await response.json();
//     console.log("✅ Evento agregado a Google Calendar:", data);
//   } catch (error) {
//     console.error("❌ Error al agregar evento a Google Calendar:", error);
//   }
// }

// // Iniciar autenticación manualmente
// async function handleAuthClick() {
//   if (!googleApiReady) {
//     console.error("Google API no está lista. Intentando inicializar...");
//     await initGoogleApi();
//   }

//   google.accounts.id.prompt();
// }

// function handleSignOutClick() {
//   console.log("Cerrando sesión...");
//   google.accounts.id.disableAutoSelect();
//   localStorage.removeItem("google_access_token");
//   accessToken = null;
//   googleApiReady = false;
// }

// Iniciar las APIs necesarias
// initGoogleIdentity();
// initGoogleApi();




//=========================================================================================================

let tokenClient;
  let gapiInited = false;
  let gisInited = false;

  /**
   * Callback after api.js is loaded.
   */
// Callback después de la carga de la API de Google
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

// Inicialización de la API de Google
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
  });
  gapiInited = true;
  // maybeEnableButtons();
}

// Cargar los servicios de Google Identity
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // Se define después
  });
  gisInited = true;
  // maybeEnableButtons();
}

// Manejar la autenticación al hacer clic en el botón
async function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    localStorage.setItem("google_access_token", resp.access_token); // Guarda el token
    await listUpcomingEvents();
  };

  // Si el token no está presente en localStorage, solicitamos autenticación
  if (!localStorage.getItem("google_access_token")) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Si ya tenemos un token, lo usamos sin volver a mostrar el selector de cuentas
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

// Manejar el cierre de sesión
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

// Imprimir los próximos eventos
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

// Agregar un evento al calendario de Google
const addEventToGoogleCalendar = async (event) => {
  let token = localStorage.getItem("google_access_token");

  if (!token) {
    console.warn(
      "⚠ No hay un Access Token válido. Intentando obtener uno nuevo..."
    );
    await handleAuthClick();  // Intenta autenticarse si el token no está disponible
    token = localStorage.getItem("google_access_token");
  }

  const calendarEvent = {
    summary: event.title,
    description: event.description,
    start: { dateTime: `${event.date}T${event.time}:00+02:00` }, // UTC+2 (Jerusalem)
    end: { dateTime: `${event.date}T${event.time}:00+02:00` },
  };

  try {
    const request = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: calendarEvent,
      headers: {
        Authorization: `Bearer ${token}`  // Usamos el Access Token aquí
      }
    });

    const calendarEventLink = request.result.htmlLink;
    console.log("Evento agregado a Google Calendar:", calendarEventLink);

    // Si deseas, puedes mostrar el enlace en el DOM
    document.getElementById('content').innerText = `Evento agregado: ${calendarEventLink}`;
  } catch (error) {
    console.error("Error al agregar el evento:", error);
    document.getElementById('content').innerText = "Error al agregar el evento.";
  }
};
