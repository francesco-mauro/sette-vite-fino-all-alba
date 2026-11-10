# Decisioni

Ogni scelta del progetto, sempre nello stesso ordine: data, contesto, scelta, alternative scartate, perché, cosa comporta.

## 2026-11-08 · Vite e TypeScript montati a mano
- **Contesto:** la tappa 1a prevedeva il modello ufficiale di Phaser (`npm create @phaserjs/game`).
- **Scelta:** progetto montato a mano con tre pacchetti: `phaser` 4.2.1, `vite` 8.3.6, `typescript` 7.0.2.
- **Alternative scartate:** il modello ufficiale, che porta file di esempio da togliere.
- **Perché:** ogni file nel progetto è uno che sappiamo spiegare; meno cose da ripulire.
- **Cosa comporta:** la configurazione di Vite è quella di base; si aggiunge solo quello che serve, tappa per tappa.

## 2026-11-08 · Ingrandimento intero nei pixel veri dello schermo
- **Contesto:** la scena è 480x270 e va ingrandita; in pixel art un ingrandimento non intero fa pixel di misure diverse.
- **Scelta:** ingrandimento calcolato a mano: quante volte 480x270 entra nei pixel veri dello schermo (pixel CSS per `devicePixelRatio`), arrotondato per difetto.
- **Alternative scartate:** `Phaser.Scale.FIT`, che ingrandisce di misure non intere; `Phaser.Scale.MAX_ZOOM`, che conta i pixel CSS e sul telefono di prova (densità 2,88) darebbe 1 invece di 4.
- **Perché:** sul telefono di prova la scena entra 4 volte esatte, 1920x1080 pixel veri (prova della tappa 0).
- **Cosa comporta:** ai lati e sopra restano bande vuote; se servirà, si mostra un po' più di strada al posto delle bande.

## 2026-11-08 · Due PC, GitHub in mezzo
- **Contesto:** si lavora da due PC diversi.
- **Scelta:** repository pubblico su GitHub, una copia sul Desktop di ogni PC, pull a inizio sessione e push a fine sessione, almeno un commit al giorno.
- **Perché:** la storia del lavoro resta visibile giorno per giorno.
- **Cosa comporta:** `node_modules` e `dist` fuori da git (`npm install` la prima volta su ogni PC); le impostazioni che cambiano da PC a PC restano fuori da git.

## 2026-11-10 · Un Worker che serve solo file statici
- **Contesto:** il gioco va online su Cloudflare Workers. Oggi è una pagina, un file JavaScript e qualche immagine: niente che debba girare su un server.
- **Scelta:** un Worker senza codice. `wrangler.jsonc` indica la cartella `dist/` e Cloudflare la serve. Il Worker si chiama come il repository, `sette-vite-fino-all-alba`.
- **Alternative scartate:** GitHub Pages, che non ha un posto per l'API della classifica; scrivere già adesso il codice del Worker, che oggi non avrebbe niente da fare.
- **Perché:** le richieste ai file statici sono gratuite e senza limite, e non c'è codice da mantenere finché non serve. Quando arriverà l'API, alla tappa 1b, il codice si aggiunge allo stesso Worker.
- **Cosa comporta:** un indirizzo che non esiste risponde 404. La data di compatibilità è quella del motore che arriva con Wrangler (3 novembre 2026) e si alza quando si aggiorna Wrangler. Si pubblica con `npm run deploy`; la prima volta serve `npx wrangler login`.

## 2026-11-10 · Pacchetti nuovi: l'ultima versione uscita da almeno sette giorni
- **Contesto:** il giorno in cui è stato installato Wrangler, l'ultima versione, la 4.159.0, era uscita da meno di un giorno.
- **Scelta:** di un pacchetto nuovo si installa l'ultima versione uscita da almeno sette giorni, contando le date e non le ore. Per Wrangler la 4.157.0, del 3 novembre 2026.
- **Alternative scartate:** l'ultima versione appena uscita.
- **Perché:** se una versione appena uscita ha un errore grave, o è stata manomessa, in sette giorni c'è il tempo perché qualcuno se ne accorga prima di noi. Aspettare costa poco.
- **Cosa comporta:** le versioni in `package.json` restano esatte, senza `^`. Un aggiornamento è una scelta, non un effetto collaterale di `npm install`.

