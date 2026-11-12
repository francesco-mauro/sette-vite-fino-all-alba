# Tappa 2: il gatto e il primo nemico

L'obiettivo della tappa: il primo minuto di gioco, sul computer e sul telefono.

**Stato: fatta sul computer il 12 novembre 2026, nello stesso giorno della 1b.** Il gatto si muove con la tastiera o con il joystick, i piccioni inseguono, il graffio li elimina e il gatto può finire la vita. Sul telefono si prova insieme alla partita intera della tappa 3b.

**Fatto quando:** si gioca un minuto sul computer e sul suo telefono: il gatto si muove, i piccioni inseguono, il graffio li elimina, si può morire; test verdi; online.

## Cosa c'è di nuovo
- **Gli sprite dalle tavole, con uno script nel repository.** `art/sprite_dalle_tavole.py` apre le tavole di stile, che stanno fuori dal repository, prende ogni immagine dalla sua didascalia e toglie i sampietrini da sotto. Poi mette i fotogrammi in fila in `public/assets/` e controlla che ogni colore sia uno dei 24 della palette. Sono entrati il piccione e il graffio, e già pronti per la tappa 3a la crocchetta, la coda a frusta e il pelo che vola.
- **Il carattere pixel.** Silkscreen, preso dalle stesse tavole, con la sua licenza libera (OFL). Il gioco lo carica prima di partire.
- **La strada che non finisce.** Il terreno è un pezzo di strada (sampietrini, un tombino, due mucchi di foglie) ripetuto all'infinito. I lampioni cambiano posto in ogni riquadro di strada, sempre lo stesso: se torni indietro, il lampione è dove l'avevi lasciato.
- **Il gatto e la telecamera.** Il gatto si muove con frecce o WASD, oppure col joystick che compare dove appoggi il pollice, nella metà sinistra dello schermo. Cammina, si gira, e la telecamera lo segue.
- **I piccioni.** Arrivano a gruppi di tre da fuori dello schermo e vanno dritti verso il gatto. Vivono in un pool con un tetto di 200: si prendono e si rimettono via, senza crearli e distruggerli ogni volta.
- **Il graffio.** Ogni secondo, da solo, colpisce il piccione più vicino entro 72 pixel.
- **La vita.** Un piccione che tocca il gatto toglie 10 punti su 100, poi per 0,8 secondi i colpi non contano e il gatto lampeggia. A zero compare «il gatto è stanco»: un tocco, o lo spazio, e si riparte.
- **Il pannello di debug.** Con `?debug` nell'indirizzo: fotogrammi al secondo, nemici vivi e tre pulsanti (invincibile, venti piccioni in più, veloce), che si toccano anche sul telefono.

## Le tecnologie di questa tappa, e perché
| Strumento | Cosa fa qui | Perché questo |
|---|---|---|
| Phaser 4, scene e telecamera | La partita è una scena; la telecamera segue il gatto | È il motore scelto alla tappa 0 |
| Fisica Arcade | Velocità, scatole delle collisioni, `overlap` tra gatto e piccioni | La più semplice di Phaser, a passo fisso: per un survivor bastano rettangoli |
| Gruppi con `maxSize` | Il pool dei piccioni e degli effetti del graffio | Niente oggetti creati e buttati a ogni nemico: meno lavoro per il garbage collector, già dal primo nemico |
| `TileSprite` e `CanvasTexture` | La strada infinita, disegnata una volta su un canvas | Un solo oggetto per tutto il terreno, che scorre il disegno invece di muoversi |
| Pillow (Python) | Lo script degli sprite | Legge e scrive PNG pixel per pixel, ed era già usato per le icone |
| Vitest | 20 test nuovi della logica | La logica pura si prova in un secondo, senza browser |

Il joystick di phaser4-rex-plugins resta nella misura: nella partita il joystick è scritto a mano, perché deve comparire sotto il pollice (vedi `DECISIONI.md`).

## I concetti, in parole semplici
- **Il ciclo `update`.** Phaser chiama `update` circa 60 volte al secondo. Ogni volta: si legge l'input, si muove il gatto, si dice a ogni piccione dove andare, si fa scorrere la strada.
- **Perché la diagonale si normalizza.** Destra più su fa un vettore (1, -1), lungo 1,41: senza correzione il gatto in diagonale andrebbe il 41% più veloce. Si accorcia il vettore a lunghezza 1, e la velocità resta la stessa in ogni direzione. Il joystick a metà corsa dà un vettore lungo 0,5, e il gatto va a metà velocità.
- **La zona morta del joystick.** Un dito appoggiato trema: sotto il 15% del raggio il gatto resta fermo.
- **Overlap.** La fisica sente quando due scatole si sovrappongono e chiama una funzione, senza spingerle via. Serve per il contatto tra gatto e piccioni.
- **Il pool.** Un gruppo di oggetti già pronti: un piccione morto si nasconde e si spegne, e il prossimo che nasce riusa quello. Con centinaia di nemici fa la differenza.
- **Logica separata dal disegno.** Direzione, mira, danno e nascite sono funzioni normali in `src/logic/`, provate da Vitest. La scena le chiama e disegna il risultato.
- **Il seme del lampione.** La posizione del lampione in un riquadro viene da un calcolo sulle sue coordinate, non dal caso: lo stesso riquadro dà sempre lo stesso punto.

## Cosa è stato difficile
- **Le tavole impacchettate.** Le pagine delle tavole sono pacchetti dentro pacchetti: la pagina contiene le tavole compresse, e ogni tavola contiene le sue immagini, compresse anche loro. Gli script della tappa 0 erano rimasti in una cartella temporanea, quindi lo spacchettatore è stato riscritto, questa volta nel repository.
- **Togliere lo sfondo senza bucare i corpi.** Sotto ogni sprite ci sono i sampietrini, con un'ombra fatta degli stessi colori. Per i nemici si parte dal bordo e si cancella solo quello che si raggiunge senza attraversare il contorno scuro. Gli effetti non hanno contorno, quindi lì si cancellano tutti i colori dei sampietrini.
- **Nomi in italiano nel codice.** La regola del progetto vuole nomi in inglese e commenti in italiano. Il Worker e la prova di fumo della tappa 1b avevano qualche nome in italiano: sistemati.
- **Il primo bilanciamento.** Con un gruppo di piccioni ogni secondo e mezzo ne arrivavano due al secondo, e il graffio ne toglie uno: il gatto finiva la vita in meno di sei secondi. Ora un gruppo ogni due secondi e mezzo. La difficoltà vera, che sale col tempo, arriva con la partita intera.

## Cosa abbiamo misurato
Nel browser di prova del computer, con il pannello di debug: 60 fotogrammi al secondo con una ventina di piccioni. La misura vera, con 500 nemici, è della tappa 4.

## La domanda da colloquio
«Perché il gatto in diagonale non va più veloce?» Perché la direzione è un vettore: due frecce insieme danno (1, -1), lungo radice di 2, cioè 1,41. Prima di moltiplicarlo per la velocità lo porto a lunghezza 1. Così la velocità è uguale in tutte le direzioni, e il joystick spinto a metà dà metà velocità. È una funzione di tre righe, provata da un test.

## Lo spunto per il post
Il primo nemico è un piccione romano, e la prima riga di matematica è il teorema di Pitagora.

## Da fare
- Provare il primo minuto sul telefono vero, insieme alla partita intera.
