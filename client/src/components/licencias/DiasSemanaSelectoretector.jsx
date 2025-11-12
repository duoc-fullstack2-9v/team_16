import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Switch,
  TextField,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { Schedule, CalendarToday } from '@mui/icons-material';

const diasSemanaDefault = [
  { dia: 'lunes', numero: 1, label: 'Lunes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'martes', numero: 2, label: 'Martes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'miercoles', numero: 3, label: 'Miércoles', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'jueves', numero: 4, label: 'Jueves', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'viernes', numero: 5, label: 'Viernes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'sabado', numero: 6, label: 'Sábado', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'domingo', numero: 7, label: 'Domingo', activo: false, horaInicio: '', horaFin: '' }
];

const DiasSemanaSelectoretector = ({ 
  value = diasSemanaDefault, 
  onChange, 
  mismoHorarioTodos, 
  onMismoHorarioChange,
  horaInicioGeneral = '08:00',
  horaFinGeneral = '17:00',
  onHorarioGeneralChange
}) => {
  const handleToggleDia = (numero) => {
    const newValue = value.map(dia => 
      dia.numero === numero ? { ...dia, activo: !dia.activo } : dia
    );
    onChange(newValue);
  };
  
  const handleToggleTodos = (event) => {
    const activo = event.target.checked;
    const newValue = value.map(dia => ({ ...dia, activo }));
    onChange(newValue);
  };
  
  const handleHorarioChange = (numero, campo, valor) => {
    const newValue = value.map(dia => 
      dia.numero === numero ? { ...dia, [campo]: valor } : dia
    );
    onChange(newValue);
  };
  
  const handleHorarioGeneralChange = (campo, valor) => {
    if (onHorarioGeneralChange) {
      onHorarioGeneralChange(campo, valor);
    }
    
    // Si mismoHorarioTodos está activo, aplicar a todos los días activos
    if (mismoHorarioTodos) {
      const newValue = value.map(dia => {
        if (!dia.activo) return dia;
        return {
          ...dia,
          horaInicio: campo === 'inicio' ? valor : (onHorarioGeneralChange ? horaInicioGeneral : dia.horaInicio),
          horaFin: campo === 'fin' ? valor : (onHorarioGeneralChange ? horaFinGeneral : dia.horaFin)
        };
      });
      onChange(newValue);
    }
  };
  
  // Cuando cambia mismoHorarioTodos a true, aplicar horario general a todos
  useEffect(() => {
    if (mismoHorarioTodos && horaInicioGeneral && horaFinGeneral) {
      const newValue = value.map(dia => ({
        ...dia,
        horaInicio: dia.activo ? horaInicioGeneral : '',
        horaFin: dia.activo ? horaFinGeneral : ''
      }));
      onChange(newValue);
    }
  }, [mismoHorarioTodos]); // Solo ejecutar cuando cambia mismoHorarioTodos
  
  const diasActivos = value.filter(d => d.activo);
  const todosSeleccionados = value.every(d => d.activo);
  const algunoSeleccionado = value.some(d => d.activo);
  
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <CalendarToday color="primary" />
        <Typography variant="subtitle1" fontWeight="bold">
          Días de la Semana *
        </Typography>
      </Box>
      
      {/* Selector de días */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={todosSeleccionados}
                indeterminate={algunoSeleccionado && !todosSeleccionados}
                onChange={handleToggleTodos}
              />
            }
            label={<Typography variant="body2" fontWeight="medium">Seleccionar todos</Typography>}
          />
        </Box>
        <Divider sx={{ my: 1 }} />
        <FormGroup row>
          {value.map((dia) => (
            <FormControlLabel
              key={dia.numero}
              sx={{ 
                minWidth: '140px',
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem'
                }
              }}
              control={
                <Checkbox
                  checked={dia.activo}
                  onChange={() => handleToggleDia(dia.numero)}
                  color="primary"
                />
              }
              label={dia.label}
            />
          ))}
        </FormGroup>
      </Paper>
      
      {diasActivos.length > 0 && (
        <>
          {/* Switch de mismo horario */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={mismoHorarioTodos}
                  onChange={(e) => onMismoHorarioChange(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Schedule fontSize="small" />
                  <Typography variant="body2">
                    Mismo horario para todos los días
                  </Typography>
                </Box>
              }
            />
          </Box>
          
          {mismoHorarioTodos ? (
            /* Horario general */
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Horario General
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora Inicio"
                    value={horaInicioGeneral}
                    onChange={(e) => handleHorarioGeneralChange('inicio', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora Fin"
                    value={horaFinGeneral}
                    onChange={(e) => handleHorarioGeneralChange('fin', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          ) : (
            /* Horarios personalizados */
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Horarios Personalizados
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {diasActivos.map((dia) => (
                  <Grid item xs={12} key={dia.numero}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 100 }} variant="body2" fontWeight="medium">
                        {dia.label}:
                      </Typography>
                      <TextField
                        size="small"
                        type="time"
                        label="Inicio"
                        value={dia.horaInicio}
                        onChange={(e) => handleHorarioChange(dia.numero, 'horaInicio', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size="small"
                        type="time"
                        label="Fin"
                        value={dia.horaFin}
                        onChange={(e) => handleHorarioChange(dia.numero, 'horaFin', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Resumen */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" component="div">
              📅 <strong>Días seleccionados ({diasActivos.length}):</strong>
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {diasActivos.map(d => (
                <Chip 
                  key={d.numero} 
                  label={d.label} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </>
      )}
      
      {diasActivos.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.lighter', borderRadius: 1 }}>
          <Typography variant="body2" color="warning.dark">
            ⚠️ Debe seleccionar al menos un día de la semana
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DiasSemanaSelectoretector;
