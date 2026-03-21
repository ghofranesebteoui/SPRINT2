import React from 'react';
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
  LinearProgress,
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

const DirecteurDashboard = () => {
  const filiereData = [
    { filiere: 'Informatique', effectif: 850, moyenne: 14.2, taux: 88 },
    { filiere: 'Mathématiques', effectif: 620, moyenne: 13.1, taux: 79 },
    { filiere: 'Physique', effectif: 480, moyenne: 12.8, taux: 75 },
    { filiere: 'Biologie', effectif: 720, moyenne: 13.5, taux: 81 },
    { filiere: 'Chimie', effectif: 530, moyenne: 13.0, taux: 77 },
  ];

  const evolutionData = [
    { mois: 'Sept', taux: 76 },
    { mois: 'Oct', taux: 77 },
    { mois: 'Nov', taux: 78 },
    { mois: 'Déc', taux: 79 },
    { mois: 'Jan', taux: 81 },
  ];

  const alertes = [
    {
      type: 'danger',
      titre: 'L1 Physique - Mécanique',
      message: '18 étudiants en risque d\'échec',
    },
    {
      type: 'warning',
      titre: 'M1 Info - Algorithmique',
      message: 'Taux d\'absence élevé: 22%',
    },
    {
      type: 'success',
      titre: 'L3 Maths - Analyse',
      message: 'Excellentes performances: +8%',
    },
  ];

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
          Dashboard Directeur
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Faculté des Sciences de Bizerte - Vue d'ensemble
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Effectif total"
            value="4,200"
            change="+280 étudiants"
            changeType="positive"
            icon="👥"
            iconBg="mint"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taux de réussite"
            value="81%"
            change="+3.5% vs année précédente"
            changeType="positive"
            icon="📈"
            iconBg="lavender"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Budget annuel"
            value="850K TND"
            change="Stable"
            icon="💰"
            iconBg="peach"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Alertes actives"
            value="8"
            change="+2 cette semaine"
            changeType="negative"
            icon="⚠️"
            iconBg="coral"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Performances par Filière */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                📊 Performances par filière
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filiereData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="filiere" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="taux" fill="#FF6B6B" name="Taux de réussite (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertes */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ⚠️ Alertes
                </Typography>
                <Chip
                  label="8"
                  size="small"
                  sx={{
                    background: '#EF5350',
                    color: 'white',
                    fontWeight: 700,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alertes.map((alerte, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderLeft: 4,
                      borderColor:
                        alerte.type === 'danger'
                          ? '#EF5350'
                          : alerte.type === 'warning'
                          ? '#FFB74D'
                          : '#66BB6A',
                      background:
                        alerte.type === 'danger'
                          ? '#FFEBEE'
                          : alerte.type === 'warning'
                          ? '#FFF3E0'
                          : '#E8F5E9',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      {alerte.titre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alerte.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Évolution */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                📈 Évolution mensuelle
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="mois" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="taux"
                    stroke="#4ECDC4"
                    strokeWidth={3}
                    dot={{ fill: '#4ECDC4', r: 5 }}
                    name="Taux de réussite (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Table Filières */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                🎓 Détails par filière
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Filière</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Effectif</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Moyenne</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Taux</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filiereData.map((filiere, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {filiere.filiere}
                        </TableCell>
                        <TableCell>{filiere.effectif}</TableCell>
                        <TableCell>{filiere.moyenne}/20</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={filiere.taux}
                              sx={{
                                width: 60,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#E5E7EB',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor:
                                    filiere.taux >= 80
                                      ? '#66BB6A'
                                      : filiere.taux >= 70
                                      ? '#FFB74D'
                                      : '#EF5350',
                                },
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {filiere.taux}%
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
      </Grid>
    </Box>
  );
};

export default DirecteurDashboard;
