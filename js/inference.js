import { mulberry32, divergingColor, clamp, lerp } from "./utils.js";

export function initInference() {
  initQuant();
  initRam();
}

// ============================================================
// Idea 1 — quantizzazione: meno bit = modello più piccolo
// Cifre illustrative su un modello tipo DeepSeek V4 Flash.
// ============================================================
const QUANT = [
  { bits: "2-bit", levels: 4, gb: 91, quality: 92 },
  { bits: "4-bit", levels: 16, gb: 182, quality: 97 },
  { bits: "8-bit", levels: 64, gb: 365, quality: 99 },
  { bits: "16-bit", levels: 0, gb: 730, quality: 100 }, // 0 = precisione continua
];

function initQuant() {
  const slider = document.getElementById("quantSlider");
  const canvas = document.getElementById("quantCanvas");
  if (!slider || !canvas) return;

  // valori base dei pesi, generati una volta sola e poi quantizzati per la vista
  const COLS = 48;
  const ROWS = 12;
  const rnd = mulberry32(20260614);
  const base = Array.from({ length: COLS * ROWS }, () => (rnd() + rnd() + rnd() - 1.5) / 1.5);

  const render = () => {
    const q = QUANT[+slider.value];
    document.getElementById("quantBits").textContent = q.bits;
    document.getElementById("quantSize").textContent = "~" + q.gb + " GB";
    document.getElementById("quantQual").style.width = q.quality + "%";
    drawMatrix(canvas, base, COLS, ROWS, q.levels);
  };

  slider.addEventListener("input", render);
  render();
}

function drawMatrix(canvas, base, cols, rows, levels) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const gap = 2;
  const cw = (W - gap * (cols - 1)) / cols;
  const ch = (H - gap * (rows - 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let v = base[r * cols + c];
      if (levels > 0) {
        // arrotonda a un numero finito di livelli: meno bit -> bande più grosse
        const half = levels / 2;
        v = clamp(Math.round(v * half) / half, -1, 1);
      }
      ctx.fillStyle = divergingColor(v);
      ctx.fillRect(c * (cw + gap), r * (ch + gap), cw, ch);
    }
  }
}

// ============================================================
// Idea 2 — la RAM come spettro: SSD streaming degli esperti
// GB illustrativi (modello tipo Flash q2 ~91 GB).
// ============================================================
const RAM_STOPS = [16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512];
const NONROUTED = 23; // parti comuni: sempre residenti in RAM
const ROUTED = 68; // esperti MoE: residenti o letti da SSD
const OVERHEAD = 8; // KV cache + scratch
const MODEL = NONROUTED + ROUTED; // 91 GB su disco
const RESIDENT_TS = 34; // t/s con modello interamente in RAM

function initRam() {
  const slider = document.getElementById("ramSlider");
  const bar = document.getElementById("ramBar");
  if (!slider || !bar) return;

  const render = () => {
    const ram = RAM_STOPS[+slider.value];
    document.getElementById("ramVal").textContent = ram + " GB";

    const st = ramState(ram);
    drawRamBar(bar, st);

    const mode = document.getElementById("ramMode");
    const speedEl = document.getElementById("ramSpeed");
    const hint = document.getElementById("ramHint");

    if (st.mode === "insufficiente") {
      mode.className = "ram-mode is-bad";
      mode.textContent = "Non parte: nemmeno le parti fisse entrano in RAM.";
      speedEl.textContent = "0";
      hint.textContent =
        "Servono almeno ~" + (NONROUTED + OVERHEAD) + " GB per le parti comuni e la KV cache. " +
        "Sotto questa soglia non c'è streaming che tenga.";
    } else if (st.mode === "resident") {
      mode.className = "ram-mode is-good";
      mode.textContent = "Tutto in RAM, massima velocità.";
      speedEl.textContent = String(RESIDENT_TS);
      hint.textContent =
        "Il modello intero sta in memoria: è la corsia più veloce. (Cifre illustrative su un modello da ~" +
        MODEL + " GB.)";
    } else {
      mode.className = "ram-mode is-stream";
      mode.textContent =
        "SSD streaming: il " + Math.round(st.frac * 100) + "% degli esperti sta in RAM, il resto arriva dal disco.";
      speedEl.textContent = String(Math.round(st.speed));
      hint.textContent =
        "Nota come la velocità scenda in modo graduale invece di crollare a zero: la RAM è diventata un " +
        "cursore di velocità, non un interruttore acceso/spento. (Cifre illustrative.)";
    }
  };

  slider.addEventListener("input", render);
  render();
}

function ramState(ram) {
  const fixed = NONROUTED + OVERHEAD; // soglia minima per partire
  if (ram < fixed) return { mode: "insufficiente", frac: 0 };
  const frac = clamp((ram - fixed) / ROUTED, 0, 1);
  if (frac >= 1) return { mode: "resident", frac: 1, speed: RESIDENT_TS };
  return { mode: "streaming", frac, speed: lerp(6, 30, frac) };
}

function drawRamBar(bar, st) {
  bar.innerHTML = "";
  const seg = (cls, pct, label) => {
    const d = document.createElement("div");
    d.className = "ram-seg " + cls;
    d.style.width = pct + "%";
    if (label && pct > 9) d.textContent = label;
    bar.appendChild(d);
  };

  if (st.mode === "insufficiente") {
    seg("ram-seg--bad", 100, "RAM insufficiente");
    return;
  }
  const fixW = (NONROUTED / MODEL) * 100;
  const ramW = (ROUTED / MODEL) * 100 * st.frac;
  const ssdW = (ROUTED / MODEL) * 100 * (1 - st.frac);
  seg("ram-seg--fix", fixW, "fisse");
  if (ramW > 0.5) seg("ram-seg--ram", ramW, "RAM");
  if (ssdW > 0.5) seg("ram-seg--ssd", ssdW, "SSD");
}
