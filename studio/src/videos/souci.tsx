// « Commente ton souci » : un enfant à protéger. La protection demandée pour les enfants (Hisn al-Muslim, hm-160 ; Al-Bukhârî 4/119).
// Textes religieux : public/voix/souci.textes.json (copiés par programme depuis content/citadelle.json · hm-160). Jamais de promesse : on demande, on se confie.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/souci.json";
import tx from "../../public/voix/souci.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const LIEN = mot(/^lien/, 8);

// ---------- 1. Le commentaire (exemple, sans nom) ----------
const Commentaire: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const b = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 170 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em", opacity: b }}>RÉPONSE À UN COMMENTAIRE</div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 400, padding: "44px 48px", borderRadius: 44, background: "#fff", boxShadow: "0 30px 90px rgba(0,0,0,0.5)", transform: `scale(${b}) rotate(${(1 - b) * -4}deg)`, transformOrigin: "10% 100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#E8DDE5", display: "grid", placeItems: "center" }}>
            <svg width={44} height={44} viewBox="0 0 24 24" fill={PLUM} opacity={0.5}><circle cx={12} cy={8} r={4.2} /><path d="M3.5 21c1.2-4.6 4.6-7 8.5-7s7.3 2.4 8.5 7z" /></svg>
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: "rgba(42,12,34,0.55)" }}>Un parent</div>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 64, lineHeight: 1.2, color: PLUM, marginTop: 24 }}>J’ai peur pour mon enfant, tout le temps.</div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 400 + 380, width: 0, height: 0, borderLeft: "34px solid transparent", borderRight: "34px solid transparent", borderTop: "56px solid #fff", transform: `scale(${b})` }} />
    </AbsoluteFill>
  );
};

// ---------- 2. Beaucoup de parents : des lueurs qui s’allument, « Tu n’es pas seul » ----------
const LUEURS = Array.from({ length: 34 }, (_, i) => ({ x: 120 + random("px" + i) * 840, y: 330 + random("py" + i) * 620, r: 10 + random("pr" + i) * 14 }));
const PasSeul: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t0 = mot(/^beaucoup/, 1), s = spring({ frame: f - mot(/^seul/, 1), fps, config: { damping: 10, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1200} style={{ position: "absolute", inset: 0 }}>
        {LUEURS.map((p, i) => {
          const k = spring({ frame: f - t0 - i * 1.2, fps, config: { damping: 12, stiffness: 160 } });
          return <circle key={i} cx={p.x} cy={p.y} r={p.r * k} fill={GOLD} opacity={0.35 + 0.5 * k * (0.6 + 0.4 * Math.sin(f / 8 + i))} style={{ filter: "drop-shadow(0 0 12px rgba(233,196,106,0.9))" }} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 96, color: "#fff", transform: `scale(${s})`, opacity: s, textShadow: "0 0 40px rgba(0,0,0,0.5)" }}>
        Tu n’es <span style={{ color: GOLD }}>pas seul</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. La Citadelle du musulman : le chapitre ----------
const Chapitre: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const l = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 110 } });
  const c = spring({ frame: f - mot(/^protection/, 2), fps, config: { damping: 10, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 230, top: 260, width: 460, height: 560, perspective: 1600, opacity: l }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "18px 40px 40px 18px", background: "linear-gradient(135deg,#5B1E47,#2A0C22)", boxShadow: `inset 18px 0 0 rgba(0,0,0,0.25), 0 0 0 4px ${GOLD}, 0 40px 100px rgba(0,0,0,0.5)`,
          transform: `rotateY(${(1 - l) * -70}deg)`, display: "grid", placeItems: "center", textAlign: "center", padding: 40 }}>
          <div>
            <StarP size={110} glow={20} />
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: GOLD, marginTop: 30, letterSpacing: "0.06em" }}>HISN AL-MUSLIM</div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: "rgba(255,255,255,0.85)", marginTop: 12 }}>La Citadelle du musulman</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 900, textAlign: "center", transform: `scale(${c})`, opacity: c }}>
        <span style={{ display: "inline-block", padding: "26px 44px", borderRadius: 36, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 56, lineHeight: 1.2, boxShadow: "0 0 60px rgba(233,196,106,0.6)" }}>{D.chapitre}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4 et 5. L’invocation entière (arabe, phonétique, traduction), puis sa source ----------