## 2026-11-10 · L'icona della scheda
- **Contesto:** aprendo in un browser normale la pagina servita dal Worker, in console c'era un errore: il browser chiedeva `/favicon.ico` e trovava un 404.
- **Scelta:** un'icona vera, `public/favicon.png`: il gatto fermo ingrandito 4 volte, dichiarata in `index.html`.
- **Alternative scartate:** lasciare l'errore.
- **Perché:** la console senza errori è il punto di partenza di ogni prova. Alla tappa 1b una prova automatica controllerà proprio questo.
- **Cosa comporta:** un file in più in `CREDITS.md`. Se il disegno del gatto cambia, l'icona si rifà.

## 2026-11-10 · La misura dietro `?misura`
- **Contesto:** la tappa 1a chiede di sapere presto se Phaser 4 regge tanti sprite sul telefono di prova, prima di costruirci sopra il gioco.
- **Scelta:** una scena in più, che si accende solo con `?misura` nell'indirizzo e gira sopra quella del gioco. Gli sprite finti stanno in un gruppo con la fisica Arcade, come staranno i nemici. Il pannello dei numeri è HTML. I tempi si prendono con `performance.now()`, dall'inizio del fotogramma alla fine del disegno.
- **Alternative scartate:** una pagina di prova separata dal gioco, che misurerebbe un'altra cosa; il contatore di fotogrammi di Phaser, che è una media smussata e nasconde i buchi; un pannello disegnato dentro il gioco, che aggiungerebbe lavoro a quello che si misura.
- **Perché:** si misura il gioco vero, con lo stesso motore, la stessa scena e la stessa fisica, e lo strumento pesa il meno possibile.
- **Cosa comporta:** la fisica Arcade è accesa già adesso nella configurazione del gioco. Senza `?misura` il gioco parte come prima. La misura resta nel progetto e potrà servire di nuovo alla tappa 4, con i nemici veri.

## 2026-11-10 · Vitest adesso, e il test prima del codice
- **Contesto:** i test erano previsti alla tappa 1b. Ma il contatore dei fotogrammi è logica pura, e dai suoi numeri dipende una decisione: se Phaser 4 regge.
- **Scelta:** Vitest entra adesso. La logica pura sta in `src/logic/`, senza Phaser, e si scrive con il test prima: il test si guarda fallire, poi si scrive il codice che lo fa passare.
- **Alternative scartate:** provare il contatore a mano e aggiungere i test alla tappa 1b.
- **Perché:** uno strumento di misura sbagliato porta a decisioni sbagliate. E un test scritto dopo passa subito, senza dimostrare di saper trovare un errore.
- **Cosa comporta:** `npm test`, con 18 test. Alla tappa 1b restano il lint, il controllo prima del commit, GitHub Actions, la prova nel browser, la rotta `/api/ping`, la pubblicazione automatica e la prova con un test rotto apposta.

## 2026-11-10 · Il joystick di phaser4-rex-plugins
- **Contesto:** sul telefono serve un joystick virtuale. La tappa 1a chiede solo di sapere se il plugin scelto funziona con Phaser 4.2.1.
- **Scelta:** `phaser4-rex-plugins` 4.2.0, da cui si importa solo il joystick. Per ora sta fermo in basso a sinistra e non muove il gatto: il pannello della misura mostra forza e angolo.
- **Alternative scartate:** scriverlo da zero; farlo già comparire dove si appoggia il dito, che è una prova della tappa 2.
- **Perché:** si importa, passa il controllo dei tipi e risponde al tocco anche con l'ingrandimento calcolato a mano. Il dubbio sulla compatibilità con Phaser 4 si chiude adesso.
- **Cosa comporta:** `npm audit` segnala 2 avvisi di gravità bassa in `i18next-http-backend`, una dipendenza del pacchetto che il gioco non usa e che non entra nella build. Il pacchetto pesa circa 164 MB in `node_modules`, ma la misura e il joystick insieme aggiungono alla build 15 kB, contati prima della compressione.
