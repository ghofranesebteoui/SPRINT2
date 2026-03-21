import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';

// ── Exact palette from Landing / Login ────────────
const C = {
  navy:   '#1A3A6B',
  blue:   '#4D9FFF',
  blueB:  '#85BFFF',
  blueL:  '#EAF4FF',
  orange: '#FF6B35',
  green:  '#06D6A0',
  yellow: '#FFD60A',
  purple: '#7B2CBF',
};

const fadeUp = keyframes`
  from { opacity:0; transform:translateY(32px); }
  to   { opacity:1; transform:translateY(0);    }
`;
const popIn = keyframes`
  from { opacity:0; transform:scale(0.6) translateY(16px); }
  to   { opacity:1; transform:scale(1)   translateY(0);    }
`;

const ACCENT = {
  coral:        C.orange,
  mint:         C.green,
  lavender:     C.purple,
  peach:        C.yellow,
  'blue-dark':  C.blue,
  'blue-mid':   C.blueB,
  'blue-light': C.blueB,
  'blue-pale':  C.blueL,
};

export default function StatCard({ title, value, change, changeType, icon, iconBg = 'blue-dark', delay = 0 }) {
  const accent = ACCENT[iconBg] || C.blue;

  return (
    <Box sx={{
      borderRadius: '20px',
      background: '#fff',
      border: `1.5px solid ${C.blueL}`,
      p: '24px',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 2px 16px ${C.blue}0A`,
      animation: `${fadeUp} 0.55s ease-out ${delay}s both`,
      transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
      cursor: 'default',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&::before': {
        content: '""', position: 'absolute',
        top: 0, left: 0, right: 0, height: '4px',
        background: accent,
        borderRadius: '20px 20px 0 0',
      },
      '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: `0 16px 48px ${accent}28`,
        borderColor: `${accent}30`,
      },
      '&:hover .card-icon': { transform: 'rotate(6deg) scale(1.12)' },
    }}>
      <Box sx={{
        position: 'absolute', bottom: -24, right: -24,
        width: 110, height: 110, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
        <Typography sx={{
          color: '#8A9BB0', fontWeight: 700,
          fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.2px',
          maxWidth: 150, lineHeight: 1.5,
          minHeight: '2.1em',
        }}>{title}</Typography>

        <Box className="card-icon" sx={{
          width: 46, height: 46, borderRadius: '14px',
          background: `${accent}15`,
          border: `1.5px solid ${accent}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', flexShrink: 0,
          transition: 'transform 0.28s ease',
          animation: `${popIn} 0.5s ease-out ${delay + 0.12}s both`,
        }}>{icon}</Box>
      </Box>

      <Typography sx={{
        fontWeight: 900, color: C.navy, lineHeight: 1,
        fontSize: '2.1rem', letterSpacing: '-1.5px', mb: 1.5,
      }}>{value}</Typography>

      {change && (
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.5,
          px: 1.5, py: 0.4, borderRadius: '20px',
          background: changeType === 'positive' ? `${C.green}15` : '#FFF0F0',
          color:      changeType === 'positive' ? C.green          : '#EF4444',
          fontSize: '0.75rem', fontWeight: 700,
          border: `1px solid ${changeType === 'positive' ? C.green + '28' : '#FFCDD2'}`,
          mt: 'auto',
        }}>
          {changeType === 'positive' ? '↗' : '↘'} {change}
        </Box>
      )}
    </Box>
  );
}