"""Le icone provvisorie dei quattro potenziamenti, disegnate qui con forme semplici.

Nelle tavole le icone delle carte non ci sono ancora (docs/ASSET.md, «Cosa manca»): finché non
arrivano, questo script le disegna 16×16 con i colori della palette Lampione e il contorno
d'inchiostro di 1 pixel, come gli altri sprite. Le armi usano già un fotogramma del loro effetto.

Ordine dei fotogrammi in public/assets/carte.png:
  0 zampe veloci (l'impronta che corre), 1 pancia piena (la ciotola piena),
  2 unghie affilate (la zampa con le unghie fuori), 3 naso fino (il muso che annusa).

Uso:  python art/icone_carte.py [--anteprima FILE]
  --anteprima FILE  scrive anche le quattro icone ingrandite otto volte, per guardarle.
Serve Pillow.
"""
import os
import sys

from PIL import Image

ASSETS = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SIZE = 16

INK = (0x0E, 0x0C, 0x16)
ORANGE_DARK = (0xB4, 0x47, 0x1A)
ORANGE = (0xF5, 0x84, 0x1F)
ORANGE_LIGHT = (0xFF, 0xB5, 0x47)
CREAM = (0xFF, 0xF0, 0xD6)
PINK = (0xF0, 0x8A, 0xA0)
RED = (0xE2, 0x3A, 0x4F)
WHITE = (0xFF, 0xFF, 0xFF)
SCRATCH = (0x6F, 0xF2, 0xFF)
LIME = (0xA6, 0xF0, 0x5A)
WINGS = (0xCF, 0xE0, 0xFF)


def ellipse(cx, cy, rx, ry):
    """I pixel il cui centro cade dentro l'ellisse."""
    return {(x, y) for x in range(SIZE) for y in range(SIZE)
            if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1}


def rect(x0, y0, x1, y1):
    return {(x, y) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)}


class Icon:
    """Un'icona: forme piene col contorno, più segni senza contorno (scie, odori)."""

    def __init__(self):
        self.body = {}
        self.marks = {}

    def fill(self, pixels, color):
        for p in pixels:
            self.body[p] = color

    def mark(self, pixels, color):
        for p in pixels:
            self.marks[p] = color

    def image(self):
        img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        for (x, y), c in self.marks.items():
            img.putpixel((x, y), c + (255,))
        # il contorno: ogni pixel vuoto che tocca il corpo di lato diventa inchiostro
        for x in range(SIZE):
            for y in range(SIZE):
                if (x, y) in self.body:
                    continue
                if any((x + dx, y + dy) in self.body for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    img.putpixel((x, y), INK + (255,))
        for (x, y), c in self.body.items():
            img.putpixel((x, y), c + (255,))
        return img


def speed():
    i = Icon()
    # l'impronta della zampa: quattro dita staccate e il cuscinetto grande, rosa col contorno
    i.fill(ellipse(9.5, 11.5, 3.5, 2.6), PINK)
    for x, y in ((4, 6), (7, 3), (10, 3), (13, 6)):
        i.fill(rect(x, y, x + 1, y + 1), PINK)
    # le scie della corsa, a sinistra
    i.mark(rect(0, 5, 1, 5), WHITE)
    i.mark(rect(0, 9, 2, 9), SCRATCH)
    i.mark(rect(0, 12, 1, 12), WHITE)
    return i.image()


def health():
    i = Icon()
    # le crocchette a mucchio, poi la ciotola rossa davanti con il bordo chiaro
    i.fill(ellipse(8, 8.5, 5.5, 3.5), ORANGE_LIGHT)
    for p in ((5, 7), (8, 6), (10, 8), (7, 9), (11, 6)):
        i.fill({p}, ORANGE_DARK)
    i.fill({(9, 7), (6, 8)}, LIME)
    i.fill(rect(2, 10, 13, 10), WINGS)
    i.fill(rect(3, 11, 12, 12), RED)
    i.fill(rect(4, 13, 11, 13), RED)
    return i.image()


def damage():
    i = Icon()
    # tre unghie bianche che escono dalla zampa
    for x in (4, 7, 10):
        i.fill({(x + 1, 2), (x + 1, 3), (x, 4), (x + 1, 4), (x, 5), (x + 1, 5)}, WHITE)
    i.fill(ellipse(8, 10.5, 6, 4.5), ORANGE)
    i.fill(ellipse(7, 9.5, 3, 2), ORANGE_LIGHT)
    i.fill({(4, 13), (8, 14), (12, 13)}, ORANGE_DARK)
    return i.image()


def magnet():
    i = Icon()
    # il muso crema con il naso rosa e la bocca, i baffi bianchi e sopra l'odore delle crocchette
    i.fill(ellipse(8, 10.5, 5, 3.6), CREAM)
    i.fill(rect(6, 8, 9, 8) | rect(7, 9, 8, 9), PINK)
    i.fill({(7, 10), (8, 10), (6, 11), (9, 11)}, INK)
    i.mark({(0, 9), (1, 9), (2, 10), (0, 12), (1, 12), (2, 12)}, WHITE)
    i.mark({(15, 9), (14, 9), (13, 10), (15, 12), (14, 12), (13, 12)}, WHITE)
    for x0 in (3, 9):
        i.mark({(x0, 4), (x0 + 1, 3), (x0 + 2, 4), (x0 + 3, 3)}, LIME)
    i.mark({(6, 2), (7, 1), (8, 2), (9, 1)}, LIME)
    return i.image()


def main():
    icons = [speed(), health(), damage(), magnet()]
    strip = Image.new("RGBA", (SIZE * len(icons), SIZE), (0, 0, 0, 0))
    for n, icon in enumerate(icons):
        strip.paste(icon, (n * SIZE, 0))
    strip.save(os.path.join(ASSETS, "carte.png"))
    if "--anteprima" in sys.argv:
        out = sys.argv[sys.argv.index("--anteprima") + 1]
        back = Image.new("RGBA", strip.size, (0x1C, 0x21, 0x33, 255))
        back.alpha_composite(strip)
        back.resize((strip.width * 8, SIZE * 8), Image.NEAREST).save(out)
    print(f"carte.png: {len(icons)} icone")


if __name__ == "__main__":
    main()
