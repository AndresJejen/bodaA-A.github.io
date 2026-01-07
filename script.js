// Small helper: smooth scroll on internal links (enhances older browsers)
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      // let browser handle if no hash
      const hash = anchor.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();

const WEDDING_DATE = new Date('2026-02-20T11:00:00-05:00').getTime();

function startCountdown() {
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const pad = (value) => String(value).padStart(2, '0');

  let timerId = null;

  const updateCountdown = () => {
    const now = Date.now();
    let distance = WEDDING_DATE - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      if (timerId) clearInterval(timerId);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    distance %= (1000 * 60 * 60 * 24);
    const hours = Math.floor(distance / (1000 * 60 * 60));
    distance %= (1000 * 60 * 60);
    const minutes = Math.floor(distance / (1000 * 60));
    distance %= (1000 * 60);
    const seconds = Math.floor(distance / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  };

  updateCountdown();
  timerId = setInterval(updateCountdown, 1000);
  return timerId;
}

// Map initialization and routing
const VENUE_LOCATION = {
  lat: 4.8484, // Replace with actual Casa Duque coordinates
  lng: -74.2478 // Replace with actual Casa Duque coordinates
};

let map, userMarker, venueMarker, directionsService, directionsRenderer;

function initMap() {
  // Initialize and add the map
function initMap() {
  // The location of Casa Duque
  const casaDuque = { lat: 4.82944, lng: -74.23469 };
  
  // The map, centered at Casa Duque
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: casaDuque,
    mapTypeId: "roadmap",
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  });

  // The marker, positioned at Casa Duque
  const marker = new google.maps.Marker({
    position: casaDuque,
    map: map,
    title: "Casa Duque",
    animation: google.maps.Animation.DROP,
  });

  // Add an info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="padding: 10px; max-width: 200px;">
        <h3 style="margin: 0 0 10px; color: #d4a373;">Casa Duque</h3>
        <p style="margin: 0; color: #666;">
          Autopista Medellín Km 16<br>
          El Rosal, Cundinamarca
        </p>
      </div>
    `,
  });

  // Open info window when marker is clicked
  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#d4a373",
      strokeWeight: 5
    }
  });

  // Create map centered on venue
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: VENUE_LOCATION,
    styles: [
      {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#666666" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#e9e9e9" }]
      }
    ]
  });

  // Add venue marker
  venueMarker = new google.maps.Marker({
    position: VENUE_LOCATION,
    map: map,
    title: "Casa Duque",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#d4a373",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#ffffff"
    }
  });

  directionsRenderer.setMap(map);
}

// Initialize map when Google Maps API is ready
window.addEventListener('load', initMap);

const scriptURL = "https://script.google.com/macros/s/AKfycbxH7gY34mzirP5k4j4bW8fsOexB-cTlMO-7NkyfB9ZdP_1DEHuF3rqvBBZ1woFfIyVSuw/exec"; // replace with your Google Apps Script URL

document.addEventListener("DOMContentLoaded", async () => {
    startCountdown();
    const params = new URLSearchParams(window.location.search);
    const uuid = params.get("UUID");
    const guestNameEl = document.getElementById("guestName");
    const guestInput = document.getElementById("guest");
    const seatsInput = document.getElementById("seats");
    const msg = document.getElementById("responseMsg");

    if (uuid) {
        try {
            const res = await fetch(`${scriptURL}?uuid=${uuid}`);
            const data = await res.json();
            if (data && !data.error) {
                // Update invitation heading and description
                const description = document.querySelector('.hero-content .description');
                if (description) {
                    description.textContent = data.Nombres;
                }
                if (guestNameEl) {
                    guestNameEl.textContent = `Hola, ${data.Nombres}`;
                }

                // Update RSVP table cells
                const guestNameCell = document.getElementById('guestNameCell');
                const seatsCell = document.getElementById('seatsCell');
                const attendCell = document.getElementById('attendCell');

                if (guestNameCell) guestNameCell.textContent = data.Nombres;
                if (seatsCell) seatsCell.textContent = data.TOTAL_SEATS || '1';
                if (attendCell) attendCell.textContent = data.CONFIRMED ? 'Sí' : 'No';

                // Update clear/confirm RSVP button text based on attendance status
                const clearRsvpBtn = document.getElementById('clearRsvp');
                if (clearRsvpBtn) {
                    clearRsvpBtn.textContent = data.CONFIRMED ? 'Cancelar asistencia' : 'Confirmar asistencia';
                    
                    // Add click handler for the clear/confirm button
                    clearRsvpBtn.addEventListener('click', async () => {
                        msg.textContent = "Enviando ...";
                        try {
                            let confirmed = data.CONFIRMED ? 'false' : 'true';
                            let confirm_cancel_message = confirmed === 'true' ? 'confirmada' : 'cancelada';
                            const res = await fetch(`${scriptURL}?uuid=${uuid}&confirm=${confirmed}`, {
                                method: "GET",
                            });
                            const confirmation = await res.json();
                            if (confirmation && confirmation.status === "confirmed") {
                                msg.textContent = `Asistencia ${confirm_cancel_message} con éxito.`;
                                // Update button text and data.CONFIRMED state
                                data.CONFIRMED = !data.CONFIRMED;
                                clearRsvpBtn.textContent = data.CONFIRMED ? 'Cancelar asistencia' : 'Confirmar asistencia';
                                // Update attendance cell if it exists
                                const attendCell = document.getElementById('attendCell');
                                if (attendCell) attendCell.textContent = data.CONFIRMED ? 'Sí' : 'No';
                            } else {
                                msg.textContent = "Error al procesar la solicitud.";
                            }
                        } catch (err) {
                            msg.textContent = "Error de conexión.";
                        }
                    });
                }

                // Update form fields if they exist
                if (guestInput) guestInput.value = data.Nombres;
                if (seatsInput) seatsInput.value = data.TOTAL_SEATS || 1;

                // Store in localStorage for persistence
                try {
                    localStorage.setItem('rsvp-data', JSON.stringify({
                        guest: data.Nombres,
                        seats: data.TOTAL_SEATS || 1,
                        attend: data.CONFIRMED ? 'yes' : 'no',
                        time: Date.now()
                    }));
                } catch (err) { /* ignore storage errors */ }
            } else {
                guestNameEl.textContent = "Invitado no encontrado";
            }
        } catch (err) {
            guestNameEl.textContent = "Error loading guest info";
        }
    }
});
