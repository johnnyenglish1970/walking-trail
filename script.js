/* ===================== CONFIG ===================== */
const MAP_ID = "3fe9650f3654faf0bee8e2e2"; // ✅ Your Google Map ID

/* ===================== STATE ===================== */
let map, userMarker, nextMarker, spotMarkers = [];
let watchId = null, testingMode = false;
let visited = new Set(JSON.parse(localStorage.getItem("visitedSpots") || "[]"));
let skipped = new Set(JSON.parse(localStorage.getItem("skippedSpots") || "[]"));
let userPos = JSON.parse(localStorage.getItem("lastUserPos") || '{"lat":52.0579,"lng":1.2800}');
let currentSpotIndex = parseInt(localStorage.getItem("currentSpotIndex") || "0");
let compassHeading = 0, nearestCache = null;
let firstFitDone = false;
let lastArrowRotation = 0;

/* ===================== SAVE STATE ===================== */
function saveState() {
  localStorage.setItem("visitedSpots", JSON.stringify([...visited]));
  localStorage.setItem("skippedSpots", JSON.stringify([...skipped]));
  localStorage.setItem("lastUserPos", JSON.stringify(userPos));
  localStorage.setItem("currentSpotIndex", currentSpotIndex);
}

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

/* ===================== MAP ===================== */
function makeDotMarker({ map, position, className, title }) {
  const el = document.createElement("div");
  el.className = className;
  return new google.maps.marker.AdvancedMarkerElement({
    map, position, content: el, title
  });
}

function initMap() {
  const mapOpts = { center: userPos, zoom: 17, mapId: MAP_ID };
  map = new google.maps.Map(document.getElementById("map"), mapOpts);

  const style = document.createElement("style");
  style.textContent = `
    .next-dot{width:18px;height:18px;border-radius:50%;border:2px solid #fff;
      background:radial-gradient(circle,#00b2ff 30%,#0057b8 80%);}
    .spot-dot{width:14px;height:14px;border-radius:50%;border:2px solid #fff;
      background:linear-gradient(#00b2ff,#0057b8);}
    .spot-dot.visited{background:linear-gradient(#4caf50,#2e7d32);}
    .spot-dot.skipped{background:linear-gradient(#999,#555);}
  `;
  document.head.appendChild(style);

  userMarker = makeDotMarker({ map, position: userPos, className: "user-dot", title: "You" });
  nextMarker = makeDotMarker({ map, position: userPos, className: "next-dot", title: "Next spot" });
  spotMarkers = spots.map(s =>
    makeDotMarker({ map, position: { lat: s.lat, lng: s.lng }, className: "spot-dot", title: s.name })
  );

  fitMapToAll();
  buildList();
  setupCompassButton();
  attachHandlers();
  buildTestDropdown();
  startWatchingPosition();
  setTimeout(refreshNearestAndDistances, 300);
}

function fitMapToAll() {
  if (!map || !spots?.length) return;
  const bounds = new google.maps.LatLngBounds();
  spots.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
  if (userPos?.lat) bounds.extend(userPos);
  map.fitBounds(bounds, 80);
}

/* ===================== POSITION UPDATES ===================== */
function onPositionUpdated() {
  saveState();
  if (userMarker.setPosition) userMarker.setPosition(userPos);
  if (!firstFitDone) { fitMapToAll(); firstFitDone = true; }
  else map.panTo(userPos);
  refreshNearestAndDistances();
}

function refreshNearestAndDistances() {
  if (!spots?.length || !userPos?.lat) return;

  const current = spots[currentSpotIndex];
  if (!current) return;

  const dist = haversine(userPos.lat, userPos.lng, current.lat, current.lng);
  nearestCache = { ...current, dist };

  const nearestEl = document.getElementById("nearestName");
  if (nearestEl) nearestEl.textContent = `${current.name} (${dist.toFixed(0)} m)`;

  if (nextMarker?.setPosition) {
    nextMarker.setPosition({ lat: current.lat, lng: current.lng });
  } else if (nextMarker) {
    nextMarker.position = { lat: current.lat, lng: current.lng };
  }

  spots.forEach((s, i) => {
    const d = haversine(userPos.lat, userPos.lng, s.lat, s.lng);
    const el = document.getElementById("dist-" + toKey(s.name));
    if (el) el.textContent = d < 1000 ? `${d.toFixed(0)} m` : `${(d / 1000).toFixed(2)} km`;
  });

  // Arrival check (radius)
 const proximity = current.radius || 15;  // fallback to 15 m if not set

if (dist <= proximity && !visited.has(current.name)) {
  visited.add(current.name);

  // Tint the marker if using AdvancedMarkerElement
  const m = spotMarkers[currentSpotIndex];
  if (m?.content) m.content.classList.add("visited");

  saveState();
  buildList();
  openSpotModal(current.name);
  advanceToNextSpot();
}


  aimCompassAtNearest();
  updateProgress();
}

/* ===================== SEQUENCE CONTROL ===================== */
function advanceToNextSpot() {
  if (currentSpotIndex < spots.length - 1) {
    currentSpotIndex++;
    saveState();
    refreshNearestAndDistances();
  } else {
    document.getElementById("nearestName").textContent = "🎉 Trail complete!";
  }
}

function skipSpot(name) {
  const idx = spots.findIndex(s => s.name === name);
  if (idx === -1) return;

  skipped.add(name);

  if (idx === currentSpotIndex && currentSpotIndex < spots.length - 1) {
    currentSpotIndex++;
  }

  saveState();
  buildList();
  refreshNextSpot();
  refreshNearestAndDistances();
}

function refreshNextSpot() {
  const next = spots.find(s => !visited.has(s.name) && !skipped.has(s.name));
  const el = document.getElementById("nearestName");
  if (next) {
    el.textContent = `${next.name}`;
    nearestCache = { ...next, dist: haversine(userPos.lat, userPos.lng, next.lat, next.lng) };
  } else {
    el.textContent = "🎉 Trail complete!";
  }
}

/* ===================== PROGRESS ===================== */
function updateProgress() {
  const text = document.getElementById("progressText");
  if (text)
    text.textContent = `Progress: ${Math.min(currentSpotIndex + 1, spots.length)} / ${spots.length}`;
}

/* ===================== COMPASS ===================== */
function setupCompassButton() {
  const btn = document.getElementById("startCompassBtn");
  const arrow = document.getElementById("arrow");
  const status = document.getElementById("compassStatus");

  arrow.classList.remove("active");

  btn.addEventListener("click", () => {
    status.textContent = "Requesting motion permission...";
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then(res => {
        if (res === "granted") activateCompass();
        else status.textContent = "Permission denied.";
      }).catch(() => {
        status.textContent = "Compass not supported.";
      });
    } else activateCompass();
  });

  function activateCompass() {
    window.addEventListener("deviceorientation", handleOrientation, true);
    btn.textContent = "🧭 Compass active";
    btn.disabled = true;
    arrow.classList.add("active");
    status.textContent = "Compass active ✓";
  }

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
  let diff = rel - lastArrowRotation;
  if (diff > 180) diff -= 360;
  else if (diff < -180) diff += 360;
  const smoothed = lastArrowRotation + diff * 0.25;
  lastArrowRotation = smoothed;
  arrow.style.transform = `rotate(${smoothed}deg)`;
  document.getElementById("headingText").textContent = `Heading: ${compassHeading.toFixed(1)}°`;
  document.getElementById("compassStatus").textContent =
    `Arrow → ${nearestCache.name} (${nearestCache.dist.toFixed(0)} m)`;
}

/* ===================== UI & CONTROLS ===================== */
function buildList() {
  const list = document.getElementById("trailList");
  list.innerHTML = "";

  spots.forEach((s, i) => {
    const isVisited = visited.has(s.name);
    const isSkipped = skipped.has(s.name);
    const disabled = isVisited || isSkipped;

    const snippet = (s.info || "").split(".")[0] + "."; // short preview

    const item = document.createElement("div");
    item.className = "trail-item" + (isVisited ? " visited" : isSkipped ? " skipped" : "");

    item.innerHTML = `
      <div class="trail-header ${isVisited ? "visited" : ""}">
        <h3>${s.name}</h3>
      </div>
      <div class="trail-body">
        <div class="trail-image">
          <img src="${s.img}" alt="${s.name}">
        </div>
        <div class="trail-text">
          <p class="trail-snippet">${snippet}</p>
          <p class="trail-dist" id="dist-${toKey(s.name)}">–</p>
        </div>
      </div>
      <div class="trail-buttons">
        <button class="read-more" data-spot="${s.name}" ${!isVisited ? "disabled" : ""}>Read More</button>
        <button class="skip-btn" data-skip="${s.name}">
            ${isVisited ? "✅ Found!" : isSkipped ? "⏭️ Skipped" : "Skip This Spot"}
          </button>
      </div>
    `;

    // Events
    item.querySelector(".read-more").onclick = () => openSpotModal(s.name);
    item.querySelector(".skip-btn").onclick = () => skipSpot(s.name);

    const skipBtn = item.querySelector(".skip-btn");
            if (isVisited || isSkipped) {
          skipBtn.disabled = true;
        }
    
    list.appendChild(item);

    const m = spotMarkers[i];
    if (m?.content) {
      m.content.classList.toggle("visited", isVisited);
      m.content.classList.toggle("skipped", isSkipped);
    }
  });
}

/* ===================== POPUP ===================== */
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

document.getElementById("closeModal").onclick = () =>
  document.getElementById("spotModal").close();

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
      skipped.clear();
      currentSpotIndex = 0;
      localStorage.removeItem("visitedSpots");
      localStorage.removeItem("skippedSpots");
      localStorage.removeItem("currentSpotIndex");
      buildList();
      refreshNearestAndDistances();
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
  // Stop any existing watcher first
  if (watchId) navigator.geolocation.clearWatch(watchId);

  // Skip if we're in testing (spoof) mode
  if (testingMode || !navigator.geolocation) return;

  // Start GPS watcher with optimized settings
  watchId = navigator.geolocation.watchPosition(
    pos => {
      userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      onPositionUpdated(); // refresh markers, distances, compass etc.
    },
    err => {
      console.warn("Geolocation error:", err);
      document.getElementById("compassStatus").textContent =
        "⚠️ GPS unavailable or permission denied";
    },
    {
      enableHighAccuracy: true,  // use GPS if available (accurate within a few meters)
      maximumAge: 1000,          // accept cached position up to 1s old
      timeout: 10000             // if no fix after 10s, try again automatically
    }
  );
}

/* ===================== BOOT ===================== */
window.addEventListener("load", () => setTimeout(initMap, 200));
