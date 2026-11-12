# Tappa 1b: qualità e pubblicazione automatica

L'obiettivo della tappa: ogni push si controlla e si pubblica da solo, ma solo se è tutto verde. Dal push al gioco online non passa più niente a mano.

**Stato: chiusa il 12 novembre 2026, aperta lo stesso giorno.** Fatti il lint, il controllo prima del commit, il controllo su GitHub con GitHub Actions e, anticipato su richiesta, il gioco installabile sul telefono con l'aggiornamento automatico, e la pubblicazione automatica con Workers Builds. Il gioco installato è provato sul telefono, aggiornamento compreso. Fatte anche la prova di fumo nel browser con Playwright e la rotta `/api/ping`. La prova finale con un test rotto apposta ha fermato sia il controllo su GitHub sia la pubblicazione.

**Fatto quando:** `/api/ping` risponde dall'indirizzo pubblico; un push verde pubblica da solo; un test rotto ferma il commit e la pubblicazione, provato.

## Cosa c'è di nuovo
- **12 novembre 2026, il lint e il controllo prima del commit.** oxlint controlla il codice a ogni commit insieme ai tipi e ai test. Ha trovato una cosa sola, ripetuta 19 volte: il modo di importare Phaser, sistemato in tre file. Il controllo prima del commit è provato con un test rotto apposta: il commit si ferma.
- **12 novembre 2026, il controllo su GitHub.** Il file `.github/workflows/ci.yml`: a ogni push e a ogni pull request verso main GitHub prende una macchina Linux pulita, installa i pacchetti con `npm ci` e lancia lo stesso `npm run check` del PC, più la build. La spunta verde o la croce rossa compaiono accanto a ogni commit su GitHub e nel README. La prima esecuzione, sul commit `293e877`, è verde: tutti i passi in 25 secondi.
- **12 novembre 2026, il gioco si installa sul telefono.** Anticipato dalla tappa 5 perché Francesco vuole vederlo e installarlo dal telefono, aggiornato da solo come Mnemosine. Con vite-plugin-pwa il gioco ha un manifest (nome, icone, tutto schermo, orizzontale) e un service worker che tiene sul telefono i 14 file che servono per giocare, per poter giocare anche senza rete. Provato nel browser del computer e poi sul telefono (sotto, «Le prove della versione installabile»). Le icone sono il gatto fermo ingrandito, fatte da `art/icone.py`. La versione di Node è scritta una volta sola in `.node-version`.
- **12 novembre 2026, Workers Builds collegato.** Dal sito di Cloudflare il Worker è collegato al repository su GitHub, ramo main. A ogni push Cloudflare lancia `npm run check && npm run build` e, solo se passa, `npx wrangler deploy`. Le anteprime per gli altri rami sono spente: si lavora solo su main. La prima pubblicazione automatica, partita da questo stesso commit, è andata a buon fine in meno di un minuto.
- **12 novembre 2026, la prova di fumo nel browser.** Playwright apre la build vera in Chromium, sia il gioco sia `?misura`, e aspetta che la scena sia costruita. Se in console c'è un errore, se JavaScript si blocca o se un'immagine del gioco non arriva, la prova è rossa. Gira sul PC con `npm run test:e2e` e su GitHub dopo la build. Provata rotta apposta: con il nome di un'immagine sbagliato diventa rossa.
- **12 novembre 2026, il primo codice sul server: `/api/ping`.** Il Worker, finora solo file statici, ha un pezzo di codice in `worker/index.ts`. A `/api/ping` risponde `{"ok":true}` in JSON, senza cache: serve a sapere che il server è vivo, e prepara le rotte della classifica della tappa 6. Pagina, codice del gioco e immagini continuano ad arrivare dai file, senza passare dal Worker. I 5 test della rotta sono stati scritti prima del codice e visti rossi. Poi la prova in locale con Wrangler, come farà Cloudflare: ping, metodo sbagliato, rotta che non esiste, pagina, immagini e un file che non c'è rispondono tutti come devono.

