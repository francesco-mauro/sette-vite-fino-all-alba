# Tappa 1b: qualità e pubblicazione automatica

L'obiettivo della tappa: ogni push si controlla e si pubblica da solo, ma solo se è tutto verde. Dal push al gioco online non passa più niente a mano.

**Stato: in corso dal 12 novembre 2026.** Fatti il lint, il controllo prima del commit, il controllo su GitHub con GitHub Actions e, anticipato su richiesta, il gioco installabile sul telefono con l'aggiornamento automatico, e la pubblicazione automatica con Workers Builds. Mancano la prova nel browser con Playwright, la rotta `/api/ping`, la prova sul telefono e la prova finale con un test rotto apposta.

**Fatto quando:** `/api/ping` risponde dall'indirizzo pubblico; un push verde pubblica da solo; un test rotto ferma il commit e la pubblicazione, provato.

## Cosa c'è di nuovo
- **12 novembre 2026, il lint e il controllo prima del commit.** oxlint controlla il codice a ogni commit insieme ai tipi e ai test. Ha trovato una cosa sola, ripetuta 19 volte: il modo di importare Phaser, sistemato in tre file. Il controllo prima del commit è provato con un test rotto apposta: il commit si ferma.
- **12 novembre 2026, il controllo su GitHub.** Il file `.github/workflows/ci.yml`: a ogni push e a ogni pull request verso main GitHub prende una macchina Linux pulita, installa i pacchetti con `npm ci` e lancia lo stesso `npm run check` del PC, più la build. La spunta verde o la croce rossa compaiono accanto a ogni commit su GitHub e nel README. La prima esecuzione, sul commit `293e877`, è verde: tutti i passi in 25 secondi.
- **12 novembre 2026, il gioco si installa sul telefono.** Anticipato dalla tappa 5 perché Francesco vuole vederlo e installarlo dal telefono, aggiornato da solo come Mnemosine. Con vite-plugin-pwa il gioco ha un manifest (nome, icone, tutto schermo, orizzontale) e un service worker che tiene sul telefono i 14 file che servono per giocare, per poter giocare anche senza rete. Provato nel browser del computer; sul telefono è da provare. Le icone sono il gatto fermo ingrandito, fatte da `art/icone.py`. La versione di Node è scritta una volta sola in `.node-version`.
- **12 novembre 2026, Workers Builds collegato.** Dal sito di Cloudflare il Worker è collegato al repository su GitHub, ramo main. A ogni push Cloudflare lancia `npm run check && npm run build` e, solo se passa, `npx wrangler deploy`. Le anteprime per gli altri rami sono spente: si lavora solo su main. La prima pubblicazione automatica, partita da questo stesso commit, è andata a buon fine in meno di un minuto.

## Le tecnologie di questa tappa, e perché
| Strumento | Versione | Cosa fa qui | Perché questo |
|---|---|---|---|
| [oxlint](https://oxc.rs/docs/guide/usage/linter.html) | 1.91.0 | Il lint: cerca errori comuni e codice sospetto senza eseguirlo | È scritto in Rust ed è pensato per essere veloce: sul PC di casa il controllo intero, lint più tipi più test, dura circa 4 secondi, quindi si può lanciare a ogni commit senza aspettare. Legge TypeScript senza plugin in più; il file `.oxlintrc.json` sceglie solo quali regole contano come errori |
| Git hook `pre-commit` | | Lancia lint, tipi e test prima di ogni commit | È una funzione di git, non serve un pacchetto in più (vedi `DECISIONI.md`) |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | 2.0.0 | Manifest, service worker e lista dei file da tenere sul telefono | Si aggancia a Vite, che c'è già, e usa Workbox di Google per il service worker: poche righe di configurazione in `vite.config.ts`. È la stessa strada di Mnemosine |
| [GitHub Actions](https://docs.github.com/actions) | checkout 7.0.1, setup-node 7.1.0 | Rifà il controllo su GitHub a ogni push | Il repository sta già su GitHub, ed è gratis per i repository pubblici. Il controllo sul PC si può saltare, questo no |

La versione di oxlint è la 1.91.0 e non l'ultima, la 1.93.0: nel progetto un pacchetto nuovo entra nell'ultima versione uscita da almeno sette giorni, così un'eventuale versione difettosa ha il tempo di essere scoperta da altri.

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
- **Service worker.** Un piccolo programma che il browser tiene accanto alla pagina e che si mette in mezzo tra la pagina e la rete. Qui, alla prima apertura, salva sul telefono tutti i file del gioco; dalle volte dopo li serve da lì, quindi il gioco può partire anche senza rete (provato nel browser del PC, sul telefono è da provare).
- **L'aggiornamento automatico.** A ogni apertura con la rete il service worker controlla se c'è una versione nuova. Se c'è la scarica in silenzio e prende il posto della vecchia; la partita aperta non si ricarica, la versione nuova si vede dalla prossima apertura. Nessun pulsante «aggiorna», nessuno store.
- **Permessi minimi.** `permissions: contents: read`: il workflow può leggere il codice e nient'altro. Se un'azione fosse compromessa, non potrebbe scrivere nel repository.

## I comandi
- `npm run lint`: il lint su tutto il progetto.
- `npm run check`: lint, tipi e test, uno dopo l'altro. È quello che lancia il controllo prima del commit.
- `git hook run pre-commit`: lancia il controllo come farebbe git, senza fare il commit.
- `npm ci && npm run check && npm run build`: sul PC, gli stessi passi del controllo su GitHub.

Su un PC appena clonato `npm install` attiva il controllo da solo: lo script `prepare` di `package.json` dice a git di prendere gli hook dalla cartella `.githooks/`.

## Cosa è stato difficile
- **Gli a capo su Windows.** Git su Windows può salvare i file con gli a capo di Windows, e uno script di shell così non parte. Il file `.gitattributes` tiene gli script di `.githooks/` con gli a capo di Linux.
- **Il lockfile tra due PC.** Sul PC di casa npm toglie da `package-lock.json` le righe `libc` dei pacchetti per Linux, che l'npm dell'altro PC scrive. Su Windows non cambia cosa si installa. Su Linux, come sulla macchina di GitHub, il campo `libc` distingue le varianti glibc e musl dei pacchetti: senza, è probabile che npm scarichi anche quelle che non servono, senza fare danni. È una deduzione, la documentazione di npm non lo dice. In più sporca le differenze tra un commit e l'altro.
- **L'aggiornamento che restava in attesa.** La prima prova dell'aggiornamento: la versione nuova si scaricava ma restava «in attesa» finché tutte le schede del gioco non venivano chiuse, e sul telefono un'app installata può restare aperta a lungo. Il plugin attiva da solo il cambio immediato (`skipWaiting` e `clientsClaim`) solo quando registra il service worker in modo «auto»; qui il modo è «script», quindi le due righe vanno scritte a mano. Con le due righe la prova è riuscita.
- **Un server rimasto acceso.** La prima volta `npm ci` sul PC si è fermato con un errore di permessi: un `vite preview` lanciato prima per una prova nel browser era ancora acceso e teneva aperto un file di `node_modules`. Su Windows un file aperto non si può cancellare. Chiuso il server, `npm ci` è passato.

## Le prove della versione installabile
Nel browser di prova, con la build servita da Wrangler in locale come la servirà Cloudflare:
- **Installabile.** Il manifest risponde con il tipo giusto, il service worker si attiva e tiene 14 file.
- **Senza rete.** Server spento e pagina ricaricata: il gioco e la misura si aprono lo stesso, serviti dal service worker.
- **Aggiornamento.** Con la versione A attiva è stata pubblicata in locale una versione B con un segno nascosto nella pagina. All'apertura successiva il gioco è partito ancora con la A, la B si è installata e ha preso il posto della A senza restare in attesa, e la copia della A è stata cancellata. All'apertura dopo, la pagina era la B.

## La prova con il test rotto
Il 12 novembre il test dell'ingrandimento sul telefono è stato cambiato apposta, aspettando 5 al posto di 4. `git hook run pre-commit` ha risposto con 1 test fallito su 26 e «commit fermato», ed è uscito con codice 1. Rimesso il test, 26 su 26 e «tutto verde».

## La domanda da colloquio
«Cosa succede dal tuo push al gioco online?» Prima ancora del push, a ogni commit, partono lint, tipi e test, e se uno è rosso il commit non nasce. Dopo il push GitHub Actions rifà tutto, più la build, su una macchina pulita, e segna il commit verde o rosso. Nello stesso momento Workers Builds di Cloudflare prende lo stesso commit, rifà il controllo e la build e, solo se passano, pubblica il gioco. Il telefono trova la versione nuova alla prima apertura con la rete e la usa dalla volta dopo.

## Da fare
- La prova nel browser con Playwright: il gioco si apre e disegna.
- La rotta `/api/ping` nello stesso Worker dei file.
- Provare l'installazione e l'aggiornamento automatico sul telefono vero.
- La prova finale: un test rotto ferma il commit e anche la pubblicazione.
