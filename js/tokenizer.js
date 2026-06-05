import { tokenize } from "./utils.js";

export function initTokenizer() {
  const input = document.getElementById("tokInput");
  const out = document.getElementById("tokTokens");
  const stats = document.getElementById("tokStats");
  if (!input || !out) return;

  function render() {
    const text = input.value;
    const tokens = tokenize(text);
    out.innerHTML = "";
    tokens.forEach((t, i) => {
      const el = document.createElement("span");
      el.className = "token" + (t.kind === "space" ? " token--space" : "");
      el.style.animationDelay = i * 18 + "ms";
      const label = t.kind === "space" ? "␣".repeat(t.text.length) : escapeHtml(t.display);
      el.innerHTML = `${label}<span class="token__id">${t.id}</span>`;
      out.appendChild(el);
    });

    const chars = [...text].length;
    const nTok = tokens.length;
    const ratio = nTok ? (chars / nTok).toFixed(1) : "0";
    stats.innerHTML = `
      <div class="tok-stat"><b class="accent">${nTok}</b> token</div>
      <div class="tok-stat"><b>${chars}</b> caratteri</div>
      <div class="tok-stat"><b>${ratio}</b> caratteri/token</div>`;
  }

  input.addEventListener("input", render);
  document.querySelectorAll("[data-tok-example]").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.getAttribute("data-tok-example");
      render();
    });
  });
  render();
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
