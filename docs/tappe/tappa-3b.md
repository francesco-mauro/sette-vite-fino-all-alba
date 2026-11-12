# Tappa 3b: la versione presentabile

L'obiettivo della tappa: il traguardo minimo, una partita intera da mostrare.

**Stato: la partita intera c'è dal 12 novembre 2026; mancano la gif del README e il post.** Dal titolo all'alba, con sette vite, il punteggio e il record. La gif e il post su LinkedIn si fanno con Francesco: il post è un testo a suo nome.

**Fatto quando:** una partita intera dall'inizio all'alba, anche con l'avanti veloce; il record resta dopo aver ricaricato; README con gif e link; il post è pronto.

## Cosa c'è di nuovo
- **Il caricamento.** Tutte le immagini si caricano una volta sola, con una barra, prima del titolo.
- **Il titolo.** Roma di notte, con la cupola, i pini e il muraglione del Tevere, presa intera dalle tavole. Sopra c'è il nome del gioco, e sotto il record se esiste. Un tocco o lo spazio, e si gioca.
- **La notte di 15 minuti.** In alto al centro l'orologio conta da 00:00. A 15:00 arriva l'alba e si vince (oppure a 5:00 o 10:00, con la durata scelta nel titolo: vedi sotto). L'orologio si ferma durante la scelta delle carte e durante la pausa.
- **Le ondate che crescono.** All'inizio un gruppo di tre piccioni ogni due secondi e mezzo. Verso l'alba un gruppo di sette ogni 0,7 secondi. La tabella vera, minuto per minuto e con gli altri nemici, è della tappa 4.
- **Le sette vite.** I cuori stanno sotto le barre. Quando la barra rossa finisce, il gatto perde una vita e un pezzo di punteggio. Riparte dallo stesso punto con la barra piena e un secondo e mezzo di invulnerabilità, e a schermo compare «una vita in meno». Senza vite la notte finisce.
- **Il punteggio.** Un punto per ogni secondo vivo, 10 per ogni piccione, le mance delle carte, 5000 per l'alba, meno 250 per ogni vita persa, senza scendere sotto zero. La formula sta in `src/shared/score.ts`: alla tappa 6 la userà anche il Worker per scartare i punteggi impossibili.
- **La fine.** All'alba lo sfondo è l'alba su Roma; senza vite, la notte. Si vedono il punteggio, il tempo, i piccioni, il livello e il record, oppure «nuovo record!».
- **Il record.** Si salva nel browser e resta anche dopo aver ricaricato. Se il browser non permette di salvare (finestra privata, dati bloccati), il gioco va avanti lo stesso.
- **La pausa.** Il pulsante in alto a destra, Esc o P. Scatta da sola quando si cambia scheda o app, così tornando la partita non riparte prima di te. Dalla pausa si torna anche al titolo.
- **La riga dei primi 30 secondi.** In basso: «muoviti: il gatto attacca da solo».
- **Dopo la prima prova sul telefono.** Il joystick compare dove si appoggia il pollice, anche nella metà destra. Il dito che era sullo schermo quando si sale di livello non sceglie più la carta: serve un tocco nuovo. I quattro potenziamenti hanno un'icona provvisoria (vedi `DECISIONI.md`).
- **La durata della notte.** Aggiunta dopo la prima prova: nel titolo si sceglie 5, 10 o 15 minuti, con un record per ogni durata. In 5 minuti le ondate salgono più in fretta e arrivano alla stessa ondata finale dei 15 (vedi `DECISIONI.md`). Provata senza finestra: tocco su «5 min», alba a 05:00, «nuovo record! (5 min)», e tornando al titolo resta scelto 5 con il suo record.
- **Dopo la seconda prova sul telefono.** In pausa il pulsante dice «esci dalla partita», non più «torna al titolo», che sembrava far tornare alla partita. Dopo una carta o una pausa il gatto ha un secondo di protezione. A ogni livello tutte le crocchette rimaste sulla mappa volano verso il gatto. Provate senza finestra: alla ripresa restano circa 950 millisecondi di protezione, e cinque crocchette lontane arrivano al gatto in meno di un secondo. Pancia piena dà anche una rigenerazione leggerissima, 0,2 di vita al secondo per livello. Armi, ciuffi e invulnerabilità seguono ora il tempo della notte, non l'ora vera: in 3 secondi di pausa il graffio e la protezione dopo una vita persa restano dove erano, e con «veloce» tutto corre quattro volte.
- **Casse, minimappa e piccioni più duri.** Fino a otto casse del tesoro per notte, lontano dal gatto, con un potere o, una volta su dieci, tre. La minimappa in alto a destra le mostra, anche sul bordo quando sono lontane; toccandola o con M si apre la mappa grande, che ferma la partita. Il pelo che vola arriva al bordo dello schermo. I piccioni crescono con la notte: all'alba fanno il triplo del danno e corrono 1,6 volte più veloci, le ondate sono più fitte e l'invulnerabilità dopo un colpo scende a 0,7 secondi. Provati senza finestra: una cassa nata a 510 pixel, presa con «pelo che vola»; una tripla con tre poteri; la mappa grande aperta e chiusa con M e col tocco; i ciuffi che spariscono a 257 pixel in orizzontale e 152 in verticale, cioè al bordo dello schermo. Il bilanciamento è misurato con una partita automatica (vedi `DECISIONI.md`).
- **Dopo la terza prova sul telefono.** In pausa il pulsante grande è «riprendi»; «esci dalla partita» è piccolo, in basso, e al primo tocco diventa rosso e chiede «sicuro? tocca ancora per uscire». Presa una cassa, la partita si ferma: la cassa trema, si apre con un lampo e ne escono le carte vinte, con icona, nome, livello e cosa fanno; un tocco e si riprende, con il secondo di protezione. Sulla minimappa le casse hanno il contorno scuro e lampeggiano, anche sul bordo. Sul selciato, al posto delle foglie che sembravano cuori, ciuffi d'erba e una crepa. Provati senza finestra: il primo tocco su «esci» chiede e non esce, la domanda scade dopo 3 secondi, il secondo tocco torna al titolo; la cassa tripla ferma la partita e mostra tre carte, un tocco la chiude con 1 secondo di protezione; un livello arrivato insieme alla cassa apre la sua scelta dopo.
- **Dal PC.** Le scritte erano sgranate: il browser disegna anche Silkscreen con i bordi sfumati, e quei grigi ingranditi 3 volte facevano grana. Ora ogni scritta è disegnata 8 volte più grande e rimpicciolita prendendo il centro di ogni pixel (`src/scenes/font.ts`): pixel pieni, lettere con la loro forma. Nel titolo c'è «schermo intero» (o F): su un monitor 1920x1080 la scena passa da 3 a 4 volte e riempie lo schermo. I sampietrini hanno un tono in meno di contrasto, per un fondo più calmo. Provato senza finestra a 1920x953 e 1920x1080: la tela a 1440x810 e a 1920x1080, F che accende lo schermo intero, nessun errore.
- **Dopo, dal PC e dal telefono.** Il pulsante dice «esci da schermo intero» quando ci si è, e torna «schermo intero» anche uscendo con Esc; nel gioco installato, già a tutto schermo, non compare. La scritta «muoviti: il gatto attacca da solo» va via al primo passo del gatto, o comunque dopo 30 secondi. Provato senza finestra, anche facendo credere alla pagina di essere il gioco installato.
- **La versione e gli aggiornamenti.** Nel titolo, in basso a sinistra, la versione: il commit e quando è stata pubblicata. In basso a destra il pulsante «aggiornamenti» controlla sul server e, se c'è una versione nuova, la installa e riapre il gioco. Provato sul gioco costruito col service worker: prima «sei aggiornato», poi, dopo un build nuovo, l'aggiornamento e il gioco riaperto con la versione nuova.
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
- **La carta scelta da sola.** Sul telefono, con il pollice sul joystick nel momento in cui si saliva di livello, alzandolo si sceglieva la carta sotto il dito. L'attesa di 400 millisecondi non bastava: la carta ascoltava solo l'alzata del dito. Ora una carta vale solo se il dito si appoggia e si alza su di lei, dopo che è comparsa. Provato con un tocco simulato, senza finestra: pollice tenuto giù nella metà destra per 25 secondi, carte rimaste dopo l'alzata, scelta con un tocco nuovo.
- **Le scritte sopra i lampioni.** La luce di un lampione dietro le barre rendeva il livello difficile da leggere. Dietro l'interfaccia in alto a sinistra ora c'è un fondo scuro mezzo trasparente.

