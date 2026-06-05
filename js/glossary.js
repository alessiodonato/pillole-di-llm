const TERMS = [
  ["LLM", "Large Language Model: una rete neurale enorme addestrata a prevedere il token successivo su grandi quantità di testo."],
  ["Token", "L'unità minima che il modello elabora: un frammento di testo (parola, parte di parola o simbolo) preso da un vocabolario fisso."],
  ["Vocabolario", "L'insieme finito di tutti i token che il modello conosce, tipicamente decine di migliaia."],
  ["Embedding", "Il vettore di numeri che rappresenta un token; codifica il suo significato come posizione in uno spazio."],
  ["BPE", "Byte-Pair Encoding: l'algoritmo che costruisce il vocabolario unendo iterativamente le coppie di caratteri più frequenti."],
  ["Positional encoding", "Il segnale aggiunto agli embedding per informare il modello sulla posizione di ogni token nella sequenza."],
  ["Attention", "Il meccanismo con cui ogni token pesa e aggrega l'informazione degli altri token rilevanti."],
  ["Self-attention", "Attention applicata alla stessa sequenza: i token guardano sé stessi e gli altri token della frase."],
  ["Query, Key, Value", "I tre vettori derivati da ogni token: la Query cerca, le Key vengono confrontate, i Value portano l'informazione."],
  ["Softmax", "La funzione che trasforma un insieme di punteggi in probabilità positive che sommano a 1."],
  ["Multi-head attention", "L'uso di più meccanismi di attention in parallelo, ciascuno specializzato in relazioni diverse."],
  ["Causale", "Proprietà dei modelli tipo GPT: ogni token può guardare solo sé stesso e i token precedenti, mai quelli futuri."],
  ["Feed-forward", "La piccola rete neurale applicata a ogni token dentro un blocco; contiene gran parte dei parametri."],
  ["Connessione residua", "La somma dell'input di un sotto-strato al suo output, che preserva il segnale e facilita l'addestramento profondo."],
  ["Layer normalization", "La normalizzazione dei valori di un vettore per stabilizzare e velocizzare l'apprendimento."],
  ["Blocco Transformer", "L'unità ripetuta composta da attention, feed-forward e le rispettive add & norm."],
  ["Logit", "Il punteggio grezzo (non normalizzato) assegnato a ogni token del vocabolario prima della softmax."],
  ["Temperatura", "Il parametro che regola la casualità del campionamento: bassa = prevedibile, alta = creativo."],
  ["Parametri", "I numeri (pesi) appresi durante l'addestramento; i modelli moderni ne hanno miliardi."],
  ["Inferenza", "La fase in cui il modello, già addestrato, genera testo prevedendo un token alla volta."],
  ["Contesto", "La finestra di token che il modello può considerare contemporaneamente per fare la predizione."],
];

export function initGlossary() {
  const list = document.getElementById("glossList");
  const search = document.getElementById("glossSearch");
  if (!list) return;

  TERMS.sort((a, b) => a[0].localeCompare(b[0], "it"));
  const items = TERMS.map(([term, def]) => {
    const el = document.createElement("dl");
    el.className = "gterm";
    el.innerHTML = `<dt>${term}</dt><dd>${def}</dd>`;
    el.dataset.search = (term + " " + def).toLowerCase();
    list.appendChild(el);
    return el;
  });

  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    items.forEach((el) => el.classList.toggle("is-hidden", q && !el.dataset.search.includes(q)));
  });
}
