// ---------------------------------------------------------------------------
// Brain Booster Kids — Adventure Map scenery
// Hand-crafted, self-contained SVG landmarks + terrain for every world, plus
// living ambient decor (birds, butterflies, drifting clouds, twinkling stars,
// volcano smoke, falling snow...). Creatures and props are rendered as web
// image artwork (Twemoji CDN) so scenes look identical on every device; each
// image falls back to the native emoji glyph offline, so the map still works
// without a network and stays light on low-end devices.
// ---------------------------------------------------------------------------
import React, { useState } from 'react'
import { World } from '../data/worlds'
import { Sprite } from '../assets/Sprite'
import { worldArtFor } from './art'
import { Terrain, terrainFor } from '../theme'

export type { Terrain }
export { terrainFor }

// --- tiny positioning helper -------------------------------------------------
function Spr({ x, y, w, cls, z, children }: { x: number; y: number; w: number; cls?: string; z?: number; children: React.ReactNode }) {
  // Creature/prop tokens become illustrated Asset Engine sprites (never raw
  // emoji); crafted SVG landmarks pass through untouched.
  const inner = typeof children === 'string' ? <Sprite token={children} size={w} /> : children
  return <span className={`spr ${cls || ''}`} style={{ left: `${x}%`, bottom: `${y}%`, width: w, fontSize: w * 0.9, zIndex: z }}>{inner}</span>
}

