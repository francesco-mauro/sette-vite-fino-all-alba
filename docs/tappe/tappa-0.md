# Tappa 0: stile e asset

L'obiettivo della tappa: sapere com'è il gioco prima di scriverlo. Si chiudono lo stile, la risoluzione e il nome, e si mette un tetto agli asset. In questa tappa non c'è ancora il progetto: ci sono tavole, pagine di prova e scelte.

**Stato: chiusa l'8 novembre 2026.** Il diario è stato scritto nel repository il 10 novembre 2026, dagli appunti di quei due giorni.

## Contenuti
- Cosa c'è di nuovo, giorno per giorno
- Gli strumenti di questa tappa, e perché
- I concetti, in parole semplici
- Cosa è stato difficile
- Cosa abbiamo misurato
- La domanda da colloquio
- Lo spunto per il post
- Fatto

## Cosa c'è di nuovo
- **7 novembre 2026, il progetto sulla carta.** Un gioco survivor in pixel art: un gatto arancione, Roma di notte, ondate di nemici, quindici minuti per arrivare all'alba. Orizzontale, nel browser, anche sul telefono. Il codice in un repository pubblico. Le tappe scritte prima di cominciare, ognuna con il gioco online alla fine.
- **7 novembre 2026, la prima tavola.** Con uno strumento di disegno con l'IA: tre palette da 24 colori (Lampione, Tevere, Trastevere), il gatto a 16×16 fermo e in quattro passi, visto di lato, e una proposta di caratteri. Scelta la palette Lampione.
- **7 novembre 2026, il gatto diventa un file.** Il gatto è stato preso dalla tavola pixel per pixel, scritto come griglie di testo e trasformato in PNG da uno script.
- **7 novembre 2026, la prova sul telefono.** Una pagina di prova con il gatto che cammina sui sampietrini, un joystick che compare dove si appoggia il dito, cento nemici segnaposto e due tasti per cambiare risoluzione: 480×270 oppure 320×180. Scelta 480×270.
- **7 novembre 2026, la seconda tavola.** Sette tavole nuove nella palette Lampione: nemici e capi, oggetti e terreno, attacchi, e le quattro schermate (titolo, partita, carte, fine).
- **7 novembre 2026, i caratteri.** Provati sette caratteri pixel. Restano Jersey 10 per le parole e Silkscreen per i numeri.
- **7 novembre 2026, il nome.** Dieci proposte, poi un controllo sul web. Scelto «Sette vite fino all'alba».
- **7 novembre 2026, la lista degli asset e la prova di coerenza.** La [lista degli asset](../ASSET.md) con il budget. E una seconda pagina di prova, con il gatto, i quattro nemici, i due capi e i quattro attacchi veri, alla misura vera.
- **8 novembre 2026, lo scatto.** La sera prima, sul telefono, la prova di coerenza scattava. Una versione corretta della pagina, una nuova misura, e la tappa si chiude.

## Gli strumenti di questa tappa, e perché
| Strumento | Cosa fa qui | Perché questo |
|---|---|---|
| Uno strumento di disegno con l'IA | Disegna le tavole: palette, sprite, schermate | In un pomeriggio ha dato uno stile intero e coerente da guardare e scegliere, prima di scrivere una riga di codice |
| Griglie di testo e uno script | Portano uno sprite dalla tavola a un PNG | Una griglia di testo si legge, si corregge a mano e si confronta: ogni carattere è un pixel |
| Una pagina di prova da aprire sul telefono | Fa vedere lo stile alla misura vera, sullo schermo vero | Lo stile si giudica dove si giocherà. Sul computer tutto sembra più grande e più leggibile |
| Uno script che conta i colori | Controlla che ogni pixel stia nei 24 colori | La palette regge solo se nessuno sgarra, e a occhio non si vede |
| Google Fonts | I caratteri provati | Si provano subito nel browser, uno accanto all'altro. Le licenze vanno lette quando i caratteri entrano nel gioco |

