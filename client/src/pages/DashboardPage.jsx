import React from 'react'
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent
} from '@mui/material'

const DashboardPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📊 Dashboard Principal
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Bomberos
              </Typography>
              <Typography variant="h4">
                --
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Citaciones Activas
              </Typography>
              <Typography variant="h4">
                --
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Oficiales
              </Typography>
              <Typography variant="h4">
                --
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Usuarios Activos
              </Typography>
              <Typography variant="h4">
                --
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage