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
const SCREENS = ["welcome", "dashboard", "queues", "alerts", "navigate"];
let currentScreenIndex = 0;

// Store animation states
let lastEventLog = "📢 System initialized • All sensors online";

// ============================================
// CAUSE-EFFECT LOG GENERATOR
// ============================================
function generateEventLog(zonesData) {
    const possibleLogs = [];
    
    // Check gates
    const gates = zonesData.filter(z => z.name.includes('Gate'));
    gates.forEach(gate => {
        if (gate.currentDensity > 75) {
            possibleLogs.push(`🚪 ${gate.name} at ${gate.currentDensity}% • Consider opening additional lane`);
        } else if (gate.currentDensity < 35) {
            possibleLogs.push(`🚪 ${gate.name} flow light • Reducing staff allocation`);
        }
    });
    
    // Check stage
    const stage = zonesData.find(z => z.name === "Stage");
    if (stage && stage.currentDensity > 70) {
        possibleLogs.push(`🎸 Stage area congested (${stage.currentDensity}%) • Next performance in 10min`);
    }
    
    // Check food court
    const foodCourt = zonesData.find(z => z.name === "Food Court");
    if (foodCourt && foodCourt.currentDensity > 65) {
        possibleLogs.push(`🍔 Food Court wait time ${foodCourt.currentWaitTime}min • Additional staff deployed`);
    }
    
    // Check parking
    const parking = zonesData.find(z => z.name === "Parking Area");
    if (parking && parking.currentDensity > 80) {
        possibleLogs.push(`🅿️ Parking at ${parking.currentDensity}% • Overflow lot opening`);
    }
    
    // AI prediction
    const peakZone = zonesData.reduce((max, z) => (z.currentDensity > max.currentDensity ? z : max), zonesData[0]);
    if (peakZone.currentDensity > 70) {
        possibleLogs.push(`🤖 AI Forecast: ${peakZone.name} will reach ${Math.min(98, peakZone.currentDensity + 8)}% in 10 minutes`);
    }
    
    // Random interesting logs
    const randomLogs = [
        `📊 Real-time sync • ${zonesData.length} zones reporting`,
        `🔄 Crowd flow optimization algorithm running`,
        `📍 ${Math.floor(Math.random() * 500) + 100} attendees currently in venue`,
        `⏱ Average venue wait time: ${Math.round(zonesData.reduce((s,z)=>s + (z.currentWaitTime || 5), 0)/zonesData.length)} min`,
        `🚶 Pedestrian flow rate: ${Math.floor(Math.random() * 50) + 30} persons/minute`,
        `📡 Sensor network latency: ${Math.floor(Math.random() * 100 + 20)}ms`,
        `🔄 Data sync complete • ${new Date().toLocaleTimeString()}`
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
    
    // Animate density
    if (zone.targetDensity !== undefined && zone.currentDensity !== zone.targetDensity) {
        const diff = zone.targetDensity - zone.currentDensity;
        const step = Math.min(Math.abs(diff), 3) * Math.sign(diff);
        zone.currentDensity = Math.round(zone.currentDensity + step);
        changed = true;
    }
    
    // Animate wait time
    if (zone.targetWaitTime !== undefined && zone.currentWaitTime !== zone.targetWaitTime) {
        const diff = zone.targetWaitTime - zone.currentWaitTime;
        const step = Math.min(Math.abs(diff), 1) * Math.sign(diff);
        zone.currentWaitTime = Math.round((zone.currentWaitTime || 5) + step);
        changed = true;
    }
    
    // Update UI if on dashboard
    if (changed && SCREENS[currentScreenIndex] === 'dashboard') {
        updateSingleZoneUI(zoneId);
    }
    
    if (changed) {
        setTimeout(() => animateZone(zoneId), 60);
    } else {
        zone.animating = false;
    }
}

// Generate random target values
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

// ============================================
// STAGGERED ZONE UPDATES (Sensor-like feel)
// ============================================
function updateZonesStaggered() {
    const newTargets = ZONES.map(zone => ({
        zoneId: zone.id,
        targetDensity: generateTargetDensity(zone),
        targetWaitTime: calculateWaitTime(generateTargetDensity(zone), zone.type)
    }));
    
    // Update each zone with delay - simulates real sensors
    newTargets.forEach((target, index) => {
        setTimeout(() => {
            smoothTransition(target.zoneId, target.targetDensity, target.targetWaitTime);
        }, index * 180);
    });
    
    // Update queues and alerts after all zones
    setTimeout(() => {
        if (SCREENS[currentScreenIndex] === 'queues') {
            updateQueuesUI();
        }
        if (SCREENS[currentScreenIndex] === 'alerts') {
            updateAlertsUI();
        }
        updateDashboardStats();
        updateEventLogUI();
    }, ZONES.length * 180 + 300);
}

// Update single zone card in UI
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
        
        const status = zone.currentDensity < 45 ? 'low' : (zone.currentDensity < 70 ? 'medium' : 'high');
        zoneCard.classList.remove('low', 'medium', 'high');
        zoneCard.classList.add(status);
        if (fillBar) fillBar.classList.remove('low', 'medium', 'high');
        if (fillBar) fillBar.classList.add(status);
    }
}

