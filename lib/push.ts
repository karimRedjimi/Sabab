// Côté téléphone : autorisation, abonnement aux rappels, détection de l’iPhone hors écran d’accueil.
export const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export const pushPossible = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
export const surIphone = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
export const ecranAccueil = () =>
  typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
/** Sur iPhone, les rappels ne marchent que depuis l’icône de l’écran d’accueil. */
export const iphoneHorsAccueil = () => surIphone() && !ecranAccueil();
export const permission = (): NotificationPermission | "indisponible" => (pushPossible() ? Notification.permission : "indisponible");

function cle(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Demande l’autorisation (à appeler depuis un geste de la personne). */
export async function demander(): Promise<NotificationPermission | "indisponible"> {
  if (!pushPossible()) return "indisponible";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

/** L’abonnement de cet appareil, créé si besoin (il faut l’autorisation et la clé publique). */
export async function abonnement(creer = true): Promise<PushSubscription | null> {
  if (!pushPossible() || Notification.permission !== "granted") return null;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub || !creer || !VAPID) return sub;
  try { return await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: cle(VAPID) }); } catch { return null; }
}

/** Un rappel d’essai, affiché tout de suite par le téléphone lui-même. */
export async function essai(title: string, body: string) {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: "essai", data: { url: "/" } });
}
