#!/bin/bash
# Lance l’appli (dernière version de main) sur http://localhost:3001, branchée sur le faux serveur de démo (port 54321).
#   captures/lancer.sh <dossier-de-l-appli>      (ex. ../Sabab ou /home/user/app-import)
set -e
APP=$(cd "$1" && pwd); ICI=$(cd "$(dirname "$0")" && pwd); LOG=${TMPDIR:-/tmp}
pkill -f faux-serveur.cjs 2>/dev/null || true; pkill -f "next dev -p 3001" 2>/dev/null || true; sleep 1
setsid nohup node "$ICI/faux-serveur.cjs" > "$LOG/faux-serveur.log" 2>&1 < /dev/null &
[ -d "$APP/node_modules" ] || (cd "$APP" && npm ci --no-audit --no-fund > "$LOG/npm-app.log" 2>&1)
(cd "$APP" && NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=demo setsid nohup npx next dev -p 3001 > "$LOG/app.log" 2>&1 < /dev/null &)
for i in $(seq 150); do curl -s -o /dev/null -w "%{http_code}" localhost:3001/ 2>/dev/null | grep -q 200 && { echo "appli prête sur :3001"; exit 0; }; sleep 2; done
echo "l’appli ne démarre pas, voir $LOG/app.log"; tail -20 "$LOG/app.log"; exit 1
