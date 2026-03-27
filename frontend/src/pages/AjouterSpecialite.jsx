import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid, IconButton,
  Tabs, Tab, keyframes, Alert, Snackbar,
} from '@mui/material';
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

const AjouterSpecialite = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [etablissements, setEtablissements] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Formulaire département
  const [deptForm, setDeptForm] = useState({
    code_departement: '',
    nom_departement: '',
    description: '',
    chef_departement: '',
    id_etablissement: '',
  });

  // Formulaire niveau
  const [niveauForm, setNiveauForm] = useState({
    type_niveau: 'Licence',
    nom_niveau: '',
    duree_annees: '',
    description: '',
    id_departement: '',
  });

  // Charger les niveaux quand on change de département dans le formulaire spécialité
  useEffect(() => {
    if (niveauForm.id_departement) {
      fetchNiveaux(niveauForm.id_departement);
    }
  }, [niveauForm.id_departement]);

  // Formulaire spécialité
  const [specForm, setSpecForm] = useState({
    code_specialite: '',
    nom_specialite: '',
    description: '',
    nombre_credits: '',
    duree_formation: '',
    id_niveau: '',
    id_departement_temp: '', // Pour charger les niveaux
  });

  useEffect(() => {
    fetchEtablissements();
    fetchDepartements();
  }, []);

  const fetchEtablissements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/etablissements/universites`);
      if (response.data.success) {
        setEtablissements(response.data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchDepartements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/specialites/departements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDepartements(response.data.departements);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchNiveaux = async (idDepartement) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/specialites/niveaux?id_departement=${idDepartement}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNiveaux(response.data.niveaux);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmitDepartement = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/specialites/departements`, deptForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Département créé avec succès', severity: 'success' });
      setTimeout(() => navigate('/dashboard/admin/specialites'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur', severity: 'error' });
    }
  };

  const handleSubmitNiveau = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/specialites/niveaux`, niveauForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Niveau créé avec succès', severity: 'success' });
      setTimeout(() => navigate('/dashboard/admin/specialites'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur', severity: 'error' });
    }
  };

  const handleSubmitSpecialite = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/specialites`, specForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Spécialité créée avec succès', severity: 'success' });
      setTimeout(() => navigate('/dashboard/admin/specialites'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur', severity: 'error' });
    }
  };

  return (
    <Box sx={{ animation: `${fadeUp} 0.5s ease-out` }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <Box>
            <Typography sx={{ 
              fontWeight: 900, 
              color: C.navy, 
              fontSize: '1.8rem', 
              letterSpacing: '-0.5px', 
              mb: 0.3,
              lineHeight: 1.2,
            }}>
              Ajouter une Spécialité
            </Typography>
            <Typography sx={{ color: C.slate, fontSize: '0.95rem' }}>
              Créez un département, un niveau ou une spécialité
            </Typography>
          </Box>
        </Box>
      </Box>

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
            onClick={() => setActiveTab(0)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 0 ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 0 ? '3px solid #2563EB' : '3px solid transparent',
              borderRadius: 0,
              px: 2,
              py: 2,
              '&:hover': {
                background: 'transparent',
                color: '#2563EB',
              },
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🏢</span> Département
          </Button>
          <Button
            onClick={() => setActiveTab(1)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 1 ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 1 ? '3px solid #2563EB' : '3px solid transparent',
              borderRadius: 0,
              px: 2,
              py: 2,
              '&:hover': {
                background: 'transparent',
                color: '#2563EB',
              },
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '8px' }}>📚</span> Niveau
          </Button>
          <Button
            onClick={() => setActiveTab(2)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 2 ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 2 ? '3px solid #2563EB' : '3px solid transparent',
              borderRadius: 0,
              px: 2,
              py: 2,
              '&:hover': {
                background: 'transparent',
                color: '#2563EB',
              },
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🎯</span> Spécialité
          </Button>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Formulaire Département */}
          {activeTab === 0 && (
            <form onSubmit={handleSubmitDepartement}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
                    label="Description"
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard/admin/specialites')}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        px: 3,
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
                        borderRadius: '10px',
                        px: 3,
                        '&:hover': {
                          background: '#1D4ED8',
                        },
                      }}
                    >
                      <span style={{ fontSize: '16px', marginRight: '8px' }}>💾</span> Créer le département
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}

          {/* Formulaire Niveau */}
          {activeTab === 1 && (
            <form onSubmit={handleSubmitNiveau}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Type de niveau</InputLabel>
                    <Select
                      value={niveauForm.type_niveau}
                      onChange={(e) => setNiveauForm({ ...niveauForm, type_niveau: e.target.value })}
                      label="Type de niveau"
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
                    label="Nom du niveau"
                    value={niveauForm.nom_niveau}
                    onChange={(e) => setNiveauForm({ ...niveauForm, nom_niveau: e.target.value })}
                    required
                    placeholder="Ex: Licence en Informatique"
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
                    label="Durée (années)"
                    type="number"
                    value={niveauForm.duree_annees}
                    onChange={(e) => setNiveauForm({ ...niveauForm, duree_annees: e.target.value })}
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
                    <InputLabel>Département</InputLabel>
                    <Select
                      value={niveauForm.id_departement}
                      onChange={(e) => setNiveauForm({ ...niveauForm, id_departement: e.target.value })}
                      label="Département"
                      sx={{
                        borderRadius: '12px',
                      }}
                    >
                      {departements.map(d => (
                        <MenuItem key={d.id_departement} value={d.id_departement}>
                          {d.nom_departement}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={niveauForm.description}
                    onChange={(e) => setNiveauForm({ ...niveauForm, description: e.target.value })}
                    multiline
                    rows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard/admin/specialites')}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        px: 3,
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
                        borderRadius: '10px',
                        px: 3,
                        '&:hover': {
                          background: '#1D4ED8',
                        },
                      }}
                    >
                      <span style={{ fontSize: '16px', marginRight: '8px' }}>💾</span> Créer le niveau
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}

          {/* Formulaire Spécialité */}
          {activeTab === 2 && (
            <form onSubmit={handleSubmitSpecialite}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={specForm.description}
                    onChange={(e) => setSpecForm({ ...specForm, description: e.target.value })}
                    multiline
                    rows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Nombre de crédits"
                    type="number"
                    value={specForm.nombre_credits}
                    onChange={(e) => setSpecForm({ ...specForm, nombre_credits: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Durée formation"
                    value={specForm.duree_formation}
                    onChange={(e) => setSpecForm({ ...specForm, duree_formation: e.target.value })}
                    placeholder="Ex: 3 ans"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Département</InputLabel>
                    <Select
                      value={specForm.id_departement_temp}
                      onChange={(e) => {
                        setSpecForm({ ...specForm, id_departement_temp: e.target.value, id_niveau: '' });
                        fetchNiveaux(e.target.value);
                      }}
                      label="Département"
                      sx={{
                        borderRadius: '12px',
                      }}
                    >
                      {departements.map(d => (
                        <MenuItem key={d.id_departement} value={d.id_departement}>
                          {d.nom_departement}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required disabled={!specForm.id_departement_temp}>
                    <InputLabel>Niveau</InputLabel>
                    <Select
                      value={specForm.id_niveau}
                      onChange={(e) => setSpecForm({ ...specForm, id_niveau: e.target.value })}
                      label="Niveau"
                      sx={{
                        borderRadius: '12px',
                      }}
                    >
                      {niveaux.map(n => (
                        <MenuItem key={n.id_niveau} value={n.id_niveau}>
                          {n.nom_niveau} ({n.type_niveau})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {specForm.id_departement_temp && niveaux.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                      Aucun niveau disponible pour ce département. Créez-en un dans l'onglet "Niveau".
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth>
                    <InputLabel>Département (pour charger les niveaux)</InputLabel>
                    <Select
                      value={niveauForm.id_departement}
                      onChange={(e) => {
                        setNiveauForm({ ...niveauForm, id_departement: e.target.value });
                        fetchNiveaux(e.target.value);
                      }}
                      label="Département (pour charger les niveaux)"
                      sx={{
                        borderRadius: '12px',
                      }}
                    >
                      {departements.map(d => (
                        <MenuItem key={d.id_departement} value={d.id_departement}>
                          {d.nom_departement}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {niveaux.length === 0 && niveauForm.id_departement && (
                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                      Aucun niveau disponible pour ce département. Créez-en un dans l'onglet "Niveau".
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard/admin/specialites')}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        px: 3,
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
                        borderRadius: '10px',
                        px: 3,
                        '&:hover': {
                          background: '#1D4ED8',
                        },
                      }}
                    >
                      <span style={{ fontSize: '16px', marginRight: '8px' }}>💾</span> Créer la spécialité
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>

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

export default AjouterSpecialite;
