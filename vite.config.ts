// La configurazione di Vite. Per ora serve solo a una cosa: rendere il gioco
// installabile sul telefono e giocabile senza rete (una PWA), con vite-plugin-pwa.
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      // Aggiornamento automatico, senza pulsanti: quando c'è una versione nuova
      // il telefono la scarica in silenzio e la usa dalla volta dopo che si apre il gioco.
      // Mai un ricaricamento a metà partita.
      registerType: "autoUpdate",
      // Il plugin aggiunge da solo a index.html lo script che registra il service worker.
      injectRegister: "script",
      // Le icone e le immagini le prende già globPatterns qui sotto:
      // senza questa riga finirebbero due volte nella lista dei file da tenere.
      includeManifestIcons: false,
      manifest: {
        id: "/",
        name: "Sette vite fino all'alba",
        short_name: "Sette vite",
        description:
          "Un gatto randagio, Roma di notte, ondate di nemici: resisti fino all'alba.",
        lang: "it",
        start_url: "/",
        scope: "/",
        // Dall'icona si apre a tutto schermo e in orizzontale, come un gioco.
        display: "fullscreen",
        orientation: "landscape",
        // La fuga dei sampietrini, lo stesso colore dello sfondo della pagina.
        background_color: "#1c2133",
        theme_color: "#1c2133",
        icons: [
          { src: "icons/icona-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icona-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icona-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Tutto quello che serve per giocare senza rete: codice, pagina, immagini.
        globPatterns: ["**/*.{js,css,html,png,woff2}"],
        // Phaser da solo pesa circa 1,4 MB: il limite di 2 MB di Workbox è troppo stretto per stare tranquilli.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // La versione nuova prende il posto della vecchia appena scaricata, senza aspettare
        // che tutte le schede del gioco siano chiuse. La pagina aperta non si ricarica:
        // la versione nuova si vede dalla prossima apertura.
        // Il plugin lo fa da solo solo con injectRegister "auto": qui va scritto (provato il 12 novembre).
        skipWaiting: true,
        clientsClaim: true,
        // Il gioco installato risponde da solo, con la sua pagina, a ogni indirizzo che si apre.
        // Le rotte /api no: devono arrivare sempre al Worker sul server.
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
