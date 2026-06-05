import { pseudoVector, divergingColor, tooltip } from "./utils.js";

const SAMPLE = ["·gatto", "·cane", "·re", "·regina", "·programmo"];
const DIM = 24;

export function initEmbedding() {
  renderVectors();
  renderSemantic();
}

function renderVectors() {
  const root = document.getElementById("embVectors");
  if (!root) return;
  const tip = tooltip();

  SAMPLE.forEach((tok) => {
    const vec = pseudoVector(tok, DIM);
    const row = document.createElement("div");
    row.className = "emb-row";
    const label = document.createElement("div");
    label.className = "emb-row__label";
    label.textContent = tok;
    const cells = document.createElement("div");
    cells.className = "emb-row__cells";
    vec.forEach((val, i) => {
      const cell = document.createElement("div");
      cell.className = "emb-cell";
      cell.style.background = divergingColor(val);
      cell.addEventListener("mousemove", (e) =>
        tip.show(e.clientX, e.clientY, `dim ${i}<br>${val.toFixed(3)}`)
      );
      cell.addEventListener("mouseleave", () => tip.hide());
      cells.appendChild(cell);
    });
    row.appendChild(label);
    row.appendChild(cells);
    root.appendChild(row);
  });
}

// Mappa 2D dello spazio semantico (coordinate disegnate a mano per illustrare i cluster)
const WORDS = [
  // animali
  { w: "gatto", x: 0.18, y: 0.28, g: 0 },
  { w: "cane", x: 0.24, y: 0.20, g: 0 },
  { w: "cavallo", x: 0.30, y: 0.32, g: 0 },
  // città
  { w: "Roma", x: 0.74, y: 0.24, g: 1 },
  { w: "Parigi", x: 0.82, y: 0.30, g: 1 },
  { w: "Milano", x: 0.70, y: 0.16, g: 1 },
  // cibo
  { w: "pizza", x: 0.30, y: 0.78, g: 2 },
  { w: "pasta", x: 0.22, y: 0.70, g: 2 },
  { w: "pane", x: 0.34, y: 0.68, g: 2 },
  // analogia re/regina/uomo/donna
  { w: "uomo", x: 0.60, y: 0.62, g: 3 },
  { w: "donna", x: 0.60, y: 0.80, g: 3 },
  { w: "re", x: 0.80, y: 0.58, g: 3 },
  { w: "regina", x: 0.80, y: 0.76, g: 3 },
];
const GROUP_COLORS = ["#46e3d0", "#ffb454", "#8ee06a", "#ff7a93"];

function renderSemantic() {
  const canvas = document.getElementById("semanticCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // griglia leggera
  ctx.strokeStyle = "rgba(70,227,208,0.06)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    ctx.beginPath(); ctx.moveTo((W / 8) * i, 0); ctx.lineTo((W / 8) * i, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, (H / 8) * i); ctx.lineTo(W, (H / 8) * i); ctx.stroke();
  }

  const px = (p) => p.x * W;
  const py = (p) => p.y * H;
  const byW = (name) => WORDS.find((d) => d.w === name);

  // parallelogramma dell'analogia re-uomo+donna≈regina
  const uomo = byW("uomo"), donna = byW("donna"), re = byW("re"), regina = byW("regina");
  drawArrow(ctx, px(uomo), py(uomo), px(re), py(re), "rgba(255,180,84,0.5)");
  drawArrow(ctx, px(donna), py(donna), px(regina), py(regina), "rgba(255,180,84,0.5)");
  drawArrow(ctx, px(uomo), py(uomo), px(donna), py(donna), "rgba(70,227,208,0.35)");
  drawArrow(ctx, px(re), py(re), px(regina), py(regina), "rgba(70,227,208,0.35)");

  // punti + etichette
  WORDS.forEach((d) => {
    const x = px(d), y = py(d);
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = GROUP_COLORS[d.g];
    ctx.shadowColor = GROUP_COLORS[d.g];
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = "13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#e7ecf3";
    ctx.fillText(d.w, x + 10, y + 4);
  });
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = 8;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h * Math.cos(ang - 0.4), y2 - h * Math.sin(ang - 0.4));
  ctx.lineTo(x2 - h * Math.cos(ang + 0.4), y2 - h * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
}
