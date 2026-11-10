# Tappa 1a: il gioco online

L'obiettivo della tappa: un progetto vero, pubblico e online, con il minimo indispensabile. Sullo schermo c'è solo il gatto fermo sui sampietrini, ma intorno c'è già tutto quello che serve per pubblicarlo.

**Stato: in corso.** Fatti il progetto, il repository pubblico, la licenza e il Worker di Cloudflare pronto. Mancano la prima pubblicazione, la misura con i 200 sprite e il joystick.

## Contenuti
- Cosa c'è di nuovo, giorno per giorno
- Le tecnologie di questa tappa, e perché
- I concetti, in parole semplici
- I comandi
- Cosa è stato difficile
- Cosa abbiamo misurato
- La domanda da colloquio
- Lo spunto per il post
- Da fare

## Cosa c'è di nuovo
- **8 novembre 2026.** Il progetto montato a mano con tre pacchetti (Phaser, Vite, TypeScript). La prima scena: 480×270 pixel, il gatto fermo nella luce di un lampione, sampietrini, tombini e foglie. L'ingrandimento calcolato a mano perché ogni pixel del gioco resti un quadrato intero. Il repository pubblico su GitHub.
- **9 novembre 2026.** La licenza MIT, i crediti della grafica, un README minimo.
- **10 novembre 2026, il Worker.** La configurazione di Cloudflare Workers (`wrangler.jsonc`), i comandi per provarlo in locale e per pubblicarlo, la prova della build servita dal Worker in locale. L'icona della scheda, il gatto, nata da un errore trovato proprio in quella prova.

