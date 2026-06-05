// ============================================================
// Utility condivise: hashing, PRNG, softmax, tokenizer, colori
// ============================================================

// hash deterministico FNV-1a -> uint32
export function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// PRNG seedabile (mulberry32)
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// vettore pseudo-casuale deterministico da una stringa
export function pseudoVector(key, dim) {
  const rnd = mulberry32(hash32(key));
  const v = new Array(dim);
  for (let i = 0; i < dim; i++) {
    // approssimazione gaussiana (somma di uniformi) per valori in ~[-1,1]
    v[i] = (rnd() + rnd() + rnd() - 1.5) / 1.5;
  }
  return v;
}

export function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function softmax(arr, temp = 1) {
  const t = Math.max(temp, 1e-6);
  const scaled = arr.map((x) => x / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((x) => x / sum);
}

// scelta pesata da un PRNG
export function weightedPick(probs, rnd = Math.random) {
  const r = rnd();
  let acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (r <= acc) return i;
  }
  return probs.length - 1;
}

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const lerp = (a, b, t) => a + (b - a) * t;

// ---------- colori ----------
// scala divergente: viola (negativo) -> scuro -> ambra (positivo); v in [-1,1]
export function divergingColor(v) {
  v = clamp(v, -1, 1);
  const dark = [22, 28, 40];
  const neg = [157, 140, 255];
  const pos = [255, 180, 84];
  let c;
  if (v < 0) c = mix(dark, neg, -v);
  else c = mix(dark, pos, v);
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// scala sequenziale per intensità (attention): scuro -> ciano -> ambra; t in [0,1]
export function heatColor(t) {
  t = clamp(t, 0, 1);
  const c0 = [14, 19, 29];
  const c1 = [31, 185, 199];
  const c2 = [255, 180, 84];
  let c;
  if (t < 0.6) c = mix(c0, c1, t / 0.6);
  else c = mix(c1, c2, (t - 0.6) / 0.4);
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function mix(a, b, t) {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

// ---------- tokenizer euristico (stile BPE semplificato) ----------
// Restituisce [{text, display, id, kind}] dove kind: 'word'|'sub'|'num'|'punct'|'space'
export function tokenize(text) {
  const re = /\s+|[\p{L}\p{M}]+|\d+|[^\s]/gu;
  const segments = text.match(re) || [];
  const tokens = [];
  let prefixSpace = "";

  for (const seg of segments) {
    if (/^\s+$/.test(seg)) {
      // spazio singolo -> si attacca al token successivo; spazi multipli -> token a sé
      if (seg.length === 1) {
        prefixSpace = " ";
      } else {
        tokens.push(makeToken(seg, seg, "space"));
      }
      continue;
    }

    if (/^\d+$/.test(seg)) {
      pushPieces(splitNumber(seg), "num");
      continue;
    }

    if (/^[\p{L}\p{M}]+$/u.test(seg)) {
      pushPieces(splitWord(seg), "word");
      continue;
    }

    // punteggiatura, emoji, simboli
    pushPieces([seg], "punct");
  }

  function pushPieces(pieces, kind) {
    pieces.forEach((p, i) => {
      const withSpace = i === 0 ? prefixSpace + p : p;
      const display = (i === 0 && prefixSpace ? "·" : "") + p;
      tokens.push(makeToken(withSpace, display, pieces.length > 1 ? "sub" : kind));
    });
    prefixSpace = "";
  }

  return tokens;
}

function makeToken(text, display, kind) {
  return { text, display, kind, id: hash32(text) % 50257 };
}

function splitWord(word) {
  if (word.length <= 6) return [word];
  // spezza in sotto-pezzi ~4 caratteri, come farebbe il BPE con parole rare
  const pieces = [];
  let i = 0;
  while (i < word.length) {
    const remaining = word.length - i;
    const size = remaining <= 6 ? remaining : 4;
    pieces.push(word.slice(i, i + size));
    i += size;
  }
  return pieces;
}

function splitNumber(num) {
  if (num.length <= 3) return [num];
  const pieces = [];
  for (let i = 0; i < num.length; i += 3) pieces.push(num.slice(i, i + 3));
  return pieces;
}

// ---------- tooltip condiviso ----------
let tipEl = null;
export function tooltip() {
  if (!tipEl) {
    tipEl = document.createElement("div");
    tipEl.className = "tooltip";
    document.body.appendChild(tipEl);
  }
  return {
    show(x, y, html) {
      tipEl.innerHTML = html;
      tipEl.classList.add("is-visible");
      const pad = 14;
      let left = x + pad;
      let top = y + pad;
      const r = tipEl.getBoundingClientRect();
      if (left + r.width > window.innerWidth) left = x - r.width - pad;
      if (top + r.height > window.innerHeight) top = y - r.height - pad;
      tipEl.style.left = left + "px";
      tipEl.style.top = top + "px";
    },
    hide() {
      tipEl.classList.remove("is-visible");
    },
  };
}
