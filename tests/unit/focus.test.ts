// La pausa quando la pagina perde il fuoco, controllata a ogni fotogramma: conta solo il passaggio da «ha il fuoco»
// a «non ce l'ha», così un telefono che dice sempre «niente fuoco» non tiene la partita in pausa per sempre.
import { describe, expect, it } from "vitest";
import { lostFocus } from "../../src/logic/focus";

describe("lostFocus", () => {
  it("vero solo quando il fuoco se ne va adesso", () => {
    expect(lostFocus(true, false)).toBe(true);
  });

  it("falso se il fuoco c'era e c'è ancora, se torna, o se mancava già", () => {
    expect(lostFocus(true, true)).toBe(false);
    expect(lostFocus(false, true)).toBe(false);
    expect(lostFocus(false, false)).toBe(false);
  });
});
