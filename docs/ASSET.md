# Gli asset

Ogni immagine che serve al gioco fino alla tappa 4: misura, fotogrammi, quando entra e se è pronta. In cima c'è il budget, cioè il tetto che l'arte non deve superare. Autori e licenze stanno in [CREDITS.md](../CREDITS.md), come è nato lo stile nel [diario della tappa 0](tappe/tappa-0.md).

Scritta alla tappa 0, il 7 novembre 2026, e portata nel repository il 10 novembre 2026. Si aggiorna ogni volta che un'immagine entra, cambia o esce.

## Contenuti
- Il budget: le regole che fanno da tetto
- La palette Lampione: i 24 colori
- Nel repository oggi: i file che ci sono davvero
- Tutti gli asset fino alla tappa 4: la tabella
- I caratteri
- I conti
- Cosa manca
- Da dove arrivano

## Il budget
Il tetto serve perché l'arte, da sola, non finisce mai.

- **Griglia.** Personaggi, oggetti e caselle a 16×16 pixel. Capi ed effetti degli attacchi a 32×32.
- **Fotogrammi.** Il gatto fermo più quattro passi. Due per ogni nemico e per ogni capo. Tre per ogni attacco: parte, colpisce, svanisce. Due per gli oggetti a terra: fermo, luccica. Uno per caselle e icone.
- **Verso.** Tutti guardano a destra e si specchiano per andare a sinistra. Nessun disegno in più per l'altro verso.
- **Colori.** Solo i 24 della palette Lampione.
- **Ombre.** Non stanno negli sprite. Le disegna il gioco, uguali per tutti: una striscia color fuga sotto i piedi.
- **Una cosa nuova** entra solo togliendone un'altra, oppure va tra le idee per dopo la versione 1.0.

## La palette Lampione
Blu ardesia freddo per la città, ambra solo dove arriva un lampione, l'arancione del gatto come colore più caldo della scena. I nemici stanno su grigi, marroni e lilla.

| Gruppo | Colori |
|---|---|
| Terreno | fuga `#1c2133`, pietra scura `#2c3550`, pietra `#3d4867`, pietra in luce `#56638a`, pietra al lampione `#8a7865` |
| Luci e città | lampadina `#fff4c2`, luce calda `#ffc85a`, Tevere `#172a45`, riflesso `#3c7896` |
| Gatto | inchiostro `#0e0c16` (il contorno di 1 pixel), arancio scuro `#b4471a`, arancio `#f5841f`, arancio chiaro `#ffb547`, crema `#fff0d6`. Gli occhi sono gialli come la lampadina |
| Colpi | graffio `#6ff2ff`, bianco `#ffffff` |
| Nemici | piccione `#9a9cc0`, collo cangiante `#57c0a8`, pantegana `#7e5b4f`, rosa `#f08aa0`, cornacchia `#3f4f8f`, rosso `#e23a4f`, ali `#cfe0ff` |
| Da raccogliere | verde lime `#a6f05a`: la crocchetta e la barra dell'esperienza |

Una regola che viene dai colori: nel gioco il verde vuol dire «raccoglilo». L'interfaccia non ha colori suoi: testo bianco, pannelli color fuga, vita in rosso.

## Nel repository oggi
I file che ci sono, in `public/assets/`. Il 10 novembre 2026 un controllo ha contato i colori di ognuno: sono tutti dentro i 24 della palette, senza pixel semitrasparenti.

