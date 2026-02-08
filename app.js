const FREQUENZE = {
    "Ogni 3 giorni": 3, "Settimanale": 7, "2 settimane": 14,
    "Mensile": 30, "Bimestrale": 60, "Trimestrale": 90, "Annuale": 365
};

let tasks = JSON.parse(localStorage.getItem("cleanTasks")) || [];

// --- LOGICA OROLOGIO ---
function updateClock() {
    const oraEl = document.getElementById("clock");
    const dataEl = document.getElementById("date");
    if (!oraEl || !dataEl) return;

    const adesso = new Date();
    oraEl.innerText = adesso.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    dataEl.innerText = adesso.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}
setInterval(updateClock, 1000);

// --- LOGICA ENERGIA ---
function getEnergyStats(task) {
    const giorniTot = FREQUENZE[task.frequenza];
    const ultima = new Date(task.ultimaVolta);
    const oggi = new Date();
    const trascorsi = Math.floor((oggi - ultima) / (1000 * 60 * 60 * 24));
    
    let percentuale = Math.min(Math.max((trascorsi / giorniTot) * 100, 0), 100);
    let colore = "#48bb78"; // Verde
    if (percentuale > 60) colore = "#ecc94b"; // Giallo
    if (percentuale > 90) colore = "#f56565"; // Rosso
    
    return { percentuale, colore };
}

// --- NAVIGAZIONE ---
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${viewId}`).style.display = 'block';
    render();
}

// --- GESTIONE TASK ---
function apriModale() {
    const fSelect = document.getElementById("task-frequenza");
    fSelect.innerHTML = Object.keys(FREQUENZE).map(f => `<option value="${f}">${f}</option>`).join('');
    document.getElementById("modal-task").style.display = 'flex';
}

function chiudiModale() { document.getElementById("modal-task").style.display = 'none'; }

function salvaNuovaTask() {
    const nome = document.getElementById("task-nome").value;
    const stanza = document.getElementById("task-stanza").value;
    const frequenza = document.getElementById("task-frequenza").value;

    if (!nome) return alert("Inserisci un nome!");

    tasks.push({
        nome, stanza, frequenza,
        ultimaVolta: new Date().toISOString().split("T")[0]
    });
    
    localStorage.setItem("cleanTasks", JSON.stringify(tasks));
    chiudiModale();
    render();
}

function segnaFatto(index) {
    tasks[index].ultimaVolta = new Date().toISOString().split("T")[0];
    localStorage.setItem("cleanTasks", JSON.stringify(tasks));
    render();
}

// --- RENDERING ---
function render() {
    // Render Tabella
    const tbody = document.getElementById("task-table-body");
    if (tbody) {
        tbody.innerHTML = tasks.map((t, i) => {
            const energy = getEnergyStats(t);
            return `<tr>
                <td>${t.nome}</td><td>${t.stanza}</td>
                <td><div class="energy-container"><div class="energy-bar" style="width:${energy.percentuale}%; background:${energy.colore}"></div></div></td>
                <td>${t.ultimaVolta}</td>
                <td><button onclick="segnaFatto(${i})">Fatto</button></td>
            </tr>`;
        }).join('');
    }

    // Render Planner Cards
    const planner = document.getElementById("planner-container");
    if (planner) {
        const stanze = [...new Set(tasks.map(t => t.stanza))];
        planner.innerHTML = stanze.map(s => `
            <div class="stanza-section">
                <h3>${s}</h3>
                ${tasks.filter(t => t.stanza === s).map(t => {
                    const energy = getEnergyStats(t);
                    const idx = tasks.indexOf(t);
                    return `
                    <div class="card">
                        <strong>${t.nome}</strong>
                        <div class="energy-container"><div class="energy-bar" style="width:${energy.percentuale}%; background:${energy.colore}"></div></div>
                        <button onclick="segnaFatto(${idx})">Completato</button>
                    </div>`;
                }).join('')}
            </div>
        `).join('');
    }
}

// --- NOTE ---
const noteInput = document.getElementById("quick-notes");
if(noteInput) {
    noteInput.value = localStorage.getItem("cleanNotes") || "";
    noteInput.addEventListener("input", (e) => localStorage.setItem("cleanNotes", e.target.value));
}

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    render();
});
