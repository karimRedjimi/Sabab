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
// DECALAGE_JOURS=1 : tout est daté du lendemain (le jour où les vidéos seront publiées).
const T0 = new Date(); T0.setHours(12, 0, 0, 0); T0.setDate(T0.getDate() + Number(process.env.DECALAGE_JOURS || 0));
const jour = (n) => { const d = new Date(T0); d.setDate(d.getDate() + n); return key(d); };
const k = jour(0);
// L’état de démo vient de captures/demo.ts, calculé avec la logique de l’appli (jours réellement « tenus »).
const APP = process.argv[2] || "../Sabab";
const DEMO = JSON.parse(require("child_process").execSync(`npx -y tsx ${__dirname}/demo.ts`, { cwd: APP, encoding: "utf8", maxBuffer: 1e8 }));
DEMO.cycles = { [DEMO.start]: { vu: k } }; // le bilan du premier cycle a déjà été vu : l’accueil reste propre
// patienceSeen : la bannière « La réponse prend parfois un autre chemin » et le souvenir de la semaine sont déjà vus (sinon elle est coupée en haut de « journee »).
const base = (extra = {}) => { const s = JSON.parse(JSON.stringify(DEMO)); s.patienceSeen = k; s.souvenirVu = k; s.days[k] = { ...s.days[k], ...extra }; s.gratitude = { ...s.gratitude }; return s; };

