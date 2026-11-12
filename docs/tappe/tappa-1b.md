# Tappa 1b: qualità e pubblicazione automatica

L'obiettivo della tappa: ogni push si controlla e si pubblica da solo, ma solo se è tutto verde. Dal push al gioco online non passa più niente a mano.

**Stato: in corso dal 12 novembre 2026.** Fatti il lint e il controllo prima del commit. Mancano GitHub Actions, la prova nel browser con Playwright, la rotta `/api/ping`, la pubblicazione automatica con Workers Builds e la prova finale con un test rotto apposta.

**Fatto quando:** `/api/ping` risponde dall'indirizzo pubblico; un push verde pubblica da solo; un test rotto ferma il commit e la pubblicazione, provato.

## Cosa c'è di nuovo
- **12 novembre 2026, il lint e il controllo prima del commit.** oxlint controlla il codice a ogni commit insieme ai tipi e ai test. Ha trovato una cosa sola, ripetuta 19 volte: il modo di importare Phaser, sistemato in tre file. Il controllo prima del commit è provato con un test rotto apposta: il commit si ferma.

## Le tecnologie di questa tappa, e perché
| Strumento | Versione | Cosa fa qui | Perché questo |
|---|---|---|---|
| [oxlint](https://oxc.rs/docs/guide/usage/linter.html) | 1.91.0 | Il lint: cerca errori comuni e codice sospetto senza eseguirlo | È scritto in Rust ed è pensato per essere veloce: sul PC di casa il controllo intero, lint più tipi più test, dura circa 4 secondi, quindi si può lanciare a ogni commit senza aspettare. Legge TypeScript senza plugin in più; il file `.oxlintrc.json` sceglie solo quali regole contano come errori |
| Git hook `pre-commit` | | Lancia lint, tipi e test prima di ogni commit | È una funzione di git, non serve un pacchetto in più (vedi `DECISIONI.md`) |

La versione di oxlint è la 1.91.0 e non l'ultima, la 1.93.0: nel progetto un pacchetto nuovo entra nell'ultima versione uscita da almeno sette giorni, così un'eventuale versione difettosa ha il tempo di essere scoperta da altri.

## I concetti, in parole semplici
- **Lint.** Un programma che legge il codice senza eseguirlo e segnala gli errori comuni: una variabile mai usata, un confronto che è sempre vero, un import scritto in un modo che può confondere. Il controllo dei tipi dice se i pezzi combaciano, il lint se il codice ha l'aria di un errore.
- **Errore e avviso.** Nella configurazione (`.oxlintrc.json`) le regole sicure sono errori, quelle che possono avere eccezioni sono avvisi. Con `--deny-warnings` anche un avviso ferma il controllo: così gli avvisi non si accumulano mai.
- **Git hook.** Uno script che git lancia da solo in un momento preciso. Il `pre-commit` parte quando si dà il comando del commit, prima di crearlo: se lo script finisce con un errore il commit non nasce.
- **Perché il controllo sta anche sul PC e non solo su GitHub.** Sul PC l'errore si vede in pochi secondi, prima che esca. Su GitHub (prossimo passo) si controlla tutto di nuovo, perché il controllo sul PC si può saltare e non c'è su ogni computer.

## I comandi
- `npm run lint`: il lint su tutto il progetto.
- `npm run check`: lint, tipi e test, uno dopo l'altro. È quello che lancia il controllo prima del commit.
- `git hook run pre-commit`: lancia il controllo come farebbe git, senza fare il commit.

Su un PC appena clonato `npm install` attiva il controllo da solo: lo script `prepare` di `package.json` dice a git di prendere gli hook dalla cartella `.githooks/`.

## Cosa è stato difficile
- **Gli a capo su Windows.** Git su Windows può salvare i file con gli a capo di Windows, e uno script di shell così non parte. Il file `.gitattributes` tiene gli script di `.githooks/` con gli a capo di Linux.
- **Il lockfile tra due PC.** Sul PC di casa npm toglie da `package-lock.json` le righe `libc` dei pacchetti per Linux, che l'npm dell'altro PC scrive. Non cambia cosa si installa, ma sporca le differenze tra un commit e l'altro.

## La prova con il test rotto
Il 12 novembre il test dell'ingrandimento sul telefono è stato cambiato apposta, aspettando 5 al posto di 4. `git hook run pre-commit` ha risposto con 1 test fallito su 26 e «commit fermato», ed è uscito con codice 1. Rimesso il test, 26 su 26 e «tutto verde».

## La domanda da colloquio
«Cosa succede dal tuo push al gioco online?» Per ora la prima metà: prima ancora del push, a ogni commit, partono lint, tipi e test, e se uno è rosso il commit non nasce. La seconda metà arriva con GitHub Actions e Workers Builds.

## Da fare
- GitHub Actions: lo stesso `npm run check`, più la build, a ogni push.
- La prova nel browser con Playwright: il gioco si apre e disegna.
- La rotta `/api/ping` nello stesso Worker dei file.
- Workers Builds collegato a GitHub, con i test prima della pubblicazione.
- La prova finale: un test rotto ferma il commit e anche la pubblicazione.
