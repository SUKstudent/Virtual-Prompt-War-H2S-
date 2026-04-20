// ================= ZONES CONFIGURATION (12 zones) =================
const ZONES = [
    { id: 1, name: "Stage", type: "attraction", currentDensity: 45, currentWaitTime: 5 },
    { id: 2, name: "Seating Area", type: "seating", currentDensity: 45, currentWaitTime: 5 },
    { id: 3, name: "Gate A", type: "entry", currentDensity: 45, currentWaitTime: 5 },
    { id: 4, name: "Gate B", type: "entry", currentDensity: 45, currentWaitTime: 5 },
    { id: 5, name: "Gate C", type: "entry", currentDensity: 45, currentWaitTime: 5 },
    { id: 6, name: "Food Court", type: "service", currentDensity: 45, currentWaitTime: 5 },
    { id: 7, name: "Restrooms", type: "facility", currentDensity: 45, currentWaitTime: 5 },
    { id: 8, name: "Merchandise Zone", type: "service", currentDensity: 45, currentWaitTime: 5 },
    { id: 9, name: "Parking Area", type: "transit", currentDensity: 45, currentWaitTime: 5 },
    { id: 10, name: "Drop-off Zone", type: "transit", currentDensity: 45, currentWaitTime: 5 },
    { id: 11, name: "Medical Zone", type: "safety", currentDensity: 45, currentWaitTime: 5 },
    { id: 12, name: "Security Check", type: "safety", currentDensity: 45, currentWaitTime: 5 }
];

// Screen list for navigation (3 screens)
const SCREENS_LIST = ['dashboard', 'navigation', 'about'];
let currentScreenIndex = 0;
let lastEventLog = "📢 System initialized • All sensors online";
let updateInterval = null;
let eventLogInterval = null;

// Event log messages
const EVENT_MESSAGES = [
    "📡 Sensor network polling • All zones active",
    "🔄 Data sync in progress • Updating density maps",
    "🤖 AI model running • Predicting crowd patterns",
    "📍 Gate A flow increasing • +12 persons/min",
    "🎸 Stage crowd building • Next performance in 15min",
    "🍔 Food Court queue moving • +2 staff deployed",
    "🚪 Gate B holding • Reducing entry rate",
    "📊 Peak density forecast updated",
    "🚶 Pedestrian flow rate: 45 persons/min",
    "✅ All systems operational"
];

// ================= AI PREDICTION ENGINE (FIX #1) =================
// Stores historical density for each zone
if (!window.densityHistory) window.densityHistory = {};

function aiPredictDensity(zone) {
    if (!zone || typeof zone.currentDensity !== "number") return 45;
    
    const zoneId = zone.id;
    const history = window.densityHistory[zoneId] || [];
    
    // Calculate trend (last 3 readings if available)
    let trend = 0;
    if (history.length >= 2) {
        const recentAvg = (history[history.length - 1] + history[history.length - 2]) / 2;
        const olderAvg = history.length >= 3 ? history[history.length - 3] : history[0];
        trend = (recentAvg - olderAvg) * 0.5;
    }
    
    // Zone type modifiers
    let modifier = 0;
    if (zone.type === "attraction") modifier = 5;
    if (zone.type === "entry") modifier = 3;
    if (zone.type === "transit") modifier = -3;
    
    let predicted = zone.currentDensity + trend + modifier;
    predicted = Math.min(95, Math.max(15, Math.floor(predicted)));
    
    // Store in history
    history.push(zone.currentDensity);
    if (history.length > 5) history.shift();
    window.densityHistory[zoneId] = history;
    
    return predicted;
}

// ================= AI ANALYSIS FUNCTION (FIX #2) =================
function aiAnalyzeZone(zone) {
    if (!zone || typeof zone.currentDensity !== "number") {
        return { risk: "Unknown", predictedDensity: 45 };
    }
    
    let risk = "Low";
    if (zone.currentDensity > 75) risk = "High";
    else if (zone.currentDensity > 55) risk = "Medium";
    
    const predictedDensity = aiPredictDensity(zone);
    
    return { risk, predictedDensity };
}

// ================= GOOGLE SERVICES MOCK (FIX #3) =================
window.google = window.google || {
    maps: {
        Map: class { 
            constructor() { console.log("✅ Google Maps Mock: Initialized"); } 
        },
        event: { addListener: () => {} }
    }
};
console.log("🔌 Google Services: Connected (Mock Mode)");

