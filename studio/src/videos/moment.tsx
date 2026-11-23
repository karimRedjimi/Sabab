// « Le moment du calendrier » : mardi, et le moment entre l’appel à la prière et l’iqâma (Abû Dâwûd n° 521).
// Textes religieux : public/voix/moment.textes.json (copiés par programme depuis content/textes.ts · MOMENTS_FAVORABLES.appel).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/moment.json";
import tx from "../../public/voix/moment.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const AP = tx.appel;
const LABEL = AP.label.charAt(0).toUpperCase() + AP.label.slice(1); // seule retouche : la majuscule en début de carte
const PRIERES = ["Fajr", "Dhuhr", "ʿAsr", "Maghreb", "ʿIchâ"];

// ---------- 1. L’accroche : la page du calendrier, mardi, et cinq rendez-vous ----------
const Calendrier: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const page = spring({ frame: f - 2, fps, config: { damping: 13, stiffness: 150 } });
  const cinq = mot(/^cinq/);
  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      <div style={{ position: "absolute", left: 240, right: 240, top: 220, height: 460, borderRadius: 40, background: "#FBF6EF", boxShadow: "0 40px 100px rgba(0,0,0,0.5)", overflow: "hidden",
        transform: `rotateX(${(1 - page) * 80}deg)`, transformOrigin: "50% 0%", opacity: Math.min(1, page * 2), textAlign: "center" }}>
        <div style={{ height: 110, background: "#7A2A5E", color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 52, display: "grid", placeItems: "center", letterSpacing: "0.12em" }}>NOVEMBRE</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 200, color: PLUM, lineHeight: 1.1, marginTop: 6 }}>24</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#B0446F", transform: `scale(${spring({ frame: f - mot(/^mardi/), fps, config: { damping: 8, stiffness: 220 } })})` }}>Mardi</div>
      </div>
      {PRIERES.map((p, i) => {
        const s = spring({ frame: f - cinq - i * 4, fps, config: { damping: 9, stiffness: 200 } });
        return <div key={p} style={{ position: "absolute", left: 80 + i * 190, top: 800, width: 166, height: 166, borderRadius: "50%", background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 4px ${GOLD}, 0 0 40px rgba(233,196,106,0.6)`,
          display: "grid", placeItems: "center", transform: `scale(${s})`, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: "#fff" }}>{p}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: GOLD,
        opacity: interpolate(f, [mot(/^connais/), mot(/^connais/) + 8], [0, 1], C) }}>5 rendez-vous ?</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Entre l’appel et l’iqâma : le segment d’or ----------
const Segment: React.FC<{ a: number; demande?: number }> = ({ a, demande }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const g = spring({ frame: f - a, fps, config: { damping: 14, stiffness: 120 } });
  const p = interpolate(f, [a + 6, a + 30], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const onde = (k: number) => ((f / 20 + k / 3) % 1);
  const d = demande === undefined ? 0 : spring({ frame: f - demande, fps, config: { damping: 12, stiffness: 120 } });
  return (
    <>
      <div style={{ position: "absolute", left: 100, right: 100, top: 760, height: 12, borderRadius: 99, background: "rgba(255,255,255,0.2)", opacity: g }} />
      <div style={{ position: "absolute", left: 230, top: 744, width: 620 * p, height: 44, borderRadius: 99, background: "linear-gradient(90deg,#C98A2E,#E9C46A,#FFF1C4)", boxShadow: "0 0 50px rgba(233,196,106,0.9)" }} />
      {/* l’appel : des ondes qui partent */}
      <div style={{ position: "absolute", left: 230 - 40, top: 726, width: 80, height: 80, borderRadius: "50%", background: GOLD, transform: `scale(${g})` }} />
      {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 230 - 40 - 80 * onde(k), top: 726 - 80 * onde(k), width: 80 + 160 * onde(k), height: 80 + 160 * onde(k), borderRadius: "50%",
        border: `4px solid ${GOLD}`, opacity: (1 - onde(k)) * 0.7 * g }} />)}
      <div style={{ position: "absolute", left: 850 - 40, top: 726, width: 80, height: 80, borderRadius: "50%", background: "#fff", transform: `scale(${p})` }} />
      <div style={{ position: "absolute", left: 230 - 150, width: 300, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 50, color: "#fff", opacity: g }}>L’appel</div>
      <div style={{ position: "absolute", left: 850 - 150, width: 300, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 50, color: "#fff", opacity: p }}>L’iqâma</div>
      {demande !== undefined && <div style={{ position: "absolute", left: 540 - 200, top: 330 + 300 * d, width: 400, padding: "30px 0", borderRadius: 30, background: "#fff", textAlign: "center",
        fontFamily: FONT, fontWeight: 800, fontSize: 50, color: PLUM, boxShadow: `0 0 ${60 * d}px rgba(233,196,106,0.9), 0 20px 60px rgba(0,0,0,0.4)`, transform: `scale(${1 - 0.25 * d})` }}>Ta demande</div>}
    </>
  );
};
const EntreDeux: React.FC = () => <AbsoluteFill><Segment a={L[1]} /></AbsoluteFill>;

// ---------- 3. Un moment favorable, avec sa source ----------
const Carte: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - mot(/^moment/, 2), fps, config: { damping: 12, stiffness: 150 } });
  const src = spring({ frame: f - mot(/^Abû/, 2), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <Segment a={L[1] - 40} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 250, padding: "44px 40px", borderRadius: 40, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}, 0 30px 80px rgba(0,0,0,0.45)`,
        textAlign: "center", transform: `translateY(${(1 - s) * -80}px)`, opacity: s }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, letterSpacing: "0.1em", color: GOLD }}>MOMENT FAVORABLE</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, lineHeight: 1.3, color: "#fff", marginTop: 14 }}>{LABEL}</div>
        <div style={{ display: "inline-block", marginTop: 22, padding: "10px 30px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 40, transform: `scale(${src})` }}>{AP.source}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. Garde ta demande pour ce moment ----------
const Garde: React.FC = () => <AbsoluteFill><Segment a={L[1] - 40} demande={mot(/^garde/, 3)} /></AbsoluteFill>;

// ---------- 5. Dans Sabab : les moments favorables dépliés sur l’accueil ----------
const M = "ecrans/moments";
const ZLIGNE = zone(M, /^Moment favorable · à l’appel/);
const ZAPPEL = (() => { const a = zone(M, /^Entre l’appel à la prière et l’iqâma$/), b = zone(M, /^Au prochain appel/); return { x: a.x, y: a.y, w: a.w, h: b.y + b.h - a.y }; })();
const ZSRC = zone(M, /^Pour ta dette : garde ton invocation/);
const Accueil: React.FC = () => <Phone ecran={M} from={L[4] - 4} to={L[5] + 2} entree="zoom" sortie="traverse" focus={[{ at: L[4] + 6, px: 0.5, py: 0.42, s: 1.1 }]}>
  <Surligne at={mot(/^prochain/, 4)} {...ZLIGNE} fin={mot(/^s’affiche/, 4) - 2} />
  <Surligne at={mot(/^s’affiche/, 4)} {...ZAPPEL} fin={mot(/^source/, 4) - 2} />
  <Surligne at={mot(/^source/, 4)} {...ZSRC} />
</Phone>;

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[4] - 6, L[5] + 4, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Calendrier /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><EntreDeux /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2} zin={0}><Carte /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2} zin={0}><Garde /></Scene>
    <Accueil />
    <Scene from={L[5] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[5]} phrase="Le bon moment, chaque jour" /></Scene>
    <Flash at={L[5]} />
    <Voile />
    <SousTitres T={T} or={/^(mardi|cinq|rendez-vous|l’appel|l’iqâma|favorable|invoquer|Dâwûd|importante|moment-là|source|Sabab|bio)/i} grandsDes={5} />
    <Son voix="moment.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["whoosh", 2, 0.5], ["pop", mot(/^mardi/), 0.6], ...PRIERES.map((_, i) => ["pop", mot(/^cinq/) + i * 4, 0.4] as Sfx), ["ding", mot(/^connais/), 0.4],
  ["whoosh", L[1] - 4, 0.5], ["riser", L[1] + 4, 0.3], ["ding", mot(/^l’iqâma/, 1), 0.5],
  ["shimmer", mot(/^moment/, 2), 0.5], ["pop", mot(/^Abû/, 2), 0.5],
  ["whoosh", L[3] - 4, 0.4], ["shimmer", mot(/^garde/, 3) + 10, 0.5],
  ["whoosh", L[4] - 4, 0.6], ["tick", mot(/^prochain/, 4), 0.5], ["tick", mot(/^s’affiche/, 4), 0.5], ["ding", mot(/^source/, 4), 0.5],
  ["impact", L[5], 0.6], ["shimmer", L[5] + 2, 0.6],
];
export const video = { id: "moment", component: Video, duree: T.DUREE };
