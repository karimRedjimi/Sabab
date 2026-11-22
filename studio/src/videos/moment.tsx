// « Le moment du calendrier » : ce lundi, entre l’appel et l’iqâma (textes.ts · MOMENTS_FAVORABLES.appel, Abû Dâwûd n° 521 ;
// FORCE_DU_PROGRAMME[3]). Textes : public/voix/moment.textes.json, copiés par programme depuis content/ (voix/textes.ts).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, H, W, minutage, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Son, Logo, zone, englobe, type Sfx } from "../moteur";
import voix from "../../public/voix/moment.json";
import tx from "../../public/voix/moment.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const PRIERES = ["Fajr", "Dhuhr", "ʿAsr", "Maghreb", "ʿIchâ"];

// ---------- 1. Le calendrier : lundi, et cinq moments ----------
const Calendrier: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const page = spring({ frame: f - 1, fps, config: { damping: 13, stiffness: 150 } });
  const c = mot(/^cinq/);
  const q = spring({ frame: f - mot(/^lesquels/), fps, config: { damping: 7, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <div style={{ position: "absolute", left: 540 - 230, top: 200, width: 460, height: 440, borderRadius: 40, background: "#FBF4EA", overflow: "hidden", transformOrigin: "50% 0", transform: `rotateX(${(1 - page) * -100}deg)`, boxShadow: "0 40px 90px rgba(0,0,0,0.5)" }}>
        <div style={{ height: 120, background: "#C4562C", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 60, color: "#fff", letterSpacing: "0.1em" }}>LUNDI</div>
        <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 200, color: PLUM, lineHeight: "230px" }}>23</div>
        <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 46, color: "#8A5A4A" }}>novembre</div>
      </div>
      {PRIERES.map((p, i) => {
        const s = spring({ frame: f - c - i * 4, fps, config: { damping: 10, stiffness: 200 } });
        return <div key={p} style={{ position: "absolute", left: 80 + i * 190, top: 780, width: 160, textAlign: "center", transform: `scale(${s})`, opacity: s }}>
          <StarP size={110} glow={24} />
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: "#fff", marginTop: 8 }}>{p}</div>
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 200, color: GOLD, transform: `scale(${q}) rotate(${Math.sin(f / 6) * 6}deg)`, opacity: q, lineHeight: 1 }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Entre l’appel et l’iqâma : le segment qui s’allume ----------
const Segment: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - mot(/^l’appel/, 1), fps, config: { damping: 10, stiffness: 200 } });
  const b = spring({ frame: f - mot(/iqâma/, 1), fps, config: { damping: 10, stiffness: 200 } });
  const p = interpolate(f, [mot(/^l’appel/, 1) + 4, mot(/iqâma/, 1)], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      {[0, 1, 2].map((i) => { const k = ((f - L[1]) / 30 + i / 3) % 1; return f > L[1] ? <div key={i} style={{ position: "absolute", left: 200 - 160 * k, top: 802 - 160 * k, width: 320 * k, height: 320 * k, borderRadius: "50%", border: `4px solid ${GOLD}`, opacity: (1 - k) * 0.6 * a }} /> : null; })}
      <div style={{ position: "absolute", left: 200, top: 790, width: 680 * p, height: 24, borderRadius: 99, background: "linear-gradient(90deg,#C98A2E,#E9C46A,#FFF1C4)", boxShadow: "0 0 40px rgba(233,196,106,0.9)" }} />
      <div style={{ position: "absolute", left: 200 - 70, top: 730, width: 140, height: 140, borderRadius: "50%", background: "rgba(42,12,34,0.95)", boxShadow: `0 0 0 6px ${GOLD}`, transform: `scale(${a})` }} />
      <div style={{ position: "absolute", left: 880 - 70, top: 730, width: 140, height: 140, borderRadius: "50%", background: GOLD, transform: `scale(${b})` }} />
      <div style={{ position: "absolute", left: 60, width: 280, top: 900, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#fff", opacity: a }}>L’appel</div>
      <div style={{ position: "absolute", left: 740, width: 280, top: 900, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 56, color: GOLD, opacity: b }}>L’iqâma</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: GOLD, letterSpacing: "0.1em", opacity: a }}>CINQ FOIS PAR JOUR</div>
    </AbsoluteFill>
  );
};

