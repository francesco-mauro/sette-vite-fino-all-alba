# Decisioni

Ogni scelta del progetto, sempre nello stesso ordine: data, contesto, scelta, alternative scartate, perché, cosa comporta.

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
