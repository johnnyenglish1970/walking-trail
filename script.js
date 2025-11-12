/* ===================== CONFIG ===================== */
const MAP_ID = "7ff992b63cb3134a409381f6"; // optional Google Map ID

/* ===================== STATE ===================== */
let map, userMarker, nextMarker, spotMarkers = [];
let watchId = null, testingMode = false;
let visited = new Set(JSON.parse(localStorage.getItem("visitedSpots") || "[]"));
let userPos = JSON.parse(localStorage.getItem("lastUserPos") || '{"lat":52.0579,"lng":1.2800}');
let compassHeading = 0, nearestCache = null;

/* ===================== HELPERS ===================== */
const toKey = n => n.replace(/\s+/g, "_");

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad, dLon = (lon2 - lon1) * toRad;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180, toDeg = 180 / Math.PI;
  const φ1 = lat1 * toRad, φ2 = lat2 * toRad, Δλ = (lon2 - lon1) * toRad;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * toDeg + 360) % 360;
}

function findNearest(lat, lng) {
  if (!spots?.length) return null;
  let min = Infinity, nearest = null;
  spots.forEach(s => {
    const d = haversine(lat, lng, s.lat, s.lng);
    if (d < min) { min = d; nearest = { ...s, dist: d }; }
  });
  return nearest;
}

function saveState() {
  localStorage.setItem("visitedSpots", JSON.stringify([...visited]));
  localStorage.setItem("lastUserPos", JSON.stringify(userPos));
}

/* ===================== MAP INIT ===================== */
function makeDotMarker({ map, position, className, title }) {
  if (google?.maps?.marker?.AdvancedMarkerElement) {
    const el = document.createElement("div");
    el.className = className;
    return new google.maps.marker.AdvancedMarkerElement({
      map, position, content: el, title
    });
  }
  return new google.maps.Marker({
    map, position, title,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      strokeColor: "#fff",
      strokeWeight: 2,
      fillColor: "#0057b8",
      fillOpacity: 1
    }
  });
}

function initMap() {
  const mapOpts = { center: userPos, zoom: 17 };
  if (MAP_ID) mapOpts.mapId = MAP_ID;
  map = new google.maps.Map(document.getElementById("map"), mapOpts);

  // ---- Styles for Advanced Markers ----
  const style = document.createElement("style");
  style.textContent = `
    .user-dot {width:18px;height:18px;border-radius:50%;border:2px solid #fff;background:radial-gradient(circle,yellow 40%,orange 80%);}
    .next-dot {width:18px;height:18px;border-radius:50%;border:2px solid #fff;background:radial-gradient(circle,#00b2ff 30%,#0057b8 80%);}
    .spot-dot {width:14px;height:14px;border-radius:50%;border:2px solid #fff;background:linear-gradient(#00b2ff,#0057b8);}
    .spot-dot.visited {background:linear-gradient(#4caf50,#2e7d32);}
  `;
  document.head.appendChild(style);

  // ---- Create Markers ----
  userMarker = makeDotMarker({ map, position: userPos, className: "user-dot", title: "You" });
  nextMarker = makeDotMarker({ map, position: userPos, className: "next-dot", title: "Nearest" });

  spotMarkers = spots.map(s =>
    makeDotMarker({ map, position: { lat: s.lat, lng: s.lng }, className: "spot-dot", title: s.name })
  );

  // ---- Fit map to show all spots + your location ----
  const bounds = new google.maps.LatLngBounds();
  spots.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
  bounds.extend(userPos); // include your last known position
  map.fitBounds(bounds, 80); // 80px padding around edges

  // ---- Continue setup ----
  buildList();
  setupCompassButton();
  attachHandlers();
  buildTestDropdown();
  startWatchingPosition();

  // Delay distance refresh slightly so map loads first
  setTimeout(refreshNearestAndDistances, 300);
}

/* ===================== LOCATION UPDATES ===================== */
function onPositionUpdated() {
  saveState();
  map.setCenter(userPos);
  if (userMarker.setPosition) userMarker.setPosition(userPos);
  refreshNearestAndDistances();
}

function refreshNearestAndDistances() {
  if (!spots?.length || !userPos?.lat) return;
  const nearest = findNearest(userPos.lat, userPos.lng);
  if (!nearest) return;
  nearestCache = nearest;

  document.getElementById("nearestName").textContent =
    `${nearest.name} (${nearest.dist.toFixed(0)} m)`;

  if (nextMarker.setPosition)
    nextMarker.setPosition({ lat: nearest.lat, lng: nearest.lng });

  let changed = false;
  spots.forEach((s, i) => {
    const d = haversine(userPos.lat, userPos.lng, s.lat, s.lng);
    const el = document.getElementById("dist-" + toKey(s.name));
    if (el) el.textContent = d < 1000 ? `${d.toFixed(0)} m` : `${(d / 1000).toFixed(2)} km`;
    if (d <= 10 && !visited.has(s.name)) {
      visited.add(s.name);
      changed = true;
      if (spotMarkers[i]?.content) spotMarkers[i].content.classList.add("visited");
    }
  });
  if (changed) { saveState(); buildList(); }
  aimCompassAtNearest();
}

