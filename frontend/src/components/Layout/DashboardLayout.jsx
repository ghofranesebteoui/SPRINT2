import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography,
  Menu, MenuItem, Drawer, List, ListItem,
  ListItemIcon, ListItemText, ListItemButton,
  Divider, TextField, InputAdornment,
  useTheme, useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon, Logout,
  Person, ChevronLeft, Search, Message, Settings,
} from '@mui/icons-material';
import { keyframes } from '@mui/material';
import NotificationSystem from '../NotificationSystem';
import socketService from '../../services/socketService';

// ── EXACT palette from Landing + Login ────────────
const C = {
  navy:   '#1A3A6B',
  blue:   '#4D9FFF',
  blueB:  '#85BFFF',
  blueL:  '#EAF4FF',
  orange: '#FF6B35',
  green:  '#06D6A0',
  yellow: '#FFD60A',
};

// ── EXACT keyframes from Landing ──────────────────
const floatY = keyframes`
  0%,100% { transform:translateY(0px);  }
  50%      { transform:translateY(-16px);}
`;
const spinCW = keyframes`
  from { transform:rotate(0deg);   }
  to   { transform:rotate(360deg); }
`;
const blinkDot = keyframes`
  0%,100% { opacity:1; } 50% { opacity:0.2; }
`;
const shimmer = keyframes`
  0%   { background-position:0% 50%;   }
  50%  { background-position:100% 50%; }
  100% { background-position:0% 50%;   }
`;
const slideLeft = keyframes`
  from { opacity:0; transform:translateX(-24px); }
  to   { opacity:1; transform:translateX(0);     }
`;
const fadeDown = keyframes`
  from { opacity:0; transform:translateY(-16px); }
  to   { opacity:1; transform:translateY(0);     }
`;
const pulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(77,159,255,0.4); }
  50%      { box-shadow: 0 0 0 8px rgba(77,159,255,0);  }
