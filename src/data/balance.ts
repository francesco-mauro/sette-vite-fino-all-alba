// I numeri del bilanciamento: velocità, vita, danni, tempi. Bilanciare vuol dire cambiare un numero qui,
// non il codice. Distanze in pixel della scena (480x270), tempi in millisecondi, velocità in pixel al secondo.

export const CAT = {
  speed: 80,
  maxHealth: 100,
  // dopo un colpo, per quanto i colpi non contano (il gatto lampeggia)
  invulnerabilityMs: 800,
};

export interface EnemyKind {
  key: string;
  speed: number;
  health: number;
  // danno al contatto con il gatto
  damage: number;
  // la scatola delle collisioni, più piccola dello sprite 16x16 perché i bordi sono vuoti
  body: { width: number; height: number };
}

export const PIGEON: EnemyKind = {
  key: "piccione",
  speed: 35,
  health: 10,
  damage: 10,
  body: { width: 12, height: 10 },
};

export const SCRATCH = {
  // ogni quanto il graffio parte da solo
  cooldownMs: 1000,
  damage: 10,
  // colpisce il nemico più vicino solo se è entro questa distanza
  range: 72,
};

export const SPAWN = {
  // ogni quanto arriva un gruppo di piccioni, e quanti sono
  intervalMs: 2500,
  groupSize: 3,
  // quanto lontano, fuori dallo schermo, nascono
  margin: 32,
  // il tetto dei nemici vivi insieme: il pool non cresce oltre
  maxEnemies: 200,
};
