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
