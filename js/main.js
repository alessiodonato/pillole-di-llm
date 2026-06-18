import { initHero } from "./hero.js";
import { initPipeline } from "./pipeline.js";
import { initTokenizer } from "./tokenizer.js";
import { initEmbedding } from "./embedding.js";
import { initPosenc } from "./posenc.js";
import { initAttention } from "./attention.js";
import { initMultihead } from "./multihead.js";
import { initBlock } from "./block.js";
import { initStack } from "./stack.js";
import { initOutput, initLoop } from "./output.js";
import { initTraining } from "./train.js";
import { initFinetune } from "./finetune.js";
import { initReasoning } from "./reason.js";
import { initInterpret } from "./interpret.js";
import { initInference } from "./inference.js";
import { initRag } from "./rag.js";
import { initGlossary } from "./glossary.js";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const TOC_LABELS = {
  panoramica: "Panoramica",
  tokenizzazione: "Tokenizzazione",
  embedding: "Embedding",
  posizione: "Posizione",
  attention: "Self-attention",
  multihead: "Multi-head",
  blocco: "Blocco",
  profondita: "Profondità",
  predizione: "Predizione",
  insieme: "Tutto insieme",
  addestramento: "Addestramento",
  finetuning: "Fine-tuning e RLHF",
  reasoning: "Reasoning",
  interpretabilita: "Interpretabilità",
  "inferenza-locale": "Inferenza locale",
  rag: "RAG",
  glossario: "Glossario",
  risorse: "Risorse",
};

function ready(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

ready(() => {
  // --- inizializza tutte le sezioni ---
  initHero();
  initPipeline();
  initTokenizer();
  initEmbedding();
  initPosenc();
  initAttention();
  initMultihead();
  initBlock();
  initStack();
  initOutput();
  initLoop();
  initTraining();
  initFinetune();
  initReasoning();
  initInterpret();
  initInference();
  initRag();
  initGlossary();

  buildIndex();
  setupNav();
  setupReveal();
  setupProgress();
});

// --- indice laterale + numerazione automatica ---
function buildIndex() {
  const main = document.querySelector(".shell__main");
  const toc = document.getElementById("toc");
  if (!main || !toc) return;

  // numerazione progressiva delle sezioni (01, 02, …)
  main.querySelectorAll(":scope > .section").forEach((sec, i) => {
    const num = sec.querySelector(".section__num");
    if (num) num.textContent = String(i + 1).padStart(2, "0");
  });

  // numerazione delle parti (Parte I, II, …; la parte "Riferimento" è speciale)
  let pIndex = 0;
  main.querySelectorAll(":scope > .part").forEach((part) => {
    const kicker = part.querySelector(".part__kicker");
    if (part.classList.contains("part--ref")) {
      if (kicker) kicker.textContent = "Riferimento";
    } else {
      pIndex++;
      if (kicker) kicker.textContent = "Parte " + (ROMAN[pIndex] || pIndex);
    }
  });

  // costruzione dell'indice percorrendo i figli in ordine
  const frag = document.createDocumentFragment();
  let links = null;
  [...main.children].forEach((el) => {
    if (el.classList.contains("part")) {
      const group = document.createElement("div");
      group.className = "toc__group";
      group.dataset.part = el.id;
      const isRef = el.classList.contains("part--ref");
      const kicker = el.querySelector(".part__kicker")?.textContent || "";
      const name = el.querySelector(".part__title")?.textContent || "";
      const title = document.createElement("p");
      title.className = "toc__group-title";
      title.innerHTML = isRef ? `<b>${name}</b>` : `<b>${kicker}</b> · ${name}`;
      group.appendChild(title);
      links = document.createElement("div");
      links.className = "toc__links";
      group.appendChild(links);
      frag.appendChild(group);
    } else if (el.classList.contains("section") && links) {
      const id = el.id;
      const label = TOC_LABELS[id] || el.querySelector(".section__title")?.textContent || id;
      const numTxt = el.querySelector(".section__num")?.textContent || "";
      const a = document.createElement("a");
      a.href = "#" + id;
      a.className = "toc__link";
      a.dataset.target = id;
      a.innerHTML = `<span class="toc__n">${numTxt}</span><span class="toc__t">${label}</span>`;
      links.appendChild(a);
    }
  });
  toc.appendChild(frag);
}

// --- navigazione ---
function setupNav() {
  const nav = document.getElementById("nav");
  const menuBtn = document.getElementById("menuBtn");
  const links = document.querySelector(".nav__links");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 30);
  });

  menuBtn?.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  links?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      menuBtn?.setAttribute("aria-expanded", "false");
    })
  );

  // evidenzia la sezione attiva nel menu in alto e nell'indice laterale
  const allLinks = [...document.querySelectorAll(".nav__links a, .toc__link")];
  const groups = [...document.querySelectorAll(".toc__group")];
  const map = new Map(); // sezione -> [link, …]
  allLinks.forEach((a) => {
    const id = a.dataset.target || a.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (!sec) return;
    if (!map.has(sec)) map.set(sec, []);
    map.get(sec).push(a);
  });
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        allLinks.forEach((l) => l.classList.remove("is-active"));
        groups.forEach((g) => g.classList.remove("is-active"));
        const active = map.get(e.target) || [];
        active.forEach((l) => l.classList.add("is-active"));
        active.find((l) => l.classList.contains("toc__link"))
          ?.closest(".toc__group")?.classList.add("is-active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  map.forEach((_, sec) => spy.observe(sec));
}

// --- reveal on scroll ---
function setupReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

// --- barra di avanzamento ---
function setupProgress() {
  const bar = document.getElementById("scrollProgress");
  const update = () => {
    const sc = document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (sc / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", update);
  update();
}
