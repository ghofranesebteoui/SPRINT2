import { useEffect, useState } from 'react';
import { Snackbar, Alert, Badge, IconButton, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import socketService from '../services/socketService';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Connecter le socket
    socketService.connect();

    // Vérifier la connexion
    setTimeout(() => {
      if (!socketService.isConnected()) {
        console.error('Socket non connecté');
      }
    }, 2000);

    // Écouter les nouvelles demandes d'accès
    const handleNouvelleDemande = (data) => {
      console.log('🔔 NotificationSystem: Nouvelle demande reçue:', data);
      
      const notification = {
        id: Date.now(),
        type: 'nouvelle-demande',
        message: `Nouvelle demande d'accès ${data.type_acteur}`,
        details: `${data.nom} ${data.prenom} (${data.email})`,
        timestamp: new Date(),
        read: false,
        data,
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Afficher le snackbar
      setSnackbar({
        open: true,
        message: `📋 ${notification.message}`,
        severity: 'info',
      });

      // Jouer un son (optionnel)
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => console.log('Son non disponible'));
      } catch {
        console.log('Son non disponible');
      }
    };

    socketService.on('nouvelle-demande', handleNouvelleDemande);

    // Nettoyage
    return () => {
      socketService.off('nouvelle-demande', handleNouvelleDemande);
    };
  }, []);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
    // Marquer toutes les notifications comme lues
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClearAll = () => {
    setNotifications([]);
    handleCloseMenu();
  };

  const getRoleEmoji = (role) => {
    const emojis = {
      etudiant: '🎓',
      enseignant: '👨‍🏫',
      directeur: '👔',
      recteur: '🏛️',
    };
    return emojis[role] || '👤';
  };

  return (
    <>
      {/* Icône de notification avec badge */}
      <IconButton
        color="inherit"
        onClick={handleOpenMenu}
        sx={{
          position: 'relative',
          '&:hover': {
            background: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Menu des notifications */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              maxHeight: 500,
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1A3A6B' }}>
            🔔 Notifications
          </Typography>
          {notifications.length > 0 && (
            <Typography
              onClick={handleClearAll}
              sx={{
                fontSize: '0.75rem',
                color: '#4D9FFF',
                cursor: 'pointer',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Tout effacer
            </Typography>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#8A9BB0', fontSize: '0.9rem' }}>
              Aucune notification
            </Typography>
          </Box>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif.id}
              onClick={handleCloseMenu}
              sx={{
                py: 1.5,
                px: 2,
                flexDirection: 'column',
                alignItems: 'flex-start',
                background: notif.read ? 'transparent' : 'rgba(77,159,255,0.05)',
                borderLeft: notif.read ? 'none' : '3px solid #4D9FFF',
                '&:hover': {
                  background: 'rgba(77,159,255,0.08)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>
                  {getRoleEmoji(notif.data?.type_acteur)}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A3A6B' }}>
                  {notif.message}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: '#8A9BB0', mb: 0.5 }}>
                {notif.details}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#B0BEC5' }}>
                {notif.timestamp.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Snackbar pour les notifications en temps réel */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationSystem;
