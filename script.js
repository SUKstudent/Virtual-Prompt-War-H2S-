// ============================================
// 12 ZONES CONFIGURATION
// ============================================
const ZONES = [
    { id: 1, name: "Stage", type: "attraction", baseCapacity: 2000 },
    { id: 2, name: "Seating Area", type: "seating", baseCapacity: 5000 },
    { id: 3, name: "Gate A", type: "entry", baseCapacity: 800 },
    { id: 4, name: "Gate B", type: "entry", baseCapacity: 800 },
    { id: 5, name: "Gate C", type: "entry", baseCapacity: 800 },
    { id: 6, name: "Food Court", type: "service", baseCapacity: 600 },
    { id: 7, name: "Restrooms", type: "facility", baseCapacity: 200 },
    { id: 8, name: "Merchandise Zone", type: "service", baseCapacity: 300 },
    { id: 9, name: "Parking Area", type: "transit", baseCapacity: 1500 },
    { id: 10, name: "Drop-off Zone", type: "transit", baseCapacity: 300 },
    { id: 11, name: "Medical Zone", type: "safety", baseCapacity: 100 },
    { id: 12, name: "Security Check", type: "safety", baseCapacity: 400 }
];

// ============================================
// AI DECISION ENGINE
// ============================================

// Generate realistic density (20-95%) with zone-specific tendencies
function generateDensity(zone) {
    let base = Math.floor(Math.random() * (95 - 20 + 1)) + 20;
    
    // Zone-specific adjustments
    if (zone.type === "entry") base += 5;  // Gates are always busier
    if (zone.type === "attraction") base += 10; // Stage is very busy
    if (zone.type === "transit") base -= 5; // Parking/drop-off varies
    
    return Math.min(95, Math.max(20, base));
}

// AI: Calculate wait time based on density and zone type
function calculateWaitTime(density, zoneType) {
    let baseWait = 0;
    
    if (density < 30) baseWait = Math.floor(Math.random() * 3) + 1;
    else if (density < 50) baseWait = Math.floor(Math.random() * 5) + 3;
    else if (density < 70) baseWait = Math.floor(Math.random() * 7) + 8;
    else if (density < 85) baseWait = Math.floor(Math.random() * 10) + 15;
    else baseWait = Math.floor(Math.random() * 15) + 25;
    
    // Service zones have longer waits
    if (zoneType === "service") baseWait = Math.floor(baseWait * 1.3);
    if (zoneType === "entry") baseWait = Math.floor(baseWait * 1.2);
    
    return baseWait;
}

// AI: Predict density in 10 minutes (trend analysis)
function predictDensity(currentDensity, zoneType) {
    let trend = 0;
    
    // Different trends based on zone type
    if (zoneType === "attraction") trend = currentDensity > 70 ? -5 : 8;
    else if (zoneType === "entry") trend = currentDensity > 80 ? -8 : 3;
    else if (zoneType === "service") trend = currentDensity > 75 ? -3 : 5;
    else trend = currentDensity > 85 ? -10 : 2;
    
    let predicted = currentDensity + trend + (Math.random() * 6 - 3);
    return Math.min(98, Math.max(15, Math.round(predicted)));
}

// Generate complete zone data
function generateZoneData() {
    return ZONES.map(zone => {
        const density = generateDensity(zone);
        return {
            ...zone,
            density: density,
            waitTime: calculateWaitTime(density, zone.type),
            predictedDensity: predictDensity(density, zone.type),
            status: density < 45 ? 'low' : (density < 70 ? 'medium' : 'high')
        };
    });
}

// ============================================
// AI ALERT GENERATOR (Rules-based)
// ============================================
function generateAlerts(zonesData) {
    const alerts = [];
    
    // RULE 1: Critical overcrowding (>80%)
    const criticalZones = zonesData.filter(z => z.density > 80);
    criticalZones.forEach(zone => {
        alerts.push({
            type: 'critical',
            icon: '🚨',
            title: `CRITICAL: ${zone.name} Overcrowded`,
            message: `${zone.density}% capacity • ${zone.waitTime} min wait • Immediate action needed`
        });
    });
    
    // RULE 2: High congestion alerts (>70%)
    const highZones = zonesData.filter(z => z.density > 70 && z.density <= 80);
    highZones.forEach(zone => {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            title: `${zone.name} at ${zone.density}% capacity`,
            message: `Expected to reach ${zone.predictedDensity}% in 10 minutes`
        });
    });
    
    // RULE 3: Smart suggestions (find less crowded alternatives)
    const crowdedZones = zonesData.filter(z => z.density > 65);
    const quietZones = zonesData.filter(z => z.density < 40);
    
    if (crowdedZones.length > 0 && quietZones.length > 0) {
        crowdedZones.slice(0, 2).forEach(crowded => {
            const bestAlternative = quietZones[0];
            alerts.push({
                type: 'suggestion',
                icon: '💡',
                title: `AI Suggestion: ${crowded.name}`,
                message: `Consider redirecting traffic toward ${bestAlternative.name} (${bestAlternative.density}% • ${bestAlternative.waitTime} min wait)`
            });
        });
    }
    
    // RULE 4: Gate balancing suggestion
    const gates = zonesData.filter(z => z.name.includes('Gate'));
    const busiestGate = gates.reduce((max, g) => g.density > max.density ? g : max, gates[0]);
    const quietestGate = gates.reduce((min, g) => g.density < min.density ? g : min, gates[0]);
    
    if (busiestGate.density - quietestGate.density > 30) {
        alerts.push({
            type: 'suggestion',
            icon: '🚪',
            title: 'Gate Balancing Recommendation',
            message: `${busiestGate.name} is at ${busiestGate.density}% while ${quietestGate.name} is at ${quietestGate.density}%. Suggest directing attendees to ${quietestGate.name}.`
        });
    }
    
    // RULE 5: Peak time prediction
    const peakZone = zonesData.reduce((max, z) => z.predictedDensity > max.predictedDensity ? z : max, zonesData[0]);
    alerts.push({
        type: 'info',
        icon: '📊',
        title: 'AI Prediction',
        message: `Peak congestion expected at ${peakZone.name} (${peakZone.predictedDensity}%) in ~10 minutes`
    });
    
    // RULE 6: If everything is calm
    if (criticalZones.length === 0 && highZones.length === 0 && zonesData.every(z => z.density < 60)) {
        alerts.unshift({
            type: 'success',
            icon: '✅',
            title: 'All Zones Operating Normally',
            message: 'Crowd flow is well distributed. Continue monitoring.'
        });
    }
    
    return alerts.slice(0, 6);
}

