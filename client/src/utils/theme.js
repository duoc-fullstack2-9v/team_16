import { createTheme } from '@mui/material/styles'

// Tema personalizado para el Sistema de Bomberos
const theme = createTheme({
  palette: {
    primary: {
      main: '#13416e', // Azul marino principal
      light: '#116fdb',
      dark: '#0d2d4d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc3545', // Rojo bomberos
      light: '#e74c3c',
      dark: '#c0392b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    error: {
      main: '#e74c3c',
    },
    warning: {
      main: '#ffc107',
    },
    success: {
      main: '#28a745',
    },
    info: {
      main: '#667eea',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#333333',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#333333',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#333333',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#333333',
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#333333',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#333333',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #13416e, #116fdb)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0d2d4d, #0e5bb3)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(19, 65, 110, 0.3)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #dc3545, #e74c3c)',
          '&:hover': {
            background: 'linear-gradient(135deg, #c0392b, #d32f2f)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused fieldset': {
              borderColor: '#13416e',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333333',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0',
        },
      },
    },
  },
})

export default theme