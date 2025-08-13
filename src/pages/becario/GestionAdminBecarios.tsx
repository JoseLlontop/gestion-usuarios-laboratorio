import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Select, MenuItem, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, CircularProgress
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import ModalNuevoBecario from '../../components/becario/ModalNuevoBecario';
import ModalAreasAdmin from '../../components/area/ModalAreasAdmin';
import ModalBecasAdmin from '../../components/beca/ModalBecasAdmin';

import { show_alerta } from '../../helpers/funcionSweetAlert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Services (tipos del service)
import {
  subscribeBecarios,
  createBecario as svcCreateBecario,
  updateBecario as svcUpdateBecario,
  deleteBecario as svcDeleteBecario,
  Becario as SvcBecarioType
} from '../../services/becarios';

// Tipo de la UI (models/types) — sin id
import { Becario as AppBecario } from '../../models/types';
import { subscribeAreas, Area } from '../../services/areas';
import { subscribeBecas, Beca as BecaType } from '../../services/becas';

const GestionAdminBecarios: React.FC = () => {
  // Lista para render (modelo UI)
  const [becarios, setBecarios] = useState<AppBecario[]>([]);
  // Lista cruda del service (incluye id) — útil para acciones que requieren id
  const [svcItems, setSvcItems] = useState<SvcBecarioType[]>([]);

  // Filtros y UI
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroArea, setFiltroArea] = useState('');

  // Modal nuevo/editar
  const [openModal, setOpenModal] = useState(false);
  const [currentBecario, setCurrentBecario] = useState<AppBecario | null>(null);
  // Cuando editamos guardamos el id del doc Firestore aquí (null = crear nuevo)
  const [currentBecarioId, setCurrentBecarioId] = useState<string | null>(null);

  // Modales de administración de áreas y becas
  const [openAreasModal, setOpenAreasModal] = useState(false);
  const [openBecasModal, setOpenBecasModal] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [becasList, setBecasList] = useState<BecaType[]>([]);

  // Confirm dialog para eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // -------------------------
  // Suscripción realtime: svcItems (service) -> mantenemos svcItems y mapped becarios
  // -------------------------
  useEffect(() => {
    const unsub = subscribeBecarios((items: SvcBecarioType[]) => {
      // Guardamos la lista cruda (contiene id y campos que usa el service)
      setSvcItems(items);

      // Mapeamos a AppBecario (modelo UI) y FORZAMOS anioCurso a string
      const mapped: AppBecario[] = items.map(i => ({
        legajo: i.legajo ?? '',
        apellido: i.apellido ?? '',
        nombre: i.nombre ?? '',
        dni: i.dni ?? '',
        nroMovil: i.nroMovil ?? '',
        usuarioTelegram: i.usuarioTelegram ?? '',
        email: i.email ?? '',
        // <-- Aquí convertimos explícitamente a string para evitar problemas de tipos
        anioCurso: String(i.anioCurso ?? ''),
        // usamos nombres denormalizados si existen
        areaInscripcion: (i as any).areaNombre ?? (i as any).areaInscripcion ?? '',
        beca: (i as any).becaNombre ?? (i as any).beca ?? '',
      }));
      setBecarios(mapped);
    });

    return () => unsub();
  }, []);

  // -------------------------
  // Suscripción a áreas y becas para selects
  // -------------------------
  useEffect(() => {
    const unsubA = subscribeAreas(items => setAreas(items));
    const unsubB = subscribeBecas(items => setBecasList(items));
    return () => { unsubA(); unsubB(); };
  }, []);

  // -------------------------
  // Filtrado (aplicado sobre svcItems para garantizar que podemos usar doc.id en acciones)
  // -------------------------
  const svcItemsFiltrados = svcItems.filter(i => {
    const name = `${i.nombre ?? ''} ${i.apellido ?? ''}`.toLowerCase();
    const matchName = name.includes(filtroNombre.toLowerCase());
    const matchArea = filtroArea ? ((i as any).areaId === filtroArea) : true;
    return matchName && matchArea;
  });

  // -------------------------
  // Abrir modal: nuevo o editar
  // -------------------------
  const openNewModal = () => {
    setCurrentBecario(null);
    setCurrentBecarioId(null);
    setOpenModal(true);
  };

  const openEditModal = (svcItem: SvcBecarioType) => {
    // Guardamos el id para hacer update después
    setCurrentBecarioId(svcItem.id ?? null);

    // Mapeamos svcItem -> AppBecario (UI model, sin id)
    const app: AppBecario = {
      legajo: svcItem.legajo ?? '',
      apellido: svcItem.apellido ?? '',
      nombre: svcItem.nombre ?? '',
      dni: svcItem.dni ?? '',
      nroMovil: svcItem.nroMovil ?? '',
      usuarioTelegram: svcItem.usuarioTelegram ?? '',
      email: svcItem.email ?? '',
      anioCurso: String(svcItem.anioCurso ?? ''), // aseguramos string
      areaInscripcion: (svcItem as any).areaNombre ?? (svcItem as any).areaInscripcion ?? '',
      beca: (svcItem as any).becaNombre ?? (svcItem as any).beca ?? '',
    };

    setCurrentBecario(app);
    setOpenModal(true);
  };

  // -------------------------
  // Mapper: AppBecario -> SvcBecarioType (antes de persistir)
  // -------------------------
  const mapAppToSvc = (app: AppBecario): SvcBecarioType => {
  const areaObj = areas.find(a => a.nombre === (app.areaInscripcion ?? ''));
  const becaObj = becasList.find(b => b.nombre === (app.beca ?? ''));

  const maybeNum = Number(app.anioCurso);
  const anioField = Number.isNaN(maybeNum) ? app.anioCurso : maybeNum;

  const svc: Partial<SvcBecarioType> = {
    legajo: app.legajo,
    apellido: app.apellido,
    nombre: app.nombre,
    dni: app.dni,
    nroMovil: app.nroMovil,
    usuarioTelegram: app.usuarioTelegram,
    email: app.email,
    anioCurso: anioField,
    activo: true,
    // referencias + denormalizados
    areaId: areaObj?.id,
    areaNombre: areaObj?.nombre ?? app.areaInscripcion,
    becaId: becaObj?.id,
    becaNombre: becaObj?.nombre ?? app.beca,
  };

  // casteo final: el service espera SvcBecarioType o Partial<Becario> para update.
  return svc as SvcBecarioType;
};

  // -------------------------
  // Guardar (create / update) — recibe AppBecario desde el modal
  // -------------------------
