# Tappa 4: le ondate e il contenuto completo

L'obiettivo della tappa: il gioco diventa difficile, ha tutti i contenuti della 1.0 e regge il carico.

**Stato: in corso dal 13 novembre 2026.** Fatti i primi otto passi: chi arriva e quando (tre nemici nuovi e la tabella delle ondate), i nemici rimasti lontano che tornano vicino, i due capi, il miagolio, la quarta arma, i tre passivi che mancavano, con il graffio che sceglie il capo, il supplì a terra, che cura, chi urta chi, con le spinte leggere tra i nemici, e i modi di camminare di zanzara, pantegana e piccione. Insieme all'ottavo passo le carte di ripiego hanno avuto un'icona loro, che non è un passo a parte. Online dal 13 novembre. Mancano la prova con 500 nemici e la bilanciatura.

**Fatto quando:** la misura con 500 nemici c'è, con numeri veri; i quindici minuti si giocano con la difficoltà che sale e tutti i contenuti; la partita di prova con una persona che non conosce il gioco è fatta e annotata; test verdi; online.

## Contenuti
- Cosa c'è di nuovo: i tre nemici, la picchiata, la tabella delle ondate, chi resta lontano, i due capi, il miagolio, il graffio che sceglie il capo, i tre passivi nuovi, il supplì a terra, chi urta chi e le spinte leggere tra nemici, i modi di camminare, le icone delle carte di ripiego
- Le tecnologie di questa tappa, e perché
- I concetti, in parole semplici
- Cosa è stato difficile
- Cosa abbiamo misurato: prima e dopo i nemici nuovi, prima e dopo il ritorno dei lontani, i due capi, il miagolio, il graffio sul capo con i passivi nuovi, il supplì a terra, le spinte leggere, i modi di camminare
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
| 1 | 3,0 secondi | 2 | 40 pixel | 32 pixel |
| 2 | 2,8 secondi | 2 | 44 | 36 |
| 3 | 2,6 secondi | 3 | 48 | 42 |
| 4 | 2,4 secondi | 3 | 54 | 48 |
| 5 | 2,2 secondi | 4 | 60 | 56 |

- **La spinta più lunga.** All'inizio era 24, 28, 32, 36 e 42 pixel. Dopo averci giocato Francesco l'ha voluta un po' più lunga. Resta entro il raggio dell'onda, e un test lo controlla.
- **Il graffio sceglie il capo.** Quando un capo è a tiro, il graffio colpisce lui e non il nemico più vicino. Se i capi a tiro sono due, il più vicino dei due. Senza capi a tiro tutto è come prima. L'ha deciso Francesco giocando: i nemici fanno mucchio intorno al gatto, e il graffio al capo non arrivava mai.
- **Tre passivi nuovi.** Con questi, gli otto potenziamenti del progetto ci sono tutti, in sette carte: la rigenerazione sta dentro pancia piena.

| Carta | Rarità | Cosa fa | Per livello | Al quinto livello |
|---|---|---|---|---|
| Riflessi pronti | rara | tutte le armi partono più spesso | l'8% in più | il 40% in più: chi aspettava 1000 millisecondi ne aspetta 714 |
| Pelo gonfio | comune | graffio, coda a frusta e miagolio arrivano più lontano | l'8% in più | il 40% in più: l'onda del miagolio passa da 60 a 84 pixel |
| Zampa fortunata | comune | più carte rare e più casse triple | 1 di peso in più alle rare, 4 punti in più di probabilità alla cassa tripla | le rare pesano 9 contro 10 delle comuni (partivano da 4), la cassa è tripla 3 volte su 10 (partiva da 1) |

- **Cosa non tocca il pelo gonfio.** Il pelo che vola arriva già al bordo dello schermo: per lui non cambia niente, e la carta lo dice.
- **Il supplì a terra.** È il secondo oggetto a terra, dopo la crocchetta. Ogni tanto un nemico eliminato ne lascia uno, e il gatto, raccogliendolo, si cura. I numeri sono di partenza, da provare giocando.

| Numero | Valore | Perché |
|---|---|---|
| Quanto cura | 30 punti di vita | come il supplì delle carte di ripiego: uno è uno, a terra o in mano. La barra di una vita ne ha 100 |
| Probabilità | 2 su 100, per ogni nemico eliminato | un numero da cui partire |
| Pausa dopo un supplì | 30 secondi | a fine notte i nemici eliminati sono tanti: senza la pausa ne pioverebbero |
| Quando il gatto lo mangia | gli mancano almeno 10 punti di vita | a vita piena, o per un graffietto, resta a terra per dopo |
| Quanti a terra insieme | 5 | oltre, quello nuovo prende il posto del più lontano dal gatto |

- **Come si raccoglie.** Come la crocchetta: quando è nel raggio della calamita vola verso il gatto, ma solo se il gatto ha fame. Naso fino allarga quel raggio anche per lui. Quando il gatto lo mangia, sopra di lui sale per un attimo quanto ha curato: «+30», o meno se la vita era quasi piena. A ogni livello le crocchette volano tutte verso il gatto, i supplì no: restano dove sono.
- **Il disegno.** Due fotogrammi dalle tavole, come la crocchetta: il supplì con il filo di mozzarella, e lo stesso con una croce rossa sopra, che dice «cura».
- **Chi urta chi.** Il progetto chiedeva le categorie di collisione: gatto, nemici, colpi del gatto e oggetti, e ognuno urta solo quello che deve. C'era già: Arcade controlla soltanto le coppie dichiarate nella scena, e sono cinque (il gatto con nemici, crocchette, supplì e casse, il pelo che vola con i nemici). Graffio, coda e miagolio non passano dalla fisica: trovano i nemici con i loro conti. Phaser 4 ha anche le categorie vere (`setCollisionCategory`), ma filtrano solo dentro una coppia già dichiarata, quindi qui non toglierebbero niente. È rimasto un commento nella scena che lo dice.
- **Le spinte leggere tra nemici.** Francesco, giocando: «i nemici tendono a raggrupparsi molti», e poi «correggi i nemici ammucchiati». Tutti andavano dritti sul gatto, dalla stessa parte e quasi alla stessa velocità, e finivano uno sopra l'altro: a due minuti, con 270 nemici vivi, sullo schermo se ne vedevano una ventina. Ora chi sta troppo vicino a un altro si scosta un po'.

| Numero | Valore | Perché |
|---|---|---|
| Raggio | 14 pixel tra due centri | la scatola del nemico più largo, la pantegana |
| Forza | 2 volte la velocità di chi la riceve, uno sopra l'altro | scende a zero alla distanza del raggio: a metà raggio vale quanto la sua corsa. Con meno di 1 la spinta non vincerebbe mai la corsa verso il gatto, e lì si impilerebbero lo stesso |
| Velocità con la spinta | mai più della sua | la spinta lo sposta di lato o lo frena, non lo fa correre di più |

- **I modi di camminare.** Fino a qui piccione, zanzara e pantegana andavano tutti dritti sul gatto, e cambiava solo la velocità. Guardiana ha proposto quattro modi nuovi e Francesco ha approvato i movimenti. Ne sono entrati tre: il quarto, qualcuno che punta dove sarà il gatto, era proposto come leva per la bilanciatura, e lì resta (lettura di chi scrive il codice, detta a Francesco).

| Nemico | Come cammina | Numeri |
|---|---|---|
| Zanzara | ondeggia di lato mentre insegue, senza perdere velocità | un giro ogni 0,8 secondi, fino a 50 gradi per parte: verso il gatto va sempre ad almeno 0,64 della sua velocità |
| Pantegana | punta dove è il gatto e corre dritta per un secondo e mezzo, poi ricalcola: si schiva spostandosi di lato | 1,5 secondi per scatto |
| Piccione | cammina un paio di secondi, poi si ferma un attimo a beccare | da 1,5 a 2,5 secondi di cammino, diverso per ogni piccione, e 0,4 di sosta |

- **Perché non ondeggiano tutte insieme.** Ogni nemico riceve alla nascita un numero suo tra 0 e 1, preso dai multipli della sezione aurea: numeri ben sparpagliati, senza tirare un dado e senza toccare la fila del seme. Sposta l'ondeggio della zanzara e la camminata del piccione.
- **Dove guardano.** Lo sprite guarda il gatto, non dove ondeggia o dove lo spingono, così non si gira avanti e indietro. La pantegana guarda dove corre: in uno scatto è una linea dritta.
- **Chi spinge e chi no.** I capi, il gabbiano e il gabbiano reale, non spingono e non vengono spinti: sono grandi e hanno già una strada loro. La cornacchia riceve la spinta solo mentre si avvicina, mai in mira o in picchiata. Chi è spinto via dal miagolio scivola come prima. In mira, in picchiata, mentre riprendono fiato e spinti dal miagolio non ricevono la spinta, ma spingono i vicini.
- **Le carte di ripiego con un'icona loro.** Francesco, giocando, ha trovato la carta supplì con il disegno della crocchetta, e così la mancia, e il nome «mancia» non si capiva. Le due carte usavano i due fotogrammi della crocchetta perché, quando sono nate nella 3a, il disegno del supplì non c'era ancora. Ora la carta supplì ha il disegno del supplì, e la mancia si chiama «spicci», le monetine in romano, con una monetina provvisoria disegnata da `art/icone_carte.py`. Il nome l'ha proposto chi scrive il codice, ed è entrato con il «pubblica tutto» di Francesco (lettura di chi scrive il codice, detta a Francesco). Le icone delle carte ora sono dati, in `src/data/cards.ts`, e un test controlla che ogni carta ne abbia una sua, mai la crocchetta, e che il fotogramma esista nel disegno.

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
| Una preferenza sopra la mira (`preferredIndex` in `src/logic/targeting.ts`) | Il graffio sceglie il capo quando è a tiro | La regola del più vicino resta com'era e la preferenza le sta sopra: sei test nuovi, nessuno di quelli vecchi toccato |
| Una funzione pura per la spinta (`src/logic/knockback.ts`) | Dice chi è dentro l'onda del miagolio e a che velocità si allontana | Si prova con i numeri, senza aprire il gioco: dentro, sul bordo, fuori, in diagonale, esattamente sopra il gatto |
| Un secondo dado, dallo stesso seme (`snackRng` nella scena) | Decide quando cade un supplì | Il supplì non prende numeri dalla fila di nascite e carte: la regola nuova non aggiunge un tiro a ogni nemico eliminato su quella fila. Non rende uguali due partite con lo stesso seme: quelle cambiano comunque |
| Una griglia (`src/logic/separation.ts`) | Trova i nemici vicini tra loro per le spinte leggere | Ogni nemico va in una casella grande quanto il raggio, e si guardano solo le nove caselle intorno. Con trecento nemici sono poche migliaia di confronti, invece dei quarantacinquemila di tutte le coppie. Un test controlla che dia gli stessi numeri del conto su tutte le coppie |
| Tre funzioni pure per camminare (`src/logic/patterns.ts`) | Zanzara che ondeggia, pantegana a scatti, piccione che becca | Due sono macchine a stati piccole, come la picchiata; la terza è un'onda. Si provano con i numeri, e un nemico nuovo sceglie come camminare con una riga di dati |
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
- **Un moltiplicatore al posto di tanti numeri.** Riflessi pronti e pelo gonfio non riscrivono le tabelle delle armi: danno un moltiplicatore, e una funzione sola (`tuneWeapon` in `src/logic/stats.ts`) lo applica ai numeri di ogni arma prima che parta. Una carta nuova così non tocca i livelli delle armi, e un'arma nuova li eredita senza fare niente.
- **Più spesso non è meno attesa.** «Il 40% più spesso» non vuol dire «il 40% di attesa in meno»: l'attesa si divide per 1,4, quindi cala del 29%. Con la sottrazione, cinque livelli da 20% porterebbero l'attesa a zero.
- **Un tetto dato dal tempo.** Una probabilità per ogni nemico eliminato cresce con i nemici: pochi supplì all'inizio, una pioggia alla fine. Una pausa fissa dopo ogni supplì mette un tetto che non dipende da quanti nemici cadono: al più 11 in una notte da 5 minuti, 31 in una da 15.
- **Un dado per ogni cosa.** Il generatore con il seme dà sempre la stessa fila di numeri. Se una regola nuova ne prende uno, tutte le altre ricevono il numero dopo. Dare alla regola nuova un dado suo evita di spostarle. Non basta a rendere uguali due partite: appena il gatto elimina una zanzara in più o in meno, o prende una carta in un altro momento, la fila viene letta in un altro ordine.
- **La separazione dei boids.** Nel 1987 Craig Reynolds ha mostrato che uno stormo credibile nasce da tre regole semplici per ogni uccello: stai lontano da chi ti è troppo vicino, vai dove vanno i vicini, resta con il gruppo. Qui serve solo la prima. Ogni nemico guarda i vicini, non tutta la folla, e la folla prende forma da sola.
- **Una spinta che non accelera.** Sommare due velocità può dare una velocità più grande di tutte e due. Per questo dopo la somma la corsa si accorcia alla velocità del nemico: la spinta cambia la direzione, non quanto corre.
- **Misurare prima di credere.** Una spiegazione che sembra giusta va provata con un numero. Qui sotto ce n'è una che era giusta solo a metà.

## Cosa è stato difficile
- **Troppa esperienza dalle zanzare.** Con una crocchetta per ogni zanzara il gatto arrivava al livello 20 e oltre in 5 minuti, una carta ogni quindici secondi circa. Ora la zanzara la lascia circa una volta su tre.
- **Una spiegazione giusta solo a metà.** Il tetto dei 300 nemici vivi si toccava in quasi tutte le partite automatiche. La prima lettura era: i nemici restano indietro, lontano, e occupano i posti. La misura ha detto altro. Con il gatto che gira in tondo più di metà dei nemici è sullo schermo, in media tra 157 e 196 su 300 al massimo, e quasi nessuno resta lontano. Lì il tetto si tocca perché ne nascono molti più di quanti ne cadono: secondo la tabella, in una notte da 5 minuti nascono circa 2800 nemici, e in quelle partite il gatto ne ha presi tra 227 e 746. Il buco vero era un altro: scappando sempre dritto il gatto arrivava all'alba senza perdere una vita, con cinque nemici in vista.
- **Lo stesso seme non dà la stessa partita.** Con lo stesso seme, tre partite del gatto in tondo hanno perso una, tre e sette vite. Il seme fissa i numeri casuali, non il resto. Due cause probabili, non misurate una per una: i fotogrammi non cadono negli stessi istanti da una partita all'altra, e il gatto automatico gira a tempo vero mentre il gioco corre quattro volte più veloce, quindi anche la sua strada cambia un po'. Per un numero servono tante partite, non una.
- **Un capo che il gatto automatico fatica a buttare giù.** Con la prima vita scelta, nella notte da 15 minuti il gabbiano è caduto dopo 214, 297 e 373 secondi, e il reale era ancora vivo all'alba in tutte e tre le partite: in una con 429 su 1500, nelle altre due con 1348. La vita è stata abbassata, il gabbiano da 600 a 300 e il reale da 1500 a 900. Nelle notti da 5 minuti il reale resta quasi intero anche così. La lettura, non misurata: il graffio sceglie il nemico più vicino, il pelo si ferma sul primo che tocca, la coda colpisce solo davanti al gatto, e in mezzo alla folla il capo raramente è il primo della fila. Il gatto automatico gira senza guardare. Se a una persona che va vicino al capo mentre riprende fiato va meglio, è da provare.
- **Una difesa che era l'arma più forte.** Il miagolio è nato come difesa, con un danno da 4 a 10. Colpisce però tutti quelli intorno al gatto insieme, e nella prova con l'onda al livello 3 dal primo secondo il gatto in tondo ha preso da 2002 a 2440 nemici ed è arrivato al livello 35, 39 e 40 in cinque minuti. Senza miagolio, nelle partite dei capi, erano da 189 a 657 nemici e livello 9, 14 e 19. Il danno è sceso a 2, 2, 3, 3, 4, e un test dice che il danno di base non supera la vita di una zanzara, che è 4. La carta unghie affilate lo alza comunque, come per le altre armi. Le misure sono più sotto.
- **Un disegno da 32 pixel per un'onda da 80.** Nelle tavole l'anello del miagolio arriva a 13 pixel e mezzo dal centro. Per farlo coincidere con il bordo vero dell'onda lo sprite si ingrandisce da tre a quattro volte e mezza, e i suoi pixel diventano più grossi di quelli del resto del gioco. È disegnato un po' trasparente per non coprire il gatto. Resta da decidere con Francesco se ridisegnarlo più grande.
- **Le partite buttate.** Il server di sviluppo ricarica la pagina a ogni file cambiato. Una modifica al codice mentre le partite automatiche giravano le ha fatte ripartire dal titolo: quel giro è stato buttato e rifatto. Mentre si misura non si tocca il codice.
- **Più carte nel mazzo, e la prima vita se ne va prima.** Con tre carte in più, nelle tre partite del gatto in tondo le vite perse sono salite da 2, 3 e 2 a 4, 5 e 6, e la prima è andata via a 71, 80 e 72 secondi invece che a 111, 97 e 109: prima che nasca il primo capo, quindi la mira nuova del graffio lì non c'entra. Restano due sospetti, non misurati: le tre carte in più e la spinta più lunga del miagolio, entrata nello stesso passo. Per le carte: il gatto automatico prende sempre la prima carta, e con undici carte al posto di otto gli capita più spesso una che non lo aiuta subito. La zampa fortunata è stata presa in tutte e sette le partite. Tre partite sono poche, e una persona le carte le sceglie.
- **Lo sprite del pool che cambia taglia.** Un capo è 32 per 32, gli altri 16 per 16, e vivono nello stesso pool. A ogni nascita si rimettono immagine e scatola delle collisioni: uno sprite che ha fatto il capo torna piccione senza portarsi dietro la scatola grande.
- **Il gatto automatico che si fermava.** Dopo la scelta di una carta il gioco non vede più premuto il tasto che era giù. Una tastiera vera lo ripete da sola; la partita automatica deve ripremerlo.

- **Una regola giusta che rovinava un'altra.** La corsa con la spinta si accorcia alla velocità del nemico. Applicata alla cornacchia in picchiata, che va a 190, l'avrebbe riportata alla sua velocità normale, da 45 a 72 secondo l'ora della notte. Visto rileggendo il codice prima delle partite: la spinta tocca la cornacchia solo mentre si avvicina.
- **Un oggetto che sparisce prima della foto.** I nemici cadono vicino al gatto, quindi il supplì nasce quasi sempre dentro il raggio della calamita, e un gatto ferito lo mangia in meno di un secondo. Per guardarlo fermo a terra è servito il gatto invincibile del pannello di debug, che non ha mai fame.

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

Con il graffio che sceglie il capo, i tre passivi nuovi e la spinta più lunga, notte da 5 minuti. La riga «prima» è quella del miagolio nel mazzo, qui sopra. Nella notte da 5 minuti il gabbiano ha 100 di vita e il reale 300.

| Gatto | Quando | Partite | Vite perse | Come finisce | Livello alla fine | Nemici presi | Il gabbiano | Il gabbiano reale |
|---|---|---|---|---|---|---|---|---|
| In tondo | prima | 3 | 2, 3, 2 | alba | 10, 18, 15 | 238, 662, 456 | cade a 198 e 298 secondi, vivo in una con 48 di vita | vivo con 300, 286 e 300 |
| In tondo | ora | 3 | 4, 5, 6 | alba | 11, 14, 18 | 262, 342, 577 | cade a 178, 148 e 134 secondi | cade a 270 secondi in una, vivo con 22 e 72 nelle altre |
| Dritto | prima | 3 | 7, 7, 7 | senza vite a 271, 204 e 192 secondi | 12, 9, 12 | 282, 183, 283 | vivo con 53, 100 e 87 | vivo con 300 e 300, in una partita non è nato |
| Dritto | ora | 3 | 7, 7, 7 | senza vite a 202, 222 e 213 secondi | 11, 12, 10 | 236, 283, 205 | cade a 181 secondi in una, vivo con 74 e 8 | vivo con 300, 261 e 300 |
| Fermo | prima | 1 | 7 | senza vite a 98 secondi | 11 | 243 | non è nato | non è nato |
| Fermo | ora | 1 | 7 | senza vite a 139 secondi | 8 | 122 | cade a 117 secondi | non è nato |

Cosa dicono. Sui capi il cambio si vede: al gatto in tondo il gabbiano cade in tutte e tre le partite, e il reale, che prima restava quasi intero, cade in una e resta con 22 e 72 su 300 nelle altre due. Il prezzo, nelle stesse tre partite, sono più vite perse: 4, 5 e 6 contro 2, 3 e 2. Da cosa venga non è misurato: la mira nuova, le tre carte in più e la spinta più lunga sono entrate insieme. La prima vita persa arriva prima che nasca un capo: lì la mira non c'entra, restano le carte e la spinta. Livello e nemici presi restano nella fascia di prima. Nelle sette partite il gatto ha preso la zampa fortunata sempre, il pelo gonfio in quattro e i riflessi pronti in due. Nessun errore in console, e il punto più basso dei fotogrammi al secondo è stato 56.

Dopo queste sette partite i numeri delle armi con i potenziamenti sono passati in una funzione provata dai test, senza cambiare cosa fa il gioco. Una partita di conferma, in tondo: alba, 4 vite perse, livello 13, il gabbiano caduto a 141 secondi e il reale a 287, nessun errore in console.

Con il supplì a terra, notte da 5 minuti. La riga «prima» è quella «ora» della tabella qui sopra.

| Gatto | Quando | Partite | Vite perse | Come finisce | Livello alla fine | Nemici presi | Supplì caduti | Supplì mangiati |
|---|---|---|---|---|---|---|---|---|
| In tondo | prima | 3 | 4, 5, 6 | alba | 11, 14, 18 | 262, 342, 577 | | |
| In tondo | con il supplì | 3 | 2, 6, 3 | alba | 12, 20, 16 | 310, 740, 456 | 5, 4, 5 | 4, 3, 5 |
| Dritto | prima | 3 | 7, 7, 7 | senza vite a 202, 222 e 213 secondi | 11, 12, 10 | 236, 283, 205 | | |
| Dritto | con il supplì | 3 | 7, 7, 7 | senza vite a 209, 223 e 193 secondi | 11, 10, 10 | 232, 218, 233 | 3, 2, 3 | 3, 2, 1 |
| Fermo | prima | 1 | 7 | senza vite a 139 secondi | 8 | 122 | | |
| Fermo | con il supplì | 1 | 7 | senza vite a 162 secondi | 9 | 134 | 2 | 2 |

Cosa dicono. Al gatto in tondo due partite su tre perdono meno vite di prima, 2 e 3, e una ne perde 6. In quella il gatto ha portato il miagolio al livello 4 ed è arrivato al livello 20 con 740 nemici presi: è lo stesso disegno già visto, livello alto con il miagolio e più vite perse, ancora senza spiegazione. I supplì mangiati sono 4, 3 e 5, cioè 120, 90 e 150 punti di vita al massimo: più o meno una barra a partita. Al gatto che scappa dritto non cambia niente: finisce le vite negli stessi secondi di prima, e in una partita lascia a terra due supplì su tre: è probabile che sia perché non torna indietro, ma non è misurato. Il gatto fermo dura 162 secondi invece di 139, con una partita sola. Tre partite per riga sono poche, e con lo stesso seme le partite non vengono uguali: il supplì non ribalta niente, e se 2 su 100 e 30 secondi sono giusti lo dice una persona che gioca.

Nella notte da 15 minuti, due partite in tondo. Nella prima il gatto perde una vita, arriva al livello 11 con 267 nemici presi, e cadono 5 supplì, tutti mangiati. Nella seconda perde 5 vite, arriva al livello 38 con 2313 nemici presi, e ne cadono 16, di cui 13 mangiati. Il tetto dato dalla pausa è 31. Per questa notte non c'è un «prima» con le stesse regole, quindi qui il conto dice solo quanti ne cadono.

Nelle nove partite nessun errore in console, e il punto più basso dei fotogrammi al secondo è stato 57. Dopo le partite è cambiata solo la scritta sopra il gatto, che ora dice quanto ha curato davvero.

Con le spinte leggere, notte da 5 minuti. Il mucchio è la parte dei nemici, su cento, che ne hanno un altro più vicino di 4 pixel: la media dal trentesimo secondo, e il punto più alto. Prima e dopo hanno gli stessi semi e le stesse condizioni, con la foto che girava insieme alle tre partite in tondo. «Prima» è il codice con la sola misura del mucchio, senza le spinte.

| Gatto | Quando | Partite | Mucchio medio | Mucchio massimo | Vite perse | Come finisce | Nemici presi | Fotogrammi al secondo, il più basso |
|---|---|---|---|---|---|---|---|---|
| In tondo | prima | 3 | 91, 76, 64 | 99, 98, 97 | 2, 6, 6 | alba | 207, 1608, 2496 | 50, 46, 49 |
| In tondo | con le spinte | 3 | 9, 11, 11 | 49, 44, 51 | 5, 7, 7 | alba, poi senza vite a 189 e a 297 secondi | 416, 520, 1594 | 57, 58, 59 |
| Dritto | prima | 3 | 19, 18, 20 | 51, 41, 44 | 7, 7, 7 | senza vite a 210, 232 e 216 secondi | 258, 178, 237 | 58, 57, 57 |
| Dritto | con le spinte | 3 | 0, 1, 0 | 13, 7, 7 | 7, 7, 7 | senza vite a 189, 224 e 185 secondi | 237, 231, 186 | 57, 54, 57 |
| Fermo | prima | 1 | 84 | 98 | 7 | senza vite a 152 secondi | 133 | 57 |
| Fermo | con le spinte | 1 | 10 | 33 | 7 | senza vite a 122 secondi | 333 | 58 |

Due foto con il gatto fermo e invincibile, a un minuto di notte. Prima: 74 nemici vivi, 69 sullo schermo, e a occhio se ne vedono una dozzina, impilati sul gatto e in fila. Con le spinte: 42 vivi, 37 sullo schermo, in una folla compatta intorno al gatto, dove gli sprite si coprono ancora in parte ma si contano molti più nemici. Prima, a due minuti, i vivi erano 270 e a occhio se ne vedeva una ventina.

Cosa dicono. Il mucchio scende in tutti e tre i modi: al gatto in tondo da 64-91 nemici su cento a 9-11, al gatto fermo da 84 a 10. Il prezzo è che il gatto perde più vite. In tondo 5, 7 e 7 contro 2, 6 e 6, e due partite su tre restano senza vite prima dell'alba; anche dritto e fermo restano senza vite un po' prima (dritto a 189, 224 e 185 secondi contro 210, 232 e 216, fermo a 122 contro 152). Perché, non è misurato. La lettura: prima un mucchio di nemici uno sopra l'altro toccava il gatto quasi come un nemico solo, adesso la folla occupa più spazio e il gatto la incontra più spesso. Con il gatto fermo succede anche un'altra cosa: con le spinte ne elimina di più, 333 contro 133, e i vivi non arrivano mai al tetto, 65 al massimo contro 300. Il punto più basso dei fotogrammi al secondo in tondo è salito da 46-50 a 57-59; in dritto è 54-57 contro 57-58. Tre partite per riga sono poche, e con lo stesso seme le partite non vengono uguali. Quanto debba essere difficile si decide nella bilanciatura, con i numeri di Francesco: le leve sono la forza della spinta e il danno dei nemici. Nelle quattordici partite nessun errore in console.

Con i modi di camminare, notte da 5 minuti, stessi semi. La riga «prima» è quella «con le spinte» della tabella qui sopra.

| Gatto | Quando | Partite | Vite perse | Come finisce | Nemici presi | Mucchio medio | Fotogrammi al secondo, il più basso |
|---|---|---|---|---|---|---|---|
| In tondo | prima | 3 | 5, 7, 7 | alba, poi senza vite a 189 e a 297 secondi | 416, 520, 1594 | 9, 11, 11 | 57, 58, 59 |
| In tondo | con i modi di camminare | 3 | 7, 7, 7 | senza vite a 232, 240 e 212 secondi | 988, 201, 191 | 10, 12, 10 | 54, 54, 54 |
| Dritto | prima | 3 | 7, 7, 7 | senza vite a 189, 224 e 185 secondi | 237, 231, 186 | 0, 1, 0 | 57, 54, 57 |
| Dritto | con i modi di camminare | 3 | 7, 7, 7 | senza vite a 247, 219 e 253 secondi | 338, 258, 252 | 1, 1, 1 | 57, 57, 58 |
| Fermo | prima | 1 | 7 | senza vite a 122 secondi | 333 | 10 | 58 |
| Fermo | con i modi di camminare | 1 | 7 | senza vite a 117 secondi | 109 | 28 | 57 |

Cosa dicono. Al gatto che scappa dritto i modi di camminare danno respiro: resta senza vite più tardi in due partite su tre, e prende più nemici. Al gatto in tondo tolgono l'unica alba che restava: nessuna partita arriva all'alba, e finiscono a 232 e 212 secondi invece di 300 e 297, mentre la terza dura di più, 240 invece di 189. Il gatto fermo dura più o meno come prima, ma prende un terzo dei nemici, 109 contro 333, e il mucchio sale da 10 a 28. Perché, non è misurato: dentro ci sono tre cambi insieme, e la zanzara che ondeggia, la pantegana che non ti segue e il piccione che si ferma spostano tutti e tre dove sono i nemici quando le armi partono. Tre partite per riga sono poche, e qui più che mai conta come si muove una persona, non il gatto automatico. Nessun errore in console nelle sette partite. Come si vedono muoversi, una foto ferma non lo dice: è da guardare giocando.

## La domanda da colloquio
«Come hai tenuto 500 nemici a 60 fotogrammi al secondo?» La risposta completa arriva con la prova dei 500, che è ancora da fare. Quello che c'è già: i nemici vivono in un pool con un tetto, quindi il gioco non crea e non butta oggetti mentre si gioca; ogni nemico fa pochi conti a fotogramma, la distanza dal gatto e la direzione per raggiungerlo; le collisioni con il gatto e con i ciuffi di pelo le cerca l'indice spaziale di Phaser, e i nemici tra loro non si urtano con la fisica: si scostano con una spinta calcolata su una griglia, che guarda solo le caselle vicine. Con 300 nemici vivi, nelle partite automatiche il punto più basso è stato tra 52 e 59 fotogrammi al secondo, con tre partite insieme sullo stesso computer.

## Lo spunto per il post
Credevo di sapere perché era troppo facile. Poi ho fatto giocare il gioco da solo, e i numeri hanno detto un'altra cosa.

## Da fare
- I capi con una persona che gioca: se la vita è giusta, adesso che il graffio li sceglie.
- Il miagolio con una persona che gioca: quanto danno deve fare, se la spinta più lunga va bene, e se l'onda ingrandita va bene o va ridisegnata più grande.
- I tre passivi con una persona che gioca: nomi, rarità e numeri sono di partenza. Da guardare se con undici carte le armi arrivano troppo tardi.
- Separare, con le partite automatiche, quanto pesano sulle vite perse la mira nuova del graffio, le tre carte in più e la spinta più lunga.
- Capire perché, con il miagolio regalato dal primo secondo, il gatto in tondo sale tanto di livello e perde più vite: serve una partita di controllo.
- Il supplì con una persona che gioca: ogni quanto cade, quanto cura, e se si capisce perché a volte il gatto lo lascia a terra.
- Le spinte leggere con una persona che gioca: se la folla si legge meglio, e se il gatto regge come prima.
- I modi di camminare con una persona che gioca: se si riconoscono, e quanto cambiano la difficoltà.
- La prova con 500 nemici sul computer e sul telefono, con i numeri qui.
- Il tetto dei 300: con il gatto in tondo si tocca quasi sempre. Da decidere insieme alla prova dei 500.
- Portare la partita automatica nel repository, come strumento.
- La bilanciatura, con i numeri scelti da Francesco, e una partita di prova con una persona che non conosce il gioco.
