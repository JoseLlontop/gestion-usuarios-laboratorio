import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardActionArea, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  Box 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import assets from '../../assets'; // Asegúrate de que la ruta sea correcta

type Props = {};

const HomePage = (props: Props) => {
  return (
    <Container maxWidth="lg" sx={{ mt: -1, mb: 4 }}>
      {/* Sección principal (Hero) */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 6, 
          p: 4, 
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Laboratorio de Innovaciones en Sistemas de Información
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary">
          Bienvenido al LINSI un espacio colaborativo de la UTN La Plata donde estudiantes y docentes trabajan en proyectos de Ingeniería Social, Infraestructura y Desarrollo de Software. ¡Sumate y sé parte de la innovación!
        </Typography>
      </Box>

      {/* Grid de opciones: Becario vs Profesor/Administrador */}
      <Grid container spacing={4}>
        {/* Card 1: Becario */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea component={RouterLink} to="/registro-becario">
              {/* Reemplaza 'ruta-a-imagen-becario.jpg' con la ruta real */}
              <CardMedia
                component="img"
                height="200"
                image={assets.images.imagen_becario}
                alt="Icono Becario"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Acceso Becario
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Haz clic para registrarte como becario. Elige tu área de interés (Ingeniería Social, Infraestructura o Desarrollo de Software) y sumate a los proyectos disponibles.
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button 
                size="large" 
                fullWidth 
                variant="contained" 
                color="primary" 
                component={RouterLink} 
                to="/registro-becario"
              >
                Registrarme
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card 2: Profesor/Administrador */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea component={RouterLink} to="/login-profesor">
              {/* Reemplaza 'ruta-a-imagen-profesor.jpg' con la ruta real */}
              <CardMedia
                component="img"
                height="200"
                image={assets.images.imagen_profesor}
                alt="Icono Profesor"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Acceso Profesor / Administrador
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Si sos docente asignado a alguna de las áreas o administrador del laboratorio, inicia sesión para gestionar los becarios y su informacion.
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button 
                size="large" 
                fullWidth 
                variant="outlined" 
                color="secondary" 
                component={RouterLink} 
                to="/login-profesor"
              >
                Iniciar Sesión
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
