import { computeAttention } from "./attention.js";
import { heatColor } from "./utils.js";

const SENTENCE = ["Il", "gatto", "dorme", "sul", "vecchio", "divano", "caldo"];
const HEADS = [
  { name: "Head 1", color: "#46e3d0", desc: "Tende a guardare la parola immediatamente precedente.", seed: 1, recency: 1.6 },
  { name: "Head 2", color: "#ffb454", desc: "Collega aggettivi e nomi a cui si riferiscono.", seed: 14, recency: 0.2 },
  { name: "Head 3", color: "#9d8cff", desc: "Distribuisce l'attenzione sull'intero contesto.", seed: 31, recency: 0.0 },
  { name: "Head 4", color: "#ff7a93", desc: "Si concentra fortemente sul token stesso.", seed: 52, recency: -0.3 },
];

export function initMultihead() {
  const root = document.getElementById("heads");
  if (!root) return;
  HEADS.forEach((h) => {
    const A = computeAttention(SENTENCE, h.seed, h.recency);
    const card = document.createElement("div");
    card.className = "head";
    card.innerHTML = `
      <div class="head__title"><span class="dot" style="background:${h.color}"></span>${h.name}</div>
      <div class="head__desc">${h.desc}</div>`;
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);
    root.appendChild(card);
    drawMini(canvas, A);
  });
}

function drawMini(canvas, A) {
  const n = A.length;
  const dpr = window.devicePixelRatio || 1;
  const size = Math.max(canvas.clientWidth || 240, 180);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cell = size / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      ctx.fillStyle = j > i ? "rgba(255,255,255,0.02)" : heatColor(A[i][j]);
      ctx.fillRect(j * cell + 1, i * cell + 1, cell - 2, cell - 2);
    }
  }
}
