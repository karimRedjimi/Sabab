#!/bin/bash
# Finalise une vidéo et contrôle sa qualité.   qa/finaliser.sh <id de la composition> <nom du fichier final sans .mp4>
#  1. son normalisé pour TikTok (deux passes : -14 LUFS, crête vraie -1,5 dB), vidéo H.264 crf 20
#  2. contrôles : format 1080×1920 à 30 i/s, durée 15–60 s, volume, crête, images noires, silences trop longs
#  3. une planche de 12 images (à REGARDER) et une couverture
# Sortie : studio/out/final/<nom>.mp4, <nom>-couverture.jpg, <nom>-planche.jpg, <nom>-qa.json. Code de sortie 1 si un contrôle échoue.
set -e
ID=$1; NOM=$2; D=$(cd "$(dirname "$0")/.." && pwd); IN="$D/studio/out/$ID.mp4"; O="$D/studio/out/final"; mkdir -p "$O"
[ -f "$IN" ] || { echo "manque $IN (lancer d’abord node render.cjs $ID)"; exit 1; }
M=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -movflags +faststart \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" \
  -c:a aac -b:a 192k -ar 48000 "$O/$NOM.mp4"
python3 - "$O/$NOM.mp4" "$O/$NOM" <<'P'
import json, subprocess, sys, re
f, base = sys.argv[1], sys.argv[2]
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", f], capture_output=True, text=True).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video"); dur = float(pr["format"]["duration"])
e = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", e)[-1]); TP = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)[-1])
noir = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-vf", "blackdetect=d=0.3:pix_th=0.06", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
noirs = re.findall(r"black_start:([\d.]+)", noir)
sil = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=n=-40dB:d=1.2", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
silences = [round(float(x), 2) for x in re.findall(r"silence_start: ([\d.]+)", sil) if float(x) < dur - 2.5]
ok = {"format 1080×1920": v["width"] == 1080 and v["height"] == 1920, "30 images/s": v["r_frame_rate"] == "30/1", "durée 15–60 s": 15 <= dur <= 60,
      "volume -14 LUFS (±1)": abs(I + 14) <= 1, "crête ≤ -1 dB": TP <= -1.0, "aucune image noire": not noirs, "aucun silence > 1,2 s": not silences}
rap = {"fichier": f, "duree": round(dur, 2), "lufs": I, "crete": TP, "noirs": noirs, "silences": silences, "controles": ok, "reussi": all(ok.values())}
json.dump(rap, open(base + "-qa.json", "w"), ensure_ascii=False, indent=1)
for k, x in ok.items(): print(("✓ " if x else "✗ ") + k)
print(f"durée {dur:.1f} s · {I} LUFS · crête {TP} dB")
# Couverture (l’accroche, à 1 s) et planche de 12 images
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1.0", "-i", f, "-frames:v", "1", "-q:v", "2", base + "-couverture.jpg"])
n = 12; pas = dur / (n + 1)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-vf", f"fps=1/{pas:.3f},scale=270:480,tile=6x2", "-frames:v", "1", "-q:v", "3", base + "-planche.jpg"])
sys.exit(0 if rap["reussi"] else 1)
P
