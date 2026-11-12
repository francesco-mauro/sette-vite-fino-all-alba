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

// Le armi, livello per livello: la riga 0 è il livello 1. Il graffio c'è dall'inizio e arriva al livello 6
// (1 di partenza più 5 carte); coda a frusta e pelo che vola arrivano con la loro carta, fino al livello 5.

// Il graffio: ogni `cooldownMs` colpisce da solo il nemico più vicino entro `range`.
export const SCRATCH_LEVELS = [
  { cooldownMs: 1000, damage: 10, range: 72 },
  { cooldownMs: 900, damage: 13, range: 76 },
  { cooldownMs: 850, damage: 16, range: 80 },
  { cooldownMs: 800, damage: 20, range: 84 },
  { cooldownMs: 700, damage: 24, range: 90 },
  { cooldownMs: 600, damage: 30, range: 96 },
];

// La coda a frusta: un arco davanti al gatto, largo `halfAngle` per parte, che colpisce tutti quelli dentro.
export const TAIL_LEVELS = [
  { cooldownMs: 2000, damage: 12, radius: 40, halfAngle: Math.PI / 3 },
  { cooldownMs: 1800, damage: 15, radius: 44, halfAngle: Math.PI / 3 },
  { cooldownMs: 1600, damage: 18, radius: 48, halfAngle: Math.PI / 2.6 },
  { cooldownMs: 1400, damage: 22, radius: 52, halfAngle: Math.PI / 2.6 },
  { cooldownMs: 1200, damage: 28, radius: 56, halfAngle: Math.PI / 2.2 },
];

// Il pelo che vola: `count` ciuffi in tutte le direzioni, ognuno si ferma sul primo nemico che tocca.
export const FUR_LEVELS = [
  { cooldownMs: 2200, damage: 8, count: 2, speed: 140, lifeMs: 1200 },
  { cooldownMs: 2000, damage: 9, count: 3, speed: 140, lifeMs: 1200 },
  { cooldownMs: 1800, damage: 10, count: 4, speed: 150, lifeMs: 1300 },
  { cooldownMs: 1600, damage: 12, count: 6, speed: 150, lifeMs: 1300 },
  { cooldownMs: 1400, damage: 14, count: 8, speed: 160, lifeMs: 1400 },
];

// I potenziamenti passivi: quanto aggiunge ogni livello della carta.
export const PASSIVES = {
  speedPerLevel: 0.1,
  damagePerLevel: 0.15,
  magnetPerLevel: 0.25,
  healthPerLevel: 20,
};

// Le crocchette: quanta esperienza vale ognuna, e da che distanza la calamita le tira verso il gatto.
export const KIBBLE = {
  xp: 1,
  magnetRadius: 32,
  // la velocità con cui volano verso il gatto, una volta prese dalla calamita
  pullSpeed: 220,
  maxOnGround: 300,
};

// La curva dei livelli: per salire dal livello 1 servono `first` crocchette, poi `growth` in più a ogni livello.
export const LEVELS = {
  first: 5,
  growth: 3,
};

// La scelta tra tre carte: il peso di ogni rarità nell'estrazione, e cosa danno le carte di ripiego.
export const CARD_WEIGHTS = { common: 10, rare: 4 };
export const FALLBACK = {
  healAmount: 30,
  points: 100,
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
