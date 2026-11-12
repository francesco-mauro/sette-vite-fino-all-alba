// La formula del punteggio. Sta in src/shared/ perché alla tappa 6 la userà anche il Worker,
// per scartare i punteggi impossibili mandati alla classifica: gioco e server contano allo stesso modo.
// Per questo i numeri stanno qui e non in src/data/, che il Worker non importa.

export const SCORE = {
  perSecond: 1,
  perKill: 10,
  dawnBonus: 5000,
  perLifeLost: 250,
};

export interface RunResult {
  survivedMs: number;
  kills: number;
  // le mance raccolte con le carte di ripiego
  points: number;
  livesLost: number;
  dawn: boolean;
}

// computeScore: un punto per ogni secondo vivo, dieci per ogni piccione, le mance, il premio dell'alba;
// meno un pezzo per ogni vita persa, senza scendere sotto zero.
export function computeScore(run: RunResult): number {
  const raw =
    Math.floor(run.survivedMs / 1000) * SCORE.perSecond +
    run.kills * SCORE.perKill +
    run.points +
    (run.dawn ? SCORE.dawnBonus : 0) -
    run.livesLost * SCORE.perLifeLost;
  return Math.max(0, raw);
}