const handleSaveBecario = async (appBecario: AppBecario) => {
    console.log('handleSaveBecario called — currentBecarioId:', currentBecarioId);
    console.log('appBecario (from modal):', appBecario);

    try {
      const svcObj = mapAppToSvc(appBecario);
      console.log('svcObj to persist:', svcObj);

      if (currentBecarioId) {
        console.log('Calling updateBecario with id:', currentBecarioId);
        await svcUpdateBecario(currentBecarioId, svcObj);
        console.log('updateBecario finished OK');
        show_alerta('Becario actualizado', 'success');
      } else {
        console.log('Calling createBecario (no currentBecarioId)');
        await svcCreateBecario(svcObj);
        console.log('createBecario finished OK');
        show_alerta('Becario registrado', 'success');
      }
    } catch (e) {
      console.error('ERROR in handleSaveBecario:', e);
      show_alerta(`Error al guardar becario`);
    } finally {
      setOpenModal(false);
      setCurrentBecario(null);
      setCurrentBecarioId(null);
    }
  };

  // -------------------------
  // Eliminación con dialog (sin window.confirm)
  // -------------------------
  const openConfirmDelete = (svcId: string | undefined, label?: string) => {
    if (!svcId) return;
    setPendingDelete({ id: svcId, label });
    setConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await svcDeleteBecario(pendingDelete.id);
      show_alerta('Becario eliminado', 'success');
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (err) {
      console.error('Error eliminando becario:', err);
      show_alerta('Error al eliminar becario', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <Box sx={{ mt: 5, pb: 0, px: 5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#233044', color: 'white', px: 3, py: 2, borderRadius: 2, mb: 3 }}>
        <Box sx={{ width: 48 }} />
        <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}>Gestión de Becarios</Typography>
        <Button variant="outlined" color="inherit" onClick={async () => { navigate('/login-profesor', { replace: true }); await logout(); }}>Cerrar Sesión</Button>
      </Box>

      {/* Filtros y acciones */}
      <Box display="flex" alignItems="center" mb={2} gap={2} sx={{ flexWrap: 'wrap' }}>
        <TextField label="Buscar por nombre y apellido" value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} size="small" sx={{ width: 260 }} />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="label-area">Filtrar área</InputLabel>
          <Select labelId="label-area" value={filtroArea} label="Filtrar área" onChange={e => setFiltroArea(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            {areas.map(a => <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" startIcon={<AddIcon />} onClick={openNewModal}>Nuevo Becario</Button>

        <Button variant="outlined" color="primary" onClick={() => setOpenAreasModal(true)} sx={{ ml: 'auto' }}>Administrar áreas</Button>
        <Button variant="outlined" color="secondary" onClick={() => setOpenBecasModal(true)}>Administrar becas</Button>
      </Box>

      {/* Tabla (usamos svcItems para tener accesso al doc.id en acciones) */}
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {['#','Legajo','Apellido','Nombre','DNI','Móvil','Telegram','E-mail','Año','Área','Beca','Acciones'].map(h => <TableCell key={h}>{h}</TableCell>)}
            </TableRow>
          </TableHead>

          <TableBody>
            {svcItemsFiltrados.map((i, idx) => (
              <TableRow key={i.id ?? idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{i.legajo ?? '—'}</TableCell>
                <TableCell>{i.apellido ?? '—'}</TableCell>
                <TableCell>{i.nombre ?? '—'}</TableCell>
                <TableCell>{i.dni ?? '—'}</TableCell>
                <TableCell>{i.nroMovil ?? '—'}</TableCell>
                <TableCell>{i.usuarioTelegram ?? '—'}</TableCell>
                <TableCell>{i.email ?? '—'}</TableCell>
                <TableCell>{String(i.anioCurso ?? '—')}</TableCell>
                <TableCell>{(i as any).areaNombre ?? '—'}</TableCell>
                <TableCell>{(i as any).becaNombre ?? '—'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => openEditModal(i)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => openConfirmDelete(i.id, `${i.nombre ?? ''} ${i.apellido ?? ''}`)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear/editar becario */}
      <ModalNuevoBecario
        open={openModal}
        onClose={() => { setOpenModal(false); setCurrentBecario(null); setCurrentBecarioId(null); }}
        onSave={handleSaveBecario}
        becario={currentBecario}
      />

      {/* Modales de administración */}
      <ModalBecasAdmin open={openBecasModal} onClose={() => setOpenBecasModal(false)} />
      <ModalAreasAdmin open={openAreasModal} onClose={() => setOpenAreasModal(false)} />

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete} aria-labelledby="confirm-delete-becario-title" aria-describedby="confirm-delete-becario-desc">
        <DialogTitle id="confirm-delete-becario-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-becario-desc">
            {pendingDelete ? <>¿Estás seguro que querés eliminar al becario <strong>{pendingDelete.label}</strong>? Esta acción no se puede deshacer.</> : <>¿Estás seguro que querés eliminar este becario? Esta acción no se puede deshacer.</>}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleting} startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionAdminBecarios;