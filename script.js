// 1. Filter Logic (Buttons ke liye)
function filterByCategory(category, event) {
    // Buttons ki active class handle karna
    let buttons = document.getElementsByClassName('filter-btn');
    for (let btn of buttons) { btn.classList.remove('active'); }
    event.target.classList.add('active');

    const cards = document.getElementsByClassName('match-card');
    const searchInput = document.getElementById('matchSearch').value.toLowerCase();
    let found = false;

    // League aur International keywords mapping
    const keywords = {
        'psl': ['psl', 'pakistan super league'],
        'ipl': ['ipl', 'indian premier league'],
        'bbl': ['bbl', 'big bash'],
        'cpl': ['cpl', 'caribbean premier'],
        'bpl': ['bpl', 'bangladesh premier'],
        't10': ['t10'],
        'international': ['international', 'icc', 'world cup', 'tour of', 'trophy']
    };

    for (let card of cards) {
        const cardCat = card.getAttribute('data-category').toLowerCase(); 
        const seriesName = card.querySelector('.tag').innerText.toLowerCase();
        const matchText = card.innerText.toLowerCase();

        let matchesCategory = false;
        const targetCategory = category.toLowerCase();

        if (targetCategory === 'all') {
            matchesCategory = true;
        } 
        // International Filter (Smart Check)
        else if (targetCategory === 'international') {
            matchesCategory = (cardCat === 'international' || keywords.international.some(k => seriesName.includes(k)));
        }
        // Specific Leagues Filter
        else if (keywords[targetCategory]) {
            matchesCategory = keywords[targetCategory].some(k => seriesName.includes(k));
        } 
        else if (targetCategory === 'other') {
            matchesCategory = (cardCat === 'other' || cardCat === 'domestic');
        } 
        else {
            matchesCategory = (cardCat === targetCategory);
        }

        // Search filter ke sath combine karna
        const matchesSearch = matchText.includes(searchInput);

        if (matchesCategory && matchesSearch) {
            card.style.display = "flex";
            found = true;
        } else {
            card.style.display = "none";
        }
    }

    // No Match Message handle karna
    const fixturesList = document.getElementById('fixtures-list');
    let noMatchMsg = document.getElementById('no-match-msg');
    
    if (!found) {
        if (!noMatchMsg) {
            noMatchMsg = document.createElement('div');
            noMatchMsg.id = 'no-match-msg';
            noMatchMsg.style.cssText = "text-align:center; color:#00d2ff; padding:40px; width:100%; font-size:1.2rem; font-weight:500;";
            fixturesList.appendChild(noMatchMsg);
        }
        // Aapka bataya hua message
        noMatchMsg.innerHTML = `<div style="opacity:0.7;">No matches scheduled next</div>`;
    } else if (noMatchMsg) {
        noMatchMsg.remove();
    }
}

// 2. Search Logic (Input box ke liye)
function filterMatches() {
    const activeBtn = document.querySelector('.filter-btn.active');
    const activeCategory = activeBtn ? activeBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'all';
    filterByCategory(activeCategory, { target: activeBtn });
}

// 3. Flags Logic (Original Fallback Support)
function setFlagWithFallback(imgElement, nameRaw) {
    let clean = nameRaw.toLowerCase()
        .replace(/\bwomen's\b/gi, "").replace(/\bwomen\b/gi, "").replace(/\bu19\b/gi, "")
        .replace(/\s+w\b/gi, "").replace(/\b-w\b/gi, "").replace(/\(w\)/gi, "")
        .replace(/[^a-z0-9\s]/gi, '').trim().replace(/\s+/g, '-');

    let fileName = clean.charAt(0).toUpperCase() + clean.slice(1) + ".png";
    imgElement.src = `assets/flags/${fileName}`;

    imgElement.onerror = function() {
        this.onerror = null; 
        this.src = `https://ui-avatars.com/api/?name=${nameRaw.split(' ').map(n=>n[0]).join('')}&background=fff&color=03232f&bold=true&font-size=0.5`;
    };
}

// 4. Main Fetch Function
async function getFastSchedule() {
    const container = document.getElementById('fixtures-list');
    try {
        const response = await fetch('matches.json');
        if (!response.ok) throw new Error('File not found');
        const data = await response.json();
        renderUI(data);
    } catch (e) {
        container.innerHTML = "<p style='text-align:center; color:#00d2ff; padding:20px;'>Schedules are being updated...</p>";
    }
}

// 5. UI Rendering Function
function renderUI(data) {
    const container = document.getElementById('fixtures-list');
    let html = "";

    if (data.matchScheduleMap) {
        data.matchScheduleMap.forEach(item => {
            if (item.scheduleAdWrapper && item.scheduleAdWrapper.matchScheduleList) {
                const dateStr = item.scheduleAdWrapper.date;
                const catType = item.category_type || "other"; 

                item.scheduleAdWrapper.matchScheduleList.forEach(series => {
                    series.matchInfo.forEach(match => {
                        const t1Raw = match.team1.teamName;
                        const t2Raw = match.team2.teamName;
                        
                        let dateObj = new Date(parseInt(match.startDate));
                        let pktTime = dateObj.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });

                        html += `
                            <div class="match-card" data-category="${catType}">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                                    <span class="tag">${series.seriesName.toUpperCase()}</span>
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
                                <div class="match-meta">🏟️ ${match.venueInfo.city}, ${match.venueInfo.country}</div>
                                <div class="match-date" style="margin-top: 12px;">🗓️ ${dateStr}</div>
                            </div>`;
                    });
                });
            }
        });
    }
    container.innerHTML = html || "<p style='text-align:center; color:white;'>No matches found.</p>";
    document.querySelectorAll('.flag-img').forEach(img => {
        setFlagWithFallback(img, img.getAttribute('data-team'));
    });
}

document.addEventListener('DOMContentLoaded', getFastSchedule);
