// Capture TOUS les écrans utiles de la dernière version de l’appli, au format exact du téléphone des vidéos.
//   node captures/tout.cjs <dossier-app> <dossier-sortie>
// Pré-requis : l’appli tourne sur http://localhost:3001 branchée sur le faux serveur (voir captures/lancer.sh).
// Sortie : <nom>.png (1170 × 2532) + manifeste.json : pour chaque écran, sa description et la position de chaque texte visible
// (x, y, largeur, hauteur en fractions de l’image), pour placer les surlignages exactement.
const { chromium } = require("playwright");
const fs = require("fs");
const out = (process.argv[3] || "studio/public/ecrans").replace(/\/?$/, "/");
const B = "http://localhost:3001";
fs.mkdirSync(out, { recursive: true });

// ---------- Un utilisateur de démo : 5 semaines d’usage régulier, tout est daté par rapport à aujourd’hui ----------
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const T0 = new Date(); T0.setHours(12, 0, 0, 0);
const jour = (n) => { const d = new Date(T0); d.setDate(d.getDate() + n); return key(d); };
const k = jour(0);
// L’état de démo vient de captures/demo.ts, calculé avec la logique de l’appli (jours réellement « tenus »).
const APP = process.argv[2] || "../Sabab";
const DEMO = JSON.parse(require("child_process").execSync(`npx tsx ${__dirname}/demo.ts`, { cwd: APP, encoding: "utf8", maxBuffer: 1e8 }));
DEMO.cycles = { [DEMO.start]: { vu: k } }; // le bilan du premier cycle a déjà été vu : l’accueil reste propre
const base = (extra = {}) => { const s = JSON.parse(JSON.stringify(DEMO)); s.days[k] = { ...s.days[k], ...extra }; s.gratitude = { ...s.gratitude }; return s; };

