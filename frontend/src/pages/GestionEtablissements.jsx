import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid,
  Dialog, DialogTitle, DialogContent, IconButton,
  Chip, CircularProgress, InputAdornment, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, keyframes, Alert, Snackbar,
} from '@mui/material';
import {
  Add, Search, FileDownload, Edit, Archive, Visibility,
  Close, School, Business, LocationOn, Phone, Email,
  Language, AttachMoney, People, TrendingUp,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.apiUrl;

// ── PALETTE ───────────────────────────────────────
const C = {
  navy:   '#1A3A6B',
  blue:   '#4D9FFF',
  blueB:  '#85BFFF',
  blueL:  '#EAF4FF',
  orange: '#FF6B35',
  green:  '#06D6A0',
  yellow: '#FFD60A',
  purple: '#7B2CBF',
  coral:  '#D85A30',
  slate:  '#64748B',
};

// ── KEYFRAMES ─────────────────────────────────────
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
`;
const slideLeft = keyframes`
  from { opacity:0; transform:translateX(-20px); }
  to   { opacity:1; transform:translateX(0); }
`;
const popIn = keyframes`
  from { opacity:0; transform:scale(0.88); }
  to   { opacity:1; transform:scale(1); }
`;

const GestionEtablissements = () => {
  const navigate = useNavigate();
  const [etablissements, setEtablissements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEtablissement, setSelectedEtablissement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    id_rectorat: '',
    page: 1,
    limit: 10
  });

  // Formulaire
  const [formData, setFormData] = useState({
    code_etablissement: '',
    nom_etablissement: '',
    type: 'FACULTE',
    id_rectorat: '',
    id_ville: '',
    adresse: '',
    telephone: '',
    email: '',
    site_web: '',
    budget_alloue: '',
    capacite_maximale: '',
    date_creation: new Date().toISOString().split('T')[0]
  });

  const [universites, setUniversites] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    fetchEtablissements();
    fetchStats();
    fetchUniversites();
  }, [filters]);

  const fetchEtablissements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`${API_BASE_URL}/etablissements?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEtablissements(response.data.etablissements);
        setPagination({
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      }
    } catch (error) {
      console.error('Erreur chargement établissements:', error);
      setSnackbar({ 
        open: true, 
        message: `Erreur: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/etablissements/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const fetchUniversites = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/etablissements/universites`);
      if (response.data.success) {
        setUniversites(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement universités:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/etablissements/${selectedEtablissement.id_etablissement}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Établissement modifié avec succès', severity: 'success' });
      } else {
        await axios.post(
          `${API_BASE_URL}/etablissements`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Établissement créé avec succès', severity: 'success' });
      }
      
      setShowModal(false);
      resetForm();
      fetchEtablissements();
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Erreur lors de l\'opération', 
        severity: 'error' 
      });
    }
  };

  const handleEdit = (etablissement) => {
    setSelectedEtablissement(etablissement);
    setFormData({
      code_etablissement: etablissement.code_etablissement,
      nom_etablissement: etablissement.nom_etablissement,
      type: etablissement.type,
      id_rectorat: etablissement.id_rectorat,
      id_ville: etablissement.id_ville || '',
      adresse: etablissement.adresse || '',
      telephone: etablissement.telephone || '',
      email: etablissement.email || '',
      site_web: etablissement.site_web || '',
      budget_alloue: etablissement.budget_alloue || '',
      capacite_maximale: etablissement.capacite_maximale || '',
      date_creation: etablissement.date_creation?.split('T')[0] || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleViewDetail = async (id) => {
    navigate(`/dashboard/admin/etablissements/${id}`);
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir archiver cet établissement ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/etablissements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Établissement archivé avec succès', severity: 'success' });
      fetchEtablissements();
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbar({ open: true, message: 'Erreur lors de l\'archivage', severity: 'error' });
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.id_rectorat) params.append('id_rectorat', filters.id_rectorat);

      const response = await axios.get(`${API_BASE_URL}/etablissements/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `etablissements_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSnackbar({ open: true, message: 'Export réussi', severity: 'success' });
    } catch (error) {
      console.error('Erreur export:', error);
      setSnackbar({ open: true, message: 'Erreur lors de l\'export', severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      code_etablissement: '',
      nom_etablissement: '',
      type: 'FACULTE',
      id_rectorat: '',
      id_ville: '',
      adresse: '',
      telephone: '',
      email: '',
      site_web: '',
      budget_alloue: '',
      capacite_maximale: '',
      date_creation: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setSelectedEtablissement(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const typeColors = {
    FACULTE: { bg: '#FEF3C7', color: '#F59E0B' },
    ECOLE: { bg: '#DBEAFE', color: '#3B82F6' },
    INSTITUT: { bg: '#FEF3C7', color: '#F59E0B' },
    ISET: { bg: '#F3E8FF', color: '#8B5CF6' },
  };

  return (
    <Box sx={{ animation: `${fadeUp} 0.5s ease-out` }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Icon */}
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            background: '#FFF4E6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}>
            🏫
          </Box>
          {/* Title & Description */}
          <Box>
            <Typography sx={{ 
              fontWeight: 900, 
              color: C.navy, 
              fontSize: '1.8rem', 
              letterSpacing: '-0.5px', 
              mb: 0.3,
              lineHeight: 1.2,
            }}>
              Gestion des Établissements
            </Typography>
            <Typography sx={{ color: C.slate, fontSize: '0.95rem' }}>
              Gérez les facultés, écoles, instituts et ISETs
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<span style={{ fontSize: '18px' }}>📦</span>}
            onClick={() => navigate('/dashboard/admin/etablissements/archives')}
            sx={{
              borderColor: '#FCA5A5',
              color: '#EF4444',
              px: 3,
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              border: '2px solid',
              '&:hover': {
                borderColor: '#EF4444',
                background: '#FEE2E2',
                border: '2px solid',
              },
            }}
          >
            Archives
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExport}
            sx={{
              borderColor: C.green,
              color: C.green,
              px: 3,
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              border: '2px solid',
              '&:hover': {
                borderColor: C.green,
                background: `${C.green}10`,
                border: '2px solid',
              },
            }}
          >
            Exporter CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/dashboard/admin/etablissements/ajouter')}
            sx={{
              background: '#2563EB',
              color: '#fff',
              px: 3,
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              '&:hover': {
                background: '#1D4ED8',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)',
              },
            }}
          >
            Ajouter
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            label: 'TOTAL ÉTABLISSEMENTS', 
            value: '177', 
            icon: '🏫', 
            color: '#FF6B35',
            change: '+2 nouveaux',
            changePositive: true
          },
          { 
            label: 'FACULTÉS', 
            value: '26', 
            icon: '🎓', 
            color: '#06D6A0',
            change: '+1 nouvelle faculté',
            changePositive: true
          },
          { 
            label: 'ÉCOLES & INSTITUTS', 
            value: '2898', 
            icon: '🏛️', 
            color: '#7B2CBF',
            change: '+3 vs mois dernier',
            changePositive: true
          },
          { 
            label: 'BUDGET TOTAL', 
            value: '2.5Mds', 
            icon: '💰', 
            color: '#FFD60A',
            change: '+5.2% d\'augmentation',
            changePositive: true
          },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              animation: `${popIn} 0.4s ease-out ${i * 0.1}s both`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              background: '#fff',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 28px ${stat.color}30`,
              },
            }}>
              {/* Colored top border */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: stat.color,
              }} />
              
              <CardContent sx={{ p: 3, pt: 3.5 }}>
                {/* Header with label and icon */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 2.5 
                }}>
                  <Typography sx={{ 
                    fontSize: '0.7rem', 
                    color: '#9CA3AF', 
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1.3,
                  }}>
                    {stat.label}
                  </Typography>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}>
                    {stat.icon}
                  </Box>
                </Box>

                {/* Main value */}
                <Typography sx={{ 
                  fontSize: '2.8rem', 
                  fontWeight: 900, 
                  color: '#1F2937', 
                  mb: 2,
                  lineHeight: 1,
                }}>
                  {stat.value}
                </Typography>

                {/* Change indicator */}
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '8px',
                  background: stat.changePositive ? `${stat.color}15` : '#FEE2E2',
                }}>
                  <Typography sx={{ 
                    fontSize: '0.75rem', 
                    color: stat.changePositive ? stat.color : '#EF4444',
                    fontWeight: 600,
                  }}>
                    ↗ {stat.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Card sx={{
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        mb: 3,
        background: '#fff',
      }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="medium"
                name="search"
                placeholder="Rechercher un établissement..."
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#06B6D4', fontSize: 24 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: '#F9FAFB',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#E5E7EB' },
                    '&.Mui-focused fieldset': { borderColor: '#06B6D4', borderWidth: '1px' },
                    '&.Mui-focused': { background: '#fff' },
                  },
                  '& input': {
                    fontSize: '0.95rem',
                    color: '#6B7280',
                    '&::placeholder': {
                      color: '#9CA3AF',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="medium">
                <Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    background: '#F9FAFB',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#E5E7EB' },
                    '&.Mui-focused fieldset': { borderColor: '#06B6D4', borderWidth: '1px' },
                    '& .MuiSelect-select': {
                      color: filters.type ? '#374151' : '#9CA3AF',
                      fontSize: '0.95rem',
                    },
                  }}
                >
                  <MenuItem value="">Type</MenuItem>
                  <MenuItem value="FACULTE">Faculté</MenuItem>
                  <MenuItem value="ECOLE">École</MenuItem>
                  <MenuItem value="INSTITUT">Institut</MenuItem>
                  <MenuItem value="ISET">ISET</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="medium">
                <Select
                  name="id_rectorat"
                  value={filters.id_rectorat}
                  onChange={handleFilterChange}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    background: '#F9FAFB',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#E5E7EB' },
                    '&.Mui-focused fieldset': { borderColor: '#06B6D4', borderWidth: '1px' },
                    '& .MuiSelect-select': {
                      color: filters.id_rectorat ? '#374151' : '#9CA3AF',
                      fontSize: '0.95rem',
                    },
                  }}
                >
                  <MenuItem value="">Université</MenuItem>
                  {universites.map(u => (
                    <MenuItem key={u.id} value={u.id}>{u.nom_etablissement}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                onClick={() => setFilters({ search: '', type: '', id_rectorat: '', page: 1, limit: 10 })}
                sx={{
                  height: '56px',
                  borderRadius: '12px',
                  color: '#9CA3AF',
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    background: '#F9FAFB',
                    color: '#6B7280',
                  },
                }}
              >
                ✕ Effacer
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: C.blue }} />
        </Box>
      ) : (
        <Card sx={{
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          position: 'relative',
          background: '#fff',
        }}>
          {/* Colored top border */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)',
          }} />
          
          <TableContainer sx={{ mt: '4px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'transparent' }}>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: '#9CA3AF', 
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #F3F4F6',
                    py: 2,
                  }}>
                    CODE ↕
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: '#9CA3AF', 
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #F3F4F6',
                    py: 2,
                  }}>
                    NOM ↕
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: '#9CA3AF', 
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #F3F4F6',
                    py: 2,
                  }}>
                    TYPE
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: '#9CA3AF', 
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #F3F4F6',
                    py: 2,
                  }}>
                    EFFECTIF ↕
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: '#9CA3AF', 
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #F3F4F6',
                    py: 2,
                  }}>
                    CAPACITÉ ↕
                  </TableCell>
                  <TableCell align="center" sx={{ 
                    fontWeight: 700, 
                    color: '#9CA3AF', 
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #F3F4F6',
                    py: 2,
                  }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {etablissements.map((etab, index) => (
                  <TableRow
                    key={etab.id_etablissement}
                    sx={{
                      '&:hover': { background: '#F9FAFB' },
                      transition: 'background 0.2s',
                      borderBottom: index === etablissements.length - 1 ? 'none' : '1px solid #F3F4F6',
                    }}
                  >
                    <TableCell sx={{ 
                      py: 3,
                      borderBottom: 'none',
                    }}>
                      <Chip
                        label={etab.code_etablissement}
                        sx={{
                          background: '#EFF6FF',
                          color: '#2563EB',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          height: '32px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      py: 3,
                      borderBottom: 'none',
                      color: '#1F2937',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    }}>
                      {etab.nom_etablissement}
                    </TableCell>
                    <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                      <Chip
                        label={etab.type}
                        size="small"
                        sx={{
                          background: typeColors[etab.type]?.bg || '#FEF3C7',
                          color: typeColors[etab.type]?.color || '#F59E0B',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          height: '28px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                      <Box>
                        <Typography sx={{ 
                          color: '#1F2937', 
                          fontWeight: 600,
                          fontSize: '0.95rem',
                        }}>
                          {etab.effectif_total || 0}
                        </Typography>
                        <Box sx={{
                          width: '60px',
                          height: '3px',
                          background: '#E5E7EB',
                          borderRadius: '2px',
                          mt: 0.5,
                          position: 'relative',
                          overflow: 'hidden',
                        }}>
                          <Box sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: etab.capacite_maximale ? `${Math.min((etab.effectif_total / etab.capacite_maximale) * 100, 100)}%` : '0%',
                            background: etab.type === 'INSTITUT' ? '#3B82F6' : '#F59E0B',
                            borderRadius: '2px',
                          }} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      py: 3,
                      borderBottom: 'none',
                      color: '#6B7280',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    }}>
                      {etab.capacite_maximale || '-'}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 3, borderBottom: 'none' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(etab.id_etablissement)}
                          sx={{
                            width: 36,
                            height: 36,
                            background: '#F3F4F6',
                            color: '#6B7280',
                            '&:hover': { background: '#E5E7EB', color: '#374151' },
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/dashboard/admin/etablissements/ajouter?edit=${etab.id_etablissement}`)}
                          sx={{
                            width: 36,
                            height: 36,
                            background: '#F3F4F6',
                            color: '#F59E0B',
                            '&:hover': { background: '#FEF3C7', color: '#D97706' },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleArchive(etab.id_etablissement)}
                          sx={{
                            width: 36,
                            height: 36,
                            background: '#F3F4F6',
                            color: '#9CA3AF',
                            '&:hover': { background: '#FEE2E2', color: '#EF4444' },
                          }}
                        >
                          <Archive fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: `1px solid ${C.blueL}` }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                size="small"
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  color: C.navy,
                  '&:disabled': { color: C.slate },
                }}
              >
                Précédent
              </Button>
              <Typography sx={{ px: 2, color: C.slate, fontSize: '0.9rem' }}>
                Page {filters.page} sur {pagination.totalPages}
              </Typography>
              <Button
                size="small"
                disabled={filters.page === pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  color: C.navy,
                  '&:disabled': { color: C.slate },
                }}
              >
                Suivant
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {/* Modal Ajout/Modification */}
      <Dialog
        open={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: `0 24px 48px ${C.blue}20`,
          },
        }}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueB} 100%)`,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
            {isEditing ? '✏️ Modifier' : '➕ Ajouter'} un établissement
          </Typography>
          <IconButton onClick={() => { setShowModal(false); resetForm(); }} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, mt: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Code *"
                  name="code_etablissement"
                  value={formData.code_etablissement}
                  onChange={handleInputChange}
                  required
                  disabled={isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type *</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Type *"
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="FACULTE">Faculté</MenuItem>
                    <MenuItem value="ECOLE">École</MenuItem>
                    <MenuItem value="INSTITUT">Institut</MenuItem>
                    <MenuItem value="ISET">ISET</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom *"
                  name="nom_etablissement"
                  value={formData.nom_etablissement}
                  onChange={handleInputChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Université *</InputLabel>
                  <Select
                    name="id_rectorat"
                    value={formData.id_rectorat}
                    onChange={handleInputChange}
                    label="Université *"
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="">Sélectionner...</MenuItem>
                    {universites.map(u => (
                      <MenuItem key={u.id} value={u.id}>{u.nom_etablissement}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: C.slate, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: C.slate, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Web"
                  name="site_web"
                  type="url"
                  value={formData.site_web}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Language sx={{ color: C.slate, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capacité Maximale"
                  name="capacite_maximale"
                  type="number"
                  value={formData.capacite_maximale}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <People sx={{ color: C.slate, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Budget Alloué (TND)"
                  name="budget_alloue"
                  type="number"
                  value={formData.budget_alloue}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: C.slate, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button
                onClick={() => { setShowModal(false); resetForm(); }}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  color: C.slate,
                  '&:hover': { background: `${C.slate}10` },
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueB} 100%)`,
                  boxShadow: `0 4px 14px ${C.blue}40`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueB} 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${C.blue}50`,
                  },
                }}
              >
                {isEditing ? 'Modifier' : 'Créer'}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Détail */}
      <Dialog
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: `0 24px 48px ${C.blue}20`,
          },
        }}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
            📋 Détails de l'établissement
          </Typography>
          <IconButton onClick={() => setShowDetailModal(false)} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, mt: 2 }}>
          {selectedEtablissement && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                  Code
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: C.navy, fontWeight: 600 }}>
                  {selectedEtablissement.code_etablissement}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                  Nom
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: C.navy, fontWeight: 600 }}>
                  {selectedEtablissement.nom_etablissement}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                  Type
                </Typography>
                <Chip
                  label={selectedEtablissement.type}
                  sx={{
                    background: typeColors[selectedEtablissement.type]?.bg || C.blueL,
                    color: typeColors[selectedEtablissement.type]?.color || C.blue,
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                  Université
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: C.navy }}>
                  {selectedEtablissement.universite_nom || '-'}
                </Typography>
              </Box>
              {selectedEtablissement.adresse && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Adresse
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: C.navy }}>
                      {selectedEtablissement.adresse}
                    </Typography>
                  </Box>
                </>
              )}
              {selectedEtablissement.telephone && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                      <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Téléphone
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: C.navy }}>
                      {selectedEtablissement.telephone}
                    </Typography>
                  </Box>
                </>
              )}
              {selectedEtablissement.email && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                      <Email sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Email
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: C.navy }}>
                      {selectedEtablissement.email}
                    </Typography>
                  </Box>
                </>
              )}
              {selectedEtablissement.site_web && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                      <Language sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Site Web
                    </Typography>
                    <Typography
                      component="a"
                      href={selectedEtablissement.site_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontSize: '0.95rem', color: C.blue, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {selectedEtablissement.site_web}
                    </Typography>
                  </Box>
                </>
              )}
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                    <People sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Effectif Total
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', color: C.navy, fontWeight: 700 }}>
                    {selectedEtablissement.effectif_total || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                    Capacité Max
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', color: C.navy, fontWeight: 700 }}>
                    {selectedEtablissement.capacite_maximale || '-'}
                  </Typography>
                </Grid>
              </Grid>
              {selectedEtablissement.budget_alloue && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: C.slate, mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                      <AttachMoney sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Budget Alloué
                    </Typography>
                    <Typography sx={{ fontSize: '1.2rem', color: C.green, fontWeight: 700 }}>
                      {parseFloat(selectedEtablissement.budget_alloue).toLocaleString()} TND
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            borderRadius: '12px',
            boxShadow: `0 4px 14px ${snackbar.severity === 'success' ? C.green : '#EF4444'}40`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionEtablissements;
