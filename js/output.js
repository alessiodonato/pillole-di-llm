import { softmax, weightedPick, mulberry32 } from "./utils.js";

// logit di base illustrativi per il contesto "Il gatto sale sul"
const CANDIDATES = [
  { w: "divano", logit: 3.4 },
  { w: "tavolo", logit: 2.9 },
  { w: "letto", logit: 2.5 },
  { w: "tetto", logit: 2.1 },
  { w: "muro", logit: 1.7 },
  { w: "albero", logit: 1.4 },
  { w: "davanzale", logit: 1.0 },
  { w: "comò", logit: 0.6 },
];

export function initOutput() {
  const slider = document.getElementById("tempSlider");
  const tempVal = document.getElementById("tempVal");
  const bars = document.getElementById("outBars");
  const btn = document.getElementById("sampleBtn");
  const result = document.getElementById("outResult");
  if (!slider || !bars) return;

  let rnd = mulberry32(20260605);

  function probs() {
    const t = parseInt(slider.value, 10) / 100; // 0..2
    const logits = CANDIDATES.map((c) => c.logit);
    return { p: softmax(logits, t === 0 ? 0.01 : t), t };
  }

  function render(pickedIdx = -1) {
    const { p, t } = probs();
    tempVal.textContent = t.toFixed(2);
    const max = Math.max(...p);
    bars.innerHTML = "";
    CANDIDATES.forEach((c, i) => {
      const row = document.createElement("div");
      row.className = "obar" + (p[i] === max ? " is-top" : "") + (i === pickedIdx ? " is-picked" : "");
      row.innerHTML = `
        <div class="obar__word">${c.w}</div>
        <div class="obar__track"><div class="obar__fill" style="width:${(p[i] * 100).toFixed(1)}%"></div></div>
        <div class="obar__pct">${(p[i] * 100).toFixed(1)}%</div>`;
      bars.appendChild(row);
    });
  }

  slider.addEventListener("input", () => render());
  btn.addEventListener("click", () => {
    const { p, t } = probs();
    const idx = t < 0.05 ? p.indexOf(Math.max(...p)) : weightedPick(p, rnd);
    render(idx);
    result.innerHTML = `Parola scelta: <b>${CANDIDATES[idx].w}</b>, "Il gatto sale sul ${CANDIDATES[idx].w}".`;
  });

  render();
}

// ---------- Demo end-to-end: generazione token per token ----------
const STAGES = ["Token", "Embedding", "+Posizione", "Attention", "Feed-forward", "Logits", "Softmax", "Campiona"];
// passaggi sceneggiati: contesto -> prossimo token (illustrativo ma coerente)
const SCRIPT = [
  "Il", "·gatto", "·dorme", "·sul", "·divano", "·caldo", "·vicino", "·alla", "·finestra", ".",
];

export function initLoop() {
  const stageEl = document.getElementById("loopStage");
  const textEl = document.getElementById("loopText");
  const stepBtn = document.getElementById("loopStep");
  const resetBtn = document.getElementById("loopReset");
  if (!stageEl || !textEl) return;

  const pills = STAGES.map((s) => {
    const el = document.createElement("span");
    el.className = "loop-stage-pill";
    el.textContent = s;
    stageEl.appendChild(el);
    return el;
  });

  let idx = 0;
  let animating = false;

  function reset() {
    idx = 0;
    textEl.innerHTML = "";
    pills.forEach((p) => p.classList.remove("is-active", "is-done"));
    stepBtn.disabled = false;
  }

  function appendToken() {
    if (idx >= SCRIPT.length) return;
    const raw = SCRIPT[idx];
    const display = raw.startsWith("·") ? " " + raw.slice(1) : raw;
    const span = document.createElement("span");
    span.className = "new-tok";
    span.textContent = display;
    textEl.appendChild(span);
    setTimeout(() => span.classList.remove("new-tok"), 500);
    idx++;
    if (idx >= SCRIPT.length) stepBtn.disabled = true;
  }

  async function step() {
    if (animating || idx >= SCRIPT.length) return;
    animating = true;
    stepBtn.disabled = true;
    pills.forEach((p) => p.classList.remove("is-active", "is-done"));
    for (let s = 0; s < pills.length; s++) {
      pills[s].classList.add("is-active");
      await wait(120);
      pills[s].classList.remove("is-active");
      pills[s].classList.add("is-done");
    }
    appendToken();
    animating = false;
    if (idx < SCRIPT.length) stepBtn.disabled = false;
  }

  stepBtn.addEventListener("click", step);
  resetBtn.addEventListener("click", reset);
  reset();
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
