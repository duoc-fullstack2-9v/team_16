import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Container,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon,
  Person as PersonIcon,
  Lock as LockIcon 
} from '@mui/icons-material'
import { loginUser } from '../store/slices/authSlice'

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, isAuthenticated } = useSelector(state => state.auth)

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar errores de validación cuando el usuario escribe
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const errors = {}
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido'
    }
    
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 4) {
      errors.password = 'La contraseña debe tener al menos 4 caracteres'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await dispatch(loginUser(formData)).unwrap()
      // El useEffect se encargará de la redirección
    } catch (error) {
      console.error('Error en login:', error)
    }
  }

  // Rellenar credenciales de prueba
  const fillTestCredentials = (type) => {
    if (type === 'admin') {
      setFormData({
        email: 'admin',
        password: '1234'
      })
    } else if (type === 'user') {
      setFormData({
        email: 'bombero@bomberos.cl',
        password: 'bomb345'
      })
    }
    setValidationErrors({})
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card elevation={6}>
        <CardContent sx={{ p: 4 }}>
          {/* Encabezado */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
              🚒 Sistema Bomberos
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Segunda Compañía Viña del Mar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tus credenciales para acceder al sistema
            </Typography>
          </Box>

          {/* Mensajes de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="email"
              label="Email o Usuario"
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              margin="normal"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="admin o bombero@bomberos.cl"
            />

            <TextField
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              margin="normal"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Ingresa tu contraseña"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Credenciales de Prueba
            </Typography>
          </Divider>

          {/* Botones de prueba */}
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => fillTestCredentials('admin')}
              disabled={loading}
              startIcon={<PersonIcon />}
            >
              Admin (admin/1234)
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => fillTestCredentials('user')}
              disabled={loading}
              startIcon={<PersonIcon />}
            >
              Pedro (bombero@bomberos.cl)
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default LoginPage