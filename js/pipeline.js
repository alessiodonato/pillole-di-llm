// Panoramica: diagramma pipeline cliccabile
const STEPS = [
  { name: "Tokenizzazione", desc: "Il testo diventa una sequenza di token (interi).", to: "#tokenizzazione" },
  { name: "Embedding", desc: "Ogni token diventa un vettore di numeri.", to: "#embedding" },
  { name: "Posizione", desc: "Si aggiunge l'informazione sull'ordine.", to: "#posizione" },
  { name: "Attention", desc: "I token si scambiano informazione nel contesto.", to: "#attention" },
  { name: "Blocchi ×N", desc: "Decine di strati raffinano le rappresentazioni.", to: "#blocco" },
  { name: "Predizione", desc: "Si stima la probabilità della prossima parola.", to: "#predizione" },
];

export function initPipeline() {
  const root = document.getElementById("pipeline");
  if (!root) return;
  STEPS.forEach((s, i) => {
    const a = document.createElement("a");
    a.href = s.to;
    a.className = "pstep";
    a.innerHTML = `
      <div class="pstep__idx">FASE ${i + 1}</div>
      <div class="pstep__name">${s.name}</div>
      <div class="pstep__desc">${s.desc}</div>
      ${i < STEPS.length - 1 ? '<div class="pstep__arrow">→</div>' : ""}`;
    root.appendChild(a);
  });
}
