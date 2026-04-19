function filterMatches() {
    let input = document.getElementById('matchSearch').value.toLowerCase();
    let cards = document.getElementsByClassName('match-card');
    for (let i = 0; i < cards.length; i++) {
        cards[i].style.display = cards[i].innerText.toLowerCase().includes(input) ? "flex" : "none";
    }
}

function getTeamInitial(name) {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "??";
}

async function getFastSchedule() {
    const key = '85b328535amsh9297bc79bacf2a9p12778djsn39bfbacc949a'; 
    const host = 'livescore6.p.rapidapi.com';
    const container = document.getElementById('fixtures-list');
    const dates = [];
    for(let i=0; i<5; i++) {
        let d = new Date(); d.setDate(d.getDate() + i);
        dates.push(d.getFullYear().toString() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0'));
    }

    try {
        const requests = dates.map(date => fetch(`https://livescore6.p.rapidapi.com/matches/v2/list-by-date?Category=cricket&Date=${date}&Timezone=5`, {
            method: 'GET', headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': host }
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
                        let type = "default", label = stage.Snm;
                        if (snm.includes("psl") || snm.includes("super league")) { type = "psl"; label = "HBL PSL 11"; }
                        else if (snm.includes("ipl") || snm.includes("premier league")) { type = "ipl"; label = "IPL 2026"; }
                        else if (snm.includes("world cup") || snm.includes("icc")) { type = "worldcup"; label = "ICC EVENT"; }

                        html += `
                            <div class="match-card card-${type}">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                    <span class="tag">${label}</span>
                                    <div style="text-align: right;">
                                        <div style="font-size: 12px; font-weight: 800;">🕒 ${pktTime} PKT</div>
                                        <div style="font-size: 10px; opacity: 0.7;">🌍 ${gmtTime} GMT</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-around; margin-bottom: 20px;">
                                    <div style="text-align: center; width: 40%;">
                                        <div class="team-logo" style="margin: 0 auto 10px;">${getTeamInitial(match.T1[0].Nm)}</div>
                                        <div style="font-weight: 800; font-size: 1rem;">${match.T1[0].Nm}</div>
                                    </div>
                                    <div style="font-weight: 900; opacity: 0.3;">VS</div>
                                    <div style="text-align: center; width: 40%;">
                                        <div class="team-logo" style="margin: 0 auto 10px;">${getTeamInitial(match.T2[0].Nm)}</div>
                                        <div style="font-weight: 800; font-size: 1rem;">${match.T2[0].Nm}</div>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                                    <div style="font-size: 13px; font-weight: 700;">🗓️ ${displayDate}</div>
                                    <button class="info-btn">DETAILS</button>
                                </div>
                            </div>`;
                    });
                });
            }
        });
        container.innerHTML = html || "<p style='text-align:center;'>No matches found.</p>";
    } catch (e) { container.innerHTML = "<p style='text-align:center; color:red;'>Connection Error.</p>"; }
}
document.addEventListener('DOMContentLoaded', getFastSchedule);