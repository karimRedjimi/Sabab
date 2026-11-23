// « Commente ton souci » : chercher un conjoint depuis longtemps. Invocation : Coran, Al-Furqân 25:74.
// Textes religieux : public/voix/souci.textes.json (copiés par programme depuis content/programme.ts · ITEMS.azwaj et PARCOURS.mariage).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, starPoints, type Sfx } from "../moteur";
import voix from "../../public/voix/souci.json";
import tx from "../../public/voix/souci.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
// L’arabe est seulement coupé en deux lignes à l’affichage (avant « وَاجْعَلْنَا »), jamais modifié.
const COUPE = D.ar.indexOf(" وَاجْعَلْنَا");
const AR1 = D.ar.slice(0, COUPE), AR2 = D.ar.slice(COUPE + 1);
// Deux gestes du parcours « Le mariage », tels qu’écrits dans l’appli.
const GESTES = [tx.parcours.actions[0], tx.parcours.actions[2]];
const PARCOURS = mot(/^parcours/, 6);

// ---------- 1. L’accroche : le commentaire ----------
const Commentaire: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 170 } });
  const rep = spring({ frame: f - 14, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", transform: `scale(${rep})` }}>
        <span style={{ display: "inline-block", padding: "14px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 42 }}>Un souci qu’on lit souvent</span>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 440, padding: "40px 44px", borderRadius: 40, background: "#fff", boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 140}px) rotate(${(1 - s) * -4}deg)`, opacity: s, display: "flex", gap: 30, alignItems: "flex-start" }}>
        <div style={{ flex: "none", width: 96, height: 96, borderRadius: "50%", background: "#E8DDE6", display: "grid", placeItems: "center" }}>
          <svg width={60} height={60} viewBox="0 0 24 24" fill="#B79CB0"><circle cx="12" cy="8" r="4.2" /><path d="M3.5 21c.8-4.4 4.2-7 8.5-7s7.7 2.6 8.5 7z" /></svg>
        </div>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 54, lineHeight: 1.25, color: PLUM, marginTop: 10 }}>Ça fait des années que je cherche, et toujours rien.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Tu n’es pas la seule personne à attendre : des lumières s’allument autour de toi ----------
const AUTRES = Array.from({ length: 34 }, (_, i) => { const a = random("a" + i) * Math.PI * 2, r = 170 + random("r" + i) * 380; return { x: 540 + Math.cos(a) * r, y: 700 + Math.sin(a) * r * 0.95, d: random("d" + i) * 40 }; });
const PasSeul: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const toi = spring({ frame: f - L[1], fps, config: { damping: 12, stiffness: 140 } });
  const a = mot(/^seule/, 1);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1440} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {AUTRES.map((e, i) => { const s = spring({ frame: f - a - e.d, fps, config: { damping: 10, stiffness: 180 } });
          return <circle key={i} cx={e.x} cy={e.y} r={10 * s} fill="#FFF1C4" opacity={0.5 + 0.4 * Math.sin(f / 8 + i)} style={{ filter: "drop-shadow(0 0 12px rgba(233,196,106,0.95))" }} />; })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 80, top: 700 - 80, transform: `scale(${toi})` }}><StarP size={160} glow={40} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 76, color: "#fff",
        opacity: interpolate(f, [a, a + 10], [0, 1], C), textShadow: "0 0 40px rgba(233,196,106,0.6)", lineHeight: 1.2 }}>tu n’es pas<br /><span style={{ color: GOLD }}>la seule personne</span></div>
    </AbsoluteFill>
  );
};

