// La tabella delle ondate: chi arriva, in quanti e ogni quanto, minuto per minuto.
// Una riga per ogni minuto della notte da 15. Le notti da 5 e da 10 minuti passano dalle stesse righe
// più in fretta: conta la frazione di notte passata, non i minuti veri (src/logic/waves.ts).
// Ogni tipo di nemico ha il suo orologio: `size` nemici insieme, da un punto fuori dallo schermo, ogni `everyMs`.
// Regole della tabella, controllate dai test: il primo minuto solo piccioni, i nemici entrano uno alla volta
// (zanzara, pantegana, cornacchia), e nessun tipo cala mai una volta arrivato.
// Bilanciare vuol dire cambiare questi numeri. Sono numeri di partenza del 13 novembre 2026.
import type { WaveRow } from "../logic/waves";

export const WAVE_TABLE: WaveRow[] = [
  // minuto 1: solo piccioni, per imparare
  { piccione: { size: 3, everyMs: 2200 } },
  // minuto 2: il primo sciame di zanzare
  { piccione: { size: 3, everyMs: 2000 }, zanzara: { size: 4, everyMs: 7000 } },
  { piccione: { size: 4, everyMs: 1900 }, zanzara: { size: 5, everyMs: 6500 } },
  // minuto 4: la prima pantegana
  { piccione: { size: 4, everyMs: 1700 }, zanzara: { size: 5, everyMs: 6000 }, pantegana: { size: 1, everyMs: 8000 } },
  { piccione: { size: 5, everyMs: 1600 }, zanzara: { size: 6, everyMs: 5500 }, pantegana: { size: 1, everyMs: 6500 } },
  // minuto 6: la prima cornacchia
  { piccione: { size: 5, everyMs: 1450 }, zanzara: { size: 6, everyMs: 5000 }, pantegana: { size: 2, everyMs: 7000 }, cornacchia: { size: 1, everyMs: 9000 } },
  { piccione: { size: 6, everyMs: 1350 }, zanzara: { size: 7, everyMs: 4500 }, pantegana: { size: 2, everyMs: 6000 }, cornacchia: { size: 1, everyMs: 7000 } },
  { piccione: { size: 6, everyMs: 1200 }, zanzara: { size: 7, everyMs: 4000 }, pantegana: { size: 2, everyMs: 5000 }, cornacchia: { size: 2, everyMs: 8000 } },
  { piccione: { size: 7, everyMs: 1100 }, zanzara: { size: 8, everyMs: 3800 }, pantegana: { size: 3, everyMs: 5500 }, cornacchia: { size: 2, everyMs: 7000 } },
  { piccione: { size: 7, everyMs: 1000 }, zanzara: { size: 8, everyMs: 3500 }, pantegana: { size: 3, everyMs: 5000 }, cornacchia: { size: 2, everyMs: 6000 } },
  // minuto 11: da qui tutto si stringe fino all'alba
  { piccione: { size: 8, everyMs: 900 }, zanzara: { size: 9, everyMs: 3200 }, pantegana: { size: 3, everyMs: 4500 }, cornacchia: { size: 3, everyMs: 6500 } },
  { piccione: { size: 8, everyMs: 800 }, zanzara: { size: 9, everyMs: 3000 }, pantegana: { size: 4, everyMs: 5000 }, cornacchia: { size: 3, everyMs: 6000 } },
  { piccione: { size: 9, everyMs: 700 }, zanzara: { size: 10, everyMs: 2800 }, pantegana: { size: 4, everyMs: 4500 }, cornacchia: { size: 3, everyMs: 5000 } },
  { piccione: { size: 9, everyMs: 620 }, zanzara: { size: 10, everyMs: 2600 }, pantegana: { size: 4, everyMs: 4000 }, cornacchia: { size: 4, everyMs: 5500 } },
  // minuto 15: l'ultimo prima dell'alba
  { piccione: { size: 9, everyMs: 550 }, zanzara: { size: 10, everyMs: 2400 }, pantegana: { size: 5, everyMs: 4000 }, cornacchia: { size: 4, everyMs: 5000 } },
];
