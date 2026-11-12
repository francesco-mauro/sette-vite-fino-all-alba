# Sette vite fino all'alba

[![Controllo](https://github.com/francesco-mauro/sette-vite-fino-all-alba/actions/workflows/ci.yml/badge.svg)](https://github.com/francesco-mauro/sette-vite-fino-all-alba/actions/workflows/ci.yml)

Un gatto randagio, Roma di notte, ondate di nemici: resisti fino all'alba. Gioco survivor in pixel art, nel browser, anche sul telefono in orizzontale.

Un progetto mio, sviluppato con l'aiuto del mio agente AI.

## A che punto è
In costruzione. Chiuse la tappa 1a e la 1b: a ogni push ripartono lint, tipi e test e, solo se sono verdi, il gioco si pubblica da solo. Con la tappa 3b si gioca una notte intera, la prima versione da mostrare: dal titolo all'alba, dopo 15 minuti, con sette vite. Il gatto si muove nella notte, i piccioni arrivano sempre più fitti, le armi partono da sole e le crocchette fanno salire di livello: a ogni livello si sceglie una carta tra tre. Il record resta salvato nel browser. Si apre qui: <https://sette-vite-fino-all-alba.normandy001-fm.workers.dev/>

È fatto per installarsi sul telefono come un'app: si apre a tutto schermo dall'icona, gira anche senza rete e si aggiorna da solo quando esce una versione nuova. Provato nel browser del computer e su un telefono Android.

## Come si gioca
Si muove solo il gatto: attacca da solo. Sul computer frecce o WASD; sul telefono, in orizzontale, si appoggia il pollice dove si vuole, a destra o a sinistra, e lì compare il joystick. Quando si sale di livello si tocca una delle tre carte (sul computer 1, 2, 3): il dito che era già sullo schermo non sceglie, serve un tocco nuovo. Finita la barra rossa il gatto perde una delle sette vite e riparte; all'alba si vince. La pausa è il pulsante in alto a destra, o Esc, e scatta da sola se si cambia app. Per provare: `?corta` fa durare la notte 3 minuti, `?seme=123` estrae sempre gli stessi numeri, `?debug` accende il pannello (fotogrammi al secondo, nemici vivi, invincibilità, piccioni in più, velocità quadrupla).

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

## Licenza
[MIT](LICENSE)