| File | Misura | Cosa contiene |
|---|---|---|
| `gatto.png` | 80×16 | Cinque fotogrammi da 16×16 in fila: fermo e quattro passi |
| `casella.png` | 16×16 | I sampietrini, che si ripetono senza cuciture. Dal 12 novembre 2026 con un tono in meno di contrasto (`art/sampietrini_calmi.py`, gli originali in `art/originali/`) |
| `tombino.png` | 16×16 | Il tombino, con le pietre intorno calmate come i sampietrini |
| `erba.png` | 16×16 | I sampietrini con due ciuffi d'erba e una crepa, al posto delle foglie di platano, che sembravano cuori. La disegna `art/erba.py` partendo da `casella.png` |
| `lampione.png` | 96×72 | Il lampione intero: palo, alone e pozza di luce in una scena sola |
| `piccione.png` | 32×16 | Due fotogrammi da 16×16: i due passi (tappa 2) |
| `graffio.png` | 96×32 | Tre fotogrammi da 32×32: parte, colpisce, svanisce (tappa 2) |
| `crocchetta.png` | 32×16 | Due fotogrammi da 16×16: ferma e che brilla (pronta per la tappa 3a) |
| `coda.png` | 96×32 | Tre fotogrammi da 32×32 della coda a frusta (pronta per la tappa 3a) |
| `pelo.png` | 96×32 | Tre fotogrammi da 32×32 del pelo che vola (tappa 3a) |
| `vita.png` | 9×8 | Il cuore delle sette vite (tappa 3b) |
| `uccisioni.png` | 16×16 | L'icona dei piccioni presi (tappa 3b) |
| `titolo.png` | 480×270 | Lo sfondo del titolo, Roma di notte (tappa 3b) |
| `alba.png` | 480×270 | Lo sfondo della fine, l'alba su Roma (tappa 3b) |
| `carte.png` | 64×16 | Quattro icone provvisorie da 16×16: zampe veloci, pancia piena, unghie affilate, naso fino. Le disegna `art/icone_carte.py`, non vengono dalle tavole |
| `cassa.png` | 32×16 | La cassa del tesoro provvisoria, due fotogrammi da 16×16: ferma, luccica. La disegna `art/cassa.py`, non viene dalle tavole |
| `zanzara.png` | 32×16 | Due fotogrammi da 16×16: ali alzate, ali abbassate (tappa 4) |
| `pantegana.png` | 32×16 | Due fotogrammi da 16×16: i due passi della corsa (tappa 4) |
| `cornacchia.png` | 32×16 | Due fotogrammi da 16×16: in volo, in picchiata (tappa 4) |
| `gabbiano.png` | 64×32 | Due fotogrammi da 32×32: ali alzate, ali abbassate (tappa 4) |
| `gabbiano-reale.png` | 64×32 | Due fotogrammi da 32×32: fermo, urla. Il pezzetto di pietra tra le zampe lo toglie lo script, due pixel per fotogramma (tappa 4) |
| `miagolio.png` | 96×32 | Tre fotogrammi da 32×32 del miagolio: un anello che parte, si allarga, svanisce (tappa 4) |

In più `public/favicon.png`, 64×64: il gatto fermo ingrandito 4 volte, per la scheda del browser. Dalla tappa 2 gli sprite nuovi escono dalle tavole con `art/sprite_dalle_tavole.py`, che controlla anche i colori: il 12 novembre 2026 tutti dentro i 24 della palette, senza pixel semitrasparenti, e lo stesso il 13 novembre con i tre nemici, i due capi e il miagolio della tappa 4.

## Tutti gli asset fino alla tappa 4
La tappa è la prima che usa l'asset. «Pronto» vuol dire disegnato e ripulito, non ancora per forza nel repository: ci entra alla sua tappa.

