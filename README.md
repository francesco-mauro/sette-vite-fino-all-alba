# Sette vite fino all'alba

[![Controllo](https://github.com/francesco-mauro/sette-vite-fino-all-alba/actions/workflows/ci.yml/badge.svg)](https://github.com/francesco-mauro/sette-vite-fino-all-alba/actions/workflows/ci.yml)

Un gatto randagio, Roma di notte, ondate di nemici: resisti fino all'alba. Gioco survivor in pixel art, nel browser, anche sul telefono in orizzontale.

Un progetto mio, sviluppato con l'aiuto del mio agente AI.

## A che punto è
In costruzione. Chiuse la tappa 1a e la 1b: a ogni push ripartono lint, tipi e test e, solo se sono verdi, il gioco si pubblica da solo. Con la tappa 3b si gioca una notte intera, la prima versione da mostrare: dal titolo all'alba, dopo 15 minuti, con sette vite. Il gatto si muove nella notte, le armi partono da sole e le crocchette fanno salire di livello: a ogni livello si sceglie una carta tra tre. Il record resta salvato nel browser. È in corso la tappa 4: ai piccioni si aggiungono zanzare a sciami, pantegane dure da buttare giù e cornacchie che scendono in picchiata, secondo una tabella delle ondate minuto per minuto, e chi resta indietro torna vicino, quindi scappare non basta. A un terzo e a due terzi della notte arrivano i due capi: il gabbiano, che carica e si schiva di lato, e il gabbiano reale, che urla e da cui ci si allontana. C'è anche la quarta arma, il miagolio: un'onda che spinge via chi è vicino. Il graffio sceglie il capo quando è a tiro, e i potenziamenti sono sette: agli altri si aggiungono riflessi pronti (armi più spesso), pelo gonfio (armi più lontano) e quadrifoglio (più carte rare e più casse triple, con la probabilità scritta sulla carta). Ogni tanto un nemico eliminato lascia a terra un supplì, che cura il gatto quando ne ha bisogno. I nemici si scostano tra loro: intorno al gatto si vede una folla, non un mucchio. Arrivano a orde, un'onda da un lato e poi una pausa, e restano in gruppo, ognuno a modo suo: lo stormo di piccioni cammina e becca tutto insieme, lo sciame di zanzare ronza intorno al suo centro, le pantegane corrono in fila a scatti. Una folla fa più male di un nemico solo, quindi attraversarla costa caro. Si apre qui: <https://sette-vite-fino-all-alba.normandy001-fm.workers.dev/>

È fatto per installarsi sul telefono come un'app: si apre a tutto schermo dall'icona, gira anche senza rete e si aggiorna da solo quando esce una versione nuova. Provato nel browser del computer e su un telefono Android.

## Come si gioca
Nel titolo si sceglie quanto dura la notte: 5, 10 o 15 minuti (si tocca, o 1, 2, 3 sul computer), e ogni durata ha il suo record. Si muove solo il gatto: attacca da solo. Sul computer frecce o WASD; sul telefono, in orizzontale, si appoggia il pollice dove si vuole, a destra o a sinistra, e lì compare il joystick. Quando si sale di livello si tocca una delle tre carte (sul computer 1, 2, 3): il dito che era già sullo schermo non sceglie, serve un tocco nuovo. A ogni livello le crocchette rimaste sulla mappa volano verso il gatto, e dopo una carta o una pausa il gatto ha un secondo di protezione. Fino a otto volte per notte compare una cassa del tesoro, lontano: dà un potere, a volte tre, dalle stesse carte della scelta al livello (se ne aspettano già due, la prossima aspetta). Presa la cassa, la partita si ferma e mostra le carte vinte; si continua con un tocco. Si trova con la minimappa in alto a destra, dove lampeggia anche quando è lontana; toccandola, o con M, si apre la mappa grande e la partita si ferma. Finita la barra rossa il gatto perde una delle sette vite e riparte; all'alba si vince. Nel titolo, in basso a sinistra, c'è la versione (il commit e quando è stata pubblicata); il pulsante «aggiornamenti» in basso a destra, o U, controlla se sul server ce n'è una più nuova e, se c'è, la installa e riapre il gioco. Sul computer «schermo intero», in alto a sinistra nel titolo, o F anche in partita, mette il gioco a tutto schermo: su un monitor 1920x1080 la scena entra 4 volte invece di 3. La pausa è il pulsante in alto a destra, o Esc, e scatta da sola se si cambia app; da lì «riprendi», o un tocco qualsiasi, torna alla partita, e «esci dalla partita», in basso, torna al titolo solo al secondo tocco. Per provare: `?corta` fa durare la notte 3 minuti, qualunque sia la scelta, `?seme=123` estrae sempre gli stessi numeri, `?debug` accende il pannello (fotogrammi al secondo, nemici vivi, invincibilità, nemici in più, velocità quadrupla, un capo a comando, un livello di miagolio a comando).

## Lo stack
- [Phaser 4](https://phaser.io), il motore del gioco
- TypeScript in modalità `strict`
- [Vite](https://vite.dev) per lo sviluppo e la build
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) per pubblicarlo: i file del gioco e, in `worker/`, le rotte `/api` (per ora `/api/ping`)
- [phaser4-rex-plugins](https://github.com/rexrainbow/phaser3-rex-notes) per il joystick virtuale
- [Vitest](https://vitest.dev) per i test della logica
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) per installarlo sul telefono e giocare senza rete
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) per il lint
- [Playwright](https://playwright.dev) per la prova di fumo: il gioco si apre in un browser vero senza errori
- [GitHub Actions](https://docs.github.com/actions) per rifare lint, tipi, test, build e prova di fumo a ogni push

## Provarlo in locale
Serve Node.js.

```bash
npm install
npm run dev
```

Poi si apre l'indirizzo che stampa Vite. `npm run build` controlla i tipi e prepara la versione da pubblicare in `dist/`. `npm run preview:worker` serve quella versione in locale con Wrangler, come farà Cloudflare, compreso `/api/ping`. `npm test` lancia i test, `npm run lint` il lint, `npm run check` tutti e due più il controllo dei tipi. Dopo la build, `npm run test:e2e` lancia la prova di fumo con Playwright (la prima volta serve `npx playwright install chromium`). Lo stesso controllo parte da solo prima di ogni commit e lo ferma se qualcosa è rosso: `npm install` lo attiva.

Con `?misura` in fondo all'indirizzo si accende la misura: sprite finti che si muovono, un contatore dei fotogrammi e il joystick virtuale. Come si legge è scritto nel [diario della tappa](docs/tappe/tappa-1a.md).

## Documentazione
- [DECISIONI.md](DECISIONI.md): ogni scelta del progetto, con le alternative scartate e il perché
- [CREDITS.md](CREDITS.md): autori e licenze di grafica, caratteri e suoni
- [docs/ASSET.md](docs/ASSET.md): la lista degli asset, con il budget e la palette
- [docs/tappe/tappa-0.md](docs/tappe/tappa-0.md): il diario della tappa 0, stile e asset
- [docs/tappe/tappa-1a.md](docs/tappe/tappa-1a.md): il diario della tappa 1a, il gioco online, con le tecnologie usate e il perché
- [docs/tappe/tappa-1b.md](docs/tappe/tappa-1b.md): il diario della tappa 1b, qualità e pubblicazione automatica
- [docs/tappe/tappa-2.md](docs/tappe/tappa-2.md): il diario della tappa 2, il gatto e il primo nemico
- [docs/tappe/tappa-3a.md](docs/tappe/tappa-3a.md): il diario della tappa 3a, crescere
- [docs/tappe/tappa-3b.md](docs/tappe/tappa-3b.md): il diario della tappa 3b, la versione presentabile
- [docs/tappe/tappa-4.md](docs/tappe/tappa-4.md): il diario della tappa 4, le ondate e il contenuto completo (in corso)

## Licenza
[MIT](LICENSE)