// ---------- 3. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[2], fps, config: { damping: 13, stiffness: 150 } });
  const src = spring({ frame: f - mot(/^rapporté/, 2), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 80, right: 80, top: 360, padding: "60px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 200}px)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 40, color: GOLD, fontWeight: 800, letterSpacing: "0.1em" }}>MOMENT FAVORABLE</div>
        <div style={{ fontFamily: FONT, fontSize: 76, color: "#fff", fontWeight: 800, lineHeight: 1.2, margin: "26px 0 10px" }}>{tx.appel.label.charAt(0).toUpperCase() + tx.appel.label.slice(1)}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", transform: `scale(${src})`, opacity: src }}>
        <span style={{ display: "inline-block", padding: "18px 46px", borderRadius: 99, background: GOLD, fontFamily: FONT, fontWeight: 800, fontSize: 50, color: PLUM }}>{tx.appel.source}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. Les trois moments (texte exact de « Ce qui donne sa force au programme ») ----------
const Trois: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const items: [string, number][] = [["Le dernier tiers de la nuit", mot(/^tiers/, 3)], ["Entre l’appel et l’iqâma", L[3]], ["La prosternation", mot(/^prosternation/, 3)]];
  const bas = interpolate(f, [mot(/^prosternation/, 3) + 10, mot(/^prosternation/, 3) + 22], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 46, color: GOLD, letterSpacing: "0.08em" }}>LES MOMENTS FAVORABLES</div>
      {items.map(([t, at], i) => { const s = spring({ frame: f - at + 2, fps, config: { damping: 12, stiffness: 180 } });
        return <div key={i} style={{ position: "absolute", left: 110, right: 110, top: 340 + i * 190, padding: "34px 40px", borderRadius: 32, background: i === 1 ? GOLD : "rgba(255,255,255,0.1)", border: `3px solid ${GOLD}`,
          fontFamily: FONT, fontWeight: 800, fontSize: 52, color: i === 1 ? PLUM : "#fff", textAlign: "center", transform: `translateX(${(1 - s) * (i % 2 ? -900 : 900)}px)`, opacity: s }}>{t}</div>; })}
      <div style={{ position: "absolute", left: 80, right: 80, top: 960, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 32, lineHeight: 1.4, color: "rgba(255,255,255,0.85)", opacity: bas }}>
        {tx.force.label} : {tx.force.source}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Dans l’appli : les moments favorables dépliés ----------
const EM = "ecrans/moments";
const Moments: React.FC = () => (
  <Phone ecran={EM} from={L[4] - 4} to={L[5] + 2} entree="droite" sortie="traverse">
    <Surligne at={mot(/^prochain/, 4)} fin={mot(/heure/, 4) - 6} {...zone(EM, /^Moment favorable · à l’appel/)} />
    <Surligne at={mot(/heure/, 4)} {...englobe(zone(EM, /^Entre l’appel à la prière et l’iqâma$/), zone(EM, /^Au prochain appel/))} />
    <Pastille at={mot(/^ville/, 4)} x={W * 0.5} y={H * 0.3} gold>Calé sur les horaires de ta ville</Pastille>
  </Phone>
);

// ---------- 6. Garde ta du’â pour ce moment ----------
const Garde: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[5], fps, config: { damping: 11, stiffness: 160 } });
  const ferme = interpolate(f, [mot(/^Garde/, 5) + 8, mot(/^Garde/, 5) + 20], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const pulse = 1 + 0.06 * Math.sin(f / 5);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 85, top: 430 + ferme * 120, transform: `scale(${s * pulse})` }}><StarP size={170} glow={40} /></div>
      <div style={{ position: "absolute", left: 540 - 220, top: 640, width: 440, height: 300, borderRadius: 36, background: "rgba(42,12,34,0.95)", boxShadow: `0 0 0 5px ${GOLD}, 0 30px 80px rgba(0,0,0,0.5)`, transform: `scale(${s})` }}>
        <div style={{ position: "absolute", left: -10, right: -10, top: -20, height: 60, borderRadius: 20, background: GOLD, transformOrigin: "0 100%", transform: `rotate(${(1 - ferme) * -40}deg)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 50, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff" }}>ta du’â</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 60, color: GOLD, opacity: ferme }}>pour le prochain appel</div>
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["whoosh", 1, 0.5], ["pop", 10, 0.4], ...PRIERES.map((_, i) => ["pop", mot(/^cinq/) + i * 4, 0.4] as Sfx), ["ding", mot(/^lesquels/), 0.5],
  ["whoosh", L[1] - 4, 0.5], ["tick", mot(/^l’appel/, 1), 0.5], ["shimmer", mot(/iqâma/, 1), 0.5],
  ["whoosh", L[2] - 4, 0.5], ["pop", mot(/^rapporté/, 2), 0.5],
  ["whoosh", L[3] - 4, 0.5], ["tick", mot(/^tiers/, 3), 0.4], ["tick", mot(/^prosternation/, 3), 0.4],
  ["whoosh", L[4] - 4, 0.6], ["ding", mot(/^prochain/, 4), 0.4], ["tick", mot(/heure/, 4), 0.4], ["pop", mot(/^ville/, 4), 0.5],
  ["whoosh", L[5] - 4, 0.5], ["tap", mot(/^Garde/, 5) + 18, 0.5],
  ["impact", L[6], 0.7], ["shimmer", L[6] + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[2], L[4] - 6, L[5], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Calendrier /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Segment /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Source /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Trois /></Scene>
    <Moments />
    <Scene from={L[5] - 4} to={L[6] - 2}><Garde /></Scene>
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[6]} phrase="Le bon moment pour invoquer" /></Scene>
    <Flash at={L[6]} />
    <Voile />
    <SousTitres T={T} or={/^(lundi|cinq|l’appel|l’iqâma|favorables|Abû|Dâwûd|tiers|nuit|prosternation|ville|du’â|Sabab)/i} grandsDes={6} />
    <Son voix="moment.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "moment", component: Video, duree: T.DUREE };
