// I numeri del bilanciamento: velocità, vita, danni, tempi. Bilanciare vuol dire cambiare un numero qui,
// non il codice. Distanze in pixel della scena (480x270), tempi in millisecondi, velocità in pixel al secondo.
//
// Contenuti:
// - CAT: velocità, vita, quanto fa male la folla e invulnerabilità del gatto
// - ENEMIES: i quattro nemici (piccione, zanzara, pantegana, cornacchia), la picchiata, i modi di camminare e i gruppi
// - BOSSES, BOSS_ORDER, BOSS: i due capi (gabbiano con la carica, gabbiano reale con l'urlo), quando nascono, quanta vita
// - SCRATCH_LEVELS, TAIL_LEVELS, FUR_LEVELS, MEOW_LEVELS e MEOW: le quattro armi, livello per livello
// - PASSIVES: quanto aggiunge ogni carta dei potenziamenti
// - KIBBLE, LEVELS: crocchette e curva dei livelli
// - SNACK: il supplì a terra, che cura
// - CARD_WEIGHTS, FALLBACK: rarità delle carte e carte di ripiego
// - RUN: durata della notte, vite, riga dei primi secondi
// - WAVES: quanto crescono danno e velocità dei nemici nella notte (chi arriva e quando è in waves.ts)
// - HORDE: le orde, un'onda da un lato solo e poi il respiro
// - SPAWN: dove nascono, quanti al massimo e da che distanza tornano vicino
// - CROWD: le spinte leggere tra nemici, perché non finiscano uno sopra l'altro
// - CHEST: le casse del tesoro

