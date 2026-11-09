# Sette vite fino all'alba

Un gatto randagio, Roma di notte, ondate di nemici: resisti fino all'alba. Gioco survivor in pixel art, nel browser, anche sul telefono in orizzontale.

Un progetto mio, sviluppato con l'aiuto del mio agente AI.

## A che punto è
In costruzione, alla tappa 1a: il progetto è online su GitHub e mostra il gatto fermo sui sampietrini, sotto un lampione. Il link per giocare arriva con la prima pubblicazione.

## Lo stack
- [Phaser 4](https://phaser.io), il motore del gioco
- TypeScript in modalità `strict`
- [Vite](https://vite.dev) per lo sviluppo e la build
- In arrivo: Cloudflare Workers per pubblicarlo, Vitest e Playwright per i test

## Provarlo in locale
Serve Node.js.

```bash
npm install
npm run dev
```

Poi si apre l'indirizzo che stampa Vite. `npm run build` controlla i tipi e prepara la versione da pubblicare in `dist/`.

## Documentazione
- [DECISIONI.md](DECISIONI.md): ogni scelta del progetto, con le alternative scartate e il perché
- [CREDITS.md](CREDITS.md): autori e licenze di grafica, caratteri e suoni

## Licenza
[MIT](LICENSE)
