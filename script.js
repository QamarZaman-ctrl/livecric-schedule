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

function getTeamLogo(name) {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "??";
    return `https://ui-avatars.com/api/?name=${initials}&background=fff&color=03232f&bold=true&font-size=0.5`;
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
                        let t1 = match.T1[0].Nm.toLowerCase();
                        let t2 = match.T2[0].Nm.toLowerCase();
                        
                        let type = "default", label = stage.Snm, category = "other"; // Default Category set to "other"

                        if (snm.includes("women") || t1.includes(" women") || t2.includes(" women")) { type = "women"; label = "WOMEN CRICKET"; category = "women"; }
                        else if (snm.includes("psl") || snm.includes("super league")) { type = "psl"; label = "HBL PSL 11"; category = "psl"; }
                        else if (snm.includes("ipl") || snm.includes("premier league")) { type = "ipl"; label = "IPL 2026"; category = "ipl"; }
                        else if (snm.includes("big bash") || snm.includes("bbl")) { type = "bbl"; label = "BIG BASH LEAGUE"; category = "bbl"; }
                        else if (snm.includes("caribbean") || snm.includes("cpl")) { type = "cpl"; label = "CPL T20"; category = "cpl"; }
                        else if (snm.includes("bangladesh premier") || snm.includes("bpl")) { type = "bpl"; label = "BPL T20"; category = "bpl"; }
                        else if (snm.includes("t10")) { type = "t10"; label = "T10 LEAGUE"; category = "t10"; }
                        else if (snm.includes("icc") || snm.includes("world cup") || snm.includes("asia cup") || snm.includes("t20i") || (countries.some(c => t1.includes(c)) && countries.some(c => t2.includes(c)))) { 
                            type = "icc"; label = "INTERNATIONAL"; category = "icc"; 
                        }

                        html += `
                            <div class="match-card card-${type}" data-category="${category}">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <span class="tag">${label}</span>
                                    <div style="font-size: 12px; font-weight: 800; color: white;">🕒 ${pktTime} PKT</div>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-around; margin-bottom: 15px;">
                                    <div style="text-align: center; width: 40%;">
                                        <img src="${getTeamLogo(match.T1[0].Nm)}" class="team-logo" alt="logo">
                                        <div style="font-weight: 800; font-size: 0.9rem; color: inherit;">${match.T1[0].Nm}</div>
                                    </div>
                                    <div class="vs-badge">VS</div>
                                    <div style="text-align: center; width: 40%;">
                                        <img src="${getTeamLogo(match.T2[0].Nm)}" class="team-logo" alt="logo">
                                        <div style="font-weight: 800; font-size: 0.9rem; color: inherit;">${match.T2[0].Nm}</div>
                                    </div>
                                </div>
                                <div class="match-meta">
                                    <div class="global-time">🌍 ${gmtTime} GMT</div>
                                </div>
                                <div style="font-size: 11px; font-weight: 700; opacity: 0.8; margin-top: 8px;">
                                    🗓️ ${displayDate}
                                </div>
                            </div>`;
                    });
                });
            }
        });
        container.innerHTML = html || "<p style='text-align:center; color:white;'>No matches found.</p>";
    } catch (e) { container.innerHTML = "<p style='text-align:center; color:red;'>Connection Error.</p>"; }
}

document.addEventListener('DOMContentLoaded', getFastSchedule);
