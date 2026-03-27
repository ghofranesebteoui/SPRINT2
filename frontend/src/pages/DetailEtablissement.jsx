import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, IconButton, Grid, keyframes, Pagination,
} from '@mui/material';
import {
  ArrowBack, Edit, Delete, FileDownload, Visibility,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.apiUrl;

const C = {
  navy: '#0c1e3e', blue: '#1e6ef5', blueL: '#e8f0fe',
  green: '#10b981', greenL: '#d1fae5', red: '#ef4444', redL: '#fee2e2',
  amber: '#f59e0b', amberL: '#fef3c7', purple: '#7c3aed', purpleL: '#ede9fe',
  tealL: '#e0f2fe', bg: '#f4f6fb', border: '#e2e8f0',
  textDark: '#0f172a', textMid: '#475569', textSoft: '#94a3b8',
};

const fadeUp = keyframes`
  from { opacity:0; transform:translateY(10px); }
  to { opacity:1; transform:translateY(0); }
`;

const DetailEtablissement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [etablissement, setEtablissement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedDept, setExpandedDept] = useState(null);
  const [departements, setDepartements] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [specialitesPage, setSpecialitesPage] = useState(1);
  const [enseignantsPage, setEnseignantsPage] = useState(1);
  const [specialitesPagination, setSpecialitesPagination] = useState({ total: 0, totalPages: 0 });
  const [enseignantsPagination, setEnseignantsPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    fetchEtablissement();
  }, [id]);

  useEffect(() => {
    // Réinitialiser les pages quand on change d'onglet
    setSpecialitesPage(1);
    setEnseignantsPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (etablissement && id) {
      fetchTabData();
    }
  }, [activeTab, etablissement, id, specialitesPage, enseignantsPage]);

  const fetchEtablissement = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/etablissements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setEtablissement(response.data.etablissement);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    setLoadingTab(true);
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 0) {
        // Fetch départements
        console.log('Fetching departements for etablissement:', id);
        const response = await axios.get(`${API_BASE_URL}/etablissements/${id}/departements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Departements response:', response.data);
        if (response.data.success) {
          setDepartements(response.data.departements);
        }
      } else if (activeTab === 1) {
        // Fetch spécialités avec pagination
        console.log('Fetching specialites for etablissement:', id, 'page:', specialitesPage);
        const response = await axios.get(`${API_BASE_URL}/etablissements/${id}/specialites?page=${specialitesPage}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Specialites response:', response.data);
        if (response.data.success) {
          setSpecialites(response.data.specialites);
          setSpecialitesPagination(response.data.pagination);
        }
      } else if (activeTab === 2) {
        // Fetch enseignants avec pagination
        console.log('Fetching enseignants for etablissement:', id, 'page:', enseignantsPage);
        const response = await axios.get(`${API_BASE_URL}/etablissements/${id}/enseignants?page=${enseignantsPage}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Enseignants response:', response.data);
        if (response.data.success) {
          setEnseignants(response.data.enseignants);
          setEnseignantsPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Erreur fetchTabData:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoadingTab(false);
    }
  };

  const fetchSpecialitesByDepartement = async (departementId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/etablissements/departements/${departementId}/specialites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        return response.data.specialites;
      }
      return [];
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Typography>Chargement...</Typography></Box>;
  if (!etablissement) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Typography>Établissement non trouvé</Typography></Box>;

  const typeColors = {
    FACULTE: { bg: C.amberL, color: C.amber },
    ECOLE: { bg: C.tealL, color: '#075985' },
    INSTITUT: { bg: C.amberL, color: C.amber },
    ISET: { bg: C.purpleL, color: C.purple },
  };

  const tauxRemplissage = etablissement.capacite_maximale 
    ? Math.round((etablissement.effectif_total / etablissement.capacite_maximale) * 100)
    : 0;

  return (
    <Box sx={{ animation: `${fadeUp} 0.35s ease both`, pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, fontSize: '12.5px', color: C.textSoft }}>
            <Typography onClick={() => navigate('/dashboard/admin/etablissements')} sx={{ color: C.blue, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Établissements
            </Typography>
            <span>›</span>
            <span>{etablissement.code_etablissement}</span>
          </Box>
          <Typography sx={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '22px', color: C.navy, mb: 1 }}>
            {etablissement.nom_etablissement}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '13px', color: '#64748B' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>🏢</span>
              <span style={{ fontWeight: 600 }}>{etablissement.nombre_departements || 0}</span>
              <span>Départements</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>🎯</span>
              <span style={{ fontWeight: 600 }}>{etablissement.nombre_specialites || 0}</span>
              <span>Spécialités</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>👨‍🏫</span>
              <span style={{ fontWeight: 600 }}>{etablissement.nombre_enseignants || 0}</span>
              <span>Enseignants</span>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<span style={{ fontSize: '16px' }}>📦</span>}
            onClick={async () => {
              if (window.confirm('Êtes-vous sûr de vouloir archiver cet établissement ?')) {
                try {
                  const token = localStorage.getItem('token');
                  await axios.delete(`${API_BASE_URL}/etablissements/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  navigate('/dashboard/admin/etablissements');
                } catch (error) {
                  console.error('Erreur:', error);
                  alert('Erreur lors de l\'archivage');
                }
              }
            }}
            sx={{ 
              borderColor: '#fecaca', 
              background: C.redL, 
              color: C.red, 
              textTransform: 'none', 
              fontWeight: 600, 
              fontSize: '13px', 
              borderRadius: '11px', 
              '&:hover': { borderColor: '#fecaca', background: '#fecaca' },
              '& .MuiButton-startIcon': { marginRight: '6px' }
            }}
          >
            Archiver
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<span style={{ fontSize: '16px' }}>📄</span>}
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/etablissements/export?id=${id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                  responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `etablissement_${etablissement.code_etablissement}_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              } catch (error) {
                console.error('Erreur export:', error);
                alert('Erreur lors de l\'export');
              }
            }}
            sx={{ 
              borderColor: C.border, 
              color: C.textMid, 
              textTransform: 'none', 
              fontWeight: 600, 
              fontSize: '13px', 
              borderRadius: '11px', 
              '&:hover': { borderColor: '#cbd5e1' },
              '& .MuiButton-startIcon': { marginRight: '6px' }
            }}
          >
            Exporter
          </Button>
          <Button 
            variant="contained" 
            startIcon={<span style={{ fontSize: '16px' }}>✏️</span>}
            onClick={() => navigate(`/dashboard/admin/etablissements/ajouter?edit=${id}`)}
            sx={{ 
              background: C.blue, 
              textTransform: 'none', 
              fontWeight: 600, 
              fontSize: '13px', 
              borderRadius: '11px', 
              boxShadow: '0 4px 14px rgba(30,110,245,0.3)', 
              '&:hover': { background: '#1558cc' },
              '& .MuiButton-startIcon': { marginRight: '6px' }
            }}
          >
            Modifier
          </Button>
        </Box>
      </Box>

      {/* Hero Card */}
      <Card sx={{
        borderRadius: '22px',
        border: '1.5px solid ' + C.border,
        boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
        overflow: 'hidden',
        mb: 2.5,
      }}>
        {/* Cover */}
        <Box sx={{
          height: '110px',
          position: 'relative',
          background: 'radial-gradient(ellipse at 20% 60%, rgba(30,110,245,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(14,165,233,0.1) 0%, transparent 50%), linear-gradient(135deg, #eef4ff 0%, #e0f2fe 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1e6ef5, #0ea5e9)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(30,110,245,0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          },
        }} />

        {/* Identity */}
        <Box sx={{ px: 3.5, pb: 2.5, display: 'flex', alignItems: 'flex-end', gap: 2.25, mt: '-42px', position: 'relative', zIndex: 2 }}>
          <Box sx={{
            width: 76,
            height: 76,
            borderRadius: '20px',
            border: '4px solid #fff',
            background: 'linear-gradient(135deg, #1e6ef5, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            boxShadow: '0 6px 20px rgba(30,110,245,0.28)',
            flexShrink: 0,
          }}>
            🏫
          </Box>
          <Box sx={{ pb: 0.5, flex: 1 }}>
            <Typography sx={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '20px', color: C.textDark, mb: 0.75 }}>
              {etablissement.nom_etablissement}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, flexWrap: 'wrap' }}>
              <Chip
                label={etablissement.type}
                size="small"
                sx={{
                  background: typeColors[etablissement.type]?.bg || C.tealL,
                  color: typeColors[etablissement.type]?.color || '#075985',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderRadius: '20px',
                  height: '24px',
                }}
              />
              <Chip
                label="● Actif"
                size="small"
                sx={{
                  background: C.greenL,
                  color: '#065f46',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderRadius: '20px',
                  height: '24px',
                  border: '1px solid #a7f3d0',
                }}
              />
              <Typography sx={{ fontSize: '12px', color: C.textSoft, fontWeight: 500 }}>
                Code : <Box component="span" sx={{ color: C.blue, fontWeight: 700 }}>{etablissement.code_etablissement}</Box>
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto', flexShrink: 0, alignSelf: 'flex-end', pb: 0.5 }}>
            {[
              { label: 'Étudiants', value: etablissement.effectif_total || 0 },
              { label: 'Enseignants', value: etablissement.nombre_enseignants || 0, color: '#10B981' },
              { label: 'Capacité max', value: etablissement.capacite_maximale || 0, color: C.blue },
            ].map((stat, i) => (
              <Box key={i} sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: '10px 16px',
                borderRadius: '12px',
                background: '#f8faff',
                border: '1.5px solid #dce8fd',
                minWidth: '72px',
                transition: 'all 0.2s',
                cursor: 'default',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 16px rgba(30,110,245,0.12)',
                  background: '#eef4ff',
                },
              }}>
                <Typography sx={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  fontSize: '17px',
                  color: stat.color || C.navy,
                  lineHeight: 1,
                }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: '10px', color: C.textSoft, mt: 0.375, fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {/* Info Grid */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Informations générales */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: '18px',
            border: '1.5px solid ' + C.border,
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
            height: '100%',
          }}>
            <Box sx={{ p: '16px 22px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.125 }}>
                <Box sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                }}>
                  📋
                </Box>
                <Typography sx={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '14px', color: C.textDark }}>
                  Informations générales
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: '20px 22px' }}>
              <Grid container>
                {[
                  { label: 'Code', value: etablissement.code_etablissement },
                  { label: 'Type', value: etablissement.type, chip: true },
                  { label: 'Université', value: etablissement.universite_nom || '-' },
                  { label: 'Ville', value: etablissement.nom_ville || '-' },
                  { label: 'Téléphone', value: etablissement.telephone || '-' },
                  { label: 'Email', value: etablissement.email || '-', email: true },
                  { label: 'Adresse', value: etablissement.adresse || '-', fullWidth: true },
                  { label: 'Site web', value: etablissement.site_web || '-', link: true, fullWidth: true },
                  { label: 'Date de création', value: etablissement.date_creation ? new Date(etablissement.date_creation).toLocaleDateString('fr-FR') : '-', fullWidth: true },
                ].map((item, i) => (
                  <Grid item xs={item.fullWidth ? 12 : 6} key={i}>
                    <Box sx={{ py: 1.5, pr: !item.fullWidth && i % 2 === 0 ? 2.25 : 0, pl: !item.fullWidth && i % 2 === 1 ? 2.25 : 0, borderBottom: i < 8 ? '1px solid #f8fafc' : 'none' }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.9px', textTransform: 'uppercase', color: C.textSoft, mb: 0.375, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {item.label}
                      </Typography>
                      {item.chip ? (
                        <Chip
                          label={item.value}
                          size="small"
                          sx={{
                            background: typeColors[item.value]?.bg || C.tealL,
                            color: typeColors[item.value]?.color || '#075985',
                            fontWeight: 700,
                            fontSize: '11px',
                            height: '24px',
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                          }}
                        />
                      ) : item.link && item.value !== '-' ? (
                        <Typography
                          component="a"
                          href={item.value.startsWith('http') ? item.value : `https://${item.value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: C.blue,
                            textDecoration: 'none',
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {item.value}
                        </Typography>
                      ) : (
                        <Typography sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: item.email ? C.blue : C.textDark,
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                        }}>
                          {item.value}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques & Performance */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: '18px',
            border: '1.5px solid ' + C.border,
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
            height: '100%',
          }}>
            <Box sx={{ p: '16px 22px', borderBottom: '1px solid ' + C.border }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.125 }}>
                <Box sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  background: C.blueL,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                }}>
                  📊
                </Box>
                <Typography sx={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '14px', color: C.textDark }}>
                  Statistiques & Performance
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: '20px 22px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { 
                    label: 'Budget alloué', 
                    value: etablissement.budget_alloue ? `${parseFloat(etablissement.budget_alloue).toLocaleString()} TND` : 'N/A',
                    icon: '💰',
                    color: '#10B981',
                    bgColor: '#ECFDF5'
                  },
                  { 
                    label: 'Effectif total', 
                    value: etablissement.effectif_total || 0,
                    icon: '👥',
                    color: '#3B82F6',
                    bgColor: '#EFF6FF'
                  },
                  { 
                    label: 'Taux de réussite', 
                    value: etablissement.taux_reussite ? `${parseFloat(etablissement.taux_reussite).toFixed(1)}%` : 'N/A',
                    percent: etablissement.taux_reussite || 0,
                    icon: '✅',
                    color: '#10B981',
                    bgColor: '#ECFDF5',
                    showBar: true
                  },
                  { 
                    label: 'Taux d\'échec', 
                    value: etablissement.taux_echec ? `${parseFloat(etablissement.taux_echec).toFixed(1)}%` : 'N/A',
                    percent: etablissement.taux_echec || 0,
                    icon: '❌',
                    color: '#EF4444',
                    bgColor: '#FEE2E2',
                    showBar: true
                  },
                  { 
                    label: 'Performance globale', 
                    value: etablissement.performance ? `${parseFloat(etablissement.performance).toFixed(1)}%` : 'N/A',
                    percent: etablissement.performance || 0,
                    icon: '⭐',
                    color: '#F59E0B',
                    bgColor: '#FEF3C7',
                    showBar: true
                  },
                ].map((item, i) => (
                  <Box key={i} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    background: '#FAFBFF',
                    border: '1px solid #F1F5F9',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: item.bgColor,
                      borderColor: item.color + '30',
                    }
                  }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      background: item.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '11px', color: C.textSoft, fontWeight: 600, mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      {item.showBar ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1, height: '6px', background: '#F1F5F9', borderRadius: '20px', overflow: 'hidden' }}>
                            <Box sx={{
                              height: '100%',
                              width: `${item.percent}%`,
                              background: item.color,
                              borderRadius: '20px',
                              transition: 'width 0.3s ease',
                            }} />
                          </Box>
                          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: item.color, minWidth: '45px', textAlign: 'right' }}>
                            {item.value}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: C.textDark }}>
                          {item.value}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Card */}
      <Card sx={{
        borderRadius: '18px',
        border: '1.5px solid ' + C.border,
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
        overflow: 'hidden',
      }}>
        <Box sx={{ borderBottom: '1px solid ' + C.border, background: '#fafbff', px: 2.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              minHeight: '48px',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                color: C.textSoft,
                minHeight: '48px',
                px: 2,
                gap: 0.5,
                '&.Mui-selected': {
                  color: C.blue,
                  fontWeight: 700,
                },
              },
              '& .MuiTabs-indicator': {
                height: '2.5px',
                backgroundColor: C.blue,
              },
            }}
          >
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><span>🏢</span><span>Départements</span><Chip label={etablissement.nombre_departements || 0} size="small" sx={{ height: '18px', fontSize: '10px', fontWeight: 700, background: activeTab === 0 ? C.blue : C.blueL, color: activeTab === 0 ? '#fff' : C.blue, '& .MuiChip-label': { px: 0.875 } }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><span>🎯</span><span>Spécialités</span><Chip label={etablissement.nombre_specialites || 0} size="small" sx={{ height: '18px', fontSize: '10px', fontWeight: 700, background: activeTab === 1 ? C.blue : C.blueL, color: activeTab === 1 ? '#fff' : C.blue, '& .MuiChip-label': { px: 0.875 } }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><span>👨‍🏫</span><span>Enseignants</span><Chip label={etablissement.nombre_enseignants || 0} size="small" sx={{ height: '18px', fontSize: '10px', fontWeight: 700, background: activeTab === 2 ? C.blue : C.blueL, color: activeTab === 2 ? '#fff' : C.blue, '& .MuiChip-label': { px: 0.875 } }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><span>⏰</span><span>Activité</span></Box>} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box>
          {/* Départements Tab */}
          {activeTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'transparent' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      CODE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      DÉPARTEMENT
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      CHEF DE DÉPARTEMENT
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      SPÉCIALITÉS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      ENSEIGNANTS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingTab ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography>Chargement...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : departements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">Aucun département trouvé</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    departements.map((dept, index) => (
                      <TableRow key={dept.id_departement} sx={{ '&:hover': { background: '#F9FAFB' }, transition: 'background 0.2s', borderBottom: index === departements.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip label={dept.code_departement} sx={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', borderRadius: '8px', height: '32px' }} />
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#1F2937', fontWeight: 600, fontSize: '0.95rem' }}>
                          {dept.nom_departement}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.9rem' }}>
                          {dept.chef_departement || '-'}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip label={`${dept.nombre_specialites} spécialités`} size="small" sx={{ background: C.greenL, color: '#065f46', fontWeight: 700, fontSize: '0.8rem', borderRadius: '8px', height: '28px' }} />
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip label={`${dept.nombre_enseignants} enseignants`} size="small" sx={{ background: C.purpleL, color: C.purple, fontWeight: 700, fontSize: '0.8rem', borderRadius: '8px', height: '28px' }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Spécialités Tab */}
          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'transparent' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      CODE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      INTITULÉ
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      DÉPARTEMENT
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      NIVEAU
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      ÉTUDIANTS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      TAUX REMPLISSAGE
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingTab ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography>Chargement...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : specialites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">Aucune spécialité trouvée</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    specialites.map((spec, index) => (
                      <TableRow key={spec.id_specialite} sx={{ '&:hover': { background: '#F9FAFB' }, transition: 'background 0.2s', borderBottom: index === specialites.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip label={spec.code_specialite} sx={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', borderRadius: '8px', height: '32px' }} />
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#1F2937', fontWeight: 600, fontSize: '0.95rem' }}>
                          {spec.nom_specialite}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.9rem' }}>
                          {spec.nom_departement}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip label={spec.niveau} size="small" sx={{ background: spec.niveau === 'Master' ? C.purpleL : C.amberL, color: spec.niveau === 'Master' ? C.purple : C.amber, fontWeight: 700, fontSize: '0.75rem', borderRadius: '8px', height: '28px' }} />
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Typography sx={{ color: '#1F2937', fontWeight: 600, fontSize: '0.95rem' }}>
                            {spec.nombre_etudiants}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1, maxWidth: '120px', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                              <Box sx={{ 
                                height: '100%', 
                                width: `${spec.taux_remplissage}%`, 
                                background: spec.taux_remplissage >= 90 ? '#EF4444' : spec.taux_remplissage >= 80 ? '#F59E0B' : '#10B981', 
                                borderRadius: '3px' 
                              }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1F2937', minWidth: '40px' }}>
                              {spec.taux_remplissage}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Pagination pour Spécialités */}
          {activeTab === 1 && specialitesPagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid #F3F4F6' }}>
              <Pagination 
                count={specialitesPagination.totalPages} 
                page={specialitesPage} 
                onChange={(e, page) => setSpecialitesPage(page)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* Enseignants Tab */}
          {activeTab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'transparent' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      MATRICULE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      NOM & PRÉNOM
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      DÉPARTEMENT
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      GRADE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      EMAIL
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                      TÉLÉPHONE
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingTab ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography>Chargement...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : enseignants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">Aucun enseignant trouvé</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    enseignants.map((ens, index) => (
                      <TableRow key={ens.numero_utilisateur} sx={{ '&:hover': { background: '#F9FAFB' }, transition: 'background 0.2s', borderBottom: index === enseignants.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip label={ens.matricule} sx={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', borderRadius: '8px', height: '32px' }} />
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#1F2937', fontWeight: 600, fontSize: '0.95rem' }}>
                          {ens.nom} {ens.prenom}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.9rem' }}>
                          {ens.nom_departement || '-'}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none' }}>
                          <Chip 
                            label={ens.grade || 'N/A'} 
                            size="small" 
                            sx={{ 
                              background: ens.grade === 'Professeur' ? C.purpleL : ens.grade === 'Maître de conférences' ? C.blueL : C.greenL, 
                              color: ens.grade === 'Professeur' ? C.purple : ens.grade === 'Maître de conférences' ? C.blue : '#065f46', 
                              fontWeight: 700, 
                              fontSize: '0.75rem', 
                              borderRadius: '8px', 
                              height: '28px' 
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: C.blue, fontWeight: 500, fontSize: '0.9rem' }}>
                          {ens.email || '-'}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.9rem' }}>
                          {ens.telephone || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Pagination pour Enseignants */}
          {activeTab === 2 && enseignantsPagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid #F3F4F6' }}>
              <Pagination 
                count={enseignantsPagination.totalPages} 
                page={enseignantsPage} 
                onChange={(e, page) => setEnseignantsPage(page)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
          
          {/* Activité Tab */}
          {activeTab === 3 && (
            <Box sx={{ p: '20px 22px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { icon: '✏️', bg: '#eff6ff', title: 'Informations générales mises à jour', date: 'Il y a 2 jours · 14:32' },
                  { icon: '➕', bg: C.greenL, title: 'Nouvelle spécialité "IA & Data" ajoutée — Dept. Informatique', date: 'Il y a 5 jours · 09:15' },
                  { icon: '🏢', bg: C.purpleL, title: 'Département "Génie des Systèmes" créé', date: 'Il y a 1 semaine · 11:00' },
                  { icon: '👥', bg: C.amberL, title: 'Effectifs mis à jour — +120 inscrits en Licence 1', date: 'Il y a 2 semaines · 08:45' },
                  { icon: '📋', bg: '#fce7f3', title: 'Niveau Master 2 ouvert pour l\'année 2025-2026', date: 'Il y a 1 mois · 15:20' },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.75, pb: i < 4 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <Box sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '9px',
                        background: item.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                      }}>
                        {item.icon}
                      </Box>
                      {i < 4 && (
                        <Box sx={{ width: '2px', flex: 1, background: '#f1f5f9', mt: 0.625 }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, pt: 0.375 }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: C.textDark }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: C.textSoft, mt: 0.25 }}>
                        {item.date}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default DetailEtablissement;
