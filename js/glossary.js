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
  ["Interpretabilità", "Il campo che studia cosa rappresentano e come «ragionano» i modelli internamente, per capirli e renderli più sicuri."],
  ["Superposizione", "La capacità di un modello di codificare più concetti di quanti neuroni abbia, sovrapponendoli nello stesso spazio."],
  ["Polisemantico", "Detto di un neurone che si attiva per concetti diversi e scollegati, e quindi è difficile da interpretare."],
  ["Sparse autoencoder", "Una rete che scompone le attivazioni interne in tante feature di cui poche attive, spesso interpretabili una per una."],
  ["Feature", "Una direzione interpretabile estratta dalle attivazioni, che corrisponde a un concetto riconoscibile (es. «riferimenti a felini»)."],
  ["Motore di inferenza", "Il software che carica i pesi di un modello ed esegue il calcolo per generare testo, in locale o su server."],
  ["Quantizzazione", "Rappresentare i pesi del modello con meno bit (es. 2 o 4 invece di 16) per ridurne drasticamente la dimensione, con un piccolo calo di qualità."],
  ["KV cache", "La memoria di lavoro dell'attention: i vettori Key e Value già calcolati per i token del contesto, riusati per non rifare i conti a ogni passo."],
  ["Mixture of Experts", "Architettura in cui, per ogni token, si attiva solo un sottoinsieme di «esperti» (sotto-reti), dando tanti parametri a costo di calcolo ridotto."],
  ["Pre-addestramento", "La prima e più lunga fase: il modello impara a prevedere il token successivo su enormi quantità di testo, acquisendo lingua, fatti e capacità generali."],
  ["Loss", "La misura dell'errore del modello: quanto la sua previsione si discosta dalla risposta corretta. Addestrare significa ridurla."],
  ["Discesa del gradiente", "L'algoritmo che aggiusta i parametri a piccoli passi nella direzione che riduce la loss."],
  ["Backpropagation", "Il metodo che calcola quanto ciascun parametro ha contribuito all'errore, propagando il segnale all'indietro nella rete."],
  ["Learning rate", "La dimensione del passo della discesa del gradiente: troppo piccolo è lento, troppo grande rende l'addestramento instabile."],
  ["Fine-tuning", "L'addestramento aggiuntivo di un modello già pre-addestrato su dati più specifici, per specializzarlo o renderlo più utile."],
  ["Instruction tuning", "Il fine-tuning su esempi di istruzione e risposta, che insegna al modello a seguire le richieste invece di limitarsi a completare il testo."],
  ["RLHF", "Reinforcement Learning from Human Feedback: l'allineamento del modello alle preferenze umane tramite un modello di ricompensa appreso dalle scelte delle persone."],
  ["Modello di ricompensa", "Una rete che impara a dare un punteggio alle risposte, stimando quanto un umano le preferirebbe; guida l'allineamento nel RLHF."],
  ["Chain-of-thought", "La tecnica per cui il modello scrive i passaggi intermedi del ragionamento prima della risposta finale, migliorando l'accuratezza sui problemi complessi."],
  ["Test-time compute", "L'idea di far «pensare» di più il modello al momento della risposta (più passaggi o tentativi) per ottenere risultati migliori, a costo di più calcolo."],
  ["RAG", "Retrieval-Augmented Generation: recuperare prima i documenti pertinenti da una base di conoscenza e poi generare la risposta basandosi su di essi."],
  ["Ricerca semantica", "La ricerca che confronta i significati invece delle parole esatte, misurando la vicinanza tra gli embedding di query e documenti."],
  ["Allucinazione", "Quando il modello produce informazioni plausibili ma false, perché completa il testo in modo convincente anche quando non «sa» la risposta."],
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
