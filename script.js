// 1. Filter Logic (ICC aur Leagues ke liye Smart Search)
function filterByCategory(category, event) {
    let buttons = document.getElementsByClassName('filter-btn');
    for (let btn of buttons) { btn.classList.remove('active'); }
    
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        const allBtn = document.querySelector("button[onclick*='all']");
        if (allBtn) allBtn.classList.add('active');
    }

    const cards = document.getElementsByClassName('match-card');
    const searchInput = document.getElementById('matchSearch') ? document.getElementById('matchSearch').value.toLowerCase() : "";
    let found = false;

    const keywords = {
        'psl': ['psl', 'pakistan super league'],
        'ipl': ['ipl', 'indian premier league'],
        'bbl': ['bbl', 'big bash'],
        'cpl': ['cpl', 'caribbean premier'],
        'bpl': ['bpl', 'bangladesh premier'],
        't10': ['t10'],
        'icc': ['icc', 'world cup', 'international', 'tour of', 'v ', 'vs ', 'trophy', 'odi', 't20i', 'test match', 'champions trophy']
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
        else if (targetCategory === 'icc') {
            const hasICCWord = keywords.icc.some(k => seriesName.includes(k));
            matchesCategory = (cardCat === 'international' || hasICCWord);
        } 
        else if (keywords[targetCategory]) {
            matchesCategory = keywords[targetCategory].some(k => seriesName.includes(k));
        } 
        else {
            matchesCategory = (cardCat === targetCategory);
        }

        const matchesSearch = matchText.includes(searchInput);

        if (matchesCategory && matchesSearch) {
            card.style.display = "flex";
            found = true;
        } else {
            card.style.display = "none";
        }
    }

    const fixturesList = document.getElementById('fixtures-list');
    let noMatchMsg = document.getElementById('no-match-msg');
    
    if (!found) {
        if (!noMatchMsg) {
            noMatchMsg = document.createElement('div');
            noMatchMsg.id = 'no-match-msg';
            noMatchMsg.style.cssText = "text-align:center; color:#00d2ff; padding:40px; width:100%; font-size:1.2rem;";
            fixturesList.appendChild(noMatchMsg);
        }
        noMatchMsg.innerHTML = "No matches scheduled next";
    } else if (noMatchMsg) {
        noMatchMsg.remove();
    }
}

// 2. Search Box Filter
function filterMatches() {
    const activeBtn = document.querySelector('.filter-btn.active');
    const activeCategory = activeBtn ? activeBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'all';
    filterByCategory(activeCategory, { target: activeBtn });
}

// 3. Flag Logic (Smart Cleaning for A, Lions, U19, etc.)
function setFlagWithFallback(imgElement, nameRaw) {
    let clean = nameRaw.toLowerCase();

    // In lafzon ko team name se remove kiya jayega taake main flag mil sake
    const extraWords = [
        /\s+a\b/gi,        // "Pakistan A" -> "pakistan"
        /\slions\b/gi,     // "England Lions" -> "england"
        /\s+under-19\b/gi, // "India Under-19" -> "india"
        /\su19\b/gi, 
        /\s+women's\b/gi, 
        /\swomen\b/gi, 
        /\s+v\b/gi, 
        /\s+w\b/gi, 
        /\(w\)/gi
    ];

    extraWords.forEach(word => {
        clean = clean.replace(word, "");
    });

    // Symbols saaf karke hyphen handle karna
    clean = clean.replace(/[^a-z0-9\s]/gi, '').trim().replace(/\s+/g, '-');

    // Pehla harf Capital karein (e.g., pakistan -> Pakistan.png)
    let fileName = clean.charAt(0).toUpperCase() + clean.slice(1) + ".png";
    
    imgElement.src = `assets/flags/${fileName}`;

    // Agar flag file nahi milti to auto-generated initials dikhayein
    imgElement.onerror = function() {
        this.onerror = null; 
        let initials = nameRaw.split(' ').map(n => n[0]).join('').toUpperCase();
        this.src = `https://ui-avatars.com/api/?name=${initials}&background=03232f&color=fff&bold=true`;
    };
}

// 4. Main Data Fetch
async function getFastSchedule() {
    const container = document.getElementById('fixtures-list');
    try {
        const response = await fetch('matches.json');
        if (!response.ok) throw new Error('File not found');
        const data = await response.json();
        renderUI(data);
    } catch (e) {
        container.innerHTML = "<p style='text-align:center; color:#00d2ff; padding:20px;'>No matches scheduled next</p>";
    }
}

// 5. Rendering HTML (Updated with Official Logo Logic)
function renderUI(data) {
    const container = document.getElementById('fixtures-list');
    let html = "";

    if (data.matchScheduleMap) {
        data.matchScheduleMap.forEach(item => {
            if (item.scheduleAdWrapper && item.scheduleAdWrapper.matchScheduleList) {
                const dateStr = item.scheduleAdWrapper.date;
                const catType = item.category_type || "other"; 

                item.scheduleAdWrapper.matchScheduleList.forEach(series => {
                    const isIntSeries = (series.seriesCategory === "International" || series.seriesName.toLowerCase().includes("tour of") || series.seriesName.toLowerCase().includes("icc")) ? "international" : catType;

                    series.matchInfo.forEach(match => {
                        const t1Raw = match.team1.teamName;
                        const t2Raw = match.team2.teamName;
                        
                        const t1Logo = match.team1.imageId ? `https://static.cricbuzz.com/a/img/v1/i1/c1/${match.team1.imageId}/team.jpg` : "";
                        const t2Logo = match.team2.imageId ? `https://static.cricbuzz.com/a/img/v1/i1/c1/${match.team2.imageId}/team.jpg` : "";

                        let dateObj = new Date(parseInt(match.startDate));
                        let pktTime = dateObj.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });

                        html += `
                            <div class="match-card" data-category="${isIntSeries}">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                                    <span class="tag">${series.seriesName.toUpperCase()}</span>
                                    <div class="pkt-time">🕒 ${pktTime} PKT</div>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-around; margin-bottom: 25px;">
                                    <div style="text-align: center; width: 44%;">
                                        <img src="${t1Logo}" data-team="${t1Raw}" class="team-logo flag-img" alt="${t1Raw}">
                                        <div class="team-name">${t1Raw}</div>
                                    </div>
                                    <div class="vs-badge">VS</div>
                                    <div style="text-align: center; width: 44%;">
                                        <img src="${t2Logo}" data-team="${t2Raw}" class="team-logo flag-img" alt="${t2Raw}">
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
    container.innerHTML = html;
    filterByCategory('all', null);

    document.querySelectorAll('.flag-img').forEach(img => {
        if (!img.getAttribute('src') || img.getAttribute('src').includes('undefined')) {
            setFlagWithFallback(img, img.getAttribute('data-team'));
        }
        
        img.onerror = function() {
            setFlagWithFallback(this, this.getAttribute('data-team'));
        };
    });
}

document.addEventListener('DOMContentLoaded', getFastSchedule);
