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
import { initInterpret } from "./interpret.js";
import { initInference } from "./inference.js";
import { initGlossary } from "./glossary.js";

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
  initInterpret();
  initInference();
  initGlossary();

  setupNav();
  setupReveal();
  setupProgress();
});

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

  // evidenzia la sezione attiva nel menu
  const navLinks = [...document.querySelectorAll(".nav__links a")];
  const map = new Map();
  navLinks.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  });
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("is-active"));
          map.get(e.target)?.classList.add("is-active");
        }
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
