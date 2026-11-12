// I test della conferma: «esci dalla partita» vale solo al secondo tocco, se arriva presto.
import { describe, expect, it } from "vitest";
import { createConfirm } from "../../src/logic/confirm";

describe("la conferma a due tocchi", () => {
  it("il primo tocco non conferma, chiede", () => {
    const c = createConfirm(3000);
    expect(c.press(0)).toBe(false);
    expect(c.armed(0)).toBe(true);
  });

  it("il secondo tocco entro il tempo conferma", () => {
    const c = createConfirm(3000);
    c.press(0);
    expect(c.press(2999)).toBe(true);
  });

  it("passato il tempo la domanda scade e il tocco dopo ricomincia da capo", () => {
    const c = createConfirm(3000);
    c.press(0);
    expect(c.armed(3001)).toBe(false);
    expect(c.press(3001)).toBe(false);
    expect(c.press(3500)).toBe(true);
  });

  it("senza nessun tocco non chiede niente", () => {
    expect(createConfirm(3000).armed(0)).toBe(false);
  });
});
