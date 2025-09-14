import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import FilterListIcon from "@mui/icons-material/FilterList";

import ModalNuevoBecario from "../../components/becario/ModalNuevoBecario";
import ModalAreasAdmin from "../../components/area/ModalAreasAdmin";
import ModalBecasAdmin from "../../components/beca/ModalBecasAdmin";

import { show_alerta } from "../../helpers/funcionSweetAlert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Services (tipos del service)
import {
  subscribeBecarios,
  createBecario as svcCreateBecario,
  updateBecario as svcUpdateBecario,
  deleteBecario as svcDeleteBecario,
  Becario as SvcBecarioType,
} from "../../services/becarios";

// Tipo de la UI (models/types) — sin id
import { Becario as AppBecario } from "../../models/types";
import { subscribeAreas, Area } from "../../services/areas";
import { subscribeBecas, Beca as BecaType } from "../../services/becas";

const GestionAdminBecarios: React.FC = () => {
  // Lista cruda del service (incluye id) — la usamos para tabla y acciones
  const [svcItems, setSvcItems] = useState<SvcBecarioType[]>([]);

  // Filtros y UI
  const [filtroNombreRaw, setFiltroNombreRaw] = useState("");
  const [filtroNombre, setFiltroNombre] = useState(""); // con debounce
  const [filtroArea, setFiltroArea] = useState("");

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

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"));
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));

  // -------------------------
  // Suscripción realtime: mantenemos la lista cruda del service (con id)
  // -------------------------
  useEffect(() => {
    const unsub = subscribeBecarios((items: SvcBecarioType[]) => {
      setSvcItems(items);
    });
    return () => unsub();
  }, []);

  // -------------------------
  // Suscripción a áreas y becas para selects
  // -------------------------
  useEffect(() => {
    const unsubA = subscribeAreas((items) => setAreas(items));
    const unsubB = subscribeBecas((items) => setBecasList(items));
    return () => {
      unsubA();
      unsubB();
    };
  }, []);

  // -------------------------
  // Debounce para el filtro por nombre (mejor UX en mobile)
  // -------------------------
  useEffect(() => {
    const t = setTimeout(() => setFiltroNombre(filtroNombreRaw), 300);
    return () => clearTimeout(t);
  }, [filtroNombreRaw]);

  // -------------------------
  // Filtrado (memoizado)
  // -------------------------
  const svcItemsFiltrados = useMemo(() => {
    const nameQ = (filtroNombre ?? "").toLowerCase();
    const areaQ = (filtroArea ?? "").toLowerCase();

    return svcItems.filter((i) => {
      const name = `${i.nombre ?? ""} ${i.apellido ?? ""}`.toLowerCase();
      const matchName = name.includes(nameQ);
      const areaNombreBecario = ((i as any).areaNombre ?? "").toString().toLowerCase();
      const matchArea = areaQ ? areaNombreBecario.includes(areaQ) : true;
      return matchName && matchArea;
    });
  }, [svcItems, filtroNombre, filtroArea]);

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
      legajo: svcItem.legajo ?? "",
      apellido: svcItem.apellido ?? "",
      nombre: svcItem.nombre ?? "",
      dni: svcItem.dni ?? "",
      nroMovil: svcItem.nroMovil ?? "",
      usuarioTelegram: svcItem.usuarioTelegram ?? "",
      email: svcItem.email ?? "",
      anioCurso: String(svcItem.anioCurso ?? ""), // aseguramos string
      areaInscripcion: (svcItem as any).areaNombre ?? (svcItem as any).areaInscripcion ?? "",
      beca: (svcItem as any).becaNombre ?? (svcItem as any).beca ?? "",
    };

    setCurrentBecario(app);
    setOpenModal(true);
  };

  // -------------------------
  // Mapper: AppBecario -> SvcBecarioType (antes de persistir)
  // -------------------------
  const mapAppToSvc = (app: AppBecario): SvcBecarioType => {
    const areaObj = areas.find((a) => a.nombre === (app.areaInscripcion ?? ""));
    const becaObj = becasList.find((b) => b.nombre === (app.beca ?? ""));

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

    // El service acepta Partial/SvcBecarioType; casteamos para la llamada
    return svc as SvcBecarioType;
  };

  // -------------------------
  // Guardar (create / update) — recibe AppBecario desde el modal
  // -------------------------
  const handleSaveBecario = async (appBecario: AppBecario) => {
    try {
      const svcObj = mapAppToSvc(appBecario);
      if (currentBecarioId) {
        await svcUpdateBecario(currentBecarioId, svcObj);
        show_alerta("Becario actualizado", "success");
      } else {
        await svcCreateBecario(svcObj);
        show_alerta("Becario registrado", "success");
      }
    } catch (e) {
      console.error("ERROR in handleSaveBecario:", e);
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
      show_alerta("Becario eliminado", "success");
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (err) {
      console.error("Error eliminando becario:", err);
      show_alerta("Error al eliminar becario", "error");
    } finally {
      setDeleting(false);
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <Box sx={{ mt: { xs: 8, md: 5 }, pb: 0 }}>
      {/* Header */}
      <Box
        sx={{
          mx: { xs: 2, md: 4 },
          mb: 3,
          p: { xs: 2, md: 2.5 },
          borderRadius: 2,
          bgcolor: "#233044",
          color: "white",
          boxShadow: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
        >
          <Typography
            variant={mdUp ? "h4" : "h5"}
            sx={{ fontWeight: "bold", lineHeight: 1.15 }}
          >
            Gestión de Becarios
          </Typography>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={async () => {
              navigate("/login-profesor", { replace: true });
              await logout();
            }}
            size={smUp ? "medium" : "small"}
          >
            Cerrar sesión
          </Button>
        </Stack>
      </Box>

      {/* Filtros y acciones */}
      <Box sx={{ mx: { xs: 2, md: 4 }, mb: 2 }}>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ mb: 1, color: "text.secondary" }}
          >
            <FilterListIcon fontSize="small" />
            <Typography variant="subtitle2">Filtros</Typography>
          </Stack>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Buscar por nombre y apellido"
                value={filtroNombreRaw}
                onChange={(e) => setFiltroNombreRaw(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="label-area">Filtrar área</InputLabel>
                <Select
                  labelId="label-area"
                  value={filtroArea}
                  label="Filtrar área"
                  onChange={(e) => setFiltroArea(e.target.value as string)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {areas.map((a) => (
                    <MenuItem key={a.id} value={a.nombre}>
                      {a.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md="auto">
              <Button
                fullWidth={!mdUp}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openNewModal}
              >
                Nuevo Becario
              </Button>
            </Grid>

            <Grid item xs={12} md>
              <Stack
                direction="row"
                justifyContent={{ xs: "stretch", md: "flex-end" }}
                gap={1}
              >
                <Button
                  fullWidth={!mdUp}
                  variant="outlined"
                  color="primary"
                  onClick={() => setOpenAreasModal(true)}
                >
                  Administrar áreas
                </Button>
                <Button
                  fullWidth={!mdUp}
                  variant="outlined"
                  color="secondary"
                  onClick={() => setOpenBecasModal(true)}
                >
                  Administrar becas
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Tabla (usamos svcItems para tener accesso al doc.id en acciones) */}
      <Box sx={{ mx: { xs: 2, md: 4 } }}>
        <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: "auto" }}>
          <Table
            stickyHeader
            size={smUp ? "medium" : "small"}
            sx={{ minWidth: 900 /* asegura scroll si es necesario */ }}
          >
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Legajo
                </TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  DNI
                </TableCell>
                <TableCell>Móvil</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  Telegram
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  E-mail
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Año
                </TableCell>
                <TableCell>Área</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Beca
                </TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {svcItemsFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} sx={{ py: 6 }}>
                    <Stack alignItems="center" spacing={1}>
                      <Typography variant="subtitle1" color="text.secondary">
                        No hay resultados para los filtros seleccionados.
                      </Typography>
                      <Divider flexItem sx={{ my: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        Probá limpiar los filtros o crear un nuevo becario.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                svcItemsFiltrados.map((i, idx) => (
                  <TableRow key={i.id ?? idx} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {i.legajo ?? "—"}
                    </TableCell>
                    <TableCell>{i.apellido ?? "—"}</TableCell>
                    <TableCell>{i.nombre ?? "—"}</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      {i.dni ?? "—"}
                    </TableCell>
                    <TableCell>{i.nroMovil ?? "—"}</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      {i.usuarioTelegram ?? "—"}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {i.email ?? "—"}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {String(i.anioCurso ?? "—")}
                    </TableCell>
                    <TableCell>{(i as any).areaNombre ?? "—"}</TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {(i as any).becaNombre ?? "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <IconButton onClick={() => openEditModal(i)} size={smUp ? "medium" : "small"}>
                        <EditIcon fontSize={smUp ? "medium" : "small"} />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          openConfirmDelete(i.id, `${i.nombre ?? ""} ${i.apellido ?? ""}`)
                        }
                        size={smUp ? "medium" : "small"}
                      >
                        <DeleteIcon fontSize={smUp ? "medium" : "small"} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modal para crear/editar becario */}
      <ModalNuevoBecario
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setCurrentBecario(null);
          setCurrentBecarioId(null);
        }}
        onSave={handleSaveBecario}
        becario={currentBecario}
      />

      {/* Modales de administración */}
      <ModalBecasAdmin open={openBecasModal} onClose={() => setOpenBecasModal(false)} />
      <ModalAreasAdmin open={openAreasModal} onClose={() => setOpenAreasModal(false)} />

      {/* Confirm delete dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-becario-title"
        aria-describedby="confirm-delete-becario-desc"
      >
        <DialogTitle id="confirm-delete-becario-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-becario-desc">
            {pendingDelete ? (
              <>
                ¿Estás seguro que querés eliminar al becario{" "}
                <strong>{pendingDelete.label}</strong>? Esta acción no se puede deshacer.
              </>
            ) : (
              <>¿Estás seguro que querés eliminar este becario? Esta acción no se puede deshacer.</>
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
    </Box>
  );
};

export default GestionAdminBecarios;
