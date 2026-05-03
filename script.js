// 1. Filter Logic (International aur Leagues ke liye behtar logic)
function filterByCategory(category, event) {
    let buttons = document.getElementsByClassName('filter-btn');
    for (let btn of buttons) { btn.classList.remove('active'); }
    event.target.classList.add('active');

    const cards = document.getElementsByClassName('match-card');
    const searchInput = document.getElementById('matchSearch').value.toLowerCase();
    let found = false;

    // Smart Keywords
    const keywords = {
        'psl': ['psl', 'pakistan super league'],
        'ipl': ['ipl', 'indian premier league'],
        'bbl': ['bbl', 'big bash'],
        'cpl': ['cpl', 'caribbean premier'],
        'bpl': ['bpl', 'bangladesh premier'],
        't10': ['t10'],
        // International ke liye mazeed keywords
        'international': ['international', 'icc', 'world cup', 'tour of', 'v ', 'vs ', 'trophy', 'series']
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
        // Mazeed Behtar International Filter
        else if (targetCategory === 'international') {
            // 1. Agar API ne category 'international' bheji ho
            // 2. Ya series ke naam mein koi international keyword ho
            const hasIntWord = keywords.international.some(k => seriesName.includes(k));
            matchesCategory = (cardCat === 'international' || hasIntWord);
        }
        else if (keywords[targetCategory]) {
            matchesCategory = keywords[targetCategory].some(k => seriesName.includes(k));
        } 
        else if (targetCategory === 'other') {
            matchesCategory = (cardCat === 'other' || cardCat === 'domestic');
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

// 2. UI Rendering (Tagging ko behtar kiya)
function renderUI(data) {
    const container = document.getElementById('fixtures-list');
    let html = "";

    if (data.matchScheduleMap) {
        data.matchScheduleMap.forEach(item => {
            if (item.scheduleAdWrapper && item.scheduleAdWrapper.matchScheduleList) {
                const dateStr = item.scheduleAdWrapper.date;
                // Python script se aane wali category
                const catType = item.category_type || "other"; 

                item.scheduleAdWrapper.matchScheduleList.forEach(series => {
                    // Agar series category 'International' hai to card ko mark karein
                    const isIntSeries = series.seriesCategory === "International" ? "international" : catType;

                    series.matchInfo.forEach(match => {
                        const t1Raw = match.team1.teamName;
                        const t2Raw = match.team2.teamName;
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
    container.innerHTML = html;
    document.querySelectorAll('.flag-img').forEach(img => {
        setFlagWithFallback(img, img.getAttribute('data-team'));
    });
}
