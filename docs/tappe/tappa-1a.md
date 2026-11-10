# Tappa 1a: il gioco online

L'obiettivo della tappa: un progetto vero, pubblico e online, con il minimo indispensabile. Sullo schermo c'è solo il gatto fermo sui sampietrini, ma intorno c'è già tutto quello che serve per pubblicarlo.

**Stato: in corso.** Fatti il progetto, il repository pubblico, la licenza, il Worker di Cloudflare pronto, la misura con gli sprite finti e il joystick, provati sul computer. Mancano la prima pubblicazione e la misura sul telefono.

## Contenuti
- Cosa c'è di nuovo, giorno per giorno
- Le tecnologie di questa tappa, e perché
- I concetti, in parole semplici
- I comandi
- Come si fa la misura
- Cosa è stato difficile
- Cosa abbiamo misurato
- La domanda da colloquio
- Lo spunto per il post
- Da fare

## Cosa c'è di nuovo
- **8 novembre 2026.** Il progetto montato a mano con tre pacchetti (Phaser, Vite, TypeScript). La prima scena: 480×270 pixel, il gatto fermo nella luce di un lampione, sampietrini, tombini e foglie. L'ingrandimento calcolato a mano perché ogni pixel del gioco resti un quadrato intero. Il repository pubblico su GitHub.
- **9 novembre 2026.** La licenza MIT, i crediti della grafica, un README minimo.
- **10 novembre 2026, il Worker.** La configurazione di Cloudflare Workers (`wrangler.jsonc`), i comandi per provarlo in locale e per pubblicarlo, la prova della build servita dal Worker in locale. L'icona della scheda, il gatto, nata da un errore trovato proprio in quella prova.
- **10 novembre 2026, la misura.** Con `?misura` in fondo all'indirizzo si accende una scena in più: 200 sprite finti che si muovono, un pannello con i numeri dei fotogrammi e il joystick virtuale. I primi test del progetto, 18, sulla logica del contatore.

## Le tecnologie di questa tappa, e perché
| Strumento | Versione | Cosa fa qui | Perché questo |
|---|---|---|---|
| [Phaser](https://phaser.io) | 4.2.1 | Il motore del gioco: scene, immagini, input, fisica | Ha già quello che serve a un gioco con tanti nemici (gruppi di oggetti riusati, fisica Arcade, pixel art netta), ed era la versione stabile quando il progetto è partito |
| TypeScript | 7.0.2, `strict` | I tipi | Molti errori escono mentre si scrive e non mentre si gioca |
| [Vite](https://vite.dev) | 8.3.6 | Server di sviluppo e build | Ricarica la pagina a ogni salvataggio, e con un comando prepara i file da pubblicare in `dist/` |
| [Cloudflare Workers](https://developers.cloudflare.com/workers/) | | Ospita il gioco | Serve i file statici senza un server da tenere acceso. Le richieste ai file statici sono gratuite e senza limite. Più avanti lo stesso Worker potrà rispondere anche alle rotte `/api` della classifica |
| Wrangler | 4.157.0 | Il comando di Cloudflare | Fa girare il Worker in locale e lo pubblica |
| [phaser4-rex-plugins](https://github.com/rexrainbow/phaser3-rex-notes) | 4.2.0 | Il joystick virtuale per il telefono | È una raccolta di plugin fatta per Phaser 4. Se ne importa uno solo, il joystick, e solo quello entra nella build |
| [Vitest](https://vitest.dev) | 5.1.0 | I test della logica | Gira senza browser in pochi secondi e si appoggia a Vite, che nel progetto c'è già. Era previsto alla tappa 1b, è entrato adesso con il contatore (vedi `DECISIONI.md`) |

Ogni pacchetto ha la versione esatta in `package.json`, senza il segno `^`: sui due PC e su Cloudflare si installa la stessa identica cosa.

## I concetti, in parole semplici
1. **Vite fa due lavori.** Mentre si sviluppa è un server che ricarica la pagina appena si salva un file. Con la build impacchetta tutto in `dist/`: una pagina, un file JavaScript, le immagini. Sono file statici, cioè uguali per tutti, da consegnare così come sono.
2. **TypeScript strict.** Il compilatore controlla i tipi in modo severo. Un valore che può mancare, per esempio, va controllato prima di usarlo. La build fa prima questo controllo (`tsc --noEmit`) e solo dopo chiama Vite.
3. **Come parte un gioco Phaser.** In `src/main.ts` si crea il gioco con la sua configurazione: misura della scena, `pixelArt: true`, elenco delle scene. Ogni scena ha `preload`, che carica le immagini, e `create`, che costruisce la scena una volta sola.
4. **L'ingrandimento intero nei pixel veri.** La scena è piccola, 480×270, e va ingrandita. Se l'ingrandimento non è un numero intero, i pixel del gioco vengono di misure diverse tra loro. Quindi si calcola quante volte la scena entra nei pixel veri dello schermo e si arrotonda per difetto.
5. **Cos'è un Worker.** Un piccolo programma che gira sui server di Cloudflare, senza un server nostro da tenere acceso. Per ora non ha nemmeno codice: gli si indica la cartella `dist/` e lui la serve. Se arriva la richiesta di un file che non c'è, risponde 404.
6. **Provare in locale, poi pubblicare.** Wrangler si porta dietro `workerd`, il motore dei Worker. `wrangler dev` lo accende sul PC e serve il gioco come lo servirebbe Cloudflare, senza pubblicare niente. `wrangler deploy` carica i file e li pubblica a un indirizzo del tipo `<nome>.<sottodominio>.workers.dev`.
7. **La data di compatibilità.** Cloudflare aggiorna il suo motore di continuo. La riga `compatibility_date` dice al Worker di comportarsi come a quella data, così un loro aggiornamento non cambia da solo il comportamento del gioco. Qui è il 3 novembre 2026, la data del motore che arriva con Wrangler 4.157.0. Si alza a mano, quando si aggiorna Wrangler, e la data nuova vale dalla pubblicazione successiva.
8. **Tre numeri per dire come va.** I fotogrammi al secondo dicono quanto è fluido. Il buco più lungo è la distanza più grande tra due fotogrammi: è lo scatto che si vede. Il calcolo è il tempo che il gioco ci mette a preparare e disegnare un fotogramma: a 60 fotogrammi al secondo ha 16,7 millisecondi a disposizione, a 120 ne ha 8,3.
9. **La logica separata dal motore.** Il contatore non sa niente di Phaser: riceve dei tempi e restituisce dei numeri. Per questo si prova con dei test, senza aprire un browser. Il test si scrive prima del codice e lo si guarda fallire: così si sa che controlla davvero qualcosa.
10. **Il pool di oggetti.** Gli sprite finti stanno in un gruppo. Quando ne servono meno non si distruggono: si spengono e restano lì, pronti a riaccendersi. Creare e buttare oggetti di continuo costringe il browser a fare pulizia, e la pulizia può far scattare il gioco. I nemici veri faranno lo stesso.
11. **Misurare senza disturbare.** Il pannello dei numeri è HTML sopra il gioco, non un oggetto del gioco, e si riscrive due volte al secondo. Il contatore tiene i suoi dati in posti già pronti e non crea niente a ogni fotogramma. Uno strumento che pesa falsa quello che misura.

## I comandi
| Comando | Cosa fa |
|---|---|
| `npm run dev` | Il gioco in sviluppo, con Vite |
| `npm run build` | Controllo dei tipi, poi i file da pubblicare in `dist/` |
| `npm run preview:worker` | Build, poi il Worker in locale su `http://localhost:8787` |
| `npm run deploy` | Build, poi la pubblicazione su Cloudflare |
| `npm test` | I test della logica, con Vitest |

La prima pubblicazione chiede un passo in più, una volta sola: `npx wrangler login`, che apre il browser per entrare nell'account Cloudflare e autorizzare Wrangler.

## Come si fa la misura
1. Si apre il gioco aggiungendo `?misura` in fondo all'indirizzo. In locale, con `npm run dev`, è `http://localhost:5173/?misura`.
2. In alto a sinistra compare il pannello. La prima riga sono i numeri: fotogrammi al secondo, buco più lungo, calcolo medio e, tra parentesi, calcolo più lungo. Buco e calcolo guardano gli ultimi 5 secondi.
3. La seconda riga dice in che condizioni si misura: quanti sprite, l'ingrandimento, WebGL o Canvas, la misura della finestra e la densità dello schermo.
4. Il tasto `sprite` passa da 200 a 500 a 1000 e torna a 200. Si può anche scrivere il numero nell'indirizzo, per esempio `?misura=350`.
5. Il tasto `tutto schermo` serve sul telefono: senza, la barra del browser toglie altezza e l'ingrandimento può scendere.
6. Il joystick è in basso a sinistra. Per ora non muove il gatto: la terza riga del pannello mostra la forza, da 0 a 1, e l'angolo in gradi.

Sul telefono: girarlo in orizzontale, aprire l'indirizzo pubblico con `?misura`, premere `tutto schermo`, aspettare una decina di secondi e fare una schermata a 200, una a 500 e una a 1000.

## Cosa è stato difficile
- **Lo zoom di Phaser conta i pixel sbagliati.** `Phaser.Scale.MAX_ZOOM` ragiona in pixel CSS. Sul telefono di prova, che ha quasi tre pixel veri per ogni pixel CSS, avrebbe scelto un ingrandimento di 1 invece di 4. Per questo il calcolo è fatto a mano (vedi `DECISIONI.md`).
- **Un errore che un tipo di prova non vedeva.** La pagina servita dal Worker sembrava a posto in un browser senza finestra. In un browser normale è uscito un errore in console: mancava l'icona della scheda, e il browser chiedeva `/favicon.ico` trovando un 404. Il browser senza finestra l'icona non la chiede proprio. Da qui l'icona con il gatto, e una regola: la prova si fa anche in un browser vero.
- **L'ultima versione non è sempre quella giusta.** Il giorno dell'installazione l'ultimo Wrangler, il 4.159.0, era uscito da meno di un giorno. È stata scelta la 4.157.0, uscita sette giorni prima, il 3 novembre (vedi `DECISIONI.md`).
- **Un blocco che non era del gioco.** Nel browser di prova con la finestra, la pagina della misura sembrava bloccarsi per decine di secondi. Prima di toccare il codice si è cercata la causa. La pila delle chiamate, letta mettendo in pausa la pagina, mostrava il normale giro del gioco. E una pagina vuota, senza gioco, nello stesso browser perdeva fotogrammi allo stesso modo: 435 in 30 secondi, con buchi fino a 5,6 secondi. La causa stava fuori dal gioco: una pagina vuota non ha motivo di perdere fotogrammi. Negli stessi minuti il PC aveva 3,7 GB di memoria liberi su 31,7, e la spiegazione più probabile, non misurata, è che fosse impegnato in altro. Il codice del gioco non è stato cambiato. Ne è uscita una modifica al pannello: accanto al calcolo più lungo ora c'è quello medio, perché su un PC che ha altro da fare il numero più lungo, da solo, inganna.

## Cosa abbiamo misurato
- **La build.** Un solo file JavaScript, quasi tutto Phaser. Prima della misura pesava 1.368,77 kB, circa 358 kB compresso con gzip secondo Vite. Con la misura e il joystick pesa 1.383,82 kB, cioè 15 kB in più, e circa 363 kB compresso.
- **Il Worker in locale.** La pagina e le immagini rispondono 200 con il tipo giusto (`text/html`, `image/png`). Un indirizzo che non esiste risponde 404.
- **Nel browser.** Phaser 4.2.1 parte in WebGL, la scena 480×270 viene ingrandita 2 volte in una finestra da 960×540, la console non ha errori.
- **La misura sul computer**, il 10 novembre 2026. Un PC con scheda grafica Intel Arc 140V, Chromium, finestra da 960×540, ingrandimento 2. Il browser disegnava 120 fotogrammi al secondo. Tre letture per ogni numero di sprite:

| Sprite | Fotogrammi al secondo | Buco più lungo | Calcolo medio | Calcolo più lungo |
|---|---|---|---|---|
| 200 | 120 | 9 ms | da 0,5 a 0,6 ms | da 1,1 a 1,2 ms |
| 500 | da 118 a 120 | da 17 a 31 ms | 1,0 ms | da 1,8 a 2,5 ms |
| 1000 | 120 | 10 ms | da 1,7 a 1,9 ms | da 3,1 a 3,4 ms |

  A 120 fotogrammi al secondo il gioco ha 8,3 millisecondi per fotogramma: con 1000 sprite ne usa in media meno di 2, e 3,4 nel fotogramma più lungo. Il calcolo conta il lavoro del processore, non quello della scheda grafica. Sono numeri presi in un momento buono: nella stessa mattina, prima di questa prova, lo stesso browser perdeva fotogrammi anche su una pagina vuota.
- **Con le misure dello schermo del telefono**, simulate sul computer (842×375 a densità 2,88): l'ingrandimento scelto è 4, come nella prova della tappa 0. Il joystick risponde anche lì, dove l'ingrandimento in pixel CSS non è intero: forza 0,71 e angolo -47°, contro i -45° attesi.
- **Il joystick**, provato con il mouse: trascinato in alto a destra di 12 pixel per lato dà forza 0,71 e angolo -45°, oltre il bordo dà forza 1,00, rilasciato torna fermo.
- **I test.** 18, tutti verdi, in tre file: il contatore dei fotogrammi, il parametro `?misura`, le righe del pannello.
- **Sul telefono.** Non ancora: arriva con la prima pubblicazione.

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
- [x] La misura: sprite finti che si muovono, con il contatore dei fotogrammi, provata sul computer
- [x] Il joystick di phaser4-rex-plugins importato e provato con il mouse
- [ ] La misura sul telefono, dall'indirizzo pubblico, con i numeri scritti in questa pagina
- [ ] Il diario della tappa 0 e la lista degli asset dentro `docs/`
- [ ] Caratteri del gioco: quando entra il primo testo, leggere le licenze e scriverle in `CREDITS.md`
