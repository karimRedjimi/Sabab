// « Une fonction à fond » : la prochaine prière et les moments favorables (accueil, moments dépliés, rappels avant la prière).
// Aucun texte religieux dit. Sources des moments affichées en pastille, copiées de public/voix/fonction.textes.json (content/textes.ts · MOMENTS_FAVORABLES).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/fonction.json";
import tx from "../../public/voix/fonction.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const PRIERES = ["Fajr", "Dhuhr", "ʿAsr", "Maghreb", "ʿIchâ"];

// ---------- 1. L’accroche : l’arc du jour, cinq prières, et un point d’interrogation ----------
const Arc: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const p = interpolate(f, [4, mot(/^prochaine/)], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const q = spring({ frame: f - mot(/^prière/), fps, config: { damping: 7, stiffness: 180 } });
  const pt = (i: number) => { const a = Math.PI * (1 - i / 4); return { x: 540 + 380 * Math.cos(a), y: 820 - 380 * Math.sin(a) }; };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 80, color: "#fff", opacity: interpolate(f, [2, 12], [0, 1], C) }}>
        La <span style={{ color: GOLD }}>prochaine</span> prière ?
      </div>
      <svg width={1080} height={1100} style={{ position: "absolute", inset: 0 }}>
        <path d="M160 820 A380 380 0 0 1 920 820" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={10} strokeLinecap="round" />
        <path d="M160 820 A380 380 0 0 1 920 820" fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${0.75 * p} 1`} style={{ filter: "drop-shadow(0 0 14px rgba(233,196,106,0.8))" }} />
        {PRIERES.map((n, i) => {
          const s = spring({ frame: f - 6 - i * 6, fps, config: { damping: 10, stiffness: 200 } }), c = pt(i), fait = i < 3;
          return <g key={n} transform={`translate(${c.x} ${c.y}) scale(${s})`}>
            <circle r={i === 3 ? 34 : 24} fill={fait ? GOLD : i === 3 ? "#fff" : "rgba(255,255,255,0.3)"} style={{ filter: i === 3 ? `drop-shadow(0 0 ${20 + 14 * Math.sin(f / 5)}px rgba(255,255,255,0.9))` : undefined }} />
            <text x={i === 0 ? -20 : i === 4 ? 20 : 0} y={i === 0 || i === 4 ? 70 : i === 3 ? -56 : -46} textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"} fontFamily="DM Sans" fontWeight={700} fontSize={i === 3 ? 46 : 38} fill={i === 3 ? "#fff" : "rgba(255,255,255,0.75)"}>{n}</text>
          </g>;
        })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 90, top: 690, width: 180, height: 180, borderRadius: "50%", background: GOLD, color: PLUM, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 120, transform: `scale(${q}) rotate(${(1 - q) * 40}deg)`, boxShadow: "0 0 60px rgba(233,196,106,0.8)" }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2 à 4. L’accueil : la prochaine prière, les cinq horaires, la question ----------
const EA = "ecrans/accueil";
const ZP = englobe(zone(EA, /^Prochaine prière : Maghreb$/), zone(EA, /^dans 1 h 54$/));
const ZH = englobe(zone(EA, /^07:02 Fajr$/), zone(EA, /^18:14 ʿIchâ$/));
const ZQ = englobe(zone(EA, /^Tu as prié le ʿAsr \?$/), zone(EA, /^Pas encore$/));
const Accueil: React.FC = () => <Phone ecran={EA} from={L[1] - 4} to={L[4] - 2} entree="zoom" sortie="recul" focus={[{ at: L[2] - 6, px: 0.5, py: 0.4, s: 1.06 }, { at: L[3] - 6, px: 0.5, py: 0.52, s: 1.08 }]}>
  <Surligne at={mot(/^haut/, 1)} {...ZP} fin={L[2] - 4} />
  <Surligne at={mot(/^cinq/, 2)} {...ZH} fin={L[3] - 4} />
  <Pastille at={mot(/^téléphone/, 2)} x={W * 0.5} y={H * 0.27} size={32}>Calculés sur ton téléphone</Pastille>
  <Surligne at={mot(/^question/, 3)} {...ZQ} />
</Phone>;

// ---------- 5 et 6. Les moments favorables, dépliés, avec leurs sources (pastilles copiées du contenu) ----------
const EM = "ecrans/moments";
const ZM = zone(EM, /^Moment favorable · de/);
const ZAp = englobe(zone(EM, /^Entre l’appel à la prière et l’iqâma$/), zone(EM, /^Au prochain appel/));
const ZPr = englobe(zone(EM, /^Pendant la prosternation$/), zone(EM, /^À chaque prière$/));
const Moments: React.FC = () => <Phone ecran={EM} from={L[4] - 4} to={L[6] - 2} entree="bascule" sortie="gauche" focus={[{ at: L[4] + 4, px: 0.5, py: 0.72, s: 1.08 }]}>
  <Surligne at={mot(/^moments/, 4)} {...ZM} fin={L[5] - 2} />
  <Surligne at={mot(/appel/, 5)} {...ZAp} />
  <Pastille at={mot(/appel/, 5) + 6} x={W * 0.5} y={H * 0.25} size={30}>{tx.appel.source}</Pastille>
  <Surligne at={mot(/^prosternation/, 5)} {...ZPr} />
  <Pastille at={mot(/^prosternation/, 5) + 6} x={W * 0.5} y={H * 0.31} size={30}>{tx.sujud.source}</Pastille>
</Phone>;

// ---------- 7. Les rappels avant la prière ----------
const ER = "ecrans/rappels";
const ZAv = englobe(zone(ER, /^Avant la prière$/), zone(ER, /^Fajr$/), zone(ER, /^ʿIchâ$/));
const ZMin = englobe(zone(ER, /^5 min avant$/), zone(ER, /^30 min avant$/));
const Rappels: React.FC = () => <Phone ecran={ER} from={L[6] - 4} to={L[7] - 2} entree="droite" sortie="traverse" focus={[{ at: L[6] + 6, px: 0.5, py: 0.58, s: 1.06 }]}>
  <Surligne at={mot(/^rappel/, 6)} {...ZAv} fin={mot(/^minutes/, 6) - 2} />
  <Surligne at={mot(/^minutes/, 6)} {...ZMin} />
</Phone>;

const SFX: Sfx[] = [
  ["pop", 6, 0.4], ["tick", 12, 0.3], ["tick", 18, 0.3], ["tick", 24, 0.3], ["tick", 30, 0.3], ["pop", mot(/^prière/) + 10, 0.55],
  ["whoosh", L[1] - 18, 0.45], ["impact", L[1] - 2, 0.4], ["tick", mot(/^haut/, 1) + 10, 0.4],
  ["tick", mot(/^cinq/, 2) + 10, 0.4], ["pop", mot(/^téléphone/, 2) + 14, 0.4],
  ["tap", mot(/^question/, 3) + 10, 0.4],
  ["whoosh", L[4] - 18, 0.45], ["tick", mot(/^moments/, 4) + 10, 0.4],
  ["pop", mot(/appel/, 5) + 12, 0.35], ["pop", mot(/^prosternation/, 5) + 14, 0.35],
  ["whoosh", L[6] - 18, 0.45], ["tick", mot(/^rappel/, 6) + 10, 0.35], ["ding", mot(/^minutes/, 6) + 12, 0.4],
  ["whoosh", L[7] - 18, 0.4], ["impact", L[7] - 2, 0.5], ["shimmer", mot(/^lien/, 7) + 12, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2], L[6], L[7], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Arc /></Scene>
    <Accueil />
    <Moments />
    <Rappels />
    <Scene from={L[7] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[7]} phrase="Chaque prière à son heure" /></Scene>
    <Flash at={L[1]} />
    <Voile />
    <SousTitres T={T} or={/^(prochaine|haut|cinq|ville|téléphone|question|favorables|appel|prosternation|rappel|Sabab|heure)/i} grandsDes={7} />
    <Son voix="fonction.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "fonction", component: Video, duree: T.DUREE };
