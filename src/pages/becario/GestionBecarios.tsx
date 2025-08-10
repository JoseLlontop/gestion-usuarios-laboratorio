import { useEffect, useState } from 'react';
import { Box, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';
import { Becario } from '../../models/types';

const GestionBecarios = () => {
  const [becarios, setBecarios] = useState<Becario[]>([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroArea, setFiltroArea] = useState('');

  // URL de la API
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

  return (
    <Box sx={{ mt: 5, pb: 0, px: 5 }}>
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
        Listado de Becarios
      </Typography>
      <Box display="flex" justifyContent="start" alignItems="center" mb={2} gap={2}>
        <TextField
          placeholder="Buscar por nombre o apellido"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          size="small"
          sx={{ width: 260 }}  // Ajusta el ancho 
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>  
          <InputLabel id="select-area-label">Filtrar por área</InputLabel>
          <Select
            labelId="select-area-label"
            value={filtroArea}
            label="Filtrar por área"
            onChange={e => setFiltroArea(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Desarrollo">Desarrollo</MenuItem>
            <MenuItem value="Infraestructura">Infraestructura</MenuItem>
            <MenuItem value="Ingenieria Social">Ingenieria Social</MenuItem>
          </Select>
        </FormControl>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GestionBecarios;
