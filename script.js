/* ===================== CONFIG ===================== */
const MAP_ID = "3fe9650f3654faf0bee8e2e2";

/* ===================== STATE ===================== */
let map, userMarker, nextMarker, spotMarkers = [];
let watchId = null, testingMode = false;

let visited = new Set(JSON.parse(localStorage.getItem("visitedSpots") || "[]"));
let skipped = new Set(JSON.parse(localStorage.getItem("skippedSpots") || "[]"));

let userPos = JSON.parse(
  localStorage.getItem("lastUserPos") || '{"lat":52.0579,"lng":1.2800}'
);

let currentSpotIndex = parseInt(localStorage.getItem("currentSpotIndex") || "0");

let compassHeading = 0;
let nearestCache = null;
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
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) *
      Math.cos(lat2 * toRad) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180,
    toDeg = 180 / Math.PI;
  const φ1 = lat1 * toRad,
    φ2 = lat2 * toRad,
    Δλ = (lon2 - lon1) * toRad;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  return (Math.atan2(y, x) * toDeg + 360) % 360;
}

/* ===================== MAP ===================== */
function makeDotMarker({ map, position, className, title }) {
  const el = document.createElement("div");
  el.className = className;

  return new google.maps.marker.AdvancedMarkerElement({
    map,
    position,
    content: el,
    title
  });
}

function initMap() {
  const mapOpts = { center: userPos, zoom: 17, mapId: MAP_ID };
  map = new google.maps.Map(document.getElementById("map"), mapOpts);

  // Marker styles
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

  // Markers
  userMarker = makeDotMarker({
    map,
    position: userPos,
    className: "user-dot",
    title: "You"
  });

  nextMarker = makeDotMarker({
    map,
    position: userPos,
    className: "next-dot",
    title: "Next spot"
  });

  spotMarkers = spots.map(s =>
    makeDotMarker({
      map,
      position: { lat: s.lat, lng: s.lng },
      className: "spot-dot",
      title: s.name
    })
  );

  // Boot sequence
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

  if (!firstFitDone) {
    fitMapToAll();
    firstFitDone = true;
  } else {
    map.panTo(userPos);
  }

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

  // update next-marker
  if (nextMarker?.setPosition) {
    nextMarker.setPosition({ lat: current.lat, lng: current.lng });
  }

  // update distances in list
  spots.forEach(s => {
    const d = haversine(userPos.lat, userPos.lng, s.lat, s.lng);
    const el = document.getElementById(`dist-${toKey(s.name)}`);
    if (el)
      el.textContent = d < 1000 ? `${d.toFixed(0)} m` : `${(d / 1000).toFixed(2)} km`;
  });

  // Arrival check
  const proximity = current.radius || 15;

  if (dist <= proximity && !visited.has(current.name)) {
    visited.add(current.name);

    // Tint marker
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
    el.textContent = next.name;
    nearestCache = {
      ...next,
      dist: haversine(userPos.lat, userPos.lng, next.lat, next.lng)
    };
  } else {
    el.textContent = "🎉 Trail complete!";
  }
}

/* ===================== PROGRESS ===================== */
function updateProgress() {
  const completed = visited.size + skipped.size;
  const total = spots.length;

  const percent = Math.round((completed / total) * 100);

  document.getElementById("progressText").textContent =
    `Progress: ${completed} / ${total}`;

  document.getElementById("progressBarFill").style.width = percent + "%";
}

/* ===================== COMPASS ===================== */
function setupCompassButton() {
  const btn = document.getElementById("startCompassBtn");
  const arrow = document.getElementById("arrow");
  const cross = document.getElementById("cross-overlay");
  const status = document.getElementById("compassStatus");

  if (!btn || !arrow || !cross || !status) {
    console.error("Compass UI missing");
    return;
  }

  arrow.classList.remove("active");
  cross.style.opacity = 1;
  status.textContent = "Compass inactive";

  btn.onclick = async () => {
    status.textContent = "Requesting permission…";

    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") {
          status.textContent = "Compass permission denied.";
          return;
        }
      }
      activateCompass();
    } catch (err) {
      console.error(err);
      status.textContent = "Compass not supported.";
    }
  };

  function activateCompass() {
    window.addEventListener("deviceorientation", handleOrientation, true);

    arrow.classList.add("active");
    cross.style.opacity = 0;

    btn.textContent = "🧭 Compass active";
    btn.disabled = true;

    status.textContent = "Compass active ✓";
  }

  function handleOrientation(e) {
    let heading;

    if (e.webkitCompassHeading !== undefined) {
      heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      heading = 360 - e.alpha;
    }

    if (heading == null || isNaN(heading)) return;

    compassHeading = (heading + 360) % 360;

    aimCompassAtNearest();
  }
}

function aimCompassAtNearest() {
  if (!nearestCache) return;

  const arrow = document.getElementById("arrow");
  const headingText = document.getElementById("headingText");
  const status = document.getElementById("compassStatus");

  const brg = bearing(
    userPos.lat,
    userPos.lng,
    nearestCache.lat,
    nearestCache.lng
  );

  const rel = (brg - compassHeading + 360) % 360;

  let diff = rel - lastArrowRotation;

  if (diff > 180) diff -= 360;
  else if (diff < -180) diff += 360;

  lastArrowRotation += diff * 0.25;

  arrow.style.transform = `rotate(${lastArrowRotation}deg)`;

  headingText.textContent = `Heading: ${compassHeading.toFixed(1)}°`;
  status.textContent = `Arrow → ${nearestCache.name} (${nearestCache.dist.toFixed(
    0
  )} m)`;
}

/* ===================== UI & CONTROLS ===================== */
function buildList() {
  const list = document.getElementById("trailList");
  list.innerHTML = "";

  /* ---- Welcome Card ---- */
  const welcome = document.createElement("div");
  welcome.className = "trail-item welcome-card";

  welcome.innerHTML = `
    <div class="trail-header">
      <h3>Welcome to the Heritage Walking Trail</h3>
    </div>

    <div class="trail-body">
      <div class="trail-image">
        <img src="images/welcome.jpg" alt="Welcome">
      </div>
      <div class="trail-text">
        <p class="trail-snippet">
          Enjoy this trail around Adastral Park to uncover points of interest.  Approx 1.5 miles.
        </p>
        <p style="font-size:0.75rem;color:#666;">
          This introductory point does not require GPS and is always available.
        </p>
      </div>
    </div>

    <div class="trail-buttons">
      <button class="read-more" data-spot="WELCOME">Read More</button>
    </div>
  `;

 welcome.querySelector(".read-more").onclick = () => {
  document.getElementById("spotTitleText").textContent = "Welcome";
  document.getElementById("spotBody").innerHTML = `
    <p>Welcome to the Adastral Park Heritage Trail!</p>
    <p>
     <p>There are 16 spots on the trail which will guide you around key locations of the site. The trail will take approximately 1 hour.</p>

    <br><p>To use the app, just follow the direction finder to discover each location in turn. When you get close to a location, the content will be unlocked for you to view. The content is a mix of text, images and audio.
Please be aware of your surroundings at all times and please use the pedestrian paths around the site. Take care when crossing roads.</p>

<br><br><p>Please listen to this introduction to the trail from Dr Peter Bell, MD of Fixed Network and Adastral Park, BT:</p>
<br> <audio controls src="audio/welcome.mp3"></audio>

    <br><br><br><p><srong>Introduction to the Site</strong></p>

    <br><p>Adastral Park was built as the Post Office Research Centre in the early 1970s, to replace the original research station at Dollis Hill in North London.</p> 
    <br><p>During the first half of the 1970s purpose built buildings gradually replaced legacy buildings left from the days when the site was part of RAF Martlesham Heath. A large part of the accommodation was built to house specialist and general laboratories and workshops, reflecting that the whole site was dedicated to (mostly hardware) research and development. The initial building work was the main building complex, consisting of the Antares building, the Orion building, the two towers and the Research Services Block with the loading bays. Many other (differently designed) buildings followed though.</p>
<br><p>The telecommunications part of the Post Office became BT in the early 1980s and the name of the site changed to BT Laboratories. More name changes followed, until in 1999 the site was renamed Adastral Park (a nod to RAF Martlesham Heath's R&D purpose; the RAF motto is "per ardua ad astra" = through adversity to the stars [roughly]). It also became the first and only BT site to house independent companies, under the Innovation Martlesham banner.</p>

    <br><br> <p>Listen to Lisa Perkins talk about the impact of the Park:</p>
<br> <audio controls src="audio/impact.mp3"></audio>

   <br><br>  <p>Listen to Mike Warden recall the day that the Queen formally opened the site in 1975:</p>
<br> <audio controls src="audio/queen.mp3"></audio>


    </p>
    <p>Enjoy your walk and explore at your own pace.</p>

    <br><br><img src="images/welcome2.jpg" class="info-img">
    <p>The Queen's official opening of the sie in 1975</p>
  `;
  document.getElementById("spotModal").showModal();
};

  list.appendChild(welcome);

  /* ---- Real Trail Spots ---- */
  spots.forEach((s, i) => {
    const isVisited = visited.has(s.name);
    const isSkipped = skipped.has(s.name);
    const disabled = isVisited || isSkipped;

    const snippet = (s.info || "").split(".")[0] + ".";

    const item = document.createElement("div");
    item.className =
      "trail-item" +
      (isVisited ? " visited" : isSkipped ? " skipped" : "");

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
        <button class="read-more" data-spot="${s.name}" ${
      !isVisited ? "disabled" : ""
    }>Read More</button>

        <button class="skip-btn" data-skip="${s.name}">
          ${
            isVisited
              ? "✅ Found!"
              : isSkipped
              ? "⏭️ Skipped"
              : "Skip This Spot"
          }
        </button>
      </div>
    `;

    item.querySelector(".read-more").onclick = () =>
      openSpotModal(s.name);

    const skipBtn = item.querySelector(".skip-btn");
    skipBtn.onclick = () => skipSpot(s.name);
    if (disabled) skipBtn.disabled = true;

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

  /* ===== Build OPTIONAL audio section (your current system) ===== */
  let audioHTML = "";
  if (s.audio && s.audio.length) {
    audioHTML = `
      <div class="audio-section">
        <h4>Audio</h4>
        ${s.audio
          .map(
            a => `
          <div class="audio-item">
            <button class="audio-btn" onclick="playAudio('${a.src}', this)">▶</button>
            <span>${a.label}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  /* ===== Allow inline HTML inside the info text ===== */
  document.getElementById("spotTitleText").textContent = s.name;

  document.getElementById("spotBody").innerHTML = `
    <img src="${s.img}" style="width:100%;border-radius:10px;margin-bottom:12px;">

    <div class="spot-info-block">
      ${s.info}
    </div>

    ${audioHTML}

    <p style="margin-top:10px;">
      <strong>Location:</strong> ${s.lat.toFixed(6)}, ${s.lng.toFixed(6)}
    </p>
  `;

  document.getElementById("spotModal").showModal();
}

/* ===================== AUDIO PLAYER (GLOBAL) ===================== */
let currentAudio = null;
let currentButton = null;

let activeAudio = null;

function playAudio(src, btn = null) {
  // Stop any currently playing audio
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }

  // Create a new one
  activeAudio = new Audio(src);
  activeAudio.play();

  // Optional: update button state
  if (btn) btn.textContent = "⏸";

  activeAudio.onended = () => {
    if (btn) btn.textContent = "▶";
    activeAudio = null;
  };
}


document.getElementById("closeModal").onclick = () => {
  // Close modal
  document.getElementById("spotModal").close();

  // Stop standalone audio
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  // Stop any inline <audio> tags
  document.querySelectorAll("#spotBody audio").forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
};

/* ===================== CONTROLS ===================== */
function attachHandlers() {
  document.getElementById("updateBtn").onclick = () => {
    if (!navigator.geolocation) {
      alert("No GPS support");
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      userPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
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
    o.value = JSON.stringify({
      lat: s.lat,
      lng: s.lng,
      name: s.name
    });
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
  if (watchId) navigator.geolocation.clearWatch(watchId);

  if (testingMode || !navigator.geolocation) return;

  watchId = navigator.geolocation.watchPosition(
    pos => {
      userPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      onPositionUpdated();
    },
    err => {
      console.warn("Geolocation error:", err);
      document.getElementById("compassStatus").textContent =
        "⚠️ GPS unavailable or permission denied";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000
    }
  );
}

/* ===================== BOOT ===================== */
window.addEventListener("load", () => setTimeout(initMap, 200));
