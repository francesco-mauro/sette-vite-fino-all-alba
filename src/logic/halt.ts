// Chi ferma la partita: la scelta al livello, la cassa, la pausa, la mappa. Una alla volta.
// In Phaser `this.scene.pause()` e `this.scene.launch()` chiamati dentro una scena vanno in coda e valgono dal passo
// dopo: nello stesso passo la partita risulta ancora attiva. Così una crocchetta che fa salire di livello e una
// cassa toccate nello stesso istante aprivano insieme la scelta e la cassa, e la scelta mostrava carte estratte
// prima della cassa: la zampa al livello 4, presa dalla cassa al 5, si poteva riprendere (Francesco, 13 novembre
// 2026: «la carta era quella che aumentava la fortuna»). Questo blocco vale da subito. Logica pura, senza Phaser.
export interface Halt {
  // stop: ferma la partita per `who`. Falso se è già ferma, per qualcun altro o per lo stesso: chi arriva dopo aspetta
  stop(who: string): boolean;
  // release: la partita riprende, la prossima scena può fermarla
  release(): void;
  // by: chi la tiene ferma adesso, null se va
  by(): string | null;
}

export function createHalt(): Halt {
  let holder: string | null = null;
  return {
    stop(who) {
      if (holder !== null) return false;
      holder = who;
      return true;
    },
    release() {
      holder = null;
    },
    by() {
      return holder;
    },
  };
}
