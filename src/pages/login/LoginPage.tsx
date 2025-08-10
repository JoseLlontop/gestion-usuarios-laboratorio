import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Grid,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginIllustration from '../../assets/images/login.png';

const LoginPage: React.FC = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);   
      // Redirige a la página protegida de gestión de becarios
      navigate('/gestion-admin-becario', { replace: true });
    } catch (err) {
      console.error('Error de login:', err);
      // el mensaje de error ya está en `error`
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}
    >
      <Grid
        container
        component={Paper}
        elevation={16}
        sx={{ borderRadius: 4, overflow: 'hidden', mt: 36, mx: 2 }}
      >
        {/* Ilustración */}
        <Grid
          item
          xs={false}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            background: `url(${LoginIllustration}) center/cover no-repeat`,
            p: 6
          }}
        />

        {/* Formulario */}
        <Grid item xs={12} md={6}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              height: '100%'
            }}
          >
            <Typography variant="h4" align="center">
              Iniciar Sesión
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              required
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <TextField
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(v => !v)}
                      edge="end"
                      aria-label="mostrar contraseña"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ position: 'relative' }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      color: 'inherit',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px'
                    }}
                  />
                  Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
