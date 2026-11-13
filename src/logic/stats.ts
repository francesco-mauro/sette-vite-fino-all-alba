// Le statistiche: dai livelli delle carte scelte ai numeri che usa la partita, e i numeri di un'arma
// dopo i potenziamenti. Logica pura, senza Phaser.
import { PASSIVES } from "../data/balance";

export interface Stats {
  speedMultiplier: number;
  damageMultiplier: number;
  magnetMultiplier: number;
  maxHealthBonus: number;
  // vita resa al secondo, da pancia piena
  regenPerSecond: number;
  // per quanto si moltiplica l'attesa tra un colpo e l'altro di ogni arma: sotto 1 vuol dire più spesso
  cooldownMultiplier: number;
  // per quanto si moltiplica la portata di graffio, coda a frusta e miagolio
  areaMultiplier: number;
  // dalla fortuna: peso in più alle carte rare, probabilità in più che una cassa sia tripla
  rareWeightBonus: number;
  tripleChanceBonus: number;
  // il livello di ogni arma: 0 vuol dire che il gatto non ce l'ha ancora
  weapons: { scratch: number; tail: number; fur: number; meow: number };
}

// computeStats: `levels` dice a che livello è ogni carta presa (per id). Il graffio c'è dall'inizio, al livello 1:
// la sua carta lo alza oltre. Coda a frusta, pelo che vola e miagolio partono da 0.
export function computeStats(levels: Readonly<Record<string, number>>): Stats {
  const lv = (id: string) => levels[id] ?? 0;
  return {
    speedMultiplier: 1 + PASSIVES.speedPerLevel * lv("speed"),
    damageMultiplier: 1 + PASSIVES.damagePerLevel * lv("damage"),
    magnetMultiplier: 1 + PASSIVES.magnetPerLevel * lv("magnet"),
    maxHealthBonus: PASSIVES.healthPerLevel * lv("health"),
    regenPerSecond: PASSIVES.regenPerLevel * lv("health"),
    // più spesso del tanto per cento vuol dire attesa divisa: con il 40% in più l'attesa è 1 / 1,4
    cooldownMultiplier: 1 / (1 + PASSIVES.hastePerLevel * lv("haste")),
    areaMultiplier: 1 + PASSIVES.areaPerLevel * lv("area"),
    rareWeightBonus: PASSIVES.luckRareWeightPerLevel * lv("luck"),
    tripleChanceBonus: PASSIVES.luckTriplePerLevel * lv("luck"),
    weapons: { scratch: 1 + lv("scratch"), tail: lv("tail"), fur: lv("fur"), meow: lv("meow") },
  };
}

// tuneWeapon: i numeri di un livello di un'arma dopo i potenziamenti. Riflessi pronti accorcia l'attesa,
// pelo gonfio allunga la portata (`range`, il graffio) e il raggio (`radius`, coda a frusta e miagolio).
// Chi non ha né portata né raggio, come il pelo che vola, cambia solo nell'attesa. Tutto il resto resta
// com'era, e la tabella di partenza non viene toccata.
export function tuneWeapon<T extends { cooldownMs: number; range?: number; radius?: number }>(
  lv: T,
  stats: Pick<Stats, "cooldownMultiplier" | "areaMultiplier">,
): T {
  const tuned = { ...lv, cooldownMs: lv.cooldownMs * stats.cooldownMultiplier };
  if (lv.range !== undefined) tuned.range = lv.range * stats.areaMultiplier;
  if (lv.radius !== undefined) tuned.radius = lv.radius * stats.areaMultiplier;
  return tuned;
}
