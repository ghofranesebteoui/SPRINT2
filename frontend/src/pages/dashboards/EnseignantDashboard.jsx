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
  Button,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
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

const EnseignantDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState('algo');
  const [loading, setLoading] = useState(true);
  const [enseignantData, setEnseignantData] = useState(null);

  useEffect(() => {
    fetchEnseignantData();
  }, []);

  const fetchEnseignantData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // TODO: Remplacer par un vrai appel API
      // const response = await axios.get(`${config.apiUrl}/api/enseignant/dashboard`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // Données simulées pour le moment
      setEnseignantData({
        nom: user?.nom || 'Ben Salem',
        prenom: user?.prenom || 'Ahmed',
        departement: 'Informatique',
        matieres: [
          { id: 'algo', nom: 'Algorithmique avancée', niveau: 'L3' },
          { id: 'db', nom: 'Bases de données', niveau: 'L2' },
          { id: 'web', nom: 'Développement Web', niveau: 'L2' },
        ],
        groupes: ['Groupe A', 'Groupe B', 'Groupe C'],
      });
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setLoading(false);
    }
  };

  const distributionNotes = [
    { tranche: '<8', nombre: 3 },
    { tranche: '8-10', nombre: 7 },
    { tranche: '10-12', nombre: 15 },
    { tranche: '12-14', nombre: 22 },
    { tranche: '14-16', nombre: 18 },
    { tranche: '16-18', nombre: 9 },
    { tranche: '>18', nombre: 4 },
  ];

  const evolutionData = [
    { periode: 'Sept', moyenne: 12.5 },
    { periode: 'Oct', moyenne: 12.7 },
    { periode: 'Nov', moyenne: 12.9 },
    { periode: 'Déc', moyenne: 13.1 },
    { periode: 'Jan', moyenne: 13.3 },
  ];

  const etudiantsRisque = [
    { nom: 'Amira Gharbi', moyenne: 7.8, statut: 'critique', absences: 9 },
    { nom: 'Mohamed Trabelsi', moyenne: 9.1, statut: 'attention', absences: 6 },
    { nom: 'Salma Ben Ali', moyenne: 9.5, statut: 'attention', absences: 4 },
    { nom: 'Youssef Mansour', moyenne: 8.2, statut: 'critique', absences: 8 },
  ];

  const recommandations = [
    {
      titre: 'Ressources suggérées',
      items: [
        'Module de révision sur les structures de données (9 étudiants concernés)',
        'Quiz interactif sur la complexité algorithmique',
        'Exercices pratiques de tri et recherche',
      ],
    },
    {
      titre: 'Actions recommandées',
      items: [
        'Organiser une séance de rattrapage pour le groupe à risque',
        'Proposer un tutorat entre pairs pour 6 étudiants',
        'Ajuster le rythme sur les chapitres 4-5 (taux d\'échec élevé)',
      ],
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Dashboard Enseignant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Prof. {enseignantData?.prenom} {enseignantData?.nom} - Département {enseignantData?.departement}
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          sx={{ minWidth: 300 }}
          size="small"
        >
          {enseignantData?.matieres?.map((matiere) => (
            <MenuItem key={matiere.id} value={matiere.id}>
              {matiere.nom} - {matiere.niveau}
            </MenuItem>
          ))}
        </TextField>
        <TextField select defaultValue="groupeA" sx={{ minWidth: 150 }} size="small">
          {enseignantData?.groupes?.map((groupe, index) => (
            <MenuItem key={index} value={`groupe${String.fromCharCode(65 + index)}`}>
              {groupe}
            </MenuItem>
          ))}
          <MenuItem value="tous">Tous les groupes</MenuItem>
        </TextField>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Moyenne de classe"
            value="13.2/20"
            change="+0.8 vs dernier semestre"
            changeType="positive"
            icon="📊"
            iconBg="mint"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Médiane"
            value="13.5/20"
            change="Distribution normale"
            icon="📈"
            iconBg="lavender"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Écart-type"
            value="2.8"
            change="Homogénéité correcte"
            icon="📉"
            iconBg="peach"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Étudiants à risque"
            value="7"
            change="+2 nouveaux cette semaine"
            changeType="negative"
            icon="⚠️"
            iconBg="coral"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Distribution des Notes */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                📊 Distribution des notes
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionNotes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="tranche" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="nombre" fill="#4ECDC4" name="Nombre d'étudiants" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Étudiants à Risque */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                🔴 Étudiants à risque
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Moyenne</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {etudiantsRisque.map((etudiant, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {etudiant.statut === 'critique' ? '🔴' : '🟠'}{' '}
                          {etudiant.nom}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {etudiant.moyenne}/20
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              etudiant.statut === 'critique'
                                ? 'Critique'
                                : 'Attention'
                            }
                            size="small"
                            sx={{
                              background:
                                etudiant.statut === 'critique'
                                  ? '#FFEBEE'
                                  : '#FFF3E0',
                              color:
                                etudiant.statut === 'critique'
                                  ? '#C62828'
                                  : '#E65100',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Évolution */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                📈 Évolution des performances
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="periode" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="moyenne"
                    stroke="#FF6B6B"
                    strokeWidth={3}
                    dot={{ fill: '#FF6B6B', r: 5 }}
                    name="Moyenne de classe"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommandations IA */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                🤖 Recommandations pédagogiques IA
              </Typography>
              {recommandations.map((rec, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    background: '#E8F5E9',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1, color: '#2E7D32' }}
                  >
                    {rec.titre}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {rec.items.map((item, i) => (
                      <Typography
                        component="li"
                        key={i}
                        variant="body2"
                        sx={{ mb: 0.5 }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnseignantDashboard;
