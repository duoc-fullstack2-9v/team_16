import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Delete, Upload, Warning } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import DiasSemanaSelectoretector from './DiasSemanaSelectoretector';

const diasSemanaDefault = [
  { dia: 'lunes', numero: 1, label: 'Lunes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'martes', numero: 2, label: 'Martes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'miercoles', numero: 3, label: 'Miércoles', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'jueves', numero: 4, label: 'Jueves', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'viernes', numero: 5, label: 'Viernes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'sabado', numero: 6, label: 'Sábado', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'domingo', numero: 7, label: 'Domingo', activo: false, horaInicio: '', horaFin: '' }
];

const LicenciaForm = ({ 
  licencia,
  tiposLicencia = [],
  onSubmit,
  onCancel,
  bomberos = [],
  mostrarSelectorBombero = false, // true para admin
}) => {
  const { user } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    bomberoId: '',
    tipoLicenciaId: '',
    otroMotivo: '',
    fechaInicio: '',
    fechaFin: '',
    diasSemana: diasSemanaDefault,
    mismoHorarioTodos: true,
    horaInicioGeneral: '08:00',
    horaFinGeneral: '17:00',
    motivo: '',
    documentosUrls: [],
  });

  const [errores, setErrores] = useState({});
  const [advertenciaConflicto, setAdvertenciaConflicto] = useState(false);

  // Obtener bomberoId del usuario autenticado si no se muestra el selector
  useEffect(() => {
    if (!mostrarSelectorBombero && user) {
      // Buscar el bombero asociado al usuario
      const fetchBomberoId = async () => {
        try {
          const token = localStorage.getItem('bomberosToken');
          const response = await fetch('http://localhost:3002/api/bomberos/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({
              ...prev,
              bomberoId: data.id
            }));
          }
        } catch (error) {
          console.error('Error al obtener bomberoId:', error);
        }
      };
      fetchBomberoId();
    }
  }, [mostrarSelectorBombero, user]);

  useEffect(() => {
    if (licencia) {
      setFormData({
        bomberoId: licencia.bomberoId || '',
        tipoLicenciaId: licencia.tipoLicenciaId || '',
        otroMotivo: licencia.otroMotivo || '',
        fechaInicio: licencia.fechaInicio ? licencia.fechaInicio.split('T')[0] : '',
        fechaFin: licencia.fechaFin ? licencia.fechaFin.split('T')[0] : '',
        diasSemana: licencia.diasSemana || diasSemanaDefault,
        mismoHorarioTodos: licencia.mismoHorarioTodos !== undefined ? licencia.mismoHorarioTodos : true,
        horaInicioGeneral: licencia.horaInicioGeneral || '08:00',
        horaFinGeneral: licencia.horaFinGeneral || '17:00',
        motivo: licencia.motivo || '',
        documentosUrls: licencia.documentosUrls || [],
      });
      setAdvertenciaConflicto(licencia.tieneConflictoGuardia || false);
    } else {
      // Limpiar formulario
      setFormData({
        bomberoId: '',
        tipoLicenciaId: '',
        otroMotivo: '',
        fechaInicio: '',
        fechaFin: '',
        diasSemana: diasSemanaDefault,
        mismoHorarioTodos: true,
        horaInicioGeneral: '08:00',
        horaFinGeneral: '17:00',
        motivo: '',
        documentosUrls: [],
      });
      setAdvertenciaConflicto(false);
    }
    setErrores({});
  }, [licencia]);

  const handleChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpiar error del campo cuando se modifica
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: null,
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.bomberoId && mostrarSelectorBombero) {
      nuevosErrores.bomberoId = 'Seleccione un bombero';
    }

    if (!formData.tipoLicenciaId) {
      nuevosErrores.tipoLicenciaId = 'Seleccione un tipo de licencia';
    }

    // Si el tipo es "Otro", validar otroMotivo
    const tipoSeleccionado = tiposLicencia.find(t => t.id === formData.tipoLicenciaId);
    if (tipoSeleccionado?.nombre === 'Otro' && !formData.otroMotivo) {
      nuevosErrores.otroMotivo = 'Especifique el motivo';
    }

    if (!formData.fechaInicio) {
      nuevosErrores.fechaInicio = 'Ingrese fecha de inicio';
    }

    if (!formData.fechaFin) {
      nuevosErrores.fechaFin = 'Ingrese fecha de fin';
    }

    if (formData.fechaInicio && formData.fechaFin) {
      if (new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
        nuevosErrores.fechaFin = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    // Validar días de la semana
    const diasActivos = formData.diasSemana.filter(d => d.activo);
    if (diasActivos.length === 0) {
      nuevosErrores.diasSemana = 'Debe seleccionar al menos un día de la semana';
    }

    // Validar horarios
    if (formData.mismoHorarioTodos) {
      if (!formData.horaInicioGeneral) {
        nuevosErrores.horaInicioGeneral = 'Ingrese hora de inicio general';
      }
      if (!formData.horaFinGeneral) {
        nuevosErrores.horaFinGeneral = 'Ingrese hora de fin general';
      }
    } else {
      // Validar que cada día activo tenga horario
      for (const dia of diasActivos) {
        if (!dia.horaInicio || !dia.horaFin) {
          nuevosErrores.diasSemana = `El día ${dia.label || dia.dia} debe tener horario especificado`;
          break;
        }
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = () => {
    if (validarFormulario()) {
      onSubmit(formData);
    }
  };

  const handleAgregarDocumento = (e) => {
    const file = e.target.files[0];
    if (file) {
      // En una implementación real, aquí subirías el archivo a un servidor
      // Por ahora, simulamos una URL
      const fakeUrl = `https://storage.example.com/documents/${file.name}`;
      setFormData(prev => ({
        ...prev,
        documentosUrls: [...prev.documentosUrls, fakeUrl],
      }));
    }
  };

  const handleEliminarDocumento = (index) => {
    setFormData(prev => ({
      ...prev,
      documentosUrls: prev.documentosUrls.filter((_, i) => i !== index),
    }));
  };

  const tipoSeleccionado = tiposLicencia.find(t => t.id === formData.tipoLicenciaId);

  return (
    <>
      {advertenciaConflicto && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
          Esta licencia tiene conflicto con guardias asignadas en estas fechas.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Selector de Bombero (solo para admin) */}
          {mostrarSelectorBombero && (
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Bombero *"
                value={formData.bomberoId}
                onChange={(e) => handleChange('bomberoId', e.target.value)}
                error={!!errores.bomberoId}
                helperText={errores.bomberoId}
              >
                <MenuItem value="">Seleccione un bombero</MenuItem>
                {bomberos.map((bombero) => (
                  <MenuItem key={bombero.id} value={bombero.id}>
                    {bombero.nombre} {bombero.apellidos} - {bombero.rut}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* Tipo de Licencia */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Tipo de Licencia *"
              value={formData.tipoLicenciaId}
              onChange={(e) => handleChange('tipoLicenciaId', e.target.value)}
              error={!!errores.tipoLicenciaId}
              helperText={errores.tipoLicenciaId}
            >
              <MenuItem value="">Seleccione un tipo</MenuItem>
              {tiposLicencia.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Otro Motivo (si tipo es "Otro") */}
          {tipoSeleccionado?.nombre === 'Otro' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Especifique el motivo *"
                value={formData.otroMotivo}
                onChange={(e) => handleChange('otroMotivo', e.target.value)}
                error={!!errores.otroMotivo}
                helperText={errores.otroMotivo}
              />
            </Grid>
          )}

          {/* Fecha Inicio */}
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              fullWidth
              label="Fecha de Inicio *"
              value={formData.fechaInicio}
              onChange={(e) => handleChange('fechaInicio', e.target.value)}
              error={!!errores.fechaInicio}
              helperText={errores.fechaInicio}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Fecha Fin */}
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              fullWidth
              label="Fecha de Fin *"
              value={formData.fechaFin}
              onChange={(e) => handleChange('fechaFin', e.target.value)}
              error={!!errores.fechaFin}
              helperText={errores.fechaFin}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Selector de días de la semana con horarios */}
          <Grid item xs={12}>
            <DiasSemanaSelectoretector
              value={formData.diasSemana}
              onChange={(nuevoDias) => handleChange('diasSemana', nuevoDias)}
              mismoHorarioTodos={formData.mismoHorarioTodos}
              onMismoHorarioChange={(valor) => handleChange('mismoHorarioTodos', valor)}
              horaInicioGeneral={formData.horaInicioGeneral}
              horaFinGeneral={formData.horaFinGeneral}
              onHorarioGeneralChange={(campo, valor) => {
                handleChange(campo === 'inicio' ? 'horaInicioGeneral' : 'horaFinGeneral', valor);
              }}
            />
            {errores.diasSemana && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errores.diasSemana}
              </Typography>
            )}
          </Grid>

          {/* Motivo/Justificación */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo o Justificación (opcional)"
              value={formData.motivo}
              onChange={(e) => handleChange('motivo', e.target.value)}
              inputProps={{ maxLength: 500 }}
              helperText={`${formData.motivo.length}/500 caracteres`}
            />
          </Grid>

          {/* Documentos */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Documentos de Respaldo {tipoSeleccionado?.requiereDocumento && '(requerido)'}
              </Typography>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                size="small"
              >
                Subir Documento
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleAgregarDocumento}
                />
              </Button>

              {formData.documentosUrls.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {formData.documentosUrls.map((url, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Documento ${index + 1}`}
                        secondary={url}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleEliminarDocumento(index)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {licencia ? 'Guardar Cambios' : 'Solicitar Licencia'}
          </Button>
        </Box>
      </>
  );
};

export default LicenciaForm;
