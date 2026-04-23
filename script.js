const API_KEY = 'fb0a7a4fb6mshd68fea1a0a18837p18594djsn67de78daf871';
const API_HOST = 'livescore6.p.rapidapi.com';

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

async function getFastSchedule() {
    const container = document.getElementById('fixtures-list');
    const dates = [];
    for(let i=0; i<5; i++) {
        let d = new Date(); d.setDate(d.getDate() + i);
        dates.push(d.getFullYear().toString() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0'));
    }

    const countries = ["pakistan", "india", "australia", "england", "south africa", "new zealand", "west indies", "sri lanka", "bangladesh", "afghanistan", "ireland", "zimbabwe", "nepal", "uae", "netherlands", "scotland", "namibia", "oman", "usa", "canada"];

    try {
        const requests = dates.map(date => fetch(`https://livescore6.p.rapidapi.com/matches/v2/list-by-date?Category=cricket&Date=${date}&Timezone=5`, {
            method: 'GET', headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST }
        }).then(res => res.json()));

        const results = await Promise.all(requests);
        let html = "";

        results.forEach(data => {
            if (data.Stages) {
                data.Stages.forEach(stage => {
                    stage.Events.forEach(match => {
                        let mTime = match.Esd.toString();
                        let dateObj = new Date(mTime.substring(0,4), mTime.substring(4,6)-1, mTime.substring(6,8), mTime.substring(8,10), mTime.substring(10,12));
                        let pktTime = `${mTime.substring(8,10)}:${mTime.substring(10,12)}`;
                        let gmtDate = new Date(dateObj.getTime() - (5 * 60 * 60 * 1000));
                        let gmtTime = gmtDate.getHours().toString().padStart(2, '0') + ":" + gmtDate.getMinutes().toString().padStart(2, '0');
                        let displayDate = `${mTime.substring(6,8)} ${dateObj.toLocaleString('en-us', {month:'short'})}`;
                        
                        let snm = stage.Snm.toLowerCase();
                        let t1Raw = match.T1[0].Nm;
                        let t2Raw = match.T2[0].Nm;
                        
                        // --- FINAL FLAG CLEANER ---
                        function getFlagPath(name) {
                            let clean = name.toLowerCase()
                                .replace(/\bwomen's\b/gi, "")
                                .replace(/\bwomen\b/gi, "")
                                .replace(/\bu19\b/gi, "")
                                .replace(/\s+w\b/gi, "") 
                                .replace(/\b-w\b/gi, "")
                                .replace(/\(w\)/gi, "")
                                .replace(/[^a-z0-9\s]/gi, '')
                                .trim()
                                .replace(/\s+/g, '-');
                            return `assets/flags/${clean}.png`;
                        }

                        let t1File = getFlagPath(t1Raw);
                        let t2File = getFlagPath(t2Raw);
                        
                        let type = "default", label = stage.Snm, category = "other";
                        let isShowable = false;

                        let isInternational = (countries.some(c => t1Raw.toLowerCase().includes(c)) && countries.some(c => t2Raw.toLowerCase().includes(c)));

                        // Filtering Logic
                        if (snm.includes("women") || t1Raw.toLowerCase().includes("women") || t1Raw.toLowerCase().endsWith(" w") || t2Raw.toLowerCase().endsWith(" w")) { 
                            if (isInternational || snm.includes("ipl") || snm.includes("psl") || snm.includes("big bash") || snm.includes("world cup")) {
                                type = "women"; label = "WOMEN CRICKET"; category = "women"; isShowable = true;
                            }
                        }
                        else if (snm.includes("psl") || snm.includes("super league")) { type = "psl"; label = "HBL PSL 11"; category = "psl"; isShowable = true; }
                        else if (snm.includes("ipl") || snm.includes("premier league")) { type = "ipl"; label = "IPL 2026"; category = "ipl"; isShowable = true; }
                        else if (snm.includes("icc") || snm.includes("world cup") || snm.includes("asia cup") || snm.includes("t20i") || isInternational) { 
                            type = "icc"; label = "INTERNATIONAL"; category = "icc"; isShowable = true;
                        }
                        else if (snm.includes("t10") || snm.includes("cpl") || snm.includes("bpl") || snm.includes("big bash") || snm.includes("bbl")) {
                            type = "default"; label = stage.Snm; category = "other"; isShowable = true;
                        }

                        if (isShowable) {
                            html += `
                                <div class="match-card card-${type}" data-category="${category}">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                                        <span class="tag">${label}</span>
                                        <div class="pkt-time">🕒 ${pktTime} PKT</div>
                                    </div>
                                    <div style="display: flex; align-items: center; justify-content: space-around; margin-bottom: 25px;">
                                        
                                        <div style="text-align: center; width: 44%;">
                                            <img src="${t1File}" 
                                                 onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${t1Raw.split(' ').map(n=>n[0]).join('')}&background=fff&color=03232f&bold=true&font-size=0.5';" 
                                                 class="team-logo" alt="${t1Raw}">
                                            <div class="team-name">${t1Raw}</div>
                                        </div>

                                        <div class="vs-badge">VS</div>

                                        <div style="text-align: center; width: 44%;">
                                            <img src="${t2File}" 
                                                 onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${t2Raw.split(' ').map(n=>n[0]).join('')}&background=fff&color=03232f&bold=true&font-size=0.5';" 
                                                 class="team-logo" alt="${t2Raw}">
                                            <div class="team-name">${t2Raw}</div>
                                        </div>

                                    </div>
                                    <div class="match-meta">
                                        <div class="global-time">🌍 ${gmtTime} GMT</div>
                                    </div>
                                    <div class="match-date" style="margin-top: 12px;">
                                        🗓️ ${displayDate}
                                    </div>
                                </div>`;
                        }
                    });
                });
            }
        });
        container.innerHTML = html || "<p style='text-align:center; color:white;'>No major matches found.</p>";
    } catch (e) { 
        container.innerHTML = "<p style='text-align:center; color:#00d2ff; padding:20px;'>Updating live scores...</p>"; 
    }
}

document.addEventListener('DOMContentLoaded', getFastSchedule);
