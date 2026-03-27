import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Select, MenuItem, FormControl, Grid,
  Chip, CircularProgress, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, keyframes, Alert, Snackbar, TablePagination,
} from '@mui/material';
import {
  Search, RestoreFromTrash, Close,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.apiUrl;

const C = {
  navy: '#1A3A6B',
  blue: '#4D9FFF',
  blueL: '#EAF4FF',
  orange: '#FF6B35',
  green: '#06D6A0',
  slate: '#64748B',
};

const fadeUp = keyframes`
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
`;

const SpecialitesArchivees = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('departements');
  const [departements, setDepartements] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pageDept, setPageDept] = useState(0);
  const [pageSpec, setPageSpec] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [deptRes, specRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/specialites/departements/archives`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/specialites/archives`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      if (deptRes.data.success) setDepartements(deptRes.data.departements || []);
      if (specRes.data.success) setSpecialites(specRes.data.specialites || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setSnackbar({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type, id) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir restaurer ce ${type === 'departement' ? 'département' : 'cette spécialité'} ?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'departement' ? 'departements' : '';
      
      await axios.patch(`${API_BASE_URL}/specialites/${endpoint}${endpoint ? '/' : ''}${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: 'Restauration réussie', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbar({ open: true, message: 'Erreur lors de la restauration', severity: 'error' });
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredDepartements = departements.filter(dept => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return dept.nom_departement?.toLowerCase().includes(searchLower) ||
             dept.code_departement?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const filteredSpecialites = specialites.filter(spec => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return spec.nom_specialite?.toLowerCase().includes(searchLower) ||
             spec.code_specialite?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const paginatedDepartements = filteredDepartements.slice(
    pageDept * rowsPerPage,
    pageDept * rowsPerPage + rowsPerPage
  );

  const paginatedSpecialites = filteredSpecialites.slice(
    pageSpec * rowsPerPage,
    pageSpec * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ animation: `${fadeUp} 0.5s ease-out` }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/dashboard/admin/specialites')}
            sx={{
              background: '#F3F4F6',
              width: 48,
              height: 48,
              '&:hover': { background: '#E5E7EB' },
            }}
          >
            <span style={{ fontSize: '20px' }}>←</span>
          </IconButton>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}>
            📦
          </Box>
          <Box>
            <Typography sx={{ 
              fontWeight: 900, 
              color: C.navy, 
              fontSize: '1.8rem', 
              letterSpacing: '-0.5px', 
              mb: 0.3,
              lineHeight: 1.2,
            }}>
              Archives des Spécialités
            </Typography>
            <Typography sx={{ color: C.slate, fontSize: '0.95rem' }}>
              Consultez et restaurez les départements et spécialités archivés
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography sx={{ 
                  fontSize: '0.7rem', 
                  color: '#9CA3AF', 
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}>
                  DÉPARTEMENTS ARCHIVÉS
                </Typography>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  🏢
                </Box>
              </Box>
              <Typography sx={{ 
                fontSize: '2.8rem', 
                fontWeight: 900, 
                color: '#1F2937', 
              }}>
                {departements.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography sx={{ 
                  fontSize: '0.7rem', 
                  color: '#9CA3AF', 
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}>
                  SPÉCIALITÉS ARCHIVÉES
                </Typography>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  🎯
                </Box>
              </Box>
              <Typography sx={{ 
                fontSize: '2.8rem', 
                fontWeight: 900, 
                color: '#1F2937', 
              }}>
                {specialites.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
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
            <Grid item xs={12}>
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
                  },
                }}
              />
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
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)',
          }} />
          
          <TableContainer sx={{ mt: '4px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'transparent' }}>
                  {activeTab === 'departements' ? (
                    <>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        CODE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        NOM
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        ÉTABLISSEMENT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        DATE ARCHIVAGE
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        ACTIONS
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        CODE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        NOM
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        NIVEAU
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        DÉPARTEMENT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                        DATE ARCHIVAGE
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6', py: 2 }}>
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
                        Aucun département archivé
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
                              background: '#FEF3C7',
                              color: '#F59E0B',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              borderRadius: '8px',
                              height: '32px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#1F2937', fontWeight: 500, fontSize: '0.95rem' }}>
                          {dept.nom_departement}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.95rem' }}>
                          {dept.nom_etablissement}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.95rem' }}>
                          {dept.archived_at ? new Date(dept.archived_at).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 3, borderBottom: 'none' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRestore('departement', dept.id_departement)}
                            sx={{
                              width: 36,
                              height: 36,
                              background: '#D1FAE5',
                              color: '#059669',
                              '&:hover': { 
                                background: '#059669', 
                                color: '#fff',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s',
                            }}
                          >
                            <RestoreFromTrash fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  paginatedSpecialites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
                        Aucune spécialité archivée
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
                              background: '#FEF3C7',
                              color: '#F59E0B',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              borderRadius: '8px',
                              height: '32px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#1F2937', fontWeight: 500, fontSize: '0.95rem' }}>
                          {spec.nom_specialite}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.95rem' }}>
                          {spec.niveau}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.95rem' }}>
                          {spec.nom_departement}
                        </TableCell>
                        <TableCell sx={{ py: 3, borderBottom: 'none', color: '#6B7280', fontWeight: 500, fontSize: '0.95rem' }}>
                          {spec.archived_at ? new Date(spec.archived_at).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 3, borderBottom: 'none' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRestore('specialite', spec.id_specialite)}
                            sx={{
                              width: 36,
                              height: 36,
                              background: '#D1FAE5',
                              color: '#059669',
                              '&:hover': { 
                                background: '#059669', 
                                color: '#fff',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s',
                            }}
                          >
                            <RestoreFromTrash fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F3F4F6', px: 2 }}>
            <TablePagination
              component="div"
              count={activeTab === 'departements' ? filteredDepartements.length : filteredSpecialites.length}
              page={activeTab === 'departements' ? pageDept : pageSpec}
              onPageChange={(e, newPage) => activeTab === 'departements' ? setPageDept(newPage) : setPageSpec(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPageDept(0);
                setPageSpec(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                '& .MuiTablePagination-select': {
                  borderRadius: '8px',
                },
                '& .MuiTablePagination-actions button': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
        </Card>
      )}

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

export default SpecialitesArchivees;