/* ===================== COMPASS ===================== */
function setupCompassButton() {
  const btn = document.getElementById("startCompassBtn");
  const arrow = document.getElementById("arrow");
  const status = document.getElementById("compassStatus");

  btn.addEventListener("click", () => {
    status.textContent = "Requesting motion permission...";
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then(res => {
        if (res === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          btn.textContent = "🧭 Compass Active";
          btn.disabled = true;
          arrow.classList.add("active");
          status.textContent = "Compass active ✓";
        } else status.textContent = "Permission denied.";
      });
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
      btn.textContent = "🧭 Compass Active";
      btn.disabled = true;
      arrow.classList.add("active");
      status.textContent = "Compass active ✓";
    }
  });

  function handleOrientation(e) {
    let heading;
    if (e.webkitCompassHeading !== undefined) {
      heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      heading = 360 - e.alpha - 180;
      if (heading < 0) heading += 360;
    }
    if (!isNaN(heading)) {
      compassHeading = heading;
      aimCompassAtNearest();
    }
  }
}

function aimCompassAtNearest() {
  if (!nearestCache) return;
  const arrow = document.getElementById("arrow");
  const brg = bearing(userPos.lat, userPos.lng, nearestCache.lat, nearestCache.lng);
  const rel = (brg - compassHeading + 360) % 360;
  arrow.style.transform = `rotate(${rel}deg)`;
  document.getElementById("headingText").textContent =
    `Heading: ${compassHeading.toFixed(1)}°`;
  document.getElementById("compassStatus").textContent =
    `Arrow → ${nearestCache.name} (${nearestCache.dist.toFixed(0)} m)`;
}

/* ===================== UI ===================== */
function buildList() {
  const list = document.getElementById("trailList");
  list.innerHTML = "";
  spots.forEach((s, i) => {
    const v = visited.has(s.name);
    const btnLabel = v ? "Read more" : "Find spot to read more…";
    const item = document.createElement("div");
    item.className = "trail-item" + (v ? " visited" : "");
    item.innerHTML = `
      <div class="img-wrap">
        <img src="${s.img}" alt="${s.name}">
        <div class="tick-overlay">✔</div>
      </div>
      <div class="trail-info">
        <p class="trail-name">${s.name}</p>
        <p class="trail-dist" id="dist-${toKey(s.name)}">–</p>
        <button class="read-more" data-spot="${s.name}" ${v ? "" : "disabled"}>${btnLabel}</button>
      </div>`;
    item.querySelector(".read-more").onclick = () => openSpotModal(s.name);
    list.appendChild(item);
    const m = spotMarkers[i];
    if (m?.content) m.content.classList.toggle("visited", v);
  });
}

function openSpotModal(name) {
  const s = spots.find(x => x.name === name);
  if (!s) return;
  document.getElementById("spotTitle").textContent = s.name;
  document.getElementById("spotBody").innerHTML = `
    <img src="${s.img}" style="width:100%;border-radius:10px;margin-bottom:12px;">
    <p>${s.info}</p>
    <p><strong>Location:</strong> ${s.lat.toFixed(6)}, ${s.lng.toFixed(6)}</p>`;
  document.getElementById("spotModal").showModal();
}
document.getElementById("closeModal").onclick =
  () => document.getElementById("spotModal").close();

/* ===================== CONTROLS ===================== */
function attachHandlers() {
  document.getElementById("updateBtn").onclick = () => {
    if (!navigator.geolocation) { alert("No GPS support"); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      onPositionUpdated();
    });
  };

  document.getElementById("resetBtn").onclick = () => {
    if (confirm("Reset your trail progress?")) {
      visited.clear();
      localStorage.removeItem("visitedSpots");
      buildList();
    }
  };
}

function buildTestDropdown() {
  const sel = document.getElementById("testSelect");
  spots.forEach(s => {
    const o = document.createElement("option");
    o.value = JSON.stringify({ lat: s.lat, lng: s.lng, name: s.name });
    o.textContent = s.name;
    sel.appendChild(o);
  });
  sel.onchange = e => {
    const val = e.target.value;
    if (!val) {
      testingMode = false;
      startWatchingPosition();
      alert("✅ Returned to live GPS mode.");
      return;
    }
    testingMode = true;
    if (watchId) navigator.geolocation.clearWatch(watchId);
    const loc = JSON.parse(val);
    userPos = { lat: loc.lat, lng: loc.lng };
    onPositionUpdated();
    alert(`🧪 Spoofed location set to "${loc.name}".`);
  };
}

function startWatchingPosition() {
  if (!navigator.geolocation || testingMode) return;
  if (watchId) navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(pos => {
    if (testingMode) return;
    userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    onPositionUpdated();
  });
}

/* ===================== BOOT ===================== */
window.addEventListener("load", () => setTimeout(initMap, 200));
