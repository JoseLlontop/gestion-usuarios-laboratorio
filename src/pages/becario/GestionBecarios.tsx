import { useEffect, useState } from 'react';
import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, IconButton } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalNuevoBecario from '../../components/becario/ModalNuevoBecario';
import { show_alerta } from '../../helpers/funcionSweetAlert'; 
import { Becario } from '../../models/types';

const GestionBecarios = () => {
  const [becarios, setBecarios] = useState<Becario[]>([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currentBecario, setCurrentBecario] = useState<Becario | null>(null);

  const API_URL = process.env.REACT_APP_BACKEND_API_URL as string;

  // Fetch inicial de becarios
  useEffect(() => {
    //fetch(`${API_URL}/api/becarios`)
    fetch('/becarios.json') // Usar un archivo local para pruebas
      .then(res => res.json())
      .then(data => setBecarios(data))
      .catch(err => console.error('Error cargando becarios:', err));
  }, [API_URL]);

  // Filtrado por nombre o apellido
  const becariosFiltrados = becarios.filter(b =>
    (`${b.nombre} ${b.apellido}`)
      .toLowerCase()
      .includes(filtroNombre.toLowerCase())
  );

  // Crear o actualizar becario
  const handleSaveBecario = async (becario: Becario) => {
    try {
      const url = becario.id
        ? `${API_URL}/api/becarios/${becario.id}`
        : `${API_URL}/api/becarios/crear`;
      const method = becario.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(becario),
      });
      if (!res.ok) throw new Error('Error al guardar becario');
      const saved = await res.json();

      setBecarios(prev =>
        becario.id
          ? prev.map(b => (b.id === saved.id ? saved : b))
          : [...prev, saved]
      );
      show_alerta(
        becario.id ? 'Becario actualizado con éxito' : 'Becario registrado con éxito',
        'success'
      );
    } catch (e) {
      console.error(e);
      show_alerta('Ocurrió un error al guardar el becario', 'error');
    } finally {
      setOpenModal(false);
      setCurrentBecario(null);
    }
  };

  // Eliminar
  const handleDeleteBecario = async (id: number) => {
    if (!window.confirm('¿Confirma eliminación de este becario?')) return;
    try {
      const res = await fetch(`${API_URL}/api/becarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBecarios(prev => prev.filter(b => b.id !== id));
      show_alerta('Becario eliminado', 'success');
    } catch {
      show_alerta('Error al eliminar becario', 'error');
    }
  };

  return (
    <Box sx={{ mt: -3, pb: 0 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontWeight: 'bold',
          backgroundColor: '#233044',
          color: 'white',
          p: '1rem',
          borderRadius: 2,
          mb: 3,
        }}
      >
        Gestión de Becarios
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          placeholder="Buscar por nombre o apellido"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setCurrentBecario(null);
            setOpenModal(true);
          }}
        >
          Nuevo Becario
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Legajo</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Móvil</TableCell>
              <TableCell>Telegram</TableCell>
              <TableCell>E‑mail</TableCell>
              <TableCell>Año</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Beca</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {becariosFiltrados.map((b, i) => (
              <TableRow key={b.id}>
                <TableCell>{i + 1}</TableCell>
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

      <ModalNuevoBecario
        open={openModal}
        onClose={() => { setOpenModal(false); setCurrentBecario(null); }}
        onSave={handleSaveBecario}
        becario={currentBecario}
      />
    </Box>
  );
};

export default GestionBecarios;
