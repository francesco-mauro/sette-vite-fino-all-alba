// I test dell'ingrandimento: quante volte intere la scena 480x270 entra nei pixel veri dello schermo.
import { describe, expect, it } from "vitest";
import { integerZoom } from "../../src/logic/zoom";

const WIDTH = 480;
const HEIGHT = 270;

describe("l'ingrandimento intero", () => {
  it("su una finestra del computer 960x540 la scena entra 2 volte", () => {
    expect(integerZoom(960, 540, 1, WIDTH, HEIGHT)).toBe(2);
  });

  it("sul telefono di prova a tutto schermo entra 4 volte, anche se il browser arrotonda l'altezza", () => {
    // Lo schermo è alto 1080 pixel veri, cioè 375,65 pixel CSS a densità 2,875
    // (dedotta: una schermata larga 2424 pixel per 843 pixel CSS dichiarati).
    // Il browser dichiara 375: 375 x 2,875 fa 1078, due pixel meno del vero.
    expect(integerZoom(843, 375, 2.875, WIDTH, HEIGHT)).toBe(4);
  });

  it("sul telefono di prova con la barra del browser entra 3 volte", () => {
    expect(integerZoom(735, 295, 2.875, WIDTH, HEIGHT)).toBe(3);
  });

  it("con una densità intera le misure sono esatte e non si arrotonda in su", () => {
    expect(integerZoom(959, 539, 1, WIDTH, HEIGHT)).toBe(1);
    expect(integerZoom(479, 269, 2, WIDTH, HEIGHT)).toBe(1);
  });

  it("con una densità non intera, se manca più di un pixel CSS non si arrotonda in su", () => {
    // 539 pixel CSS a densità 1,5: al massimo 809 pixel veri, e per 3 volte ne servono 810.
    expect(integerZoom(2000, 539, 1.5, WIDTH, HEIGHT)).toBe(2);
  });

  it("non si lascia ingannare dai decimali del computer", () => {
    // 875 x 2,16 fa 1890 esatti, ma il computer calcola 1890,0000000000002.
    // La finestra vera è più bassa di 1890 pixel, quindi 7 volte 270 non ci stanno.
    expect(integerZoom(4000, 874, 2.16, WIDTH, HEIGHT)).toBe(6);
  });

  it("comanda il lato più stretto", () => {
    expect(integerZoom(500, 2000, 1, WIDTH, HEIGHT)).toBe(1);
  });

  it("in una finestra più piccola della scena l'ingrandimento resta 1", () => {
    expect(integerZoom(200, 100, 1, WIDTH, HEIGHT)).toBe(1);
  });
});