// ---------- 3. Dans le Coran, une du’â pour le foyer : la maison qui s’allume ----------
const Foyer: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const c = spring({ frame: f - mot(/^Coran/, 2), fps, config: { damping: 12, stiffness: 160 } });
  const p = interpolate(f, [mot(/^foyer/, 2) - 6, mot(/^foyer/, 2) + 14], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", transform: `scale(${c})`, opacity: c }}>
        <span style={{ display: "inline-block", padding: "16px 44px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 54 }}>Dans le Coran</span>
      </div>
      <svg width={1080} height={1440} style={{ position: "absolute", inset: 0 }}>
        <path d="M 300 760 L 540 520 L 780 760 L 780 1060 L 300 1060 Z" fill="rgba(42,12,34,0.9)" stroke={GOLD} strokeWidth={10} strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`}
          style={{ filter: "drop-shadow(0 0 20px rgba(233,196,106,0.8))" }} />
        <rect x={480} y={900} width={120} height={160} rx={14} fill={GOLD} opacity={p} style={{ filter: `drop-shadow(0 0 ${40 * p}px rgba(233,196,106,0.95))` }} />
        <rect x={360} y={800} width={90} height={80} rx={10} fill="#FFF1C4" opacity={p * 0.9} />
        <rect x={630} y={800} width={90} height={80} rx={10} fill="#FFF1C4" opacity={p * 0.9} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 4. L’invocation ----------
const LaDua: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a1 = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 140 } });
  const nous = mot(/^nous$/, 3);
  const a3 = spring({ frame: f - nous, fps, config: { damping: 14, stiffness: 140 } });
  const fr = interpolate(f, [L[3] + 20, L[3] + 34], [0, 1], C);
  const ligne = (t: string, k: number, actif: boolean) => <div style={{ fontFamily: AR, fontSize: 62, lineHeight: 1.6, color: actif ? GOLD : "#fff", opacity: 0.15 + 0.85 * k,
    textShadow: actif ? "0 0 40px rgba(233,196,106,0.8)" : "none", transform: `scale(${0.92 + 0.08 * k})` }}>{t}</div>;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 40, right: 40, top: 170, textAlign: "center", direction: "rtl" }}>
        {ligne(AR1, a1, f < nous - 10)}
        {ligne(AR2, a3, f >= nous - 10)}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 480, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 34, lineHeight: 1.45, color: "rgba(255,255,255,0.82)",
        opacity: interpolate(f, [L[3] + 10, L[3] + 24], [0, 1], C) }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 680, padding: "40px 44px", borderRadius: 40, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 30px 80px rgba(0,0,0,0.45)",
        textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.35, color: "#fff", opacity: fr, transform: `translateY(${(1 - fr) * 40}px)` }}>{D.fr}</div>
    </AbsoluteFill>
  );
};

// ---------- 5. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[4], fps, config: { damping: 9, stiffness: 180 } });
  const v = spring({ frame: f - mot(/^74/, 4), fps, config: { damping: 8, stiffness: 220 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", transform: `scale(${s})`, opacity: s }}>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)" }}>SOURCE</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 68, color: "#fff", marginTop: 16 }}>{D.src}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 220, color: GOLD, transform: `scale(${v})`, opacity: v, textShadow: "0 0 70px rgba(233,196,106,0.7)" }}>25:74</div>
    </AbsoluteFill>
  );
};

// ---------- 6. Confier, chaque jour, sans savoir quand : les jours qui passent sous une étoile ----------
const ChaqueJour: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[5];
  const etoile = spring({ frame: f - mot(/^Allah/, 5), fps, config: { damping: 12, stiffness: 120 } });
  const q = spring({ frame: f - mot(/^quand/, 5), fps, config: { damping: 10, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 110, top: 260 - 40 * etoile, transform: `scale(${etoile})` }}><StarP size={220} glow={60} /></div>
      {Array.from({ length: 7 }, (_, i) => {
        const k = interpolate(f, [a + 8 + i * 8, a + 16 + i * 8], [0, 1], C);
        return <div key={i} style={{ position: "absolute", left: 120 + i * 130, top: 760, width: 100, height: 100, borderRadius: 26, background: k > 0.5 ? GOLD : "rgba(42,12,34,0.9)",
          boxShadow: `0 0 0 3px ${GOLD}, 0 0 ${30 * k}px rgba(233,196,106,0.8)`, transform: `scale(${0.7 + 0.3 * k})`, display: "grid", placeItems: "center" }}>
          <svg width={50} height={50} viewBox="0 0 100 100" style={{ opacity: k }}><polygon points={starPoints(50, 50, 40)} fill={PLUM} /></svg>
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", opacity: q, transform: `translateY(${(1 - q) * 40}px)` }}>
        quand ? comment ? <span style={{ color: GOLD }}>Allah sait.</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. Dans Sabab : le besoin sur l’accueil, puis le parcours ----------
const A = "ecrans/accueil-mariage", P = "ecrans/parcours-mariage";
const ZBESOIN = zone(A, /^Trouver mon conjoint$/);
const ZMAR = (() => { const a = zone(P, /^Le mariage$/), b = zone(P, /^Pour celui ou celle/); return { x: a.x, y: a.y, w: a.w, h: b.y + b.h - a.y }; })();
const ZCYCLE = zone(P, /^Cycle 2 · jour 7 sur 30$/);
const Besoin: React.FC = () => <Phone ecran={A} from={L[6] - 4} to={PARCOURS + 2} entree="bascule" sortie="gauche" focus={[{ at: L[6] + 6, px: 0.5, py: 0.5, s: 1.08 }]}>
  <Surligne at={mot(/^besoin/, 6)} {...ZBESOIN} />
</Phone>;
const Parcours: React.FC = () => <Phone ecran={P} from={PARCOURS - 2} to={L[7] + 2} entree="droite" sortie="traverse" focus={[{ at: PARCOURS + 6, px: 0.5, py: 0.4, s: 1.08 }]}>
  <Surligne at={PARCOURS + 2} {...ZMAR} fin={mot(/^geste/, 6) - 2} />
  <Surligne at={mot(/^geste/, 6)} {...ZCYCLE} />
  <Pastille at={mot(/^jour\.?$/, 6)} x={W * 0.5} y={H * 0.6} gold>Un geste concret par jour</Pastille>
</Phone>;

// ---------- 8. Deux gestes du parcours ----------
const Gestes: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const at = [L[7], mot(/^parler/, 7)];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: "0.1em", color: GOLD,
        opacity: interpolate(f, [L[7] - 2, L[7] + 8], [0, 1], C) }}>LE GESTE DU JOUR</div>
      {GESTES.map((g, i) => {
        const s = spring({ frame: f - at[i], fps, config: { damping: 12, stiffness: 160 } });
        return <div key={g} style={{ position: "absolute", left: 80, right: 80, top: 360 + i * 300, padding: "40px 40px 40px 140px", borderRadius: 36, background: "rgba(42,12,34,0.92)",
          boxShadow: `0 0 0 3px ${GOLD}, 0 30px 70px rgba(0,0,0,0.4)`, transform: `translateX(${(1 - s) * (i ? 900 : -900)}px)`, opacity: s,
          fontFamily: FONT, fontWeight: 700, fontSize: 50, lineHeight: 1.3, color: "#fff" }}>
          <div style={{ position: "absolute", left: 40, top: "50%", marginTop: -36, width: 72, height: 72, borderRadius: 20, border: `5px solid ${GOLD}`, display: "grid", placeItems: "center" }}>
            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: interpolate(f, [at[i] + 14, at[i] + 20], [0, 1], C) }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
          {g}
        </div>;
      })}
    </AbsoluteFill>
  );
};

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 8, L[3] + 10, L[6] - 6, L[8] - 4, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Commentaire /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><PasSeul /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Foyer /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><LaDua /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Source /></Scene>
    <Scene from={L[5] - 4} to={L[6] - 2}><ChaqueJour /></Scene>
    <Besoin /><Parcours />
    <Scene from={L[7] - 4} to={L[8] - 2}><Gestes /></Scene>
    <Scene from={L[8] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[8]} phrase="Demander, avancer, tenir" /></Scene>
    <Flash at={L[8]} />
    <Voile />
    <SousTitres T={T} or={/^(années|seule|attendre|Coran|foyer|joie|yeux|pieux|Furqân|74|confies|réponse|besoin|parcours|geste|qualités|confiance|Sabab|tenir)/i} grandsDes={8} />
    <Son voix="souci.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["message", 3, 0.6], ["pop", 14, 0.5],
  ["whoosh", L[1] - 4, 0.5], ["coeur", L[1] + 2, 0.5], ["shimmer", mot(/^seule/, 1), 0.5],
  ["whoosh", L[2] - 4, 0.5], ["pop", mot(/^Coran/, 2), 0.5], ["ding", mot(/^foyer/, 2), 0.5],
  ["shimmer", L[3] - 2, 0.6],
  ["whoosh", L[4] - 4, 0.4], ["pop", mot(/^74/, 4), 0.5],
  ["whoosh", L[5] - 4, 0.5], ...Array.from({ length: 7 }, (_, i) => ["tick", L[5] + 10 + i * 8, 0.3] as Sfx), ["shimmer", mot(/^quand/, 5), 0.4],
  ["whoosh", L[6] - 4, 0.6], ["tick", mot(/^besoin/, 6), 0.5], ["whoosh", PARCOURS - 3, 0.5], ["ding", mot(/^geste/, 6), 0.5], ["pop", mot(/^jour\.?$/, 6), 0.5],
  ["whoosh", L[7] - 4, 0.5], ["pop", L[7] + 4, 0.5], ["pop", mot(/^parler/, 7) + 4, 0.5],
  ["impact", L[8], 0.6], ["shimmer", L[8] + 2, 0.6],
];
export const video = { id: "souci", component: Video, duree: T.DUREE };
