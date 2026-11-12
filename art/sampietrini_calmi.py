"""I sampietrini più calmi: meno contrasto tra le pietre, perché il fondo non sembri grana.

Su un monitor grande i sampietrini delle tavole, pietre piccole con quattro toni dalla fuga alla luce,
facevano un effetto grana (Francesco, dal PC, 12 novembre 2026). Questo script parte dagli originali in
`art/originali/` e abbassa ogni tono della pietra di un gradino della palette Lampione: la luce diventa
pietra, la pietra diventa pietra scura. La fuga resta com'è. Vale per i sampietrini e per il tombino,
che ha le stesse pietre intorno. Dopo, rilanciare `art/erba.py`, che parte dai sampietrini.

Uso:  python art/sampietrini_calmi.py
Serve Pillow.
"""
import os

from PIL import Image

HERE = os.path.dirname(__file__)
ASSETS = os.path.join(HERE, "..", "public", "assets")
ORIGINALS = os.path.join(HERE, "originali")

# un gradino più scuro per la pietra; fuga e inchiostro restano
STEP_DOWN = {
    (0x56, 0x63, 0x8A): (0x3D, 0x48, 0x67),  # pietra in luce -> pietra
    (0x3D, 0x48, 0x67): (0x2C, 0x35, 0x50),  # pietra -> pietra scura
}


def calm(name):
    image = Image.open(os.path.join(ORIGINALS, name)).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if (r, g, b) in STEP_DOWN:
                pixels[x, y] = (*STEP_DOWN[(r, g, b)], a)
    image.save(os.path.join(ASSETS, name))


def main():
    for name in ["casella.png", "tombino.png"]:
        calm(name)
        print(f"{name}: più calmo")


if __name__ == "__main__":
    main()
