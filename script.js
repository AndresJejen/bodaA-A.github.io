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

// Map initialization and routing
const VENUE_LOCATION = {
  lat: 4.8484, // Replace with actual Casa Duque coordinates
  lng: -74.2478 // Replace with actual Casa Duque coordinates
};

let map, userMarker, venueMarker, directionsService, directionsRenderer;

function initMap() {
  // Initialize map services
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

  // Set up click handler for directions button
  const directionsBtn = document.getElementById("getDirections");
  if (directionsBtn) {
    directionsBtn.addEventListener("click", getUserLocationAndRoute);
  }
}

function getUserLocationAndRoute() {
  const directionsBtn = document.getElementById("getDirections");
  if (directionsBtn) directionsBtn.disabled = true;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Update or create user marker
        if (userMarker) userMarker.setMap(null);
        userMarker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Tu ubicación",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff"
          }
        });

        // Calculate and display route
        calculateAndDisplayRoute(userLocation);
        if (directionsBtn) directionsBtn.disabled = false;
      },
      error => {
        console.error("Error getting location:", error);
        if (directionsBtn) {
          directionsBtn.disabled = false;
          directionsBtn.textContent = "Error al obtener ubicación";
        }
        // Fallback: open in Google Maps
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${VENUE_LOCATION.lat},${VENUE_LOCATION.lng}`,
          '_blank'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    if (directionsBtn) directionsBtn.disabled = false;
    // Fallback: open in Google Maps
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${VENUE_LOCATION.lat},${VENUE_LOCATION.lng}`,
      '_blank'
    );
  }
}

function calculateAndDisplayRoute(origin) {
  directionsService.route(
    {
      origin: origin,
      destination: VENUE_LOCATION,
      travelMode: google.maps.TravelMode.DRIVING
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        
        // Add markers (they're suppressed by default)
        if (userMarker) userMarker.setMap(map);
        if (venueMarker) venueMarker.setMap(map);
        
        // Update button text with duration
        const route = response.routes[0];
        if (route && route.legs[0]) {
          const duration = route.legs[0].duration.text;
          const distance = route.legs[0].distance.text;
          const directionsBtn = document.getElementById("getDirections");
          if (directionsBtn) {
            directionsBtn.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22L3 9l9-7 9 7-9 13z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 22L12 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${distance} (${duration})
            `;
          }
        }
      } else {
        console.error("Directions request failed:", status);
        const directionsBtn = document.getElementById("getDirections");
        if (directionsBtn) {
          directionsBtn.textContent = "Error al calcular ruta";
        }
      }
    }
  );
}

// Initialize map when Google Maps API is ready
window.addEventListener('load', initMap);

const scriptURL = "https://script.google.com/macros/s/AKfycbxH7gY34mzirP5k4j4bW8fsOexB-cTlMO-7NkyfB9ZdP_1DEHuF3rqvBBZ1woFfIyVSuw/exec"; // replace with your Google Apps Script URL

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const uuid = params.get("uuid");
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
                    description.textContent = data.NAME;
                }
                if (guestNameEl) {
                    guestNameEl.textContent = `Hola, ${data.NAME}`;
                }

                // Update RSVP table cells
                const guestNameCell = document.getElementById('guestNameCell');
                const seatsCell = document.getElementById('seatsCell');
                const attendCell = document.getElementById('attendCell');

                if (guestNameCell) guestNameCell.textContent = data.NAME;
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
                if (guestInput) guestInput.value = data.NAME;
                if (seatsInput) seatsInput.value = data.TOTAL_SEATS || 1;

                // Store in localStorage for persistence
                try {
                    localStorage.setItem('rsvp-data', JSON.stringify({
                        guest: data.NAME,
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
