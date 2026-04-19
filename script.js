// ============================================
// ZONES CONFIGURATION (12 zones)
// ============================================
const ZONES = [
    { id: 1, name: "Stage", type: "attraction", currentDensity: 45, targetDensity: 45 },
    { id: 2, name: "Seating Area", type: "seating", currentDensity: 45, targetDensity: 45 },
    { id: 3, name: "Gate A", type: "entry", currentDensity: 45, targetDensity: 45 },
    { id: 4, name: "Gate B", type: "entry", currentDensity: 45, targetDensity: 45 },
    { id: 5, name: "Gate C", type: "entry", currentDensity: 45, targetDensity: 45 },
    { id: 6, name: "Food Court", type: "service", currentDensity: 45, targetDensity: 45 },
    { id: 7, name: "Restrooms", type: "facility", currentDensity: 45, targetDensity: 45 },
    { id: 8, name: "Merchandise Zone", type: "service", currentDensity: 45, targetDensity: 45 },
    { id: 9, name: "Parking Area", type: "transit", currentDensity: 45, targetDensity: 45 },
    { id: 10, name: "Drop-off Zone", type: "transit", currentDensity: 45, targetDensity: 45 },
    { id: 11, name: "Medical Zone", type: "safety", currentDensity: 45, targetDensity: 45 },
    { id: 12, name: "Security Check", type: "safety", currentDensity: 45, targetDensity: 45 }
];

// Screen order for navigation
const SCREENS = ["welcome", "dashboard", "queues", "alerts", "navigate"];
let currentScreenIndex = 0;

// Store previous densities for smooth transitions
let previousDensities = {};
let isUpdating = false;
let updateQueue = [];

// ============================================
// CAUSE-EFFECT LOG GENERATOR
// ============================================
let lastEventLog = "System initialized • All sensors online";

const EVENT_MESSAGES = {
    gateOpened: ["Gate {gate} opened • Crowd redistributing", "Entry point {gate} activated • Flow increasing"],
    gateClosed: ["Gate {gate} temporarily held • Queue building", "Entry paused at {gate} • Density stabilizing"],
    stageEvent: ["Main stage performance starting • Crowd surging", "Artist announced • Movement toward Stage"],
    foodCourt: ["Food court new order batch ready • Line moving", "Additional food stall opened • Wait time decreasing"],
    restroom: ["Restroom cleaning completed • Capacity restored", "New restroom block opened • Pressure releasing"],
    security: ["Security check lane added • Throughput increasing", "Express lane activated at Security"],
    parking: ["Parking shuttle arrived • 50 guests moving", "Additional parking level opened"],
    prediction: ["AI predicts peak in 15min • Suggest rerouting", "Crowd flow optimization active"]
};

function generateEventLog(zonesData, changedZones) {
    const possibleLogs = [];
    
    // Check for gate changes
    const gates = zonesData.filter(z => z.name.includes('Gate'));
    gates.forEach(gate => {
        if (gate.density > 75) {
            possibleLogs.push(`🚪 ${gate.name} at ${gate.density}% • Consider opening additional lane`);
        }
    });
    
    // Check for stage crowd
    const stage = zonesData.find(z => z.name === "Stage");
    if (stage && stage.density > 70) {
        possibleLogs.push(`🎸 Stage area congested (${stage.density}%) • Next performance in 10min`);
    }
    
    // Check for food court
    const foodCourt = zonesData.find(z => z.name === "Food Court");
    if (foodCourt && foodCourt.density > 65) {
        possibleLogs.push(`🍔 Food Court wait time ${foodCourt.waitTime}min • Additional staff deployed`);
    }
    
    // AI prediction log
    const peakZone = zonesData.reduce((max, z) => z.predictedDensity > max.predictedDensity ? z : max, zonesData[0]);
    if (peakZone.predictedDensity > 75) {
        possibleLogs.push(`🤖 AI Forecast: ${peakZone.name} will reach ${peakZone.predictedDensity}% in 10 minutes`);
    }
    
    // Random interesting log
    const randomLogs = [
        `📊 Real-time sync • ${zonesData.length} zones active`,
        `🔄 Crowd flow optimization running`,
        `📍 ${Math.floor(Math.random() * 500) + 100} attendees in venue`,
        `⏱ Average wait time: ${Math.round(zonesData.reduce((s,z)=>s+z.waitTime,0)/zonesData.length)} min`,
        `🚶 Pedestrian flow rate: ${Math.floor(Math.random() * 50) + 30} persons/min`
    ];
    
    if (possibleLogs.length > 0) {
        const selected = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
        if (selected !== lastEventLog) {
            lastEventLog = selected;
            return selected;
        }
    }
    
    const randomLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
    if (randomLog !== lastEventLog) {
        lastEventLog = randomLog;
        return randomLog;
    }
    
    return lastEventLog;
}

