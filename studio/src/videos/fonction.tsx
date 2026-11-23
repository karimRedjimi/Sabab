// « Une fonction à fond » : le suivi des prières et de la régularité. Aucun texte religieux dit.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Check, Logo, Son, starPoints, type Sfx } from "../moteur";
import voix from "../../public/voix/fonction.json";

const T = minutage(voix);
const { L, mot } = T;
type Z = { x: number; y: number; w: number; h: number };
const union = (a: Z, b: Z): Z => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };

// ---------- 1. L’accroche : cinq prières, cinq points d’interrogation ----------
const PRIERES = ["Fajr", "Dhuhr", "ʿAsr", "Maghreb", "ʿIchâ"];
const Doute: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const q = spring({ frame: f - mot(/^où/), fps, config: { damping: 7, stiffness: 160 } });
  return (
    <AbsoluteFill>
      {PRIERES.map((p, i) => {
        const s = spring({ frame: f - 2 - i * 4, fps, config: { damping: 10, stiffness: 180 } });
        const a = -Math.PI + (i / 4) * Math.PI, x = 540 + Math.cos(a) * 360, y = 820 + Math.sin(a) * 360;
        const wob = Math.sin(f / 7 + i) * 10 * q;
        return <div key={p} style={{ position: "absolute", left: x - 90, top: y - 90 + wob, width: 180, height: 180, borderRadius: "50%", background: "rgba(42,12,34,0.92)", transform: `scale(${s})`,
          boxShadow: "0 0 0 4px rgba(255,255,255,0.25)", display: "grid", placeItems: "center", textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: "#fff" }}>{p}</div>
          <div style={{ position: "absolute", top: -30, right: -10, fontFamily: FONT, fontWeight: 800, fontSize: 70, color: GOLD, transform: `scale(${q}) rotate(${(i - 2) * 10}deg)`, textShadow: "0 0 24px rgba(233,196,106,0.8)" }}>?</div>
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 150, color: "#fff", transform: `scale(${q})`, opacity: q, textShadow: "0 0 50px rgba(233,196,106,0.6)" }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Noter une prière d’un geste (accueil) ----------
const A = "ecrans/accueil";
const ZQ = zone(A, /^Tu as prié le ʿAsr \?$/), ZOUI = zone(A, /^Oui, priée$/), ZDET = zone(A, /^Détails$/);
const Noter: React.FC = () => <Phone ecran={A} from={L[1] - 4} to={L[3] + 2} entree="droite" sortie="gauche" focus={[{ at: L[1] + 6, px: 0.5, py: 0.5, s: 1.08 }]}>
  <Surligne at={mot(/^notes/, 1)} {...ZQ} fin={mot(/^geste/, 1) - 2} />
  <Surligne at={mot(/^geste/, 1)} {...ZOUI} fin={L[2] + 4} />
  <Check at={mot(/^geste/, 1) + 4} x={(ZOUI.x - 0.07) * W} y={(ZOUI.y + ZOUI.h / 2) * H} size={52} />
  <Surligne at={mot(/^précises/, 2)} {...ZDET} />
  <Pastille at={mot(/^l’heure/, 2)} x={W * 0.25} y={H * 0.265}>À l’heure</Pastille>
  <Pastille at={mot(/^mosquée/, 2)} x={W * 0.72} y={H * 0.265}>À la mosquée</Pastille>
  <Pastille at={mot(/^tard/, 2)} x={W * 0.5} y={H * 0.335}>Plus tard</Pastille>
</Phone>;

// ---------- 3. Le suivi : la semaine prière par prière, puis le moment fragile ----------
const S = "ecrans/suivi";
const ZPR = zone(S, /^Tes prières$/);
const LIGNES = PRIERES.map((p) => { const z = zone(S, new RegExp(`^${p}$`)); return { x: 0.06, y: z.y - 0.012, w: 0.88, h: z.h + 0.024 }; });
const ZFRAG = union(zone(S, /^Matin : 2 sur 6/), zone(S, /^C’est ton moment le plus fragile/));
const Semaine: React.FC = () => {
  const pp = mot(/^prière$/, 3), fin = L[4] - 2;
  return <Phone ecran={S} from={L[3] - 4} to={L[5] + 2} entree="bas" sortie="traverse" focus={[{ at: L[3] + 6, px: 0.5, py: 0.42, s: 1.08, fin: L[4] - 6 }, { at: L[4] + 2, px: 0.5, py: 0.42, s: 1.1 }]}>
    <Surligne at={mot(/^semaine/, 3)} {...ZPR} fin={pp - 2} />
    {LIGNES.map((z, i) => <Surligne key={i} at={pp + i * 5} {...z} fin={i === 4 ? fin : pp + i * 5 + 6} />)}
    <Surligne at={mot(/^fragile/, 4) - 4} {...ZFRAG} />
    <Pastille at={mot(/^juger/, 4)} x={W * 0.5} y={H * 0.66} gold>Sans jugement</Pastille>
  </Phone>;
};

// ---------- 4. La régularité : les jours tenus s’allument un à un ----------
const R = "ecrans/suivi2";
const CASES: Z[] = [];
for (let n = 0; n < 60; n++) { try { const z = zone(R, /^\d{1,2}$/, n); if (z.y > 0.42 && z.y < 0.7) CASES.push(z); } catch { break; } }
const Z24 = union(zone(R, /^24$/, 1), zone(R, /^jours tenus$/));
const Regularite: React.FC = () => {
  const f = useCurrentFrame();
  const a = mot(/^régularité/, 5);
  return <Phone ecran={R} from={L[5] - 4} to={L[6] + 2} entree="zoom" sortie="recul" focus={[{ at: L[5] + 4, px: 0.5, py: 0.45, s: 1.08 }]}>
    {CASES.map((z, i) => {
      const k = interpolate(f, [a + i * 1.2, a + i * 1.2 + 6, a + i * 1.2 + 16], [0, 1, 0.25], C);
      return <div key={i} style={{ position: "absolute", left: z.x * W - 3, top: z.y * H - 3, width: z.w * W + 6, height: z.h * H + 6, borderRadius: 12, opacity: k, boxShadow: `0 0 0 3px ${GOLD}, 0 0 18px rgba(233,196,106,0.8)` }} />;
    })}
    <Surligne at={mot(/^24/, 5)} {...Z24} />
    <Pastille at={mot(/^30/, 5)} x={W * 0.5} y={H * 0.2} gold>24 jours tenus sur 30</Pastille>
  </Phone>;
};

// ---------- 5. Pas de classement : le podium s’efface, il reste une étoile ----------
const EntreToiEtAllah: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pod = spring({ frame: f - L[6], fps, config: { damping: 12, stiffness: 160 } });
  const barre = interpolate(f, [mot(/^classement/, 6), mot(/^classement/, 6) + 8], [0, 1], C);
  const score = spring({ frame: f - mot(/^score/, 6), fps, config: { damping: 10, stiffness: 180 } });
  const barre2 = interpolate(f, [mot(/^public/, 6), mot(/^public/, 6) + 8], [0, 1], C);
  const toi = spring({ frame: f - mot(/^toi/, 6), fps, config: { damping: 11, stiffness: 140 } });
  const part = 1 - toi;
  const marches: [number, number, string][] = [[300, 240, "2"], [540, 340, "1"], [780, 170, "3"]];
  return (
    <AbsoluteFill>
      <div style={{ opacity: part }}>
        {marches.map(([x, h, n], i) => (
          <div key={n} style={{ position: "absolute", left: x - 110, top: 760 - h * pod, width: 220, height: h * pod, background: "rgba(42,12,34,0.92)", boxShadow: "0 0 0 3px rgba(255,255,255,0.3)",
            borderRadius: "18px 18px 0 0", display: "grid", placeItems: "start center", paddingTop: 20, fontFamily: FONT, fontWeight: 800, fontSize: 80, color: "rgba(255,255,255,0.6)" }}>{n}</div>
        ))}
        <div style={{ position: "absolute", left: 140, top: 560, width: 800 * barre, height: 16, borderRadius: 99, background: GOLD, transform: "rotate(-14deg)", transformOrigin: "left", boxShadow: "0 0 30px rgba(233,196,106,0.9)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", transform: `scale(${score})`, opacity: score }}>
          <span style={{ position: "relative", display: "inline-block", padding: "20px 50px", borderRadius: 24, background: "rgba(42,12,34,0.92)", boxShadow: "0 0 0 3px rgba(255,255,255,0.3)", fontFamily: FONT, fontWeight: 800, fontSize: 80, color: "rgba(255,255,255,0.7)" }}>
            9 850 pts
            <span style={{ position: "absolute", left: -20, top: "50%", width: `calc(${barre2 * 100}% + 40px)`, height: 14, borderRadius: 99, background: GOLD, boxShadow: "0 0 30px rgba(233,196,106,0.9)" }} />
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 540 - 130, top: 520, transform: `scale(${toi})`, opacity: toi }}><StarP size={260} glow={60} /></div>
      {[0, 1, 2].map((i) => { const k = ((f - mot(/^toi/, 6)) / 40 + i / 3) % 1; return toi > 0.1 ? <div key={i} style={{ position: "absolute", left: 540 - 300 * k, top: 650 - 300 * k, width: 600 * k, height: 600 * k, borderRadius: "50%", border: `3px solid ${GOLD}`, opacity: (1 - k) * 0.5 * toi }} /> : null; })}
    </AbsoluteFill>
  );
};

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[6] - 6, L[6] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Doute /></Scene>
    <Noter />
    <Semaine />
    <Regularite />
    <Scene from={L[6] - 4} to={L[7] - 2}><EntreToiEtAllah /></Scene>
    <Scene from={L[7] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[7]} phrase="Avance à ton rythme" /></Scene>
    <Flash at={L[7]} />
    <Voile />
    <SousTitres T={T} or={/^(prières?|geste|l’heure|mosquée|tard|semaine|fragile|juger|régularité|24|30|classement|score|toi|Allah|Sabab|rythme)/i} grandsDes={7} />
    <Son voix="fonction.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ...PRIERES.map((_, i) => ["pop", 2 + i * 4, 0.4] as Sfx), ["impact", mot(/^où/), 0.5],
  ["whoosh", L[1] - 4, 0.7], ["tick", mot(/^notes/, 1), 0.5], ["ding", mot(/^geste/, 1) + 4, 0.6],
  ["pop", mot(/^l’heure/, 2), 0.5], ["pop", mot(/^mosquée/, 2), 0.5], ["pop", mot(/^tard/, 2), 0.5], ["tick", mot(/^précises/, 2), 0.5],
  ["whoosh", L[3] - 4, 0.7], ["tick", mot(/^semaine/, 3), 0.4], ...[0, 1, 2, 3, 4].map((i) => ["tick", mot(/^prière$/, 3) + i * 5, 0.35] as Sfx),
  ["ding", mot(/^fragile/, 4) - 4, 0.5], ["pop", mot(/^juger/, 4), 0.5],
  ["whoosh", L[5] - 4, 0.7], ["ding", L[5] - 3, 0.4], ["shimmer", mot(/^30/, 5) + 14, 0.3],
  ["whoosh", L[6] - 4, 0.6], ["impact", mot(/^classement/, 6), 0.5], ["impact", mot(/^public/, 6), 0.5], ["shimmer", mot(/^toi/, 6), 0.6],
  ["impact", L[7], 0.7], ["shimmer", L[7] + 2, 0.6],
];
export const video = { id: "fonction", component: Video, duree: T.DUREE };
