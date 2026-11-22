"""Contrôle des captures : format exact 1170 × 2532, page non vide, pas d’écran d’erreur.   python3 qa/captures.py studio/public/ecrans"""
import sys, os, subprocess
from PIL import Image, ImageStat
d = sys.argv[1]; mauvais = 0
for f in sorted(os.listdir(d)):
  if not f.endswith(".png"): continue
  p = os.path.join(d, f); im = Image.open(p); pb = []
  if im.size != (1170, 2532): pb.append(f"format {im.size} au lieu de (1170, 2532)")
  if sum(ImageStat.Stat(im.convert("L")).stddev) < 8: pb.append("image presque unie (page vide ?)")
  txt = subprocess.run(["tesseract", p, "-", "-l", "fra"], capture_output=True, text=True).stdout
  for m in ("Application error", "Unhandled Runtime", "404", "This page could not", "Chargement…", "Failed to compile"):
    if m.lower() in txt.lower(): pb.append(f"texte suspect : « {m} »")
  if len(txt.split()) < 8: pb.append("presque aucun texte lisible")
  print(("✗ " if pb else "✓ ") + f + ("" if not pb else " — " + " ; ".join(pb))); mauvais += bool(pb)
sys.exit(1 if mauvais else 0)
