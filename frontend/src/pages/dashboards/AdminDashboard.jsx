import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Paper,
  Dialog, DialogTitle, DialogContent, IconButton,
  Snackbar, Alert, CircularProgress,
} from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Close, ArrowForward } from '@mui/icons-material';
import { keyframes } from '@mui/material';
import StatCard from '../../components/Dashboard/StatCard';
import config from '../../config';
import api from '../../services/api';

// ── EXACT palette from Landing + Login ────────────
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

// ── EXACT keyframes from Landing ──────────────────
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(32px); }
  to   { opacity:1; transform:translateY(0);    }
`;
const floatY = keyframes`
  0%,100% { transform:translateY(0px);  }
  50%      { transform:translateY(-16px);}
`;
const spinCW = keyframes`
  from { transform:rotate(0deg);   }
  to   { transform:rotate(360deg); }
`;
const shimmer = keyframes`
  0%   { background-position:0% 50%;   }
  50%  { background-position:100% 50%; }
  100% { background-position:0% 50%;   }
`;
const popIn = keyframes`
  from { opacity:0; transform:scale(0.6) translateY(16px); }
  to   { opacity:1; transform:scale(1)   translateY(0);    }
`;
const slideLeft = keyframes`
  from { opacity:0; transform:translateX(-24px); }
  to   { opacity:1; transform:translateX(0);     }
`;
const floatEmoji = keyframes`
  0%,100% { transform:translateY(0px) rotate(0deg); }
  50%      { transform:translateY(-5px) rotate(8deg); }
`;
const pulseGlow = keyframes`
  0%,100% { opacity:0.6; transform:scale(1); }
  50%      { opacity:1;   transform:scale(1.08); }
`;
const slideRight = keyframes`
  from { opacity:0; transform:translateX(16px); }
  to   { opacity:1; transform:translateX(0); }
`;
const gradMove = keyframes`
  0%   { background-position:0% 50%; }
  50%  { background-position:100% 50%; }
  100% { background-position:0% 50%; }
`;
const blinkDot = keyframes`
  0%,100% { opacity:1; } 50% { opacity:0.25; }
