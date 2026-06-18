import { clamp, lerp } from "./utils.js";

const PROBLEM = "In un cesto ci sono 3 mele. Ne aggiungi il doppio di quante ce ne sono, poi ne mangi 2. Quante mele restano?";
const STEPS = [
  "Parto da 3 mele nel cesto.",
  "«Il doppio di quante ce ne sono» è 2 × 3 = 6: ora sono 3 + 6 = 9.",
  "Ne mangio 2: 9 − 2 = 7.",
  "Quindi restano 7 mele.",
];
const WRONG = "5";
const RIGHT = "7";

export function initReasoning() {
  const chips = document.getElementById("reasonChips");
  const budget = document.getElementById("reasonBudget");
  const solveBtn = document.getElementById("reasonSolve");
  const stream = document.getElementById("reasonStream");
  const answer = document.getElementById("reasonAnswer");
  const canvas = document.getElementById("reasonCanvas");
  const gauge = document.getElementById("reasonAcc");
  if (!chips || !budget || !solveBtn || !stream || !canvas) return;

  let mode = "ragionato"; // "diretto" | "ragionato"

  const accuracy = () =>
    mode === "diretto" ? 0.35 : lerp(0.45, 0.96, +budget.value / 100);

  function setMode(m) {
    mode = m;
    [...chips.children].forEach((c) => c.classList.toggle("is-active", c.dataset.mode === m));
    budget.disabled = m === "diretto";
    budget.closest(".field")?.classList.toggle("is-off", m === "diretto");
    stream.innerHTML = "";
    answer.className = "reason-answer";
    answer.textContent = "";
    drawCurve();
    updateGauge();
  }

  function updateGauge() {
    const a = accuracy();
    gauge.style.width = (a * 100).toFixed(0) + "%";
    gauge.textContent = (a * 100).toFixed(0) + "%";
    gauge.parentElement.classList.toggle("is-low", a < 0.5);
  }

  function solve() {
    stream.innerHTML = "";
    answer.className = "reason-answer";
    answer.textContent = "";

    if (mode === "diretto") {
      answer.textContent = "Risposta: " + WRONG;
      answer.classList.add("is-wrong", "is-on");
      return;
    }

    const nSteps = clamp(Math.round((+budget.value / 100) * STEPS.length), 1, STEPS.length);
    const shown = STEPS.slice(0, nSteps);
    solveBtn.disabled = true;
    shown.forEach((s, i) => {
      setTimeout(() => {
        const el = document.createElement("div");
        el.className = "reason-step";
        el.innerHTML = `<span class="reason-step__n">${i + 1}</span><span>${s}</span>`;
        stream.appendChild(el);
        requestAnimationFrame(() => el.classList.add("is-in"));
        if (i === shown.length - 1) {
          const correct = nSteps === STEPS.length;
          answer.textContent = "Risposta: " + (correct ? RIGHT : "…probabilmente " + WRONG);
          answer.classList.add(correct ? "is-right" : "is-wrong", "is-on");
          solveBtn.disabled = false;
        }
      }, 360 * (i + 1));
    });
  }

  function drawCurve() {
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const pad = { l: 32, r: 12, t: 14, b: 24 };
    const X = (b) => pad.l + (b / 100) * (W - pad.l - pad.r);
    const Y = (a) => pad.t + (1 - a) * (H - pad.t - pad.b);

    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillStyle = "#6f7c8d";
    [0, 0.5, 1].forEach((a) => {
      const yy = Y(a);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(W - pad.r, yy);
      ctx.stroke();
      ctx.fillText((a * 100).toFixed(0), 8, yy + 3);
    });
    ctx.fillText("budget di pensiero →", pad.l, H - 6);

    // linea risposta diretta (piatta)
    ctx.strokeStyle = "rgba(255,122,147,0.55)";
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0.35));
    ctx.lineTo(X(100), Y(0.35));
    ctx.stroke();
    ctx.setLineDash([]);

    // curva del ragionamento (cresce col budget)
    ctx.strokeStyle = "#46e3d0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let b = 0; b <= 100; b += 2) {
      const a = lerp(0.45, 0.96, b / 100);
      const xx = X(b);
      const yy = Y(a);
      b ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();

    // punto corrente
    if (mode === "ragionato") {
      const b = +budget.value;
      ctx.fillStyle = "#46e3d0";
      ctx.beginPath();
      ctx.arc(X(b), Y(lerp(0.45, 0.96, b / 100)), 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#ff7a93";
      ctx.beginPath();
      ctx.arc(X(50), Y(0.35), 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  document.getElementById("reasonProblem").textContent = PROBLEM;
  [...chips.children].forEach((c) => c.addEventListener("click", () => setMode(c.dataset.mode)));
  budget.addEventListener("input", () => {
    document.getElementById("reasonBudgetVal").textContent = budget.value + "%";
    drawCurve();
    updateGauge();
  });
  solveBtn.addEventListener("click", solve);

  setMode("ragionato");
}