## I concetti, in parole semplici
1. **Lo stile prima del codice.** Risoluzione, griglia e palette decidono quanto campo si vede, quanto è grande un nemico e quanti nemici stanno sullo schermo. Cambiarle dopo vuol dire ridisegnare tutto e rifare i conti del gioco.
2. **Una palette corta rende il gioco leggibile.** Con 24 colori ogni colore ha un compito. L'arancione del gatto è il colore più caldo della scena, e così il gatto si trova sempre. L'ambra è solo dei lampioni. Il verde vuol dire «raccoglilo». Chi gioca impara i colori in pochi secondi.
3. **Griglia, pose e fotogrammi.** La griglia è la misura di base: qui 16×16 pixel per personaggi e oggetti, 32×32 per i capi. Una posa è un disegno. Un'animazione è una fila di pose mostrate una dopo l'altra, i fotogrammi. Il gatto ne ha cinque: fermo e quattro passi.
4. **Lo specchio.** Ogni personaggio è disegnato una volta sola, rivolto a destra. Per andare a sinistra il gioco lo specchia. Metà dei disegni, lo stesso risultato.
5. **Il foglio di sprite.** I fotogrammi di un personaggio stanno in fila dentro un'immagine sola, e il gioco ne ritaglia uno alla volta. Il gatto è un'immagine da 80×16: cinque riquadri da 16. Quando le immagini saranno tante si potranno riunire in un atlas, un foglio unico con la mappa di dove sta ogni pezzo.
6. **Il tetto.** L'arte non finisce mai da sola: c'è sempre un fotogramma in più da aggiungere. Il budget dice quanti fotogrammi ha ogni cosa, e una cosa nuova entra solo togliendone un'altra.
7. **La misura vera.** Uno sprite da 16 pixel su un telefono è grande pochi millimetri. La domanda giusta è se a quella misura si riconosce, in mezzo alla folla.
8. **Ingrandire di un numero intero.** La scena è piccola, 480×270, e lo schermo è grande. Se si ingrandisce di 4 volte ogni pixel del gioco diventa un quadrato di 4 pixel per lato. Se si ingrandisce di 3,7 volte alcuni pixel vengono larghi 3 e altri 4, e il disegno si deforma.
9. **Un'uscita decisa prima.** Prima della prova di coerenza c'era già scritto cosa fare se andava male: con tre nemici su quattro non riconoscibili si passava a grafica già pronta o a forme semplici, senza insistere. Decidere l'uscita prima evita di affezionarsi a una strada che non funziona.

## Cosa è stato difficile
- **Una parola che cambiava da sola.** Nella prima tavola il titolo «Resisti fino all'alba» si leggeva «Resisti Ano». Era la legatura: il carattere, Pixelify Sans, fonde la «f» e la «i» in un segno solo. Spegnendo le legature si legge «fino». Da allora le legature sono spente in ogni testo.
- **Maiuscole che si confondono.** Nello stesso carattere alcune maiuscole sono quadrate: la Z sembra un 8, la C una O, la G una Q. «Zanzara» si leggeva «8anzara». Non era un errore della tavola, era il carattere. Per questo è uscito, e sono entrati Jersey 10 e Silkscreen. Anche Silkscreen ha il suo limite: in grassetto la B sembra una D, quindi mai in grassetto.
- **Il testo del browser non ha pixel netti.** Nella prova di coerenza le scritte avevano i bordi sfumati, a ogni misura provata, da 8 a 48 pixel. Sul telefono, alla prima prova, non si leggevano bene. La strada pulita per il gioco è un carattere bitmap, da valutare quando entra il primo testo.
- **Sprite con il pavimento attaccato.** Nelle tavole ogni sprite stava sopra i sampietrini, con la sua ombra. Uno script ha tolto pavimento e ombra partendo dal bordo, così i buchi dentro i corpi sono rimasti pieni. Le ombre le disegnerà il gioco, uguali per tutti.
- **Lo scatto sul telefono.** La prova di coerenza scattava. Alla pagina è stato aggiunto un contatore: fotogrammi al secondo, buco più lungo tra due fotogrammi, tempo di calcolo. Il sospetto era l'orologio, che ridisegnava la sua scritta ogni secondo: ora i numeri dell'interfaccia si compongono da lettere già pronte. Nella stessa versione è stato corretto anche il joystick, che in una prova sul computer era rimasto agganciato: la causa più probabile era un rilascio del mouse perso fuori dalla pagina. Lo scatto è sceso. Ma nella stessa versione sono cambiate più cose, quindi i numeri dicono che è sceso, non provano quale fosse la causa.
- **Un nome già preso.** «Fino all'alba» piaceva, ma è il titolo italiano del film Until Dawn, del 2025. «Sette vite fino all'alba» era libero.

