// I test del parametro ?misura: quanti sprite finti accendere, letto dall'indirizzo della pagina.
import { describe, expect, it } from "vitest";
import { nextMeasureCount, parseMeasureParam } from "../../src/logic/measureParam";

describe("il parametro misura nell'indirizzo", () => {
  it("senza il parametro la misura è spenta", () => {
    expect(parseMeasureParam("")).toBeNull();
    expect(parseMeasureParam("?altro=1")).toBeNull();
  });

  it("il parametro da solo accende 200 sprite", () => {
    expect(parseMeasureParam("?misura")).toBe(200);
  });

  it("il parametro con un numero accende quel numero di sprite", () => {
    expect(parseMeasureParam("?misura=500")).toBe(500);
  });

  it("un valore che non è un numero intero tra 1 e 5000 torna a 200", () => {
    expect(parseMeasureParam("?misura=tanti")).toBe(200);
    expect(parseMeasureParam("?misura=0")).toBe(200);
    expect(parseMeasureParam("?misura=-5")).toBe(200);
    expect(parseMeasureParam("?misura=12.5")).toBe(200);
    expect(parseMeasureParam("?misura=999999")).toBe(200);
  });
});

describe("il tasto che cambia il numero di sprite", () => {
  it("passa da 200 a 500, da 500 a 1000 e poi torna a 200", () => {
    expect(nextMeasureCount(200)).toBe(500);
    expect(nextMeasureCount(500)).toBe(1000);
    expect(nextMeasureCount(1000)).toBe(200);
  });

  it("da un numero fuori dalla lista va al primo più grande, o torna a 200", () => {
    expect(nextMeasureCount(350)).toBe(500);
    expect(nextMeasureCount(3000)).toBe(200);
  });
});
