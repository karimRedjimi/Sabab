"""Voix off phrase par phrase : chaque phrase est vérifiée par transcription, et refaite si un mot manque, change ou est doublé.
   python3 -I voix/voix.py <lignes.json> <id de la voix> <sortie sans extension> [numéros de lignes à refaire]
   lignes.json : [{"affiche": "texte des sous-titres"}, ...]  ("dit" est optionnel : sinon il est calculé avec voix/lexique.json)
   Sortie : <sortie>.mp3, <sortie>.json (mots minutés pour les sous-titres) et <sortie>-rapport.json (essais, ce qui a été entendu)."""
import json, base64, re, sys, subprocess, urllib.request, unicodedata
import os
lignes = json.load(open(sys.argv[1])); voice = sys.argv[2]; out = sys.argv[3]
LEX = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lexique.json")))
U = "zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept dix-huit dix-neuf".split()
D = {2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante", 8: "quatre-vingt"}
def en_lettres(n):
  """Un nombre en toutes lettres (français de France), de 0 à 999 999."""
  if n < 20: return U[n]
  if n < 100:
    d, u = divmod(n, 10)
    if d in (7, 9): return D[d - 1] + ("-et-" if n == 71 else "-") + U[10 + u]
    if d == 8: return "quatre-vingts" if u == 0 else "quatre-vingt-" + U[u]
    return D[d] + ("" if u == 0 else "-et-un" if u == 1 else "-" + U[u])
  if n < 1000:
    c, r = divmod(n, 100)
    tete = "cent" if c == 1 else U[c] + " cent" + ("s" if r == 0 else "")
    return tete + ("" if r == 0 else " " + en_lettres(r))
  m, r = divmod(n, 1000)
  tete = "mille" if m == 1 else en_lettres(m) + " mille"
  return tete + ("" if r == 0 else " " + en_lettres(r))
def dire(t):
  # Le texte affiché devient le texte dit : on remplace les mots du lexique (les plus longs d’abord).
  for a in sorted(LEX["remplacer"], key=len, reverse=True):
    t = re.sub(r"(?<![\w’'-])" + re.escape(a) + r"(?![\w’'-])", LEX["remplacer"][a], t) if re.match(r"\w", a[0]) else t.replace(a, LEX["remplacer"][a])
  # Les nombres en toutes lettres (sinon la voix lit parfois chiffre par chiffre).
  t = re.sub(r"\d+", lambda m: en_lettres(int(m.group())), t)
  return re.sub(r"\s+", " ", t).strip()
for l in lignes:
  if not l.get("dit"): l["dit"] = dire(l["affiche"])
EQ = {v: k for k, vs in LEX["entendus"].items() for v in vs}
VOIX_REGLAGES = {"stability": 0.5, "similarity_boost": 0.8, "style": 0.25, "use_speaker_boost": True, "speed": float(os.environ.get("VITESSE", "1.12"))}
H = {"xi-api-key": "proxy-injected"}
def norm(t):
  t = unicodedata.normalize("NFD", t.lower()); t = "".join(c for c in t if unicodedata.category(c) != "Mn")
  t = re.sub(r"\d+", lambda m: en_lettres(int(m.group())), t).replace("-", " ").replace(" et ", " ")
  for a, b in (("inch allah", "inchallah"), ("in cha allah", "inchallah"), ("macha allah", "machallah"), ("ma cha allah", "machallah"), ("al hamdou lillah", "al hamdoulillah"), ("soubhana allah", "soubhanallah")): t = t.replace(a, b)
  w = re.findall(r"[a-z]+", t.replace("’", " ").replace("'", " "))
  # Les orthographes de « dou’a » entendues par la transcription comptent pour un seul mot.
  out = []
  for x in w:
    x = EQ.get(x, x)
    if x == "doua" and out and out[-1] == "doua": continue
    if x == "a" and out and out[-1] == "doua": continue
    out.append(x)
  return out
def tts(i):
  body = {"text": lignes[i]["dit"], "model_id": "eleven_multilingual_v2",
    "previous_text": lignes[i - 1]["dit"] if i else None, "next_text": lignes[i + 1]["dit"] if i + 1 < len(lignes) else None,
    "voice_settings": VOIX_REGLAGES}
  r = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps", data=json.dumps(body).encode(), headers={**H, "Content-Type": "application/json"})
  return json.load(urllib.request.urlopen(r, timeout=180))
def stt(path):
  r = subprocess.run(["curl", "-s", "--max-time", "120", "-X", "POST", "https://api.elevenlabs.io/v1/speech-to-text", "-H", "xi-api-key: proxy-injected",
    "-F", "model_id=scribe_v1", "-F", "language_code=fra", "-F", f"file=@{path}"], capture_output=True, text=True)
  return json.loads(r.stdout).get("text", "")
parts = []; rapport = []
seulement = set(int(x) for x in sys.argv[4].split(",")) if len(sys.argv) > 4 else None
for i, l in enumerate(lignes):
  attendu = norm(l["dit"])
  meilleur = None
  for essai in range(6):
    d = tts(i); p = f"{out}-l{i}-e{essai}.mp3"; open(p, "wb").write(base64.b64decode(d["audio_base64"]))
    lu = norm(stt(p))
    doublon = any(lu[k] == lu[k - 1] and lu[k] not in ("de", "la", "le", "nous", "vous") for k in range(1, len(lu)))
    import difflib
    score = difflib.SequenceMatcher(None, lu, attendu).ratio() - (0.2 if doublon else 0)
    if not meilleur or score > meilleur[0]: meilleur = (score, d, p, lu, essai)
    if lu == attendu and not doublon: break
    print(f"  ligne {i} essai {essai}: entendu « {' '.join(lu)} »")
  else:
    print(f"  ligne {i}: AUCUN essai parfait, gardé le meilleur ({meilleur[0]:.2f}) — À VÉRIFIER À L’OREILLE")
  score, d, p, lu, essai = meilleur
  rapport.append({"ligne": i, "affiche": l["affiche"], "dit": l["dit"], "entendu": " ".join(lu), "parfait": lu == attendu, "essais": essai + 1, "score": round(score, 3)})
  al = d["alignment"]; mots, w, t0 = [], "", 0
  for c, s in zip(al["characters"], al["character_start_times_seconds"]):
    if c == " ":
      if w: mots.append((w, t0)); w = ""
      continue
    if not w: t0 = s
    w += c
  if w: mots.append((w, t0))
  dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
  fin = al["character_end_times_seconds"][-1]
  parts.append({"p": p, "mots": [m for m in mots if re.search(r"\w", m[0])], "dur": dur, "fin": fin})
# Assemblage : un court silence entre les phrases, plus long après une question ou un point.
t, res, files = 0.0, [], []
for i, (l, pt) in enumerate(zip(lignes, parts)):
  disp = re.sub(r" ([?!:;»])", " \\1", re.sub(r"« ", "« ", l["affiche"])).split(" ")
  d0 = max(0, pt["mots"][0][1] - 0.04)
  if len(disp) == len(pt["mots"]): row = [{"w": dw, "t": round(t + m[1] - d0, 3)} for dw, m in zip(disp, pt["mots"])]
  else:
    a, b = pt["mots"][0][1], pt["fin"]; tot = sum(len(x) + 2 for x in disp); acc = 0; row = []
    for dw in disp: row.append({"w": dw, "t": round(t - d0 + a + (b - a) * acc / tot, 3)}); acc += len(dw) + 2
  res.append(row)
  gap = 0.0 if i == len(lignes) - 1 else (0.16 if re.search(r"[.?»]$", l["dit"].strip()) else 0.05)
  # On coupe le silence de fin de chaque phrase pour garder le rythme.
  seg = f"{out}-s{i}.wav"
  subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pt["p"], "-af", f"atrim={max(0, pt['mots'][0][1] - 0.04)}:{pt['fin'] + 0.05},asetpts=PTS-STARTPTS,apad=pad_dur={gap}", "-ar", "44100", "-ac", "1", seg], check=True)
  files.append(seg); t += pt["fin"] + 0.05 - d0 + gap
open(f"{out}-liste.txt", "w").write("".join(f"file '{f}'\n" for f in files))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{out}-liste.txt", "-c:a", "libmp3lame", "-b:a", "192k", f"{out}.mp3"], check=True)
json.dump({"lignes": res, "fin": round(t, 3)}, open(out + ".json", "w"), ensure_ascii=False, indent=1)
json.dump(rapport, open(out + "-rapport.json", "w"), ensure_ascii=False, indent=1)
print("durée", round(t, 2), "· phrases parfaites :", sum(r["parfait"] for r in rapport), "/", len(rapport))
