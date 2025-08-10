import * as React from "react";
import { Link as RouterLink } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Stack,
  Chip,
  Divider,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Login as LoginIcon,
  Rocket as RocketIcon,
  Engineering as EngineeringIcon,
  Science as ScienceIcon,
  Copyright as CopyrightIcon,
} from "@mui/icons-material";

import assets from '../../assets'; // mantén la ruta que ya usa tu proyecto
import ModalNuevoBecario from '../../components/becario/ModalNuevoBecario';
import { Becario } from '../../models/types';
import { show_alerta } from '../../helpers/funcionSweetAlert';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#233044' }, // teal
    secondary: { main: '#8b5cf6' }, // violet
    background: { default: '#fbfbfd' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(2,6,23,0.06)',
        },
      },
    },
  },
});

export default function HomePage() {
  const [openModal, setOpenModal] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>(
    { open: false, message: '', severity: 'success' }
  );

  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleSaveBecario = async (becario: Becario) => {
    try {
      // Aquí es donde integrarías la llamada a tu API real.
      // Por compatibilidad con tu código actual uso show_alerta (sweetalert wrapper)
      show_alerta('Becario registrado con éxito', 'success');
      setOpenModal(false);
      setSnackbar({ open: true, message: 'Becario registrado con éxito', severity: 'success' });
    } catch (err) {
      console.error(err);
      show_alerta('Error al registrar becario', 'error');
      setSnackbar({ open: true, message: 'Error al registrar becario', severity: 'error' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* HERO */}
      <Box
        component="header"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: '100vw',
          left: '50%',
          transform: 'translateX(-50%)',
          boxSizing: 'border-box',
          py: { xs: 6, md: 10 },
          mb: { xs: 4, md: 6 },
          background: `
            radial-gradient(700px 320px at 8% 20%, rgba(61,96,190,0.28), transparent),
            radial-gradient(680px 300px at 92% 12%, rgba(139,92,246,0.22), transparent),
            linear-gradient(180deg, rgba(35,48,68,0.08), rgba(35,48,68,0.02))
          `,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <Container
          maxWidth="lg"
          disableGutters
          sx={{
            px: { xs: 2, md: 3 },
            py: 0,           // elimina el padding vertical
            border: 'none',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <RocketIcon color="primary" />
            <Typography variant="overline" color="text.secondary">
              UTN La Plata — LINSI
            </Typography>
          </Stack>

          <Typography
            variant={mdUp ? 'h3' : 'h4'}
            component="h1"
            sx={{ fontWeight: 800, lineHeight: 1.05, mb: 2 }}
          >
            Laboratorio de Innovaciones en Sistemas de Información
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 920, mb: 3 }}
          >
            Espacio académico donde estudiantes y docentes impulsan proyectos reales
            en Ingeniería Social, Infraestructura y Desarrollo de Software. Encontrá
            oportunidades, colaborá en investigaciones y sumá experiencia.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: 'flex-start' }}
          >
            <Chip
              icon={<ScienceIcon />}
              label="Ingeniería Social"
              color="secondary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip
              icon={<EngineeringIcon />}
              label="Infraestructura"
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip
              icon={<SchoolIcon />}
              label="Desarrollo de Software"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ border: 'none' }}>
        {/* Cards principales */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform .18s ease', '&:hover': { transform: 'translateY(-6px)' } }}>
              <CardActionArea onClick={() => setOpenModal(true)} sx={{ display: 'block' }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={assets?.images?.imagen_becario ?? '/placeholder-becario.png'}
                  alt="Acceso Becario"
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ pb: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <GroupIcon color="primary" />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Acceso Becario
                    </Typography>
                  </Stack>
                  <Typography variant="body1" color="text.secondary">
                    Registrate como becario, elegí tu área de interés y formá parte de los proyectos activos del laboratorio.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ p: 2 }}>
                <Button size="large" fullWidth variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                  Registrarme
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform .18s ease', '&:hover': { transform: 'translateY(-6px)' } }}>
              <CardActionArea component={RouterLink} to="/login-profesor">
                <CardMedia
                  component="img"
                  height="220"
                  image={assets?.images?.imagen_profesor ?? '/placeholder-profesor.png'}
                  alt="Acceso Profesor"
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ pb: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <LoginIcon color="secondary" />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Acceso Profesor / Administrador
                    </Typography>
                  </Stack>
                  <Typography variant="body1" color="text.secondary">
                    Docentes y administradores: iniciá sesión para gestionar becarios, proyectos y recursos del laboratorio.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ p: 2 }}>
                <Button size="large" fullWidth variant="outlined" color="secondary" component={RouterLink} to="/login-profesor">
                  Iniciar sesión
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box component="footer" sx={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          py: { xs: 3, md: 3 },
          mt: 6,
          bgcolor: '#000000',
          color: 'rgba(255,255,255,0.95)'
        }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={4} alignItems="flex-start">
              <Grid item xs={12} md={8}>
                <Stack spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'inherit' }}>
                    LINSI - UTN La Plata
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Laboratorio de Innovaciones en Sistemas de Información. Comunidad académica creando soluciones reales.
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, opacity: 0.9 }}>
                  Sitios
                </Typography>
                <Stack spacing={1}>
                  <a href="https://www.frlp.utn.edu.ar" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Universidad - UTN FRLP
                  </a>
                  <a href="http://www.linsi.edu.ar" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Laboratorio LINSI
                  </a>
                </Stack>
              </Grid>
            </Grid>

            <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 3, opacity: 0.8 }}>
              <CopyrightIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">{new Date().getFullYear()} LINSI - UTN La Plata. Todos los derechos reservados.</Typography>
            </Stack>
          </Container>
        </Box>

        {/* Modal */}
        <ModalNuevoBecario open={openModal} onClose={() => setOpenModal(false)} onSave={handleSaveBecario} becario={null} />

        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={2800} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