// ============================================
// SMART NAVIGATION (Route recommendations)
// ============================================
function getNavigationSuggestion(userLocation, zonesData) {
    const zone = zonesData.find(z => z.name === userLocation);
    if (!zone) return null;
    
    if (zone.status === 'high') {
        // Find alternatives
        const alternatives = zonesData
            .filter(z => z.status !== 'high' && z.name !== userLocation)
            .sort((a, b) => a.density - b.density)
            .slice(0, 3);
        
        return {
            status: 'congested',
            message: `🚶 ${userLocation} is heavily congested (${zone.density}%, ${zone.waitTime} min wait)`,
            alternatives: alternatives.map(a => `${a.name} (${a.density}%, ${a.waitTime} min)`)
        };
    } else if (zone.status === 'medium') {
        return {
            status: 'moderate',
            message: `⚠️ ${userLocation} is moderately busy (${zone.density}%, ${zone.waitTime} min wait)`,
            alternatives: [`Expect ${zone.predictedDensity}% in 10 minutes`]
        };
    } else {
        return {
            status: 'good',
            message: `✅ ${userLocation} is clear (${zone.density}%, ${zone.waitTime} min wait)`,
            alternatives: [`Enjoy your time! Predicted to stay under ${zone.predictedDensity}%`]
        };
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================
let currentZonesData = [];

function updateDashboard() {
    currentZonesData = generateZoneData();
    
    // Update stats
    const avgDensity = Math.round(currentZonesData.reduce((s, z) => s + z.density, 0) / currentZonesData.length);
    document.getElementById('eventStatus').innerHTML = avgDensity > 60 ? '🟡 High Traffic' : '🟢 Normal';
    document.getElementById('totalAttendees').innerHTML = Math.floor(Math.random() * 5000) + 2000;
    document.getElementById('peakHour').innerHTML = ['7PM', '8PM', '9PM'][Math.floor(Math.random() * 3)];
    
    // Update zones grid
    const zonesGrid = document.getElementById('zonesGrid');
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
                <small>AI predicts: ${zone.predictedDensity}% in 10min</small>
            </div>
            <div class="zone-stats">
                <div class="density-value">${zone.density}%</div>
                <div class="wait-badge">⏱ ${zone.waitTime} min</div>
            </div>
        `;
        zonesGrid.appendChild(zoneCard);
    });
    
    // Update queues grid (show top 8 zones by wait time)
    const queuesGrid = document.getElementById('queuesGrid');
    queuesGrid.innerHTML = '';
    
    const sortedByWait = [...currentZonesData].sort((a, b) => b.waitTime - a.waitTime).slice(0, 8);
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
    
    // Update alerts
    const alerts = generateAlerts(currentZonesData);
    const alertsContainer = document.getElementById('alertsContainer');
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
    
    // Update last update time
    const now = new Date();
    document.getElementById('lastUpdate').innerHTML = now.toLocaleTimeString();
}

function updateNavigation() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navSuggestion');
    const selectedLocation = select.value;
    
    if (!selectedLocation || !currentZonesData.length) {
        suggestionDiv.innerHTML = '📍 Select your current location for AI-powered navigation';
        return;
    }
    
    const suggestion = getNavigationSuggestion(selectedLocation, currentZonesData);
    if (!suggestion) return;
    
    let html = `<strong>${suggestion.message}</strong><br><br>`;
    if (suggestion.alternatives && suggestion.alternatives.length > 0) {
        html += `🤖 <strong>AI Recommendation:</strong><br>`;
        suggestion.alternatives.forEach(alt => {
            html += `• ${alt}<br>`;
        });
    }
    suggestionDiv.innerHTML = html;
}

function forceRefresh() {
    updateDashboard();
    updateNavigation();
}

// Set up real-time updates (every 3 seconds)
updateDashboard();
setInterval(() => {
    updateDashboard();
    updateNavigation();
}, 3000);

// Navigation change listener
document.getElementById('userLocation').addEventListener('change', updateNavigation);