| Asset | Misura | Fotogrammi | Tappa | Stato |
|---|---|---|---|---|
| Gatto arancione | 16×16 | 5: fermo, 4 passi | 1a | nel repository |
| Sampietrini | 16×16 | 1 | 1a | nel repository |
| Tombino | 16×16 | 1 | 1a come decorazione, 4 nel gioco | nel repository |
| Erba tra i sampietrini (prima: foglie di platano) | 16×16 | 1 | 1a come decorazione, 4 nel gioco | nel repository, provvisoria da `art/erba.py` |
| Lampione: palo, alone, pozza di luce | scena 96×72 | 1 per pezzo | 1a intero, 4 in tre pezzi | nel repository intero; da separare in tre pezzi |
| Piccione | 16×16 | 2: testa avanti, testa indietro | 2 | nel repository |
| Graffio | 32×32 | 3 | 2 | nel repository |
| Joystick | disegnato dal codice | | 2 | nel gioco: un cerchio e un pallino, sotto il pollice |
| Barre della vita e dell'esperienza, pannelli | disegnati dal codice | | 2 | nel gioco: vita, esperienza e le carte della scelta |
| Crocchetta a pesciolino | 16×16 | 2: ferma, luccica | 3a | nel repository |
| Coda a frusta | 32×32 | 3 | 3a | nel repository |
| Pelo che vola | 32×32 | 3 | 3a | nel repository |
| Icone delle carte: 4 armi, 8 passivi | 16×16 | 1 | 3a | da fare: 12. Per ora le armi usano un fotogramma del loro effetto |
| Icona della vita | 9×8 | 1 | 3a | nel repository dalla tappa 3b, presa così com'è |
| Icona delle uccisioni | 16×16 | 1 | 3b | nel repository |
| Sfondi del titolo (Roma di notte) e della fine (l'alba) | 480×270 | 1 | 3b | nel repository, usati interi |
| Zanzara | 16×16 | 2: ali su, ali giù | 4 | nel repository |
| Pantegana | 16×16 | 2: corsa | 4 | nel repository |
| Cornacchia grigia | 16×16 | 2: in volo, in picchiata | 4 | nel repository |
| Gabbiano, capo del quinto minuto | 32×32 | 2: ali su, ali giù | 4 | nel repository |
| Gabbiano reale, capo del decimo minuto | 32×32 | 2: fermo, urla | 4 | nel repository, senza il pezzetto di pietra tra le zampe |
| Supplì | 16×16 | 2: con il filo, con la croce della cura | 4 | pronto |
| Miagolio | 32×32 | 3 | 4 | nel repository. Nel gioco si ingrandisce fino al raggio dell'onda |

## I caratteri
Jersey 10 per le parole (titoli, nomi, carte, pulsanti) e Silkscreen per numeri ed etichette, mai in grassetto. Dalla tappa 2 nel gioco c'è Silkscreen, in `public/fonts/`, usato per ora anche per le parole; Jersey 10 non c'è ancora (vedi `DECISIONI.md`).

Alla tappa 0 si è visto che il testo disegnato dal browser ha sempre i bordi sfumati, a ogni misura provata, da 8 a 48 pixel. Per avere pixel pieni o vuoti la strada pulita è un carattere bitmap: le lettere preparate una volta sola, come immagine. Resta da valutare quando entra il primo testo, insieme alle licenze dei due caratteri, che vanno lette e scritte in `CREDITS.md`.

## I conti
- **Immagini fino alla tappa 4:** 5 del gatto, 8 dei nemici, 4 dei capi, 4 degli oggetti, 12 degli attacchi, 3 caselle, 3 pezzi del lampione, 12 icone delle carte, 2 icone dell'interfaccia. In tutto **53**.
- **Pronte o quasi:** 38, cioè tutte tranne le 12 icone delle carte e i 3 pezzi del lampione da separare. Nelle 38 resta un ritocco da guardare, l'icona della vita; quello del gabbiano reale è fatto. I due sfondi delle schermate sono fuori dal conto.
- **Nel repository:** 22 file. Valgono 36 delle 53 immagini (i 5 fotogrammi del gatto, le 3 caselle, gli 8 dei quattro nemici, i 4 dei due capi, i 2 della crocchetta, i 12 di graffio, coda a frusta, pelo che vola e miagolio, le icone della vita e delle uccisioni), più il lampione intero, i due sfondi delle schermate, le quattro icone provvisorie dei potenziamenti e la cassa del tesoro provvisoria, che stanno fuori dal conto.

## Cosa manca
1. Le 12 icone delle carte. Per ora le armi usano un fotogramma del loro effetto e i potenziamenti le icone provvisorie di `art/icone_carte.py`.
2. Il lampione diviso in palo, alone e pozza, per la tappa 4.
3. Uno sguardo all'icona della vita. Il pezzetto di pietra tra le zampe del gabbiano reale è tolto dal 13 novembre 2026.
4. La cassa del tesoro: per ora quella provvisoria di `art/cassa.py`.
5. Jersey 10 per i titoli; Silkscreen c'è dalla tappa 2.
6. Fatto alla tappa 2: lo spacchettatore delle tavole e il controllo dei colori sono in `art/sprite_dalle_tavole.py`.
7. L'audio non è in questa lista: è della tappa 5.

## Da dove arrivano
Tutta la grafica è stata disegnata per questo gioco con uno strumento di disegno con l'IA, in due file di tavole che stanno fuori dal repository. Gli sprite sono stati presi dai file delle tavole pixel per pixel, non dalle schermate. Sotto ogni sprite le tavole avevano i sampietrini e un'ombra: sono stati tolti, lasciando pieni i buchi dentro i corpi. Per questo le ombre le disegna il gioco.