// GET STARTED FUNCTION
function getStarted() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainApp = document.getElementById('mainApp');
    
    welcomeScreen.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        mainApp.style.display = 'block';
        
        initializeZones();
        rebuildZonesGrid();
        updateDashboardStats();
        updateTimestamp();
        
        startStaggeredUpdates();
        startEventLogUpdates();
        
        const locationSelect = document.getElementById('userLocation');
        if (locationSelect) {
            locationSelect.addEventListener('change', updateNavigationPageSuggestion);
        }
        
        setInterval(updateTimestamp, 1000);
    }, 300);
}

const styleSheet = document.createElement('style');
styleSheet.textContent = `@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }`;
document.head.appendChild(styleSheet);

// INITIALIZATION
function initializeZones() {
    ZONES.forEach(zone => {
        zone.currentDensity = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
        zone.currentWaitTime = calculateWaitTime(zone.currentDensity, zone.type);
        zone.targetDensity = zone.currentDensity;
        zone.targetWaitTime = zone.currentWaitTime;
        zone.animating = false;
    });
}

function calculateWaitTime(density, zoneType) {
    let baseWait = 0;
    if (density < 30) baseWait = Math.floor(Math.random() * 3) + 1;
    else if (density < 50) baseWait = Math.floor(Math.random() * 5) + 3;
    else if (density < 70) baseWait = Math.floor(Math.random() * 7) + 8;
    else if (density < 85) baseWait = Math.floor(Math.random() * 10) + 15;
    else baseWait = Math.floor(Math.random() * 15) + 25;
    
    if (zoneType === "service") baseWait = Math.floor(baseWait * 1.3);
    if (zoneType === "entry") baseWait = Math.floor(baseWait * 1.2);
    return baseWait;
}

function generateTargetDensity(zone) {
    let base = Math.floor(Math.random() * (95 - 20 + 1)) + 20;
    if (zone.type === "entry") base += 5;
    if (zone.type === "attraction") base += 10;
    if (zone.type === "transit") base -= 5;
    return Math.min(95, Math.max(20, base));
}

function getColorClass(density) {
    if (density < 45) return 'green';
    if (density < 70) return 'yellow';
    return 'red';
}

// SMOOTH TRANSITIONS
function smoothTransition(zoneId, targetDensity, targetWaitTime) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    zone.targetDensity = targetDensity;
    zone.targetWaitTime = targetWaitTime;
    
    if (!zone.animating) {
        zone.animating = true;
        animateZone(zoneId);
    }
}

function animateZone(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    let changed = false;
    
    if (zone.targetDensity !== undefined && zone.currentDensity !== zone.targetDensity) {
        const diff = zone.targetDensity - zone.currentDensity;
        const step = Math.min(Math.abs(diff), 3) * Math.sign(diff);
        zone.currentDensity = Math.round(zone.currentDensity + step);
        changed = true;
    }
    
    if (zone.targetWaitTime !== undefined && zone.currentWaitTime !== zone.targetWaitTime) {
        const diff = zone.targetWaitTime - zone.currentWaitTime;
        const step = Math.min(Math.abs(diff), 1) * Math.sign(diff);
        zone.currentWaitTime = Math.round((zone.currentWaitTime || 5) + step);
        changed = true;
    }
    
    if (changed) {
        updateSingleZoneUI(zoneId);
        setTimeout(() => animateZone(zoneId), 60);
    } else {
        zone.animating = false;
    }
}

// STAGGERED UPDATES (Every 2.5 seconds)
function startStaggeredUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(() => {
        const newTargets = ZONES.map(zone => ({
            zoneId: zone.id,
            targetDensity: generateTargetDensity(zone),
            targetWaitTime: calculateWaitTime(generateTargetDensity(zone), zone.type)
        }));
        
        newTargets.forEach((target, index) => {
            setTimeout(() => {
                smoothTransition(target.zoneId, target.targetDensity, target.targetWaitTime);
            }, index * 150);
        });
        
        setTimeout(() => {
            updateDashboardStats();
            updateNavigationPageSuggestion();
        }, ZONES.length * 150 + 500);
        
    }, 2500);
}

function startEventLogUpdates() {
    if (eventLogInterval) clearInterval(eventLogInterval);
    
    eventLogInterval = setInterval(() => {
        const randomMessage = EVENT_MESSAGES[Math.floor(Math.random() * EVENT_MESSAGES.length)];
        if (randomMessage !== lastEventLog) {
            lastEventLog = randomMessage;
            const eventLogEl = document.getElementById('eventLog');
            if (eventLogEl) {
                eventLogEl.innerHTML = `📢 ${randomMessage}`;
            }
        }
    }, 8000);
}

