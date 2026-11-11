"use client";
// Enregistrer sa voix avec le micro du téléphone. Rien ne quitte l’appareil tant qu’on ne partage pas.
import { useCallback, useEffect, useRef, useState } from "react";

export type RecState = "idle" | "asking" | "recording" | "done";
export interface Take { blob: Blob; url: string; seconds: number; mime: string }
export const MAX_SECONDS = 60;
const MIMES = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg"];

export const canRecord = () => typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

export function useRecorder() {
  const [state, setState] = useState<RecState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [take, setTake] = useState<Take | null>(null);
  const [error, setError] = useState<"denied" | "unsupported" | null>(null);
  const rec = useRef<MediaRecorder | null>(null), stream = useRef<MediaStream | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null), began = useRef(0);

  const release = useCallback(() => {
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);
  const stop = useCallback(() => { if (rec.current && rec.current.state !== "inactive") rec.current.stop(); }, []);
  const reset = useCallback(() => {
    setTake((t) => { if (t) URL.revokeObjectURL(t.url); return null; });
    setSeconds(0); setState("idle");
  }, []);

  const start = useCallback(async () => {
    if (!canRecord()) { setError("unsupported"); return; }
    setError(null); setState("asking");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      const mime = MIMES.find((m) => MediaRecorder.isTypeSupported(m));
      const r = new MediaRecorder(s, mime ? { mimeType: mime, audioBitsPerSecond: 64000 } : undefined);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      r.onstop = () => {
        const secs = Math.max(1, Math.round((Date.now() - began.current) / 1000));
        const type = (r.mimeType || mime || "audio/mp4").split(";")[0];
        const blob = new Blob(chunks, { type });
        release();
        setTake({ blob, url: URL.createObjectURL(blob), seconds: Math.min(secs, MAX_SECONDS), mime: type });
        setState("done");
      };
      rec.current = r; began.current = Date.now(); setSeconds(0);
      r.start();
      setState("recording");
      tick.current = setInterval(() => {
        const n = Math.floor((Date.now() - began.current) / 1000);
        setSeconds(n);
        if (n >= MAX_SECONDS) stop();
      }, 250);
    } catch {
      release(); setError("denied"); setState("idle");
    }
  }, [release, stop]);

  // On coupe le micro si l’on quitte l’écran.
  useEffect(() => () => { try { if (rec.current && rec.current.state !== "inactive") { rec.current.onstop = null; rec.current.stop(); } } catch { /* */ } release(); }, [release]);

  return { state, seconds, take, error, start, stop, reset };
}
