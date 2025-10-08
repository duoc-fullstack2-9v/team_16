import React from 'react'
import { Alert, Box, Typography, Button, Paper } from '@mui/material'
import { ErrorOutline as ErrorIcon } from '@mui/icons-material'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la interfaz de error
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Puedes también logear el error a un servicio de reportes de errores
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Interfaz de error personalizada
      return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Alert 
              severity="error" 
              icon={<ErrorIcon />}
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" gutterBottom>
                ¡Oops! Algo salió mal
              </Typography>
              <Typography variant="body1" gutterBottom>
                Se ha producido un error inesperado en esta página.
              </Typography>
            </Alert>

            {/* Detalles del error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detalles del Error:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {this.state.error.toString()}
                  </Typography>
                </Paper>
                
                {this.state.errorInfo && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Stack Trace:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 300, overflow: 'auto' }}>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {this.state.errorInfo.componentStack}
                      </Typography>
                    </Paper>
                  </>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={this.handleReload}
                color="primary"
              >
                Recargar Página
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.history.back()}
                color="secondary"
              >
                Volver Atrás
              </Button>
            </Box>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary