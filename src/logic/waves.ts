// Le ondate: chi nasce e quando, man mano che la notte avanza. Logica pura, senza Phaser.
// La tabella con i numeri è in src/data/waves.ts; qui ci sono le regole per leggerla.
import { WAVES, type EnemyId } from "../data/balance";
import { WAVE_TABLE } from "../data/waves";

// Un gruppo di un tipo di nemico: `size` insieme, ogni `everyMs` millisecondi di notte.
export interface WaveGroup {
  size: number;
  everyMs: number;
}

// Una riga della tabella: per ogni tipo presente in quel minuto, il suo gruppo. Chi manca non nasce.
export type WaveRow = Partial<Record<EnemyId, WaveGroup>>;

// waveRow: la riga per `progress`, cioè quanta notte è passata, da 0 (inizio) a 1 (alba).
// La notte è divisa in tante parti uguali quante sono le righe: con 15 righe, in una notte da 15 minuti ogni riga
// dura un minuto, in una da 5 venti secondi. Così una notte corta ha le stesse ondate, più in fretta.
export function waveRow(progress: number, table: readonly WaveRow[]): WaveRow {
  const p = Math.min(1, Math.max(0, progress));
  return table[Math.min(table.length - 1, Math.floor(p * table.length))];
}

// spawnPlan: la riga di adesso e quanto sono cattivi i nemici che nascono adesso. Danno e velocità si
// moltiplicano da 1 all'inizio fino a WAVES.endDamageScale e WAVES.endSpeedScale all'alba.
export function spawnPlan(progress: number, table: readonly WaveRow[] = WAVE_TABLE): { row: WaveRow; damageScale: number; speedScale: number } {
  const p = Math.min(1, Math.max(0, progress));
  return {
    row: waveRow(p, table),
    damageScale: 1 + (WAVES.endDamageScale - 1) * p,
    speedScale: 1 + (WAVES.endSpeedScale - 1) * p,
  };
}

// hordeTime: l'orologio delle ondate con le orde. In ogni giro di `cycleMs`, per i primi `arriveMs` corre più in
// fretta, tanto da fare un giro intero; poi resta fermo fino al giro dopo. Così nasce lo stesso numero di nemici di
// prima, ma tutti insieme in un'onda, e dopo l'onda per un po' non nasce nessuno: si respira.
export function hordeTime(elapsed: number, cycleMs: number, arriveMs: number): number {
  const cycle = Math.floor(elapsed / cycleMs);
  const into = elapsed - cycle * cycleMs;
  return cycle * cycleMs + Math.min(into, arriveMs) * (cycleMs / arriveMs);
}

// scaleRow: la riga con gruppi `k` volte più grandi e `k` volte più rari. Gli stessi nemici al secondo, a gruppi
// più grossi: l'orda. Non tocca la riga ricevuta.
export function scaleRow(row: WaveRow, k: number): WaveRow {
  const out: WaveRow = {};
  for (const kind of Object.keys(row) as EnemyId[]) {
    const group = row[kind];
    if (group) out[kind] = { size: group.size * k, everyMs: group.everyMs * k };
  }
  return out;
}

// dueSpawns: i gruppi che devono nascere adesso. `nextAt` dice, per ogni tipo, da che momento della notte
// tocca di nuovo a lui; un tipo che non c'è ancora (appena entrato nella tabella) nasce subito.
// Restituisce i gruppi e gli orologi aggiornati, senza toccare quelli ricevuti.
// Quando la riga cambia, un orologio che sta correndo finisce il suo giro con l'intervallo vecchio: il nuovo vale dal gruppo dopo.
export function dueSpawns(
  row: WaveRow,
  nextAt: Readonly<Partial<Record<EnemyId, number>>>,
  elapsed: number,
): { spawns: { kind: EnemyId; size: number }[]; nextAt: Partial<Record<EnemyId, number>> } {
  const spawns: { kind: EnemyId; size: number }[] = [];
  const updated = { ...nextAt };
  for (const kind of Object.keys(row) as EnemyId[]) {
    const group = row[kind];
    if (!group || elapsed < (nextAt[kind] ?? 0)) continue;
    spawns.push({ kind, size: group.size });
    updated[kind] = elapsed + group.everyMs;
  }
  return { spawns, nextAt: updated };
}
