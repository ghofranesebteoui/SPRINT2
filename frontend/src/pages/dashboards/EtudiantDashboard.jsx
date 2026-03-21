import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../../components/Dashboard/StatCard';

const EtudiantDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.apiUrl}/etudiant/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data.data);
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#4D9FFF' }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Impossible de charger votre profil
        </Typography>
      </Box>
    );
  }
  const competencesData = [
    { matiere: 'BDD', note: 16.5, moyenne: 13.3 },
    { matiere: 'Web', note: 15.0, moyenne: 13.8 },
    { matiere: 'Réseaux', note: 13.8, moyenne: 13.5 },
    { matiere: 'Algo', note: 11.5, moyenne: 13.3 },
    { matiere: 'Sys.Exp', note: 12.2, moyenne: 12.1 },
    { matiere: 'Maths', note: 14.0, moyenne: 12.8 },
    { matiere: 'Anglais', note: 13.5, moyenne: 13.0 },
  ];

  const evolutionData = [
    { semestre: 'S1', moyenne: 12.1 },
    { semestre: 'S2', moyenne: 12.8 },
    { semestre: 'S3', moyenne: 13.2 },
    { semestre: 'S4', moyenne: 13.0 },
    { semestre: 'S5', moyenne: 13.5 },
  ];

  const matieres = [
    {
      nom: 'Bases de données',
      note: 16.5,
      moyenneClasse: 13.3,
      ecart: '+3.2',
      statut: 'excellent',
      progression: 82,
    },
    {
      nom: 'Développement Web',
      note: 15.0,
      moyenneClasse: 13.8,
      ecart: '+1.2',
      statut: 'bon',
      progression: 75,
    },
    {
      nom: 'Réseaux',
      note: 13.8,
      moyenneClasse: 13.5,
      ecart: '+0.3',
      statut: 'bon',
      progression: 69,
    },
    {
      nom: 'Algorithmique avancée',
      note: 11.5,
      moyenneClasse: 13.3,
      ecart: '-1.8',
      statut: 'ameliorer',
      progression: 57,
    },
    {
      nom: 'Systèmes d\'exploitation',
      note: 12.2,
      moyenneClasse: 12.1,
      ecart: '+0.1',
      statut: 'correct',
      progression: 61,
    },
  ];

  const alertes = [
    {
      type: 'warning',
      titre: 'Algorithmique avancée',
      message: 'Note en dessous de la moyenne (-1.8 points)',
    },
    {
      type: 'success',
      titre: 'Excellent travail en BDD',
      message: '+3.2 points au-dessus de la moyenne',
    },
    {
      type: 'info',
      titre: 'Examen dans 5 jours',
      message: 'Systèmes d\'exploitation - Mercredi 15/02',
    },
  ];

  return (
    <Box>
      {/* Profile Header */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: '3rem',
                background: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              {profile.sexe === 'HOMME' ? '👨‍🎓' : '👩‍🎓'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {profile.prenom} {profile.nom}
              </Typography>
              <Typography sx={{ opacity: 0.9, fontSize: '1.05rem' }}>
                {profile.filiere || 'Étudiant'} • Matricule: {profile.matricule}
              </Typography>
              {profile.ville && (
                <Typography sx={{ opacity: 0.8, fontSize: '0.95rem', mt: 0.5 }}>
                  📍 {profile.ville}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 900 }}>
                {profile.moyenne_generale || '13.5'}
              </Typography>
              <Typography sx={{ opacity: 0.9 }}>Moyenne générale</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Nombre de matières"
            value="8"
            change="Semestre 5"
            icon="📚"
            iconBg="mint"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taux d'absence"
            value="12%"
            change="Amélioration"
            changeType="positive"
            icon="📅"
            iconBg="lavender"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Classement"
            value="Top 25%"
            change="Progression"
            changeType="positive"
            icon="🏆"
            iconBg="peach"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Crédits ECTS"
            value="120/180"
            change="Sur la bonne voie"
            icon="📈"
            iconBg="coral"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Radar des Compétences */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
              borderRadius: '12px 12px 0 0',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                🎯 Radar des compétences
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={competencesData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="matiere" />
                  <PolarRadiusAxis angle={90} domain={[0, 20]} />
                  <Radar
                    name="Vos notes"
                    dataKey="note"
                    stroke="#FF6B6B"
                    fill="#FF6B6B"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Moyenne classe"
                    dataKey="moyenne"
                    stroke="#4ECDC4"
                    fill="#4ECDC4"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary' }}
              >
                📊 Ligne pleine: vos notes | Ligne pointillée: moyenne de classe
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertes */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3, 
            height: '100%',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #FFB74D 0%, #FF6B6B 100%)',
              borderRadius: '12px 12px 0 0',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                🔔 Alertes & Notifications
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alertes.map((alerte, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      borderLeft: 4,
                      borderColor:
                        alerte.type === 'warning'
                          ? '#FFB74D'
                          : alerte.type === 'success'
                          ? '#66BB6A'
                          : '#42A5F5',
                      background:
                        alerte.type === 'warning'
                          ? '#FFF3E0'
                          : alerte.type === 'success'
                          ? '#E8F5E9'
                          : '#E3F2FD',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      {alerte.type === 'warning' ? '⚠️' : alerte.type === 'success' ? '✅' : '📅'}{' '}
                      {alerte.titre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alerte.message}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes par Matière */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1E3A8A 0%, #4ECDC4 100%)',
              borderRadius: '12px 12px 0 0',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                📚 Notes par matière
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Matière</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Note</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Moyenne classe</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Écart</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Progression</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matieres.map((matiere, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:hover': { background: '#F9FAFB' } }}
                      >
                        <TableCell>{matiere.nom}</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                          {matiere.note}/20
                        </TableCell>
                        <TableCell>{matiere.moyenneClasse}/20</TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: matiere.ecart.startsWith('+')
                              ? '#66BB6A'
                              : '#EF5350',
                          }}
                        >
                          {matiere.ecart}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              matiere.statut === 'excellent'
                                ? 'Excellent'
                                : matiere.statut === 'bon'
                                ? 'Bon'
                                : matiere.statut === 'ameliorer'
                                ? 'À améliorer'
                                : 'Correct'
                            }
                            size="small"
                            sx={{
                              background:
                                matiere.statut === 'excellent'
                                  ? '#D1FAE5'
                                  : matiere.statut === 'bon'
                                  ? '#DBEAFE'
                                  : matiere.statut === 'ameliorer'
                                  ? '#FFF3E0'
                                  : '#F3F4F6',
                              color:
                                matiere.statut === 'excellent'
                                  ? '#065F46'
                                  : matiere.statut === 'bon'
                                  ? '#1E40AF'
                                  : matiere.statut === 'ameliorer'
                                  ? '#E65100'
                                  : '#374151',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={matiere.progression}
                              sx={{
                                width: 100,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#E5E7EB',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor:
                                    matiere.progression >= 75
                                      ? '#66BB6A'
                                      : matiere.progression >= 60
                                      ? '#FFB74D'
                                      : '#EF5350',
                                  borderRadius: 4,
                                },
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {matiere.progression}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Évolution Temporelle */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #FF6B6B 0%, #FFB74D 100%)',
              borderRadius: '12px 12px 0 0',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                📈 Évolution de ma moyenne
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="semestre" stroke="#6B7280" />
                  <YAxis domain={[10, 15]} stroke="#6B7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="moyenne"
                    stroke="#FF6B6B"
                    strokeWidth={3}
                    dot={{ fill: '#FF6B6B', r: 6 }}
                    name="Moyenne générale"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommandations */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #FFD60A 0%, #06D6A0 100%)',
              borderRadius: '12px 12px 0 0',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                💡 Recommandations personnalisées
              </Typography>
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  background: '#E3F2FD',
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1, color: '#1565C0' }}
                >
                  📚 Ressources suggérées
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    MOOC: Algorithmes de tri avancés (MIT OpenCourseWare)
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    Tutoriel: Analyse de complexité - Vidéos interactives
                  </Typography>
                  <Typography component="li" variant="body2">
                    Exercices: 20 problèmes d'algorithmique niveau intermédiaire
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  p: 2,
                  background: '#FFF3E0',
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1, color: '#E65100' }}
                >
                  👥 Séances de rattrapage disponibles
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    Tutorat Algorithmique - Jeudi 14h-16h (Salle B204)
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    Groupe de révision entre pairs - Mercredi 18h-20h
                  </Typography>
                  <Typography component="li" variant="body2">
                    Consultation individuelle avec Prof. Ben Salem - Sur RDV
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EtudiantDashboard;
