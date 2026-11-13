"""Gli sprite del gioco dalle tavole di stile, ripuliti dai sampietrini.

Le tavole (`Gatto a Roma — stile visivo 2.html`) stanno fuori dal repository: sono pagine
"impacchettate", con le pagine delle tavole e le immagini dentro, compresse in base64.
Questo script le spacchetta, prende ogni immagine dalla sua didascalia, toglie lo sfondo
e mette i fotogrammi in fila in un PNG per sprite, in public/assets/.

Lo sfondo: sotto ogni sprite le tavole hanno la casella dei sampietrini, sempre allineata
all'angolo in alto a sinistra, più un'ombra fatta con gli stessi quattro colori.
- Per i corpi (nemici, oggetti), che hanno un contorno scuro: diventa trasparente ogni pixel
  con un colore dei sampietrini raggiungibile dal bordo senza attraversare il corpo.
  I buchi chiusi dentro un corpo restano pieni, come per il gatto.
- Per gli effetti (gli attacchi), che non hanno contorno: diventa trasparente ogni pixel
  con un colore dei sampietrini, ovunque sia.
- Le icone dell'interfaccia e gli sfondi delle schermate (titolo, alba) si prendono interi.
- Un pezzetto di sampietrini chiuso dentro un corpo (tra le zampe del gabbiano reale) non si raggiunge
  dal bordo: i suoi pixel sono scritti in BUCHI e si svuotano dopo.

Uso:  python art/sprite_dalle_tavole.py "<percorso>/Gatto a Roma — stile visivo 2.html"
Esce con 1 se una didascalia non si trova. Serve Pillow.
"""
import base64
import gzip
import json
import os
import re
import sys
from collections import deque

from PIL import Image

ASSETS = os.path.join(os.path.dirname(__file__), "..", "public", "assets")

# Il nome del file da scrivere, il modo di pulire e le didascalie dei fotogrammi, in ordine.
SPRITE = {
    "piccione.png": ("corpo", ["Piccione, passo A", "Piccione, passo B"]),
    "graffio.png": ("effetto", ["Graffio, fotogramma 1", "Graffio, fotogramma 2", "Graffio, fotogramma 3"]),
    "crocchetta.png": ("corpo", ["Crocchetta a forma di pesce", "Crocchetta che brilla"]),
    "coda.png": ("effetto", ["Coda a frusta, fotogramma 1", "Coda a frusta, fotogramma 2", "Coda a frusta, fotogramma 3"]),
    "pelo.png": ("effetto", ["Pelo che vola, fotogramma 1", "Pelo che vola, fotogramma 2", "Pelo che vola, fotogramma 3"]),
    # tappa 3b: le icone dell'interfaccia hanno già lo sfondo trasparente, gli sfondi delle schermate sono interi
    "vita.png": ("intero", ["Vita"]),
    "uccisioni.png": ("intero", ["Uccisioni"]),
    "titolo.png": ("intero", ["Roma di notte: cupola, pini, muraglione del Tevere, un lampione, un motorino e il gatto"]),
    "alba.png": ("intero", ["L'alba su Roma: il sole sorge dietro i tetti, il gatto accanto al motorino"]),
    # tappa 4: gli altri tre nemici
    "zanzara.png": ("corpo", ["Zanzara, ali alzate", "Zanzara, ali abbassate"]),
    "pantegana.png": ("corpo", ["Pantegana, corsa A", "Pantegana, corsa B"]),
    "cornacchia.png": ("corpo", ["Cornacchia in volo", "Cornacchia in picchiata"]),
    # tappa 4: i due capi, 32x32
    "gabbiano.png": ("corpo", ["Gabbiano, ali alzate", "Gabbiano, ali abbassate"]),
    "gabbiano-reale.png": ("corpo", ["Gabbiano reale fermo", "Gabbiano reale che urla"]),
    # tappa 4: la quarta arma
    "miagolio.png": ("effetto", ["Miagolio, fotogramma 1", "Miagolio, fotogramma 2", "Miagolio, fotogramma 3"]),
    # tappa 4: il secondo oggetto a terra, che cura
    "suppli.png": ("corpo", ["Supplì con il filo di mozzarella", "Supplì con la croce della cura"]),
}

