// 1. Filter & Search Logic (Same as before)
function filterByCategory(category, event) {
    let buttons = document.getElementsByClassName('filter-btn');
    for (let btn of buttons) { btn.classList.remove('active'); }
    event.target.classList.add('active');

    let cards = document.getElementsByClassName('match-card');
    for (let card of cards) {
        if (category === 'all') {
            card.style.display = "flex";
        } else {
            let cardCat = card.getAttribute('data-category');
            card.style.display = (cardCat === category) ? "flex" : "none";
        }
    }
}

function filterMatches() {
    let input = document.getElementById('matchSearch').value.toLowerCase();
    let cards = document.getElementsByClassName('match-card');
    for (let card of cards) {
        card.style.display = card.innerText.toLowerCase().includes(input) ? "flex" : "none";
    }
}

// 2. Flags Logic (Aapka original logic jo images handle karta hai)
function setFlagWithFallback(imgElement, nameRaw) {
    let clean = nameRaw.toLowerCase()
        .replace(/\bwomen's\b/gi, "").replace(/\bwomen\b/gi, "").replace(/\bu19\b/gi, "")
        .replace(/\s+w\b/gi, "").replace(/\b-w\b/gi, "").replace(/\(w\)/gi, "")
        .replace(/[^a-z0-9\s]/gi, '').trim().replace(/\s+/g, '-');

    // Folder structure ko follow karte hue
    let fileName = clean.charAt(0).toUpperCase() + clean.slice(1) + ".png";
    imgElement.src = `assets/flags/${fileName}`;

    imgElement.onerror = function() {
        this.onerror = null; 
        this.src = `https://ui-avatars.com/api/?name=${nameRaw.split(' ').map(n=>n[0]).join('')}&background=fff&color=03232f&bold=true&font-size=0.5`;
    };
}

// 3. Main Fetch Function (Updated for GitHub Actions)
async function getFastSchedule() {
    const container = document.getElementById('fixtures-list');
    
    try {
        // Ab hum API ke bajaye apni automated 'matches.json' use kar rahe hain
        // Is se site faster hogi aur ranking behtar hogi
        const response = await fetch('matches.json');
        
        if (!response.ok) {
            throw new Error('Automated file not found yet');
        }

        const data = await response.json();
        renderUI(data);

    } catch (e) { 
        console.warn("Falling back to live update message...");
        container.innerHTML = "<p style='text-align:center; color:#00d2ff; padding:20px;'>Updating latest match schedules...</p>"; 
    }
}

// 4. UI Rendering Function (Aapka exact UI logic)
function renderUI(data) {
    const container = document.getElementById('fixtures-list');
    let html = "";

    if (data.matchScheduleMap) {
        data.matchScheduleMap.forEach(schedule => {
            if (schedule.scheduleAdWrapper) {
                const dateStr = schedule.scheduleAdWrapper.date;
                schedule.scheduleAdWrapper.matchDetails.forEach(detail => {
                    if (detail.matchPlanInfo) {
                        const match = detail.matchPlanInfo.matchBrief;
                        const t1Raw = match.team1.teamName;
                        const t2Raw = match.team2.teamName;
                        
                        let dateObj = new Date(parseInt(match.startDate));
                        let pktTime = dateObj.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
                        let gmtTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'GMT' });

                        html += `
                            <div class="match-card card-icc" data-category="icc">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                                    <span class="tag">INTERNATIONAL</span>
                                    <div class="pkt-time">🕒 ${pktTime} PKT</div>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-around; margin-bottom: 25px;">
                                    <div style="text-align: center; width: 44%;">
                                        <img src="" data-team="${t1Raw}" class="team-logo flag-img" alt="${t1Raw}">
                                        <div class="team-name">${t1Raw}</div>
                                    </div>
                                    <div class="vs-badge">VS</div>
                                    <div style="text-align: center; width: 44%;">
                                        <img src="" data-team="${t2Raw}" class="team-logo flag-img" alt="${t2Raw}">
                                        <div class="team-name">${t2Raw}</div>
                                    </div>
                                </div>
                                <div class="match-meta">
                                    <div class="global-time">🌍 ${gmtTime} GMT</div>
                                </div>
                                <div class="match-date" style="margin-top: 12px;">🗓️ ${dateStr}</div>
                            </div>`;
                    }
                });
            }
        });
    }

    container.innerHTML = html || "<p style='text-align:center; color:white;'>No major matches found for now.</p>";
    
    // Flags load karein jo aapne add kiye hain
    document.querySelectorAll('.flag-img').forEach(img => {
        setFlagWithFallback(img, img.getAttribute('data-team'));
    });
}

// 5. Init
document.addEventListener('DOMContentLoaded', getFastSchedule);

// Service Worker (Optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW error', err));
    });
}
