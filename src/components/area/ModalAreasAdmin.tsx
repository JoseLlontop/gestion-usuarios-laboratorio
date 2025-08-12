// src/components/area/ModalAreasAdmin.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  subscribeAreas,
  createArea,
  updateArea,
  deleteArea,
  Area,
} from "../../services/areas";
import { show_alerta } from "../../helpers/funcionSweetAlert";

interface Props {
  open: boolean;
  onClose: () => void;
}

const formatTimestamp = (ts: any) => {
  try {
    if (!ts) return "—";
    const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  } catch {
    return "—";
  }
};

const ModalAreasAdmin: React.FC<Props> = ({ open, onClose }) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // Form
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete flow with MUI Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nombre?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoadingAreas(true);
    const unsub = subscribeAreas((items) => {
      setAreas(items);
      setLoadingAreas(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setNombre("");
    setActivo(true);
    setEditingId(null);
  };

  const handleEditClick = (a: Area) => {
    setEditingId(a.id ?? null);
    setNombre(a.nombre);
    setActivo(a.activo ?? true);
  };

  const handleCancelEdit = () => resetForm();

  const handleSave = async () => {
    if (!nombre.trim()) {
      show_alerta("El nombre es obligatorio", "warning");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateArea(editingId, { nombre: nombre.trim(), activo });
        show_alerta("Área actualizada", "success");
      } else {
        await createArea({ nombre: nombre.trim(), activo });
        show_alerta("Área creada", "success");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      show_alerta("Error al guardar el área", "error");
    } finally {
      setSaving(false);
    }
  };

  // Abre el dialogo de confirmación
  const openConfirmDelete = (id?: string, nombre?: string) => {
    if (!id) return;
    setPendingDelete({ id, nombre });
    setConfirmOpen(true);
  };

  // Cancela el borrado
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  // Confirma y ejecuta el borrado (spinner en botón)
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteArea(pendingDelete.id);
      show_alerta("Área eliminada", "success");
      if (editingId === pendingDelete.id) resetForm();
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (err) {
      console.error(err);
      show_alerta("Error al eliminar el área", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Administración de Áreas</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Formulario simple para crear/editar */}
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {editingId ? "Editar área" : "Crear nueva área"}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <TextField
                  label="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  fullWidth
                  required
                  disabled={saving}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      disabled={saving}
                      inputProps={{ "aria-label": "Activo" }}
                    />
                  }
                  label={activo ? "Activo" : "Inactivo"}
                  sx={{ ml: 1 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : (editingId ? "Guardar" : "Agregar")}
                </Button>

                {editingId && (
                  <Button variant="outlined" onClick={handleCancelEdit} disabled={saving}>
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Lista de áreas */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Áreas registradas
              </Typography>

              {loadingAreas ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography> Cargando áreas…</Typography>
                </Box>
              ) : areas.length === 0 ? (
                <Typography color="text.secondary">No hay áreas registradas.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Activo</TableCell>
                      <TableCell>Creado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {areas.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.nombre}</TableCell>
                        <TableCell>{a.activo ? "Sí" : "No"}</TableCell>
                        <TableCell>{formatTimestamp(a.createdAt)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEditClick(a)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openConfirmDelete(a.id, a.nombre)}
                            disabled={deleting && pendingDelete?.id === a.id}
                          >
                            {deleting && pendingDelete?.id === a.id ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación profesional */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
      >
        <DialogTitle id="confirm-delete-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-description">
            {pendingDelete ? (
              <>¿Estás seguro que querés eliminar el área <strong>{pendingDelete.nombre}</strong>? Esta acción no se puede deshacer.</>
            ) : (
              <>¿Estás seguro que querés eliminar este área? Esta acción no se puede deshacer.</>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModalAreasAdmin;