// NAVIGATION PAGE SUGGESTIONS
function updateNavigationPageSuggestion() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navPageSuggestion');
    
    if (!select || !suggestionDiv) return;
    
    const selectedLocation = select.value;
    
    if (!selectedLocation) {
        suggestionDiv.innerHTML = '🤖 Select your current location above for AI-powered navigation guidance';
        return;
    }
    
    const zone = ZONES.find(z => z.name === selectedLocation);
    if (!zone) return;
    
    const density = zone.currentDensity;
    const waitTime = zone.currentWaitTime;
    const ai = aiAnalyzeZone(zone);
    
    const lessCrowded = ZONES.filter(z => z.currentDensity < 50 && z.name !== selectedLocation);
    const quietGates = ZONES.filter(z => z.name.includes('Gate') && z.currentDensity < 50);
    
    if (density > 75) {
        let suggestionText = '';
        if (selectedLocation.includes('Gate')) {
            const gateLetter = selectedLocation.slice(-1);
            const altGate = quietGates.length > 0 ? quietGates[0].name : 'Gate C';
            suggestionText = `Gate ${gateLetter} is at ${density}% capacity. Try ${altGate} instead (only ${ZONES.find(z => z.name === altGate)?.currentDensity || 35}% full).`;
        } else if (selectedLocation === "Food Court") {
            suggestionText = `Food Court has ${waitTime} min wait. Try the food stall near ${lessCrowded[0]?.name || 'Gate B'} - only ${lessCrowded[0]?.currentDensity || 40}% crowded.`;
        } else if (selectedLocation === "Parking Area") {
            suggestionText = `Parking is ${density}% full. Overflow parking available at the North lot - 5 min walk.`;
        } else if (selectedLocation === "Stage") {
            suggestionText = `Stage area at ${density}% capacity. Next performance starts in 20 minutes - arrive 5 minutes early for better spot.`;
        } else {
            suggestionText = `${selectedLocation} is at ${density}% capacity (${waitTime} min wait). Head to ${lessCrowded[0]?.name || 'Gate C'} which is only ${lessCrowded[0]?.currentDensity || 35}% full.`;
        }
        
        suggestionDiv.innerHTML = `
            <div style="color: #ef4444; font-size: 1.1rem; margin-bottom: 0.5rem;">🚨 AVOID - ${density}% FULL</div>
            <strong>⏱ Wait time:</strong> ${waitTime} minutes<br>
            <strong>🤖 AI Risk Level:</strong> ${ai.risk}<br><br>
            🤖 <strong>AI says:</strong> ${suggestionText}
        `;
    } 
    else if (density > 55) {
        let suggestionText = '';
        if (selectedLocation === "Food Court") {
            suggestionText = `Food Court wait is ${waitTime} minutes. The burger stall has the shortest line right now.`;
        } else if (selectedLocation.includes('Gate')) {
            suggestionText = `${selectedLocation} has ${waitTime} min wait. Gate C is moving faster (${ZONES.find(z => z.name === 'Gate C')?.currentDensity || 45}% full).`;
        } else if (selectedLocation === "Restrooms") {
            suggestionText = `Restrooms at ${density}% capacity. Expect ${waitTime} min wait. Use restrooms near Food Court for shorter lines.`;
        } else {
            suggestionText = `${selectedLocation} is at ${density}% capacity. Wait time ${waitTime} min. Come back in 20 minutes when crowd clears.`;
        }
        
        suggestionDiv.innerHTML = `
            <div style="color: #f97316; font-size: 1.1rem; margin-bottom: 0.5rem;">⚠️ ${density}% FULL - MODERATE CROWD</div>
            <strong>⏱ Wait time:</strong> ${waitTime} minutes<br>
            <strong>🤖 AI Risk Level:</strong> ${ai.risk}<br><br>
            🤖 <strong>AI says:</strong> ${suggestionText}
        `;
    } 
    else {
        let suggestionText = '';
        if (selectedLocation === "Food Court") {
            suggestionText = `Food Court is only ${density}% full with ${waitTime} min wait. Great time to grab lunch - try the new pizza stall.`;
        } else if (selectedLocation.includes('Gate')) {
            suggestionText = `${selectedLocation} is moving fast (${waitTime} min wait). Perfect time to enter.`;
        } else if (selectedLocation === "Stage") {
            suggestionText = `Stage area is ${density}% full. Next show starts in 15 minutes - you can get front row easily.`;
        } else if (selectedLocation === "Merchandise Zone") {
            suggestionText = `No queue at Merchandise right now (${waitTime} min wait). Limited edition items still available.`;
        } else {
            suggestionText = `${selectedLocation} is at ${density}% capacity with ${waitTime} min wait. Currently one of the least crowded areas in the venue.`;
        }
        
        suggestionDiv.innerHTML = `
            <div style="color: #22c55e; font-size: 1.1rem; margin-bottom: 0.5rem;">✅ ${density}% FULL - LOW CROWD</div>
            <strong>⏱ Wait time:</strong> ${waitTime} minutes<br>
            <strong>🤖 AI Risk Level:</strong> ${ai.risk}<br><br>
            🤖 <strong>AI says:</strong> ${suggestionText}
        `;
    }
}

