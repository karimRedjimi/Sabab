// Envoi des rappels : appelée chaque minute par la base (pg_cron + pg_net), avec un secret partagé.
// Elle chiffre chaque rappel pour son appareil et le confie au service de notification du téléphone.
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Item { endpoint: string; p256dh: string; auth: string; payload: { title: string; body: string; url: string; tag: string; id: string } }

export async function POST(req: Request) {
  const secret = process.env.PUSH_CRON_SECRET, pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!secret || !pub || !priv) return Response.json({ error: "non configuré" }, { status: 503 });
  if (req.headers.get("x-cron-secret") !== secret) return Response.json({ error: "refusé" }, { status: 401 });
  let items: Item[] = [];
  try { items = ((await req.json()) as { items: Item[] }).items || []; } catch { return Response.json({ error: "requête invalide" }, { status: 400 }); }
  webpush.setVapidDetails("https://sabab-six.vercel.app", pub, priv);
  const gone: string[] = [];
  let sent = 0;
  for (let i = 0; i < items.length; i += 50) {
    await Promise.allSettled(items.slice(i, i + 50).map(async (it) => {
      try {
        await webpush.sendNotification({ endpoint: it.endpoint, keys: { p256dh: it.p256dh, auth: it.auth } }, JSON.stringify(it.payload), { TTL: 900, urgency: it.payload.tag === "nuit" ? "normal" : "high" });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) gone.push(it.endpoint);
      }
    }));
  }
  return Response.json({ sent, gone });
}