// --- crafted SVG landmark primitives ----------------------------------------
const Sun = () => (
  <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="11" fill="#ffd23e" /><g stroke="#ffd23e" strokeWidth="3" strokeLinecap="round">{Array.from({ length: 8 }, (_, i) => { const a = (i * 45) * Math.PI / 180; return <line key={i} x1={20 + Math.cos(a) * 14} y1={20 + Math.sin(a) * 14} x2={20 + Math.cos(a) * 18} y2={20 + Math.sin(a) * 18} /> })}</g></svg>
)
const Cloud = () => (
  <svg viewBox="0 0 64 34"><g fill="#ffffff"><ellipse cx="20" cy="22" rx="16" ry="12" /><ellipse cx="36" cy="16" rx="15" ry="14" /><ellipse cx="48" cy="24" rx="14" ry="10" /><rect x="8" y="22" width="46" height="11" rx="6" /></g></svg>
)
const Pine = ({ c = '#3f9d4e', s = '#2c7d3c' }) => (
  <svg viewBox="0 0 40 56"><rect x="17" y="42" width="6" height="12" rx="2" fill="#8a5a2b" /><polygon points="20,4 33,26 7,26" fill={c} /><polygon points="20,18 35,42 5,42" fill={s} /></svg>
)
const RoundTree = ({ c = '#5bb85f' }) => (
  <svg viewBox="0 0 40 48"><rect x="17" y="34" width="6" height="14" rx="2" fill="#8a5a2b" /><circle cx="20" cy="20" r="16" fill={c} /><circle cx="12" cy="26" r="10" fill={c} /><circle cx="28" cy="26" r="10" fill={c} /></svg>
)
const House = ({ roof = '#e0704e', wall = '#ffd9a0' }) => (
  <svg viewBox="0 0 48 44"><rect x="8" y="22" width="32" height="20" rx="2" fill={wall} /><polygon points="24,4 44,24 4,24" fill={roof} /><rect x="20" y="30" width="9" height="12" rx="1" fill="#7a4a28" /><rect x="12" y="26" width="7" height="7" fill="#8fd0ff" /></svg>
)
const Barn = () => (
  <svg viewBox="0 0 52 44"><rect x="8" y="20" width="36" height="22" fill="#d64c46" /><polygon points="26,4 46,20 6,20" fill="#b5382f" /><rect x="21" y="26" width="10" height="16" fill="#fff" /><path d="M21 26 h10 M26 26 v16" stroke="#d64c46" strokeWidth="2" /></svg>
)
const Palm = () => (
  <svg viewBox="0 0 48 60"><path d="M22 58 C20 40 22 28 24 22" stroke="#9a6b3a" strokeWidth="5" fill="none" strokeLinecap="round" /><g fill="#3fae63"><path d="M24 20 C10 12 4 16 2 22 C10 18 18 20 24 22Z" /><path d="M24 20 C38 12 44 16 46 22 C38 18 30 20 24 22Z" /><path d="M24 20 C16 8 20 2 24 0 C26 6 26 14 24 22Z" /><path d="M24 20 C34 10 42 10 46 12 C38 14 30 16 24 22Z" /></g><circle cx="24" cy="21" r="3" fill="#b5651d" /></svg>
)
const Mountain = ({ snow = true }) => (
  <svg viewBox="0 0 80 56"><polygon points="40,4 76,54 4,54" fill="#8a94b0" /><polygon points="40,4 56,26 24,26" fill={snow ? '#ffffff' : '#a9b2ca'} /><polygon points="40,4 50,18 30,18" fill="#eef2fb" opacity={snow ? 1 : 0} /></svg>
)
const Volcano = () => (
  <svg viewBox="0 0 90 64"><polygon points="45,8 84,60 6,60" fill="#5b4a52" /><polygon points="45,8 60,30 30,30" fill="#3e3138" /><path d="M32 12 h26 l-4 10 h-18 z" fill="#ff7a3c" /><path d="M34 12 q11 8 22 0 l-3 8 q-8 5 -16 0 z" fill="#ffd23e" /><path d="M30 30 q6 14 -2 26" stroke="#ff5a2c" strokeWidth="4" fill="none" strokeLinecap="round" /></svg>
)
const Castle = () => (
  <svg viewBox="0 0 90 76"><g fill="#c9bce8"><rect x="14" y="30" width="14" height="40" /><rect x="62" y="30" width="14" height="40" /><rect x="30" y="20" width="30" height="50" /></g><g fill="#8f7ad0"><rect x="14" y="24" width="14" height="8" /><rect x="62" y="24" width="14" height="8" /><rect x="30" y="14" width="30" height="8" /></g><polygon points="37,0 45,10 45,14 37,14" fill="#ff6fa5" /><polygon points="21,18 15,24 27,24" fill="#7a5cc8" /><polygon points="69,18 63,24 75,24" fill="#7a5cc8" /><rect x="40" y="46" width="10" height="24" rx="5" fill="#6a52a8" /><rect x="18" y="40" width="6" height="6" fill="#8fd0ff" /><rect x="66" y="40" width="6" height="6" fill="#8fd0ff" /></svg>
)
const Rocket = () => (
  <svg viewBox="0 0 34 60"><path d="M17 2 C26 12 26 30 24 42 H10 C8 30 8 12 17 2Z" fill="#f2f2f7" /><circle cx="17" cy="22" r="5" fill="#5ba8ff" stroke="#2a6fc0" strokeWidth="2" /><path d="M10 34 L2 46 L10 42Z" fill="#e5484d" /><path d="M24 34 L32 46 L24 42Z" fill="#e5484d" /><rect x="12" y="42" width="10" height="6" fill="#c0c0cc" /><path className="rocket-flame" d="M13 48 q4 12 8 0 q-4 6 -8 0Z" fill="#ffb43a" /></svg>
)
const Planet = ({ c = '#ff8fab', ring = '#ffd23e' }) => (
  <svg viewBox="0 0 60 48"><ellipse cx="30" cy="24" rx="26" ry="8" fill="none" stroke={ring} strokeWidth="4" opacity="0.9" /><circle cx="30" cy="22" r="15" fill={c} /><circle cx="24" cy="18" r="4" fill="#ffffff44" /></svg>
)
const Cactus = () => (
  <svg viewBox="0 0 40 52"><g fill="#4aa564"><rect x="16" y="14" width="8" height="38" rx="4" /><path d="M16 26 q-8 0 -8 -10 v-2 q4 0 4 4 v2 q0 2 4 2z" /><path d="M24 22 q8 0 8 -10 v-2 q-4 0 -4 4 v2 q0 2 -4 2z" /></g><g fill="#ffd23e"><circle cx="20" cy="12" r="2" /></g></svg>
)
const Bridge = () => (
  <svg viewBox="0 0 96 40"><path d="M4 30 Q48 6 92 30" fill="none" stroke="#a06a38" strokeWidth="5" /><g stroke="#c98a4e" strokeWidth="5">{Array.from({ length: 8 }, (_, i) => { const x = 10 + i * 11; const y = 30 - Math.max(0, 24 - Math.abs(48 - x) * 0.5); return <line key={i} x1={x} y1={y} x2={x} y2={y + 10} /> })}</g><path d="M4 40 L92 40" stroke="#8a5a2b" strokeWidth="3" /></svg>
)
const Igloo = () => (
  <svg viewBox="0 0 56 40"><path d="M4 38 A24 24 0 0 1 52 38 Z" fill="#eaf4ff" stroke="#c7ddf0" strokeWidth="2" /><path d="M20 38 a8 10 0 0 1 16 0 Z" fill="#a9c6e0" /><g stroke="#c7ddf0" strokeWidth="1.5" fill="none"><path d="M10 30 h36 M14 22 h28" /></g></svg>
)
const Waterfall = () => (
  <svg viewBox="0 0 30 80"><rect x="6" y="0" width="18" height="80" rx="6" fill="#bfe6ff" /><g className="fall" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"><line x1="11" y1="4" x2="11" y2="18" /><line x1="16" y1="10" x2="16" y2="26" /><line x1="20" y1="2" x2="20" y2="16" /></g><ellipse cx="15" cy="76" rx="12" ry="5" fill="#bfe6ff" /></svg>
)
const Rainbow = () => (
  <svg viewBox="0 0 80 44"><g fill="none" strokeWidth="5"><path d="M6 42 A34 34 0 0 1 74 42" stroke="#ff6b6b" /><path d="M12 42 A28 28 0 0 1 68 42" stroke="#ffb43a" /><path d="M18 42 A22 22 0 0 1 62 42" stroke="#ffe14d" /><path d="M24 42 A16 16 0 0 1 56 42" stroke="#4ecda5" /><path d="M30 42 A10 10 0 0 1 50 42" stroke="#5ba8ff" /></g></svg>
)
const Crater = ({ c = '#8b8ba0' }) => (
  <svg viewBox="0 0 40 24"><ellipse cx="20" cy="14" rx="18" ry="8" fill={c} /><ellipse cx="20" cy="12" rx="12" ry="5" fill="#00000022" /></svg>
)