// ============================================
// SMOOTH NUMBER TRANSITIONS
// ============================================
function smoothTransition(zoneId, targetDensity, targetWaitTime, targetPredicted) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    zone.targetDensity = targetDensity;
    zone.targetWaitTime = targetWaitTime;
    zone.targetPredicted = targetPredicted;
    
    // Start transition if not already animating
    if (!zone.animating) {
        zone.animating = true;
        animateZone(zoneId);
    }
}

function animateZone(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    const step = 3; // Change by 3% per frame
    let changed = false;
    
    if (zone.currentDensity !== zone.targetDensity) {
        const diff = zone.targetDensity - zone.currentDensity;
        const move = Math.min(Math.abs(diff), step) * Math.sign(diff);
        zone.currentDensity = Math.round(zone.currentDensity + move);
        changed = true;
    }
    
    if (zone.currentWaitTime !== zone.targetWaitTime && zone.targetWaitTime !== undefined) {
        const diff = zone.targetWaitTime - zone.currentWaitTime;
        const move = Math.min(Math.abs(diff), 1) * Math.sign(diff);
        zone.currentWaitTime = Math.round((zone.currentWaitTime || 0) + move);
        changed = true;
    }
    
    if (changed) {
        setTimeout(() => animateZone(zoneId), 50);
    } else {
        zone.animating = false;
    }
}