## Le tecnologie di questa tappa, e perché
| Strumento | Versione | Cosa fa qui | Perché questo |
|---|---|---|---|
| [oxlint](https://oxc.rs/docs/guide/usage/linter.html) | 1.91.0 | Il lint: cerca errori comuni e codice sospetto senza eseguirlo | È scritto in Rust ed è pensato per essere veloce: sul PC di casa il controllo intero, lint più tipi più test, dura circa 4 secondi, quindi si può lanciare a ogni commit senza aspettare. Legge TypeScript senza plugin in più; il file `.oxlintrc.json` sceglie solo quali regole contano come errori |
| Git hook `pre-commit` | | Lancia lint, tipi e test prima di ogni commit | È una funzione di git, non serve un pacchetto in più (vedi `DECISIONI.md`) |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | 2.0.0 | Manifest, service worker e lista dei file da tenere sul telefono | Si aggancia a Vite, che c'è già, e usa Workbox di Google per il service worker: poche righe di configurazione in `vite.config.ts`. È la stessa strada di Mnemosine |
| [GitHub Actions](https://docs.github.com/actions) | checkout 7.0.1, setup-node 7.1.0 | Rifà il controllo su GitHub a ogni push | Il repository sta già su GitHub, ed è gratis per i repository pubblici. Il controllo sul PC si può saltare, questo no |
| [Playwright](https://playwright.dev) | 1.64.1 | La prova di fumo: apre la build in un browser vero e controlla che il gioco parta | Guida un browser vero, qui Chromium, e ha già dentro l'attesa delle condizioni (`expect` riprova finché la condizione è vera o scade il tempo). Accende da solo il server della build e lo spegne alla fine (vedi `DECISIONI.md`) |

La versione di oxlint è la 1.91.0 e non l'ultima, la 1.93.0: nel progetto un pacchetto nuovo entra nell'ultima versione uscita da almeno sette giorni, così un'eventuale versione difettosa ha il tempo di essere scoperta da altri. Per la stessa regola Playwright è alla 1.64.1: la 1.65.0 è uscita il 5 novembre e il 12 non aveva ancora sette giorni pieni.

## I concetti, in parole semplici
- **Lint.** Un programma che legge il codice senza eseguirlo e segnala gli errori comuni: una variabile mai usata, un confronto che è sempre vero, un import scritto in un modo che può confondere. Il controllo dei tipi dice se i pezzi combaciano, il lint se il codice ha l'aria di un errore.
- **Errore e avviso.** Nella configurazione (`.oxlintrc.json`) le regole sicure sono errori, quelle che possono avere eccezioni sono avvisi. Con `--deny-warnings` anche un avviso ferma il controllo: così gli avvisi non si accumulano mai.
- **Git hook.** Uno script che git lancia da solo in un momento preciso. Il `pre-commit` parte quando si dà il comando del commit, prima di crearlo: se lo script finisce con un errore il commit non nasce.
- **Perché il controllo sta anche sul PC e non solo su GitHub.** Sul PC l'errore si vede in pochi secondi, prima che esca. Su GitHub si controlla tutto di nuovo, perché il controllo sul PC si può saltare e non c'è su ogni computer.
- **CI, integrazione continua.** Ogni modifica che arriva su GitHub viene controllata subito, in automatico, su una macchina che non è la tua. «Sul mio PC funziona» non basta più: deve funzionare su una macchina pulita, con solo quello che c'è nel repository.
- **Workflow, job e step.** Un workflow è un file YAML in `.github/workflows/`. Dice quando partire (`on`: push e pull request) e cosa fare: un job gira su una macchina, e i suoi step sono i comandi uno dopo l'altro. Se uno step fallisce, il job si ferma ed è rosso.
- **`npm ci` e non `npm install`.** `npm ci` installa esattamente le versioni scritte in `package-lock.json` e si ferma se il lockfile non va d'accordo con `package.json`. Non lo riscrive mai: su una macchina di controllo è quello che si vuole.
- **Azioni fissate al commit.** Le azioni sono programmi scritti da altri. Con `@v7` si prende quello che il loro autore chiama v7 oggi, e domani può cambiare. Con l'hash del commit si prende sempre lo stesso codice; la versione resta scritta nel commento.
- **PWA, il sito che si installa.** Una pagina web con un manifest (il biglietto da visita: nome, icone, come aprirsi) e un service worker. In generale Chrome su Android allora permette di installarlo dal suo menu: compare l'icona sulla Home e il gioco si apre a tutto schermo, senza la barra del browser.
- **Service worker.** Un piccolo programma che il browser tiene accanto alla pagina e che si mette in mezzo tra la pagina e la rete. Qui, alla prima apertura, salva sul telefono tutti i file del gioco; dalle volte dopo li serve da lì, quindi il gioco può partire anche senza rete (provato nel browser del PC e sul telefono).
- **L'aggiornamento automatico.** A ogni apertura con la rete il service worker controlla se c'è una versione nuova. Se c'è la scarica in silenzio e prende il posto della vecchia; la partita aperta non si ricarica, la versione nuova si vede dalla prossima apertura. Nessun pulsante «aggiorna», nessuno store.
- **Prova di fumo.** Il nome viene dall'elettronica: si accende il circuito e si guarda se esce fumo. Non prova che il gioco sia giusto, prova che non è rotto in modo evidente: la pagina si apre, la scena parte, niente errori. I test di Vitest provano la logica pezzo per pezzo; questa prova tutto insieme, nel browser, con la build che si pubblica.
- **Unit test ed end-to-end.** I test di Vitest sono unit test: un pezzo di logica alla volta, senza browser, in un secondo. La prova di Playwright è end-to-end, da un capo all'altro: build, server, browser, pagina. È più lenta e più fragile, per questo è una sola e non sta nel controllo prima del commit.
- **Il segno sul canvas.** Da fuori non si vede quando Phaser ha finito di costruire la scena. Alla fine di `create()` la scena scrive `data-scena="pronta"` sul canvas, e la prova aspetta quel segno: niente attese a tempo fisso, che sono lente quando va bene e sbagliate quando la macchina è lenta.
- **Worker e file statici insieme.** Su Cloudflare lo stesso Worker fa due lavori: serve i file della build (`assets` in `wrangler.jsonc`) ed esegue il codice di `worker/index.ts` (`main`). Con `run_worker_first: ["/api/*"]` il codice parte solo per gli indirizzi che iniziano con `/api/`. Un file che esiste lo serve Cloudflare direttamente. Un indirizzo che non corrisponde a nessun file arriva al Worker, e il Worker risponde con un 404.
- **Rotta e API.** Una rotta è un indirizzo a cui il server risponde con dati invece che con una pagina. L'insieme delle rotte è l'API del gioco: oggi c'è solo il ping, alla tappa 6 arriveranno i punteggi.
- **I codici di risposta.** 200 vuol dire tutto bene, 404 «non c'è», 405 «metodo non ammesso»: `/api/ping` si legge con GET (o HEAD, quello di `curl -I`), e a un POST risponde 405 dicendo nell'intestazione `Allow` quali metodi accetta.
- **Il service worker e le rotte.** Il gioco installato risponde da solo con la sua pagina a ogni indirizzo che si apre, anche senza rete. Per `/api/` non deve farlo, la risposta deve arrivare dal server: in `vite.config.ts` c'è `navigateFallbackDenylist: [/^\/api\//]`.
- **Permessi minimi.** `permissions: contents: read`: il workflow può leggere il codice e nient'altro. Se un'azione fosse compromessa, non potrebbe scrivere nel repository.

## I comandi
- `npm run lint`: il lint su tutto il progetto.
- `npm run check`: lint, tipi e test, uno dopo l'altro. È quello che lancia il controllo prima del commit.
- `git hook run pre-commit`: lancia il controllo come farebbe git, senza fare il commit.
- `npm run test:e2e`: la prova di fumo, dopo `npm run build`. Se è rossa, la registrazione passo per passo è in `test-results/` e si apre con `npx playwright show-trace`.
- `npm ci && npm run check && npm run build && npm run test:e2e`: sul PC, gli stessi passi del controllo su GitHub.
- `npm run preview:worker`, poi `curl http://localhost:8787/api/ping`: la build e il Worker in locale, come su Cloudflare.

Su un PC appena clonato `npm install` attiva il controllo da solo: lo script `prepare` di `package.json` dice a git di prendere gli hook dalla cartella `.githooks/`.

## Cosa è stato difficile
- **Gli a capo su Windows.** Git su Windows può salvare i file con gli a capo di Windows, e uno script di shell così non parte. Il file `.gitattributes` tiene gli script di `.githooks/` con gli a capo di Linux.
- **Il lockfile tra due PC.** Sul PC di casa npm toglie da `package-lock.json` le righe `libc` dei pacchetti per Linux, che l'npm dell'altro PC scrive. Su Windows non cambia cosa si installa. Su Linux, come sulla macchina di GitHub, il campo `libc` distingue le varianti glibc e musl dei pacchetti: senza, è probabile che npm scarichi anche quelle che non servono, senza fare danni. È una deduzione, la documentazione di npm non lo dice. In più sporca le differenze tra un commit e l'altro.
- **L'aggiornamento che restava in attesa.** La prima prova dell'aggiornamento: la versione nuova si scaricava ma restava «in attesa» finché tutte le schede del gioco non venivano chiuse, e sul telefono un'app installata può restare aperta a lungo. Il plugin attiva da solo il cambio immediato (`skipWaiting` e `clientsClaim`) solo quando registra il service worker in modo «auto»; qui il modo è «script», quindi le due righe vanno scritte a mano. Con le due righe la prova è riuscita.
- **Gli indirizzi senza file.** Il primo Worker rispondeva a tutto quello che non era `/api/ping` con un errore JSON «rotta sconosciuta». La documentazione di Cloudflare dice però che, quando c'è il codice, al Worker arrivano anche gli indirizzi che non corrispondono a nessun file: un'immagine sbagliata avrebbe ricevuto un errore da API. Prima un test nuovo, rosso, poi il Worker: fuori da `/api/` risponde con un 404 di testo, come prima.
- **Un server rimasto acceso.** La prima volta `npm ci` sul PC si è fermato con un errore di permessi: un `vite preview` lanciato prima per una prova nel browser era ancora acceso e teneva aperto un file di `node_modules`. Su Windows un file aperto non si può cancellare. Chiuso il server, `npm ci` è passato.

## Le prove della versione installabile
Nel browser di prova, con la build servita da Wrangler in locale come la servirà Cloudflare:
- **Installabile.** Il manifest risponde con il tipo giusto, il service worker si attiva e tiene 14 file.
- **Senza rete.** Server spento e pagina ricaricata: il gioco e la misura si aprono lo stesso, serviti dal service worker.
- **Aggiornamento.** Con la versione A attiva è stata pubblicata in locale una versione B con un segno nascosto nella pagina. All'apertura successiva il gioco è partito ancora con la A, la B si è installata e ha preso il posto della A senza restare in attesa, e la copia della A è stata cancellata. All'apertura dopo, la pagina era la B.

Sul telefono vero, il 12 novembre, con il gioco pubblicato da Workers Builds:
- **Installato e senza rete.** I passi erano: installarlo da Chrome, aprirlo dall'icona (tutto schermo, orizzontale), poi modalità aereo, chiuderlo e riaprirlo. L'esito, in una parola: «funziona tutto». I passi uno per uno non sono stati annotati.
- **Aggiornamento.** È stata pubblicata una versione con la scritta «prova aggiornamento 1» in un angolo. Alle prime aperture dall'icona non c'era, poi è comparsa da sola. Dalla schermata del telefono la scena è ingrandita 4 volte, con le bande ai lati. La scritta poi è stata tolta.
- **Da ricordare per l'interfaccia.** La scritta stava a 8 pixel dall'angolo in alto a sinistra e sul telefono sembrava tagliata, anche se nella schermata è intera. La causa probabile, non verificata: in orizzontale quell'angolo cade sul bordo arrotondato dello schermo o sul foro della fotocamera, che la schermata non mostra. Punteggio e pulsanti andranno tenuti lontani dagli angoli.

## La prova con il test rotto
Il 12 novembre il test dell'ingrandimento sul telefono è stato cambiato apposta, aspettando 5 al posto di 4. `git hook run pre-commit` ha risposto con 1 test fallito su 26 e «commit fermato», ed è uscito con codice 1. Rimesso il test, 26 su 26 e «tutto verde».

Lo stesso giorno la prova di fumo: in `GameScene` il gatto è stato chiesto con un nome di file che non esiste. Le due prove sono diventate rosse, ed è uscito codice 1. Ha insegnato una cosa: il server ha risposto «200», cioè tutto bene, ma con la pagina del gioco al posto dell'immagine, perché `vite preview` a un file che non c'è risponde con la pagina. Guardare solo il codice di risposta non sarebbe bastato: la prova controlla anche che il tipo sia `image/png`. Rimesso il nome giusto, 2 prove su 2 verdi.

**La prova finale, il 12 novembre.** Un test rotto apposta (l'ingrandimento del telefono di prova atteso 5, è 4) e, nella pagina, un commento invisibile: «questa versione ha un test rotto e non deve arrivare online». Se il commento fosse comparso sull'indirizzo pubblico, la versione rotta sarebbe uscita. Il commit `07d2062` l'ha fatto Francesco saltando apposta il controllo sul PC con `git commit --no-verify`, come farebbe chi lo salta davvero. Cosa è successo:
- **GitHub:** croce rossa. Si è fermato al passo «Lint, tipi e test»; build e prova di fumo non sono nemmeno partite.
- **Cloudflare:** la build di Workers Builds è «Failed» dopo 38 secondi, senza nessuna versione nuova. È rimasta attiva quella di prima, di `/api/ping`.
- **L'indirizzo pubblico:** per più di quattro minuti dopo il push il commento non è mai comparso.

Il commit dopo ha tolto il test rotto e il commento, con il controllo sul PC acceso.

## La domanda da colloquio
«Cosa succede dal tuo push al gioco online?» Prima ancora del push, a ogni commit, partono lint, tipi e test, e se uno è rosso il commit non nasce. Dopo il push GitHub Actions rifà tutto su una macchina pulita, più la build e la prova di fumo in un browser vero, e segna il commit verde o rosso. Nello stesso momento Workers Builds di Cloudflare prende lo stesso commit, rifà il controllo e la build e, solo se passano, pubblica il gioco. Il telefono scarica da solo la versione nuova quando apre il gioco con la rete e la mostra a un'apertura successiva: nella prova è servita più di un'apertura.

## Per dopo
- Cloudflare prima di pubblicare lancia lint, tipi e test, ma non la prova di fumo, che gira solo su GitHub. Se un giorno fosse rossa solo lei, il gioco uscirebbe lo stesso. Da decidere se spostare la pubblicazione dentro GitHub Actions, dopo la prova di fumo.
- Punteggio e pulsanti lontani dagli angoli dello schermo (la scritta di prova sembrava tagliata sul telefono).
