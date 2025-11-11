import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Chip,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Delete, Upload, Warning } from '@mui/icons-material';
import { useSelector } from 'react-redux';

const LicenciaForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  licenciaEditar = null,
  tiposLicencia = [],
  bomberos = [],
  mostrarSelectorBombero = false, // true para admin
}) => {
  const { usuario } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    bomberoId: '',
    tipoLicenciaId: '',
    otroMotivo: '',
    fechaInicio: '',
    fechaFin: '',
    esPorHoras: false,
    horaInicio: '',
    horaFin: '',
    motivo: '',
    documentosUrls: [],
  });

  const [errores, setErrores] = useState({});
  const [advertenciaConflicto, setAdvertenciaConflicto] = useState(false);

  useEffect(() => {
    if (licenciaEditar) {
      setFormData({
        bomberoId: licenciaEditar.bomberoId || '',
        tipoLicenciaId: licenciaEditar.tipoLicenciaId || '',
        otroMotivo: licenciaEditar.otroMotivo || '',
        fechaInicio: licenciaEditar.fechaInicio ? licenciaEditar.fechaInicio.split('T')[0] : '',
        fechaFin: licenciaEditar.fechaFin ? licenciaEditar.fechaFin.split('T')[0] : '',
        esPorHoras: licenciaEditar.esPorHoras || false,
        horaInicio: licenciaEditar.horaInicio || '',
        horaFin: licenciaEditar.horaFin || '',
        motivo: licenciaEditar.motivo || '',
        documentosUrls: licenciaEditar.documentosUrls || [],
      });
      setAdvertenciaConflicto(licenciaEditar.tieneConflictoGuardia || false);
    } else {
      // Limpiar formulario
      setFormData({
        bomberoId: '',
        tipoLicenciaId: '',
        otroMotivo: '',
        fechaInicio: '',
        fechaFin: '',
        esPorHoras: false,
        horaInicio: '',
        horaFin: '',
        motivo: '',
        documentosUrls: [],
      });
      setAdvertenciaConflicto(false);
    }
    setErrores({});
  }, [licenciaEditar, open]);

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

    if (formData.esPorHoras) {
      if (!formData.horaInicio) {
        nuevosErrores.horaInicio = 'Ingrese hora de inicio';
      }
      if (!formData.horaFin) {
        nuevosErrores.horaFin = 'Ingrese hora de fin';
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        {licenciaEditar ? 'Editar Licencia' : 'Solicitar Nueva Licencia'}
      </DialogTitle>

      <DialogContent>
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

          {/* Switch: Por horas o días completos */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.esPorHoras}
                  onChange={(e) => handleChange('esPorHoras', e.target.checked)}
                />
              }
              label="Licencia por horas (en lugar de días completos)"
            />
          </Grid>

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

          {/* Hora Inicio y Fin (si es por horas) */}
          {formData.esPorHoras && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  fullWidth
                  label="Hora de Inicio *"
                  value={formData.horaInicio}
                  onChange={(e) => handleChange('horaInicio', e.target.value)}
                  error={!!errores.horaInicio}
                  helperText={errores.horaInicio}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  fullWidth
                  label="Hora de Fin *"
                  value={formData.horaFin}
                  onChange={(e) => handleChange('horaFin', e.target.value)}
                  error={!!errores.horaFin}
                  helperText={errores.horaFin}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {licenciaEditar ? 'Guardar Cambios' : 'Solicitar Licencia'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LicenciaForm;
