import React, { useEffect, useMemo, useState } from "react";
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
  TableContainer,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  useMediaQuery,
  useTheme,
  Divider,
  Paper,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // Form
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // List filter
  const [q, setQ] = useState("");

  // Delete flow
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nombre?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingAreas(true);
    const unsub = subscribeAreas((items) => {
      setAreas(items);
      setLoadingAreas(false);
    });
    return () => unsub();
  }, [open]);

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

  // Confirm delete
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

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return areas;
    return areas.filter((a) => (a.nombre ?? "").toLowerCase().includes(s));
  }, [areas, q]);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          resetForm();
          setQ("");
        }}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            overflow: "hidden",
            borderRadius: { xs: 0, sm: 2 },
          },
        }}
      >
        {/* TITLE sticky */}
        <DialogTitle
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            py: { xs: 1.5, sm: 2 },
            pr: { xs: 2, sm: 3 },
          }}
        >
          Administración de Áreas
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
          }}
        >
          <Stack spacing={3}>
            {/* FORM */}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle1">
                  {editingId ? "Editar área" : "Crear nueva área"}
                </Typography>

                <Stack
                  spacing={2}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
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
                    sx={{ ml: { sm: 1 } }}
                  />

                  <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<AddIcon />}
                      disabled={saving}
                      fullWidth
                    >
                      {saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : editingId ? (
                        "Guardar"
                      ) : (
                        "Agregar"
                      )}
                    </Button>

                    {editingId && (
                      <Button variant="outlined" onClick={handleCancelEdit} disabled={saving} fullWidth>
                        Cancelar
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* SEARCH + TABLE */}
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                gap={1}
              >
                <Typography variant="subtitle1">Áreas registradas</Typography>

                <TextField
                  placeholder="Buscar área…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {loadingAreas ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography> Cargando áreas…</Typography>
                </Box>
              ) : filtered.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                  No hay áreas para mostrar.
                </Paper>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: { xs: 360, sm: 480 },
                    "& .MuiTableCell-root": { whiteSpace: "nowrap" },
                  }}
                >
                  <Table stickyHeader size="small" aria-label="tabla de áreas">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell align="center">Activo</TableCell>
                        <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                          Creado
                        </TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((a) => {
                        const isRowDeleting = deleting && pendingDelete?.id === a.id;
                        return (
                          <TableRow key={a.id} hover>
                            <TableCell>{a.nombre}</TableCell>
                            <TableCell align="center">{a.activo ? "Sí" : "No"}</TableCell>
                            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                              {formatTimestamp(a.createdAt)}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => handleEditClick(a)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openConfirmDelete(a.id, a.nombre)}
                                disabled={isRowDeleting}
                              >
                                {isRowDeleting ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <DeleteIcon fontSize="small" />
                                )}
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </Stack>
        </DialogContent>

        {/* ACTIONS sticky */}
        <DialogActions
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 2,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            py: { xs: 1, sm: 1.5 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="confirm-delete-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-description">
            {pendingDelete ? (
              <>
                ¿Estás seguro que querés eliminar el área <strong>{pendingDelete.nombre}</strong>?
                Esta acción no se puede deshacer.
              </>
            ) : (
              <>¿Estás seguro que querés eliminar este área? Esta acción no se puede deshacer.</>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Cancelar
          </Button>
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
