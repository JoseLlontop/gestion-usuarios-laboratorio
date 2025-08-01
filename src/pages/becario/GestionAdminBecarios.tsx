import { useEffect, useState } from 'react';
import { Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, IconButton } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalNuevoBecario from '../../components/becario/ModalNuevoBecario';
import { show_alerta } from '../../helpers/funcionSweetAlert';
import { Becario } from '../../models/types';
import { useNavigate } from 'react-router-dom';

// Importamos el hook de autenticación
import { useAuth } from '../../context/AuthContext';

const GestionAdminBecarios = () => {
  const [becarios, setBecarios] = useState<Becario[]>([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currentBecario, setCurrentBecario] = useState<Becario | null>(null);

  const navigate = useNavigate();

  // Extraemos logout desde el contexto
  const { logout } = useAuth();

  const API_URL = process.env.REACT_APP_BACKEND_API_URL as string;

  // Fetch inicial de becarios
  useEffect(() => {
    //fetch(`${API_URL}/api/becarios`)
    fetch('/becarios.json') // Usar un archivo local para pruebas
      .then(res => res.json())
      .then(data => setBecarios(data))
      .catch(err => console.error('Error cargando becarios:', err));
  }, [API_URL]);

  // Filtrado por nombre/apellido y área
  const becariosFiltrados = becarios.filter(b => {
    const matchNombre = (`${b.nombre} ${b.apellido}`).toLowerCase().includes(filtroNombre.toLowerCase());
    const matchArea = filtroArea ? b.areaInscripcion === filtroArea : true;
    return matchNombre && matchArea;
  });

  // Guardar
  const handleSaveBecario = async (becario: Becario) => {
    try {
      const url = becario.id ? `${API_URL}/api/becarios/${becario.id}` : `${API_URL}/api/becarios/crear`;
      const method = becario.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(becario),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setBecarios(prev =>
        becario.id
          ? prev.map(b => (b.id === saved.id ? saved : b))
          : [...prev, saved]
      );
      show_alerta(becario.id ? 'Becario actualizado' : 'Becario registrado', 'success');
    } catch {
      show_alerta('Error al guardar becario', 'error');
    } finally {
      setOpenModal(false);
      setCurrentBecario(null);
    }
  };

  // Eliminar
  const handleDeleteBecario = async (id: number) => {
    if (!window.confirm('¿Confirma eliminación?')) return;
    try {
      const res = await fetch(`${API_URL}/api/becarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBecarios(prev => prev.filter(b => b.id !== id));
      show_alerta('Becario eliminado', 'success');
    } catch {
      show_alerta('Error al eliminar', 'error');
    }
  };

  return (
    <Box sx={{ mt: -3, pb: 0 }}>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#233044',
          color: 'white',
          px: 3,
          py: 2,
          borderRadius: 2,
          mb: 3
        }}
      >
        {/* Espacio vacío para equilibrar */}
        <Box sx={{ width: 48 /* anchura similar al botón */ }} />

        {/* Título con flexGrow para centrar */}
        <Typography
          variant="h4"
          sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}
        >
          Gestión de Becarios
        </Typography>

        {/* Botón de Cerrar Sesión */}
        <Button
          variant="outlined"
          color="inherit"
          onClick={async () => {
            navigate('/login-profesor', { replace: true }); 
            await logout();
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      {/* Filtros con menor separación */}
      <Box
        display="flex"
        alignItems="center"
        mb={2}
        gap={2}               // reduce el espacio
        sx={{ flexWrap: 'wrap' }} // que bajen si falta espacio
      >
        <TextField
          label="Buscar por nombre y apellido"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          size="small"
          sx={{ width: 260 }}  // Ajusta el ancho 
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="label-area">Filtrar área</InputLabel>
          <Select
            labelId="label-area"
            value={filtroArea}
            label="Filtrar área"
            onChange={e => setFiltroArea(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Desarrollo">Desarrollo</MenuItem>
            <MenuItem value="Infraestructura">Infraestructura</MenuItem>
            <MenuItem value="Ingenieria Social">Ingenieria Social</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCurrentBecario(null); setOpenModal(true); }}>
          Nuevo Becario
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {['#','Legajo','Apellido','Nombre','DNI','Móvil','Telegram','E‑mail','Año','Área','Beca','Acciones'].map(h => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {becariosFiltrados.map((b, i) => (
              <TableRow key={b.id}>
                <TableCell>{i+1}</TableCell>
                <TableCell>{b.legajo}</TableCell>
                <TableCell>{b.apellido}</TableCell>
                <TableCell>{b.nombre}</TableCell>
                <TableCell>{b.dni}</TableCell>
                <TableCell>{b.nroMovil}</TableCell>
                <TableCell>{b.usuarioTelegram}</TableCell>
                <TableCell>{b.email}</TableCell>
                <TableCell>{b.anioCurso}</TableCell>
                <TableCell>{b.areaInscripcion}</TableCell>
                <TableCell>{b.beca}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setCurrentBecario(b); setOpenModal(true); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteBecario(b.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalNuevoBecario open={openModal} onClose={() => { setOpenModal(false); setCurrentBecario(null); }} onSave={handleSaveBecario} becario={currentBecario} />
    </Box>
  );
};

export default GestionAdminBecarios;
