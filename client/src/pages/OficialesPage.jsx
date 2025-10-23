import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material'
import {
  AccountBalance as AdminIcon,
  LocalFireDepartment as OperativaIcon,
  Gavel as ConsejosIcon,
  CheckCircle as OcupadoIcon,
  Cancel as VacanteIcon
} from '@mui/icons-material'
import { CargosList } from '../components/cargos'
import { fetchEstadisticas } from '../store/slices/cargosSlice'

const OficialesPage = () => {
  const dispatch = useDispatch()
  const { estadisticas } = useSelector((state) => state.cargos)

  useEffect(() => {
    dispatch(fetchEstadisticas())
  }, [dispatch])

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ color }}>
              {value || 0}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 48, opacity: 0.3 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          🏛️ Sistema de Cargos de la Compañía
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de cargos administrativos, operativos y consejos de disciplina
        </Typography>
      </Box>

      {/* Dashboard de estadísticas */}
      {estadisticas && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Cargos"
              value={estadisticas.totalCargos}
              icon={<AdminIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cargos Ocupados"
              value={estadisticas.cargosOcupados}
              icon={<OcupadoIcon />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cargos Vacantes"
              value={estadisticas.cargosVacantes}
              icon={<VacanteIcon />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Asignaciones"
              value={estadisticas.totalAsignaciones}
              icon={<OperativaIcon />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>
      )}

      {/* Lista de cargos organizados por ramas */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <CargosList />
      </Paper>
    </Box>
  )
}

export default OficialesPage