const manifeste = {};
// Le faux serveur repart de zéro à chaque capture (compte de démo neuf, demandes d’exemple d’origine).
const { execSync, spawn } = require("child_process");
try { execSync("pkill -f faux-serveur.cjs"); } catch {}
spawn("node", [__dirname + "/faux-serveur.cjs"], { detached: true, stdio: "ignore" }).unref();
(async () => {
  await new Promise((r) => setTimeout(r, 1200));
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: "light", timezoneId: "Europe/Paris", permissions: ["microphone"] });
  // Ni badge de développement, ni curseur clignotant, ni barre de défilement.
  await c.addInitScript(() => { const st = () => { const x = document.createElement("style"); x.textContent = "nextjs-portal{display:none!important} *{caret-color:transparent!important} ::-webkit-scrollbar{display:none}"; document.documentElement.appendChild(x); }; if (document.documentElement) st(); else document.addEventListener("DOMContentLoaded", st); });
  const p = await c.newPage();
  const erreurs = []; p.on("pageerror", (e) => erreurs.push(e.message));
  const heure = async (hm) => p.clock.setFixedTime(new Date(`${k}T${hm}:00`));
  const seed = async (s) => { await p.goto(B + "/"); await p.evaluate((s) => { localStorage.setItem("rizq-tracker-v1", JSON.stringify(s)); sessionStorage.clear(); }, s); };
  const haut = async (sel, dy = 120) => { await p.locator(sel).first().evaluate((e, dy) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - dy), dy); await p.waitForTimeout(900); };
  const hautTexte = async (re, dy = 120) => { await p.getByText(re).first().evaluate((e, dy) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - dy), dy); await p.waitForTimeout(1200); };
  const ecran = async (nom, desc) => {
    await p.waitForTimeout(900);
    await p.screenshot({ path: out + nom + ".png" });
    // Les textes visibles et leur position (fractions de l’écran), pour les surlignages.
    const zones = await p.evaluate(() => {
      const W = innerWidth, H = innerHeight, res = [];
      for (const el of document.querySelectorAll("body *")) {
        const t = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
        const role = el.tagName === "BUTTON" || el.tagName === "A";
        if (!t && !role) continue;
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > H || cs.visibility === "hidden" || cs.opacity === "0") continue;
        const txt = t || (el.innerText || "").replace(/\s+/g, " ").trim();
        if (!txt) continue;
        res.push({ t: txt.slice(0, 90), b: [r.left / W, r.top / H, r.width / W, r.height / H].map((v) => Math.round(v * 1000) / 1000), ...(role ? { bouton: true } : {}) });
      }
      return res.slice(0, 160);
    });
    manifeste[nom] = { desc, zones };
    console.log("✓", nom);
  };
  const essai = async (nom, f) => { try { await f(); } catch (e) { console.log("✗", nom, "—", e.message.split("\n")[0]); } };

  // ---------- Accueil et journée ----------
  await heure("14:05"); await seed(base());
  await essai("accueil", async () => { await p.goto(B + "/"); await p.waitForTimeout(2600); await ecran("accueil", "Accueil : la carte du besoin (cycle, jour), la barre de la journée, les prières du jour."); });
  await essai("journee", async () => { await haut(".dprog", 70); await ecran("journee", "Accueil plus bas : la journée par moments (matin, journée, soir) avec la barre de progression."); });
  await essai("lecture", async () => {
    await p.locator(".tr", { hasText: "Dans la journée" }).first().locator(".rbody").click(); await p.waitForTimeout(1200);
    for (let i = 0; i < 3; i++) { const b2 = p.locator("button", { hasText: /Commencer|Je commence|Continuer/ }).first(); if (await b2.count()) { await b2.click().catch(() => {}); await p.waitForTimeout(700); } }
    await ecran("lecture", "Lecture guidée d’une invocation : arabe, phonétique, traduction, compteur.");
  });
  // ---------- Le soir : journal et geste ----------
  await heure("21:20"); await seed(base());
  await essai("journal", async () => {
    await p.goto(B + "/"); await p.waitForTimeout(2200); await p.locator(".clotr button").click(); await p.waitForTimeout(900);
    await p.getByRole("button", { name: "Ma famille" }).click().catch(() => {}); await p.waitForTimeout(400);
    await ecran("journal", "Le rituel du soir : le bienfait du jour (journal).");
    await p.getByRole("button", { name: "Valider" }).click(); await p.waitForTimeout(800);
    await p.locator(".ritgeste").click().catch(() => {}); await p.waitForTimeout(500);
    await ecran("geste", "Le rituel du soir : le geste concret pour son besoin.");
  });
  await seed(base({ clos: true }));
  await essai("ciel", async () => { await p.goto(B + "/"); await p.waitForTimeout(2200); await haut(".cielacc", 40); await ecran("ciel", "Le ciel : chaque bienfait noté devient une étoile."); });
  // ---------- Suivi ----------
  await heure("14:05"); await seed(base());
  await essai("suivi", async () => { await p.goto(B + "/suivi"); await p.waitForTimeout(2600); await ecran("suivi", "Suivi : prières, invocations, Coran sur la période, et le cycle de 30 jours."); });
  await essai("suivi2", async () => { await hautTexte(/^Tes invocations$/i, 90); await ecran("suivi2", "Suivi plus bas : les moments jour par jour, la régularité."); });
  // ---------- Apprendre ----------
  await essai("apprendre", async () => { await p.goto(B + "/apprendre"); await p.waitForTimeout(2000); await ecran("apprendre", "Apprendre : les invocations à apprendre par cœur."); });
  await essai("biblio", async () => { await haut("#bibliotheque", 40); await ecran("biblio", "La bibliothèque : plus de 300 invocations sourcées, rangées par thème."); });
  await essai("carnet", async () => { await p.goto(B + "/carnet"); await p.waitForTimeout(1800); await ecran("carnet", "Le carnet des du’â exaucées."); });
  await essai("objectif", async () => { await p.goto(B + "/objectif"); await p.waitForTimeout(1800); await ecran("objectif", "Choisir son besoin (objectif)."); });
  await essai("rappels", async () => { await p.goto(B + "/notifications"); await p.waitForTimeout(1800); await ecran("rappels", "Les rappels (notifications) choisis par l’utilisateur."); });
  // ---------- Communauté (compte de démo sur le faux serveur) ----------
  await essai("communaute", async () => {
    await p.goto(B + "/compte"); await p.locator(".page h1").waitFor();
    await p.getByRole("link", { name: "Créer un compte" }).or(p.getByRole("button", { name: "Créer un compte" })).first().click(); await p.waitForTimeout(500);
    await p.fill("input[type=email]", "demo@example.fr"); await p.fill("input[type=password]", "sabab-2026");
    await p.getByRole("button", { name: "Créer mon compte" }).click(); await p.waitForTimeout(700);
    await p.fill("input[autocomplete=one-time-code]", "123456"); await p.getByRole("button", { name: "Confirmer mon adresse" }).click(); await p.waitForTimeout(900);
    await p.locator(".consent input").check(); await p.getByRole("button", { name: "Activer mon compte" }).click(); await p.waitForTimeout(1500);
    await p.goto(B + "/communaute"); await p.waitForTimeout(1500); await ecran("communaute-accueil", "Communauté, onglet Du’â : « Invoque pour 5 personnes », déposer un souhait.");
    await p.getByRole("button", { name: /Déposer un souhait/ }).click(); await p.waitForTimeout(400);
    await p.fill("textarea", "Une dette lourde depuis des mois, invoquez pour que Allah me facilite"); await p.locator("textarea").blur();
    await haut(".wform", 150); await ecran("communaute-formulaire", "Déposer un souhait, sans son nom (domaine, publier).");
    await p.getByRole("button", { name: "Publier" }).click(); await p.waitForTimeout(1200);
    await haut(".post.mine", 230); await ecran("communaute-souhait", "Son souhait publié : « 23 du’â pour toi » (on voit combien, jamais qui).");
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400);
    await p.getByRole("button", { name: "Commencer" }).click(); await p.locator(".wish").waitFor(); await p.waitForTimeout(400);
    await p.locator(".ritual").first().evaluate((e) => e.scrollIntoView({ block: "center" })); await ecran("communaute-demande", "Une demande d’un autre membre : « Cette personne demande la même chose que toi », bouton Âmîn.");
    for (let i = 0; i < 5; i++) { await p.getByRole("button", { name: /Âmîn/ }).click(); await p.waitForTimeout(600); }
    await p.locator(".ritual").first().evaluate((e) => e.scrollIntoView({ block: "center" })); await ecran("communaute-fin", "Fin de la série : « Qu’Allah les exauce. Tu as invoqué pour 5 personnes. Et pour toi de même. »");
    await p.goto(B + "/communaute"); await p.waitForTimeout(800);
    await p.getByRole("link", { name: "Un jour, un verset" }).or(p.getByRole("button", { name: "Un jour, un verset" })).first().click(); await p.waitForTimeout(1500);
    await ecran("communaute-verset", "Un jour, un verset : le verset du jour à écouter et à réciter.");
    await hautTexte(/^La communauté récite$/i, 140); await ecran("communaute-recitations", "Les récitations des membres, sans leur nom (« Mâ shâ Allâh »).");
  });
  fs.writeFileSync(out + "manifeste.json", JSON.stringify(manifeste, null, 1));
  if (erreurs.length) console.log("Erreurs de page :", erreurs.slice(0, 5));
  console.log(`${Object.keys(manifeste).length} écrans capturés`);
  await b.close();
})();
