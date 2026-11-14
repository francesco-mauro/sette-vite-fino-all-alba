// I test del parametro ?tetto: quanti nemici vivi insieme al massimo, per le prove di prestazioni e le misure.
import { describe, expect, it } from "vitest";
import { SPAWN } from "../../src/data/balance";
import { CAP_MAX, parseCapParam } from "../../src/logic/capParam";

describe("il parametro tetto nell'indirizzo", () => {
  it("senza il parametro vale il tetto del gioco", () => {
    expect(parseCapParam("", 200)).toBe(200);
    expect(parseCapParam("?debug&seme=11", 200)).toBe(200);
  });

  it("con un numero vale quel numero", () => {
    expect(parseCapParam("?tetto=150", 200)).toBe(150);
    expect(parseCapParam("?debug&tetto=500&seme=11", 200)).toBe(500);
  });

  it("un valore strano torna al tetto del gioco", () => {
    expect(parseCapParam("?tetto", 200)).toBe(200);
    expect(parseCapParam("?tetto=tanti", 200)).toBe(200);
    expect(parseCapParam("?tetto=0", 200)).toBe(200);
    expect(parseCapParam("?tetto=-5", 200)).toBe(200);
    expect(parseCapParam("?tetto=12.5", 200)).toBe(200);
  });

  it("si arriva fino a CAP_MAX, oltre torna al tetto del gioco", () => {
    expect(parseCapParam(`?tetto=${CAP_MAX}`, 200)).toBe(CAP_MAX);
    expect(parseCapParam(`?tetto=${CAP_MAX + 1}`, 200)).toBe(200);
    expect(CAP_MAX).toBeGreaterThanOrEqual(500);
  });
});

describe("il tetto del gioco", () => {
  it("è 200, il passo 1 del disegno contro il blob", () => {
    expect(SPAWN.maxEnemies).toBe(200);
  });
});
