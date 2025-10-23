import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AdminPanelSettings as AdminIcon,
  AccountBox as AccountIcon,
  Logout as LogoutIcon,
  LocalFireDepartment as FireDepartmentIcon,
  Inventory2 as Inventory2Icon,
  LocalShipping as LocalShippingIcon,
  NightsStay as NightsStayIcon,
} from '@mui/icons-material'

import { logoutUser } from '../store/slices/authSlice'

const DRAWER_WIDTH = 280

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: ['admin', 'usuario'],
  },
  {
    text: 'Bomberos',
    icon: <PeopleIcon />,
    path: '/bomberos',
    roles: ['admin', 'usuario'],
  },
  {
    text: 'Citaciones',
    icon: <EventIcon />,
    path: '/citaciones',
    roles: ['admin', 'usuario'],
  },
  {
    text: 'Oficiales',
    icon: <AccountIcon />,
    path: '/oficiales',
    roles: ['admin', 'usuario'],
  },
  {
    text: 'Material Menor',
    icon: <Inventory2Icon />,
    path: '/material',
    roles: ['admin', 'usuario'],
  },
  {
    text: 'Material Mayor',
    icon: <LocalShippingIcon />,
    path: '/material-mayor',
    roles: ['admin', 'usuario'],
  },
  {
    text: 'Guardia Nocturna',
    icon: <NightsStayIcon />,
    path: '/guardias',
    roles: ['admin'],
  },
  {
    text: 'Panel Admin',
    icon: <AdminIcon />,
    path: '/admin',
    roles: ['admin'],
  },
]

const Layout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(!isMobile)
  const [anchorEl, setAnchorEl] = useState(null)
  
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    handleProfileMenuClose()
    navigate('/login')
  }

  const handleNavigation = (path) => {
    navigate(path)
    if (isMobile) {
      setDrawerOpen(false)
    }
  }

  // Filtrar elementos de navegación según el rol del usuario
  const availableNavItems = navigationItems.filter(item =>
    item.roles.includes(user?.tipo || 'usuario')
  )

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo y título */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FireDepartmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Sistema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bomberos
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Navegación */}
      <List sx={{ flex: 1, px: 1 }}>
        {availableNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Información del usuario */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Conectado como:
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {user?.nombre || 'Usuario'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.rol || 'Rol no definido'}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            🚒 Segunda Compañía de Bomberos Viña del Mar
          </Typography>
          
          {/* Avatar y menú de usuario */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.nombre?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móviles
        }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar /> {/* Espaciador para el AppBar */}
        {drawer}
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Espaciador para el AppBar */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout