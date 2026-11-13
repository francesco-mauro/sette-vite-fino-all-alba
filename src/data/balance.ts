// I numeri del bilanciamento: velocità, vita, danni, tempi. Bilanciare vuol dire cambiare un numero qui,
// non il codice. Distanze in pixel della scena (480x270), tempi in millisecondi, velocità in pixel al secondo.
//
// Contenuti:
// - CAT: velocità, vita e invulnerabilità del gatto
// - ENEMIES: i quattro nemici (piccione, zanzara, pantegana, cornacchia) e la picchiata
// - BOSSES, BOSS_ORDER, BOSS: i due capi (gabbiano con la carica, gabbiano reale con l'urlo), quando nascono, quanta vita
// - SCRATCH_LEVELS, TAIL_LEVELS, FUR_LEVELS, MEOW_LEVELS e MEOW: le quattro armi, livello per livello
// - PASSIVES: quanto aggiunge ogni carta dei potenziamenti
// - KIBBLE, LEVELS: crocchette e curva dei livelli
// - CARD_WEIGHTS, FALLBACK: rarità delle carte e carte di ripiego
// - RUN: durata della notte, vite, riga dei primi secondi
// - WAVES: quanto crescono danno e velocità dei nemici nella notte (chi arriva e quando è in waves.ts)
// - SPAWN: dove nascono, quanti al massimo e da che distanza tornano vicino
// - CHEST: le casse del tesoro

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

// I quattro nemici della 1.0. L'id è anche il nome dello sprite in public/assets/.
export type EnemyId = "piccione" | "zanzara" | "pantegana" | "cornacchia";

// La picchiata della cornacchia (src/logic/dive.ts): a tiro si ferma, prende la mira, si lancia dritta, riprende fiato.
export interface DiveConfig {
  // da che distanza dal gatto si ferma a prendere la mira
  triggerDistance: number;
  // quanto resta ferma prima di lanciarsi: è l'avviso per chi gioca
  aimMs: number;
  // quanto dura la picchiata e a che velocità: insieme dicono quanta strada fa (600 ms a 190 sono 114 pixel)
  diveMs: number;
  diveSpeed: number;
  // quanto resta ferma dopo: il momento buono per colpirla
  restMs: number;
}

// Quello che hanno in comune nemici e capi.
export interface FoeKind {
  speed: number;
  health: number;
  // danno al contatto con il gatto
  damage: number;
  // quanta esperienza vale la crocchetta che lascia
  xp: number;
  // quante volte la lascia, da 0 (mai) a 1 (sempre)
  kibbleChance: number;
  // la scatola delle collisioni, più piccola dello sprite perché i bordi sono vuoti
  body: { width: number; height: number };
  // solo per chi scende in picchiata (la cornacchia) o carica (il gabbiano)
  dive?: DiveConfig;
}

export interface EnemyKind extends FoeKind {
  key: EnemyId;
}

// Numeri di partenza del 13 novembre 2026, provati con la partita automatica: la bilanciatura vera,
// con i numeri scelti da Francesco, arriva quando c'è tutto il contenuto della tappa 4.
export const ENEMIES: Record<EnemyId, EnemyKind> = {
  // lento, arriva a gruppi
  piccione: {
    key: "piccione",
    speed: 35,
    health: 10,
    // all'inizio della notte: con 10 la prima barra finiva in meno di mezzo minuto. Poi cresce con le ondate
    // (WAVES.endDamageScale)
    damage: 6,
    xp: 1,
    kibbleChance: 1,
    body: { width: 12, height: 10 },
  },
  // veloce, poca vita: uno sciame che arriva addosso, ma cade con qualsiasi colpo
  zanzara: {
    key: "zanzara",
    speed: 55,
    health: 4,
    damage: 3,
    xp: 1,
    // arrivano in tante e cadono subito: se ognuna lasciasse la crocchetta si salirebbe di livello ogni
    // quindici secondi (misura del 13 novembre 2026: livello 22 in 5 minuti)
    kibbleChance: 0.35,
    body: { width: 8, height: 8 },
  },
  // resistente: lenta, cade solo al quarto graffio del primo livello e fa male
  pantegana: {
    key: "pantegana",
    speed: 28,
    health: 40,
    damage: 10,
    xp: 3,
    kibbleChance: 1,
    body: { width: 14, height: 9 },
  },
  // scende in picchiata: va schivata di lato, e si colpisce mentre riprende fiato
  cornacchia: {
    key: "cornacchia",
    speed: 45,
    health: 16,
    damage: 12,
    xp: 2,
    kibbleChance: 1,
    body: { width: 12, height: 10 },
    dive: { triggerDistance: 80, aimMs: 450, diveMs: 600, diveSpeed: 190, restMs: 700 },
  },
};

// il nemico di riserva, quando a uno sprite manca il suo tipo
export const PIGEON = ENEMIES.piccione;

// I due capi. L'id è anche il nome dello sprite in public/assets/ (32x32).
export type BossId = "gabbiano" | "gabbiano-reale";

// L'urlo del gabbiano reale (src/logic/scream.ts): a tiro si ferma, carica l'urlo, urla, riprende fiato.
export interface ScreamConfig {
  // da che distanza dal gatto si ferma a caricare l'urlo
  triggerDistance: number;
  // quanto dura l'avviso, con il cerchio che si allarga
  windupMs: number;
  // fin dove arriva l'urlo: chi è dentro in quell'istante prende il colpo
  radius: number;
  // quanto resta fermo dopo: il momento buono per colpirlo
  restMs: number;
}

export interface BossKind extends FoeKind {
  key: BossId;
  // quando nasce, in frazione di notte: 1/3 vuol dire al quinto minuto di una notte da 15
  at: number;
  // solo per chi urla
  scream?: ScreamConfig;
  // la cassa che lascia dove cade dà sempre tre poteri
  tripleChest: boolean;
}

// Numeri di partenza del 13 novembre 2026. `health` è la vita nella notte da 15 minuti: nelle notti più corte
// cala in proporzione (bossHealth in src/logic/boss.ts). Danno e velocità crescono con la notte come per gli
// altri nemici (WAVES), quindi il gabbiano reale, che nasce più tardi, parte da numeri più bassi.
export const BOSSES: Record<BossId, BossKind> = {
  // il primo capo: carica come la cornacchia, ma da più lontano, più a lungo e più forte. Si schiva di lato.
  gabbiano: {
    key: "gabbiano",
    at: 1 / 3,
    speed: 40,
    // con 600 il gatto automatico, che non mira, ci metteva da tre minuti e mezzo a sei (notte da 15)
    health: 300,
    damage: 15,
    xp: 10,
    kibbleChance: 1,
    body: { width: 22, height: 14 },
    // 650 ms a 230 sono 150 pixel di carica; l'avviso dura 700 ms
    dive: { triggerDistance: 100, aimMs: 700, diveMs: 650, diveSpeed: 230, restMs: 1300 },
    tripleChest: false,
  },
  // il secondo capo: arriva vicino, si ferma e urla. Dall'urlo ci si allontana: nel tempo dell'avviso
  // il gatto fa 72 pixel, più del raggio (c'è un test).
  "gabbiano-reale": {
    key: "gabbiano-reale",
    at: 2 / 3,
    speed: 34,
    health: 900,
    damage: 12,
    xp: 20,
    kibbleChance: 1,
    body: { width: 20, height: 22 },
    scream: { triggerDistance: 50, windupMs: 900, radius: 60, restMs: 1500 },
    tripleChest: true,
  },
};

// in che ordine nascono
export const BOSS_ORDER: BossId[] = ["gabbiano", "gabbiano-reale"];

export const BOSS = {
  // la notte su cui è scritta la vita dei capi
  fullNightMinutes: 15,
  // per quanto resta a schermo la scritta che annuncia un capo
  announceMs: 2500,
};

// Le armi, livello per livello: la riga 0 è il livello 1. Il graffio c'è dall'inizio e arriva al livello 6
// (1 di partenza più 5 carte); coda a frusta, pelo che vola e miagolio arrivano con la loro carta, fino al livello 5.

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

// Il miagolio: un'onda tonda intorno al gatto. Fa poco danno a tutti quelli entro `radius` e li spinge via
// di `push` pixel: è la difesa per quando il gatto è circondato. Il danno è basso apposta, perché colpisce
// tutti quelli intorno insieme: solo all'ultimo livello basta, da solo, per una zanzara (unghie affilate lo alza
// come per le altre armi). Con il primo danno provato
// (4, 5, 6, 8, 10) e l'onda al livello 3 dal primo secondo, il gatto automatico in tondo prendeva da 2002 a 2440
// nemici e arrivava al livello 35-40 in una notte da 5 minuti, contro 189-657 nemici e livello 9-19 senza miagolio
// (misura del 13 novembre 2026). La spinta all'inizio era 24, 28, 32, 36, 42: dopo averci giocato Francesco
// l'ha voluta un po' più lunga (13 novembre 2026). Resta entro il raggio dell'onda.
export const MEOW_LEVELS = [
  { cooldownMs: 3000, damage: 2, radius: 40, push: 32 },
  { cooldownMs: 2800, damage: 2, radius: 44, push: 36 },
  { cooldownMs: 2600, damage: 3, radius: 48, push: 42 },
  { cooldownMs: 2400, damage: 3, radius: 54, push: 48 },
  { cooldownMs: 2200, damage: 4, radius: 60, push: 56 },
];

export const MEOW = {
  // in quanto tempo un nemico fa la strada della spinta: breve, così si vede lo scatto all'indietro
  pushMs: 160,
  // quanta della spinta sentono i capi: 0 vuol dire che prendono il danno ma restano dove sono. Se si spostassero,
  // dall'urlo del gabbiano reale non servirebbe più allontanarsi.
  bossPush: 0,
};

// I potenziamenti passivi: quanto aggiunge ogni livello della carta.
export const PASSIVES = {
  speedPerLevel: 0.1,
  damagePerLevel: 0.15,
  magnetPerLevel: 0.25,
  healthPerLevel: 20,
  // pancia piena rende anche vita piano: al secondo, per ogni livello della carta (al quinto, 1 al secondo)
  regenPerLevel: 0.2,
  // riflessi pronti: quanto più spesso partono tutte le armi, per livello (al quinto, il 40% in più:
  // un'arma che aspettava 1000 millisecondi ne aspetta 714)
  hastePerLevel: 0.08,
  // pelo gonfio: quanto più lontano arrivano graffio, coda a frusta e miagolio, per livello. Il pelo che vola
  // arriva già al bordo dello schermo, quindi non cambia
  areaPerLevel: 0.08,
  // zampa fortunata: quanto peso in più hanno le carte rare nell'estrazione, per livello (le rare partono da
  // CARD_WEIGHTS.rare, le comuni restano ferme), e quanta probabilità in più ha una cassa di essere tripla
  luckRareWeightPerLevel: 1,
  luckTriplePerLevel: 0.04,
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

// Le ondate: chi arriva, in quanti e ogni quanto sta nella tabella di src/data/waves.ts, minuto per minuto.
// Qui quanto diventano cattivi i nemici nati più tardi: dall'inizio all'alba danno e velocità salgono dritti.
// Misurate il 12 novembre 2026 con una partita automatica da 5 minuti (il gatto gira in tondo, prima carta
// a ogni livello): prima perdeva 2 vite su 7, troppo poche (Francesco: «il gatto ha troppa vita»).
export const WAVES = {
  // all'alba un nemico nato adesso fa questo multiplo del danno: un piccione 18 invece di 6. La vita invece resta 10:
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
  // oltre questa distanza dal gatto un nemico viene riportato in un punto di nascita nuovo, appena fuori dallo
  // schermo. Deve stare oltre il punto più lontano in cui si nasce (circa 340, c'è un test); è più o meno il bordo
  // della minimappa (400 per lato), quindi i puntini che si vedono lì sono quasi tutti i nemici vivi.
  // Prima chi veniva seminato restava vivo lontano e occupava i posti: scappando sempre dritto il gatto
  // arrivava all'alba senza perdere una vita, con cinque nemici in vista (misura del 13 novembre 2026).
  recallDistance: 420,
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
