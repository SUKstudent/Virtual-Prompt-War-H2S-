// ============================================
// ZONES CONFIGURATION (12 zones)
// ============================================
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

// Screen order for navigation
const SCREENS = ["welcome", "dashboard", "queues", "alerts", "navigate"];
let currentScreenIndex = 0; // Start at welcome screen

// Generate random density
function generateDensity() {
    return Math.floor(Math.random() * (95 - 20 + 1)) + 20;
}

// Calculate wait time based on density
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

// Predict density
function predictDensity(currentDensity, zoneType) {
    let trend = 0;
    if (zoneType === "attraction") trend = currentDensity > 70 ? -5 : 8;
    else if (zoneType === "entry") trend = currentDensity > 80 ? -8 : 3;
    else if (zoneType === "service") trend = currentDensity > 75 ? -3 : 5;
    else trend = currentDensity > 85 ? -10 : 2;
    
    let predicted = currentDensity + trend + (Math.random() * 6 - 3);
    return Math.min(98, Math.max(15, Math.round(predicted)));
}

// Generate all zone data
function generateZoneData() {
    return ZONES.map(zone => {
        const density = generateDensity();
        return {
            ...zone,
            density: density,
            waitTime: calculateWaitTime(density, zone.type),
            predictedDensity: predictDensity(density, zone.type),
            status: density < 45 ? 'low' : (density < 70 ? 'medium' : 'high')
        };
    });
}

// Generate alerts
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

// Navigation helper
function getNavigationSuggestion(location, zonesData) {
    const zone = zonesData.find(z => z.name === location);
    if (!zone) return null;
    
    if (zone.status === 'high') {
        const alternatives = zonesData.filter(z => z.status !== 'high' && z.name !== location).slice(0, 2);
        return `🚶 ${location} is heavily congested (${zone.density}%, ${zone.waitTime} min wait). AI suggests: ${alternatives.map(a => `${a.name} (${a.density}%)`).join(' or ')}`;
    } else if (zone.status === 'medium') {
        return `⚠️ ${location} is moderately busy (${zone.density}%, ${zone.waitTime} min wait). Expect ${zone.predictedDensity}% in 10 minutes.`;
    } else {
        return `✅ ${location} is clear (${zone.density}%, ${zone.waitTime} min wait). Enjoy the event!`;
    }
}

// Update UI
let currentZonesData = [];

function updateDashboard() {
    currentZonesData = generateZoneData();
    
    // Update stats
    const avgDensity = Math.round(currentZonesData.reduce((s, z) => s + z.density, 0) / currentZonesData.length);
    const crowdedCount = currentZonesData.filter(z => z.density > 70).length;
    
    const avgDensityEl = document.getElementById('avgDensity');
    const crowdedCountEl = document.getElementById('crowdedCount');
    const eventStatusEl = document.getElementById('eventStatus');
    const lastUpdateEl = document.getElementById('lastUpdate');
    
    if (avgDensityEl) avgDensityEl.innerHTML = avgDensity + '<span class="unit">%</span>';
    if (crowdedCountEl) crowdedCountEl.innerHTML = crowdedCount;
    if (eventStatusEl) eventStatusEl.innerHTML = avgDensity > 60 ? '🟡 High Traffic' : '🟢 Normal';
    if (lastUpdateEl) lastUpdateEl.innerHTML = new Date().toLocaleTimeString();
    
    // Update zones grid
    const zonesGrid = document.getElementById('zonesGrid');
    if (zonesGrid) {
        zonesGrid.innerHTML = '';
        currentZonesData.forEach(zone => {
            const zoneCard = document.createElement('div');
            zoneCard.className = `zone-card ${zone.status}`;
            zoneCard.innerHTML = `
                <div class="zone-info">
                    <h4>${zone.name}</h4>
                    <div class="density-bar">
                        <div class="density-fill ${zone.status}" style="width: ${zone.density}%"></div>
                    </div>
                    <small>AI: ${zone.predictedDensity}% in 10min</small>
                </div>
                <div class="zone-stats">
                    <div class="density-value">${zone.density}%</div>
                    <div class="wait-badge">⏱ ${zone.waitTime} min</div>
                </div>
            `;
            zonesGrid.appendChild(zoneCard);
        });
    }
    
    // Update queues
    const queuesGrid = document.getElementById('queuesGrid');
    if (queuesGrid) {
        const sortedByWait = [...currentZonesData].sort((a, b) => b.waitTime - a.waitTime).slice(0, 8);
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
    
    // Update alerts
    const alertsContainer = document.getElementById('alertsContainer');
    if (alertsContainer) {
        const alerts = generateAlerts(currentZonesData);
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
    
    updateNavigation();
}

function updateNavigation() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navSuggestion');
    if (select && suggestionDiv && select.value && currentZonesData.length) {
        const suggestion = getNavigationSuggestion(select.value, currentZonesData);
        suggestionDiv.innerHTML = suggestion || '🤖 Select a location for AI-powered guidance';
    }
}

function forceRefresh() {
    updateDashboard();
}

// Screen navigation functions
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
    // Hide all screens
    SCREENS.forEach(screen => {
        const element = document.getElementById(`screen-${screen}`);
        if (element) element.classList.remove('active');
    });
    
    // Show current screen
    const currentScreen = SCREENS[currentScreenIndex];
    const currentElement = document.getElementById(`screen-${currentScreen}`);
    if (currentElement) currentElement.classList.add('active');
    
    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemScreen = item.getAttribute('data-screen');
        if (itemScreen === currentScreen) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update page indicator
    const pageIndicator = document.getElementById('pageIndicator');
    if (pageIndicator) {
        const names = { welcome: 'Welcome', dashboard: 'Dashboard', queues: 'Queues', alerts: 'Alerts', navigate: 'Navigate' };
        pageIndicator.textContent = names[currentScreen] || currentScreen;
    }
    
    // Hide Back button on Welcome screen, show on others
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        if (currentScreen === 'welcome') {
            backBtn.style.visibility = 'hidden';
            backBtn.style.opacity = '0';
            backBtn.style.cursor = 'default';
        } else {
            backBtn.style.visibility = 'visible';
            backBtn.style.opacity = '1';
            backBtn.style.cursor = 'pointer';
        }
    }
    
    // Refresh data when showing dashboard, queues, or alerts
    if (currentScreen === 'dashboard' || currentScreen === 'queues' || currentScreen === 'alerts') {
        updateDashboard();
    }
}

// Event listeners
const locationSelect = document.getElementById('userLocation');
if (locationSelect) {
    locationSelect.addEventListener('change', updateNavigation);
}

// Auto-refresh every 3 seconds
setInterval(() => {
    const activeScreen = SCREENS[currentScreenIndex];
    if (activeScreen === 'dashboard' || activeScreen === 'queues' || activeScreen === 'alerts') {
        updateDashboard();
    }
}, 3000);

// Initialize
showCurrentScreen();
updateDashboard();
