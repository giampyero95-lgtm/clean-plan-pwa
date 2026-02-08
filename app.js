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

function calcolaEnergia(task) {
  const tot = FREQUENZE[task.frequenza];
  const rimasti = Math.ceil(
    (new Date(task.prossimaVolta) - new Date()) / 86400000
  );
  return tot - rimasti;
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

function render() {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  tasks
    .map((t, i) => ({ ...t, energia: calcolaEnergia(t), i }))
    .sort((a, b) => b.energia - a.energia)
    .forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>${t.nome}</td>
          <td>${t.frequenza}</td>
          <td>${t.stanza}</td>
          <td>${t.prossimaVolta}</td>
          <td><button onclick="segnaFatto(${t.i})">Fatto</button></td>
        </tr>`;
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
