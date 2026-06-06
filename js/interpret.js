import { pseudoVector, divergingColor, heatColor, hash32, mulberry32, tooltip } from "./utils.js";

const DENSE_DIM = 18;
const GRID = 48;

// Contesti illustrativi: ogni feature è curata a mano per essere interpretabile.
// I valori sono didattici, non provengono da un modello reale.
const EXAMPLES = [
  {
    text: "Il gatto dorme sul divano caldo",
    features: [
      ["felini e animali domestici", 0.93],
      ["mobili e arredamento", 0.7],
      ["riposo e sonno", 0.62],
      ["sensazioni di calore", 0.48],
      ["verbi al presente", 0.36],
    ],
  },
  {
    text: "La barca scende lungo il fiume",
    features: [
      ["corsi d'acqua e fiumi", 0.9],
      ["imbarcazioni", 0.78],
      ["movimento e direzione", 0.55],
      ["paesaggi naturali", 0.4],
    ],
  },
  {
    text: "Ho versato i soldi in banca",
    features: [
      ["finanza e denaro", 0.92],
      ["transazioni economiche", 0.72],
      ["edifici e istituzioni", 0.55],
      ["passato prossimo", 0.42],
    ],
  },
  {
    text: "Nel 2026 visiterò Roma",
    features: [
      ["date e anni", 0.86],
      ["città italiane", 0.82],
      ["viaggi e turismo", 0.58],
      ["verbi al futuro", 0.5],
    ],
  },
];

export function initInterpret() {
  const chips = document.getElementById("saeChips");
  if (!chips) return;
  const tip = tooltip();

  EXAMPLES.forEach((ex, i) => {
    const b = document.createElement("button");
    b.className = "chip-btn";
    b.textContent = ex.text;
    b.addEventListener("click", () => select(i));
    chips.appendChild(b);
  });

  function select(i) {
    [...chips.children].forEach((c, idx) => c.classList.toggle("is-active", idx === i));
    render(EXAMPLES[i], tip);
  }

  select(0);
}

function render(ex, tip) {
  renderDense(ex, tip);
  const cells = assignCells(ex);
  renderGrid(cells, tip);
  renderBars(ex);
}

// vettore denso (residual stream) -> celle colorate
function renderDense(ex, tip) {
  const root = document.getElementById("saeDense");
  root.innerHTML = "";
  pseudoVector(ex.text, DENSE_DIM).forEach((v, i) => {
    const cell = document.createElement("div");
    cell.className = "sae-dense__cell";
    cell.style.background = divergingColor(v);
    cell.addEventListener("mousemove", (e) =>
      tip.show(e.clientX, e.clientY, `dim ${i}<br>${v.toFixed(3)}`)
    );
    cell.addEventListener("mouseleave", () => tip.hide());
    root.appendChild(cell);
  });
}

// mappa ogni feature a una posizione stabile nella griglia + un po' di rumore di fondo
function assignCells(ex) {
  const used = new Map();
  ex.features.forEach(([label, strength]) => {
    let idx = hash32(label) % GRID;
    while (used.has(idx)) idx = (idx + 1) % GRID;
    used.set(idx, { label, strength });
  });
  const rnd = mulberry32(hash32(ex.text));
  let added = 0;
  while (added < 6) {
    const idx = Math.floor(rnd() * GRID);
    if (!used.has(idx)) {
      used.set(idx, { label: null, strength: 0.05 + rnd() * 0.1 });
      added++;
    }
  }
  return used;
}

function renderGrid(cells, tip) {
  const grid = document.getElementById("saeGrid");
  grid.innerHTML = "";
  for (let i = 0; i < GRID; i++) {
    const cell = document.createElement("div");
    cell.className = "sae-cell";
    const f = cells.get(i);
    if (f && f.label) {
      cell.classList.add("is-on");
      const col = heatColor(f.strength);
      cell.style.background = col;
      cell.style.boxShadow = `0 0 ${6 + f.strength * 14}px -2px ${col}`;
      cell.style.animationDelay = (i % 12) * 0.012 + "s";
      cell.addEventListener("mousemove", (e) =>
        tip.show(e.clientX, e.clientY, `${f.label}<br>forza ${f.strength.toFixed(2)}`)
      );
      cell.addEventListener("mouseleave", () => tip.hide());
    } else if (f) {
      cell.style.background = `rgba(70,227,208,${(0.08 + f.strength).toFixed(2)})`;
    }
    grid.appendChild(cell);
  }
}

function renderBars(ex) {
  const bars = document.getElementById("saeBars");
  bars.innerHTML = "";
  [...ex.features]
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, strength], i) => {
      const row = document.createElement("div");
      row.className = "sae-bar" + (i === 0 ? " is-top" : "");

      const name = document.createElement("div");
      name.className = "sae-bar__name";
      name.textContent = label;

      const track = document.createElement("div");
      track.className = "sae-bar__track";
      const fill = document.createElement("div");
      fill.className = "sae-bar__fill";
      track.appendChild(fill);
      requestAnimationFrame(() => {
        fill.style.width = (strength * 100).toFixed(0) + "%";
      });

      const pct = document.createElement("div");
      pct.className = "sae-bar__pct";
      pct.textContent = strength.toFixed(2);

      row.append(name, track, pct);
      bars.appendChild(row);
    });
}
