"use client";
import { useEffect } from "react";

/** Enregistre le service worker (fonctionnement hors ligne), en production seulement. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
