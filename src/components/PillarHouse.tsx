import { motion } from 'framer-motion';

/** Level 6: a small house of five pillars. Pillars rise (`risen`) and glow (`lit`); the roof settles on top, and can glow. */
export function PillarHouse({ risen, lit, roof, glow, size = 240 }: { risen: boolean[]; lit: boolean[]; roof: boolean; glow?: boolean; size?: number }) {
  const W = 240, H = 150;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={size} height={(size * H) / W} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }} aria-hidden>
      <defs>
        <radialGradient id="ph-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFF4D2" stopOpacity=".95" /><stop offset="1" stopColor="#E9CF8F" stopOpacity="0" /></radialGradient>
        <linearGradient id="ph-lit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F6E3B0" /><stop offset=".5" stopColor="#FFF8E4" /><stop offset="1" stopColor="#E9CF8F" /></linearGradient>
      </defs>
      {/* the base */}
      <rect x={16} y={128} width={208} height={10} rx={2} fill="#D9C7A4" />
      <rect x={26} y={120} width={188} height={9} rx={2} fill="#EFE4CC" stroke="#C9B48C" strokeWidth={1} />
      {/* five pillars */}
      {[0, 1, 2, 3, 4].map(i => {
        const x = 40 + i * 40;
        return (
          <g key={i}>
            <motion.ellipse cx={x} cy={80} rx={24} ry={48} fill="url(#ph-glow)" initial={false} animate={{ opacity: lit[i] ? 0.9 : 0 }} transition={{ duration: .8 }} />
            <motion.g initial={false} animate={{ scaleY: risen[i] ? 1 : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} style={{ originY: 1, transformBox: 'fill-box' }}>
              <rect x={x - 8} y={46} width={16} height={74} rx={3} fill={lit[i] ? 'url(#ph-lit)' : '#EFE4CC'} stroke={lit[i] ? '#C9A86A' : '#C9B48C'} strokeWidth={1.2} />
              <rect x={x - 12} y={42} width={24} height={6} rx={1.5} fill={lit[i] ? '#E9CF8F' : '#E0D1B0'} />
            </motion.g>
          </g>
        );
      })}
      {/* the roof settles once all five stand */}
      <motion.g initial={false} animate={{ y: roof ? 0 : -26, opacity: roof ? 1 : 0 }} transition={{ duration: 1, ease: 'easeOut' }}>
        {glow && <ellipse cx={120} cy={26} rx={120} ry={30} fill="url(#ph-glow)" />}
        <path d="M14 38 L120 6 L226 38 Z" fill={glow ? '#F6E3B0' : '#E6D6B4'} stroke="#C9A86A" strokeWidth={1.5} strokeLinejoin="round" />
        <rect x={18} y={36} width={204} height={8} rx={2} fill={glow ? '#EBD49A' : '#D9C7A4'} />
      </motion.g>
    </svg>
  );
}
