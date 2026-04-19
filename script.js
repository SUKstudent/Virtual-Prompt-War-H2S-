// ============================================
// ZONES CONFIGURATION (12 zones)
// ============================================
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

// Screen order
let currentScreen = "dashboard";
let lastEventLog = "📢 System initialized • All sensors online";

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

// ============================================
// GET STARTED FUNCTION
// ============================================
function getStarted() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainApp = document.getElementById('mainApp');
    
    welcomeScreen.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        mainApp.style.display = 'block';
        mainApp.style.animation = 'fadeIn 0.5s ease';
        
        initializeZones();
        rebuildZonesGrid();
        updateDashboardStats();
        updateTimestamp();
        startStaggeredUpdates();
        startEventLogUpdates();
        
        // Setup navigation listener
        const locationSelect = document.getElementById('userLocation');
        if (locationSelect) {
            locationSelect.addEventListener('change', updateNavigationSuggestion);
        }
    }, 300);
}

// Add fadeOut animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

// ============================================
// INITIALIZATION
// ============================================
function initializeZones() {
    ZONES.forEach(zone => {
        zone.currentDensity = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
        zone.currentWaitTime = calculateWaitTime(zone.currentDensity, zone.type);
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

// Get color based on density
function getColorClass(density) {
    if (density < 45) return 'green';
    if (density < 70) return 'yellow';
    return 'red';
}

// ============================================
// SMOOTH TRANSITIONS (Gradual changes)
// ============================================
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
    
    // Gradual density change (max 3% per frame)
    if (zone.targetDensity !== undefined && zone.currentDensity !== zone.targetDensity) {
        const diff = zone.targetDensity - zone.currentDensity;
        const step = Math.min(Math.abs(diff), 3) * Math.sign(diff);
        zone.currentDensity = Math.round(zone.currentDensity + step);
        changed = true;
    }
    
    // Gradual wait time change (max 1 min per frame)
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

// ============================================
// STAGGERED UPDATES (Every 2.5 seconds, with delay between zones)
// ============================================
function startStaggeredUpdates() {
    setInterval(() => {
        const newTargets = ZONES.map(zone => ({
            zoneId: zone.id,
            targetDensity: generateTargetDensity(zone),
            targetWaitTime: calculateWaitTime(generateTargetDensity(zone), zone.type)
        }));
        
        // Update each zone with delay (simulates real sensors)
        newTargets.forEach((target, index) => {
            setTimeout(() => {
                smoothTransition(target.zoneId, target.targetDensity, target.targetWaitTime);
            }, index * 150); // 150ms delay between zones
        });
        
        // Update summary stats after all zones
        setTimeout(() => {
            updateDashboardStats();
            updateNavigationSuggestion(); // Update navigation suggestion when data changes
        }, ZONES.length * 150 + 200);
        
        // Update timestamp
        updateTimestamp();
        
    }, 2500); // Update every 2.5 seconds
}

// ============================================
// EVENT LOG UPDATES
// ============================================
function startEventLogUpdates() {
    setInterval(() => {
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

// ============================================
// SMART NAVIGATION - Location Selection
// ============================================
function updateNavigationSuggestion() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navSuggestion');
    
    if (!select || !suggestionDiv) return;
    
    const selectedLocation = select.value;
    
    if (!selectedLocation) {
        suggestionDiv.innerHTML = '🤖 Select a location above for AI-powered navigation guidance';
        return;
    }
    
    // Find the selected zone
    const zone = ZONES.find(z => z.name === selectedLocation);
    if (!zone) return;
    
    const density = zone.currentDensity;
    const waitTime = zone.currentWaitTime;
    
    // Generate suggestion based on density
    if (density > 70) {
        // Find less crowded alternatives
        const alternatives = ZONES.filter(z => z.currentDensity < 50 && z.name !== selectedLocation).slice(0, 2);
        
        if (alternatives.length > 0) {
            suggestionDiv.innerHTML = `
                🚶 <strong>${selectedLocation} is heavily congested</strong><br>
                Current density: ${density}% • Wait time: ${waitTime} min<br><br>
                🤖 <strong>AI Recommendation:</strong><br>
                Consider moving toward:<br>
                • ${alternatives[0].name} (${alternatives[0].currentDensity}% density)<br>
                ${alternatives[1] ? `• ${alternatives[1].name} (${alternatives[1].currentDensity}% density)` : ''}
            `;
        } else {
            suggestionDiv.innerHTML = `
                🚶 <strong>${selectedLocation} is heavily congested</strong><br>
                Density: ${density}% • Wait: ${waitTime} min<br><br>
                ⚠️ All zones are moderately crowded. Consider waiting 10-15 minutes.
            `;
        }
    } else if (density > 45) {
        const predicted = Math.min(98, density + Math.floor(Math.random() * 10) + 2);
        suggestionDiv.innerHTML = `
            ⚠️ <strong>${selectedLocation} is moderately busy</strong><br>
            Current density: ${density}% • Wait time: ${waitTime} min<br><br>
            📊 AI predicts ${predicted}% density in 10 minutes.<br>
            💡 Consider visiting during off-peak hours.
        `;
    } else {
        suggestionDiv.innerHTML = `
            ✅ <strong>${selectedLocation} is currently clear</strong><br>
            Density: ${density}% • Wait time: ${waitTime} min<br><br>
            🎉 Great time to visit! Enjoy the event!
        `;
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================
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
            const predicted = Math.min(98, zone.currentDensity + Math.floor(Math.random() * 10) - 3);
            predictionBadge.innerHTML = `📈 ${predicted}% in 10min`;
        }
        if (fillBar) fillBar.style.width = `${zone.currentDensity}%`;
        
        // Update color class
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
        const predicted = Math.min(98, zone.currentDensity + Math.floor(Math.random() * 10) - 3);
        
        const zoneCard = document.createElement('div');
        zoneCard.className = `zone-card ${colorClass}`;
        zoneCard.setAttribute('data-zone-id', zone.id);
        zoneCard.innerHTML = `
            <div class="zone-info">
                <h4>${zone.name}</h4>
                <div class="density-bar">
                    <div class="density-fill ${colorClass}" style="width: ${zone.currentDensity}%"></div>
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
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        timestampEl.innerHTML = `⏱ Last updated: ${timeString}`;
    }
}

// ============================================
// SCREEN NAVIGATION
// ============================================
function goToScreen(screenName) {
    currentScreen = screenName;
    
    // Hide all screens
    const screens = ['dashboard', 'about'];
    screens.forEach(screen => {
        const element = document.getElementById(`screen-${screen}`);
        if (element) element.classList.remove('active');
    });
    
    // Show selected screen
    const selectedScreen = document.getElementById(`screen-${screenName}`);
    if (selectedScreen) selectedScreen.classList.add('active');
    
    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemScreen = item.getAttribute('data-screen');
        if (itemScreen === screenName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Refresh dashboard data if needed
    if (screenName === 'dashboard') {
        rebuildZonesGrid();
        updateDashboardStats();
        updateNavigationSuggestion();
    }
}

// ============================================
// INITIALIZE
// ============================================
initializeZones();