const Invocation: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[3], fps, config: { damping: 15, stiffness: 100 } });
  const b = interpolate(f, [L[3] + 16, L[3] + 34], [0, 1], C);
  const s = spring({ frame: f - L[4], fps, config: { damping: 10, stiffness: 180 } });
  const halo = 0.5 + 0.5 * Math.sin(f / 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 60, right: 60, top: 170, padding: "46px 40px 40px", borderRadius: 50, background: "rgba(42,12,34,0.92)", textAlign: "center", opacity: a, transform: `scale(${0.94 + 0.06 * a})`,
        boxShadow: `0 0 0 3px rgba(233,196,106,${0.5 + 0.3 * halo}), 0 0 ${40 + 40 * halo}px rgba(233,196,106,0.35), 0 40px 100px rgba(0,0,0,0.5)` }}>
        <div dir="rtl" lang="ar" style={{ fontFamily: AR, fontSize: 80, lineHeight: 1.8, color: GOLD, unicodeBidi: "plaintext", textShadow: "0 0 30px rgba(233,196,106,0.45)" }}>{D.ar}</div>
        <div style={{ fontFamily: FONT, fontStyle: "italic", fontSize: 38, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginTop: 14, opacity: b }}>{D.ph}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, lineHeight: 1.3, color: "#fff", marginTop: 20, opacity: b }}>{D.fr}</div>
        <div style={{ height: 76, marginTop: 24 }}>
          <span style={{ display: "inline-block", padding: "12px 36px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 42, transform: `scale(${s})` }}>{D.src}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. Pour eux : un bouclier doux autour d’une petite étoile ----------
const Bouclier: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const p = interpolate(f, [L[5], mot(/^eux/, 5) + 10], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const c = spring({ frame: f - mot(/^confies/, 5), fps, config: { damping: 12, stiffness: 120 } });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1100} style={{ position: "absolute", left: 0, top: 200, overflow: "visible" }}>
        <path d="M540 120 L800 220 V480 C800 660 680 780 540 840 C400 780 280 660 280 480 V220 Z" fill="rgba(42,12,34,0.6)" stroke={GOLD} strokeWidth={10} strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`}
          style={{ filter: `drop-shadow(0 0 ${20 + 30 * c}px rgba(233,196,106,0.7))` }} />
      </svg>
      <div style={{ position: "absolute", left: 540 - 90, top: 200 + 400, transform: `scale(${0.4 + 0.6 * p})` }}><StarP size={180} glow={20 + 30 * c} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 70, color: GOLD, opacity: c, transform: `translateY(${(1 - c) * 30}px)` }}>tu te confies à Allah</div>
    </AbsoluteFill>
  );
};

// ---------- 7. Dans Sabab : la fiche entière ----------
const EF = "ecrans/fiche-enfants";
const ZT = zone(EF, /^La protection demandée pour les enfants$/, 1), ZB = zone(EF, /^Apprendre par cœur$/);
const Fiche: React.FC = () => <Phone ecran={EF} from={L[6] - 4} to={L[7] - 2} entree="bas" sortie="gauche" focus={[{ at: L[6] + 8, px: 0.5, py: 0.45, s: 1.06 }]}>
  <Surligne at={mot(/^bibliothèque/, 6)} {...ZT} fin={mot(/apprends/, 6) - 2} />
  <Surligne at={mot(/apprends/, 6)} {...ZB} />
</Phone>;

// ---------- 8. La communauté : déposer un souhait, sans nom ----------
const EC = "ecrans/communaute-accueil";
const ZD = zone(EC, /^\+ Déposer un souhait$/), ZN = zone(EC, /^Invoquer les uns pour les autres/);
const Communaute: React.FC = () => <Phone ecran={EC} from={L[7] - 4} to={L[8] - 2} entree="droite" sortie="traverse" focus={[{ at: L[7] + 8, px: 0.5, py: 0.5, s: 1.05 }]}>
  <Surligne at={mot(/^souhait/, 7)} {...ZD} fin={mot(/^communauté/, 7) + 20} />
  <Surligne at={mot(/^nom/, 7) - 4} {...ZN} />
  <Pastille at={mot(/^nom/, 7) + 4} x={W * 0.5} y={H * 0.85} gold>Sans ton nom</Pastille>
</Phone>;

const SFX: Sfx[] = [
  ["message", 2, 0.5], ["pop", 10, 0.4],
  ["whoosh", L[1] - 18, 0.4], ["shimmer", mot(/^beaucoup/, 1) + 4, 0.35], ["pop", mot(/^seul/, 1) + 10, 0.45],
  ["whoosh", L[2] - 18, 0.45], ["tick", L[2] + 14, 0.35], ["pop", mot(/^protection/, 2) + 12, 0.45],
  ["shimmer", L[3] - 8, 0.4],
  ["pop", L[4] + 14, 0.3],
  ["whoosh", L[5] - 18, 0.4], ["shimmer", mot(/^confies/, 5) + 10, 0.35],
  ["whoosh", L[6] - 18, 0.45], ["tick", mot(/^bibliothèque/, 6) + 12, 0.35], ["tap", mot(/apprends/, 6) + 14, 0.4],
  ["whoosh", L[7] - 18, 0.45], ["tick", mot(/^souhait/, 7) + 12, 0.35], ["ding", mot(/^nom/, 7) + 10, 0.4],
  ["whoosh", L[8] - 18, 0.4], ["impact", L[8] - 2, 0.5], ["shimmer", LIEN + 14, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[3], L[6], L[8], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Commentaire /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><PasSeul /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Chapitre /></Scene>
    <Scene from={L[3] - 4} to={L[5] - 2}><Invocation /></Scene>
    <Scene from={L[5] - 4} to={L[6] - 4}><Bouclier /></Scene>
    <Fiche />
    <Communaute />
    <Scene from={L[8] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[8]} phrase="Le lien est en bio" /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(peur|enfant|seul|Citadelle|protection|enfants|Allah|Al-Bukhârî|eux|confies|bibliothèque|cœur|souhait|nom|Sabab)/i} grandsDes={99} />
    <Son voix="souci.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "souci", component: Video, duree: T.DUREE };
