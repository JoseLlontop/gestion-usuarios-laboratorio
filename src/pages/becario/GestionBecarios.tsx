import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
  Stack,
} from '@mui/material';

import { subscribeBecarios } from '../../services/becarios';
import { subscribeAreas, Area } from '../../services/areas';

// Tipo que retorna el service (incluye id)
import { Becario as SvcBecarioType } from '../../services/becarios';

const GestionBecarios: React.FC = () => {
  // lista cruda desde el service (contiene id y campos adicionales como areaId, areaNombre, etc)
  const [svcItems, setSvcItems] = useState<SvcBecarioType[]>([]);
  // lista de áreas para el select de filtro
  const [areas, setAreas] = useState<Area[]>([]);

  // estados UI
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroArea, setFiltroArea] = useState(''); // guardamos areaId aquí
  const [loading, setLoading] = useState(true);

  // Suscribirse a becarios (realtime)
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeBecarios((items: SvcBecarioType[]) => {
      setSvcItems(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Suscribirse a áreas para el select
  useEffect(() => {
    const unsubA = subscribeAreas(items => setAreas(items));
    return () => unsubA();
  }, []);

  const itemsFiltrados = svcItems.filter(item => {
    const name = `${item.nombre ?? ''} ${item.apellido ?? ''}`.toLowerCase();
    const matchNombre = name.includes(filtroNombre.toLowerCase());

    // comparar por nombre de área en vez de areaId
    const areaNombreBecario = ((item as any).areaNombre ?? '').toString().toLowerCase();
    const matchArea = filtroArea ? areaNombreBecario.includes(filtroArea.toLowerCase()) : true;

    return matchNombre && matchArea;
  });

  return (
    <Box sx={{ mt: 5, pb: 0, px: 5 }}>
      {/* Encabezado */}
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

      {/* Filtros */}
      <Box display="flex" justifyContent="start" alignItems="center" mb={2} gap={2} flexWrap="wrap">
        <TextField
          placeholder="Buscar por nombre o apellido"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          size="small"
          sx={{ width: 260 }}
        />

      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="select-area-label">Filtrar por área</InputLabel>
        <Select
          labelId="select-area-label"
          value={filtroArea}
          label="Filtrar por área"
          onChange={e => setFiltroArea(e.target.value as string)}
        >
          <MenuItem value="">Todas</MenuItem>
          {areas.map(a => (
            // antes: value={a.id}
            <MenuItem key={a.id} value={a.nombre}>
              {a.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </Box>

      {/* Contenido: tabla o loader */}
      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Legajo</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Móvil</TableCell>
                <TableCell>Telegram</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Año</TableCell>
                <TableCell>Área</TableCell>
                <TableCell>Beca</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {itemsFiltrados.map((i, idx) => (
                <TableRow key={i.id ?? idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{i.legajo ?? '—'}</TableCell>
                  <TableCell>{i.apellido ?? '—'}</TableCell>
                  <TableCell>{i.nombre ?? '—'}</TableCell>
                  <TableCell>{i.nroMovil ?? '—'}</TableCell>
                  <TableCell>{i.usuarioTelegram ?? '—'}</TableCell>
                  <TableCell>{i.email ?? '—'}</TableCell>

                  {/* anioCurso puede venir como number o string — lo forzamos a string al mostrar */}
                  <TableCell>{String(i.anioCurso ?? '—')}</TableCell>

                  {/* mostrar nombre de área y beca (denormalizados) */}
                  <TableCell>{(i as any).areaNombre ?? '—'}</TableCell>
                  <TableCell>{(i as any).becaNombre ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default GestionBecarios;