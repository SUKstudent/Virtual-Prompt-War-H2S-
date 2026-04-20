// ================= AI ENGINE =================
function aiAnalyzeZone(zone) {
    if (!zone || typeof zone.currentDensity !== "number") return null;

    let risk = "Low";
    if (zone.currentDensity > 75) risk = "High";
    else if (zone.currentDensity > 55) risk = "Medium";

    // Trend-based prediction (not random)
    let predictedDensity = Math.min(
        100,
        zone.currentDensity + Math.floor(zone.currentDensity * 0.1)
    );

    return { risk, predictedDensity };
}

// ================= ZONES CONFIG =================
const ZONES = [
    { id: 1, name: "Stage", type: "attraction" },
    { id: 2, name: "Seating Area", type: "seating" },
    { id: 3, name: "Gate A", type: "entry" },
    { id: 4, name: "Gate B", type: "entry" },
    { id: 5, name: "Gate C", type: "entry" },
    { id: 6, name: "Food Court", type: "service" },
    { id: 7, name: "Restrooms", type: "facility" },
    { id: 8, name: "Merchandise Zone", type: "service" },
    { id: 9, name: "Parking Area", type: "transit" },
    { id: 10, name: "Drop-off Zone", type: "transit" },
    { id: 11, name: "Medical Zone", type: "safety" },
    { id: 12, name: "Security Check", type: "safety" }
];

// ================= INITIALIZATION =================
function initializeZones() {
    ZONES.forEach(zone => {
        zone.currentDensity = Math.floor(Math.random() * 30) + 30;
        zone.currentWaitTime = calculateWaitTime(zone.currentDensity, zone.type);
    });
}

function calculateWaitTime(density, type) {
    if (!density) return 0;

    let base = Math.floor(density / 5);
    if (type === "service") base *= 1.3;
    if (type === "entry") base *= 1.2;

    return Math.floor(base);
}

// ================= UI UPDATE =================
function updateSingleZoneUI(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;

    const ai = aiAnalyzeZone(zone);

    const zoneCard = document.querySelector(`.zone-card[data-zone-id="${zoneId}"]`);
    if (!zoneCard) return;

    zoneCard.querySelector('.density-value').textContent = `${zone.currentDensity}%`;

    if (ai) {
        zoneCard.querySelector('.prediction-badge').innerHTML =
            `📈 ${ai.predictedDensity}% • ${ai.risk}`;
    }
}

// ================= NAVIGATION AI =================
function updateNavigationPageSuggestion() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navPageSuggestion');

    if (!select || !suggestionDiv) return;

    const selected = select.value;
    if (!selected) {
        suggestionDiv.innerHTML = "🤖 Select your location";
        return;
    }

    const zone = ZONES.find(z => z.name === selected);
    if (!zone) return;

    const ai = aiAnalyzeZone(zone);

    suggestionDiv.innerHTML = `
        <strong>📍 ${zone.name}</strong><br>
        Density: ${zone.currentDensity}%<br>
        ⏱ Wait: ${zone.currentWaitTime} min<br><br>
        🤖 AI Risk: ${ai.risk}<br>
        📈 Predicted: ${ai.predictedDensity}%
    `;
}

// ================= SIMULATION =================
function updateZones() {
    ZONES.forEach(zone => {
        zone.currentDensity = Math.max(
            20,
            Math.min(95, zone.currentDensity + (Math.random() * 10 - 5))
        );

        zone.currentWaitTime = calculateWaitTime(zone.currentDensity, zone.type);
        updateSingleZoneUI(zone.id);
    });
}

// ================= START =================
initializeZones();
setInterval(updateZones, 2500);
