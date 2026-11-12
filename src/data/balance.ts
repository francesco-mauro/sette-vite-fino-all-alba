// I numeri del bilanciamento: velocità, vita, danni, tempi. Bilanciare vuol dire cambiare un numero qui,
// non il codice. Distanze in pixel della scena (480x270), tempi in millisecondi, velocità in pixel al secondo.

export const CAT = {
  speed: 80,
  // il gatto ha sette vite: questa è la barra di una vita
  maxHealth: 100,
  // dopo un colpo, per quanto i colpi non contano (il gatto lampeggia). È il tetto del danno: circondato da
  // cinquanta piccioni il gatto prende un colpo ogni 0,7 secondi, come con uno solo. Era 1000: con quel tetto
  // il gatto reggeva troppo (misura del 12 novembre 2026 nelle ondate, sotto).
  invulnerabilityMs: 700,
  // alla ripresa dopo la scelta di una carta o una pausa, per riprendere in mano il gatto
  resumeInvulnerabilityMs: 1000,
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
  // all'inizio della notte: con 10 la prima barra finiva in meno di mezzo minuto. Poi cresce con le ondate
  // (WAVES.endDamageScale)
  damage: 6,
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

// Il pelo che vola: `count` ciuffi in tutte le direzioni, ognuno vola fino al bordo dello schermo
// o si ferma sul primo nemico che tocca.
export const FUR_LEVELS = [
  { cooldownMs: 2200, damage: 8, count: 2, speed: 140 },
  { cooldownMs: 2000, damage: 9, count: 3, speed: 140 },
  { cooldownMs: 1800, damage: 10, count: 4, speed: 150 },
  { cooldownMs: 1600, damage: 12, count: 6, speed: 150 },
  { cooldownMs: 1400, damage: 14, count: 8, speed: 160 },
];

// I potenziamenti passivi: quanto aggiunge ogni livello della carta.
export const PASSIVES = {
  speedPerLevel: 0.1,
  damagePerLevel: 0.15,
  magnetPerLevel: 0.25,
  healthPerLevel: 20,
  // pancia piena rende anche vita piano: al secondo, per ogni livello della carta (al quinto, 1 al secondo)
  regenPerLevel: 0.2,
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

// La notte: quanto dura se nessuno sceglie (le scelte 5, 10, 15 sono in src/logic/night.ts), quante vite ha il gatto,
// e la partita corta per le prove (?corta nell'indirizzo).
export const RUN = {
  durationMs: 15 * 60_000,
  shortDurationMs: 3 * 60_000,
  lives: 7,
  // dopo una vita persa il gatto riparte con la vita piena e un attimo di invulnerabilità più lungo
  respawnInvulnerabilityMs: 1500,
  // i primi secondi, in basso, la riga che spiega come si gioca
  hintMs: 30_000,
};

// Le ondate: dall'inizio all'alba l'intervallo tra i gruppi scende, i gruppi crescono e i piccioni fanno più danno.
// Misurate il 12 novembre 2026 con una partita automatica da 5 minuti (il gatto gira in tondo, prima carta
// a ogni livello): prima perdeva 2 vite su 7, troppo poche (Francesco: «il gatto ha troppa vita»).
export const WAVES = {
  startIntervalMs: 2200,
  endIntervalMs: 550,
  startGroup: 3,
  endGroup: 9,
  // all'alba un piccione nato adesso fa questo multiplo del danno: 18 invece di 6. La vita invece resta 10:
  // con 11 il primo graffio (10) non basterebbe più, le uccisioni si dimezzerebbero e i poteri arriverebbero
  // tardi (misurato: livello 4 invece di 12 alla fine della notte da 5 minuti).
  endDamageScale: 3,
  // e corre questo multiplo della velocità: 56 invece di 35, sempre meno del gatto (80), ma girare in tondo
  // non basta più a lasciarli indietro
  endSpeedScale: 1.6,
};

export const SPAWN = {
  // quanto lontano, fuori dallo schermo, nascono
  margin: 32,
  // il tetto dei nemici vivi insieme: il pool non cresce oltre
  maxEnemies: 300,
};

// Le casse del tesoro: compaiono sulla mappa lontano dal gatto, da cercare con la minimappa.
// Ogni notte, corta o lunga, ne ha lo stesso numero; chi ne prende una riceve un potere, a volte tre.
export const CHEST = {
  perNight: 8,
  // quante possono aspettare sulla mappa insieme: la prossima aspetta che se ne prenda una, e se il gatto
  // non le prende ne nascono meno di otto
  maxOnGround: 2,
  // quanto lontano dal gatto nascono, in pixel: lo schermo è largo 480, quindi sempre fuori vista
  minDistance: 300,
  maxDistance: 600,
  // la probabilità che la cassa dia tre poteri invece di uno
  tripleChance: 0.1,
};