// SEUL=<regex> : ne refait que les écrans dont le nom correspond (les autres gardent leur capture et leur place dans le manifeste).
const SEUL = process.env.SEUL ? new RegExp(process.env.SEUL) : null;
const manifeste = SEUL && fs.existsSync(out + "manifeste.json") ? JSON.parse(fs.readFileSync(out + "manifeste.json", "utf8")) : {};
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
        res.push({ t: txt.slice(0, 300), b: [r.left / W, r.top / H, r.width / W, r.height / H].map((v) => Math.round(v * 1000) / 1000), ...(role ? { bouton: true } : {}) });
      }
      return res.slice(0, 160);
    });
    manifeste[nom] = { desc, zones };
    console.log("✓", nom);
  };
  const essai = async (nom, f) => { if (SEUL && !SEUL.test(nom)) return; try { await f(); } catch (e) { console.log("✗", nom, "—", e.message.split("\n")[0]); } };

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
  // Cadré sous la barre collante : la carte « Dans la journée » entière en haut, le ciel et « Demain » dessous.
  await essai("ciel", async () => { await p.goto(B + "/"); await p.waitForTimeout(2200); await haut(".tr:has-text('Dans la journée')", 64); await ecran("ciel", "Le ciel : chaque bienfait noté devient une étoile (journée close, 11 étoiles)."); });
  // ---------- Les moments favorables, dépliés (Abû Dâwûd n° 521 ; Al-Bukhârî n° 1145 ; Muslim n° 482) ----------
  await heure("14:05"); await seed(base());
  await essai("moments", async () => { await p.goto(B + "/"); await p.waitForTimeout(2400); await p.locator(".favsum").first().click(); await p.waitForTimeout(900); await ecran("moments", "Accueil : les moments favorables dépliés (à l’appel, la prosternation) avec leurs sources."); });
  // ---------- Un autre besoin : le mariage (parcours « Le mariage ») ----------
  const mariage = () => { const s = base(); s.objective = { title: "Me marier", cat: "mariage", why: "Fonder un foyer apaisé", since: DEMO.start }; s.parcours = { id: "mariage", start: DEMO.start }; return s; };
  await seed(mariage());
  await essai("mariage-accueil", async () => { await p.goto(B + "/"); await p.waitForTimeout(2600); await ecran("mariage-accueil", "Accueil avec le besoin « Me marier » (parcours Le mariage)."); });
  await essai("mariage-journee", async () => { await haut(".dprog", 70); await ecran("mariage-journee", "Accueil plus bas, besoin « Me marier » : la journée par moments."); });
  await essai("mariage-lecture", async () => {
    await p.locator(".tr", { hasText: "Dans la journée" }).first().locator(".rbody").click(); await p.waitForTimeout(1200);
    for (let i = 0; i < 3; i++) { const b2 = p.locator("button", { hasText: /Commencer|Je commence|Continuer/ }).first(); if (await b2.count()) { await b2.click().catch(() => {}); await p.waitForTimeout(700); } }
    await ecran("mariage-lecture", "Lecture guidée, besoin « Me marier » : l’invocation du parcours.");
  });
  // ---------- Suivi ----------
  await heure("14:05"); await seed(base());
  await essai("suivi", async () => { await p.goto(B + "/suivi"); await p.waitForTimeout(2600); await ecran("suivi", "Suivi : prières, invocations, Coran sur la période, et le cycle de 30 jours."); });
  await essai("suivi2", async () => { await hautTexte(/^Tes invocations$/i, 128); await ecran("suivi2", "Suivi plus bas : les moments jour par jour, la régularité."); });
  // ---------- Apprendre ----------
  await essai("apprendre", async () => { await p.goto(B + "/apprendre"); await p.waitForTimeout(2000); await ecran("apprendre", "Apprendre : les invocations à apprendre par cœur."); });
  await essai("biblio", async () => { await haut("#bibliotheque", 40); await ecran("biblio", "La bibliothèque : plus de 300 invocations sourcées, rangées par thème."); });
  await essai("carnet", async () => { await p.goto(B + "/carnet"); await p.waitForTimeout(1800); await ecran("carnet", "Le carnet des du’â exaucées."); });
  await essai("objectif", async () => { await p.goto(B + "/objectif"); await p.waitForTimeout(1800); await ecran("objectif", "Choisir son besoin (objectif)."); });
  await essai("rappels", async () => { await p.goto(B + "/notifications"); await p.waitForTimeout(1800); await ecran("rappels", "Les rappels (notifications) choisis par l’utilisateur."); });
  // ---------- Communauté (compte de démo sur le faux serveur) ----------
  // Le compte du faux serveur vit à l’heure réelle (sinon, avec DECALAGE_JOURS, sa session paraît expirée).
  await p.clock.setFixedTime(new Date());
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
    // La même, cadrée en haut de page (titre « Communauté » entier, aucune carte coupée).
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(700); await ecran("communaute-demande-haut", "Une demande d’un autre membre, page vue depuis le haut (titre entier), bouton Âmîn.");
    for (let i = 0; i < 5; i++) { await p.getByRole("button", { name: /Âmîn/ }).click(); await p.waitForTimeout(600); }
    await p.locator(".ritual").first().evaluate((e) => e.scrollIntoView({ block: "center" })); await ecran("communaute-fin", "Fin de la série : « Qu’Allah les exauce. Tu as invoqué pour 5 personnes. Et pour toi de même. »");
    await p.goto(B + "/communaute"); await p.waitForTimeout(800);
    await p.getByRole("link", { name: "Un jour, un verset" }).or(p.getByRole("button", { name: "Un jour, un verset" })).first().click(); await p.waitForTimeout(1500);
    await ecran("communaute-verset", "Un jour, un verset : le verset du jour à écouter et à réciter.");
    await hautTexte(/^La communauté récite$/i, 140); await ecran("communaute-recitations", "Les récitations des membres, sans leur nom (« Mâ shâ Allâh »).");
  });
  // Le verset du jour de PUBLICATION : l’horloge passe au jour décalé une fois le compte ouvert (la session reste valable).
  await essai("verset-jour", async () => {
    await p.clock.setFixedTime(new Date(`${k}T14:05:00`));
    await p.goto(B + "/communaute"); await p.waitForTimeout(1500);
    await p.getByRole("link", { name: "Un jour, un verset" }).or(p.getByRole("button", { name: "Un jour, un verset" })).first().click(); await p.waitForTimeout(1800);
    await ecran("verset-jour", "Un jour, un verset, daté du jour de publication : le verset à écouter et à réciter.");
  });
  // ---------- Une invocation ouverte dans la bibliothèque ----------
  await heure("14:05"); await seed(base());
  // La bibliothèque est en bas de page : cadré sur le début d’une ligne de la liste au-dessus, jamais au milieu d’une carte.
  const fiche = async (nom, recherche, texte, desc) => essai(nom, async () => {
    await p.goto(B + "/apprendre"); await p.waitForTimeout(1800); await haut("#bibliotheque", 40);
    await p.fill("#bibliotheque input[type=search]", recherche); await p.waitForTimeout(700);
    await p.locator(".bcard", { hasText: texte }).first().locator(".bhead").click(); await p.waitForTimeout(700);
    // Le titre « Bibliothèque » en haut si la page le permet ; sinon (bas de page) le début d’une ligne de la liste au-dessus.
    await haut("#bibliotheque", 14);
    const y = await p.locator("#bibliotheque").evaluate((e) => e.getBoundingClientRect().top);
    if (y > 30) await hautTexte(/^Hasbiyallâh$/, 18);
    await ecran(nom, desc);
  });
  // `avant` : le titre de la carte qui précède dans la liste, placé en haut de l’écran (jamais une carte coupée).
  const ficheProgramme = async (nom, titre, avant, desc) => essai(nom, async () => {
    await p.goto(B + "/apprendre"); await p.waitForTimeout(1800); await haut("#bibliotheque", 40);
    await p.locator(".bt", { hasText: "Du programme" }).click(); await p.waitForTimeout(900);
    await p.locator(".bcard", { hasText: titre }).first().locator(".bhead").click(); await p.waitForTimeout(700);
    // Le titre cherché DANS la bibliothèque (il peut aussi figurer plus haut, dans « Tes révisions »).
    await p.locator("#bibliotheque .bcard", { hasText: new RegExp(avant) }).first().evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 22)); await p.waitForTimeout(1200);
    await ecran(nom, desc);
  });
  await fiche("fiche-douleur", "douloureux", "endroit douloureux", "Bibliothèque : ce qu’on fait et dit quand on a mal (arabe, phonétique, traduction, source).");
  await fiche("fiche-reveil", "rendu la vie", "nous a rendu la vie", "Bibliothèque : l’invocation du réveil ouverte (arabe, phonétique, traduction, source).");
  await ficheProgramme("fiche-fadl", "Demander de la grâce d’Allah", "L’invocation de Yûnus", "Bibliothèque, « Du programme » : « Demander de la grâce d’Allah » ouverte.");
  // ---------- Un autre besoin : l’emploi (parcours « Ouvrir les portes du rizq ») ----------
  const emploi = () => { const s = base(); s.objective = { title: "Trouver un travail", cat: "emploi", why: "Subvenir aux besoins de ma famille", since: DEMO.start }; s.parcours = { id: "rizq", start: DEMO.start }; return s; };
  await seed(emploi());
  await essai("emploi-accueil", async () => { await p.goto(B + "/"); await p.waitForTimeout(2600); await ecran("emploi-accueil", "Accueil avec le besoin « Trouver un travail » (parcours rizq)."); });
  await essai("emploi-parcours", async () => { await p.goto(B + "/parcours"); await p.waitForTimeout(2000); await ecran("emploi-parcours", "Le parcours actif « Ouvrir les portes du rizq » : ses invocations et ses gestes."); });
  await essai("emploi-objectif", async () => { await p.goto(B + "/objectif"); await p.waitForTimeout(1800); await ecran("emploi-objectif", "Mon objectif : « Trouver un travail », domaine, pourquoi."); });
  // ---------- Apprendre par cœur : des révisions à différents niveaux de masquage ----------
  // hasbi niveau 1 (un mot sur trois masqué), fajr niveau 2 (deux sur trois), dette niveau 3 (tout masqué) ; istighfar et hayy sues.
  const apprentissage = () => { const s = base();
    s.learn = { hasbi: { lvl: 1, next: k }, fajr: { lvl: 2, next: k }, dette: { lvl: 3, next: k }, istighfar: { lvl: 5, next: jour(30), mastered: jour(-9) }, hayy: { lvl: 5, next: jour(25), mastered: jour(-3) }, sayyid: { lvl: 4, next: jour(6) } }; return s; };
  await heure("14:05"); await seed(apprentissage());
  await essai("apprendre-niveaux", async () => { await p.goto(B + "/apprendre"); await p.waitForTimeout(2000); await ecran("apprendre-niveaux", "Apprendre : 2 / 5 du socle sues, « Réviser 3 invocations maintenant », la liste des révisions avec les niveaux."); });
  await essai("revision-1", async () => {
    await p.getByRole("button", { name: /Réviser 3 invocations/ }).click(); await p.waitForTimeout(900);
    await ecran("revision-1", "Révision 1 sur 3 : Hasbiyallâh, un mot sur trois masqué.");
    await p.getByRole("button", { name: "Révéler le texte" }).click(); await p.waitForTimeout(600);
    await ecran("revision-revele", "Révision 1 sur 3 : le texte révélé, « À revoir » / « Je l’ai sue ».");
    await p.getByRole("button", { name: "Je l’ai sue" }).click(); await p.waitForTimeout(900);
    await ecran("revision-2", "Révision 2 sur 3 : l’invocation après le Fajr, deux mots sur trois masqués.");
    await p.getByRole("button", { name: "Révéler le texte" }).click(); await p.waitForTimeout(400);
    await p.getByRole("button", { name: "Je l’ai sue" }).click(); await p.waitForTimeout(900);
    await ecran("revision-3", "Révision 3 sur 3 : tout est masqué, « Récite-la de mémoire ».");
  });
  // ---------- Recommencer après un jour manqué : la bannière bienveillante, puis le minimum du jour ----------
  const manque = () => { const s = base(); s.days[jour(-1)] = { c: {}, note: "" }; return s; };
  await heure("14:05"); await seed(manque());
  await essai("manque", async () => { await p.goto(B + "/"); await p.waitForTimeout(2600); await hautTexte(/^Hier n’a pas été tenu/, 330); await ecran("manque", "Accueil après un jour manqué : « Hier n’a pas été tenu. Ce n’est pas grave, l’important est de reprendre. » et « Commencer par le minimum »."); });
  await essai("minimum", async () => { await p.getByRole("button", { name: "Commencer par le minimum" }).click(); await p.waitForTimeout(1500); await hautTexte(/^Minimum du jour$/, 330); await ecran("minimum", "Accueil, minimum du jour : « Trois invocations courtes suffisent aujourd’hui. »"); });
  // ---------- Un autre besoin : traverser une épreuve (un proche malade) ----------
  const epreuve = () => { const s = base(); s.objective = { title: "Soutenir un proche malade", cat: "epreuve", why: "Être présent et patient", since: DEMO.start }; s.parcours = { id: "epreuve", start: DEMO.start }; return s; };
  await seed(epreuve());
  await essai("epreuve-accueil", async () => { await p.goto(B + "/"); await p.waitForTimeout(2600); await ecran("epreuve-accueil", "Accueil avec le besoin « Soutenir un proche malade » (parcours Traverser une épreuve)."); });
  await essai("epreuve-parcours", async () => { await p.goto(B + "/parcours"); await p.waitForTimeout(2000); await ecran("epreuve-parcours", "Le parcours actif « Traverser une épreuve » : ses invocations et ses gestes."); });
  await heure("14:05"); await seed(base());
  await fiche("fiche-malade", "te guérir", "de te guérir", "Bibliothèque : l’invocation pour le malade qu’on visite (7 fois), avec sa source.");
  await fiche("fiche-mosquee", "entrant mosquée", "pied droit", "Bibliothèque : l’invocation en entrant dans la mosquée, avec sa source.");
  await ficheProgramme("fiche-hayy", "Yâ Hayyu yâ Qayyûm", "Hasbiyallâh", "Bibliothèque, « Du programme » : « Yâ Hayyu yâ Qayyûm » ouverte (enseignée à Fâtima).");
  // ---------- Nuit du 25/11 : bilan et progrès, études, inquiétude, istighfâr ----------
  await heure("14:05"); await seed(base());
  await essai("bilan", async () => { await p.goto(B + "/bilan"); await p.waitForTimeout(2200); await ecran("bilan", "Le bilan de la semaine et du mois : jours tenus, prières, invocations."); });
  await essai("cycle", async () => { await p.goto(B + "/cycle"); await p.waitForTimeout(2200); await ecran("cycle", "Le cycle de 30 jours en cours : jours tenus, progression."); });
  await essai("annee", async () => { await p.goto(B + "/annee"); await p.waitForTimeout(2200); await ecran("annee", "L’année : chaque jour tenu, d’un coup d’œil."); });
  await essai("biblio-recherche", async () => {
    await p.goto(B + "/apprendre"); await p.waitForTimeout(1800); await haut("#bibliotheque", 40);
    await p.fill("#bibliotheque input[type=search]", "dormir"); await p.waitForTimeout(900); await haut("#bibliotheque", 14);
    await ecran("biblio-recherche", "Bibliothèque : la recherche « dormir » et les invocations trouvées.");
  });
  await fiche("fiche-recherche", "dormir", /./, "Bibliothèque : recherche « dormir », la première invocation trouvée ouverte, avec sa source.");
  // Recherche large (« Seigneur ») : d’autres cartes suivent, la carte ouverte n’est pas en bas de page.
  await essai("fiche-inquiet", async () => {
    await p.goto(B + "/apprendre"); await p.waitForTimeout(1800); await haut("#bibliotheque", 40);
    await p.fill("#bibliotheque input[type=search]", "Seigneur"); await p.waitForTimeout(900);
    await p.locator(".bcard", { hasText: "associe rien" }).first().locator(".bhead").click(); await p.waitForTimeout(700);
    await p.locator(".bcard", { hasText: "associe rien" }).first().evaluate((e) => { const a = e.previousElementSibling || e; window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY - 22); }); await p.waitForTimeout(1200);
    await ecran("fiche-inquiet", "Bibliothèque : « Allah, Allah est mon Seigneur, je ne Lui associe rien » (grande détresse) ouverte, avec sa source.");
  });
  await ficheProgramme("fiche-istighfar", /^Istighfâr/, "Sayyid al-istighfâr", "Bibliothèque, « Du programme » : « Istighfâr » ouverte.");
  await ficheProgramme("fiche-sharh", "L’invocation avant l’épreuve orale", "Accroître sa science", "Bibliothèque, « Du programme » : « L’invocation avant l’épreuve orale » ouverte (Tâ-Hâ 20:25-28).");
  const etudes = () => { const s = base(); s.objective = { title: "Réussir mon examen", cat: "etudes", why: "Obtenir mon diplôme cette année", since: DEMO.start }; s.parcours = { id: "etudes", start: DEMO.start }; return s; };
  await seed(etudes());
  await essai("etudes-accueil", async () => { await p.goto(B + "/"); await p.waitForTimeout(2600); await ecran("etudes-accueil", "Accueil avec le besoin « Réussir mon examen » (parcours Études et examens)."); });
  await essai("etudes-journee", async () => { await haut(".dprog", 70); await ecran("etudes-journee", "Accueil plus bas, besoin « Réussir mon examen » : la journée par moments."); });
  await essai("etudes-parcours", async () => { await p.goto(B + "/parcours"); await p.waitForTimeout(2000); await ecran("etudes-parcours", "Le parcours actif « Études et examens » : ses invocations et ses gestes."); });
  // ---------- Nuit du 26/11 : science, après la prière, enfants, vendredi ----------
  await heure("14:05"); await seed(base());
  await ficheProgramme("fiche-zidni", "Accroître sa science", "Pour un foyer qui réjouit le cœur", "Bibliothèque, « Du programme » : « Accroître sa science » ouverte (Tâ-Hâ 20:114).");
  await fiche("fiche-salam", "la paix vient", "Tu es la Paix", "Bibliothèque : recherche « salut final », l’évocation après la prière (Muslim) ouverte.");
  await fiche("fiche-enfants", "enfants", "paroles parfaites", "Bibliothèque : recherche « enfants », la protection demandée pour les enfants ouverte.");
  // Le vendredi (jour de publication), pendant la dernière heure avant le Maghreb : « Maintenant : Dernière heure du vendredi ».
  // Attention : heure() est en heure du conteneur (UTC) ; 15:15 = 16:15 à Paris en hiver.
  await heure("15:15"); await seed(base());
  await essai("vendredi-accueil", async () => { await p.goto(B + "/"); await p.waitForTimeout(2600); await ecran("vendredi-accueil", "Accueil un vendredi, pendant la dernière heure : « Maintenant : Dernière heure du vendredi »."); });
  await essai("vendredi-journee", async () => { await haut(".dprog", 70); await ecran("vendredi-journee", "Accueil plus bas, un vendredi : la journée par moments."); });
  await essai("vendredi-moments", async () => { await p.goto(B + "/"); await p.waitForTimeout(2400); await p.locator(".favsum").first().click(); await p.waitForTimeout(900); await ecran("vendredi-moments", "Un vendredi pendant la dernière heure : les moments favorables dépliés (la dernière heure du vendredi)."); });
  // ---------- Nuit du 27/11 : l’assemblée (hm-211), la pluie (hm-188), l’aide pour adorer (hm-75) ----------
  await heure("14:05"); await seed(base());
  await fiche("fiche-assise", "assemblée", "On comptait", "Bibliothèque : recherche « assemblée », « Seigneur, pardonne-moi et accepte mon repentir » (cent fois dans une assise) ouverte.");
  await fiche("fiche-pluie", "pluie", "bénéfique", "Bibliothèque : recherche « pluie », l’invocation quand la pluie tombe ouverte, avec sa source.");
  await fiche("fiche-aide", "remercier", "aide-moi", "Bibliothèque : recherche « remercier », « Ô Allah, aide-moi à T’évoquer, à Te remercier et à T’adorer » ouverte.");
  // Le samedi : « La barakah dans ce qu’on a » (programme · anas), ouverte dans « Du programme », la carte d’avant en haut.
  await essai("fiche-anas", async () => {
    await p.goto(B + "/apprendre"); await p.waitForTimeout(1800); await haut("#bibliotheque", 40);
    await p.locator(".bt", { hasText: "Du programme" }).click(); await p.waitForTimeout(900);
    const carte = p.locator("#bibliotheque .bcard", { hasText: "La barakah dans ce qu’on a" }).first();
    await carte.locator(".bhead").click(); await p.waitForTimeout(700);
    await carte.evaluate((e) => { const a = e.previousElementSibling || e; window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY - 22); }); await p.waitForTimeout(1200);
    await ecran("fiche-anas", "Bibliothèque, « Du programme » : « La barakah dans ce qu’on a » ouverte (faite pour Anas).");
  });
  fs.writeFileSync(out + "manifeste.json", JSON.stringify(manifeste, null, 1));
  if (erreurs.length) console.log("Erreurs de page :", erreurs.slice(0, 5));
  console.log(`${Object.keys(manifeste).length} écrans capturés`);
  await b.close();
})();
