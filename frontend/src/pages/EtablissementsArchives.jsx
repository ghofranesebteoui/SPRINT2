import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, InputAdornment, IconButton, keyframes,
} from '@mui/material';
import { Search, RestoreFromTrash, Delete, ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.apiUrl;

const C = {
  navy: '#1A3A6B', blue: '#4D9FFF', blueL: '#EAF4FF',
  green: '#06D6A0', red: '#ef4444', redL: '#fee2e2',
  amber: '#FFD60A', purple: '#7B2CBF',
  slate: '#64748B', border: '#e2e8f0',
};

const fadeUp = keyframes`
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
`;

const EtablissementsArchives = () => {
  const navigate = useNavigate();
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArchivedEtablissements();
  }, []);

  const fetchArchivedEtablissements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/etablissements?archived=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setEtablissements(response.data.etablissements || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir restaurer cet établissement ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/etablissements/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchArchivedEtablissements();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la restauration');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('⚠️ ATTENTION: Cette action est irréversible. Voulez-vous vraiment supprimer définitivement cet établissement ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/etablissements/${id}/permanent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchArchivedEtablissements();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredEtablissements = etablissements.filter(etab =>
    etab.nom_etablissement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etab.code_etablissement?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeColors = {
    FACULTE: { bg: '#FEF3C7', color: '#F59E0B' },
    ECOLE: { bg: '#DBEAFE', color: '#3B82F6' },
    INSTITUT: { bg: '#FEF3C7', color: '#F59E0B' },
    ISET: { bg: '#F3E8FF', color: '#8B5CF6' },
  };

  return (
    <Box sx={{ animation: `${fadeUp} 0.5s ease-out` }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px',
            background: '#FFF4E6', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
          }}>
            📦
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, color: C.navy, fontSize: '1.8rem', letterSpacing: '-0.5px', mb: 0.3, lineHeight: 1.2 }}>
              Établissements Archivés
            </Typography>
            <Typography sx={{ color: C.slate, fontSize: '0.95rem' }}>
              Historique des établissements archivés
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard/admin/etablissements')}
          sx={{
            borderColor: C.border, color: C.slate,
            px: 3, py: 1.2, borderRadius: '12px',
            fontWeight: 700, textTransform: 'none',
            border: '2px solid',
            '&:hover': { borderColor: C.blue, color: C.blue, border: '2px solid' },
          }}
        >
          Retour
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            size="medium"
            placeholder="Rechercher un établissement archivé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#06B6D4', fontSize: 24 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px', background: '#F9FAFB',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: '#E5E7EB' },
                '&.Mui-focused fieldset': { borderColor: '#06B6D4', borderWidth: '1px' },
                '&.Mui-focused': { background: '#fff' },
              },
              '& input': { fontSize: '0.95rem', color: '#6B7280' },
            }}
          />
        </Box>
      </Card>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: C.blue }} />
        </Box>
      ) : (
        <Card sx={{ borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 100%)' }} />
          
          <TableContainer sx={{ mt: '4px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'transparent' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                    CODE
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                    NOM
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                    TYPE
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                    DATE ARCHIVAGE
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEtablissements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography sx={{ color: C.slate, fontSize: '0.95rem' }}>
                        Aucun établissement archivé
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEtablissements.map((etab, index) => (
                    <TableRow key={etab.id_etablissement} sx={{ '&:hover': { background: '#F9FAFB' }, transition: 'background 0.2s', borderBottom: index === filteredEtablissements.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                      <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                        <Chip label={etab.code_etablissement} sx={{ background: '#FEE2E2', color: '#EF4444', fontWeight: 700, fontSize: '0.85rem', borderRadius: '8px', height: '32px' }} />
                      </TableCell>
                      <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.95rem' }}>
                        {etab.nom_etablissement}
                      </TableCell>
                      <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                        <Chip label={etab.type} size="small" sx={{ background: typeColors[etab.type]?.bg || '#FEF3C7', color: typeColors[etab.type]?.color || '#F59E0B', fontWeight: 700, fontSize: '0.75rem', borderRadius: '8px', textTransform: 'uppercase', height: '28px' }} />
                      </TableCell>
                      <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.9rem' }}>
                        {etab.date_archivage ? new Date(etab.date_archivage).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 3, borderBottom: 'none' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton size="small" onClick={() => handleRestore(etab.id_etablissement)} sx={{ width: 36, height: 36, background: '#D1FAE5', color: '#10B981', '&:hover': { background: '#A7F3D0', color: '#059669' } }}>
                            <RestoreFromTrash fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handlePermanentDelete(etab.id_etablissement)} sx={{ width: 36, height: 36, background: '#FEE2E2', color: '#EF4444', '&:hover': { background: '#FECACA', color: '#DC2626' } }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default EtablissementsArchives;