export const CAT = {
  speed: 80,
  // il gatto ha sette vite: questa è la barra di una vita
  maxHealth: 100,
  // la folla fa male (src/logic/health.ts, contactHit). Ogni nemico appoggiato colpisce una volta ogni `contactMs`,
  // per conto suo; il tetto è `hitGapMs`, l'attimo dopo ogni colpo in cui nessun colpo conta (il gatto lampeggia):
  // al massimo quattro colpi al secondo. Prima c'era solo un attimo di 0,7 secondi dopo ogni colpo, da chiunque:
  // circondato da cinquanta piccioni il gatto prendeva un colpo ogni 0,7 secondi, come con uno solo, e si passava
  // in mezzo alla folla (Francesco, 13 novembre 2026: «ci si passa semplicemente attraverso»).
  contactMs: 700,
  hitGapMs: 250,
  // alla ripresa dopo la scelta di una carta, una cassa, la pausa o la mappa, per riprendere in mano il gatto.
  // Un secondo e mezzo dal 13 novembre 2026, scelta di Francesco (prima 1000)
  resumeInvulnerabilityMs: 1500,
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

// I modi di camminare (src/logic/patterns.ts), approvati da Francesco il 13 novembre 2026:
// prima piccione, zanzara e pantegana andavano tutti dritti sul gatto e cambiava solo la velocità.
// La zanzara ondeggia: ogni `periodMs` piega una volta da una parte e una dall'altra; `swing` è quanto, 1 vuol dire
// fino a 45 gradi.
export interface ZigzagConfig {
  periodMs: number;
  swing: number;
}

// La pantegana a scatti: punta dove è il gatto e tiene quella direzione per `dashMs`, poi ricalcola.
export interface DashConfig {
  dashMs: number;
}

// Il piccione cammina per circa `walkMs` (da tre quarti a cinque quarti, diverso per ognuno), poi si ferma a
// beccare per `peckMs`.
export interface PeckConfig {
  walkMs: number;
  peckMs: number;
}

// Come sta insieme un gruppo (src/logic/flock.ts), approvato da Francesco il 13 novembre 2026: lo stormo di piccioni
// cammina e becca tutto insieme, lo sciame di zanzare gira intorno a un centro che ondeggia verso il gatto, le
// pantegane corrono in fila dietro alla prima, che decide lo scatto.
export interface GroupConfig {
  formation: "flock" | "swarm" | "line";
  // lo spazio tra due vicini, nello stormo e nella fila; anche come nascono, prima di prendere la forma
  spacing: number;
  // quanto forte ognuno rincorre il suo posto, per secondo: 3 vuol dire 30 pixel al secondo in più a 10 dal posto
  pull: number;
  // fino a quante volte la sua velocità corre chi è rimasto indietro
  catchUp: number;
  // solo lo sciame: quanto è largo e ogni quanto una zanzara fa il giro del centro
  radius?: number;
  periodMs?: number;
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
  // solo per chi cammina a modo suo: la zanzara ondeggia, la pantegana va a scatti, il piccione becca
  zigzag?: ZigzagConfig;
  dash?: DashConfig;
  peck?: PeckConfig;
  // solo per chi arriva in gruppo e resta in gruppo: piccione, zanzara, pantegana
  group?: GroupConfig;
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
    // cammina un paio di secondi, poi si ferma un attimo: la folla arriva meno compatta, e resta il nemico facile.
    // Con lo stormo cammina e si ferma tutto il gruppo insieme
    peck: { walkMs: 2000, peckMs: 400 },
    // lo stormo: un mucchietto tondo, i vicini a 16 pixel, appena oltre le spinte (CROWD.radius)
    group: { formation: "flock", spacing: 16, pull: 3, catchUp: 1.5 },
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
    // piega fino a 50 gradi da una parte e dall'altra, un giro ogni 0,8 secondi: verso il gatto va sempre ad
    // almeno 0,64 della sua velocità. Con lo sciame è il centro dello sciame che ondeggia
    zigzag: { periodMs: 800, swing: 1.2 },
    // lo sciame: ogni zanzara gira intorno al centro tra 12 e 24 pixel, un giro ogni due secondi e mezzo (60 pixel
    // al secondo sul giro più largo, sotto i 110 a cui può correre)
    group: { formation: "swarm", spacing: 12, pull: 4, catchUp: 2, radius: 24, periodMs: 2500 },
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
    // corre dritta per un secondo e mezzo verso dove eri: si schiva spostandosi di lato. In fila lo scatto lo
    // decide la prima, le altre la seguono
    dash: { dashMs: 1500 },
    // la fila: ognuna a 16 pixel dietro a quella davanti
    group: { formation: "line", spacing: 16, pull: 3, catchUp: 1.5 },
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
  // quadrifoglio: quanto peso in più hanno le carte rare nell'estrazione, per livello (le rare partono da
  // CARD_WEIGHTS.rare, le comuni restano ferme), e quanta probabilità in più ha una cassa di essere tripla.
  // Era 0,04 (3 casse su 10 triple al livello 5): con otto casse per notte, anche al massimo dall'inizio una notte
  // su venti finiva senza nessuna tripla, e la carta sembrava non fare niente (Francesco, 13 novembre 2026: «poco
  // efficiente perchè non si è attivata mai»). Con 0,08 al livello 5 è tripla una cassa su due.
  luckRareWeightPerLevel: 1,
  luckTriplePerLevel: 0.08,
};

// Le crocchette: quanta esperienza vale ognuna, e da che distanza la calamita le tira verso il gatto.
export const KIBBLE = {
  xp: 1,
  magnetRadius: 32,
  // la velocità con cui volano verso il gatto, una volta prese dalla calamita
  pullSpeed: 220,
  maxOnGround: 300,
};

// Il supplì a terra: ogni tanto lo lascia un nemico eliminato, e cura. Numeri di partenza, da provare giocando.
export const SNACK = {
  // quanto cura: come il supplì delle carte di ripiego (FALLBACK.healAmount, un test li tiene uguali)
  heal: 30,
  // la probabilità che un nemico eliminato ne lasci uno
  chance: 0.02,
  // dopo un supplì, per quanto non ne cadono altri: senza questa pausa a fine notte, con i nemici eliminati
  // a decine al minuto, ne pioverebbero
  minGapMs: 30_000,
  // il gatto lo mangia solo se gli mancano almeno questi punti di vita: a vita piena, o per un graffietto,
  // resta a terra per dopo
  minMissing: 10,
  // quanti ne stanno a terra insieme: oltre, quello nuovo prende il posto del più lontano dal gatto
  maxOnGround: 5,
  // cade un po' di lato, per non coprire la crocchetta dello stesso nemico
  offset: 8,
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

// Le orde (src/logic/waves.ts, hordeTime e scaleRow), approvate da Francesco il 13 novembre 2026: invece di una
// pioggia continua da tutti i lati, un'onda da un lato solo, poi una pausa. Arriva un'onda, la affronti, poi respiri.
// Numeri di partenza: in tutta la notte nascono gli stessi nemici di prima, a gruppi due volte più grandi.
export const HORDE = {
  // ogni quanto arriva un'onda
  cycleMs: 20_000,
  // per quanto nasce l'onda: in questi 8 secondi nasce quello che prima nasceva in 20, poi 12 secondi di respiro
  arriveMs: 8_000,
  // gruppi così tante volte più grandi, e così tante volte più rari, dei numeri della tabella delle ondate
  sizeScale: 2,
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

// Le spinte leggere tra nemici (src/logic/separation.ts): chi sta troppo vicino a un altro si scosta un po'.
// Prima tutti andavano dritti sul gatto e, con la stessa strada e quasi la stessa velocità, finivano uno sopra
// l'altro: un mucchio solo, dove non si vedeva quanti erano (Francesco, 13 novembre 2026). I capi non spingono e
// non vengono spinti. La cornacchia in mira, in picchiata o mentre riprende fiato, e chi è spinto via dal miagolio,
// spingono i vicini ma non ricevono la spinta: hanno già una strada loro.
export const CROWD = {
  // sotto questa distanza tra due centri due nemici si spingono: la scatola del nemico più largo, la pantegana
  radius: 14,
  // quanto forte, in multipli della velocità di chi la riceve, quando due nemici sono uno sopra l'altro. Scende a
  // zero alla distanza del raggio: a metà raggio vale quanto la sua corsa. Sotto 1 non basterebbe: la spinta non
  // vincerebbe mai la corsa verso il gatto, e lì si impilerebbero lo stesso
  push: 2,
  // la misura del mucchio, nello stato di debug: due nemici più vicini di così sono «uno sopra l'altro»
  overlapDistance: 4,
  // lo spazio libero tra due gruppi (src/logic/flock.ts, groupPushes): più vicini della somma dei raggi più questo,
  // si spingono via. Così intorno al gatto i gruppi restano più staccati: la massa più grande scende, ma col gatto
  // fermo restano un anello intorno a lui (misura del 13 novembre 2026)
  groupGap: 12,
  // la misura della massa unica, nello stato di debug: due nemici più vicini di così stanno nella stessa massa
  // (src/logic/separation.ts, largestClump). Poco più del raggio delle spinte: in una folla spinta i vicini stanno
  // a 14-16 pixel
  clumpDistance: 20,
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