# Pixel di sampietrini rimasti chiusi dentro un corpo, da svuotare a mano: per file, per fotogramma (da 0).
# Si svuotano solo se hanno davvero un colore dei sampietrini, così una tavola ridisegnata non perde un pezzo.
BUCHI = {
    "gabbiano-reale.png": {0: [(15, 26), (16, 26)], 1: [(15, 25), (16, 25)]},
}

CASELLA = "Casella di sampietrini"


def pacchetto(testo):
    """Il manifest (le risorse) e il modello (la pagina) di una pagina impacchettata."""
    man = re.search(r'<script type="__bundler/manifest">(.*?)</script>', testo, re.S)
    tpl = re.search(r'<script type="__bundler/template">(.*?)</script>', testo, re.S)
    if not man or not tpl:
        return {}, ""
    return json.loads(man.group(1)), json.loads(tpl.group(1))


def byte(voce):
    dati = base64.b64decode(voce["data"])
    return gzip.decompress(dati) if voce.get("compressed") else dati


def normalizza(didascalia):
    return re.sub(r"\s+", " ", didascalia.strip().lower())


def immagini(percorso):
    """Tutte le immagini delle tavole, per didascalia normalizzata."""
    esterno, _ = pacchetto(open(percorso, encoding="utf-8").read())
    trovate = {}
    for voce in esterno.values():
        if voce["mime"] != "text/html":
            continue
        risorse, pagina = pacchetto(byte(voce).decode("utf-8"))
        for m in re.finditer(r'<img src="([0-9a-f-]{36})" alt="([^"]*)"', pagina):
            if m.group(1) in risorse:
                trovate[normalizza(m.group(2))] = byte(risorse[m.group(1)])
    return trovate


def apri(dati):
    from io import BytesIO
    return Image.open(BytesIO(dati)).convert("RGBA")


def pulisci(img, casella, modo):
    w, h = img.size
    colori = {casella.getpixel((x, y)) for x in range(casella.width) for y in range(casella.height)}
    px = img.load()
    vuoto = (0, 0, 0, 0)
    if modo == "intero":
        return img
    if modo == "effetto":
        for y in range(h):
            for x in range(w):
                if px[x, y] in colori:
                    px[x, y] = vuoto
        return img
    # corpo: riempimento dal bordo attraverso i soli colori dei sampietrini
    visti = set()
    coda = deque((x, y) for x in range(w) for y in range(h) if x in (0, w - 1) or y in (0, h - 1))
    while coda:
        x, y = coda.popleft()
        if (x, y) in visti or not (0 <= x < w and 0 <= y < h) or px[x, y] not in colori:
            continue
        visti.add((x, y))
        coda.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    for x, y in visti:
        px[x, y] = vuoto
    return img


def svuota(img, casella, pixel):
    """Rende trasparenti i pixel di BUCHI, se hanno un colore dei sampietrini."""
    colori = {casella.getpixel((x, y)) for x in range(casella.width) for y in range(casella.height)}
    for x, y in pixel:
        if img.getpixel((x, y)) in colori:
            img.putpixel((x, y), (0, 0, 0, 0))


