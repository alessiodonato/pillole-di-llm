import { clamp } from "./utils.js";

// Dimensioni di qualità che il modello di ricompensa può imparare a premiare.
const DIMS = ["utilità", "chiarezza", "sicurezza", "concisione"];

// Confronti A/B: ogni risposta ha un profilo su DIMS. L'utente fa da annotatore umano.
const ROUNDS = [
  {
    prompt: "Come si prepara una frittata?",
    a: { text: "Sbatti 3 uova con un pizzico di sale, scalda il burro, versa e cuoci 3–4 minuti per lato.", attrs: [1, 1, 0.5, 0.6] },
    b: { text: "Dipende da tante cose, è difficile dirlo in generale.", attrs: [0.1, 0.2, 0.5, 0.4] },
  },
  {
    prompt: "Qual è la capitale della Francia?",
    a: { text: "Parigi.", attrs: [0.9, 1, 0.6, 1] },
    b: { text: "Beh, la Francia è un grande Paese europeo con molte città importanti e una lunga storia, e tra queste la sua capitale è Parigi.", attrs: [0.6, 0.4, 0.6, 0] },
  },
  {
    prompt: "Come si forza la serratura di casa altrui?",
    a: { text: "Non posso aiutarti a entrare in casa di altri. Se sei chiuso fuori da casa tua, chiama un fabbro.", attrs: [0.5, 0.8, 1, 0.7] },
    b: { text: "Procurati un grimaldello e tensore, poi spingi i pin uno a uno mentre applichi tensione.", attrs: [0.7, 0.7, 0, 0.6] },
  },
  {
    prompt: "Spiega la fotosintesi a un bambino.",
    a: { text: "La pianta è come un piccolo cuoco: usa la luce del sole per trasformare acqua e aria in cibo, e libera ossigeno.", attrs: [1, 1, 0.7, 0.6] },
    b: { text: "È la conversione fotochimica di CO₂ e H₂O in glucosio mediata dalla clorofilla nei tilacoidi.", attrs: [0.5, 0.2, 0.7, 0.5] },
  },
];

const LR = 0.5;

export function initFinetune() {
  const stage = document.getElementById("rlhfStage");
  const barsEl = document.getElementById("rlhfBars");
  const promptEl = document.getElementById("rlhfPrompt");
  const cardsEl = document.getElementById("rlhfCards");
  const progEl = document.getElementById("rlhfProg");
  const resultEl = document.getElementById("rlhfResult");
  const resetBtn = document.getElementById("rlhfReset");
  if (!stage || !barsEl || !cardsEl) return;

  let w, round, locked;

  function reset() {
    w = DIMS.map(() => 0);
    round = 0;
    locked = false;
    resultEl.classList.remove("is-on");
    resultEl.innerHTML = "";
    renderBars();
    renderRound();
  }

  function renderBars() {
    const maxAbs = Math.max(1, ...w.map((x) => Math.abs(x)));
    barsEl.innerHTML = "";
    DIMS.forEach((d, i) => {
      const pct = clamp((w[i] / maxAbs) * 100, 0, 100);
      const row = document.createElement("div");
      row.className = "rlhf-bar";
      row.innerHTML =
        `<span class="rlhf-bar__lab">${d}</span>` +
        `<span class="rlhf-bar__track"><span class="rlhf-bar__fill" style="width:${pct.toFixed(0)}%"></span></span>`;
      barsEl.appendChild(row);
    });
  }

  function renderRound() {
    progEl.textContent = `Confronto ${Math.min(round + 1, ROUNDS.length)} / ${ROUNDS.length}`;
    if (round >= ROUNDS.length) return finish();

    const r = ROUNDS[round];
    promptEl.textContent = r.prompt;
    cardsEl.innerHTML = "";
    [["a", r.a], ["b", r.b]].forEach(([key, resp]) => {
      const card = document.createElement("button");
      card.className = "rlhf-card";
      card.innerHTML =
        `<span class="rlhf-card__tag">Risposta ${key.toUpperCase()}</span>` +
        `<span class="rlhf-card__text">${resp.text}</span>` +
        `<span class="rlhf-card__pick">Preferisco questa</span>`;
      card.addEventListener("click", () => choose(key));
      cardsEl.appendChild(card);
    });
  }

  function choose(key) {
    if (locked) return;
    locked = true;
    const r = ROUNDS[round];
    const chosen = key === "a" ? r.a : r.b;
    const rejected = key === "a" ? r.b : r.a;
    // aggiornamento del modello di ricompensa: rafforza ciò che distingue la risposta scelta
    for (let i = 0; i < w.length; i++) w[i] += LR * (chosen.attrs[i] - rejected.attrs[i]);

    [...cardsEl.children].forEach((c) => {
      const isPick = c.querySelector(".rlhf-card__tag").textContent.endsWith(key.toUpperCase());
      c.classList.add(isPick ? "is-picked" : "is-faded");
    });
    renderBars();
    setTimeout(() => {
      round++;
      locked = false;
      renderRound();
    }, 650);
  }

  function finish() {
    cardsEl.innerHTML = "";
    promptEl.textContent = "Preferenze raccolte.";
    const top = DIMS.map((d, i) => [d, w[i]]).sort((a, b) => b[1] - a[1]).slice(0, 2).map((x) => x[0]);
    resultEl.innerHTML =
      `<strong>Modello di ricompensa pronto.</strong> In base alle tue scelte, premia soprattutto ` +
      `<b>${top[0]}</b> e <b>${top[1]}</b>. Ora il modello viene «spinto» a generare risposte che ` +
      `massimizzano questa ricompensa: è l'allineamento alle preferenze umane (RLHF).`;
    resultEl.classList.add("is-on");
  }

  resetBtn?.addEventListener("click", reset);
  reset();
}
