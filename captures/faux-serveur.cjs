// Faux Supabase en mémoire, pour tester le parcours compte + communauté dans le navigateur.
const http = require("http");
const db = { users: {}, profiles: {}, trackers: {}, requests: [], prayers: new Set(), log: [] };
const U = "11111111-1111-1111-1111-111111111111";
const uidOf = (req) => { const a = req.headers.authorization || ""; return a.includes("tok-") ? a.split("tok-")[1] : null; };
const send = (res, code, body) => { res.writeHead(code, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" }); res.end(body === undefined ? "" : JSON.stringify(body)); };
// demandes d'autres membres déjà publiées
const SEED = [["dette","Des dettes qui m’empêchent de dormir, une du’â pour que Allah me les allège",31],["mariage","Je cherche un conjoint pieux depuis deux ans, une du’â pour moi",47],["sante","Ma mère est malade, une du’â pour sa guérison",62],["emploi","Entretien d’embauche jeudi, faites une du’â pour moi",18],["etudes","Je passe un concours samedi, invoquez pour moi",24],["dette","Mon commerce ne tourne plus, que Allah m’ouvre les portes du rizq",15],["famille","Que Allah répare les liens dans ma famille",29]];
SEED.forEach(([cat, text, prayers], i) => db.requests.push({ id: "s" + i, anon: "other" + i, cat, text, pseudo: "", status: "approved", answered: false, prayers, created_at: new Date(Date.now() - (i + 1) * 3100e3).toISOString() }));
db.recs = [{ id: "rc1", anon: "other", day: new Date().toISOString().slice(0, 10), ref: "2:152", path: "other/a.m4a", seconds: 14, status: "approved", cheers: 2, created_at: new Date(Date.now() - 1800e3).toISOString() }, { id: "rc2", anon: "other2", day: new Date().toISOString().slice(0, 10), ref: "2:152", path: "other2/a.m4a", seconds: 21, status: "approved", cheers: 0, created_at: new Date(Date.now() - 5400e3).toISOString() }];
db.files = { "other/a.m4a": Buffer.from("x"), "other2/a.m4a": Buffer.from("x") }; db.cheers = new Set();
const rview = (r, me) => ({ id: r.id, day: r.day, ref: r.ref, path: r.path, seconds: r.seconds, status: r.status, created_at: r.created_at, mine: r.anon === me, cheered: db.cheers.has(r.id + me), cheers: r.anon === me ? r.cheers : null });
const view = (r, me) => ({ id: r.id, cat: r.cat, text: r.text, pseudo: r.pseudo, status: r.status, answered: r.answered, prayers: r.prayers, created_at: r.created_at, mine: r.anon === me, prayed: db.prayers.has(r.id + me) });
http.createServer((req, res) => {
  const chunks = []; req.on("data", (c) => chunks.push(c)); req.on("end", () => { const raw = Buffer.concat(chunks); const isJson = /json/.test(req.headers["content-type"] || ""); const body = isJson ? raw.toString() : "";
    const u = new URL(req.url, "http://x"); const p = u.pathname; const j = body ? JSON.parse(body) : {}; const me = uidOf(req);
    db.log.push(req.method + " " + p);
    if (req.method === "OPTIONS") return send(res, 200);
    if (p === "/__db") return send(res, 200, { trackers: Object.keys(db.trackers).length, updated: db.trackers[U]?.updated_at, days: db.trackers[U] && Object.keys(db.trackers[U].data.days || {}).length, profiles: Object.keys(db.profiles).length });

    if (p === "/auth/v1/settings") return send(res, 200, { external: { google: true, email: true } });
    if (p === "/auth/v1/authorize") { db.log.push("authorize " + u.searchParams.get("provider")); res.writeHead(200, { "content-type": "text/html" }); return res.end("<h1>google</h1>"); }
    const sess = (id, email) => ({ access_token: "tok-" + id, refresh_token: "r", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: "bearer", user: { id, email, aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, identities: [{ id: "i" }], created_at: new Date().toISOString() } });
    db.pw = db.pw || {};
    if (p === "/auth/v1/signup") { if (db.pw[j.email]) return send(res, 200, { id: "x", email: j.email, identities: [] }); db.pw[j.email] = { pwd: j.password, id: "22222222-2222-2222-2222-222222222222", ok: false }; return send(res, 200, { id: db.pw[j.email].id, email: j.email, identities: [{ id: "i" }] }); }
    if (p === "/auth/v1/token" && u.searchParams.get("grant_type") === "password") { const r = db.pw[j.email]; if (!r || r.pwd !== j.password) return send(res, 400, { error: "invalid_grant", error_description: "Invalid login credentials", msg: "Invalid login credentials" }); if (!r.ok) return send(res, 400, { error_code: "email_not_confirmed", msg: "Email not confirmed" }); db.users[r.id] = { id: r.id, email: j.email }; return send(res, 200, sess(r.id, j.email)); }
    if (p === "/auth/v1/recover") { db.log.push("recover " + j.email); return send(res, 200, {}); }
    if (p === "/auth/v1/user" && req.method === "PUT") { const e = Object.keys(db.pw).find((k) => db.pw[k].id === me); if (e && j.password) db.pw[e].pwd = j.password; return send(res, 200, { id: me, email: e }); }
    if (p === "/auth/v1/verify" && j.type === "signup") { const r = db.pw[j.email]; if (!r || j.token !== "123456") return send(res, 400, { msg: "Token has expired or is invalid" }); r.ok = true; db.users[r.id] = { id: r.id, email: j.email }; return send(res, 200, sess(r.id, j.email)); }
    if (p === "/__auth") return send(res, 200, { pw: db.pw, log: db.log.filter((l) => l.startsWith("recover")) });
    if (p === "/auth/v1/otp") return send(res, 200, {});
    if (p === "/auth/v1/verify") { if (j.token !== "123456") return send(res, 400, { error: "invalid", msg: "Token has expired or is invalid" });
      db.users[U] = { id: U, email: j.email }; return send(res, 200, { access_token: "tok-" + U, refresh_token: "r", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: "bearer", user: { id: U, email: j.email, aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } }); }
    if (p === "/auth/v1/user") return me ? send(res, 200, { id: me, email: db.users[me]?.email, aud: "authenticated", app_metadata: {}, user_metadata: {} }) : send(res, 401, {}); if (false) return me ? send(res, 200, { id: me, email: db.users[me]?.email, aud: "authenticated", app_metadata: {}, user_metadata: {} }) : send(res, 401, {});
    if (p === "/auth/v1/logout") return send(res, 204);
    if (p === "/__push") return send(res, 200, db.push || {});
    if (p === "/__com") return send(res, 200, { recs: db.recs, files: Object.keys(db.files), sizes: Object.values(db.files).map((b) => b.length), prayers: db.prayers.size });
    if (p.startsWith("/storage/v1/object/sign/recitations/") && req.method === "GET") { const f = db.files[decodeURIComponent(p.split("/recitations/")[1])]; if (!f) return send(res, 404, {}); res.writeHead(200, { "content-type": "audio/webm", "access-control-allow-origin": "*" }); return res.end(f); }
    if (!me) return send(res, 401, { message: "no auth" });
    if (p.startsWith("/storage/v1/object/sign/recitations/")) { const name = decodeURIComponent(p.split("/recitations/")[1]); const r = db.recs.find((x) => x.path === name); if (!r || !(r.status === "approved" || r.anon === me)) return send(res, 400, { message: "not found" }); return send(res, 200, { signedURL: "/object/sign/recitations/" + name + "?token=t" }); }
    if (p.startsWith("/storage/v1/object/recitations/") && req.method === "POST") { const name = decodeURIComponent(p.split("/recitations/")[1]); if (!name.startsWith("anon-" + me + "/")) return send(res, 403, { message: "rls" }); db.files[name] = raw; return send(res, 200, { Key: "recitations/" + name }); }
    if (p === "/storage/v1/object/recitations" && req.method === "DELETE") { for (const n of j.prefixes || []) delete db.files[n]; return send(res, 200, []); }
    if (p === "/rest/v1/profiles") { if (req.method === "GET") return send(res, 200, db.profiles[me] ? [{ id: me }] : []); db.profiles[me] = j; return send(res, 201); }
    if (p === "/rest/v1/trackers") { if (req.method === "GET") return send(res, 200, db.trackers[me] ? [db.trackers[me]] : []);
      if (!db.profiles[me]) return send(res, 403, { message: "rls" }); db.trackers[me] = { data: j.data, updated_at: j.updated_at }; return send(res, 201); }
    const rpc = p.replace("/rest/v1/rpc/", "");
    const R = (id) => db.requests.find((r) => r.id === id);
    switch (rpc) {
      case "is_moderator": return send(res, 200, true);
      case "feed_requests": return send(res, 200, db.requests.filter((r) => r.status === "approved" && !r.answered && r.anon !== me && (!j.p_cat || r.cat === j.p_cat)).map((r) => view(r, me)));
      case "my_requests": return send(res, 200, db.requests.filter((r) => r.anon === me).map((r) => view(r, me)));
      case "post_request": { if (/merde|connard/i.test(j.p_text)) return send(res, 400, { message: "message refusé : vulgarité" }); if (/instagram|\d{8}/i.test(j.p_text)) return send(res, 400, { message: "message refusé : contact" }); const id = "m" + db.requests.length; db.requests.push({ id, anon: me, cat: j.p_cat, text: j.p_text, pseudo: j.p_pseudo, status: "approved", answered: false, prayers: 23, created_at: new Date().toISOString() }); return send(res, 200, id); }
      case "pray_for": { const r = R(j.p_id); if (!db.prayers.has(r.id + me)) { db.prayers.add(r.id + me); r.prayers++; } return send(res, 200, r.prayers); }
      case "moderation_queue": return send(res, 200, db.requests.filter((r) => r.status === "pending").map((r) => view(r, "")));
      case "moderate": R(j.p_id).status = j.p_status; return send(res, 200, null);
      case "mark_answered": R(j.p_id).answered = true; return send(res, 200, null);
      case "report_request": return send(res, 200, null);
      case "delete_request": db.requests = db.requests.filter((r) => r.id !== j.p_id); return send(res, 200, null);
      case "dua_queue": return send(res, 200, db.requests.filter((r) => r.status === "approved" && !r.answered && r.anon !== me && !db.prayers.has(r.id + me)).sort((a, b) => (b.cat === j.p_cat) - (a.cat === j.p_cat) || a.prayers - b.prayers).slice(0, j.p_limit || 5).map((r) => view(r, me)));
      case "recitation_folder": return send(res, 200, "anon-" + me);
      case "post_recitation": { if (!j.p_voice_consent) return send(res, 400, { message: "accord pour la voix requis" }); if (db.recs.some((r) => r.anon === me && r.day === j.p_day)) return send(res, 400, { message: "limite atteinte : une récitation par jour" }); const id = "mine" + db.recs.length; db.recs.push({ id, anon: me, day: j.p_day, ref: j.p_ref, path: j.p_path, seconds: j.p_seconds, status: "approved", cheers: 0, created_at: new Date().toISOString() }); return send(res, 200, id); }
      case "feed_recitations": return send(res, 200, db.recs.filter((r) => r.day === j.p_day && (r.status === "approved" || r.anon === me)).sort((a, b) => (b.anon === me) - (a.anon === me)).map((r) => rview(r, me)));
      case "cheer_recitation": { const r = db.recs.find((x) => x.id === j.p_id); if (!db.cheers.has(r.id + me)) { db.cheers.add(r.id + me); r.cheers++; } return send(res, 200, null); }
      case "report_recitation": return send(res, 200, null);
      case "delete_recitation": { const r = db.recs.find((x) => x.id === j.p_id); db.recs = db.recs.filter((x) => x.id !== j.p_id); return send(res, 200, r ? r.path : null); }
      case "my_recitation_paths": return send(res, 200, db.recs.filter((r) => r.anon === me).map((r) => r.path));
      case "recitation_queue": return send(res, 200, db.recs.filter((r) => r.status === "pending").map((r) => rview(r, "")));
      case "moderate_recitation": db.recs.find((x) => x.id === j.p_id).status = j.p_status; return send(res, 200, null);
      case "push_subscribe": db.push = db.push || {}; db.push.sub = j; return send(res, 200, null);
      case "push_schedule": db.push = db.push || {}; db.push.items = j.p_items; return send(res, 200, (j.p_items || []).length);
      case "delete_my_account": delete db.profiles[me]; delete db.trackers[me]; return send(res, 200, null);
    }
    send(res, 404, { message: "?" + p });
  });
}).listen(54321, () => console.log("mock prêt"));