def carattere(percorso):
    """Silkscreen, il carattere pixel di numeri ed etichette, con la sua licenza (OFL).

    Le tavole contengono il file woff2 scaricato da Google Fonts, solo la parte latina
    (U+0000-00FF, accenti italiani compresi). La licenza è nel commento in cima alla pagina.
    """
    testo = open(percorso, encoding="utf-8").read()
    esterno, _ = pacchetto(testo)
    fonts = os.path.join(ASSETS, "..", "fonts")
    os.makedirs(fonts, exist_ok=True)
    for voce in esterno.values():
        if voce["mime"] != "text/html":
            continue
        risorse, pagina = pacchetto(byte(voce).decode("utf-8"))
        m = re.search(
            r"font-family: 'Silkscreen';\s*font-style: normal;\s*font-weight: 400;[^}]*?src: url\(\"([0-9a-f-]{36})\"",
            pagina,
        )
        if m and m.group(1) in risorse:
            open(os.path.join(fonts, "silkscreen.woff2"), "wb").write(byte(risorse[m.group(1)]))
            break
    else:
        return False
    commento = testo[testo.find("<!--") + 4 : testo.find("-->")]
    inizio = commento.find("\nSilkscreen\n")
    fine = commento.find("OTHER DEALINGS IN THE FONT SOFTWARE.", inizio) + len("OTHER DEALINGS IN THE FONT SOFTWARE.")
    open(os.path.join(fonts, "OFL-silkscreen.txt"), "w", encoding="utf-8", newline="\n").write(commento[inizio:fine].strip() + "\n")
    print("silkscreen.woff2 e la sua licenza in public/fonts/")
    return True


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    if not carattere(sys.argv[1]):
        print("Silkscreen non trovato nelle tavole")
        sys.exit(1)
    tutte = immagini(sys.argv[1])
    casella = apri(tutte[normalizza(CASELLA)])
    mancanti = []
    for nome, (modo, didascalie) in SPRITE.items():
        fotogrammi = []
        for d in didascalie:
            dati = tutte.get(normalizza(d))
            if dati is None:
                mancanti.append(d)
                continue
            pulito = pulisci(apri(dati), casella, modo)
            svuota(pulito, casella, BUCHI.get(nome, {}).get(len(fotogrammi), []))
            fotogrammi.append(pulito)
        if len(fotogrammi) != len(didascalie):
            continue
        w, h = fotogrammi[0].size
        striscia = Image.new("RGBA", (w * len(fotogrammi), h), (0, 0, 0, 0))
        for i, f in enumerate(fotogrammi):
            striscia.paste(f, (i * w, 0))
        striscia.save(os.path.join(ASSETS, nome))
        print(f"{nome}: {len(fotogrammi)} fotogrammi da {w}x{h}")
    if mancanti:
        print("Didascalie non trovate:", ", ".join(mancanti))
        sys.exit(1)
    if not controlla_palette([n for n in SPRITE]):
        sys.exit(1)


def controlla_palette(nomi):
    """Il controllo di docs/ASSET.md su ogni immagine nuova: solo i 24 colori della palette Lampione,
    letti dalla sezione della palette, e nessun pixel semitrasparente."""
    asset_md = open(os.path.join(ASSETS, "..", "..", "docs", "ASSET.md"), encoding="utf-8").read()
    sezione = asset_md[asset_md.find("## La palette Lampione") : asset_md.find("## Nel repository oggi")]
    palette = {tuple(int(h[i : i + 2], 16) for i in (0, 2, 4)) for h in re.findall(r"#([0-9a-fA-F]{6})", sezione)}
    tutto_bene = True
    for nome in nomi:
        img = Image.open(os.path.join(ASSETS, nome)).convert("RGBA")
        colori = {img.getpixel((x, y)) for x in range(img.width) for y in range(img.height)}
        fuori = sorted({c[:3] for c in colori if c[3] == 255 and c[:3] not in palette})
        semi = sorted(c for c in colori if 0 < c[3] < 255)
        if fuori or semi:
            tutto_bene = False
            print(f"{nome}: colori fuori palette {fuori}, pixel semitrasparenti {semi}")
    if tutto_bene:
        print(f"palette: tutti dentro i {len(palette)} colori, nessun pixel semitrasparente")
    return tutto_bene


if __name__ == "__main__":
    main()
