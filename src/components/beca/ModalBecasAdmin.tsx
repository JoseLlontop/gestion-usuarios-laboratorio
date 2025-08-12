// src/components/beca/ModalBecasAdmin.tsx
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
  subscribeBecas,
  createBeca,
  updateBeca,
  deleteBeca,
  Beca,
} from "../../services/becas";
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

const ModalBecasAdmin: React.FC<Props> = ({ open, onClose }) => {
  const [becas, setBecas] = useState<Beca[]>([]);
  const [loadingBecas, setLoadingBecas] = useState(true);

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
    setLoadingBecas(true);
    const unsub = subscribeBecas((items) => {
      setBecas(items);
      setLoadingBecas(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setNombre("");
    setActivo(true);
    setEditingId(null);
  };

  const handleEditClick = (b: Beca) => {
    setEditingId(b.id ?? null);
    setNombre(b.nombre);
    setActivo(b.activo ?? true);
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
        await updateBeca(editingId, { nombre: nombre.trim(), activo });
        show_alerta("Beca actualizada", "success");
      } else {
        await createBeca({ nombre: nombre.trim(), activo });
        show_alerta("Beca creada", "success");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      show_alerta("Error al guardar la beca", "error");
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

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteBeca(pendingDelete.id);
      show_alerta("Beca eliminada", "success");
      if (editingId === pendingDelete.id) resetForm();
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (err) {
      console.error(err);
      show_alerta("Error al eliminar la beca", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Administración de Becas</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Formulario */}
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {editingId ? "Editar beca" : "Crear nueva beca"}
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

            {/* Lista */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Becas registradas
              </Typography>

              {loadingBecas ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography> Cargando becas…</Typography>
                </Box>
              ) : becas.length === 0 ? (
                <Typography color="text.secondary">No hay becas registradas.</Typography>
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
                    {becas.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.nombre}</TableCell>
                        <TableCell>{b.activo ? "Sí" : "No"}</TableCell>
                        <TableCell>{formatTimestamp(b.createdAt)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEditClick(b)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openConfirmDelete(b.id, b.nombre)}
                            disabled={deleting && pendingDelete?.id === b.id}
                          >
                            {deleting && pendingDelete?.id === b.id ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
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

      {/* Confirm dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-title-beca"
        aria-describedby="confirm-delete-description-beca"
      >
        <DialogTitle id="confirm-delete-title-beca">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-description-beca">
            {pendingDelete ? (
              <>¿Estás seguro que querés eliminar la beca <strong>{pendingDelete.nombre}</strong>? Esta acción no se puede deshacer.</>
            ) : (
              <>¿Estás seguro que querés eliminar esta beca? Esta acción no se puede deshacer.</>
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

export default ModalBecasAdmin;
