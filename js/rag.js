import { heatColor } from "./utils.js";

// Vocabolario di concetti = dimensioni dello spazio semantico (illustrativo).
const TAGS = ["animali", "spazio", "cucina", "storia", "tech", "salute", "musica", "sport"];

// Base di conoscenza: ogni "chunk" è un documento con un profilo semantico.
const KB = [
  { t: "Il gatto domestico discende dal gatto selvatico africano.", v: { animali: 1 } },
  { t: "I leoni vivono in gruppi sociali chiamati branchi.", v: { animali: 1 } },
  { t: "Giove è il pianeta più grande del Sistema Solare.", v: { spazio: 1 } },
  { t: "Marte è detto «pianeta rosso» per l'ossido di ferro sulla superficie.", v: { spazio: 1 } },
  { t: "La carbonara romana si fa con uova, guanciale e pecorino.", v: { cucina: 1 } },
  { t: "La Rivoluzione francese iniziò nel 1789.", v: { storia: 1 } },
  { t: "Una GPU accelera i calcoli paralleli delle reti neurali.", v: { tech: 1 } },
  { t: "Bere acqua a sufficienza aiuta concentrazione e memoria.", v: { salute: 1 } },
  { t: "Il pianoforte moderno ha 88 tasti.", v: { musica: 1 } },
  { t: "La maratona olimpica misura 42,195 km.", v: { sport: 1 } },
];

// Sinonimi -> concetto, per interpretare query in testo libero.
const SYN = {
  animali: ["gatto", "gatti", "felino", "felini", "leone", "leoni", "animale", "animali", "cane", "micio"],
  spazio: ["pianeta", "pianeti", "spazio", "sistema solare", "giove", "marte", "stella", "astronomia"],
  cucina: ["cucina", "ricetta", "primo piatto", "pasta", "carbonara", "mangiare", "cucinare", "romano"],
  storia: ["storia", "rivoluzione", "guerra", "secolo", "anno", "passato", "1789"],
  tech: ["ia", "intelligenza artificiale", "gpu", "computer", "rete neurale", "calcolo", "scheda video", "modello"],
  salute: ["salute", "acqua", "bere", "memoria", "concentrazione", "benessere", "corpo"],
  musica: ["musica", "pianoforte", "tasti", "strumento", "suono", "note"],
  sport: ["sport", "maratona", "corsa", "olimpico", "chilometri", "gara"],
};

const EXAMPLES = [
  { q: "Cosa mangia un felino?", a: "Un felino come il gatto è un carnivoro; i documenti recuperati descrivono gatti e leoni." },
  { q: "Qual è il pianeta più grande?", a: "È Giove, il più grande del Sistema Solare, come indicano i documenti sullo spazio." },
  { q: "Come preparo un primo piatto romano?", a: "Una scelta classica è la carbonara, con uova, guanciale e pecorino." },
  { q: "Cosa serve per far girare un'IA?", a: "Servono molti calcoli paralleli: una GPU, come spiega il documento di tecnologia." },
];

export function initRag() {
  const input = document.getElementById("ragInput");
  const chipsEl = document.getElementById("ragChips");
  const listEl = document.getElementById("ragList");
  const ctxEl = document.getElementById("ragContext");
  const ansEl = document.getElementById("ragAnswer");
  if (!input || !listEl) return;

  function queryVector(text) {
    const low = text.toLowerCase();
    const v = {};
    TAGS.forEach((tag) => {
      let s = 0;
      SYN[tag].forEach((w) => {
        // confronto per parola intera: evita falsi positivi (es. «ia» dentro «mangia»)
        const re = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
        if (re.test(low)) s += 1;
      });
      if (s > 0) v[tag] = s;
    });
    return v;
  }

  function cosine(a, b) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    TAGS.forEach((tag) => {
      const x = a[tag] || 0;
      const y = b[tag] || 0;
      dot += x * y;
      na += x * x;
      nb += y * y;
    });
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  function run(text, curatedAnswer) {
    const qv = queryVector(text);
    const ranked = KB.map((c, i) => ({ i, c, s: cosine(qv, c.v) })).sort((a, b) => b.s - a.s);
    const hasMatch = ranked[0].s > 0;
    const top = hasMatch ? ranked.filter((r) => r.s > 0).slice(0, 3) : [];

    listEl.innerHTML = "";
    ranked.forEach(({ c, s }, rank) => {
      const isTop = hasMatch && rank < top.length && s > 0;
      const row = document.createElement("div");
      row.className = "rag-doc" + (isTop ? " rag-doc--hit" : "");
      row.innerHTML =
        `<span class="rag-doc__bar"><span class="rag-doc__fill" style="width:${(s * 100).toFixed(0)}%;background:${heatColor(s)}"></span></span>` +
        `<span class="rag-doc__txt">${c.t}</span>` +
        `<span class="rag-doc__score">${s.toFixed(2)}${isTop ? " ·recuperato" : ""}</span>`;
      listEl.appendChild(row);
    });

    if (!hasMatch) {
      ctxEl.innerHTML = `<span class="rag-empty">Nessun documento abbastanza vicino. Il modello risponderebbe solo con ciò che ha in memoria, col rischio di inventare.</span>`;
      ansEl.classList.remove("is-on");
      ansEl.innerHTML = "";
      return;
    }

    ctxEl.innerHTML = top
      .map(({ c }) => `<span class="rag-chunk">${c.t}</span>`)
      .join("");
    ansEl.innerHTML =
      `<span class="rag-answer__lab">Risposta del modello</span>` +
      `<span class="rag-answer__txt">${curatedAnswer || "In base ai documenti recuperati qui sopra, il modello compone una risposta fondata su fonti, invece di affidarsi alla sola memoria."}</span>`;
    ansEl.classList.add("is-on");
  }

  EXAMPLES.forEach((ex) => {
    const b = document.createElement("button");
    b.className = "chip-btn";
    b.textContent = ex.q;
    b.addEventListener("click", () => {
      input.value = ex.q;
      run(ex.q, ex.a);
    });
    chipsEl.appendChild(b);
  });

  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => run(input.value, null), 200);
  });

  input.value = EXAMPLES[0].q;
  run(EXAMPLES[0].q, EXAMPLES[0].a);
}
