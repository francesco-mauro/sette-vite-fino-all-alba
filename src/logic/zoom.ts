// L'ingrandimento: quante volte intere la scena entra nei pixel veri dello schermo. Logica pura, senza Phaser.

// maxRealPixels: quanti pixel veri può avere, al massimo, un lato della finestra.
// Il browser dichiara le misure in pixel CSS interi e taglia i decimali. Con una densità intera il conto
// è esatto. Con una densità non intera no: sul telefono di prova lo schermo è alto 1080 pixel veri,
// cioè 375,65 pixel CSS a densità 2,875, e il browser dichiara 375. La misura vera sta fra quella
// dichiarata e un pixel CSS in più, senza arrivarci: qui si prende il numero intero più grande possibile.
// EPSILON: il computer sbaglia l'ultimo decimale di certe moltiplicazioni (875 x 2,16 gli viene
// 1890,0000000000002). Senza questo piccolo scarto quel soffio in più varrebbe un pixel intero.
const EPSILON = 1e-9;

function maxRealPixels(cssSize: number, dpr: number): number {
  if (Number.isInteger(dpr)) return cssSize * dpr;
  return Math.ceil((cssSize + 1) * dpr - EPSILON) - 1;
}

// integerZoom: le misure della finestra arrivano in pixel CSS, la densità (dpr) dice quanti pixel veri vale un pixel CSS.
// Comanda il lato più stretto, e sotto 1 non si scende.
export function integerZoom(
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  sceneWidth: number,
  sceneHeight: number,
): number {
  const byWidth = maxRealPixels(cssWidth, dpr) / sceneWidth;
  const byHeight = maxRealPixels(cssHeight, dpr) / sceneHeight;
  return Math.max(1, Math.floor(Math.min(byWidth, byHeight)));
}
