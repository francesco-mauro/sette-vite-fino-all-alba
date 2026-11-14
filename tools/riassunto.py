# Il riassunto delle partite automatiche: una riga per file JSON scritto da tools/partita.cjs.
# Uso: python tools/riassunto.py "tools/risultati/*.json". I campi che mancano nelle righe vecchie escono come None.
import sys, json, glob
for f in sorted(glob.glob(sys.argv[1])):
    # un file vuoto o rotto (una partita che non è partita) si salta, dicendo quale, e il riassunto va avanti
    try:
        d = json.loads(open(f, encoding="utf-8").read())
    except json.JSONDecodeError:
        print("salto", f, ": vuoto o non è una riga JSON", file=sys.stderr)
        continue
    capi = [(c["id"], round(c["nato"] / 1000), None if c["caduto"] is None else round(c["caduto"] / 1000), c.get("vita"), c.get("richiami")) for c in d.get("capi", [])]
    fine = "alba" if d["alba"] else str(d["secondiDiNotte"]) + " s"
    print(d["modo"], d["seme"], "tetto", d.get("tetto"), "min", d.get("minuti"), "vite perse", d["vitePerse"], fine, "liv", d["livello"], "presi", d["presi"], "viviMax", d["viviMax"], "inVista", d["inVistaMedia"], "richiami", d["richiami"], "rimescolati", d.get("rimescolati"), "spinti", d.get("spinti"), "quando", d.get("quando"), "suppli", d.get("suppli"), "mucchio medio/max", d.get("mucchioMedio"), d.get("mucchioMax"), "massa media/max", d.get("massaMedia"), d.get("massaMax"), "allineamento medio/max", d.get("allineamentoMedio"), d.get("allineamentoMax"), "carte", d.get("carte"), "fps", d["fpsMin"], "capi(id,nato,caduto,vita,richiami)", capi, "errori", d["errori"])