## Cosa abbiamo misurato
- **La risoluzione sul telefono di prova.** Chrome su Android. La pagina di prova leggeva uno schermo da 2424×1081 pixel a densità 2,88, e la scena 480×270 ingrandita 4 volte: 1920×1080 pixel veri, con due bande ai lati. Alla tappa 1a quei numeri sono stati corretti: lo schermo è alto 1080 pixel e la densità è 2,875 (vedi il [diario della tappa 1a](tappa-1a.md)).
- **I colori.** Ogni pixel di ogni sprite della seconda tavola sta nei 24 colori della palette.
- **Gli occhi del gatto.** Tra la prima e la seconda tavola sono passati da verde a giallo: 2 pixel per fotogramma, il resto del gatto identico. Il verde è rimasto alla crocchetta.
- **I caratteri.** Su una striscia larga 480 pixel, la larghezza del gioco: Jersey 10 è pulito a 20 e a 32 pixel, Silkscreen a 8 e a 16.
- **Gli asset.** 53 immagini fino alla tappa 4, di cui 38 pronte o quasi.
- **La prova di coerenza sul computer.** 60 fotogrammi al secondo con cento nemici e i due capi in scena, in una finestra da 960×540.
- **La prova di coerenza sul telefono, dopo le correzioni, a tutto schermo.** Con 22 nemici: 120 fotogrammi al secondo, buco più lungo 8 ms, calcolo 1,9 ms. Con la folla da cento, due letture: 119 fotogrammi al secondo, buco 14 ms, calcolo 4,2 ms; e 120 fotogrammi al secondo, buco 9 ms, calcolo 3,1 ms. Prima delle correzioni, con 22 nemici, il buco arrivava a 25 ms.
- **Il giudizio a occhio sul telefono.** I quattro nemici si riconoscono, il gatto si vede sempre. Le scritte, dopo le correzioni, si leggono abbastanza bene.

## La domanda da colloquio
**«Come hai deciso lo stile e come l'hai portato nel codice?»**

Una risposta possibile: prima del codice ho chiuso tre cose, cioè risoluzione, griglia e palette, perché da quelle dipende tutto il resto. La risoluzione l'ho scelta provandola sul telefono, alla misura vera, e sullo stesso telefono ho guardato se gatto e nemici si riconoscevano. La palette ha 24 colori e ogni colore ha un compito, così il gioco resta leggibile anche con lo schermo pieno. Poi ho messo un tetto agli asset: quanti fotogrammi per ogni cosa, e niente di nuovo senza togliere qualcosa. Nel codice lo stile arriva come file piccoli: ogni sprite è preso dalla tavola pixel per pixel, i colori di ogni file sono stati contati contro la palette, e il gioco ingrandisce la scena di un numero intero perché i pixel restino quadrati.

## Lo spunto per il post
Un'idea, non ancora un testo: la parola «fino» che nel titolo diventava «Ano», e cosa insegna sul guardare le cose alla misura vera prima di fidarsi.

## Fatto
- [x] Palette, caratteri, risoluzione e griglia scelti
- [x] La lista degli asset con il budget: [ASSET.md](../ASSET.md)
- [x] Il gatto in PNG
- [x] La prova di coerenza superata, senza bisogno dell'uscita
- [x] Il nome scelto
- [x] Questo diario
