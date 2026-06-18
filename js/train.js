import { softmax, clamp, mulberry32 } from "./utils.js";

// Frase di addestramento: il modello deve imparare la parola che segue.
const CANDS = ["vita", "strada", "storia", "notte", "casa", "sorte"];
const CORRECT = 0;

export function initTraining() {
  const stepBtn = document.getElementById("trainStep");
  const resetBtn = document.getElementById("trainReset");
  const lr = document.getElementById("lrSlider");
  const canvas = document.getElementById("trainCanvas");
  const barsEl = document.getElementById("trainBars");
  if (!stepBtn || !canvas || !barsEl || !lr) return;

  const rnd = mulberry32(99173);
  let logits, history, step, running;

  const probs = () => softmax(logits, 1);
  const lossOf = (p) => -Math.log(Math.max(p[CORRECT], 1e-9));
  const pushLoss = () => {
    history.push(lossOf(probs()));
    if (history.length > 160) history.shift();
  };

  function reset() {
    logits = CANDS.map(() => (rnd() - 0.5) * 0.4);
    history = [];
    step = 0;
    running = false;
    stepBtn.disabled = false;
    pushLoss();
    render();
  }

  function trainStep() {
    const rate = +lr.value / 100; // 0.05–1.20
    const p = probs();
    const noise = rate * 0.7; // instabilità crescente con il learning rate
    for (let i = 0; i < logits.length; i++) {
      const target = i === CORRECT ? 1 : 0;
      const grad = p[i] - target; // gradiente reale della cross-entropy sui logit
      logits[i] -= rate * grad * 3.2;
      logits[i] += (rnd() * 2 - 1) * noise;
    }
    step++;
    pushLoss();
  }

  function burst() {
    if (running) return;
    running = true;
    stepBtn.disabled = true;
    let n = 0;
    const tick = () => {
      trainStep();
      render();
      if (++n < 20) requestAnimationFrame(tick);
      else {
        running = false;
        stepBtn.disabled = false;
      }
    };
    requestAnimationFrame(tick);
  }

  function render() {
    const p = probs();
    document.getElementById("trainStepN").textContent = step;
    let mi = 0;
    p.forEach((v, i) => {
      if (v > p[mi]) mi = i;
    });
    const blank = document.getElementById("trainBlank");
    blank.textContent = CANDS[mi];
    blank.classList.toggle("is-right", mi === CORRECT && p[CORRECT] > 0.5);
    renderBars(p);
    drawLoss();
  }

  function renderBars(p) {
    barsEl.innerHTML = "";
    p.map((v, i) => i)
      .sort((a, b) => p[b] - p[a])
      .forEach((i) => {
        const row = document.createElement("div");
        row.className = "train-bar" + (i === CORRECT ? " train-bar--correct" : "");
        row.innerHTML =
          `<span class="train-bar__lab">${CANDS[i]}${i === CORRECT ? " ✓" : ""}</span>` +
          `<span class="train-bar__track"><span class="train-bar__fill" style="width:${(p[i] * 100).toFixed(1)}%"></span></span>` +
          `<span class="train-bar__pct">${(p[i] * 100).toFixed(0)}%</span>`;
        barsEl.appendChild(row);
      });
  }

  function drawLoss() {
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const pad = { l: 34, r: 12, t: 14, b: 22 };
    const maxL = 2.6;
    const X = (i) => pad.l + (i / Math.max(history.length - 1, 1)) * (W - pad.l - pad.r);
    const Y = (l) => pad.t + (1 - clamp(l, 0, maxL) / maxL) * (H - pad.t - pad.b);

    ctx.lineWidth = 1;
    ctx.font = "10px JetBrains Mono, monospace";
    for (let g = 0; g <= 2; g++) {
      const lv = (maxL / 2) * g;
      const yy = Y(lv);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(W - pad.r, yy);
      ctx.stroke();
      ctx.fillStyle = "#6f7c8d";
      ctx.fillText(lv.toFixed(1), 6, yy + 3);
    }

    if (history.length > 1) {
      ctx.beginPath();
      history.forEach((l, i) => {
        const xx = X(i);
        const yy = Y(l);
        i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      });
      ctx.strokeStyle = "#ffb454";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();
      const lx = X(history.length - 1);
      const ly = Y(history[history.length - 1]);
      ctx.fillStyle = "#ffb454";
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  lr.addEventListener("input", () => {
    document.getElementById("lrVal").textContent = (+lr.value / 100).toFixed(2);
  });
  stepBtn.addEventListener("click", burst);
  resetBtn.addEventListener("click", reset);

  reset();
}