// Update queues UI
function updateQueuesUI() {
    const queuesGrid = document.getElementById('queuesGrid');
    if (!queuesGrid) return;
    
    const zonesWithWait = ZONES.map(zone => ({
        name: zone.name,
        waitTime: zone.currentWaitTime || 5
    }));
    
    const sortedByWait = [...zonesWithWait].sort((a, b) => b.waitTime - a.waitTime).slice(0, 8);
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

// Update alerts UI
function updateAlertsUI() {
    const alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) return;
    
    const zonesData = ZONES.map(zone => ({
        name: zone.name,
        density: zone.currentDensity,
        waitTime: zone.currentWaitTime
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
            message: `${zone.density}% capacity • ${zone.waitTime} min wait • Immediate action needed`
        });
    });
    
    if (highZones.length > 0 && quietZones.length > 0) {
        highZones.slice(0, 2).forEach(zone => {
            const alt = quietZones[0];
            alerts.push({
                type: 'suggestion',
                icon: '💡',
                title: `AI Suggestion: ${zone.name}`,
                message: `Redirect traffic to ${alt.name} (${alt.density}% • ${alt.waitTime} min wait)`
            });
        });
    }
    
    // Gate balancing
    const gates = zonesData.filter(z => z.name.includes('Gate'));
    if (gates.length >= 2) {
        const busiestGate = gates.reduce((max, g) => g.density > max.density ? g : max, gates[0]);
        const quietestGate = gates.reduce((min, g) => g.density < min.density ? g : min, gates[0]);
        if (busiestGate.density - quietestGate.density > 30) {
            alerts.push({
                type: 'suggestion',
                icon: '🚪',
                title: 'Gate Balancing Recommended',
                message: `${busiestGate.name} (${busiestGate.density}%) vs ${quietestGate.name} (${quietestGate.density}%) • Redirect entry flow`
            });
        }
    }
    
    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            icon: '✅',
            title: 'All Zones Operating Normally',
            message: 'Crowd flow is well balanced • Continue monitoring'
        });
    }
    
    const peakZone = zonesData.reduce((max, z) => z.density > max.density ? z : max, zonesData[0]);
    alerts.push({
        type: 'info',
        icon: '📊',
        title: 'AI Prediction',
        message: `Peak congestion expected at ${peakZone.name} in ~10 minutes • Prepare crowd diversion`
    });
    
    return alerts.slice(0, 5);
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

// Update event log UI
function updateEventLogUI() {
    const eventLogEl = document.getElementById('eventLog');
    if (eventLogEl && SCREENS[currentScreenIndex] === 'dashboard') {
        const zonesData = ZONES.map(zone => ({
            name: zone.name,
            currentDensity: zone.currentDensity,
            currentWaitTime: zone.currentWaitTime
        }));
        const newLog = generateEventLog(zonesData);
        eventLogEl.innerHTML = newLog;
        eventLogEl.style.animation = 'none';
        setTimeout(() => {
            eventLogEl.style.animation = 'slideIn 0.5s ease';
        }, 10);
    }
}

// Update timestamp
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

// Force refresh
function forceRefresh() {
    rebuildZonesGrid();
    updateDashboardStats();
    updateQueuesUI();
    updateAlertsUI();
    updateTimestamp();
}

// Rebuild zones grid
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
                <small>AI monitoring active</small>
            </div>
            <div class="zone-stats">
                <div class="density-value">${zone.currentDensity || 45}%</div>
                <div class="wait-badge">⏱ ${zone.currentWaitTime || 5} min</div>
            </div>
        `;
        zonesGrid.appendChild(zoneCard);
    });
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
        updateEventLogUI();
    }
    if (currentScreen === 'queues') {
        updateQueuesUI();
    }
    if (currentScreen === 'alerts') {
        updateAlertsUI();
    }
}

// Navigation helper
function getNavigationSuggestion(location) {
    const zone = ZONES.find(z => z.name === location);
    if (!zone) return null;
    
    const density = zone.currentDensity || 45;
    const waitTime = zone.currentWaitTime || 5;
    
    if (density > 70) {
        const alternatives = ZONES.filter(z => (z.currentDensity || 45) < 50 && z.name !== location).slice(0, 2);
        if (alternatives.length > 0) {
            return `🚶 ${location} is heavily congested (${density}%, ${waitTime} min wait). AI suggests: ${alternatives.map(a => `${a.name} (${a.currentDensity || 45}%)`).join(' or ')}`;
        }
        return `🚶 ${location} is heavily congested (${density}%, ${waitTime} min wait). Consider waiting 15-20 minutes.`;
    } else if (density > 45) {
        return `⚠️ ${location} is moderately busy (${density}%, ${waitTime} min wait). Expected to reach ${Math.min(98, density + 10)}% in 10 minutes.`;
    } else {
        return `✅ ${location} is clear (${density}%, ${waitTime} min wait). Enjoy the event!`;
    }
}

function updateNavigation() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navSuggestion');
    if (select && suggestionDiv && select.value) {
        const suggestion = getNavigationSuggestion(select.value);
        suggestionDiv.innerHTML = suggestion || '🤖 Select a location for AI-powered navigation';
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize zones with random starting values
ZONES.forEach(zone => {
    zone.currentDensity = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
    zone.currentWaitTime = calculateWaitTime(zone.currentDensity, zone.type);
});

// Event listeners
const locationSelect = document.getElementById('userLocation');
if (locationSelect) {
    locationSelect.addEventListener('change', updateNavigation);
}

// Start staggered updates every 8 seconds
setInterval(() => {
    const activeScreen = SCREENS[currentScreenIndex];
    if (activeScreen === 'dashboard' || activeScreen === 'queues' || activeScreen === 'alerts') {
        updateZonesStaggered();
    }
}, 8000);

// Update timestamp every second
setInterval(() => {
    updateTimestamp();
}, 1000);

// Initialize
showCurrentScreen();
rebuildZonesGrid();
updateDashboardStats();
updateTimestamp();
