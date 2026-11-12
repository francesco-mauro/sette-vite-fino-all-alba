// I test del tocco sulle carte: vale solo un dito appoggiato e alzato sulla stessa carta,
// dopo che le carte sono pronte. Un dito già sullo schermo prima (il joystick) non sceglie.
import { describe, expect, it } from "vitest";
import { createTapGuard } from "../../src/logic/tap";

describe("il tocco sulle carte", () => {
  it("vale se il dito si appoggia e si alza sulla stessa carta", () => {
    const tap = createTapGuard();
    tap.down(1, 2);
    expect(tap.up(1, 2)).toBe(true);
  });

  it("non vale per un dito che era già giù prima che le carte comparissero", () => {
    const tap = createTapGuard();
    expect(tap.up(1, 0)).toBe(false);
  });

  it("non vale se il dito si alza su un'altra carta", () => {
    const tap = createTapGuard();
    tap.down(1, 0);
    expect(tap.up(1, 1)).toBe(false);
  });

  it("ogni dito conta per sé", () => {
    const tap = createTapGuard();
    tap.down(2, 1);
    expect(tap.up(1, 1)).toBe(false);
    expect(tap.up(2, 1)).toBe(true);
  });

  it("dopo l'alzata il dito va riappoggiato", () => {
    const tap = createTapGuard();
    tap.down(1, 0);
    tap.up(1, 1);
    expect(tap.up(1, 0)).toBe(false);
  });
});
