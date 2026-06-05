import { divergingColor } from "./utils.js";

const DIM = 48; // colonne (dimensioni del vettore)

export function initPosenc() {
  const canvas = document.getElementById("posCanvas");
  const slider = document.getElementById("posLen");
  const lenVal = document.getElementById("posLenVal");
  if (!canvas || !slider) return;
  const ctx = canvas.getContext("2d");

  function pe(pos, i) {
    const denom = Math.pow(10000, (2 * Math.floor(i / 2)) / DIM);
    return i % 2 === 0 ? Math.sin(pos / denom) : Math.cos(pos / denom);
  }

  function render() {
    const rows = parseInt(slider.value, 10);
    lenVal.textContent = rows;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cw = W / DIM;
    const ch = H / rows;
    for (let p = 0; p < rows; p++) {
      for (let i = 0; i < DIM; i++) {
        ctx.fillStyle = divergingColor(pe(p, i));
        ctx.fillRect(i * cw, p * ch, Math.ceil(cw), Math.ceil(ch));
      }
    }
  }

  slider.addEventListener("input", render);
  render();
}
