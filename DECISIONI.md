# Decisioni

Ogni scelta del progetto, sempre nello stesso ordine: data, contesto, scelta, alternative scartate, perché, cosa comporta.

## Contenuti
- Tappa 1a, 8-10 novembre 2026: Vite e TypeScript a mano, ingrandimento intero, due PC, il Worker statico, la regola dei sette giorni, l'icona, la misura, Vitest, il joystick, le misure arrotondate
- Tappa 1b, 12 novembre 2026: oxlint, il controllo prima del commit, GitHub Actions, il gioco installabile, la prova di fumo con Playwright, `/api/ping` nel Worker

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

## 2026-11-10 · L'ingrandimento tiene conto delle misure arrotondate dal browser
- **Contesto:** sul telefono di prova, a tutto schermo, la scena era ingrandita 3 volte e non 4. Lo schermo è alto 1080 pixel veri, cioè 375,65 pixel CSS a densità 2,875 (dedotta dalla schermata, larga 2424 pixel per 843 pixel CSS dichiarati: il pannello la mostrava arrotondata a 2,88). Il browser dichiara 375, e 375 per 2,875 fa 1078.
- **Scelta:** il calcolo esce da `src/main.ts` e diventa una funzione pura, `integerZoom` in `src/logic/zoom.ts`. Con una densità non intera considera che ogni lato della finestra può essere fino a un pixel CSS più grande di quanto dichiarato, e prende il numero intero di pixel veri più grande possibile. Con una densità intera usa le misure così come sono.
- **Alternative scartate:** lasciare 3, con il gioco a tre quarti della misura giusta proprio sul telefono di prova; leggere la misura con i decimali da `visualViewport`, che non si poteva provare senza ripubblicare.
- **Perché:** la tolleranza si prova con un test, senza telefono: il test con le misure vere è stato scritto prima e falliva dando 3.
- **Cosa comporta:** nel caso peggiore la scena sporge di meno di un pixel CSS, e sul telefono di prova entra esatta. Un piccolo scarto nel conto protegge dagli errori dell'ultimo decimale del computer, con un test suo. Il pannello della misura ora mostra la densità con tre decimali. Nella simulazione Phaser sposta la scena di un pixel CSS verso l'alto quando la finestra è alta 375 esatti. Sul telefono, guardato dopo la ripubblicazione, non succede: la scena occupa i 1080 pixel veri dell'altezza senza righe tagliate, e il pannello conferma la densità 2,875. La voce dell'8 novembre resta com'era: la densità lì è scritta 2,88, il numero arrotondato.

## 2026-11-12 · oxlint come lint, e Phaser importato come namespace
- **Contesto:** la tappa 1b vuole un lint che giri a ogni commit, quindi deve essere veloce.
- **Scelta:** oxlint 1.91.0, con le regole di correttezza come errori e quelle sospette e di prestazioni come avvisi, e `--deny-warnings` perché anche un avviso fermi il controllo. Phaser si importa con `import * as Phaser from "phaser"` al posto di `import Phaser from "phaser"`.
- **Alternative scartate:** ESLint, più diffuso, che qui non è stato provato; spegnere la regola `import/no-named-as-default-member`, che segnalava 19 volte l'import di Phaser.
- **Perché:** oxlint è fatto per essere veloce (il controllo intero, lint più tipi più test, dura circa 4 secondi sul PC di casa) e legge TypeScript senza plugin in più: il file `.oxlintrc.json` serve solo a scegliere quali regole contano come errori. Phaser esporta ogni pezzo anche con il suo nome, quindi l'import come namespace dà gli stessi `Phaser.Game`, `Phaser.Scene` e così via, e la regola resta accesa per il codice futuro.
- **Cosa comporta:** `npm run lint`. Dopo il cambio dell'import tipi, test e build sono verdi, e nel browser la scena del gioco e quella della misura si aprono senza errori in console. La versione è la 1.91.0 e non la 1.93.0, per la regola dei sette giorni.

## 2026-11-12 · Il controllo prima del commit con un hook di git, senza pacchetti
- **Contesto:** lint, tipi e test devono partire da soli prima di ogni commit, sui due PC.
- **Scelta:** uno script in `.githooks/pre-commit` che lancia `npm run check`. Lo script `prepare` di `package.json` esegue `git config core.hooksPath .githooks`, quindi `npm install` lo attiva su ogni PC. `.gitattributes` tiene lo script con gli a capo di Linux.
- **Alternative scartate:** Husky o simple-git-hooks, che fanno la stessa cosa con un pacchetto in più; controllare solo i file cambiati con lint-staged, che oggi non serve perché il controllo intero dura circa 4 secondi.
- **Perché:** è una funzione di git, si legge in dieci righe e non aggiunge dipendenze.
- **Cosa comporta:** provato con un test rotto apposta: il controllo esce con codice 1 e il commit non nasce. Il controllo si può saltare con `--no-verify`: per questo GitHub Actions rifarà tutto a ogni push.

