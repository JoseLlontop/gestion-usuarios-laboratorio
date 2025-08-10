import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Container, Box, Typography, TextField, Button, InputAdornment,
  IconButton, Grid, Paper, Alert, CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoginIllustration from "../../assets/images/login.png";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const loading = authLoading; // unificamos estados

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      navigate("/gestion-admin-becarios", { replace: true });
    } catch (err) {
      // error ya fue seteado en el contexto; podemos usar authError o mostrar fallback
      setLocalError(authError ?? "Error al iniciar sesión");
    } finally {
      setPassword("");
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <Grid container component={Paper} elevation={16} sx={{ borderRadius: 4, overflow: "hidden", mt: 36, mx: 2 }}>
        <Grid item xs={false} md={6} sx={{ display: { xs: "none", md: "flex" }, background: `url(${LoginIllustration}) center/cover no-repeat`, p: 6 }} />
        <Grid item xs={12} md={6}>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h4" align="center">Iniciar Sesión</Typography>

            {(localError || authError) && <Alert severity="error" onClose={() => { setLocalError(null); }}>{localError ?? authError}</Alert>}

            <TextField label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            <TextField label="Contraseña" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" aria-label="toggle password">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
              {loading ? <><CircularProgress size={20} sx={{ color: "inherit", mr: 1 }} />Entrando…</> : "Entrar"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;