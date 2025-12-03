import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Paper,
  Typography,
  IconButton,
  Collapse,
} from '@mui/material';
import { FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';

const FiltrosLicencias = ({ 
  onFiltrar, 
  tiposLicencia = [], 
  mostrarFiltroBombero = true,
  bomberos = [],
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filtros, setFiltros] = useState({
    bomberoId: '',
    estado: '',
    tipoLicenciaId: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const estadosDisponibles = [
    'Pendiente',
    'Aprobada',
    'Rechazada',
    'Cancelada',
    'Activa',
    'Finalizada',
  ];

  const handleChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleAplicarFiltros = () => {
    // Remover campos vacíos
    const filtrosLimpios = Object.entries(filtros).reduce((acc, [key, value]) => {
      if (value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onFiltrar(filtrosLimpios);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      bomberoId: '',
      estado: '',
      tipoLicenciaId: '',
      fechaDesde: '',
      fechaHasta: '',
    });
    onFiltrar({});
  };

  // Aplicar filtros cuando cambian
  useEffect(() => {
    handleAplicarFiltros();
  }, [filtros]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 2 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filtros</Typography>
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2}>
          {/* Filtro por Bombero (solo para admin) */}
          {mostrarFiltroBombero && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Bombero"
                value={filtros.bomberoId}
                onChange={(e) => handleChange('bomberoId', e.target.value)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                {bomberos.map((bombero) => (
                  <MenuItem key={bombero.id} value={bombero.id}>
                    {bombero.nombre} {bombero.apellidos}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* Filtro por Estado */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Estado"
              value={filtros.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              {estadosDisponibles.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Filtro por Tipo de Licencia */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Tipo de Licencia"
              value={filtros.tipoLicenciaId}
              onChange={(e) => handleChange('tipoLicenciaId', e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              {tiposLicencia.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Fecha Desde */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              fullWidth
              label="Fecha Desde"
              value={filtros.fechaDesde}
              onChange={(e) => handleChange('fechaDesde', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Fecha Hasta */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              fullWidth
              label="Fecha Hasta"
              value={filtros.fechaHasta}
              onChange={(e) => handleChange('fechaHasta', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Botón Limpiar */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleLimpiarFiltros}
              sx={{ height: '40px' }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default FiltrosLicencias;
