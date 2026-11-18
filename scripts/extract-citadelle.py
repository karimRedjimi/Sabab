"""Construit content/citadelle.json depuis « La Citadelle du musulman » (Hisn al-Muslim, Sa'îd al-Qahtânî).

Sources (à cloner à part, hors du dépôt) :
  1. github.com/Kiwifu/la-citadelle-du-musulman : La_Citadelle_du_Musulman_AR-FR.md (arabe, translittération, français, références)
  2. github.com/rn0x/hisn_almuslim_json : hisn_almuslim.json (le livre arabe, avec ses notes de référence)

Les textes sont copiés tels quels, sans aucune retouche. Quand l'édition française n'indique pas la référence,
on reprend la note du livre arabe (même chapitre, même position), en arabe, telle quelle.
Le livre est diffusé gratuitement par son auteur et sa vente est interdite.

Usage : python3 -I scripts/extract-citadelle.py <fichier.md> <hisn_almuslim.json> content/citadelle.json
"""
import json, re, sys

md, arjson, out = sys.argv[1:4]
src = open(md, encoding="utf-8").read()
body = "## 1. " + src.split("## 1. ", 1)[1]
parts = re.compile(r"^## (\d+)\. (.+)$", re.M).split(body)
ar_book = json.load(open(arjson, encoding="utf-8"))
ar_keys = list(ar_book)[1:]  # la première entrée est l'introduction

THEMES = [
  ("matin-soir", "Matin et soir", [28]),
  ("sommeil", "Sommeil et réveil", [2, 29, 30, 31, 32]),
  ("priere", "Prière et mosquée", [9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 33, 34]),
  ("quotidien", "Maison et vie quotidienne", [3, 4, 5, 6, 7, 8, 11, 12, 70, 71, 72, 73, 77, 78, 79, 111, 112]),
  ("soucis", "Soucis et épreuves", [35, 36, 37, 38, 39, 40, 41, 42, 44, 47, 54, 107, 123, 124, 125, 127]),
  ("protection", "Protection", [43, 46, 89, 93, 95, 126, 129]),
  ("pardon", "Pardon et repentir", [45, 86, 130]),
  ("malade", "Maladie et deuil", [50, 51, 52, 53, 55, 56, 57, 58, 59, 60, 61]),
  ("nature", "Pluie, vent et ciel", [62, 63, 64, 65, 66, 67, 68]),
  ("jeune-hajj", "Jeûne, sacrifice et pèlerinage", [69, 74, 75, 76, 116, 117, 118, 119, 120, 121, 122, 128]),
  ("voyage", "Voyage", [96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106]),
  ("relations", "Famille et relations", [48, 49, 80, 81, 82, 83, 84, 85, 87, 88, 90, 91, 92, 94, 109, 110, 113, 114, 115]),
  ("louange", "Louange et mérites", [1, 108, 131, 132, 133]),
]
theme_of = {c: t for t, _, cs in THEMES for c in cs}
# Titres de chapitre (pas le texte des invocations) : la règle de l'application écarte le mot « péché » de l'interface.
TITRES = {45: "Ce que dit et fait celui qui a commis une faute"}

chapters, missing, filled = [], [], 0
for i in range(1, len(parts), 3):
  n, title, txt = int(parts[i]), parts[i + 1].strip(), parts[i + 2].split("\n---\n")[0]
  if n not in theme_of: sys.exit(f"chapitre {n} sans thème")
  ents = re.split(r"^\*\*(\d+)\.\*\*\s*$", txt, flags=re.M)
  arc = ar_book[ar_keys[n - 1]]
  notes = arc.get("footnote", [])
  duas = []
  for j in range(1, len(ents), 2):
    num, block = int(ents[j]), ents[j + 1].strip()
    ar, ph, fr, ref = [], [], [], []
    for p in [p.strip() for p in re.split(r"\n\s*\n", block) if p.strip()]:
      if p.startswith(">"): ar.append("\n".join(l.lstrip(">").strip() for l in p.splitlines()))
      elif p.startswith("— "): ref.append(p[2:].strip().strip("*").strip())
      elif p.startswith("*") and p.endswith("*") and not p.startswith("**"): ph.append(p[1:-1].strip())
      else: fr.append(p)
    d = {"id": f"hm-{num}", "ar": "\n".join(ar), "ph": "\n".join(ph), "fr": "\n\n".join(fr), "src": " ; ".join(ref)}
    pos = len(duas)
    if not d["src"]:
      # Même chapitre, même position dans le livre arabe, à condition que le nombre d'entrées corresponde.
      count = (len(ents) - 1) // 2
      if len(notes) == count and notes[pos].strip():
        d["srcAr"] = notes[pos].strip(); filled += 1
      else: missing.append((n, num))
    duas.append(d)
  chapters.append({"n": n, "title": TITRES.get(n, title), "theme": theme_of[n], "duas": [d for d in duas if d["src"] or d.get("srcAr")]})

data = {
  "source": "Hisn al-Muslim (La Citadelle du musulman), Sa'îd ibn 'Alî ibn Wahf al-Qahtânî",
  "themes": [{"id": t, "label": l} for t, l, _ in THEMES],
  "chapters": chapters,
}
json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(chapters), "chapitres,", sum(len(c["duas"]) for c in chapters), "invocations ;", filled, "références reprises du livre arabe ;", len(missing), "écartées faute de référence :", missing)