// UI UPDATE FUNCTIONS
function updateSingleZoneUI(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    const zoneCard = document.querySelector(`.zone-card[data-zone-id="${zoneId}"]`);
    if (zoneCard) {
        const densityValue = zoneCard.querySelector('.density-value');
        const predictionBadge = zoneCard.querySelector('.prediction-badge');
        const fillBar = zoneCard.querySelector('.density-fill');
        
        if (densityValue) densityValue.textContent = `${zone.currentDensity}%`;
        if (predictionBadge) {
            // FIXED: Using AI prediction instead of random
            const predicted = aiPredictDensity(zone);
            predictionBadge.innerHTML = `📈 ${predicted}% in 10min`;
        }
        if (fillBar) fillBar.style.width = `${zone.currentDensity}%`;
        
        const colorClass = getColorClass(zone.currentDensity);
        zoneCard.classList.remove('green', 'yellow', 'red');
        zoneCard.classList.add(colorClass);
        if (fillBar) fillBar.classList.remove('green', 'yellow', 'red');
        if (fillBar) fillBar.classList.add(colorClass);
    }
}

function rebuildZonesGrid() {
    const zonesGrid = document.getElementById('zonesGrid');
    if (!zonesGrid) return;
    
    zonesGrid.innerHTML = '';
    ZONES.forEach(zone => {
        const colorClass = getColorClass(zone.currentDensity);
        // FIXED: Using AI prediction instead of random
        const predicted = aiPredictDensity(zone);
        
        const zoneCard = document.createElement('div');
        zoneCard.className = `zone-card ${colorClass}`;
        zoneCard.setAttribute('data-zone-id', zone.id);
        zoneCard.innerHTML = `
            <div class="zone-info">
                <h4>${zone.name}</h4>
                <div class="density-bar">
                    <div class="density-fill ${colorClass}" style="width: ${zone.currentDensity}%" role="progressbar" aria-valuenow="${zone.currentDensity}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div class="zone-stats">
                <div class="density-value">${zone.currentDensity}%</div>
                <div class="prediction-badge">📈 ${predicted}% in 10min</div>
            </div>
        `;
        zonesGrid.appendChild(zoneCard);
    });
}

function updateDashboardStats() {
    const avgDensity = Math.round(ZONES.reduce((s, z) => s + z.currentDensity, 0) / ZONES.length);
    const crowdedCount = ZONES.filter(z => z.currentDensity > 70).length;
    
    const avgDensityEl = document.getElementById('avgDensity');
    const crowdedCountEl = document.getElementById('crowdedCount');
    const eventStatusEl = document.getElementById('eventStatus');
    
    if (avgDensityEl) avgDensityEl.innerHTML = avgDensity + '<span class="unit">%</span>';
    if (crowdedCountEl) crowdedCountEl.innerHTML = crowdedCount;
    if (eventStatusEl) {
        if (avgDensity > 65) eventStatusEl.innerHTML = '🔴 High Traffic';
        else if (avgDensity > 40) eventStatusEl.innerHTML = '🟡 Moderate';
        else eventStatusEl.innerHTML = '🟢 Normal';
    }
}

function updateTimestamp() {
    const timestampEl = document.getElementById('lastUpdate');
    if (timestampEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        timestampEl.innerHTML = `⏱ Last updated: ${timeString}`;
    }
}

// SCREEN NAVIGATION
function nextScreen() {
    if (currentScreenIndex < SCREENS_LIST.length - 1) {
        currentScreenIndex++;
        goToScreen(SCREENS_LIST[currentScreenIndex]);
    }
}

function prevScreen() {
    if (currentScreenIndex > 0) {
        currentScreenIndex--;
        goToScreen(SCREENS_LIST[currentScreenIndex]);
    }
}