`;

const DRAWER_W = 272;

export default function DashboardLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl,   setAnchorEl]   = useState(null);

  // Connexion Socket.IO au montage du composant
  useEffect(() => {
    socketService.connect();

    // La connexion à la room est gérée automatiquement dans socketService
    // lors de l'événement 'connect'

    return () => {
      socketService.disconnect();
    };
  }, []);

  const getUserRole = () => {
    const pathRole = location.pathname.split('/')[2];
    if (pathRole && pathRole !== 'profile') return pathRole;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const map = {
      ADMIN_MESRS: 'admin', RECTEUR: 'recteur', DIRECTEUR: 'directeur',
      ENSEIGNANT: 'enseignant', ETUDIANT: 'etudiant',
    };
    return map[user.role] || 'admin';
  };

  const userRole = getUserRole();

  const menuItems = {
    admin: [
      { text: "Vue d'ensemble", icon: '📊', path: '/dashboard/admin'  },
      { text: 'Établissements', icon: '🏫', path: '/dashboard/admin/etablissements' },
      { text: 'Spécialités',    icon: '🎓', path: '/dashboard/admin/specialites' },
      { text: 'Analytics',      icon: '📈', path: '/analytics'         },
      { text: 'Rapports',       icon: '📋', path: '/reports'           },
      { text: 'Mon Profil',     icon: '👨‍💼', path: '/dashboard/profile' },
      { text: 'Paramètres',     icon: '⚙️', path: '/settings'          },
    ],
    recteur: [
      { text: 'Dashboard',      icon: '📊', path: '/dashboard/recteur' },
      { text: 'Établissements', icon: '🏛️', path: '/etablissements'    },
      { text: 'Statistiques',   icon: '📈', path: '/statistics'        },
      { text: 'Budget',         icon: '💰', path: '/budget'            },
      { text: 'Rapports',       icon: '📋', path: '/reports'           },
      { text: 'Mon Profil',     icon: '👨‍🎓', path: '/dashboard/profile' },
    ],
    directeur: [
      { text: 'Dashboard',   icon: '📊', path: '/dashboard/directeur' },
      { text: 'Étudiants',   icon: '👨‍🎓', path: '/students'            },
      { text: 'Enseignants', icon: '👨‍🏫', path: '/teachers'            },
      { text: 'Filières',    icon: '🎯', path: '/filieres'            },
      { text: 'Rapports',    icon: '📋', path: '/reports'             },
      { text: 'Mon Profil',  icon: '🧑‍💼', path: '/dashboard/profile'   },
    ],
    enseignant: [
      { text: 'Dashboard',   icon: '📊', path: '/dashboard/enseignant' },
      { text: 'Mes classes', icon: '🏫', path: '/classes'              },
      { text: 'Notes',       icon: '📝', path: '/grades'               },
      { text: 'Analyses',    icon: '📈', path: '/analyses'             },
      { text: 'Messages',    icon: '💬', path: '/messages'             },
      { text: 'Mon Profil',  icon: '👨‍🏫', path: '/dashboard/profile'    },
    ],
    etudiant: [
      { text: 'Dashboard',  icon: '📊', path: '/dashboard/etudiant'  },
      { text: 'Mes cours',  icon: '📚', path: '/courses'              },
      { text: 'Mes notes',  icon: '📝', path: '/grades'               },
      { text: 'Objectifs',  icon: '🎯', path: '/goals'                },
      { text: 'Ressources', icon: '📖', path: '/resources'            },
      { text: 'Mon Profil', icon: '👨‍🎓', path: '/dashboard/profile'    },
    ],
  };

  const roleNames  = {
    admin: 'Administrateur', recteur: "Recteur d'Université",
    directeur: 'Directeur', enseignant: 'Enseignant', etudiant: 'Étudiant',
  };
  const roleEmojis = {
    admin: '👨‍💼', recteur: '🎓', directeur: '🏛️', enseignant: '👨‍🏫', etudiant: '👨‍🎓',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#F7FBFF', overflow: 'hidden' }}>

      {/* ══════════════════════════════════════════
          SIDEBAR — exact DNA = Login LEFT panel
          navy gradient + dot-grid + glow + rings
         ══════════════════════════════════════════ */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_W, flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_W, boxSizing: 'border-box',
            /* exact Login left panel gradient */
            background: `linear-gradient(160deg, ${C.navy} 0%, #1E4880 60%, #1A3A6B 100%)`,
            borderRight: 'none',
            boxShadow: `6px 0 40px rgba(26,58,107,0.35)`,
            overflow: 'hidden',
          },
        }}
      >
        {/* inner dot-grid — exact Login panel */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }} />

        {/* ── content ─────────────────────────── */}
        <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Logo — exact Login panel logo */}
          <Box sx={{ px: 3, pt: 3.5, pb: 2 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Typography sx={{
                fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px',
                background: `linear-gradient(135deg, #fff, ${C.blueB})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>SIAPET</Typography>
            </Box>
          </Box>

          {/* User card — Login panel perks style */}
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Box
              onClick={() => navigate('/dashboard/profile')}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                p: 1.8, borderRadius: '14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.13)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                '&:hover': { background: 'rgba(255,255,255,0.13)', transform: 'translateX(4px)' },
              }}
            >
              <Box sx={{
                width: 42, height: 42, borderRadius: '12px',
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', flexShrink: 0,
              }}>
                {roleEmojis[userRole]}
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', mb: 0.2 }}>
                  {roleNames[userRole]}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
                  <Typography sx={{ color: C.green, fontSize: '0.72rem', fontWeight: 700 }}>En ligne</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* static divider */}
          <Box sx={{
            mx: 2.5, height: '1.5px', borderRadius: 2, mb: 1.5,
            background: `linear-gradient(90deg, ${C.blue}80, ${C.orange}60, ${C.blue}80)`,
          }} />

          {/* Nav items */}
          <List sx={{ px: 2, flex: 1 }}>
            {menuItems[userRole]?.map((item, i) => {
              const isActive = location.pathname === item.path;
              return (
                <React.Fragment key={item.text}>
                  {item.text === 'Mon Profil' && (
                    <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.1)' }} />
                  )}
                  <ListItem disablePadding sx={{
                    mb: 0.4,
                  }}>
                    <ListItemButton
                      selected={isActive}
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: '12px', py: 1.1,
                        transition: 'all 0.22s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.08)',
                          transform: 'translateX(5px)',
                        },
                        '&.Mui-selected': {
                          background: `linear-gradient(135deg, ${C.blue}45, ${C.blueB}28)`,
                          border: `1px solid ${C.blue}40`,
                          backdropFilter: 'blur(8px)',
                          '&:hover': { background: `linear-gradient(135deg, ${C.blue}55, ${C.blueB}38)` },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: 36,
                        fontSize: '1.4rem',
                        opacity: 1,
                        color: 'inherit',
                        '& *': {
                          opacity: 1,
                        }
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} primaryTypographyProps={{
                        fontWeight: isActive ? 800 : 700,
                        fontSize: '0.9rem',
                        color: '#fff',
                      }} />
                      {isActive && (
                        <Box sx={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: '#fff', boxShadow: `0 0 8px #fff`,
                        }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>


        </Box>
      </Drawer>

      {/* ══════════════════════════════════════════
          MAIN AREA
         ══════════════════════════════════════════ */}
      <Box component="main" sx={{
        flexGrow: 1,
        minWidth: 0,          // prevents flex overflow
        overflow: 'auto',     // allows sticky header to work correctly
        display: 'flex', flexDirection: 'column',
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        height: '100vh',
      }}>

        {/* ── Topbar — sans animations ── */}
        <AppBar position="sticky" elevation={0} sx={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1.5px solid ${C.blueL}`,
          boxShadow: `0 4px 28px ${C.blue}10`,
          color: C.navy,
        }}>
          <Toolbar sx={{ gap: 1.5, minHeight: '68px !important' }}>

            <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{
              color: C.navy, borderRadius: '10px', width: 38, height: 38,
              transition: 'all 0.22s',
              '&:hover': { background: C.blueL, transform: 'scale(1.08)' },
            }}>
              {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>

            {/* Search */}
            <TextField
              placeholder="Rechercher..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#B8C8D8', fontSize: 17 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1, maxWidth: 440,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px', background: '#F8FAFE',
                  transition: 'all 0.22s',
                  '& fieldset': { border: `1.5px solid ${C.blueL}` },
                  '&:hover fieldset': { borderColor: C.blueB },
                  '&.Mui-focused fieldset': { borderColor: C.blue },
                  '&.Mui-focused': { background: '#fff', boxShadow: `0 0 0 3px ${C.blue}1A` },
                },
                '& input': { fontSize: '0.87rem', py: '9px' },
              }}
            />

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Système de notifications en temps réel */}
              <NotificationSystem />
              
              <IconButton sx={{
                background: C.blueL, color: '#8A9BB0', borderRadius: '10px',
                width: 44, height: 44,
                transition: 'all 0.22s',
                '&:hover': { background: '#D6EEFF', color: C.blue, transform: 'translateY(-2px)', boxShadow: `0 4px 14px ${C.blue}20` },
              }}>
                <Message sx={{ fontSize: 22 }} />
              </IconButton>

              {/* Avatar chip */}
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.4,
                  px: 2, py: 0.9, borderRadius: '14px',
                  border: `1.5px solid ${C.blueL}`, background: '#fff',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  '&:hover': { background: C.blueL, borderColor: `${C.blue}44`, transform: 'translateY(-1px)' },
                }}
              >
                <Box sx={{
                  width: 40, height: 40, borderRadius: '8px',
                  background: C.blueL,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>{roleEmojis[userRole]}</Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography sx={{ fontWeight: 700, color: C.navy, fontSize: '0.9rem', lineHeight: 1.2 }}>
                    {roleNames[userRole]}
                  </Typography>
                  <Typography sx={{ color: '#B8C8D8', fontSize: '0.75rem' }}>Connecté</Typography>
                </Box>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              slotProps={{ paper: { sx: {
                mt: 1.5, borderRadius: '16px', minWidth: 210,
                border: `1.5px solid ${C.blueL}`,
                boxShadow: `0 16px 48px ${C.blue}18`,
              }}}}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${C.blueL}` }}>
                <Typography sx={{ fontWeight: 800, color: C.navy, fontSize: '0.85rem' }}>
                  {roleEmojis[userRole]} {roleNames[userRole]}
                </Typography>
                <Typography sx={{ color: '#B8C8D8', fontSize: '0.72rem' }}>Compte actif</Typography>
              </Box>
              {[
                { label: 'Mon Profil',  icon: <Person fontSize="small" />,  path: '/dashboard/profile' },
                { label: 'Paramètres', icon: <Settings fontSize="small" />, path: '/settings'          },
              ].map(item => (
                <MenuItem key={item.label}
                  onClick={() => { setAnchorEl(null); navigate(item.path); }}
                  sx={{ mx: 0.5, my: 0.2, borderRadius: '10px', fontSize: '0.88rem',
                    transition: 'background 0.2s', '&:hover': { background: C.blueL } }}>
                  <ListItemIcon sx={{ color: '#8A9BB0' }}>{item.icon}</ListItemIcon>
                  {item.label}
                </MenuItem>
              ))}
              <Divider sx={{ my: 0.5, borderColor: C.blueL }} />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/login'); }}
                sx={{ mx: 0.5, mb: 0.5, borderRadius: '10px', fontSize: '0.88rem',
                  color: '#EF4444', '&:hover': { background: '#FFF5F5' } }}>
                <ListItemIcon><Logout fontSize="small" sx={{ color: '#EF4444' }} /></ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ── Page content wrapper ── same bg as Landing ── */}
        <Box sx={{
          flexGrow: 1, p: 3, position: 'relative',
          /* dot-grid — exact same as Landing hero + Login bg */
          backgroundImage: `radial-gradient(${C.blue}12 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}>
          {/* floating blobs — sans animations */}
          <Box sx={{
            position: 'fixed', top: '-12%', right: '-4%', zIndex: 0,
            width: 480, height: 480, borderRadius: '50%',
            background: `radial-gradient(circle, ${C.blue}12 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'fixed', bottom: '-8%', left: '-6%', zIndex: 0,
            width: 360, height: 360, borderRadius: '50%',
            background: `radial-gradient(circle, ${C.orange}0D 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}