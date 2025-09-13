document.addEventListener("DOMContentLoaded", () => {
  // ✅ Check login
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must log in first!");
    window.location.href = "/login";
    return;
  }

  // Optional: fetch user
  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) {
        alert("Session expired. Login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return data.user;
    } catch (err) {
      console.error(err);
      alert("Could not verify user.");
    }
  }

  fetchUser();

  // ✅ Initialize map
  const map = L.map('map').setView([12.9716, 77.5946], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Get current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        map.setView([lat, lon], 14);
        L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
      },
      (err) => console.warn("Geolocation error:", err.message)
    );
  }

  // Search function
  async function searchLocation(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.length > 0) {
      const lat = data[0].lat, lon = data[0].lon;
      map.setView([lat, lon], 14);
      L.marker([lat, lon]).addTo(map).bindPopup(query).openPopup();
    } else alert("Location not found!");
  }

  // Text search on Enter
  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchLocation(e.target.value);
  });

  // Voice search
  document.getElementById("voiceBtn").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-IN";
    recognition.start();
    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      document.getElementById("searchInput").value = speechText;
      searchLocation(speechText);
    };
  });
});
