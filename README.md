# Sette vite fino all'alba

Un gatto randagio, Roma di notte, ondate di nemici: resisti fino all'alba. Gioco survivor in pixel art, nel browser, anche sul telefono in orizzontale.

Un progetto mio, sviluppato con l'aiuto del mio agente AI.

## A che punto è
In costruzione. Chiusa la tappa 1a, la prossima è la 1b: per ora mostra il gatto fermo sui sampietrini, sotto un lampione. Si apre qui: <https://sette-vite-fino-all-alba.normandy001-fm.workers.dev/>

## Lo stack
- [Phaser 4](https://phaser.io), il motore del gioco
- TypeScript in modalità `strict`
- [Vite](https://vite.dev) per lo sviluppo e la build
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) per pubblicarlo
- [phaser4-rex-plugins](https://github.com/rexrainbow/phaser3-rex-notes) per il joystick virtuale
- [Vitest](https://vitest.dev) per i test della logica
- In arrivo: Playwright per la prova nel browser

## Provarlo in locale
Serve Node.js.

```bash
npm install
npm run dev
```

Poi si apre l'indirizzo che stampa Vite. `npm run build` controlla i tipi e prepara la versione da pubblicare in `dist/`. `npm run preview:worker` serve quella versione in locale con Wrangler, come farà Cloudflare. `npm test` lancia i test.

Con `?misura` in fondo all'indirizzo si accende la misura: sprite finti che si muovono, un contatore dei fotogrammi e il joystick virtuale. Come si legge è scritto nel [diario della tappa](docs/tappe/tappa-1a.md).

## Documentazione
- [DECISIONI.md](DECISIONI.md): ogni scelta del progetto, con le alternative scartate e il perché
- [CREDITS.md](CREDITS.md): autori e licenze di grafica, caratteri e suoni
- [docs/ASSET.md](docs/ASSET.md): la lista degli asset, con il budget e la palette
- [docs/tappe/tappa-0.md](docs/tappe/tappa-0.md): il diario della tappa 0, stile e asset
- [docs/tappe/tappa-1a.md](docs/tappe/tappa-1a.md): il diario della tappa 1a, il gioco online, con le tecnologie usate e il perché

## Licenza
[MIT](LICENSE)