## 2026-11-12 · Il controllo su GitHub con GitHub Actions
- **Contesto:** il controllo prima del commit si può saltare (`--no-verify`) e c'è solo sui PC dove è stato fatto `npm install`. Serve un controllo che non dipenda dal PC.
- **Scelta:** un workflow, `.github/workflows/ci.yml`, a ogni push e pull request verso main: macchina Ubuntu, Node 24, `npm ci`, `npm run check` (lint, tipi, test) e `npm run build`. Le azioni `actions/checkout` 7.0.1 e `actions/setup-node` 7.1.0 sono fissate all'hash del commit, con la versione nel commento. Permessi in sola lettura, `persist-credentials: false`, un push nuovo ferma il controllo vecchio dello stesso ramo, limite di 10 minuti.
- **Alternative scartate:** le azioni con il tag `@v7`, più leggibili ma che possono cambiare sotto i piedi; una matrice con più versioni di Node, che a un gioco nel browser non serve; la cache di `node_modules` al posto di quella di npm.
- **Perché:** è lo stesso controllo del PC, su una macchina pulita, e non si salta. Le due azioni sono uscite da più di sette giorni (checkout 7.0.1 il 20 luglio 2026, setup-node 7.1.0 l'8 ottobre 2026).
- **Cosa comporta:** sul PC `npm ci`, `npm run check` e `npm run build` passano, e il file è YAML valido. La prima esecuzione vera si vede solo dopo il push. La pubblicazione resta a mano fino a Workers Builds.

## 2026-11-12 · Il gioco installabile, con l'aggiornamento automatico
- **Contesto:** Francesco vuole vedere il gioco dal telefono, installarlo e riceverlo aggiornato da solo, come Mnemosine. Era previsto alla tappa 5, viene anticipato.
- **Scelta:** vite-plugin-pwa 2.0.0 in `vite.config.ts`: manifest con nome, icone, tutto schermo e orizzontale; service worker di Workbox che tiene sul telefono i 14 file del gioco; `registerType: "autoUpdate"` con `skipWaiting` e `clientsClaim` scritti a mano. Le icone escono dal gatto fermo con `art/icone.py`, ingrandito senza sfumare su fondo `#1c2133`; quella `maskable` ha il gatto più piccolo, perché Android la ritaglia.
- **Alternative scartate:** manifest e service worker scritti a mano, più da mantenere; un pulsante «aggiorna» o un avviso, che a un gioco non serve; ricaricare la pagina appena arriva la versione nuova, che interromperebbe la partita.
- **Perché:** è la strada già provata su Mnemosine. Con `injectRegister: "script"` il plugin non attiva da solo il cambio immediato: senza le due righe la versione nuova restava in attesa (provato).
- **Cosa comporta:** la versione nuova si vede a un'apertura successiva con la rete, mai a metà partita. Le prove nel browser del PC (installabile, senza rete, aggiornamento da A a B) sono nel diario della 1b; sul telefono vero sono state fatte il 12 novembre, e per l'aggiornamento è servita più di un'apertura. La versione di Node è in `.node-version` (24), letta da GitHub Actions e da Workers Builds.

## 2026-11-12 · La prova di fumo con Playwright, solo su GitHub
- **Contesto:** i test di Vitest provano la logica, ma non dicono se la build si apre nel browser: un'immagine con il nome sbagliato o un errore all'avvio passerebbero.
- **Scelta:** Playwright 1.64.1, una sola prova in `tests/e2e/fumo.e2e.ts`, solo Chromium. Apre la build servita da `vite preview` (il gioco e `?misura`), aspetta il segno `data-scena="pronta"` che `GameScene` mette sul canvas alla fine di `create()`, e controlla che non ci siano errori in console, errori di JavaScript o immagini che non arrivano come `image/png`. Gira con `npm run test:e2e` e su GitHub Actions dopo la build; non nel controllo prima del commit e non in Workers Builds.
- **Alternative scartate:** prove di gioco vere sul canvas (premere tasti, muovere il gatto), fragili in un browser senza schermo; più browser, che per una prova di fumo non servono; un'attesa a tempo fisso al posto del segno sul canvas; il nome `.spec.ts`, che Vitest avrebbe preso per suo.
- **Perché:** è il piano della tappa: prova di fumo solo in CI, il controllo prima del commit resta veloce. Il file `.e2e.ts` tiene separati i due mondi senza toccare la configurazione di Vitest.
- **Cosa comporta:** provata rotta apposta, con un'immagine dal nome sbagliato: rossa, e ha mostrato che `vite preview` risponde «200» con la pagina al posto di un file che non c'è, per questo si controlla il tipo. Workers Builds non aspetta GitHub: se solo la prova di fumo è rossa, Cloudflare pubblica lo stesso, perché il suo comando lancia `npm run check` e la build, non Playwright.

## 2026-11-12 · `/api/ping` nello stesso Worker dei file, solo per `/api/*`
- **Contesto:** il Worker serviva solo i file statici (decisione del 10 novembre). La tappa 6 vuole punteggi e classifica sul server: la tappa 1b prova prima la strada con una rotta semplice.
- **Scelta:** `main: ./worker/index.ts` e `run_worker_first: ["/api/*"]` in `wrangler.jsonc`. Il Worker risponde a `/api/ping` con `{"ok":true}` (GET e HEAD, `Cache-Control: no-store`), con 405 agli altri metodi, con un 404 JSON alle altre rotte `/api` e con un 404 di testo agli indirizzi senza file. Niente collegamento ai file (`binding`): al Worker non servono. Nel service worker del gioco installato `/api/` è esclusa dalla risposta con la pagina (`navigateFallbackDenylist`).
- **Alternative scartate:** un secondo Worker solo per l'API, con due indirizzi e due pubblicazioni; il Worker davanti a ogni richiesta (`run_worker_first: true`), che farebbe passare dal codice anche ogni immagine; un framework per le rotte, come Hono, per una rotta sola.
- **Perché:** un solo indirizzo, una sola pubblicazione, e i file restano serviti come prima. La funzione `rispondi` riceve una `Request` e restituisce una `Response`, quindi si prova con Vitest senza Cloudflare.
- **Cosa comporta:** 5 test scritti prima del codice; prova in locale con Wrangler riuscita. La prova di fumo con Playwright usa `vite preview`, che non esegue il Worker: la rotta la provano i test di Vitest e, dopo la pubblicazione, l'indirizzo pubblico.
