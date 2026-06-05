export function initStack() {
  const slider = document.getElementById("stackN");
  const viz = document.getElementById("stackViz");
  const info = document.getElementById("stackInfo");
  const val = document.getElementById("stackVal");
  if (!slider || !viz) return;

  function render() {
    const n = parseInt(slider.value, 10);
    val.textContent = n;
    viz.innerHTML = "";
    const shown = Math.min(n, 40); // limite visivo
    for (let i = 0; i < shown; i++) {
      const layer = document.createElement("div");
      layer.className = "stack-layer";
      if (i === 0) layer.classList.add("stack-layer--first");
      if (i === shown - 1 && n === shown) layer.classList.add("stack-layer--last");
      layer.style.animationDelay = i * 12 + "ms";
      viz.appendChild(layer);
    }
    let note;
    if (n <= 6) note = "Pochi blocchi: il modello coglie sintassi e relazioni locali, ma fatica con concetti astratti.";
    else if (n <= 24) note = "Profondità tipica dei modelli medi: emergono rappresentazioni semantiche ricche.";
    else if (n <= 60) note = "Reti profonde: gli strati alti modellano significato, riferimenti a lungo raggio e ragionamento.";
    else note = "Profondità da grandi modelli: ogni strato aggiunge una sfumatura, al costo di enorme potenza di calcolo.";
    info.innerHTML = `<b>${n}</b> blocchi impilati${shown < n ? " (ne mostriamo 40)" : ""}.<br>${note}`;
  }

  slider.addEventListener("input", render);
  render();
}
