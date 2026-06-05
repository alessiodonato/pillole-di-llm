const NODES = [
  { id: "in", cls: "bnode--io", title: "Input", sub: "vettori dei token", explain: {
    h: "Input del blocco",
    p: ["Arriva una sequenza di vettori, uno per token. Ogni blocco riceve l'output del precedente e lo migliora un po'.",
        "La dimensione resta costante in tutta la pila: questo permette di impilare i blocchi all'infinito."] } },
  { id: "attn", cls: "bnode--attn", title: "Multi-Head Attention", sub: "i token comunicano", explain: {
    h: "Self-Attention",
    p: ["Qui i token si scambiano informazione: ciascuno aggiorna il proprio vettore guardando gli altri (causalmente, solo i precedenti).",
        "È l'unico punto in cui i token \"si parlano\". Tutto il resto agisce su ogni token in modo indipendente."] } },
  { id: "norm1", cls: "bnode--norm", title: "Add & Norm", sub: "residuo + normalizzazione", explain: {
    h: "Connessione residua + LayerNorm",
    p: ["L'output dell'attention viene sommato all'input (connessione residua): così il segnale originale non si perde mai e i gradienti scorrono bene anche in reti profonde.",
        "La normalizzazione mantiene i valori in un intervallo stabile, rendendo l'addestramento più rapido e robusto."] } },
  { id: "ffn", cls: "bnode--ffn", title: "Feed-Forward", sub: "elaborazione per-token", explain: {
    h: "Rete Feed-Forward (MLP)",
    p: ["Una piccola rete neurale applicata indipendentemente a ogni token: espande il vettore (di solito ×4), applica una non-linearità e lo ricomprime.",
        "Qui il modello \"pensa\" sul singolo token e immagazzina gran parte della conoscenza appresa: è dove vive la maggior parte dei parametri."] } },
  { id: "norm2", cls: "bnode--norm", title: "Add & Norm", sub: "residuo + normalizzazione", explain: {
    h: "Secondo Add & Norm",
    p: ["Come prima: l'output della feed-forward si somma al suo input e viene normalizzato.",
        "Questa coppia attention→FFN, ciascuna con residuo e norm, è lo schema che si ripete in ogni blocco."] } },
  { id: "out", cls: "bnode--io", title: "Output", sub: "vettori raffinati", explain: {
    h: "Output del blocco",
    p: ["Escono gli stessi token, ma con vettori arricchiti dal contesto.",
        "Questo output diventa l'input del blocco successivo. Ripetendo, le rappresentazioni diventano sempre più astratte."] } },
];

export function initBlock() {
  const diagram = document.getElementById("blockDiagram");
  const explain = document.getElementById("blockExplain");
  if (!diagram) return;

  NODES.forEach((node, i) => {
    const el = document.createElement("div");
    el.className = "bnode " + node.cls;
    el.innerHTML = `${node.title}<small>${node.sub}</small>`;
    el.addEventListener("click", () => {
      diagram.querySelectorAll(".bnode").forEach((n) => n.classList.remove("is-active"));
      el.classList.add("is-active");
      explain.innerHTML = `<h4>${node.explain.h}</h4>` + node.explain.p.map((p) => `<p>${p}</p>`).join("");
    });
    diagram.appendChild(el);
    if (i < NODES.length - 1) {
      const conn = document.createElement("div");
      conn.className = "bconn";
      diagram.appendChild(conn);
    }
  });
}