// Generate new target values
function generateTargetDensity(zone) {
    let base = Math.floor(Math.random() * (95 - 20 + 1)) + 20;
    
    if (zone.type === "entry") base += 5;
    if (zone.type === "attraction") base += 10;
    if (zone.type === "transit") base -= 5;
    
    return Math.min(95, Math.max(20, base));
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

function predictDensity(currentDensity, zoneType) {
    let trend = 0;
    if (zoneType === "attraction") trend = currentDensity > 70 ? -5 : 8;
    else if (zoneType === "entry") trend = currentDensity > 80 ? -8 : 3;
    else if (zoneType === "service") trend = currentDensity > 75 ? -3 : 5;
    else trend = currentDensity > 85 ? -10 : 2;
    
    let predicted = currentDensity + trend + (Math.random() * 6 - 3);
    return Math.min(98, Math.max(15, Math.round(predicted)));
}

// ============================================
// STAGGERED ZONE UPDATES (Sensor-like feel)
// ============================================
function updateZonesStaggered() {
    // Generate new target values for all zones
    const newTargets = ZONES.map(zone => {
        const targetDensity = generateTargetDensity(zone);
        const targetWaitTime = calculateWaitTime(targetDensity, zone.type);
        const targetPredicted = predictDensity(targetDensity, zone.type);
        return { zoneId: zone.id, targetDensity, targetWaitTime, targetPredicted };
    });
    
    // Update each zone with a delay (simulates sensors reporting one by one)
    newTargets.forEach((target, index) => {
        setTimeout(() => {
            smoothTransition(target.zoneId, target.targetDensity, target.targetWaitTime, target.targetPredicted);
            
            // Update UI for this zone if dashboard is visible
            const activeScreen = SCREENS[currentScreenIndex];
            if (activeScreen === 'dashboard') {
                updateSingleZoneUI(target.zoneId);
            }
        }, index * 150); // 150ms delay between each zone = 1.8 seconds for all 12 zones
    });
    
    // Update queues and alerts after all zones have started updating
    setTimeout(() => {
        if (SCREENS[currentScreenIndex] === 'queues') {
            updateQueuesUI();
        }
        if (SCREENS[currentScreenIndex] === 'alerts') {
            updateAlertsUI();
        }
        
        // Update timestamp and event log
        updateTimestamp();
        updateEventLog();
    }, ZONES.length * 150 + 200);
}

function updateSingleZoneUI(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    const zoneCard = document.querySelector(`.zone-card[data-zone-id="${zoneId}"]`);
    if (zoneCard) {
        const densityValue = zoneCard.querySelector('.density-value');
        const waitBadge = zoneCard.querySelector('.wait-badge');
        const fillBar = zoneCard.querySelector('.density-fill');
        
        if (densityValue) densityValue.textContent = `${zone.currentDensity}%`;
        if (waitBadge) waitBadge.textContent = `⏱ ${zone.currentWaitTime} min`;
        if (fillBar) fillBar.style.width = `${zone.currentDensity}%`;
        
        // Update status class
        const status = zone.currentDensity < 45 ? 'low' : (zone.currentDensity < 70 ? 'medium' : 'high');
        zoneCard.classList.remove('low', 'medium', 'high');
        zoneCard.classList.add(status);
        if (fillBar) fillBar.classList.remove('low', 'medium', 'high');
        if (fillBar) fillBar.classList.add(status);
    }
}

function updateQueuesUI() {
    const queuesGrid = document.getElementById('queuesGrid');
    if (!queuesGrid) return;
    
    const zonesWithCurrent = ZONES.map(zone => ({
        name: zone.name,
        waitTime: zone.currentWaitTime || zone.waitTime || 0
    }));
    
    const sortedByWait = [...zonesWithCurrent].sort((a, b) => b.waitTime - a.waitTime).slice(0, 8);
    const peakWait = sortedByWait[0]?.waitTime || 0;
    const busiestZone = sortedByWait[0]?.name || '--';
    const avgWait = Math.round(sortedByWait.reduce((s, z) => s + z.waitTime, 0) / sortedByWait.length);
    
    const peakWaitEl = document.getElementById('peakWait');
    const busiestZoneEl = document.getElementById('busiestZone');
    const avgWaitEl = document.getElementById('avgWait');
    
    if (peakWaitEl) peakWaitEl.innerHTML = `${peakWait} min`;
    if (busiestZoneEl) busiestZoneEl.innerHTML = busiestZone;
    if (avgWaitEl) avgWaitEl.innerHTML = `${avgWait} min`;
    
    queuesGrid.innerHTML = '';
    sortedByWait.forEach(zone => {
        let waitClass = 'low';
        if (zone.waitTime > 15) waitClass = 'high';
        else if (zone.waitTime > 8) waitClass = 'medium';
        
        const queueCard = document.createElement('div');
        queueCard.className = 'queue-card';
        queueCard.innerHTML = `
            <span>${zone.name}</span>
            <span class="wait-time ${waitClass}">${zone.waitTime} min</span>
        `;
        queuesGrid.appendChild(queueCard);
    });
}

function updateAlertsUI() {
    const alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) return;
    
    const zonesData = ZONES.map(zone => ({
        name: zone.name,
        density: zone.currentDensity,
        waitTime: zone.currentWaitTime,
        predictedDensity: zone.targetPredicted || predictDensity(zone.currentDensity, zone.type),
        type: zone.type
    }));
    
    const alerts = generateAlerts(zonesData);
    alertsContainer.innerHTML = '';
    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alert.type}`;
        alertDiv.innerHTML = `
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
        `;
        alertsContainer.appendChild(alertDiv);
    });
}

function generateAlerts(zonesData) {
    const alerts = [];
    const criticalZones = zonesData.filter(z => z.density > 80);
    const highZones = zonesData.filter(z => z.density > 70 && z.density <= 80);
    const quietZones = zonesData.filter(z => z.density < 40);
    
    criticalZones.forEach(zone => {
        alerts.push({
            type: 'critical',
            icon: '🚨',
            title: `CRITICAL: ${zone.name} Overcrowded`,
            message: `${zone.density}% capacity • ${zone.waitTime} min wait`
        });
    });
    
    if (highZones.length > 0 && quietZones.length > 0) {
        highZones.slice(0, 2).forEach(zone => {
            const alt = quietZones[0];
            alerts.push({
                type: 'suggestion',
                icon: '💡',
                title: `Suggestion: ${zone.name}`,
                message: `Redirect to ${alt.name} (${alt.density}% • ${alt.waitTime} min)`
            });
        });
    }
    
    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            icon: '✅',
            title: 'All Zones Operating Normally',
            message: 'Crowd flow is well balanced'
        });
    }
    
    const peakZone = zonesData.reduce((max, z) => z.predictedDensity > max.predictedDensity ? z : max, zonesData[0]);
    alerts.push({
        type: 'info',
        icon: '📊',
        title: 'AI Prediction',
        message: `Peak at ${peakZone.name} (${peakZone.predictedDensity}%) in ~10 min`
    });
    
    return alerts.slice(0, 5);
}

// ============================================
// TIMESTAMP UPDATE
// ============================================
function updateTimestamp() {
    const timestampEl = document.getElementById('lastUpdate');
    if (timestampEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        timestampEl.innerHTML = `Last updated: ${timeString}`;
    }
}

// ============================================
// EVENT LOG UPDATE (Cause-effect line)
// ============================================
function updateEventLog() {
    const eventLogEl = document.getElementById('eventLog');
    if (eventLogEl) {
        const zonesData = ZONES.map(zone => ({
            name: zone.name,
            density: zone.currentDensity,
            waitTime: zone.currentWaitTime,
            predictedDensity: zone.targetPredicted,
            type: zone.type
        }));
        const newLog = generateEventLog(zonesData, []);
        eventLogEl.innerHTML = `📢 ${newLog}`;
        
        // Add animation
        eventLogEl.style.animation = 'none';
        setTimeout(() => {
            eventLogEl.style.animation = 'slideIn 0.5s ease';
        }, 10);
    }
}

// Update dashboard stats
function updateDashboardStats() {
    const avgDensity = Math.round(ZONES.reduce((s, z) => s + (z.currentDensity || 45), 0) / ZONES.length);
    const crowdedCount = ZONES.filter(z => (z.currentDensity || 45) > 70).length;
    
    const avgDensityEl = document.getElementById('avgDensity');
    const crowdedCountEl = document.getElementById('crowdedCount');
    const eventStatusEl = document.getElementById('eventStatus');
    
    if (avgDensityEl) avgDensityEl.innerHTML = avgDensity + '<span class="unit">%</span>';
    if (crowdedCountEl) crowdedCountEl.innerHTML = crowdedCount;
    if (eventStatusEl) eventStatusEl.innerHTML = avgDensity > 60 ? '🟡 High Traffic' : '🟢 Normal';
}

// Rebuild entire zones grid UI
function rebuildZonesGrid() {
    const zonesGrid = document.getElementById('zonesGrid');
    if (!zonesGrid) return;
    
    zonesGrid.innerHTML = '';
    ZONES.forEach(zone => {
        const status = (zone.currentDensity || 45) < 45 ? 'low' : ((zone.currentDensity || 45) < 70 ? 'medium' : 'high');
        const zoneCard = document.createElement('div');
        zoneCard.className = `zone-card ${status}`;
        zoneCard.setAttribute('data-zone-id', zone.id);
        zoneCard.innerHTML = `
            <div class="zone-info">
                <h4>${zone.name}</h4>
                <div class="density-bar">
                    <div class="density-fill ${status}" style="width: ${zone.currentDensity || 45}%"></div>
                </div>
                <small>AI: ${zone.targetPredicted || predictDensity(zone.currentDensity || 45, zone.type)}% in 10min</small>
            </div>
            <div class="zone-stats">
                <div class="density-value">${zone.currentDensity || 45}%</div>
                <div class="wait-badge">⏱ ${zone.currentWaitTime || calculateWaitTime(zone.currentDensity || 45, zone.type)} min</div>
            </div>
        `;
        zonesGrid.appendChild(zoneCard);
    });
}

// Force full UI refresh
function forceRefresh() {
    rebuildZonesGrid();
    updateDashboardStats();
    updateQueuesUI();
    updateAlertsUI();
    updateTimestamp();
}

// ============================================
// SCREEN NAVIGATION
// ============================================
function goToScreen(screenId) {
    const index = SCREENS.indexOf(screenId);
    if (index !== -1) {
        currentScreenIndex = index;
        showCurrentScreen();
    }
}

function nextScreen() {
    if (currentScreenIndex < SCREENS.length - 1) {
        currentScreenIndex++;
        showCurrentScreen();
    }
}

function prevScreen() {
    if (currentScreenIndex > 0) {
        currentScreenIndex--;
        showCurrentScreen();
    }
}

function showCurrentScreen() {
    SCREENS.forEach(screen => {
        const element = document.getElementById(`screen-${screen}`);
        if (element) element.classList.remove('active');
    });
    
    const currentScreen = SCREENS[currentScreenIndex];
    const currentElement = document.getElementById(`screen-${currentScreen}`);
    if (currentElement) currentElement.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemScreen = item.getAttribute('data-screen');
        if (itemScreen === currentScreen) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    const pageIndicator = document.getElementById('pageIndicator');
    if (pageIndicator) {
        const names = { welcome: 'Welcome', dashboard: 'Dashboard', queues: 'Queues', alerts: 'Alerts', navigate: 'Navigate' };
        pageIndicator.textContent = names[currentScreen] || currentScreen;
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        if (currentScreen === 'welcome') {
            backBtn.style.visibility = 'hidden';
            backBtn.style.opacity = '0';
        } else {
            backBtn.style.visibility = 'visible';
            backBtn.style.opacity = '1';
        }
    }
    
    if (currentScreen === 'dashboard') {
        rebuildZonesGrid();
        updateDashboardStats();
    }
    if (currentScreen === 'queues') {
        updateQueuesUI();
    }
    if (currentScreen === 'alerts') {
        updateAlertsUI();
    }
}

// Navigation helper
function getNavigationSuggestion(location, zonesData) {
    const zone = zonesData.find(z => z.name === location);
    if (!zone) return null;
    
    const density = zone.currentDensity || 45;
    const waitTime = zone.currentWaitTime || 5;
    
    if (density > 70) {
        const alternatives = zonesData.filter(z => (z.currentDensity || 45) < 50 && z.name !== location).slice(0, 2);
        return `🚶 ${location} is heavily congested (${density}%, ${waitTime} min wait). AI suggests: ${alternatives.map(a => `${a.name} (${a.currentDensity || 45}%)`).join(' or ')}`;
    } else if (density > 45) {
        return `⚠️ ${location} is moderately busy (${density}%, ${waitTime} min wait). Expect ${zone.targetPredicted || predictDensity(density, zone.type)}% in 10 minutes.`;
    } else {
        return `✅ ${location} is clear (${density}%, ${waitTime} min wait). Enjoy the event!`;
    }
}

function updateNavigation() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navSuggestion');
    if (select && suggestionDiv && select.value) {
        const zonesData = ZONES.map(zone => ({
            name: zone.name,
            currentDensity: zone.currentDensity,
            currentWaitTime: zone.currentWaitTime,
            type: zone.type
        }));
        const suggestion = getNavigationSuggestion(select.value, zonesData);
        suggestionDiv.innerHTML = suggestion || '🤖 Select a location for AI-powered guidance';
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize zones with starting values
ZONES.forEach(zone => {
    zone.currentDensity = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
    zone.currentWaitTime = calculateWaitTime(zone.currentDensity, zone.type);
    zone.targetPredicted = predictDensity(zone.currentDensity, zone.type);
});

// Event listeners
const locationSelect = document.getElementById('userLocation');
if (locationSelect) {
    locationSelect.addEventListener('change', updateNavigation);
}

// Start staggered updates (simulates real sensors)
setInterval(() => {
    const activeScreen = SCREENS[currentScreenIndex];
    if (activeScreen === 'dashboard' || activeScreen === 'queues' || activeScreen === 'alerts') {
        updateZonesStaggered();
        setTimeout(() => {
            updateDashboardStats();
        }, ZONES.length * 150 + 100);
    }
}, 8000); // Update every 8 seconds

// Update timestamp every second
setInterval(() => {
    updateTimestamp();
}, 1000);

// Initialize
showCurrentScreen();
rebuildZonesGrid();
updateDashboardStats();
updateTimestamp();