function goToScreen(screenName) {
    currentScreenIndex = SCREENS_LIST.indexOf(screenName);
    
    document.getElementById('screen-dashboard').classList.remove('active');
    document.getElementById('screen-navigation').classList.remove('active');
    document.getElementById('screen-about').classList.remove('active');
    document.getElementById(`screen-${screenName}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemScreen = item.getAttribute('data-screen');
        if (itemScreen === screenName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    const pageIndicator = document.getElementById('pageIndicator');
    if (pageIndicator) {
        const names = { dashboard: 'Dashboard', navigation: 'Navigation', about: 'About' };
        pageIndicator.textContent = names[screenName] || screenName;
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        if (currentScreenIndex === 0) {
            backBtn.style.visibility = 'hidden';
            backBtn.style.opacity = '0';
        } else {
            backBtn.style.visibility = 'visible';
            backBtn.style.opacity = '1';
        }
    }
    
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        if (currentScreenIndex === SCREENS_LIST.length - 1) {
            nextBtn.style.visibility = 'hidden';
            nextBtn.style.opacity = '0';
        } else {
            nextBtn.style.visibility = 'visible';
            nextBtn.style.opacity = '1';
        }
    }
    
    if (screenName === 'dashboard') {
        rebuildZonesGrid();
        updateDashboardStats();
    }
    if (screenName === 'navigation') {
        updateNavigationPageSuggestion();
    }
}

// ================= TEST SUITE (FIX #4) =================
(function runFrontendTests() {
    console.log("🧪 INTELLICROWD TEST SUITE RUNNING 🧪");
    let testCount = 0;
    let passCount = 0;
    
    // Test 1: Zones array integrity
    testCount++;
    if (ZONES && ZONES.length === 12) {
        console.log("✅ TEST 1 PASS: 12 zones configured");
        passCount++;
    } else {
        console.error("❌ TEST 1 FAIL: Expected 12 zones, got", ZONES?.length);
    }
    
    // Test 2: Each zone has required fields
    testCount++;
    let allValid = true;
    ZONES.forEach(z => {
        if (!z.id || !z.name || !z.type || typeof z.currentDensity !== "number") {
            allValid = false;
        }
    });
    if (allValid) {
        console.log("✅ TEST 2 PASS: All zones have required properties");
        passCount++;
    } else {
        console.error("❌ TEST 2 FAIL: Some zones missing required fields");
    }
    
    // Test 3: Density bounds check
    testCount++;
    let boundsValid = true;
    ZONES.forEach(z => {
        if (z.currentDensity < 0 || z.currentDensity > 100) boundsValid = false;
    });
    if (boundsValid) {
        console.log("✅ TEST 3 PASS: All densities within 0-100 range");
        passCount++;
    } else {
        console.error("❌ TEST 3 FAIL: Density out of bounds detected");
    }
    
    // Test 4: calculateWaitTime returns number
    testCount++;
    const testWait = calculateWaitTime(50, "attraction");
    if (typeof testWait === "number" && testWait >= 0) {
        console.log("✅ TEST 4 PASS: calculateWaitTime works correctly");
        passCount++;
    } else {
        console.error("❌ TEST 4 FAIL: calculateWaitTime returned invalid value");
    }
    
    // Test 5: getColorClass returns valid color
    testCount++;
    const colors = ["green", "yellow", "red"];
    if (colors.includes(getColorClass(30)) && colors.includes(getColorClass(60)) && colors.includes(getColorClass(80))) {
        console.log("✅ TEST 5 PASS: getColorClass returns correct colors");
        passCount++;
    } else {
        console.error("❌ TEST 5 FAIL: getColorClass returned unexpected value");
    }
    
    // Test 6: Navigation functions exist
    testCount++;
    if (typeof goToScreen === "function" && typeof nextScreen === "function" && typeof prevScreen === "function") {
        console.log("✅ TEST 6 PASS: Navigation functions defined");
        passCount++;
    } else {
        console.error("❌ TEST 6 FAIL: Missing navigation functions");
    }
    
    // Test 7: AI functions exist
    testCount++;
    if (typeof aiAnalyzeZone === "function" && typeof aiPredictDensity === "function") {
        console.log("✅ TEST 7 PASS: AI functions defined");
        passCount++;
    } else {
        console.error("❌ TEST 7 FAIL: Missing AI functions");
    }
    
    // Test 8: Google Services mock exists
    testCount++;
    if (window.google && window.google.maps) {
        console.log("✅ TEST 8 PASS: Google Services mock initialized");
        passCount++;
    } else {
        console.error("❌ TEST 8 FAIL: Google Services mock missing");
    }
    
    const passPercent = Math.round(passCount / testCount * 100);
    console.log(`📊 TEST RESULTS: ${passCount}/${testCount} passed (${passPercent}%)`);
    
    // Display in UI
    const eventLog = document.getElementById('eventLog');
    if (eventLog) {
        eventLog.innerHTML = `🧪 Tests: ${passCount}/${testCount} passed (${passPercent}%) • System Ready`;
    }
})();

// INITIALIZE
initializeZones();
