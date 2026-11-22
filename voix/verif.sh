#!/bin/bash
# Transcrit un fichier audio avec ElevenLabs (Scribe) pour repérer un mot doublé ou un bégaiement.
curl -s --max-time 180 -X POST https://api.elevenlabs.io/v1/speech-to-text -H "xi-api-key: proxy-injected" -F "model_id=scribe_v1" -F "language_code=fra" -F "file=@$1" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('text') or d)"
