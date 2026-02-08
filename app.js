const FREQUENZE = {
    "Ogni 3 giorni": 3, "Settimanale": 7, "2 settimane": 14,
    "Mensile": 30, "Bimestrale": 60, "Trimestrale": 90,
    "Semestrale": 180, "Annuale": 365
};

let tasks = JSON.parse(localStorage.getItem("cleanTasks")) || [];

// Funzioni Utility
const oggi = () => new Date().toISOString().split("T")[0];
const aggiungiGiorni = (data, gg) => {
    const d = new Date(data);
    d.setDate(d.getDate() + gg);
    return d.toISOString().split("T")[0];
};

function calcolaInfoEnergia(task) {
    const totGiorno = FREQUENZE[task.frequenza];
    const ultima = new Date(task.ultimaVolta);
    const oggiData = new Date();
    const trascorsi = Math.floor((oggiData - ultima) / 86400000);
    
    let percentuale = Math.min(Math.max((trascorsi / totGiorno) * 100, 0), 100);
    let colore = "#2ecc71"; // Verde
    if (percentuale > 60) colore = "#f1c40f"; // Giallo
    if (percentuale > 90) colore = "#e74c3c"; // Rosso
    
    return { percentuale, colore };
}

// Navigazione
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${viewId}`).style.display = 'block';
    render();
}

// Modale
function apriModale() {
    const select = document.getElementById("task-frequenza");
    select.innerHTML = Object.keys(FREQUENZE).map(f => `<option value="${f}">${f}</option>`).join('');
    document.getElementById("modal-task").style.display = 'flex';
}
function chiudiModale() { document.getElementById("modal-task").style.display = 'none'; }

function salvaNuovaTask() {
    const nome = document.getElementById("task-nome").value;
    const stanza = document.getElementById("task-stanza").value;
    const frequenza = document.getElementById("task-frequenza").value;

    if(!nome) return alert("Inserisci un nome!");

    tasks.push({
        nome, stanza, frequenza,
        ultimaVolta: oggi(),
        prossimaVolta: aggiungiGiorni(oggi(), FREQUENZE[frequenza])
    });
    
    localStorage.setItem("cleanTasks", JSON.stringify(tasks));
    chiudiModale();
    render();
}

function segnaFatto(index) {
    tasks[index].ultimaVolta = oggi();
    tasks[index].prossimaVolta = aggiungiGiorni(oggi(), FREQUENZE[tasks[index].frequenza]);
    localStorage.setItem("cleanTasks", JSON.stringify(tasks));
    render();
}

// Rendering
function render() {
    // Render Lista Classica
    const tbody = document.getElementById("task-table-body");
    tbody.innerHTML = tasks.map((t, i) => {
        const info = calcolaInfoEnergia(t);
        return `<tr>
            <td>${t.nome}</td><td>${t.stanza}</td>
            <td><div class="energy-container"><div class="energy-bar" style="width:${info.percentuale}%; background:${info.colore}"></div></div></td>
            <td>${t.prossimaVolta}</td>
            <td><button onclick="segnaFatto(${i})">Fatto</button></td>
        </tr>`;
    }).join('');

    // Render Planner (Cards)
    const planner = document.getElementById("planner-container");
    const stanze = [...new Set(tasks.map(t => t.stanza))];
    planner.innerHTML = stanze.map(s => `
        <div class="stanza-section">
            <h3>${s}</h3>
            ${tasks.filter(t => t.stanza === s).map((t, i) => {
                const info = calcolaInfoEnergia(t);
                const realIdx = tasks.indexOf(t);
                return `
                <div class="card">
                    <strong>${t.nome}</strong>
                    <div class="energy-container"><div class="energy-bar" style="width:${info.percentuale}%; background:${info.colore}"></div></div>
                    <button onclick="segnaFatto(${realIdx})">Fatto</button>
                </div>`;
            }).join('')}
        </div>
    `).join('');
}

// Orologio e Note
setInterval(() => {
    const d = new Date();
    document.getElementById("clock").innerText = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    document.getElementById("date").innerText = d.toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long'});
}, 1000);

const notesArea = document.getElementById("quick-notes");
notesArea.value = localStorage.getItem("cleanNotes") || "";
notesArea.addEventListener("input", (e) => localStorage.setItem("cleanNotes", e.target.value));

document.addEventListener("DOMContentLoaded", () => render());
