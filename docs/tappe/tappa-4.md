# Tappa 4: le ondate e il contenuto completo

L'obiettivo della tappa: il gioco diventa difficile, ha tutti i contenuti della 1.0 e regge il carico.

**Stato: in corso dal 13 novembre 2026.** Fatti i primi quattro passi: chi arriva e quando (tre nemici nuovi e la tabella delle ondate), i nemici rimasti lontano che tornano vicino, i due capi, e il miagolio, la quarta arma. Mancano i passivi che restano, il supplì, le categorie di collisione, la prova con 500 nemici e la bilanciatura.

**Fatto quando:** la misura con 500 nemici c'è, con numeri veri; i quindici minuti si giocano con la difficoltà che sale e tutti i contenuti; la partita di prova con una persona che non conosce il gioco è fatta e annotata; test verdi; online.

## Contenuti
- Cosa c'è di nuovo: i tre nemici, la picchiata, la tabella delle ondate, chi resta lontano, i due capi, il miagolio
- Le tecnologie di questa tappa, e perché
- I concetti, in parole semplici
- Cosa è stato difficile
- Cosa abbiamo misurato: prima e dopo i nemici nuovi, prima e dopo il ritorno dei lontani, i due capi, il miagolio
- La domanda da colloquio
- Lo spunto per il post
- Da fare

## Cosa c'è di nuovo
- **Tre nemici nuovi.** Ognuno chiede una cosa diversa a chi gioca.

| Nemico | Com'è | Velocità | Vita | Danno | Crocchetta |
|---|---|---|---|---|---|
| Piccione | lento, a gruppi | 35 | 10 | 6 | vale 1 |
| Zanzara | la più veloce, cade con un colpo, arriva a sciami | 55 | 4 | 3 | vale 1, la lascia circa una volta su tre |
| Pantegana | lenta, cade solo al quarto graffio del primo livello, fa male | 28 | 40 | 10 | vale 3 |
| Cornacchia | si avvicina, prende la mira, si lancia dritta | 45 | 16 | 12 | vale 2 |

- **La picchiata della cornacchia.** A 80 pixel dal gatto si ferma per 450 millisecondi: è l'avviso. Poi si lancia dritta per 600 millisecondi a 190 pixel al secondo, cioè 114 pixel di strada. La direzione la decide nell'istante in cui parte e non la cambia più: spostandosi di lato la si schiva. Dopo resta ferma 700 millisecondi, ed è il momento buono per colpirla. Ha due disegni: in volo, e in picchiata mentre mira e si lancia.
- **La tabella delle ondate, minuto per minuto.** Una riga per ogni minuto della notte da 15. Ogni riga dice, per ogni tipo di nemico, quanti ne nascono insieme e ogni quanto. Il primo minuto solo piccioni, tre ogni 2,2 secondi. La zanzara entra al minuto 2, la pantegana al 4, la cornacchia al 6. All'ultimo minuto: nove piccioni ogni 0,55 secondi, dieci zanzare ogni 2,4, cinque pantegane ogni 4, quattro cornacchie ogni 5. Le notti da 5 e da 10 minuti passano dalle stesse righe più in fretta: in quella da 5 ogni riga dura venti secondi.
- **Crocchette che valgono di più.** Un nemico più duro lascia una crocchetta che vale di più. La zanzara la lascia solo ogni tanto: arrivano in tante e cadono subito.
- **Chi resta lontano torna vicino.** Un nemico rimasto a più di 420 pixel dal gatto viene spostato in un punto di nascita nuovo, appena fuori dallo schermo. È lo stesso nemico, con la vita che aveva. Prima, scappando sempre dritto, i nemici restavano indietro vivi, il tetto dei 300 si riempiva lontano e vicino al gatto non nasceva più nessuno.
- **Due capi.** Il gabbiano nasce a un terzo della notte, il gabbiano reale a due terzi: al quinto e al decimo minuto della notte da 15, a 1:40 e 3:20 di quella da 5. Sono grandi il doppio degli altri e ognuno chiede una mossa diversa.

| Capo | Cosa fa | Come si evita | Velocità | Vita nella notte da 15, 10, 5 | Danno | Cosa lascia |
|---|---|---|---|---|---|---|
| Gabbiano | carica: a 100 pixel si ferma 700 millisecondi, poi si lancia dritto per 150 pixel | ci si sposta di lato | 40 | 300, 200, 100 | 15 | una crocchetta da 10 e una cassa |
| Gabbiano reale | urla: a 50 pixel si ferma, un cerchio rosso si allarga per 900 millisecondi, poi chi è entro 60 pixel prende il colpo | ci si allontana | 34 | 900, 600, 300 | 12 | una crocchetta da 20 e una cassa tripla |

- **Come si leggono quei numeri.** Danno e velocità crescono con la notte come per gli altri nemici: quando nasce, il gabbiano fa 25 di danno e va a 48, il reale 28 e quasi 48. Il gatto va a 80. Dopo la carica il gabbiano resta fermo 1,3 secondi, dopo l'urlo il reale 1,5: sono i momenti buoni per colpirli.
- **I capi sullo schermo.** Una scritta li annuncia quando nascono. Finché sono vivi hanno una barra della vita in basso al centro, con il nome sopra. Sulla minimappa e sulla mappa grande sono un quadratino rosso, anche quando sono lontani.
- **Un posto garantito.** Se nel momento in cui tocca a un capo i nemici vivi sono già 300, esce di scena il nemico più lontano dal gatto e il capo prende il suo posto.
- **Il miagolio, la quarta arma.** Un'onda tonda intorno al gatto. Chi è dentro prende poco danno e viene spinto via: scivola all'indietro per 160 millisecondi, poi riparte verso il gatto. Una cornacchia spinta perde la picchiata e ricomincia dall'avvicinamento. I capi prendono il danno ma restano dove sono. È una carta comune, con cinque livelli, e l'anello che si vede è il bordo vero dell'onda.

| Livello | Torna ogni | Danno | Raggio | Spinta |
|---|---|---|---|---|
| 1 | 3,0 secondi | 2 | 40 pixel | 24 pixel |
| 2 | 2,8 secondi | 2 | 44 | 28 |
| 3 | 2,6 secondi | 3 | 48 | 32 |
| 4 | 2,4 secondi | 3 | 54 | 36 |
| 5 | 2,2 secondi | 4 | 60 | 42 |

- **Nella schermata finale** c'è scritto «nemici», non più «piccioni».
- **Per provare.** Nel pannello di debug il pulsante «+ nemici» fa nascere un gruppo di ogni tipo, anche di quelli che a quell'ora della notte non ci sarebbero, «+ capo» fa nascere un capo, a turno, e «+ miagolio» dà un livello di miagolio a ogni tocco. Con `?debug` lo stato della partita si legge anche da fuori, sul canvas: serve alla partita automatica che misura il bilanciamento, e dice anche a che livello è ogni carta e quanti nemici ha spinto il miagolio.

## Le tecnologie di questa tappa, e perché
| Strumento | Cosa fa qui | Perché questo |
|---|---|---|
| Una tabella di dati (`src/data/waves.ts`) | Chi arriva, in quanti e ogni quanto | Bilanciare vuol dire cambiare un numero in una riga, senza toccare il codice |
| Un orologio per ogni tipo di nemico (`src/logic/waves.ts`) | Decide quando tocca di nuovo a ognuno | Zanzare e pantegane hanno ritmi diversi: con un orologio solo per tutti non si potevano regolare una per volta |
| Una macchina a stati (`src/logic/dive.ts`) | La picchiata della cornacchia | Quattro fasi con regole chiare si provano una per una, senza aprire il gioco |
| La stessa macchina a stati, altri numeri | La carica del gabbiano | È la picchiata della cornacchia con i numeri di un capo: nessuna regola nuova da scrivere e da provare |
| Una seconda macchina a stati (`src/logic/scream.ts`) | L'urlo del gabbiano reale | Tre fasi: si avvicina, carica l'urlo, riprende fiato. In un fotogramma solo dice «adesso urla», e la scena fa il resto |
| Una funzione pura per la spinta (`src/logic/knockback.ts`) | Dice chi è dentro l'onda del miagolio e a che velocità si allontana | Si prova con i numeri, senza aprire il gioco: dentro, sul bordo, fuori, in diagonale, esattamente sopra il gatto |
| Il pool di Phaser | Lo stesso sprite fa prima il piccione e poi la zanzara | Niente oggetti creati e buttati a ogni nemico: si rimettono immagine e dati a chi esce dal pool |
| Playwright fuori dai test | La partita automatica che gioca da sola | Misurare con venti partite a mano non è possibile; una macchina le gioca a velocità quadrupla |

## I concetti, in parole semplici
- **Una macchina a stati.** Un nemico che in ogni momento è in una fase sola (si avvicina, mira, si lancia, riposa) e passa alla successiva quando succede una cosa precisa. Al posto di tanti «se» mescolati, quattro casi che si leggono uno alla volta.
- **I dati separati dalle regole.** La tabella dice i numeri, il codice dice come leggerli. Chi bilancia apre un file solo, e i test controllano che la tabella rispetti le sue regole: il primo minuto solo piccioni, i nemici che entrano uno alla volta, nessun tipo che cala una volta arrivato.
- **La frazione di notte al posto dei minuti.** La riga si sceglie da quanta notte è passata, da 0 a 1. Così la stessa tabella vale per le notti da 5, 10 e 15 minuti.
- **Il pool e i dati vecchi.** Uno sprite che esce dal pool poteva essere un altro nemico un attimo prima. Va rimesso tutto: immagine, animazione, scatola delle collisioni, vita, danno, velocità. Se se ne dimentica uno, una zanzara nasce con la vita di una pantegana.
- **Regole e dati separati, alla prova.** Il gabbiano non ha codice suo per muoversi: usa la picchiata della cornacchia con altri cinque numeri. È il vantaggio di aver tenuto la regola in un posto e i numeri in un altro.
- **L'avviso prima del colpo.** Un attacco forte deve farsi vedere prima: il gabbiano si ferma, il cerchio del reale si allarga. Un test controlla che dall'urlo si possa uscire: nel tempo dell'avviso il gatto fa 72 pixel, più dei 60 del raggio.
- **La vita che segue la durata della notte.** In una notte da 5 minuti le ondate corrono tre volte più in fretta e il gatto raccoglie meno crocchette: a due minuti, poco dopo l'arrivo del primo capo, è tra il livello 6 e l'8 (sei partite), mentre nella notte da 15 al quinto minuto è tra l'11 e il 15 (tre partite). Per questo la vita dei capi cala in proporzione.
- **Chi comanda la velocità.** A ogni fotogramma la scena rimette la velocità di ogni nemico verso il gatto. Una spinta data una volta sola sparirebbe al fotogramma dopo. Per questo ogni nemico porta un dato, «spinto fino a»: finché vale, l'inseguimento lo lascia stare.
- **Misurare prima di credere.** Una spiegazione che sembra giusta va provata con un numero. Qui sotto ce n'è una che era giusta solo a metà.

## Cosa è stato difficile
- **Troppa esperienza dalle zanzare.** Con una crocchetta per ogni zanzara il gatto arrivava al livello 20 e oltre in 5 minuti, una carta ogni quindici secondi circa. Ora la zanzara la lascia circa una volta su tre.
- **Una spiegazione giusta solo a metà.** Il tetto dei 300 nemici vivi si toccava in quasi tutte le partite automatiche. La prima lettura era: i nemici restano indietro, lontano, e occupano i posti. La misura ha detto altro. Con il gatto che gira in tondo più di metà dei nemici è sullo schermo, in media tra 157 e 196 su 300 al massimo, e quasi nessuno resta lontano. Lì il tetto si tocca perché ne nascono molti più di quanti ne cadono: secondo la tabella, in una notte da 5 minuti nascono circa 2800 nemici, e in quelle partite il gatto ne ha presi tra 227 e 746. Il buco vero era un altro: scappando sempre dritto il gatto arrivava all'alba senza perdere una vita, con cinque nemici in vista.
- **Lo stesso seme non dà la stessa partita.** Con lo stesso seme, tre partite del gatto in tondo hanno perso una, tre e sette vite. Il seme fissa i numeri casuali, non il resto. Due cause probabili, non misurate una per una: i fotogrammi non cadono negli stessi istanti da una partita all'altra, e il gatto automatico gira a tempo vero mentre il gioco corre quattro volte più veloce, quindi anche la sua strada cambia un po'. Per un numero servono tante partite, non una.
- **Un capo che il gatto automatico fatica a buttare giù.** Con la prima vita scelta, nella notte da 15 minuti il gabbiano è caduto dopo 214, 297 e 373 secondi, e il reale era ancora vivo all'alba in tutte e tre le partite: in una con 429 su 1500, nelle altre due con 1348. La vita è stata abbassata, il gabbiano da 600 a 300 e il reale da 1500 a 900. Nelle notti da 5 minuti il reale resta quasi intero anche così. La lettura, non misurata: il graffio sceglie il nemico più vicino, il pelo si ferma sul primo che tocca, la coda colpisce solo davanti al gatto, e in mezzo alla folla il capo raramente è il primo della fila. Il gatto automatico gira senza guardare. Se a una persona che va vicino al capo mentre riprende fiato va meglio, è da provare.
- **Una difesa che era l'arma più forte.** Il miagolio è nato come difesa, con un danno da 4 a 10. Colpisce però tutti quelli intorno al gatto insieme, e nella prova con l'onda al livello 3 dal primo secondo il gatto in tondo ha preso da 2002 a 2440 nemici ed è arrivato al livello 35, 39 e 40 in cinque minuti. Senza miagolio, nelle partite dei capi, erano da 189 a 657 nemici e livello 9, 14 e 19. Il danno è sceso a 2, 2, 3, 3, 4, e un test dice che il danno di base non supera la vita di una zanzara, che è 4. La carta unghie affilate lo alza comunque, come per le altre armi. Le misure sono più sotto.
- **Un disegno da 32 pixel per un'onda da 80.** Nelle tavole l'anello del miagolio arriva a 13 pixel e mezzo dal centro. Per farlo coincidere con il bordo vero dell'onda lo sprite si ingrandisce da tre a quattro volte e mezza, e i suoi pixel diventano più grossi di quelli del resto del gioco. È disegnato un po' trasparente per non coprire il gatto. Resta da decidere con Francesco se ridisegnarlo più grande.
- **Le partite buttate.** Il server di sviluppo ricarica la pagina a ogni file cambiato. Una modifica al codice mentre le partite automatiche giravano le ha fatte ripartire dal titolo: quel giro è stato buttato e rifatto. Mentre si misura non si tocca il codice.
- **Lo sprite del pool che cambia taglia.** Un capo è 32 per 32, gli altri 16 per 16, e vivono nello stesso pool. A ogni nascita si rimettono immagine e scatola delle collisioni: uno sprite che ha fatto il capo torna piccione senza portarsi dietro la scatola grande.
- **Il gatto automatico che si fermava.** Dopo la scelta di una carta il gioco non vede più premuto il tasto che era giù. Una tastiera vera lo ripete da sola; la partita automatica deve ripremerlo.

## Cosa abbiamo misurato
Con la partita automatica, senza finestra: notte da 5 minuti, velocità quadrupla, tre partite insieme, a ogni livello la prima carta. Il gatto «in tondo» gira in quadrato senza schivare, «dritto» scappa sempre verso destra, «fermo» non si muove. Il punto più basso dei fotogrammi al secondo, in tutte le partite giocate, capi compresi, è stato 52; nessun errore in console.

Prima e dopo i tre nemici nuovi, con il gatto in tondo:

| Ondate | Partite | Vite perse | Livello alla fine |
|---|---|---|---|
| Solo piccioni, le ondate del 12 novembre | 2 | 2 e 1 | 9 e 10 |
| Con i tre nemici nuovi | 2 | 5 e 1 | 17 e 9 |

Prima e dopo il ritorno dei nemici lontani:

| Gatto | Nemici lontani | Partite | Vite perse | Come finisce | Nemici in vista, in media |
|---|---|---|---|---|---|
| Dritto | restano lontani | 3 | 0, 0, 0 | alba, livello 3 o 4 | 5 o 6 |
| Dritto | tornano vicino | 3 | 7, 7, 7 | senza vite tra 213 e 244 secondi | da 88 a 101 |
| In tondo | restano lontani | 3 | 4, 7, 3 | due albe, una fine a 249 secondi | da 157 a 192 |
| In tondo | tornano vicino | 3 | 3, 3, 3 | alba | da 167 a 196 |
| Fermo | restano lontani | 1 | 7 | senza vite a 162 secondi | 88 |
| Fermo | tornano vicino | 1 | 7 | senza vite a 143 secondi | 35 |

Cosa dicono: scappare dritto non funziona più, e per un gatto che non schiva è diventata la scelta peggiore. Per chi gira in tondo le vite perse restano simili, e i nemici riportati vicino sono molti meno: in quelle tre partite 22, 12 e 0, contro 3770, 3832 e 4866 per il gatto che scappa. Nelle partite fatte dopo, con i capi, il gatto in tondo è andato da 0 a 427 e quello che scappa da 2725 a 5157: da una partita all'altra cambia molto, l'ordine di grandezza no. In quelle tre partite nemici presi e livello sono usciti più bassi, ma tra partite dello stesso tipo i nemici presi vanno da 213 a 746, quindi con così poche partite non si può dire se è un effetto o il caso. Tutte le righe valgono come ordine di grandezza. La bilanciatura vera si fa con tutto il contenuto dentro e con i numeri scelti da Francesco.

Con i due capi, sempre con il gatto in tondo. La prima vita era 600 per il gabbiano e 1500 per il reale nella notte da 15 minuti, quella di adesso è 300 e 900. Nelle notti da 5 minuti vale un terzo.

| Notte | Vita di gabbiano e reale | Partite | Vite perse | Il gabbiano cade dopo | Vita rimasta al reale all'alba |
|---|---|---|---|---|---|
| 5 minuti | 200 e 500 | 3 | 1, 3, 2 | 151 secondi in una partita, vivo nelle altre due | 474, 428, 500 su 500 |
| 15 minuti | 600 e 1500 | 3 | 4, 4, 2 | 297, 214 e 373 secondi | 1348, 429, 1348 su 1500 |
| 5 minuti | 100 e 300, com'è ora | 3 | 3, 1, 3 | 97 e 133 secondi, vivo nella terza con 32 su 100 | 243, 285, 300 su 300 |

In tutte le partite i capi sono nati al loro momento: a 100 e 200 secondi nella notte da 5 minuti, a 300 e 600 in quella da 15. Tutte e nove sono arrivate all'alba. In queste nove partite nessun capo è stato riportato vicino al gatto. Al gatto che scappa dritto, in altre tre partite da 5 minuti, il gabbiano è stato riportato 10, 11 e 15 volte, il reale 0, 1 e 5. La notte da 15 minuti è stata giocata solo con la prima vita, non con quella di adesso. Nelle tre notti da 15 minuti il gatto è arrivato al livello 34, 48 e 17. Il punto più basso dei fotogrammi al secondo in queste partite è stato 52, sempre con tre partite insieme sullo stesso computer.

Con il miagolio, notte da 5 minuti. «Dal primo secondo» vuol dire che il pulsante di debug ha dato quei livelli prima di partire: è una prova di sforzo, non una partita vera. «Nel mazzo» vuol dire che la carta esce come le altre.

| Miagolio | Danno per livello | Gatto | Partite | Vite perse | Come finisce | Livello alla fine | Nemici presi |
|---|---|---|---|---|---|---|---|
| Non c'è ancora (le partite dei capi) | | in tondo | 3 | 3, 1, 3 | alba | 19, 9, 14 | 657, 189, 428 |
| Livello 3 dal primo secondo | 4, 5, 6, 8, 10 | in tondo | 3 | 3, 6, 6 | alba | 35, 39, 40 | 2002, 2417, 2440 |
| Livello 3 dal primo secondo | 2, 2, 3, 3, 4 | in tondo | 3 | 7, 2, 7 | senza vite a 258 e 271 secondi, un'alba | 29, 17, 34 | 1413, 585, 1865 |
| Livello 5 dal primo secondo | 2, 2, 3, 3, 4 | in tondo | 3 | 4, 1, 5 | alba | 25, 18, 34 | 1127, 617, 1838 |
| Nel mazzo | 4, 5, 6, 8, 10 | in tondo | 3 | 5, 1, 3 | alba | 14, 11, 15 | 401, 291, 478 |
| Nel mazzo, com'è ora | 2, 2, 3, 3, 4 | in tondo | 3 | 2, 3, 2 | alba | 10, 18, 15 | 238, 662, 456 |
| Non c'è ancora (le partite dei capi) | | dritto | 3 | 7, 7, 7 | senza vite a 226, 234 e 201 secondi | 13, 16, 11 | 337, 498, 269 |
| Livello 3 dal primo secondo | 4, 5, 6, 8, 10 | dritto | 3 | 7, 7, 7 | senza vite a 225, 219 e 222 secondi | 25, 24, 15 | 1062, 1013, 452 |
| Livello 3 dal primo secondo | 2, 2, 3, 3, 4 | dritto | 3 | 7, 7, 7 | senza vite a 205, 205 e 188 secondi | 12, 10, 11 | 307, 242, 279 |
| Nel mazzo, com'è ora | 2, 2, 3, 3, 4 | dritto | 3 | 7, 7, 7 | senza vite a 271, 204 e 192 secondi | 12, 9, 12 | 282, 183, 283 |
| Non c'è ancora (le partite dei capi) | | fermo | 1 | 7 | senza vite a 114 secondi | 10 | 197 |
| Nel mazzo, com'è ora | 2, 2, 3, 3, 4 | fermo | 1 | 7 | senza vite a 98 secondi | 11 | 243 |

Cosa dicono. Con la carta nel mazzo e il danno di adesso le partite stanno nella fascia di prima: in tondo 2, 3 e 2 vite perse e livello tra 10 e 18, contro 3, 1 e 3 e livello tra 9 e 19 senza miagolio. In quelle tre partite il gatto ha preso il miagolio fino al livello 2, 5 e 2, e l'onda ha spinto 592, 1269 e 609 nemici. Con il primo danno, regalato dal primo secondo, il miagolio moltiplicava i nemici presi. Abbassato il danno, al gatto che scappa dritto con il miagolio regalato il livello scende a 12, 10 e 11: senza miagolio era 13, 16 e 11. Al gatto in tondo non scende altrettanto: in due partite su tre arriva al livello 29 e 34, e proprio in quelle due finisce le vite prima dell'alba. Il perché non è misurato: manca una partita di controllo con tre livelli regalati di un'altra carta, e tre partite sono poche. Va guardato nella bilanciatura. Nelle 31 partite di questo passo nessun errore in console, e il punto più basso dei fotogrammi al secondo è stato 53.

## La domanda da colloquio
«Come hai tenuto 500 nemici a 60 fotogrammi al secondo?» La risposta completa arriva con la prova dei 500, che è ancora da fare. Quello che c'è già: i nemici vivono in un pool con un tetto, quindi il gioco non crea e non butta oggetti mentre si gioca; ogni nemico fa pochi conti a fotogramma, la distanza dal gatto e la direzione per raggiungerlo; le collisioni con il gatto e con i ciuffi di pelo le cerca l'indice spaziale di Phaser, e i nemici tra loro non si urtano. Con 300 nemici vivi, nelle partite automatiche il punto più basso è stato tra 52 e 59 fotogrammi al secondo, con tre partite insieme sullo stesso computer.

## Lo spunto per il post
Credevo di sapere perché era troppo facile. Poi ho fatto giocare il gioco da solo, e i numeri hanno detto un'altra cosa.

## Da fare
- I capi con una persona che gioca: se la vita è giusta, e se il graffio deve scegliere il capo quando è a tiro invece del nemico più vicino.
- Il miagolio con una persona che gioca: se la spinta si sente, quanto danno deve fare, e se l'onda ingrandita va bene o va ridisegnata più grande.
- Capire perché, con il miagolio regalato dal primo secondo, il gatto in tondo sale tanto di livello e perde più vite: serve una partita di controllo.
- I passivi che mancano e il supplì a terra.
- Le categorie di collisione.
- La prova con 500 nemici sul computer e sul telefono, con i numeri qui.
- Il tetto dei 300: con il gatto in tondo si tocca quasi sempre. Da decidere insieme alla prova dei 500.
- Portare la partita automatica nel repository, come strumento.
- La bilanciatura, con i numeri scelti da Francesco, e una partita di prova con una persona che non conosce il gioco.
