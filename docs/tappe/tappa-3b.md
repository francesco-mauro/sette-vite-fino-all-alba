# Tappa 3b: la versione presentabile

L'obiettivo della tappa: il traguardo minimo, una partita intera da mostrare.

**Stato: la partita intera c'è dal 12 novembre 2026; mancano la gif del README e il post.** Dal titolo all'alba, con sette vite, il punteggio e il record. La gif e il post su LinkedIn si fanno con Francesco: il post è un testo a suo nome.

**Fatto quando:** una partita intera dall'inizio all'alba, anche con l'avanti veloce; il record resta dopo aver ricaricato; README con gif e link; il post è pronto.

## Cosa c'è di nuovo
- **Il caricamento.** Tutte le immagini si caricano una volta sola, con una barra, prima del titolo.
- **Il titolo.** Roma di notte, con la cupola, i pini e il muraglione del Tevere, presa intera dalle tavole. Sopra c'è il nome del gioco, e sotto il record se esiste. Un tocco o lo spazio, e si gioca.
- **La notte di 15 minuti.** In alto al centro l'orologio conta da 00:00. A 15:00 arriva l'alba e si vince. L'orologio si ferma durante la scelta delle carte e durante la pausa.
- **Le ondate che crescono.** All'inizio un gruppo di tre piccioni ogni due secondi e mezzo. Verso l'alba un gruppo di sette ogni 0,7 secondi. La tabella vera, minuto per minuto e con gli altri nemici, è della tappa 4.
- **Le sette vite.** I cuori stanno sotto le barre. Quando la barra rossa finisce, il gatto perde una vita e un pezzo di punteggio. Riparte dallo stesso punto con la barra piena e un secondo e mezzo di invulnerabilità, e a schermo compare «una vita in meno». Senza vite la notte finisce.
- **Il punteggio.** Un punto per ogni secondo vivo, 10 per ogni piccione, le mance delle carte, 5000 per l'alba, meno 250 per ogni vita persa, senza scendere sotto zero. La formula sta in `src/shared/score.ts`: alla tappa 6 la userà anche il Worker per scartare i punteggi impossibili.
- **La fine.** All'alba lo sfondo è l'alba su Roma; senza vite, la notte. Si vedono il punteggio, il tempo, i piccioni, il livello e il record, oppure «nuovo record!».
- **Il record.** Si salva nel browser e resta anche dopo aver ricaricato. Se il browser non permette di salvare (finestra privata, dati bloccati), il gioco va avanti lo stesso.
- **La pausa.** Il pulsante in alto a destra, Esc o P. Scatta da sola quando si cambia scheda o app, così tornando la partita non riparte prima di te. Dalla pausa si torna anche al titolo.
- **La riga dei primi 30 secondi.** In basso: «muoviti: il gatto attacca da solo».
- **Per provare.** `?corta` fa durare la notte 3 minuti. Nel pannello di debug, «veloce» ora va a quattro volte la velocità normale: la notte corta si gioca in 45 secondi veri.

## Le tecnologie di questa tappa, e perché
| Strumento | Cosa fa qui | Perché questo |
|---|---|---|
| Scene di Phaser | Caricamento, titolo, partita, carte, pausa, fine | Ogni schermata fa una cosa sola. La partita apre carte e pausa sopra di sé e passa il risultato alla fine |
| `localStorage` | Il record personale | È nel browser, senza server: per la classifica online c'è la tappa 6 |
| `src/shared/` | La formula del punteggio | È la cartella del codice che useranno sia il gioco sia il Worker |
| Evento `HIDDEN` di Phaser | La pausa quando la scheda o l'app vanno in secondo piano | Phaser ferma già il gioco quando la scheda non si vede, ma al ritorno ripartirebbe da solo |

## I concetti, in parole semplici
- **Lo stato di una partita.** Tutto quello che serve per sapere a che punto è la notte: tempo passato, vite, vita, livello, carte prese, piccioni presi, mance. Si azzera a ogni partita nuova. Alla fine diventa un risultato che passa alla schermata finale.
- **Il tempo della partita non è il tempo vero.** L'orologio della notte somma il tempo di ogni fotogramma solo mentre la partita gira. Con «veloce» lo moltiplica per quattro. Il tempo vero, quello del computer, continuerebbe a contare anche in pausa.
- **Il salvataggio nel browser.** `localStorage` tiene coppie chiave e valore, come testo, per sempre, solo in quel browser. Può mancare o rifiutarsi: per questo ogni lettura e scrittura è protetta, e un valore rovinato vale zero.
- **Una formula in un posto solo.** Se il gioco calcolasse il punteggio in un modo e il server in un altro, un punteggio vero potrebbe sembrare falso. Con una funzione sola, in `src/shared/`, contano allo stesso modo.
- **Come si presenta un progetto.** Il titolo e la fine sono le schermate che vede chi prova il gioco per la prima volta: devono dire cos'è e com'è andata, anche senza spiegazioni.

## Cosa è stato difficile
- **Il segno della prova di fumo.** Il primo segno sul canvas lo metteva la scena di gioco. Ora il gioco parte dal titolo: il segno lo mette il titolo dopo aver caricato tutte le immagini. Poi la prova preme spazio e aspetta il segno della partita.
- **Troppo difficile per un telefono.** Con 10 di danno a piccione, nella prova automatica la prima barra finiva in 24 secondi. Ora il piccione toglie 6 e l'invulnerabilità dura un secondo. È un numero provvisorio: la bilanciatura vera è della tappa 4.
- **Le scritte sopra i lampioni.** La luce di un lampione dietro le barre rendeva il livello difficile da leggere. Dietro l'interfaccia in alto a sinistra ora c'è un fondo scuro mezzo trasparente.

## Cosa abbiamo misurato
Con lo script di prova automatica, senza finestra:
- **La notte corta intera.** Invincibile e a velocità quadrupla: dal titolo all'alba in 48 secondi veri. 32 piccioni, livello 4, punteggio 5500 (180 secondi, più 320 dei piccioni, più 5000 dell'alba), «nuovo record!», nessun errore in console.
- **Due minuti di notte lunga.** Non invincibile, a velocità normale, con il gatto che gira in cerchio senza schivare: livello 9, 135 piccioni presi, 3 vite perse su 7, 60 fotogrammi al secondo. Era prima di abbassare il danno.

## La domanda da colloquio
«Fammi vedere il gioco: cosa c'è dentro di tecnico?» Un survivor in Phaser 4 e TypeScript, con le regole separate dal disegno e provate da 83 test. Le ondate, il punteggio e le carte sono dati, il caso viene da un generatore con seme. I nemici vivono in un pool. A ogni push ci sono lint, test e una prova nel browser vero, e la pubblicazione su Cloudflare parte solo se è tutto verde. Sul telefono si installa come un'app e si aggiorna da solo.

## Lo spunto per il post
Dal primo piccione all'alba su Roma: una notte intera giocabile, costruita a tappe con un commit e un diario per ognuna.

## Da fare
- La gif per il README, registrata insieme.
- Il post su LinkedIn: è a nome di Francesco, quindi passa dalla revisione di «Scrittura a suo nome».
- Provare la notte intera sul telefono vero: joystick, carte con il pollice, pausa cambiando app.
- La bilanciatura, con i numeri scelti da Francesco: tappa 4.
