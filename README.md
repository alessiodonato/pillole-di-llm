# Pillole di LLM

> La guida visuale e interattiva, in italiano, per capire come funziona **davvero** un Large Language Model.

**[Apri il sito →](https://alessiodonato.github.io/pillole-di-llm/)**

Token, embedding, positional encoding, self-attention, multi-head, blocco Transformer, stacking e predizione: ogni meccanismo è spiegato a parole semplici e accompagnato da una **visualizzazione con cui puoi giocare**. Niente formule da decifrare a freddo, niente muri di testo: si impara muovendo le cose.

Ispirato a [Transformer Explainer](https://poloclub.github.io/transformer-explainer/) e [bbycroft.net/llm](https://bbycroft.net/llm), ma pensato fin dall'inizio per il pubblico italiano.

---

## Cosa trovi dentro

| Sezione | Cosa imparerai |
|---|---|
| **Tokenizzazione** | Come il testo viene spezzato in token (stile BPE), spazi inclusi |
| **Embedding** | Come ogni token diventa un vettore, e perché parole simili finiscono vicine |
| **Posizione** | Il positional encoding sinusoidale che dà al modello il senso dell'ordine |
| **Attention** | Self-attention causale (stile GPT) con Q/K/V, softmax e mascheramento |
| **Multi-head** | Perché più "teste" guardano la frase da angolazioni diverse |
| **Blocco Transformer** | Attention + feed-forward + residui + normalizzazione, messi insieme |
| **Profondità** | Cosa cambia impilando tanti blocchi uno sull'altro |
| **Predizione** | Da logit a probabilità: softmax, temperatura e campionamento |
| **Tutto insieme** | Il ciclo completo di generazione token dopo token |
| **Glossario** | 20+ termini chiave, cercabili al volo |

---

## Eseguire in locale

Il sito è **HTML, CSS e JavaScript puri**: nessun build step, nessuna dipendenza. Basta servirlo da un piccolo server locale (necessario perché il JS usa ES modules).

```bash
git clone https://github.com/alessiodonato/pillole-di-llm.git
cd pillole-di-llm
python3 -m http.server 8000
```

Poi apri [http://localhost:8000](http://localhost:8000).

---

## Una nota onesta

Le visualizzazioni usano **dati simulati e illustrativi** (numeri generati in modo deterministico), non un modello reale che gira nel browser. Lo scopo è rendere intuitivi i meccanismi, non riprodurre i valori esatti di un LLM. È il modo migliore per *vedere le idee* senza scaricare gigabyte di pesi.

---

## Stack

- HTML / CSS / JavaScript vanilla (ES modules)
- Rendering su `<canvas>` per archi di attention, costellazioni e mappe
- Zero build, deploy diretto su **GitHub Pages**

## Crediti

Creato con cura da [Alessio Donato](https://github.com/alessiodonato).
Ispirazione: [Transformer Explainer](https://poloclub.github.io/transformer-explainer/) (Polo Club of Data Science) e [bbycroft.net/llm](https://bbycroft.net/llm) di Brendan Bycroft.
