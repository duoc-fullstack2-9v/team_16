import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { createPlantilla, fetchGuardiaBomberos } from '../../store/slices/guardiasSlice'

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const CrearPlantillaDialog = ({ open, onClose }) => {
  const dispatch = useDispatch()
  const { bomberos, savingPlantilla } = useSelector((state) => state.guardias)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState('por_dia_semana')
  const [diasConfig, setDiasConfig] = useState([])
  const [selectedDia, setSelectedDia] = useState(null)
  const [selectedBomberos, setSelectedBomberos] = useState([])
  const [notasDia, setNotasDia] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      dispatch(fetchGuardiaBomberos())
      resetForm()
    }
  }, [open, dispatch])

  const resetForm = () => {
    setNombre('')
    setDescripcion('')
    setTipo('por_dia_semana')
    setDiasConfig([])
    setSelectedDia(null)
    setSelectedBomberos([])
    setNotasDia('')
    setError('')
  }

  const handleAddDia = () => {
    if (selectedDia === null) {
      setError('Selecciona un día para configurar')
      return
    }

    const existing = diasConfig.find((d) =>
      tipo === 'por_fecha' ? d.diaNumero === selectedDia : d.diaSemana === selectedDia
    )

    if (existing) {
      setError('Ya existe configuración para este día')
      return
    }

    const newDia =
      tipo === 'por_fecha'
        ? { diaNumero: selectedDia, notas: notasDia, bomberoIds: selectedBomberos }
        : { diaSemana: selectedDia, notas: notasDia, bomberoIds: selectedBomberos }

    setDiasConfig([...diasConfig, newDia])
    setSelectedDia(null)
    setSelectedBomberos([])
    setNotasDia('')
    setError('')
  }

  const handleRemoveDia = (index) => {
    setDiasConfig(diasConfig.filter((_, i) => i !== index))
  }

  const handleToggleBombero = (bomberoId) => {
    setSelectedBomberos((prev) =>
      prev.includes(bomberoId) ? prev.filter((id) => id !== bomberoId) : [...prev, bomberoId]
    )
  }

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    if (diasConfig.length === 0) {
      setError('Debes configurar al menos un día')
      return
    }

    try {
      await dispatch(
        createPlantilla({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          tipo,
          dias: diasConfig,
        })
      ).unwrap()
      onClose()
    } catch (err) {
      setError(err || 'Error al crear la plantilla')
    }
  }

  const getDiaLabel = (dia) => {
    if (tipo === 'por_fecha') {
      return `Día ${dia.diaNumero}`
    }
    return DIAS_SEMANA[dia.diaSemana]
  }

  const getBomberosNombres = (bomberoIds) => {
    return bomberoIds
      .map((id) => {
        const bombero = bomberos.find((b) => b.id === id)
        return bombero ? `${bombero.nombres} ${bombero.apellidos}` : null
      })
      .filter(Boolean)
      .join('; ')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Crear Plantilla de Guardia</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nombre de la plantilla"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              Tipo de plantilla
            </Typography>
            <RadioGroup value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <FormControlLabel
                value="por_dia_semana"
                control={<Radio />}
                label="Por día de la semana (Lunes, Martes, etc.)"
              />
              <FormControlLabel
                value="por_fecha"
                control={<Radio />}
                label="Por día del mes (1, 2, 3... 31)"
              />
            </RadioGroup>
          </FormControl>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Configurar día
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                {tipo === 'por_fecha' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>Día del mes</InputLabel>
                    <Select
                      value={selectedDia || ''}
                      label="Día del mes"
                      onChange={(e) => setSelectedDia(e.target.value)}
                    >
                      {Array.from({ length: 31 }).map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl fullWidth size="small">
                    <InputLabel>Día de la semana</InputLabel>
                    <Select
                      value={selectedDia !== null ? selectedDia : ''}
                      label="Día de la semana"
                      onChange={(e) => setSelectedDia(e.target.value)}
                    >
                      {DIAS_SEMANA.map((dia, index) => (
                        <MenuItem key={index} value={index}>
                          {dia}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Notas (opcional)"
                  value={notasDia}
                  onChange={(e) => setNotasDia(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
              Seleccionar bomberos:
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <List dense>
                {bomberos.map((bombero) => (
                  <ListItem key={bombero.id} disablePadding>
                    <ListItemButton onClick={() => handleToggleBombero(bombero.id)}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedBomberos.includes(bombero.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${bombero.apellidos}, ${bombero.nombres}`}
                        secondary={bombero.rango}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Button
              variant="contained"
              onClick={handleAddDia}
              fullWidth
              sx={{ mt: 2 }}
              disabled={selectedDia === null || selectedBomberos.length === 0}
            >
              Agregar Día a Plantilla
            </Button>
          </Box>

          {diasConfig.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Días configurados: ({diasConfig.length})
              </Typography>
              <List dense>
                {diasConfig.map((dia, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <Button size="small" color="error" onClick={() => handleRemoveDia(index)}>
                        Eliminar
                      </Button>
                    }
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <ListItemText
                      primary={getDiaLabel(dia)}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {dia.bomberoIds.length} bombero(s):
                          </Typography>
                          {' ' + getBomberosNombres(dia.bomberoIds)}
                          {dia.notas && (
                            <>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary" fontStyle="italic">
                                {dia.notas}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={savingPlantilla || diasConfig.length === 0}
        >
          {savingPlantilla ? 'Creando...' : 'Crear Plantilla'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CrearPlantillaDialog
