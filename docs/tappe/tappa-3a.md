# Tappa 3a: crescere

L'obiettivo della tappa: ogni minuto una scelta, con crocchette, livelli e carte.

**Stato: fatta sul computer il 12 novembre 2026.** I piccioni lasciano crocchette, le crocchette fanno salire di livello, a ogni livello si sceglie una carta tra tre. Sul telefono si prova con la partita intera della 3b.

**Fatto quando:** in una partita corta si sale di livello almeno tre volte e si sceglie; con lo stesso seme escono le stesse carte, provato da un test; online.

## Cosa c'è di nuovo
- **Le crocchette.** Ogni piccione eliminato lascia una crocchetta a pesciolino. Quando il gatto passa entro 32 pixel la calamita la prende, e la crocchetta gli vola incontro.
- **I livelli.** Sotto la barra della vita c'è quella verde dell'esperienza, con il livello accanto. Per salire dal livello 1 servono 5 crocchette, poi 3 in più a ogni livello.
- **La scelta tra tre carte.** Quando si sale la partita si ferma e si scurisce, e sopra compaiono tre carte. Ogni carta mostra il nome, il livello che si raggiunge e cosa fa. Si tocca la carta, oppure si preme 1, 2, 3, o frecce e invio. Se si sale di più livelli insieme, le scelte arrivano una dopo l'altra.
- **Le carte.** Tre armi e quattro potenziamenti, ognuno fino al livello 5:
  - il graffio, già presente, che sale fino al livello 6;
  - la coda a frusta: un arco davanti al gatto, dalla parte in cui si è mosso per ultimo, che colpisce tutti quelli dentro;
  - il pelo che vola: ciuffi a raggiera in tutte le direzioni, rara;
  - zampe veloci (velocità), pancia piena (vita massima e un po' di cura), unghie affilate (danno di tutte le armi, rara), naso fino (raggio della calamita).
- **Le carte di ripiego.** Quando le carte buone sono meno di tre escono il supplì, che cura 30, e la mancia, che vale 100 punti per il punteggio della 3b.
- **Il seme.** Nascite dei piccioni, carte e direzione dei ciuffi passano da un generatore con seme. Con `?seme=123` nell'indirizzo la partita estrae sempre gli stessi numeri.

## Le tecnologie di questa tappa, e perché
| Strumento | Cosa fa qui | Perché questo |
|---|---|---|
| Scene sovrapposte di Phaser | La scelta delle carte è una scena sopra la partita, che resta in pausa | La partita non sa niente di come si disegnano le carte: le riceve e le applica con un evento |
| mulberry32 | Il generatore di numeri con seme, in `src/logic/rng.ts` | Dieci righe, veloce, senza pacchetti. Va bene per un gioco, non per la crittografia |
| Vitest | 21 test nuovi | Seme, livelli, estrazione delle carte, arco della coda e statistiche sono logica pura |

## I concetti, in parole semplici
- **Il seme.** Un generatore di numeri casuali è una formula che parte da un numero e da lì produce una sequenza che sembra a caso. Lo stesso numero di partenza, il seme, dà sempre la stessa sequenza. Serve a provare la stessa partita due volte, e a riprodurre un bug.
- **L'estrazione pesata, senza doppioni.** Ogni carta ha un peso: comune 10, rara 4. Si somma il peso di tutte, si tira un numero tra zero e la somma e si vede in quale fetta cade. La carta estratta esce dal sacchetto, così le tre carte sono sempre diverse.
- **La curva dei livelli.** 5 crocchette per il primo livello, poi 3 in più ogni volta. All'inizio si sale spesso, poi ogni livello chiede di più. È un dato in `src/data/balance.ts`: cambiarla vuol dire cambiare due numeri.
- **Una scena sopra l'altra.** `scene.pause()` ferma la partita, `scene.launch("LevelUp")` apre le carte sopra. La carta scelta torna alla partita con un evento, e la partita riparte con `scene.resume()`.
- **Lo stesso orologio per tutto.** Le armi, l'invulnerabilità e la durata dei ciuffi usano l'orologio della scena, che si ferma quando si scelgono le carte e corre doppio con «veloce».
- **Il problema di π e -π.** Per sapere se un piccione è dentro l'arco della coda si confronta il suo angolo con quello del gatto. Guardando a sinistra, π e -π sono la stessa direzione: la differenza tra due angoli va riportata tra -π e π, se no un piccione appena sotto sembrerebbe lontanissimo.

## Cosa è stato difficile
- **Il gioco vecchio nel browser di prova.** Dopo la build nuova il browser mostrava ancora la tappa 2: era il service worker, che serve la copia salvata come farà sul telefono. Per provare in locale si toglie il service worker, oppure si apre il gioco con i service worker bloccati.
- **Il browser di prova a un fotogramma al secondo.** Una finestra non in primo piano viene rallentata da Chrome. Le prove di gioco ora le fa uno script Playwright senza finestra, che muove il gatto in cerchio, sceglie la prima carta e fa le foto.
- **Il livello del graffio sulla carta.** La prima versione scriveva «liv 1» anche per il graffio, che il gatto ha già dall'inizio: la sua prima carta lo porta al 2.

## Cosa abbiamo misurato
Nella prova automatica, invincibile, con lo stesso seme: livello 2 a 13 secondi, livello 4 a 30, livello 5 a 45, con 44 piccioni presi, sempre intorno ai 60 fotogrammi al secondo e nessun errore in console.

## La domanda da colloquio
«Come eviti che la scelta tra tre proponga sempre le stesse carte?» Le estraggo a caso con un peso per rarità, e ogni carta estratta esce dal sacchetto, quindi le tre sono diverse. Le carte già al massimo non entrano nel sacchetto, e se ne restano meno di tre i posti li prendono le carte di ripiego. Il caso viene da un generatore con seme: con lo stesso seme escono le stesse carte, e un test lo controlla.

## Lo spunto per il post
Una crocchetta a forma di pesce, un supplì come carta di riserva, e dietro un'estrazione pesata con seme.

## Da fare
- Le 12 icone delle carte: per ora le armi usano un fotogramma del loro effetto e i potenziamenti non hanno icona.
- Provare la scelta delle carte con il pollice, sul telefono.
