import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  ViewModule as TemplateIcon,
} from '@mui/icons-material'
import dayjs from 'dayjs'
import {
  createGuardiaMensual,
  deleteGuardiaDia,
  deleteGuardiaMensual,
  exportGuardiaMensualPdf,
  fetchGuardiaBomberos,
  fetchGuardiasMensuales,
  saveGuardiaDia,
  updateGuardiaMensual,
  aplicarPlantilla,
} from '../store/slices/guardiasSlice'
import PlantillasDialog from '../components/guardias/PlantillasDialog'

const MONTH_OPTIONS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const buildCalendarMatrix = (year, month) => {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const daysInMonth = firstDay.daysInMonth()
  const offset = (firstDay.day() + 6) % 7 // Ajuste para que lunes sea la primera columna

  const matrix = []
  let currentDay = 1 - offset

  while (currentDay <= daysInMonth) {
    const week = []
    for (let i = 0; i < 7; i += 1) {
      if (currentDay < 1 || currentDay > daysInMonth) {
        week.push(null)
      } else {
        const date = dayjs(`${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`)
        week.push(date)
      }
      currentDay += 1
    }
    matrix.push(week)
  }

  return matrix
}

const GuardiasPage = () => {
  const dispatch = useDispatch()
  const {
    guardias,
    selectedGuardiaId,
    bomberos,
    loading,
    savingDay,
    exporting,
    aplicandoPlantilla,
    error,
  } = useSelector((state) => state.guardias)

  const today = dayjs()
  const [selectedMonth, setSelectedMonth] = useState(today.month() + 1)
  const [selectedYear, setSelectedYear] = useState(today.year())
  const [minimoLocal, setMinimoLocal] = useState(4)
  const [notasLocal, setNotasLocal] = useState('')
  const [dayDialogOpen, setDayDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedBomberos, setSelectedBomberos] = useState([])
  const [dayNotes, setDayNotes] = useState('')
  const [plantillasDialogOpen, setPlantillasDialogOpen] = useState(false)

  const guardiaActual = useMemo(() => {
    if (!selectedGuardiaId) return null
    return guardias.find((item) => item.id === selectedGuardiaId) || null
  }, [guardias, selectedGuardiaId])

  const diasPorFecha = useMemo(() => {
    if (!guardiaActual) return {}
    return guardiaActual.dias.reduce((acc, dia) => {
      const key = dayjs(dia.fecha).format('YYYY-MM-DD')
      acc[key] = dia
      return acc
    }, {})
  }, [guardiaActual])

  useEffect(() => {
    dispatch(fetchGuardiaBomberos())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchGuardiasMensuales({ mes: selectedMonth, anio: selectedYear }))
  }, [dispatch, selectedMonth, selectedYear])

  useEffect(() => {
    if (!guardiaActual) {
      setMinimoLocal(4)
      setNotasLocal('')
      return
    }
    setMinimoLocal(guardiaActual.minimoBomberos || 4)
    setNotasLocal(guardiaActual.notas || '')
  }, [guardiaActual])

  const calendarMatrix = useMemo(
    () => buildCalendarMatrix(selectedYear, selectedMonth),
    [selectedMonth, selectedYear]
  )

  const handleCreateGuardia = async () => {
    try {
      await dispatch(
        createGuardiaMensual({
          mes: selectedMonth,
          anio: selectedYear,
          minimoBomberos: minimoLocal,
          notas: notasLocal || null,
        })
      ).unwrap()
    } catch (err) {
      console.error('Error al crear guardia mensual:', err)
    }
  }

  const handleSaveConfig = async () => {
    if (!guardiaActual) return
    try {
      await dispatch(
        updateGuardiaMensual({
          id: guardiaActual.id,
          data: {
            minimoBomberos: minimoLocal,
            notas: notasLocal || null,
          },
        })
      ).unwrap()
    } catch (err) {
      console.error('Error al actualizar guardia mensual:', err)
    }
  }

  const handleDeleteGuardia = async () => {
    if (!guardiaActual) return
    try {
      await dispatch(deleteGuardiaMensual(guardiaActual.id)).unwrap()
    } catch (err) {
      console.error('Error al eliminar guardia mensual:', err)
    }
  }

  const handleOpenDayDialog = (date) => {
    if (!guardiaActual) return
    const iso = date.format('YYYY-MM-DD')
    const dia = diasPorFecha[iso]
    setSelectedDate(date)
    setSelectedBomberos(dia ? dia.bomberos.map((item) => item.bombero.id) : [])
    setDayNotes(dia?.notas || '')
    setDayDialogOpen(true)
  }

  const handleToggleBombero = (bomberoId) => {
    setSelectedBomberos((prev) =>
      prev.includes(bomberoId)
        ? prev.filter((id) => id !== bomberoId)
        : [...prev, bomberoId]
    )
  }

  const handleSaveDay = async () => {
    if (!guardiaActual || !selectedDate) return
    try {
      await dispatch(
        saveGuardiaDia({
          guardiaId: guardiaActual.id,
          data: {
            fecha: selectedDate.toISOString(),
            notas: dayNotes || null,
            bomberoIds: selectedBomberos,
          },
        })
      ).unwrap()
      setDayDialogOpen(false)
    } catch (err) {
      console.error('Error al guardar guardia diaria:', err)
    }
  }

  const handleClearDay = async () => {
    if (!guardiaActual || !selectedDate) return
    const dia = diasPorFecha[selectedDate.format('YYYY-MM-DD')]
    if (!dia) {
      setDayDialogOpen(false)
      return
    }

    try {
      await dispatch(
        deleteGuardiaDia({ guardiaId: guardiaActual.id, diaId: dia.id })
      ).unwrap()
      setDayDialogOpen(false)
    } catch (err) {
      console.error('Error al eliminar guardia diaria:', err)
    }
  }

  const handleExportPdf = async () => {
    if (!guardiaActual) return
    try {
      await dispatch(
        exportGuardiaMensualPdf({
          guardiaId: guardiaActual.id,
          fileName: `guardia_nocturna_${guardiaActual.anio}_${String(guardiaActual.mes).padStart(2, '0')}.pdf`,
        })
      ).unwrap()
    } catch (err) {
      console.error('Error al exportar guardia mensual:', err)
    }
  }

  const handleAplicarPlantilla = async (plantilla) => {
    if (!guardiaActual) return
    try {
      await dispatch(
        aplicarPlantilla({
          guardiaId: guardiaActual.id,
          plantillaId: plantilla.id,
        })
      ).unwrap()
    } catch (err) {
      console.error('Error al aplicar plantilla:', err)
    }
  }

  const currentYear = today.year()
  const yearOptions = Array.from({ length: 6 }).map((_, index) => currentYear - 2 + index)

  const renderCell = (date) => {
    if (!date) {
      return (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            minHeight: 120,
            backgroundColor: 'background.paper',
          }}
        />
      )
    }

    const iso = date.format('YYYY-MM-DD')
    const dia = diasPorFecha[iso]
    const assigned = dia?.bomberos || []

    return (
      <Box
        role="button"
        tabIndex={0}
        onClick={() => handleOpenDayDialog(date)}
        onKeyPress={(event) => {
          if (event.key === 'Enter') handleOpenDayDialog(date)
        }}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          minHeight: 120,
          p: 1,
          cursor: guardiaActual ? 'pointer' : 'default',
          backgroundColor: guardiaActual ? 'background.paper' : 'action.disabledBackground',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {date.date()}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {assigned.length > 0 ? (
            assigned.map((item) => (
              <Chip
                key={item.id}
                label={`${item.bombero.apellidos}, ${item.bombero.nombres}`}
                size="small"
                color={assigned.length < (guardiaActual?.minimoBomberos || 0) ? 'warning' : 'default'}
              />
            ))
          ) : (
            <Typography variant="caption" color="text.secondary">
              Sin asignaciones
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Guardia Nocturna
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona los turnos nocturnos por mes y asigna los bomberos requeridos.
          </Typography>
        </Box>
        {guardiaActual && (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar a PDF">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleExportPdf}
                  disabled={exporting}
                >
                  {exporting ? <CircularProgress size={24} /> : <DownloadIcon />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Eliminar guardia mensual">
              <IconButton color="error" onClick={handleDeleteGuardia}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardHeader title="Configuración del mes" />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="mes-select-label">Mes</InputLabel>
                <Select
                  labelId="mes-select-label"
                  value={selectedMonth}
                  label="Mes"
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  {MONTH_OPTIONS.map((name, index) => (
                    <MenuItem key={name} value={index + 1}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="anio-select-label">Año</InputLabel>
                <Select
                  labelId="anio-select-label"
                  value={selectedYear}
                  label="Año"
                  onChange={(event) => setSelectedYear(event.target.value)}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="Mínimo bomberos"
                type="number"
                fullWidth
                value={minimoLocal}
                onChange={(event) => setMinimoLocal(Number(event.target.value))}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Notas"
                fullWidth
                value={notasLocal}
                onChange={(event) => setNotasLocal(event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack direction="row" spacing={2}>
                {guardiaActual ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveConfig}
                      disabled={loading}
                    >
                      Guardar cambios
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TemplateIcon />}
                      onClick={() => setPlantillasDialogOpen(true)}
                      disabled={aplicandoPlantilla}
                    >
                      {aplicandoPlantilla ? 'Aplicando...' : 'Aplicar Plantilla'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateGuardia}
                      disabled={loading}
                    >
                      Crear guardia del mes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TemplateIcon />}
                      onClick={() => setPlantillasDialogOpen(true)}
                    >
                      Gestionar Plantillas
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={`Calendario ${MONTH_OPTIONS[selectedMonth - 1]} ${selectedYear}`} />
        <CardContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && (
            <Grid container columns={7} spacing={0}>
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                <Grid item xs={1} key={day}>
                  <Box
                    sx={{
                      p: 1,
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {day}
                  </Box>
                </Grid>
              ))}

              {calendarMatrix.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                  {week.map((date, dayIndex) => (
                    <Grid item xs={1} key={`${weekIndex}-${dayIndex}`}>
                      {renderCell(date)}
                    </Grid>
                  ))}
                </React.Fragment>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Dialog open={dayDialogOpen} onClose={() => setDayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDate
            ? `Asignar bomberos - ${selectedDate.format('DD [de] MMMM YYYY')}`
            : 'Asignar bomberos'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Notas del día"
            value={dayNotes}
            onChange={(event) => setDayNotes(event.target.value)}
            sx={{ mb: 2 }}
          />
          <List dense>
            {bomberos.map((bombero) => {
              const labelId = `checkbox-list-label-${bombero.id}`
              return (
                <ListItem key={bombero.id} disablePadding>
                  <ListItemButton onClick={() => handleToggleBombero(bombero.id)}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        tabIndex={-1}
                        disableRipple
                        checked={selectedBomberos.includes(bombero.id)}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      id={labelId}
                      primary={`${bombero.apellidos}, ${bombero.nombres}`}
                      secondary={bombero.rango}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleClearDay}>
            Limpiar
          </Button>
          <Button onClick={() => setDayDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveDay}
            disabled={savingDay}
          >
            {savingDay ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <PlantillasDialog
        open={plantillasDialogOpen}
        onClose={() => setPlantillasDialogOpen(false)}
        onSelect={handleAplicarPlantilla}
      />
    </Box>
  )
}

export default GuardiasPage