`;

// ── SHARED HELPERS ────────────────────────────────
const featureCardSx = (delay, accent) => ({
  borderRadius: '20px', background: '#fff',
  border: `1.5px solid ${C.blueL}`,
  boxShadow: `0 2px 16px ${C.blue}0A`,
  animation: `${fadeUp} 0.55s ease-out ${delay}s both`,
  transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
  position: 'relative', overflow: 'hidden',
  '&::before': {
    content: '""', position: 'absolute',
    top: 0, left: 0, right: 0, height: '4px',
    background: accent,
    borderRadius: '20px 20px 0 0',
  },
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: `0 16px 48px ${accent}22`,
    borderColor: `${accent}30`,
  },
});

const thSx = {
  fontWeight: 700, fontSize: '0.7rem',
  textTransform: 'uppercase', letterSpacing: '1.2px',
  background: C.blueL, color: '#8A9BB0',
  borderBottom: `2px solid ${C.blue}18`,
  py: 1.5,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: '#fff', border: `1.5px solid ${C.blueL}`,
      borderRadius: '14px', px: 2.5, py: 1.5,
      boxShadow: `0 8px 32px ${C.blue}18`,
    }}>
      <Typography sx={{ fontSize: '0.75rem', color: '#8A9BB0', mb: 0.3 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 900, color: C.blue, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
        {payload[0].value}%
      </Typography>
    </Box>
  );
};

// ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hovCard,    setHovCard]    = useState(null);
  const [hovRow,     setHovRow]     = useState(null);
  const [sending,    setSending]    = useState(false);
  const [snackbar,   setSnackbar]   = useState({ open: false, message: '', severity: 'success' });
  const [userStats,  setUserStats]  = useState({
    RECTEUR: 0,
    DIRECTEUR: 0,
    ENSEIGNANT: 0,
    ETUDIANT: 0,
    total: 0
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await api.get('/users/stats');
      const stats = {
        RECTEUR: 0,
        DIRECTEUR: 0,
        ENSEIGNANT: 0,
        ETUDIANT: 0,
        total: res.data.total || 0
      };
      
      if (res.data.byRole) {
        res.data.byRole.forEach(role => {
          stats[role.type_utilisateur] = parseInt(role.count) || 0;
        });
      }
      
      setUserStats(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
    }
  };

  const handleSendInvitations = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/invitations/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSnackbar({
        open: true,
        message: data.success ? `✅ ${data.message} (${data.sent}/${data.total})` : `❌ ${data.message}`,
        severity: data.success ? 'success' : 'error'
      });
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Erreur lors de l\'envoi des invitations', severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  const userTypes = [
    {
      role: 'RECTEUR',    label: 'Recteurs',    emoji: '👨‍💼', color: C.orange,
      count: userStats.RECTEUR.toString(),        desc: "Supervisent les universités et pilotent la stratégie académique nationale.",
      badge: `${userStats.RECTEUR} actifs`, stat: '98% connexion', statIcon: '📶',
    },
    {
      role: 'DIRECTEUR',  label: 'Directeurs',  emoji: '👨‍💼', color: C.purple,
      count: userStats.DIRECTEUR.toString(),        desc: "Gèrent les établissements et coordonnent les équipes pédagogiques.",
      badge: `${userStats.DIRECTEUR} actifs`, stat: '94% connexion', statIcon: '📶',
    },
    {
      role: 'ENSEIGNANT', label: 'Enseignants', emoji: '👨‍🏫', color: C.blue,
      count: userStats.ENSEIGNANT.toString(),     desc: "Dispensent les cours et suivent les performances de leurs étudiants.",
      badge: `${userStats.ENSEIGNANT} inscrits`, stat: '89% actifs', statIcon: '✅',
    },
    {
      role: 'ETUDIANT',   label: 'Étudiants',   emoji: '👨‍🎓', color: C.green,
      count: userStats.ETUDIANT.toString(),      desc: "Suivent leurs cursus et progressent grâce aux outils d'analyse IA.",
      badge: `${userStats.ETUDIANT} inscrits`, stat: 'Taux 76.8%', statIcon: '📊',
    },
  ];

  const performanceData = [
    { year: '2021', taux: 72   },
    { year: '2022', taux: 74.5 },
    { year: '2023', taux: 76   },
    { year: '2024', taux: 76.8 },
    { year: '2025', taux: 78.5 },
  ];

  const etablissements = [
    { code: 'UT-001',       nom: 'Université de Tunis',          type: 'Université', effectif: 45200, taux: 78, statut: 'excellent' },
    { code: 'UTM-002',      nom: 'Université de Tunis El Manar', type: 'Université', effectif: 38500, taux: 76, statut: 'bon'       },
    { code: 'UC-003',       nom: 'Université de Carthage',       type: 'Université', effectif: 32100, taux: 74, statut: 'bon'       },
    { code: 'UM-004',       nom: 'Université de la Manouba',     type: 'Université', effectif: 28900, taux: 72, statut: 'bon'       },
    { code: 'ISET-RAD-015', nom: 'ISET de Radès',                type: 'ISET',       effectif: 2800,  taux: 68, statut: 'risque'    },
  ];

  const alertes = [
    { type: 'danger',  etablissement: 'Université de Sfax — Filière Informatique', message: 'Taux de réussite : 52% (−12% vs moyenne)' },
    { type: 'warning', etablissement: 'ISET de Sousse — DUT Génie Civil',          message: "Taux d'absentéisme : 31%"                 },
    { type: 'warning', etablissement: 'Faculté de Droit de Tunis — L1',            message: 'Baisse de performance : −7%'              },
  ];

  const statutColor = (s) => ({
    excellent: { label: 'Excellent', bg: `${C.green}15`,  color: C.green  },
    bon:       { label: 'Bon',       bg: `${C.blue}15`,   color: C.blue   },
    risque:    { label: 'À risque',  bg: `${C.orange}15`, color: C.orange },
  }[s] || { label: s, bg: C.blueL, color: C.navy });

  return (
    <Box>

      {/* ══ HEADER ═════════════════════════════ */}
      <Box sx={{
        mb: 4, display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 2,
        animation: `${slideLeft} 0.5s ease-out`,
      }}>
        <Box>
          <Typography sx={{ fontWeight: 900, color: C.navy, fontSize: '1.65rem', letterSpacing: '-1px', mb: 0.3 }}>
            Vue d'ensemble nationale
          </Typography>
          <Typography sx={{ color: '#8A9BB0', fontSize: '0.88rem' }}>
            Ministère de l'Enseignement Supérieur — Tunisie 🇹🇳
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<span>👨‍💼</span>}
            onClick={() => setDialogOpen(true)}
            sx={{
              px: 3, py: 1.3, borderRadius: '14px', fontWeight: 800, fontSize: '0.88rem',
              color: '#fff', textTransform: 'none',
              background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
              boxShadow: '0 6px 24px rgba(74,144,226,0.35)',
              position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease',
              '&::after': { content: '""', position: 'absolute', top: '-50%', left: '-70%', width: '40%', height: '200%', background: 'rgba(255,255,255,0.18)', transform: 'skewX(-22deg)', transition: 'left 0.5s ease' },
              '&:hover': { 
                background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                transform: 'translateY(-2px)', 
                boxShadow: '0 10px 32px rgba(74,144,226,0.45)' 
              },
              '&:hover::after': { left: '130%' },
            }}>
            Gestion des utilisateurs
          </Button>
          <Button variant="contained" startIcon={<span>✉️</span>}
            onClick={handleSendInvitations} disabled={sending}
            sx={{
              px: 3, py: 1.3, borderRadius: '14px', fontWeight: 800, fontSize: '0.88rem',
              color: '#fff', textTransform: 'none',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 6px 24px rgba(16,185,129,0.35)',
              position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease',
              '&::after': { content: '""', position: 'absolute', top: '-50%', left: '-70%', width: '40%', height: '200%', background: 'rgba(255,255,255,0.18)', transform: 'skewX(-22deg)', transition: 'left 0.5s ease' },
              '&:hover': { 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                transform: 'translateY(-2px)', 
                boxShadow: '0 10px 32px rgba(16,185,129,0.45)' 
              },
              '&:hover::after': { left: '130%' },
              '&:disabled': { background: 'linear-gradient(135deg, #10B98180 0%, #05966980 100%)', boxShadow: 'none' },
            }}>
            {sending ? <CircularProgress size={20} sx={{ color: '#fff', mr: 1 }} /> : null}
            {sending ? 'Envoi en cours...' : 'Envoyer Invitations'}
          </Button>
          <Button variant="contained" startIcon={<span>📋</span>}
            onClick={() => navigate('/dashboard/admin/demandes-acces')}
            sx={{
              px: 3, py: 1.3, borderRadius: '14px', fontWeight: 800, fontSize: '0.88rem',
              color: '#fff', textTransform: 'none',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 6px 24px rgba(245,158,11,0.35)',
              position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease',
              '&::after': { content: '""', position: 'absolute', top: '-50%', left: '-70%', width: '40%', height: '200%', background: 'rgba(255,255,255,0.18)', transform: 'skewX(-22deg)', transition: 'left 0.5s ease' },
              '&:hover': { 
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                transform: 'translateY(-2px)', 
                boxShadow: '0 10px 32px rgba(245,158,11,0.45)' 
              },
              '&:hover::after': { left: '130%' },
            }}>
            Demandes d'accès
          </Button>
        </Box>
      </Box>

      {/* ══ STAT CARDS ══════════════════════════ */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { title: 'Taux de réussite national', value: '76.8%', change: '+2.1% vs année précédente', changeType: 'positive', icon: '📈', iconBg: 'coral',    delay: 0    },
          { title: 'Universités publiques',      value: '13',    change: '+1 nouvelle université',    changeType: 'positive', icon: '🏫', iconBg: 'mint',     delay: 0.08 },
          { title: 'Étudiants inscrits',         value: '285K',  change: "+6.3% vs l'an dernier",    changeType: 'positive', icon: '👥', iconBg: 'lavender', delay: 0.16 },
          { title: 'Budget MESRS',               value: '2.4 Mds', change: "+5.8% d'augmentation",  changeType: 'positive', icon: '💰', iconBg: 'peach',    delay: 0.24 },
        ].map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* ══ GRAPH + CARTE GÉOGRAPHIQUE ═══════════ */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Évolution du taux de réussite */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ ...featureCardSx(0.1, C.blue), height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: C.navy, fontSize: '1rem', mb: 0.2 }}>
                    📈 Évolution du taux de réussite national
                  </Typography>
                  <Typography sx={{ color: '#8A9BB0', fontSize: '0.78rem' }}>Sur les 5 dernières années</Typography>
                </Box>
                <Typography sx={{ color: C.blue, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.7 } }}>
                  Voir détails →
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.blue} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={C.blue} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.blueL} />
                  <XAxis dataKey="year" stroke="#C8D8E8" tick={{ fontSize: 12, fill: '#8A9BB0' }} />
                  <YAxis stroke="#C8D8E8" domain={[70, 80]} tick={{ fontSize: 12, fill: '#8A9BB0' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="taux" name="Taux de réussite (%)"
                    stroke={C.blue} strokeWidth={2.5} fill="url(#areaGrad)"
                    dot={{ fill: '#fff', stroke: C.blue, strokeWidth: 2.5, r: 5 }}
                    activeDot={{ r: 7, fill: C.blue, stroke: '#fff', strokeWidth: 2.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte géographique */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ ...featureCardSx(0.12, C.green), height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: C.navy, fontSize: '1rem', mb: 0.2 }}>
                🗺️ Carte géographique des performances
              </Typography>
              <Typography sx={{ color: '#8A9BB0', fontSize: '0.78rem' }}>Répartition par région</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[
                { label: 'Excellent', color: C.green },
                { label: 'Bon', color: C.blue },
                { label: 'À risque', color: C.orange },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: item.color }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#8A9BB0', fontWeight: 600 }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Carte simplifiée de la Tunisie avec régions */}
          <Box sx={{ 
            position: 'relative',
            height: 400,
            background: `linear-gradient(135deg, ${C.blueL} 0%, #F0F9FF 100%)`,
            borderRadius: '16px',
            border: `1.5px solid ${C.blue}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {/* Grille de fond */}
            <Box sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(${C.blue}08 1px, transparent 1px),
                linear-gradient(90deg, ${C.blue}08 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }} />

            {/* Régions de Tunisie (représentation simplifiée) */}
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 600, height: '100%', p: 4 }}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                {[
                  { nom: 'Tunis', taux: 78, x: '50%', y: '20%', color: C.green },
                  { nom: 'Ariana', taux: 76, x: '55%', y: '18%', color: C.green },
                  { nom: 'Ben Arous', taux: 75, x: '52%', y: '25%', color: C.blue },
                  { nom: 'Manouba', taux: 74, x: '45%', y: '22%', color: C.blue },
                  { nom: 'Nabeul', taux: 73, x: '65%', y: '28%', color: C.blue },
                  { nom: 'Sousse', taux: 72, x: '60%', y: '45%', color: C.blue },
                  { nom: 'Monastir', taux: 71, x: '62%', y: '50%', color: C.blue },
                  { nom: 'Sfax', taux: 68, x: '58%', y: '65%', color: C.orange },
                  { nom: 'Kairouan', taux: 67, x: '48%', y: '48%', color: C.orange },
                  { nom: 'Gabès', taux: 65, x: '55%', y: '80%', color: C.orange },
                ].map((region, i) => (
                  <Box key={i} sx={{
                    position: 'absolute',
                    left: region.x,
                    top: region.y,
                    transform: 'translate(-50%, -50%)',
                    animation: `${popIn} 0.5s ease-out ${0.3 + i * 0.05}s both`,
                  }}>
                    {/* Point sur la carte */}
                    <Box sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: region.color,
                      border: '3px solid #fff',
                      boxShadow: `0 4px 12px ${region.color}40`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.5)',
                        boxShadow: `0 6px 20px ${region.color}60`,
                      },
                      '&:hover + .region-tooltip': {
                        opacity: 1,
                        visibility: 'visible',
                      },
                    }} />
                    
                    {/* Tooltip */}
                    <Box className="region-tooltip" sx={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      mb: 1,
                      background: '#fff',
                      border: `1.5px solid ${C.blueL}`,
                      borderRadius: '12px',
                      px: 2,
                      py: 1.5,
                      boxShadow: `0 8px 24px ${C.blue}18`,
                      opacity: 0,
                      visibility: 'hidden',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: `6px solid ${C.blueL}`,
                      },
                    }}>
                      <Typography sx={{ fontWeight: 700, color: C.navy, fontSize: '0.85rem', mb: 0.3 }}>
                        {region.nom}
                      </Typography>
                      <Typography sx={{ color: '#8A9BB0', fontSize: '0.75rem' }}>
                        Taux: <Box component="span" sx={{ fontWeight: 700, color: region.color }}>{region.taux}%</Box>
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ══ ALERTES ══════════════════════════════ */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ ...featureCardSx(0.15, C.orange), height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '1.3rem' }}>⚠️</Typography>
                    <Typography sx={{ fontWeight: 800, color: C.navy, fontSize: '1.1rem' }}>
                      Alertes établissements
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#A0B0C0', fontSize: '0.8rem', fontWeight: 500 }}>
                    Nécessitent une attention immédiate
                  </Typography>
                </Box>
                <Chip 
                  label="5 alertes" 
                  size="small" 
                  sx={{ 
                    background: `${C.orange}15`, 
                    color: C.orange, 
                    fontWeight: 700, 
                    fontSize: '0.72rem', 
                    border: `1px solid ${C.orange}28`,
                    borderRadius: '10px',
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { 
                    etablissement: 'Université de Sfax - Filière Informatique', 
                    message: 'Taux de réussite: 52%', 
                    detail: '(-12% vs moyenne)', 
                    color: '#EF4444', 
                    icon: '⚠️',
                    bgColor: '#FEF2F2',
                  },
                  { 
                    etablissement: 'ISET de Sousse - DUT Génie Civil', 
                    message: "Taux d'absentéisme: 31%", 
                    detail: '', 
                    color: C.orange, 
                    icon: '⚡',
                    bgColor: '#FFF7ED',
                  },
                  { 
                    etablissement: 'Faculté de Droit de Tunis - L1', 
                    message: 'Baisse de performance:', 
                    detail: '-7%', 
                    color: C.yellow, 
                    icon: '📉',
                    bgColor: '#FEFCE8',
                  },
                ].map((a, i) => (
                  <Box key={i} sx={{
                    position: 'relative',
                    background: a.bgColor,
                    borderRadius: '16px',
                    p: 2.5,
                    pl: 3,
                    animation: `${slideLeft} 0.45s ease-out ${0.2 + i * 0.1}s both`,
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: a.color,
                      borderRadius: '16px 0 0 16px',
                    },
                    '&:hover': { 
                      transform: 'translateX(5px)', 
                      boxShadow: `0 4px 18px ${a.color}22`,
                    },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Icon */}
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: `${a.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0,
                      }}>
                        {a.icon}
                      </Box>
                      
                      {/* Content */}
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ 
                          fontWeight: 700, 
                          color: C.navy, 
                          fontSize: '0.95rem', 
                          mb: 0.5,
                          lineHeight: 1.3,
                        }}>
                          {a.etablissement}
                        </Typography>
                        <Typography sx={{ 
                          color: '#8A9BB0', 
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                        }}>
                          {a.message} {a.detail && <Box component="span" sx={{ color: '#6B7280', fontWeight: 600 }}>{a.detail}</Box>}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ══ TOP ÉTABLISSEMENTS ═══════════════════ */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ ...featureCardSx(0.2, C.green), height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '1.3rem' }}>🏆</Typography>
                    <Typography sx={{ fontWeight: 800, color: C.navy, fontSize: '1.1rem' }}>
                      Top établissements
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#A0B0C0', fontSize: '0.8rem', fontWeight: 500 }}>
                    Meilleurs taux de réussite
                  </Typography>
                </Box>
                <Typography sx={{ 
                  color: C.blue, fontWeight: 700, fontSize: '0.85rem', 
                  cursor: 'pointer', transition: 'opacity 0.2s', 
                  '&:hover': { opacity: 0.7 } 
                }}>
                  Voir tout →
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Header */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '60px 1fr 100px 140px',
                  gap: 2,
                  pb: 1.5,
                  mb: 1.5,
                  borderBottom: `1px solid ${C.blueL}`,
                }}>
                  <Typography sx={{ 
                    color: '#A0B0C0', fontWeight: 700, 
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.2px' 
                  }}>#</Typography>
                  <Typography sx={{ 
                    color: '#A0B0C0', fontWeight: 700, 
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.2px' 
                  }}>Établissement</Typography>
                  <Typography sx={{ 
                    color: '#A0B0C0', fontWeight: 700, 
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.2px' 
                  }}>Taux</Typography>
                  <Typography sx={{ 
                    color: '#A0B0C0', fontWeight: 700, 
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.2px' 
                  }}>Statut</Typography>
                </Box>

                {/* Rows */}
                {[
                  { nom: 'Univ. Tunis El Manar', taux: '82%', statut: 'excellent', rank: 1 },
                  { nom: 'Univ. de Carthage',    taux: '79%', statut: 'bon',       rank: 2 },
                  { nom: 'Univ. de Sfax',        taux: '77%', statut: 'bon',       rank: 3 },
                  { nom: 'Univ. de la Manouba',  taux: '74%', statut: 'bon',       rank: 4 },
                ].map((row, i) => {
                  const s = statutColor(row.statut);
                  const rankBg = i === 0 ? `${C.yellow}20` : `${C.blueL}`;
                  const rankColor = i === 0 ? C.yellow : '#A0B0C0';
                  
                  return (
                    <Box key={row.nom} sx={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 100px 140px',
                      gap: 2,
                      alignItems: 'center',
                      py: 2,
                      borderBottom: i < 3 ? `1px solid ${C.blueL}` : 'none',
                      transition: 'background 0.2s',
                      animation: `${fadeUp} 0.4s ease-out ${0.25 + i * 0.07}s both`,
                      '&:hover': { background: C.blueL },
                    }}>
                      {/* Rank */}
                      <Box sx={{
                        width: 40, height: 40,
                        borderRadius: '12px',
                        background: rankBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1rem',
                        color: rankColor,
                      }}>
                        {row.rank}
                      </Box>

                      {/* Name */}
                      <Typography sx={{ 
                        fontWeight: 600, color: C.navy, fontSize: '0.9rem' 
                      }}>
                        {row.nom}
                      </Typography>

                      {/* Taux */}
                      <Typography sx={{ 
                        fontWeight: 900, color: C.navy, fontSize: '1rem' 
                      }}>
                        {row.taux}
                      </Typography>

                      {/* Statut */}
                      <Chip 
                        label={s.label} 
                        size="small" 
                        sx={{ 
                          background: s.bg, 
                          color: s.color, 
                          fontWeight: 700, 
                          fontSize: '0.75rem', 
                          border: `1px solid ${s.color}28`,
                          borderRadius: '10px',
                        }} 
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ══ TABLE COMPLÈTE ═══════════════════════ */}
        <Grid item xs={12}>
          <Card sx={featureCardSx(0.25, C.purple)}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '1.3rem' }}>🏫</Typography>
                  <Typography sx={{ fontWeight: 800, color: C.navy, fontSize: '1.1rem' }}>
                    Tous les établissements
                  </Typography>
                </Box>
                <Button 
                  size="small"
                  startIcon={<span>📤</span>}
                  sx={{
                    borderRadius: '10px', 
                    textTransform: 'none', 
                    fontWeight: 700, 
                    fontSize: '0.8rem',
                    color: C.blue,
                    border: `1.5px solid ${C.blueL}`,
                    px: 2,
                    py: 0.8,
                    transition: 'all 0.22s ease',
                    '&:hover': { 
                      background: C.blueL, 
                      borderColor: C.blue,
                    },
                  }}
                >
                  Exporter
                </Button>
              </Box>

              <Box sx={{ 
                background: '#FAFBFC',
                borderRadius: '16px',
                border: `1px solid ${C.blueL}`,
                overflow: 'hidden',
              }}>
                {/* Header */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '100px 1fr 120px 100px 140px 120px 100px',
                  gap: 2,
                  px: 3,
                  py: 2,
                  background: C.blueL,
                  borderBottom: `1px solid ${C.blue}20`,
                }}>
                  {['Code', 'Nom', 'Type', 'Effectif', 'Taux réussite', 'Statut', 'Actions'].map(h => (
                    <Typography key={h} sx={{ 
                      color: '#8A9BB0', 
                      fontWeight: 700, 
                      fontSize: '0.7rem', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1.2px' 
                    }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {/* Rows */}
                {etablissements.map((etab, i) => {
                  const s = statutColor(etab.statut);
                  const progressWidth = ((etab.taux - 60) / 25) * 100;
                  const progressColor = etab.taux >= 75 ? C.green : etab.taux >= 70 ? C.blue : C.orange;
                  
                  return (
                    <Box key={etab.code}
                      onMouseEnter={() => setHovRow(i)}
                      onMouseLeave={() => setHovRow(null)}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr 120px 100px 140px 120px 100px',
                        gap: 2,
                        alignItems: 'center',
                        px: 3,
                        py: 2.5,
                        background: hovRow === i ? '#fff' : 'transparent',
                        borderBottom: i < etablissements.length - 1 ? `1px solid ${C.blueL}` : 'none',
                        transition: 'all 0.2s ease',
                        animation: `${fadeUp} 0.4s ease-out ${0.3 + i * 0.06}s both`,
                        '&:hover': {
                          background: '#fff',
                          boxShadow: `0 2px 8px ${C.blue}08`,
                        },
                      }}
                    >
                      {/* Code */}
                      <Box sx={{
                        background: `${C.blue}10`,
                        color: C.blue,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        px: 1.5,
                        py: 0.6,
                        borderRadius: '8px',
                        display: 'inline-block',
                        width: 'fit-content',
                      }}>
                        {etab.code}
                      </Box>

                      {/* Nom */}
                      <Typography sx={{ 
                        fontWeight: 600, 
                        color: C.navy, 
                        fontSize: '0.9rem' 
                      }}>
                        {etab.nom}
                      </Typography>

                      {/* Type */}
                      <Typography sx={{ 
                        color: '#A0B0C0', 
                        fontSize: '0.85rem' 
                      }}>
                        {etab.type}
                      </Typography>

                      {/* Effectif */}
                      <Typography sx={{ 
                        fontSize: '0.85rem',
                        color: C.navy,
                        fontWeight: 600,
                      }}>
                        {etab.effectif.toLocaleString()}
                      </Typography>

                      {/* Taux réussite avec barre de progression */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                          flex: 1, 
                          height: 6, 
                          borderRadius: 3, 
                          background: `${progressColor}15`,
                          overflow: 'hidden' 
                        }}>
                          <Box sx={{ 
                            height: '100%', 
                            borderRadius: 3, 
                            width: `${progressWidth}%`, 
                            background: progressColor,
                            transition: 'width 0.5s ease',
                          }} />
                        </Box>
                        <Typography sx={{ 
                          fontWeight: 900, 
                          color: C.navy, 
                          fontSize: '0.9rem',
                          minWidth: 40,
                        }}>
                          {etab.taux}%
                        </Typography>
                      </Box>

                      {/* Statut */}
                      <Chip 
                        label={s.label} 
                        size="small" 
                        sx={{ 
                          background: s.bg, 
                          color: s.color, 
                          fontWeight: 700, 
                          fontSize: '0.72rem', 
                          border: `1px solid ${s.color}28`,
                          borderRadius: '10px',
                        }} 
                      />

                      {/* Actions */}
                      <Button 
                        size="small" 
                        sx={{
                          borderRadius: '10px', 
                          textTransform: 'none', 
                          fontWeight: 700, 
                          fontSize: '0.75rem',
                          color: C.blue,
                          px: 2,
                          py: 0.6,
                          minWidth: 'auto',
                          transition: 'all 0.22s ease',
                          '&:hover': { 
                            background: C.blueL,
                          },
                        }}
                      >
                        Détails →
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ══════════════════════════════════════════════════════
          ✦ DIALOG AMÉLIORÉ — Gestion des utilisateurs
         ══════════════════════════════════════════════════════ */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: {
          borderRadius: '22px', overflow: 'hidden',
          boxShadow: `0 24px 60px rgba(26,58,107,0.16), 0 6px 24px ${C.blue}14`,
          border: `1.5px solid ${C.blueL}`,
          animation: `${popIn} 0.38s cubic-bezier(0.34,1.56,0.64,1)`,
          background: '#F7FBFF',
          maxHeight: '88vh',
        }}}
      >
        {/* ── DIALOG HEADER — light blue clean ── */}
        <Box sx={{
          background: `linear-gradient(135deg, ${C.blueL} 0%, #D6EEFF 60%, #EAF4FF 100%)`,
          px: 3, py: 2.5,
          position: 'relative', overflow: 'hidden',
          borderBottom: `1.5px solid ${C.blue}20`,
        }}>

          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Icon box */}
              <Box sx={{
                width: 44, height: 44, borderRadius: '14px',
                background: C.blueL,
                border: `1.5px solid ${C.blue}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem',
                boxShadow: `0 4px 16px rgba(26,58,107,0.22)`,
              }}>👥</Box>

              <Box>
                <Typography sx={{
                  fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.4px',
                  color: C.navy, mb: 0.2,
                }}>
                  Gestion des utilisateurs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: `${blinkDot} 2s infinite` }} />
                  <Typography sx={{ color: C.navy, opacity: 0.55, fontSize: '0.75rem' }}>
                    4 types · {userStats.total.toLocaleString()} utilisateurs actifs
                  </Typography>
                </Box>
              </Box>
            </Box>

            <IconButton onClick={() => setDialogOpen(false)} sx={{
              color: C.navy, opacity: 0.5, borderRadius: '10px',
              transition: 'all 0.2s',
              '&:hover': { background: `${C.blue}18`, opacity: 1, transform: 'rotate(90deg)' },
            }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* ── DIALOG CONTENT ── */}
        <DialogContent sx={{ p: 2.5, background: '#F7FBFF' }}>

          {/* Main cards grid */}
          <Grid container spacing={1.8}>
            {userTypes.map((u, i) => (
              <Grid item xs={12} sm={6} key={u.role}>
                <Card
                  elevation={0}
                  onMouseEnter={() => setHovCard(i)}
                  onMouseLeave={() => setHovCard(null)}
                  onClick={() => { setDialogOpen(false); navigate(`/dashboard/admin/users/${u.role.toLowerCase()}`); }}
                  sx={{
                    cursor: 'pointer', borderRadius: '20px',
                    background: '#fff',
                    border: `1.5px solid ${hovCard === i ? u.color + '50' : C.blueL}`,
                    position: 'relative', overflow: 'hidden',
                    animation: `${popIn} 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.07}s both`,
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: hovCard === i ? `0 16px 48px ${u.color}22` : `0 2px 12px rgba(0,0,0,0.04)`,
                    transform: hovCard === i ? 'translateY(-6px)' : 'none',
                    // top accent bar
                    '&::before': {
                      content: '""', position: 'absolute',
                      top: 0, left: 0, right: 0, height: '4px',
                      background: u.role === 'RECTEUR' 
                        ? `linear-gradient(90deg, ${C.orange}, #FF8C5A)` 
                        : u.role === 'DIRECTEUR'
                        ? `linear-gradient(90deg, ${C.purple}, #9D4EDD)`
                        : u.role === 'ETUDIANT'
                        ? `linear-gradient(90deg, ${C.green}, #05C78D)`
                        : `linear-gradient(90deg, ${C.blue}, #85BFFF)`,
                      transform: hovCard === i ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left', transition: 'transform 0.35s ease',
                    },
                    // subtle color wash on hover
                    '&::after': {
                      content: '""', position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${u.color}06 0%, transparent 60%)`,
                      opacity: hovCard === i ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                      {/* Left: icon + title */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{
                          width: 44, height: 44, borderRadius: '14px',
                          background: `${u.color}12`,
                          border: `1.5px solid ${u.color}28`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem', flexShrink: 0,
                          transition: 'transform 0.3s ease',
                          transform: hovCard === i ? 'rotate(8deg) scale(1.12)' : 'none',
                          boxShadow: hovCard === i ? `0 6px 20px ${u.color}25` : 'none',
                        }}>
                          {u.emoji}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900, color: C.navy, fontSize: '0.95rem', letterSpacing: '-0.3px' }}>
                            {u.label}
                          </Typography>
                          <Typography sx={{
                            fontWeight: 800, color: u.color, fontSize: '1.15rem', lineHeight: 1.1, letterSpacing: '-0.5px',
                          }}>
                            {u.count}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right: arrow */}
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '10px',
                        background: hovCard === i ? u.color : `${u.color}12`,
                        border: `1.5px solid ${u.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        transform: hovCard === i ? 'translateX(3px)' : 'none',
                      }}>
                        <ArrowForward sx={{
                          fontSize: 16,
                          color: hovCard === i ? '#fff' : u.color,
                          transition: 'color 0.3s',
                        }} />
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography sx={{
                      color: '#6B7C93', fontSize: '0.76rem', lineHeight: 1.55,
                      mb: 1.5, minHeight: 32,
                    }}>
                      {u.desc}
                    </Typography>

                    {/* Footer: badge + stat */}
                    <Box sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      pt: 1.5, borderTop: `1px solid ${hovCard === i ? u.color + '18' : C.blueL}`,
                      transition: 'border-color 0.3s',
                    }}>
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                        background: `${u.color}10`, border: `1px solid ${u.color}28`,
                        borderRadius: '50px', px: 1.2, py: 0.4,
                      }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: u.color, animation: `${blinkDot} 2s infinite` }} />
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: u.color }}>{u.badge}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem' }}>{u.statIcon}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#8A9BB0' }}>{u.stat}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Boutons supplémentaires */}
          <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<span>📦</span>}
              onClick={() => { setDialogOpen(false); navigate('/dashboard/admin/archived-users'); }}
              sx={{
                py: 1.5, borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem',
                textTransform: 'none', border: `1.5px solid ${C.blueL}`,
                color: C.navy,
                '&:hover': { background: C.blueL, borderColor: `${C.blue}50` },
              }}
            >
              Utilisateurs archivés
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<span>📋</span>}
              onClick={() => { setDialogOpen(false); navigate('/dashboard/admin/audit-history'); }}
              sx={{
                py: 1.5, borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem',
                textTransform: 'none', border: `1.5px solid ${C.blueL}`,
                color: C.navy,
                '&:hover': { background: C.blueL, borderColor: `${C.blue}50` },
              }}
            >
              Historique d'audit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '12px', boxShadow: `0 4px 20px ${C.blue}20` }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}