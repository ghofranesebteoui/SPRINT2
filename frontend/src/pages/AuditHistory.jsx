import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TablePagination,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton,
  CircularProgress, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper,
} from '@mui/material';
import { ArrowBack, History } from '@mui/icons-material';
import api from '../services/api';

const C = {
  navy: '#1A3A6B',
  blue: '#4D9FFF',
  blueL: '#EAF4FF',
  blueD: '#1A6FD4',
  green: '#06D6A0',
  red: '#EF4444',
  orange: '#FF6B35',
  purple: '#7B2CBF',
  slate: '#64748B',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px', background: '#FAFCFF',
    '& fieldset': { borderColor: C.blueL, borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: `${C.blue}60` },
    '&.Mui-focused fieldset': { borderColor: C.blue },
  },
};

const ACTION_CONFIG = {
  CREATION: { label: 'Création', color: C.green, icon: '➕' },
  MODIFICATION: { label: 'Modification', color: C.orange, icon: '✏️' },
  ARCHIVAGE: { label: 'Archivage', color: C.purple, icon: '📦' },
  RESTAURATION: { label: 'Restauration', color: C.green, icon: '♻️' },
  SUSPENSION: { label: 'Suspension', color: C.red, icon: '🚫' },
  ACTIVATION: { label: 'Activation', color: C.green, icon: '✅' },
  SUPPRESSION: { label: 'Suppression', color: C.red, icon: '🗑️' },
};

const TYPE_TITLE = {
  recteur: 'Recteurs', directeur: 'Directeurs',
  enseignant: 'Enseignants', etudiant: 'Étudiants',
};

const AuditHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => { fetchHistory(); }, [page, rowsPerPage, filterAction, userType]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: rowsPerPage };
      if (filterAction) params.action = filterAction;
      if (userType) params.role = userType.toUpperCase();
      
      const res = await api.get('/audit', { params });
      setHistory(res.data.history || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pageTitle = userType ? `Historique d'audit - ${TYPE_TITLE[userType] || 'Utilisateurs'}` : "Historique d'audit";

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '14px',
              background: '#F0F7FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
            }}>📋</Box>
            <Box>
              <Typography sx={{ fontWeight: 900, color: C.navy, fontSize: '1.65rem', letterSpacing: '-1px' }}>
                {pageTitle}
              </Typography>
              <Typography sx={{ color: C.slate, fontSize: '0.85rem' }}>
                Traçabilité complète des actions
              </Typography>
            </Box>
          </Box>
        </Box>

        <Tooltip title="Retour">
          <IconButton onClick={() => navigate('/dashboard/admin')} sx={{
            width: 40, height: 40, borderRadius: '12px',
            background: C.blueL, border: `1.5px solid ${C.blue}25`,
            '&:hover': { background: `${C.blue}18` },
          }}>
            <ArrowBack sx={{ color: C.blueD, fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Card sx={{ borderRadius: '22px', mb: 3, border: `1.5px solid ${C.blueL}` }}>
        <CardContent sx={{ p: 3 }}>
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Filtrer par action</InputLabel>
            <Select value={filterAction} label="Filtrer par action" onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}>
              <MenuItem value="">Toutes les actions</MenuItem>
              {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                <MenuItem key={key} value={key}>{config.icon} {config.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '22px', border: `1.5px solid ${C.blueL}` }}>
        <CardContent sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : history.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ color: C.slate }}>Aucun historique trouvé</Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${C.blueL}` }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: C.blueL }}>
                      <TableCell sx={{ fontWeight: 700, color: C.navy }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: C.navy }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: C.navy }}>Utilisateur Cible</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: C.navy }}>Effectué par</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: C.navy }}>Détails</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((entry) => {
                      const actionConfig = ACTION_CONFIG[entry.action] || { label: entry.action, color: C.slate, icon: '•' };
                      let details = {};
                      try {
                        details = JSON.parse(entry.details || '{}');
                      } catch {}

                      return (
                        <TableRow key={entry.id_audit} hover>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{formatDate(entry.date_action)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${actionConfig.icon} ${actionConfig.label}`}
                              size="small"
                              sx={{ 
                                background: `${actionConfig.color}15`, 
                                color: actionConfig.color, 
                                fontWeight: 700,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                {entry.cible_nom} {entry.cible_prenom}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: C.slate }}>
                                {entry.cible_email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                {entry.acteur_nom} {entry.acteur_prenom}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: C.slate }}>
                                {entry.acteur_role}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.8rem', color: C.slate }}>
                              {details.ancien_statut && `${details.ancien_statut} → ${details.nouveau_statut || 'INACTIF'}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={(e, p) => setPage(p)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage="Par page :"
                  labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditHistory;
