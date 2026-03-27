import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, CircularProgress, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, keyframes, Alert, Snackbar, TablePagination,
} from '@mui/material';
import {
  Search, Edit, Visibility,
  Close, Archive,
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
const popIn = keyframes`
  from { opacity:0; transform:scale(0.88); }
  to   { opacity:1; transform:scale(1); }
`;

const GestionSpecialites = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('departements');
  const [departements, setDepartements] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'departement' ou 'specialite'
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pagination
  const [pageDept, setPageDept] = useState(0);
  const [rowsPerPageDept, setRowsPerPageDept] = useState(10);
  const [pageSpec, setPageSpec] = useState(0);
  const [rowsPerPageSpec, setRowsPerPageSpec] = useState(10);

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    id_etablissement: '',
    id_departement: '',
    niveau: ''
  });

  // Formulaire département
  const [deptForm, setDeptForm] = useState({
    code_departement: '',
    nom_departement: '',
    chef_departement: '',
    id_etablissement: ''
  });

  // Formulaire spécialité
  const [specForm, setSpecForm] = useState({
    code_specialite: '',
    nom_specialite: '',
    niveau: 'Licence',
    capacite_max: '',
    id_departement: '',
    id_etablissement: ''
  });

  // Stats
  const [stats, setStats] = useState({
    totalSpecialites: 0,
    totalDepartements: 0,
    totalEtablissements: 0,
    totalNiveaux: 4
  });

  useEffect(() => {
    fetchData();
    fetchEtablissements();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Construire les paramètres pour les départements
      const deptParams = {};
      if (filters.id_etablissement) {
        deptParams.id_rectorat = filters.id_etablissement;
      }
      
      // Construire les paramètres pour les spécialités
      const specParams = {};
      if (filters.id_etablissement) {
        specParams.id_rectorat = filters.id_etablissement;
      }
      if (filters.id_departement) {
        specParams.id_departement = filters.id_departement;
      }
      if (filters.niveau) {
        specParams.niveau = filters.niveau;
      }
      
      const [deptRes, specRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/specialites/departements`, {
          headers: { Authorization: `Bearer ${token}` },
          params: deptParams
        }),
        axios.get(`${API_BASE_URL}/specialites`, {
          headers: { Authorization: `Bearer ${token}` },
          params: specParams
        })
      ]);

      if (deptRes.data.success) {
        setDepartements(deptRes.data.departements);
        setStats(prev => ({ ...prev, totalDepartements: deptRes.data.departements.length }));
      }
      if (specRes.data.success) {
        setSpecialites(specRes.data.specialites);
        setStats(prev => ({ ...prev, totalSpecialites: specRes.data.specialites.length }));
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setSnackbar({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEtablissements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/etablissements/universites`);
      if (response.data.success) {
        setEtablissements(response.data.data);
        setStats(prev => ({ ...prev, totalEtablissements: response.data.data.length }));
      }
    } catch (error) {
      console.error('Erreur chargement établissements:', error);
    }
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setIsEditing(!!item);
    setSelectedItem(item);
    
    if (type === 'departement') {
      setDeptForm(item ? {
        code_departement: item.code_departement,
        nom_departement: item.nom_departement,
        chef_departement: item.chef_departement || '',
        id_etablissement: item.id_etablissement
      } : {
        code_departement: '',
        nom_departement: '',
        chef_departement: '',
        id_etablissement: ''
      });
    } else {
      setSpecForm(item ? {
        code_specialite: item.code_specialite,
        nom_specialite: item.nom_specialite,
        niveau: item.niveau,
        capacite_max: item.capacite_max || '',
        id_departement: item.id_departement,
        id_etablissement: item.id_etablissement
      } : {
        code_specialite: '',
        nom_specialite: '',
        niveau: 'Licence',
        capacite_max: '',
        id_departement: '',
        id_etablissement: ''
      });
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = modalType === 'departement' ? 'departements' : '';
      const data = modalType === 'departement' ? deptForm : specForm;
      
      if (isEditing) {
        const id = modalType === 'departement' ? selectedItem.id_departement : selectedItem.id_specialite;
        await axios.put(
          `${API_BASE_URL}/specialites/${endpoint}${endpoint ? '/' : ''}${id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: `${modalType === 'departement' ? 'Département' : 'Spécialité'} modifié avec succès`, severity: 'success' });
      } else {
        await axios.post(
          `${API_BASE_URL}/specialites${endpoint ? '/' + endpoint : ''}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: `${modalType === 'departement' ? 'Département' : 'Spécialité'} créé avec succès`, severity: 'success' });
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Erreur lors de l\'opération', 
        severity: 'error' 
      });
    }
  };

  const handleArchive = async (type, id) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir archiver ce ${type === 'departement' ? 'département' : 'cette spécialité'} ?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'departement' ? 'departements' : '';
      
      await axios.patch(`${API_BASE_URL}/specialites/${endpoint}${endpoint ? '/' : ''}${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: 'Archivage réussi', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbar({ open: true, message: 'Erreur lors de l\'archivage', severity: 'error' });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Si on change l'établissement, réinitialiser le département
    if (name === 'id_etablissement') {
      setFilters(prev => ({ ...prev, [name]: value, id_departement: '' }));
      setPageDept(0);
      setPageSpec(0);
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Filtrer les données affichées
  const filteredDepartements = departements.filter(dept => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return dept.nom_departement?.toLowerCase().includes(searchLower) ||
             dept.code_departement?.toLowerCase().includes(searchLower) ||
             dept.chef_departement?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const filteredSpecialites = specialites.filter(spec => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return spec.nom_specialite?.toLowerCase().includes(searchLower) ||
             spec.code_specialite?.toLowerCase().includes(searchLower) ||
             spec.nom_departement?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Pagination
  const paginatedDepartements = filteredDepartements.slice(
    pageDept * rowsPerPageDept,
    pageDept * rowsPerPageDept + rowsPerPageDept
  );

  const paginatedSpecialites = filteredSpecialites.slice(
    pageSpec * rowsPerPageSpec,
    pageSpec * rowsPerPageSpec + rowsPerPageSpec
  );

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.id_etablissement) params.append('id_rectorat', filters.id_etablissement);
      if (filters.id_departement) params.append('id_departement', filters.id_departement);
      if (filters.niveau) params.append('niveau', filters.niveau);

      const endpoint = activeTab === 'departements' ? 'departements/export' : 'specialites/export';
      
      const response = await axios.get(`${API_BASE_URL}/specialites/${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = activeTab === 'departements' ? 'departements' : 'specialites';
      link.setAttribute('download', `${filename}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSnackbar({ open: true, message: 'Export réussi', severity: 'success' });
    } catch (error) {
      console.error('Erreur export:', error);
      setSnackbar({ open: true, message: 'Erreur lors de l\'export', severity: 'error' });
    }
  };

  const niveauColors = {
    Licence: { bg: '#DBEAFE', color: '#2563EB' },
    Master: { bg: '#FEF3C7', color: '#F59E0B' },
    Doctorat: { bg: '#F3E8FF', color: '#8B5CF6' },
    Ingénieur: { bg: '#D1FAE5', color: '#059669' },
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
            🎓
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
              Gestion des Spécialités
            </Typography>
            <Typography sx={{ color: C.slate, fontSize: '0.95rem' }}>
              Gérez les départements, spécialités et niveaux académiques
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard/admin/specialites/archives')}
            sx={{
              borderColor: '#F59E0B',
              color: '#F59E0B',
              px: 3,
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              border: '2px solid',
              '&:hover': {
                borderColor: '#F59E0B',
                background: '#FEF3C7',
                border: '2px solid',
              },
            }}
          >
            <span style={{ fontSize: '16px', marginRight: '8px' }}>📦</span> Archives
          </Button>
          <Button
            variant="outlined"
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
            <span style={{ fontSize: '16px', marginRight: '8px' }}>📥</span> Exporter CSV
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/admin/specialites/ajouter')}
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
            <span style={{ fontSize: '16px', marginRight: '8px' }}>➕</span> Ajouter
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            label: 'TOTAL SPÉCIALITÉS', 
            value: stats.totalSpecialites, 
            icon: '🎓', 
            color: '#FF6B35',
            change: '+8 ce mois',
            changePositive: true
          },
          { 
            label: 'DÉPARTEMENTS', 
            value: stats.totalDepartements, 
            icon: '🏢', 
            color: '#06D6A0',
            change: '+3 ce mois',
            changePositive: true
          },
          { 
            label: 'ÉTABLISSEMENTS', 
            value: stats.totalEtablissements, 
            icon: '🏛️', 
            color: '#7B2CBF',
            change: '— stable',
            changePositive: true
          },
          { 
            label: 'NIVEAUX DIPLÔMANTS', 
            value: stats.totalNiveaux, 
            icon: '📚', 
            color: '#FFD60A',
            change: '+1 ce mois',
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

      {/* Tabs */}
      <Card sx={{
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        mb: 3,
        background: '#fff',
      }}>
        <Box sx={{ 
          display: 'flex', 
          borderBottom: '1px solid #E5E7EB',
          px: 3,
          gap: 1,
        }}>
          <Button
            onClick={() => setActiveTab('departements')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'departements' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'departements' ? '3px solid #2563EB' : '3px solid transparent',
              borderRadius: 0,
              px: 2,
              py: 2,
              '&:hover': {
                background: 'transparent',
                color: '#2563EB',
              },
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🏢</span> Départements
            <Chip 
              label={departements.length} 
              size="small" 
              sx={{ 
                ml: 1, 
                background: activeTab === 'departements' ? '#EFF6FF' : '#F1F5F9',
                color: activeTab === 'departements' ? '#2563EB' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
              }} 
            />
          </Button>
          <Button
            onClick={() => setActiveTab('specialites')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'specialites' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'specialites' ? '3px solid #2563EB' : '3px solid transparent',
              borderRadius: 0,
              px: 2,
              py: 2,
              '&:hover': {
                background: 'transparent',
                color: '#2563EB',
              },
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🎯</span> Spécialités
            <Chip 
              label={specialites.length} 
              size="small" 
              sx={{ 
                ml: 1, 
                background: activeTab === 'specialites' ? '#EFF6FF' : '#F1F5F9',
                color: activeTab === 'specialites' ? '#2563EB' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
              }} 
            />
          </Button>
        </Box>

        {/* Filters */}
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={activeTab === 'departements' ? 9 : 4}>
              <TextField
                fullWidth
                size="medium"
                name="search"
                placeholder="Rechercher..."
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
            {activeTab === 'departements' && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="medium">
                  <Select
                    name="id_etablissement"
                    value={filters.id_etablissement}
                    onChange={handleFilterChange}
                    displayEmpty
                    sx={{
                      borderRadius: '12px',
                      background: '#F9FAFB',
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: '#E5E7EB' },
                      '&.Mui-focused fieldset': { borderColor: '#06B6D4', borderWidth: '1px' },
                      '& .MuiSelect-select': {
                        color: filters.id_etablissement ? '#374151' : '#9CA3AF',
                        fontSize: '0.95rem',
                      },
                    }}
                  >
                    <MenuItem value="">Tous les établissements</MenuItem>
                    {etablissements.map(e => (
                      <MenuItem key={e.id} value={e.id}>{e.nom_etablissement}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {activeTab === 'specialites' && (
              <>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="medium">
                    <Select
                      name="id_etablissement"
                      value={filters.id_etablissement}
                      onChange={handleFilterChange}
                      displayEmpty
                      sx={{
                        borderRadius: '12px',
                        background: '#F9FAFB',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: '#E5E7EB' },
                        '&.Mui-focused fieldset': { borderColor: '#06B6D4', borderWidth: '1px' },
                        '& .MuiSelect-select': {
                          color: filters.id_etablissement ? '#374151' : '#9CA3AF',
                          fontSize: '0.95rem',
                        },
                      }}
                    >
                      <MenuItem value="">Tous les établissements</MenuItem>
                      {etablissements.map(e => (
                        <MenuItem key={e.id} value={e.id}>{e.nom_etablissement}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2.5}>
                  <FormControl fullWidth size="medium">
                    <Select
                      name="id_departement"
                      value={filters.id_departement}
                      onChange={handleFilterChange}
                      displayEmpty
                      disabled={!filters.id_etablissement}
                      sx={{
                        borderRadius: '12px',
                        background: '#F9FAFB',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: '#E5E7EB' },
                        '&.Mui-focused fieldset': { borderColor: '#06B6D4', borderWidth: '1px' },
                        '& .MuiSelect-select': {
                          color: filters.id_departement ? '#374151' : '#9CA3AF',
                          fontSize: '0.95rem',
                        },
                      }}
                    >
                      <MenuItem value="">Tous les départements</MenuItem>
                      {departements
                        .filter(d => !filters.id_etablissement || d.id_etablissement === parseInt(filters.id_etablissement))
                        .map(d => (
                          <MenuItem key={d.id_departement} value={d.id_departement}>{d.nom_departement}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2.5}>
                  <FormControl fullWidth size="medium">
                    <Select
                      name="niveau"
                      value={filters.niveau}
                      onChange={handleFilterChange}
                      displayEmpty
                      sx={{
                        borderRadius: '12px',
                        background: '#F9FAFB',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: '#E5E7EB' },
                        '&.Mui-focused fieldset': { borderColor: '#06B6D4', borderWidth: '1px' },
                        '& .MuiSelect-select': {
                          color: filters.niveau ? '#374151' : '#9CA3AF',
                          fontSize: '0.95rem',
                        },
                      }}
                    >
                      <MenuItem value="">Tous les niveaux</MenuItem>
                      <MenuItem value="Licence">Licence</MenuItem>
                      <MenuItem value="Master">Master</MenuItem>
                      <MenuItem value="Ingénieur">Ingénieur</MenuItem>
                      <MenuItem value="Doctorat">Doctorat</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
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
                  {activeTab === 'departements' ? (
                    <>
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
                        CHEF DE DÉPARTEMENT
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
                        ÉTABLISSEMENT
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
                    </>
                  ) : (
                    <>
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
                        NIVEAU
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
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        color: '#9CA3AF', 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #F3F4F6',
                        py: 2,
                      }}>
                        DÉPARTEMENT
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
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {activeTab === 'departements' ? (
                  paginatedDepartements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
                        Aucun département trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDepartements.map((dept, index) => (
                      <TableRow
                        key={dept.id_departement}
                        sx={{
                          '&:hover': { background: '#F9FAFB' },
                          transition: 'background 0.2s',
                          borderBottom: index === paginatedDepartements.length - 1 ? 'none' : '1px solid #F3F4F6',
                        }}
                      >
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip
                            label={dept.code_departement}
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
                          {dept.nom_departement}
                        </TableCell>
                        <TableCell sx={{ 
                          py: 3,
                          borderBottom: 'none',
                          color: '#6B7280',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                        }}>
                          {dept.chef_departement || '-'}
                        </TableCell>
                        <TableCell sx={{ 
                          py: 3,
                          borderBottom: 'none',
                          color: '#6B7280',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                        }}>
                          {dept.nom_etablissement}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 3, borderBottom: 'none' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenModal('departement', dept)}
                              sx={{
                                width: 36,
                                height: 36,
                                background: '#DBEAFE',
                                color: '#2563EB',
                                '&:hover': { 
                                  background: '#2563EB', 
                                  color: '#fff',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleArchive('departement', dept.id_departement)}
                              sx={{
                                width: 36,
                                height: 36,
                                background: '#FEF3C7',
                                color: '#F59E0B',
                                '&:hover': { 
                                  background: '#F59E0B', 
                                  color: '#fff',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <Archive fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  paginatedSpecialites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
                        Aucune spécialité trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSpecialites.map((spec, index) => (
                      <TableRow
                        key={spec.id_specialite}
                        sx={{
                          '&:hover': { background: '#F9FAFB' },
                          transition: 'background 0.2s',
                          borderBottom: index === paginatedSpecialites.length - 1 ? 'none' : '1px solid #F3F4F6',
                        }}
                      >
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip
                            label={spec.code_specialite}
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
                          {spec.nom_specialite}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip
                            label={spec.niveau}
                            size="small"
                            sx={{
                              background: niveauColors[spec.niveau]?.bg || '#FEF3C7',
                              color: niveauColors[spec.niveau]?.color || '#F59E0B',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              textTransform: 'uppercase',
                              height: '28px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ 
                          py: 3,
                          borderBottom: 'none',
                          color: '#1F2937',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                        }}>
                          {spec.capacite_max || '-'}
                        </TableCell>
                        <TableCell sx={{ 
                          py: 3,
                          borderBottom: 'none',
                          color: '#6B7280',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                        }}>
                          {spec.nom_departement}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 3, borderBottom: 'none' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenModal('specialite', spec)}
                              sx={{
                                width: 36,
                                height: 36,
                                background: '#DBEAFE',
                                color: '#2563EB',
                                '&:hover': { 
                                  background: '#2563EB', 
                                  color: '#fff',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleArchive('specialite', spec.id_specialite)}
                              sx={{
                                width: 36,
                                height: 36,
                                background: '#FEF3C7',
                                color: '#F59E0B',
                                '&:hover': { 
                                  background: '#F59E0B', 
                                  color: '#fff',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <Archive fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            borderTop: '1px solid #F3F4F6',
            background: '#FAFBFC',
          }}>
            {activeTab === 'departements' ? (
              <TablePagination
                component="div"
                count={filteredDepartements.length}
                page={pageDept}
                onPageChange={(e, newPage) => setPageDept(newPage)}
                rowsPerPage={rowsPerPageDept}
                onRowsPerPageChange={(e) => {
                  setRowsPerPageDept(parseInt(e.target.value, 10));
                  setPageDept(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `Page ${pageDept + 1} sur ${Math.ceil(count / rowsPerPageDept) || 1}`}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    fontSize: '0.875rem',
                    color: '#6B7280',
                  },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: '0.875rem',
                    color: '#6B7280',
                  },
                }}
              />
            ) : (
              <TablePagination
                component="div"
                count={filteredSpecialites.length}
                page={pageSpec}
                onPageChange={(e, newPage) => setPageSpec(newPage)}
                rowsPerPage={rowsPerPageSpec}
                onRowsPerPageChange={(e) => {
                  setRowsPerPageSpec(parseInt(e.target.value, 10));
                  setPageSpec(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `Page ${pageSpec + 1} sur ${Math.ceil(count / rowsPerPageSpec) || 1}`}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    fontSize: '0.875rem',
                    color: '#6B7280',
                  },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: '0.875rem',
                    color: '#6B7280',
                  },
                }}
              />
            )}
          </Box>
        </Card>
      )}

      {/* Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #E5E7EB',
          pb: 2,
        }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#1F2937' }}>
            {isEditing ? 'Modifier' : 'Ajouter'} {modalType === 'departement' ? 'un département' : 'une spécialité'}
          </Typography>
          <IconButton onClick={() => setShowModal(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              {modalType === 'departement' ? (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Code département"
                      value={deptForm.code_departement}
                      onChange={(e) => setDeptForm({ ...deptForm, code_departement: e.target.value })}
                      required
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
                      label="Nom département"
                      value={deptForm.nom_departement}
                      onChange={(e) => setDeptForm({ ...deptForm, nom_departement: e.target.value })}
                      required
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
                      label="Chef département"
                      value={deptForm.chef_departement}
                      onChange={(e) => setDeptForm({ ...deptForm, chef_departement: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Établissement</InputLabel>
                      <Select
                        value={deptForm.id_etablissement}
                        onChange={(e) => setDeptForm({ ...deptForm, id_etablissement: e.target.value })}
                        label="Établissement"
                        sx={{
                          borderRadius: '12px',
                        }}
                      >
                        {etablissements.map(e => (
                          <MenuItem key={e.id} value={e.id}>{e.nom_etablissement}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Code spécialité"
                      value={specForm.code_specialite}
                      onChange={(e) => setSpecForm({ ...specForm, code_specialite: e.target.value })}
                      required
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
                      label="Nom spécialité"
                      value={specForm.nom_specialite}
                      onChange={(e) => setSpecForm({ ...specForm, nom_specialite: e.target.value })}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Niveau</InputLabel>
                      <Select
                        value={specForm.niveau}
                        onChange={(e) => setSpecForm({ ...specForm, niveau: e.target.value })}
                        label="Niveau"
                        sx={{
                          borderRadius: '12px',
                        }}
                      >
                        <MenuItem value="Licence">Licence</MenuItem>
                        <MenuItem value="Master">Master</MenuItem>
                        <MenuItem value="Doctorat">Doctorat</MenuItem>
                        <MenuItem value="Ingénieur">Ingénieur</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Capacité maximale"
                      type="number"
                      value={specForm.capacite_max}
                      onChange={(e) => setSpecForm({ ...specForm, capacite_max: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Établissement</InputLabel>
                      <Select
                        value={specForm.id_etablissement}
                        onChange={(e) => {
                          setSpecForm({ ...specForm, id_etablissement: e.target.value, id_departement: '' });
                        }}
                        label="Établissement"
                        sx={{
                          borderRadius: '12px',
                        }}
                      >
                        {etablissements.map(e => (
                          <MenuItem key={e.id} value={e.id}>{e.nom_etablissement}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Département</InputLabel>
                      <Select
                        value={specForm.id_departement}
                        onChange={(e) => setSpecForm({ ...specForm, id_departement: e.target.value })}
                        label="Département"
                        disabled={!specForm.id_etablissement}
                        sx={{
                          borderRadius: '12px',
                        }}
                      >
                        {departements
                          .filter(d => d.id_etablissement === specForm.id_etablissement)
                          .map(d => (
                            <MenuItem key={d.id_departement} value={d.id_departement}>{d.nom_departement}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #E5E7EB' }}>
            <Button 
              onClick={() => setShowModal(false)} 
              sx={{ 
                textTransform: 'none',
                color: '#6B7280',
                fontWeight: 600,
              }}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ 
                textTransform: 'none',
                background: '#2563EB',
                fontWeight: 700,
                px: 3,
                borderRadius: '10px',
                '&:hover': {
                  background: '#1D4ED8',
                },
              }}
            >
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionSpecialites;