## Cosa abbiamo misurato
Con lo script di prova automatica, senza finestra:
- **La notte corta intera.** Invincibile e a velocità quadrupla: dal titolo all'alba in 48 secondi veri. 32 piccioni, livello 4, punteggio 5500 (180 secondi, più 320 dei piccioni, più 5000 dell'alba), «nuovo record!», nessun errore in console.
- **Due minuti di notte lunga.** Non invincibile, a velocità normale, con il gatto che gira in cerchio senza schivare: livello 9, 135 piccioni presi, 3 vite perse su 7, 60 fotogrammi al secondo. Era prima di abbassare il danno.

## La domanda da colloquio
«Fammi vedere il gioco: cosa c'è dentro di tecnico?» Un survivor in Phaser 4 e TypeScript, con le regole separate dal disegno e provate da 121 test. Le ondate, il punteggio e le carte sono dati, il caso viene da un generatore con seme. I nemici vivono in un pool. A ogni push ci sono lint, test e una prova nel browser vero, e la pubblicazione su Cloudflare parte solo se è tutto verde. Sul telefono si installa come un'app e si aggiorna da solo.

## Lo spunto per il post
Dal primo piccione all'alba su Roma: una notte intera giocabile, costruita a tappe con un commit e un diario per ognuna.

## Da fare
- La gif per il README, registrata insieme.
- Il post su LinkedIn: è a nome di Francesco, quindi passa dalla revisione di «Scrittura a suo nome».
- Riprovare sul telefono vero dopo le correzioni della prima prova: joystick a destra, carte con il pollice, pausa cambiando app.
- La bilanciatura, con i numeri scelti da Francesco: tappa 4.