## Le tecnologie di questa tappa, e perché
| Strumento | Versione | Cosa fa qui | Perché questo |
|---|---|---|---|
| [Phaser](https://phaser.io) | 4.2.1 | Il motore del gioco: scene, immagini, input, fisica | Ha già quello che serve a un gioco con tanti nemici (gruppi di oggetti riusati, fisica Arcade, pixel art netta), ed era la versione stabile quando il progetto è partito |
| TypeScript | 7.0.2, `strict` | I tipi | Molti errori escono mentre si scrive e non mentre si gioca |
| [Vite](https://vite.dev) | 8.3.6 | Server di sviluppo e build | Ricarica la pagina a ogni salvataggio, e con un comando prepara i file da pubblicare in `dist/` |
| [Cloudflare Workers](https://developers.cloudflare.com/workers/) | | Ospita il gioco | Serve i file statici senza un server da tenere acceso. Le richieste ai file statici sono gratuite e senza limite. Più avanti lo stesso Worker potrà rispondere anche alle rotte `/api` della classifica |
| Wrangler | 4.157.0 | Il comando di Cloudflare | Fa girare il Worker in locale e lo pubblica |

Ogni pacchetto ha la versione esatta in `package.json`, senza il segno `^`: sui due PC e su Cloudflare si installa la stessa identica cosa.

## I concetti, in parole semplici
1. **Vite fa due lavori.** Mentre si sviluppa è un server che ricarica la pagina appena si salva un file. Con la build impacchetta tutto in `dist/`: una pagina, un file JavaScript, le immagini. Sono file statici, cioè uguali per tutti, da consegnare così come sono.
2. **TypeScript strict.** Il compilatore controlla i tipi in modo severo. Un valore che può mancare, per esempio, va controllato prima di usarlo. La build fa prima questo controllo (`tsc --noEmit`) e solo dopo chiama Vite.
3. **Come parte un gioco Phaser.** In `src/main.ts` si crea il gioco con la sua configurazione: misura della scena, `pixelArt: true`, elenco delle scene. Ogni scena ha `preload`, che carica le immagini, e `create`, che costruisce la scena una volta sola.
4. **L'ingrandimento intero nei pixel veri.** La scena è piccola, 480×270, e va ingrandita. Se l'ingrandimento non è un numero intero, i pixel del gioco vengono di misure diverse tra loro. Quindi si calcola quante volte la scena entra nei pixel veri dello schermo e si arrotonda per difetto.
5. **Cos'è un Worker.** Un piccolo programma che gira sui server di Cloudflare, senza un server nostro da tenere acceso. Per ora non ha nemmeno codice: gli si indica la cartella `dist/` e lui la serve. Se arriva la richiesta di un file che non c'è, risponde 404.
6. **Provare in locale, poi pubblicare.** Wrangler si porta dietro `workerd`, il motore dei Worker. `wrangler dev` lo accende sul PC e serve il gioco come lo servirebbe Cloudflare, senza pubblicare niente. `wrangler deploy` carica i file e li pubblica a un indirizzo del tipo `<nome>.<sottodominio>.workers.dev`.
7. **La data di compatibilità.** Cloudflare aggiorna il suo motore di continuo. La riga `compatibility_date` dice al Worker di comportarsi come a quella data, così un loro aggiornamento non cambia da solo il comportamento del gioco. Qui è il 3 novembre 2026, la data del motore che arriva con Wrangler 4.157.0. Si alza a mano, quando si aggiorna Wrangler, e la data nuova vale dalla pubblicazione successiva.

## I comandi
| Comando | Cosa fa |
|---|---|
| `npm run dev` | Il gioco in sviluppo, con Vite |
| `npm run build` | Controllo dei tipi, poi i file da pubblicare in `dist/` |
| `npm run preview:worker` | Build, poi il Worker in locale su `http://localhost:8787` |
| `npm run deploy` | Build, poi la pubblicazione su Cloudflare |

La prima pubblicazione chiede un passo in più, una volta sola: `npx wrangler login`, che apre il browser per entrare nell'account Cloudflare e autorizzare Wrangler.

## Cosa è stato difficile
- **Lo zoom di Phaser conta i pixel sbagliati.** `Phaser.Scale.MAX_ZOOM` ragiona in pixel CSS. Sul telefono di prova, che ha quasi tre pixel veri per ogni pixel CSS, avrebbe scelto un ingrandimento di 1 invece di 4. Per questo il calcolo è fatto a mano (vedi `DECISIONI.md`).
- **Un errore che un tipo di prova non vedeva.** La pagina servita dal Worker sembrava a posto in un browser senza finestra. In un browser normale è uscito un errore in console: mancava l'icona della scheda, e il browser chiedeva `/favicon.ico` trovando un 404. Il browser senza finestra l'icona non la chiede proprio. Da qui l'icona con il gatto, e una regola: la prova si fa anche in un browser vero.
- **L'ultima versione non è sempre quella giusta.** Il giorno dell'installazione l'ultimo Wrangler, il 4.159.0, era uscito da meno di un giorno. È stata scelta la 4.157.0, uscita sette giorni prima, il 3 novembre (vedi `DECISIONI.md`).

## Cosa abbiamo misurato
- **La build.** Un solo file JavaScript da 1.368,77 kB, che compresso con gzip scende a circa 358 kB secondo la misura di Vite. È quasi tutto Phaser.
- **Il Worker in locale.** La pagina e le immagini rispondono 200 con il tipo giusto (`text/html`, `image/png`). Un indirizzo che non esiste risponde 404.
- **Nel browser.** Phaser 4.2.1 parte in WebGL, la scena 480×270 viene ingrandita 2 volte in una finestra da 960×540, la console non ha errori.
- **Sul telefono.** In questa tappa non ancora: arriva con la prima pubblicazione.

## La domanda da colloquio
**«Come è fatto il progetto e dove gira?»**

Una risposta possibile, da completare quando il gioco sarà online: è un gioco per browser. Il motore è Phaser 4, che disegna e gestisce scene, input e fisica. Il codice è TypeScript in modalità strict, così molti errori li ferma il compilatore prima che il gioco parta. Vite fa da server mentre si sviluppa e con la build prepara una cartella di file statici. Quella cartella la serve un Worker di Cloudflare: non c'è un server da tenere acceso, e più avanti lo stesso Worker risponderà anche all'API della classifica. Il codice è pubblico su GitHub, con le decisioni e un diario per ogni tappa.

## Lo spunto per il post
Un'idea, non ancora un testo: raccontare perché la prima cosa fatta è stata mettere il progetto in condizione di andare online, quando sullo schermo c'era soltanto un gatto fermo.

## Da fare
- [x] Progetto con Phaser 4, Vite e TypeScript strict
- [x] Il gatto fermo sui sampietrini, a 480×270
- [x] Repository pubblico su GitHub
- [x] README minimo, `DECISIONI.md`, `LICENSE`, `CREDITS.md`
- [x] Worker di Cloudflare configurato e provato in locale
- [ ] Prima pubblicazione: `npx wrangler login`, poi `npm run deploy`. L'indirizzo pubblico va nel README
- [ ] La misura: circa 200 sprite finti che si muovono, con il contatore dei fotogrammi, provata sul telefono
- [ ] Il joystick di phaser4-rex-plugins importato
- [ ] Il diario della tappa 0 e la lista degli asset dentro `docs/`
- [ ] Caratteri del gioco: quando entra il primo testo, leggere le licenze e scriverle in `CREDITS.md`
