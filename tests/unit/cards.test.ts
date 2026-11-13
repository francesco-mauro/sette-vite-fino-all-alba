// I test della scelta tra tre carte: niente doppioni, niente carte al massimo, la carta di ripiego,
// lo stesso seme che dà le stesse carte, le rare più difficili da trovare, le icone delle carte.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARD_ICONS, CARDS, FALLBACK_CARDS } from "../../src/data/cards";
import { CARD_TEXTS } from "../../src/data/texts";
import { cardDescription, drawCards, luckyWeights, type CardDef } from "../../src/logic/cards";
import { createRng } from "../../src/logic/rng";

const POOL: CardDef[] = [
  { id: "a", rarity: "common", maxLevel: 5 },
  { id: "b", rarity: "common", maxLevel: 5 },
  { id: "c", rarity: "common", maxLevel: 5 },
  { id: "d", rarity: "rare", maxLevel: 5 },
  { id: "e", rarity: "rare", maxLevel: 1 },
];
const FALLBACK = ["cura", "punti"];
const WEIGHTS = { common: 10, rare: 3 };

// dieci scelte di fila con un seme: la "partita" delle carte
function run(seed: number) {
  const rng = createRng(seed);
  return Array.from({ length: 10 }, () => drawCards(POOL, {}, rng, WEIGHTS, FALLBACK));
}

describe("le tre carte", () => {
  it("sono sempre tre e sempre diverse tra loro", () => {
    const rng = createRng(1);
    for (let i = 0; i < 200; i++) {
      const cards = drawCards(POOL, {}, rng, WEIGHTS, FALLBACK);
      expect(cards).toHaveLength(3);
      expect(new Set(cards).size).toBe(3);
    }
  });

  it("una carta già al livello massimo non esce più", () => {
    const rng = createRng(2);
    for (let i = 0; i < 200; i++) {
      expect(drawCards(POOL, { e: 1 }, rng, WEIGHTS, FALLBACK)).not.toContain("e");
    }
  });

  it("se restano meno di tre carte, i posti vuoti li prende la carta di ripiego", () => {
    const owned = { a: 5, b: 5, c: 5, d: 5 };
    const cards = drawCards(POOL, owned, createRng(3), WEIGHTS, FALLBACK);
    expect(cards).toContain("e");
    expect(cards).toContain("cura");
    expect(cards).toContain("punti");
  });

  it("con tutto al massimo escono solo carte di ripiego, senza doppioni", () => {
    const owned = { a: 5, b: 5, c: 5, d: 5, e: 1 };
    const cards = drawCards(POOL, owned, createRng(4), WEIGHTS, FALLBACK);
    expect(cards).toEqual(expect.arrayContaining(FALLBACK));
    expect(cards).toHaveLength(2);
  });

  it("con lo stesso seme escono le stesse carte, partita dopo partita", () => {
    expect(run(123)).toEqual(run(123));
    expect(run(123)).not.toEqual(run(124));
  });

  it("le rare escono meno delle comuni", () => {
    const rng = createRng(5);
    let rare = 0;
    let common = 0;
    for (let i = 0; i < 2000; i++) {
      for (const id of drawCards(POOL, {}, rng, WEIGHTS, FALLBACK)) {
        if (id === "d" || id === "e") rare++;
        else common++;
      }
    }
    expect(rare).toBeLessThan(common / 2);
    expect(rare).toBeGreaterThan(0);
  });
});

describe("la fortuna", () => {
  it("aggiunge peso alle rare e lascia le comuni com'erano", () => {
    expect(luckyWeights(WEIGHTS, 2)).toEqual({ common: 10, rare: 5 });
  });

  it("senza fortuna i pesi restano gli stessi, e quelli di partenza non vengono toccati", () => {
    expect(luckyWeights(WEIGHTS, 0)).toEqual(WEIGHTS);
    luckyWeights(WEIGHTS, 5);
    expect(WEIGHTS).toEqual({ common: 10, rare: 3 });
  });

  it("con la fortuna le rare escono più spesso di prima", () => {
    const count = (weights: typeof WEIGHTS) => {
      const rng = createRng(7);
      let rare = 0;
      for (let i = 0; i < 2000; i++) if (drawCards(POOL, {}, rng, weights, FALLBACK, 1)[0] === "d") rare++;
      return rare;
    };
    expect(count(luckyWeights(WEIGHTS, 5))).toBeGreaterThan(count(WEIGHTS) * 1.5);
  });
});

describe("le carte del gioco", () => {
  it("ci sono le quattro armi e i sette potenziamenti, senza doppioni", () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(["scratch", "tail", "fur", "meow", "speed", "health", "damage", "magnet", "haste", "area", "luck"]));
    expect(ids).toHaveLength(11);
  });

  it("ogni carta ha il suo nome e le due descrizioni", () => {
    for (const card of CARDS) {
      expect(CARD_TEXTS[card.id].name.length).toBeGreaterThan(0);
      expect(CARD_TEXTS[card.id].first.length).toBeGreaterThan(0);
      expect(CARD_TEXTS[card.id].more.length).toBeGreaterThan(0);
    }
  });

  it("cadenza, area e fortuna hanno cinque livelli come gli altri potenziamenti", () => {
    for (const id of ["haste", "area", "luck"]) expect(CARDS.find((c) => c.id === id)?.maxLevel).toBe(5);
  });
});

// La larghezza e l'altezza di un PNG stanno nell'intestazione, ai byte 16-23.
function pngSize(key: string) {
  const head = readFileSync(`public/assets/${key}.png`);
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

describe("le icone delle carte", () => {
  const ids = [...CARDS.map((c) => c.id), ...FALLBACK_CARDS];

  it("ogni carta ha un'icona, anche quelle di ripiego, e le icone sono tutte diverse", () => {
    for (const id of ids) expect(CARD_ICONS[id]).toBeDefined();
    const seen = ids.map((id) => `${CARD_ICONS[id].key}:${CARD_ICONS[id].frame}`);
    expect(new Set(seen).size).toBe(ids.length);
  });

  it("nessuna carta usa la crocchetta, che a terra è l'esperienza", () => {
    for (const id of ids) expect(CARD_ICONS[id].key).not.toBe("crocchetta");
  });

  it("il fotogramma di ogni icona esiste nel suo disegno (strisce di fotogrammi quadrati)", () => {
    for (const id of ids) {
      const { width, height } = pngSize(CARD_ICONS[id].key);
      expect(CARD_ICONS[id].frame).toBeLessThan(width / height);
    }
  });

  it("le carte di ripiego hanno un nome che si capisce: supplì e spicci", () => {
    expect(FALLBACK_CARDS.map((id) => CARD_TEXTS[id].name)).toEqual(["supplì", "spicci"]);
  });
});

describe("il quadrifoglio", () => {
  it("si chiama quadrifoglio, come la sua icona, e non più zampa fortunata", () => {
    expect(CARD_TEXTS.luck.name).toBe("quadrifoglio");
  });

  it("la carta dice quanto è probabile la cassa tripla al livello che dà", () => {
    expect(cardDescription("luck", 1)).toBe("casse triple 18 su 100, più carte rare");
    expect(cardDescription("luck", 5)).toBe("casse triple 50 su 100, più carte rare");
  });

  it("le altre carte dicono la frase della prima volta, poi quella delle volte dopo", () => {
    expect(cardDescription("tail", 1)).toBe(CARD_TEXTS.tail.first);
    expect(cardDescription("tail", 2)).toBe(CARD_TEXTS.tail.more);
  });
});
