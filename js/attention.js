import { pseudoVector, dot, softmax, heatColor, tooltip } from "./utils.js";

const SENTENCE = ["Il", "gatto", "dorme", "sul", "vecchio", "divano", "caldo"];
const D = 16;

// Attention causale (stile GPT): ogni token vede solo sé stesso e i precedenti.
export function computeAttention(tokens, seed = 0, recency = 0.6) {
  const n = tokens.length;
  const Q = tokens.map((t) => pseudoVector(`${t}|q|${seed}`, D));
  const K = tokens.map((t) => pseudoVector(`${t}|k|${seed}`, D));
  const A = [];
  for (let i = 0; i < n; i++) {
    const raw = [];
    for (let j = 0; j < n; j++) {
      if (j > i) { raw.push(-Infinity); continue; }
      let s = dot(Q[i], K[j]) / Math.sqrt(D);
      s += recency / (1 + (i - j)); // lieve preferenza per i token vicini
      if (j === i) s += 0.3;
      raw.push(s);
    }
    A.push(softmax(raw));
  }
  return A;
}

export function initAttention() {
  const sentenceEl = document.getElementById("attSentence");
  const canvas = document.getElementById("attCanvas");
  const matrixEl = document.getElementById("attMatrix");
  if (!sentenceEl || !canvas) return;

  const tip = tooltip();
  const A = computeAttention(SENTENCE, 7);
  let query = SENTENCE.length - 1;

  // --- chip dei token ---
  const chips = SENTENCE.map((tok, i) => {
    const el = document.createElement("button");
    el.className = "att-tok";
    el.textContent = tok;
    el.addEventListener("click", () => { query = i; update(); });
    sentenceEl.appendChild(el);
    return el;
  });

  // --- matrice ---
  function buildMatrix() {
    const n = SENTENCE.length;
    matrixEl.style.gridTemplateColumns = `46px repeat(${n}, 1fr)`;
    matrixEl.innerHTML = "";
    matrixEl.appendChild(corner(""));
    for (let j = 0; j < n; j++) matrixEl.appendChild(corner(SENTENCE[j].slice(0, 3)));
    for (let i = 0; i < n; i++) {
      matrixEl.appendChild(corner(SENTENCE[i].slice(0, 3)));
      for (let j = 0; j < n; j++) {
        const cell = document.createElement("div");
        cell.className = "att-cell";
        const w = j > i ? 0 : A[i][j];
        cell.style.background = j > i ? "rgba(255,255,255,0.02)" : heatColor(w);
        cell.addEventListener("mousemove", (e) =>
          tip.show(e.clientX, e.clientY,
            j > i ? "mascherato<br>(token futuro)" :
            `${SENTENCE[i]} → ${SENTENCE[j]}<br>peso ${(w * 100).toFixed(1)}%`)
        );
        cell.addEventListener("mouseleave", () => tip.hide());
        matrixEl.appendChild(cell);
      }
    }
  }
  function corner(txt) {
    const d = document.createElement("div");
    d.className = "att-cell att-cell--label";
    d.textContent = txt;
    return d;
  }

  // --- canvas archi ---
  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 900;
    const h = 260;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function drawArcs() {
    const { ctx, w, h } = setupCanvas();
    ctx.clearRect(0, 0, w, h);
    const n = SENTENCE.length;
    const margin = 60;
    const span = w - margin * 2;
    const xs = SENTENCE.map((_, i) => margin + (span * (i + 0.5)) / n);
    const baseY = h - 56;

    // baseline + etichette
    ctx.font = "14px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    SENTENCE.forEach((tok, i) => {
      const isQ = i === query;
      ctx.fillStyle = isQ ? "#ffb454" : "#aab4c2";
      ctx.fillText(tok, xs[i], baseY + 24);
      ctx.beginPath();
      ctx.arc(xs[i], baseY, isQ ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isQ ? "#ffb454" : "#46e3d0";
      ctx.fill();
    });

    // archi dalla query verso le key (j <= query)
    for (let j = 0; j <= query; j++) {
      const w_ = A[query][j];
      if (w_ < 0.01) continue;
      const x1 = xs[query], x2 = xs[j];
      ctx.strokeStyle = heatColor(w_);
      ctx.globalAlpha = 0.35 + w_ * 0.65;
      ctx.lineWidth = 1 + w_ * 9;
      ctx.shadowColor = heatColor(w_);
      ctx.shadowBlur = 8 * w_;
      if (j === query) {
        ctx.beginPath();
        ctx.arc(x1, baseY - 18, 14, 0.15 * Math.PI, 0.85 * Math.PI, true);
        ctx.stroke();
      } else {
        const ctrlY = baseY - 70 - Math.abs(x1 - x2) * 0.18;
        ctx.beginPath();
        ctx.moveTo(x1, baseY - 8);
        ctx.quadraticCurveTo((x1 + x2) / 2, ctrlY, x2, baseY - 8);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function update() {
    chips.forEach((c, i) => {
      c.classList.toggle("is-query", i === query);
      c.classList.toggle("is-key", i !== query && i <= query && A[query][i] > 0.12);
    });
    drawArcs();
  }

  buildMatrix();
  update();
  window.addEventListener("resize", drawArcs);
}
