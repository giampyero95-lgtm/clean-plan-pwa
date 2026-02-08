const FREQUENZE = {
  "Ogni 3 giorni": 3,
  "Settimanale": 7,
  "2 settimane": 14,
  "Mensile": 30,
  "Bimestrale": 60,
  "Trimestrale": 90,
  "Semestrale": 180,
  "Annuale": 365
};

let tasks = JSON.parse(localStorage.getItem("cleanTasks")) || [];

function oggi() {
  return new Date().toISOString().split("T")[0];
}

function aggiungiGiorni(data, giorni) {
  const d = new Date(data);
  d.setDate(d.getDate() + giorni);
  return d.toISOString().split("T")[0];
}

function calcolaDatiEnergia(task) {
    const totGiorni = FREQUENZE[task.frequenza];
    const dataUltima = new Date(task.ultimaVolta);
    const oggiData = new Date();
    
    // Differenza in millisecondi convertita in giorni
    const giorniTrascorsi = Math.floor((oggiData - dataUltima) / (1000 * 60 * 60 * 24));
    
    // Percentuale di "carica" (0% = appena fatto, 100% = da fare subito)
    let percentuale = Math.min(Math.max((giorniTrascorsi / totGiorni) * 100, 0), 100);
    
    // Determiniamo il colore
    let colore = "#4CAF50"; // Verde
    if (percentuale > 60) colore = "#FFC107"; // Giallo
    if (percentuale > 90) colore = "#F44336"; // Rosso
    
    return { percentuale, colore };
}

function salva() {
  localStorage.setItem("cleanTasks", JSON.stringify(tasks));
}

function segnaFatto(index) {
  const t = tasks[index];
  t.ultimaVolta = oggi();
  t.prossimaVolta = aggiungiGiorni(oggi(), FREQUENZE[t.frequenza]);
  salva();
  render();
}

function renderPlanner() {
    const container = document.getElementById("planner-container");
    if (!container) return;
    container.innerHTML = "";

    // Raggruppiamo per stanza
    const stanze = [...new Set(tasks.map(t => t.stanza))];

    stanze.forEach(stanza => {
        const tasksStanza = tasks
            .filter(t => t.stanza === stanza)
            .map((t, index) => ({ ...t, originalIndex: index, stats: calcolaDatiEnergia(t) }))
            .sort((a, b) => b.stats.percentuale - a.stats.percentuale); // Più urgenti in alto

        let stanzaHTML = `
            <div class="stanza-section">
                <h3>${stanza}</h3>
                <div class="cards-grid">
                    ${tasksStanza.map(t => `
                        <div class="card ${t.stats.percentuale >= 100 ? 'scaduta' : ''}">
                            <div class="card-info">
                                <strong>${t.nome}</strong>
                                <span>Ultima volta: ${t.ultimaVolta}</span>
                            </div>
                            <div class="energy-bar-container">
                                <div class="energy-bar" style="width: ${t.stats.percentuale}%; background: ${t.stats.colore}"></div>
                            </div>
                            <button onclick="segnaFatto(${t.originalIndex})">Done</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.innerHTML += stanzaHTML;
    });
}

function aggiungiTask() {
  const nome = prompt("Nome task");
  if (!nome) return;

  const frequenza = prompt(Object.keys(FREQUENZE).join("\n"));
  if (!FREQUENZE[frequenza]) return;

  const stanza = prompt("Stanza");

  tasks.push({
    nome,
    stanza,
    frequenza,
    ultimaVolta: oggi(),
    prossimaVolta: aggiungiGiorni(oggi(), FREQUENZE[frequenza])
  });

  salva();
  render();
}

document.addEventListener("DOMContentLoaded", render);
