// I test della scritta d'inizio partita: sparisce al primo movimento, o comunque dopo un po'.
import { describe, expect, it } from "vitest";
import { hintDone } from "../../src/logic/hint";

describe("la scritta «muoviti»", () => {
  it("resta finché il gatto è fermo e il tempo non è passato", () => {
    expect(hintDone(false, 1000, 30_000)).toBe(false);
  });

  it("sparisce appena il gatto si muove", () => {
    expect(hintDone(true, 200, 30_000)).toBe(true);
  });

  it("sparisce comunque dopo il tempo, anche da fermo", () => {
    expect(hintDone(false, 30_001, 30_000)).toBe(true);
  });
});
