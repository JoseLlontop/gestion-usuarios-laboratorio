import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Props que recibe ErrorPage desde ErrorBoundary
interface ErrorPageProps {
  onBack: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ onBack }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        p: 3,
      }}
    >
      <Card
        sx={{
          width: '100%',    // ocupa todo el ancho disponible hasta maxWidth
          maxWidth: 450,    // aumenta el tamaño del card
          textAlign: 'center',
          p: 3,
          borderRadius: 4,
          boxShadow: 6,
        }}
      >
        <CardContent>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom>
            ¡Oops! Algo salió mal
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={3}>
            Lo sentimos, ha ocurrido un error inesperado.
            <br />Intentá recargar la página o volvé al inicio.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onBack}  // Ejecuta la función que limpia el ErrorBoundary y navega
          >
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ErrorPage;
