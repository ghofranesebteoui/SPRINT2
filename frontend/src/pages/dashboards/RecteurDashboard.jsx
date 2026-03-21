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
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '../../components/Dashboard/StatCard';

const RecteurDashboard = () => {
  const performanceData = [
    { annee: '2021', taux: 68 },
    { annee: '2022', taux: 71 },
    { annee: '2023', taux: 74 },
    { annee: '2024', taux: 76 },
    { annee: '2025', taux: 79 },
  ];

  const etablissements = [
    {
      nom: 'Faculté des Sciences de Bizerte',
      type: 'Faculté',
      effectif: 4200,
      taux: 81,
      budget: '850K',
      statut: 'excellent',
    },
    {
      nom: 'Institut Supérieur des Technologies',
      type: 'Institut',
      effectif: 2800,
      taux: 76,
      budget: '620K',
      statut: 'bon',
    },
    {
      nom: 'École Nationale d\'Ingénieurs',
      type: 'École',
      effectif: 1500,
      taux: 88,
      budget: '1.2M',
      statut: 'excellent',
    },
    {
      nom: 'Institut des Études Commerciales',
      type: 'Institut',
      effectif: 3100,
      taux: 72,
      budget: '580K',
      statut: 'bon',
    },
  ];

  const budgetData = [
    { categorie: 'Recherche', montant: 1200 },
    { categorie: 'Infrastructure', montant: 800 },
    { categorie: 'Personnel', montant: 2500 },
    { categorie: 'Équipement', montant: 600 },
    { categorie: 'Autres', montant: 400 },
  ];

  const COLORS = ['#FF6B6B', '#4ECDC4', '#FFB088', '#C7CEEA', '#95E1D3'];

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
          Dashboard Recteur
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Université de Tunis - Vue d'ensemble des établissements
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Établissements"
            value="12"
            change="+2 cette année"
            changeType="positive"
            icon="🏫"
            iconBg="coral"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Étudiants totaux"
            value="18,450"
            change="+12% vs année précédente"
            changeType="positive"
            icon="👥"
            iconBg="mint"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taux de réussite"
            value="79%"
            change="+3% vs année précédente"
            changeType="positive"
            icon="📈"
            iconBg="lavender"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Budget global"
            value="5.5M TND"
            change="Stable"
            icon="💰"
            iconBg="peach"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                📈 Évolution du taux de réussite (5 ans)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="annee" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="taux"
                    stroke="#FF6B6B"
                    strokeWidth={3}
                    dot={{ fill: '#FF6B6B', r: 6 }}
                    name="Taux de réussite (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                💰 Répartition du Budget
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categorie, percent }) =>
                      `${categorie} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="montant"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Table Établissements */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                🏛️ Établissements sous tutelle
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Effectif</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Taux réussite
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Budget</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {etablissements.map((etab, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:hover': { background: '#F9FAFB' },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>
                          {etab.nom}
                        </TableCell>
                        <TableCell>{etab.type}</TableCell>
                        <TableCell>
                          {etab.effectif.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {etab.taux}%
                        </TableCell>
                        <TableCell>{etab.budget}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              etab.statut === 'excellent'
                                ? 'Excellent'
                                : 'Bon'
                            }
                            size="small"
                            sx={{
                              background:
                                etab.statut === 'excellent'
                                  ? '#D1FAE5'
                                  : '#DBEAFE',
                              color:
                                etab.statut === 'excellent'
                                  ? '#065F46'
                                  : '#1E40AF',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                            }}
                          >
                            Détails
                          </Button>
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

export default RecteurDashboard;