// star-field used in space worlds
function StarField({ n = 16 }: { n?: number }) {
  const stars = Array.from({ length: n }, (_, i) => ({ x: (i * 61) % 96 + 2, y: (i * 37) % 92 + 4, s: 3 + (i % 3) * 2, d: (i % 5) * 0.4 }))
  return <>{stars.map((s, i) => <span key={i} className="twinkle" style={{ left: `${s.x}%`, bottom: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />)}</>
}

// --- per-world scene composition --------------------------------------------
function Scene({ kind }: { kind: Terrain }) {
  switch (kind) {
    case 'meadow': return (<>
      <Spr x={6} y={78} w={40} cls="drift">{<Cloud />}</Spr><Spr x={70} y={84} w={30} cls="drift2">{<Cloud />}</Spr>
      <Spr x={82} y={80} w={44}>{<Sun />}</Spr>
      <Spr x={4} y={4} w={54}>{<House />}</Spr><Spr x={84} y={6} w={50}>{<House roof="#5ba8ff" />}</Spr>
      <Spr x={16} y={38} w={40} cls="sway">{<RoundTree />}</Spr><Spr x={78} y={40} w={38} cls="sway2">{<RoundTree c="#4aa564" />}</Spr>
      <Spr x={40} y={2} w={22} cls="flit">🦋</Spr><Spr x={60} y={30} w={20} cls="flit2">🐦</Spr>
      <Spr x={8} y={20} w={18}>🌼</Spr><Spr x={90} y={26} w={18}>🌼</Spr><Spr x={24} y={8} w={16}>🍄</Spr>
    </>)
    case 'forest': return (<>
      <Spr x={8} y={80} w={34} cls="drift">{<Cloud />}</Spr>
      <Spr x={4} y={30} w={40} cls="sway">{<Pine />}</Spr><Spr x={16} y={12} w={46} cls="sway2">{<Pine c="#357f42" />}</Spr>
      <Spr x={82} y={28} w={42} cls="sway">{<Pine />}</Spr><Spr x={90} y={8} w={38} cls="sway2">{<Pine c="#357f42" />}</Spr>
      <Spr x={70} y={44} w={34} cls="sway">{<RoundTree c="#4aa564" />}</Spr>
      <Spr x={46} y={4} w={22} cls="flit">🦋</Spr><Spr x={34} y={30} w={20} cls="flit2">🐦</Spr>
      <Spr x={12} y={4} w={20}>🍄</Spr><Spr x={88} y={2} w={20}>🍄</Spr><Spr x={64} y={12} w={20}>🐿️</Spr>
      <Spr x={52} y={40} w={14} cls="spark">✨</Spr>
    </>)
    case 'farm': return (<>
      <Spr x={10} y={82} w={36} cls="drift">{<Cloud />}</Spr><Spr x={80} y={82} w={44}>{<Sun />}</Spr>
      <Spr x={72} y={8} w={56}>{<Barn />}</Spr>
      <Spr x={6} y={34} w={36} cls="sway">{<RoundTree c="#6ac06a" />}</Spr>
      <Spr x={10} y={6} w={18}>🌻</Spr><Spr x={22} y={8} w={16}>🌾</Spr><Spr x={34} y={6} w={16}>🌾</Spr>
      <Spr x={90} y={40} w={20} cls="flit2">🐦</Spr><Spr x={48} y={4} w={18}>🐔</Spr><Spr x={60} y={34} w={22} cls="flit">🦋</Spr>
    </>)
    case 'river': return (<>
      <span className="river-body" /><Spr x={78} y={6} w={30}>{<Waterfall />}</Spr>
      <Spr x={6} y={78} w={34} cls="drift">{<Cloud />}</Spr>
      <Spr x={4} y={34} w={38} cls="sway">{<Pine />}</Spr><Spr x={88} y={38} w={38} cls="sway2">{<RoundTree />}</Spr>
      <Spr x={44} y={26} w={70} z={3}>{<Bridge />}</Spr>
      <Spr x={20} y={10} w={20}>🌼</Spr><Spr x={64} y={54} w={20} cls="flit">🦋</Spr><Spr x={30} y={60} w={18} cls="flit2">🐦</Spr>
    </>)
    case 'island': return (<>
      <span className="sea-strip" />
      <Spr x={78} y={82} w={44}>{<Sun />}</Spr><Spr x={14} y={80} w={32} cls="drift">{<Cloud />}</Spr>
      <Spr x={10} y={22} w={46} cls="sway">{<Palm />}</Spr><Spr x={80} y={24} w={50} cls="sway2">{<Palm />}</Spr>
      <Spr x={44} y={20} w={40} cls="sway">{<Palm />}</Spr>
      <Spr x={30} y={8} w={18}>🐚</Spr><Spr x={60} y={6} w={16}>⭐</Spr><Spr x={50} y={50} w={20} cls="flit">🦋</Spr>
    </>)
    case 'sea': return (<>
      <span className="wave-lines" />
      <Spr x={30} y={40} w={40} cls="bob">🛶</Spr>
      <Spr x={12} y={20} w={24} cls="swim">🐠</Spr><Spr x={70} y={16} w={26} cls="swim2">🐟</Spr><Spr x={50} y={8} w={22} cls="swim">🐡</Spr>
      <Spr x={84} y={44} w={22} cls="swim2">🐬</Spr>
      <Spr x={20} y={6} w={12} cls="rise">🫧</Spr><Spr x={62} y={30} w={10} cls="rise2">🫧</Spr><Spr x={40} y={58} w={30} cls="drift">{<Cloud />}</Spr>
    </>)
    case 'volcano': return (<>
      <Spr x={40} y={12} w={90} z={2}>{<Volcano />}</Spr>
      <span className="smoke" style={{ left: '48%', bottom: '52%' }} /><span className="smoke smoke2" style={{ left: '52%', bottom: '54%' }} />
      <Spr x={8} y={10} w={30}>{<Crater c="#5b4a52" />}</Spr><Spr x={82} y={8} w={30}>{<Crater c="#5b4a52" />}</Spr>
      <Spr x={20} y={40} w={14} cls="spark">🔥</Spr><Spr x={74} y={44} w={14} cls="spark2">✨</Spr>
      <Spr x={12} y={70} w={30} cls="drift">{<Cloud />}</Spr>
    </>)
    case 'dino': return (<>
      <Spr x={8} y={80} w={34} cls="drift">{<Cloud />}</Spr>
      <Spr x={4} y={26} w={44} cls="sway">{<Pine c="#2f8f4a" />}</Spr><Spr x={86} y={28} w={44} cls="sway2">{<Pine c="#2f8f4a" />}</Spr>
      <Spr x={62} y={6} w={44} cls="bob">🦕</Spr><Spr x={20} y={8} w={36} cls="bob2">🦖</Spr>
      <Spr x={46} y={30} w={22}>🥚</Spr><Spr x={40} y={4} w={18}>🦴</Spr><Spr x={74} y={40} w={18} cls="flit2">🐦</Spr>
      <Spr x={30} y={40} w={16}>🌿</Spr>
    </>)
    case 'canyon': return (<>
      <span className="canyon-gorge" />
      <Spr x={44} y={30} w={78} z={3}>{<Bridge />}</Spr>
      <Spr x={4} y={40} w={40} cls="sway">{<Pine />}</Spr><Spr x={88} y={42} w={40} cls="sway2">{<Pine />}</Spr>
      <Spr x={78} y={82} w={44}>{<Sun />}</Spr><Spr x={16} y={80} w={32} cls="drift">{<Cloud />}</Spr>
      <Spr x={54} y={62} w={20} cls="flit">🦅</Spr><Spr x={24} y={16} w={16}>🪵</Spr>
    </>)
    case 'snow': return (<>
      <span className="snowfall" />
      <Spr x={8} y={30} w={70} z={1}>{<Mountain />}</Spr><Spr x={64} y={26} w={66} z={1}>{<Mountain />}</Spr>
      <Spr x={40} y={6} w={52}>{<Igloo />}</Spr>
      <Spr x={20} y={8} w={26} cls="bob">🐧</Spr><Spr x={70} y={8} w={24} cls="bob2">🐧</Spr>
      <Spr x={6} y={12} w={34} cls="sway">{<Pine c="#5f9e6a" s="#4a824f" />}</Spr>
      <Spr x={50} y={40} w={16} cls="spin">❄️</Spr><Spr x={84} y={40} w={14} cls="spin2">❄️</Spr>
    </>)
    case 'desert': return (<>
      <span className="dunes" /><Spr x={80} y={78} w={46}>{<Sun />}</Spr>
      <Spr x={8} y={16} w={40}>{<Cactus />}</Spr><Spr x={88} y={12} w={36}>{<Cactus />}</Spr>
      <Spr x={60} y={10} w={40} cls="bob">🐫</Spr>
      <Spr x={30} y={20} w={30}>🏺</Spr><Spr x={46} y={40} w={20} cls="flit2">🦅</Spr>
      <Spr x={22} y={64} w={30} cls="drift">{<Cloud />}</Spr>
    </>)
    case 'castle': return (<>
      <Spr x={38} y={16} w={92} z={2}>{<Castle />}</Spr>
      <Spr x={6} y={40} w={70}>{<Rainbow />}</Spr>
      <Spr x={80} y={78} w={38} cls="drift">{<Cloud />}</Spr><Spr x={12} y={80} w={34} cls="drift2">{<Cloud />}</Spr>
      <Spr x={20} y={14} w={16} cls="spark">✨</Spr><Spr x={84} y={20} w={16} cls="spark2">✨</Spr><Spr x={60} y={54} w={16} cls="spark">⭐</Spr>
      <Spr x={70} y={6} w={20} cls="flit">🦋</Spr>
    </>)
    case 'space': return (<>
      <StarField n={20} />
      <Spr x={70} y={62} w={58}>{<Planet c="#ff8fab" ring="#ffd23e" />}</Spr>
      <Spr x={14} y={24} w={34} cls="float">{<Rocket />}</Spr>
      <Spr x={78} y={20} w={40}>{<Planet c="#5ba8ff" ring="#c9bce8" />}</Spr>
      <Spr x={40} y={70} w={16} cls="spark">✨</Spr><Spr x={30} y={44} w={14} cls="spark2">⭐</Spr>
    </>)
    case 'moon': return (<>
      <StarField n={18} />
      <Spr x={6} y={4} w={44}>{<Crater />}</Spr><Spr x={40} y={2} w={54}>{<Crater c="#9a9ab0" />}</Spr><Spr x={78} y={6} w={40}>{<Crater />}</Spr>
      <Spr x={74} y={64} w={40}>{<Planet c="#5ba8ff" ring="#5ba8ff" />}</Spr>
      <Spr x={30} y={16} w={26} cls="float">👨‍🚀</Spr><Spr x={54} y={12} w={20}>🚩</Spr>
    </>)
    case 'galaxy': return (<>
      <StarField n={24} />
      <Spr x={64} y={54} w={62}>{<Planet c="#b07bff" ring="#ff8fab" />}</Spr>
      <Spr x={12} y={30} w={42}>{<Planet c="#ffd23e" ring="#5ba8ff" />}</Spr>
      <Spr x={40} y={72} w={22} cls="shoot">☄️</Spr>
      <Spr x={26} y={16} w={16} cls="spark">✨</Spr><Spr x={82} y={24} w={16} cls="spark2">✨</Spr><Spr x={50} y={40} w={16} cls="spark">🌟</Spr>
    </>)
  }
}

// Living decor kept on top of the AI-painted backdrops: creatures and weather
// only — the terrain and landmarks are already painted into the artwork.
function Ambient({ kind }: { kind: Terrain }) {
  switch (kind) {
    case 'meadow': return (<><Spr x={38} y={68} w={22} cls="flit">🦋</Spr><Spr x={72} y={44} w={20} cls="flit2">🐦</Spr><Spr x={14} y={22} w={16} cls="spark">✨</Spr></>)
    case 'forest': return (<><Spr x={46} y={60} w={22} cls="flit">🦋</Spr><Spr x={24} y={30} w={20} cls="flit2">🐦</Spr><Spr x={70} y={16} w={18} cls="bob">🐿️</Spr></>)
    case 'farm': return (<><Spr x={60} y={56} w={22} cls="flit">🦋</Spr><Spr x={30} y={12} w={20} cls="bob">🐔</Spr><Spr x={82} y={40} w={20} cls="flit2">🐦</Spr></>)
    case 'river': return (<><Spr x={40} y={20} w={22} cls="swim">🐸</Spr><Spr x={70} y={50} w={20} cls="flit">🦋</Spr><Spr x={20} y={62} w={18} cls="flit2">🐦</Spr></>)
    case 'island': return (<><Spr x={30} y={54} w={22} cls="flit">🦜</Spr><Spr x={68} y={20} w={20} cls="bob">🐒</Spr><Spr x={14} y={30} w={14} cls="spark">✨</Spr></>)
    case 'sea': return (<><Spr x={16} y={22} w={24} cls="swim">🐠</Spr><Spr x={66} y={14} w={24} cls="swim2">🐟</Spr><Spr x={40} y={40} w={12} cls="rise">🫧</Spr></>)
    case 'volcano': return (<><span className="smoke" style={{ left: '48%', bottom: '58%' }} /><span className="smoke smoke2" style={{ left: '54%', bottom: '60%' }} /><Spr x={22} y={30} w={14} cls="spark">🔥</Spr><Spr x={76} y={40} w={14} cls="spark2">✨</Spr></>)
    case 'dino': return (<><Spr x={64} y={12} w={34} cls="bob">🦕</Spr><Spr x={26} y={40} w={20} cls="flit">🦋</Spr><Spr x={80} y={54} w={18} cls="flit2">🐦</Spr></>)
    case 'canyon': return (<><Spr x={54} y={58} w={20} cls="flit">🦅</Spr><Spr x={24} y={26} w={14} cls="spark">✨</Spr></>)
    case 'snow': return (<><span className="snowfall" /><Spr x={26} y={12} w={24} cls="bob">🐧</Spr><Spr x={70} y={34} w={16} cls="spin">❄️</Spr></>)
    case 'desert': return (<><Spr x={62} y={14} w={30} cls="bob">🐫</Spr><Spr x={40} y={50} w={18} cls="flit2">🦅</Spr><Spr x={20} y={28} w={12} cls="spark">✨</Spr></>)
    case 'castle': return (<><Spr x={22} y={60} w={16} cls="spark">✨</Spr><Spr x={78} y={44} w={16} cls="spark2">✨</Spr><Spr x={54} y={20} w={20} cls="flit">🧚</Spr></>)
    case 'space': return (<><StarField n={14} /><Spr x={30} y={44} w={16} cls="spark2">⭐</Spr><Spr x={64} y={70} w={16} cls="spark">✨</Spr></>)
    case 'moon': return (<><StarField n={12} /><Spr x={32} y={20} w={24} cls="float">👨‍🚀</Spr></>)
    case 'galaxy': return (<><StarField n={16} /><Spr x={42} y={70} w={22} cls="shoot">☄️</Spr><Spr x={26} y={20} w={16} cls="spark">✨</Spr></>)
  }
}

export function WorldScene({ world, style }: { world: World; style: React.CSSProperties }) {
  const kind = terrainFor(world)
  // null = still loading, false = no artwork → fall back to the crafted scene
  const [artOk, setArtOk] = useState<boolean | null>(null)
  return (
    <div className={`scene scene-${kind} ${artOk ? 'has-art' : ''}`} style={style} aria-hidden="true">
      <img
        className="scene-art" src={worldArtFor(world)} alt="" draggable={false} loading="lazy"
        onLoad={() => setArtOk(true)} onError={() => setArtOk(false)}
      />
      {artOk ? <Ambient kind={kind} /> : <Scene kind={kind} />}
    </div>
  )
}
