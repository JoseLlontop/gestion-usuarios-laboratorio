import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Becario } from '../../models/types';

// Props que recibe el modal
interface ModalNuevoBecarioProps {
  open: boolean;
  onClose: () => void;
  onSave: (becario: Becario) => Promise<void>;
  becario: Becario | null;
}

const ModalNuevoBecario: React.FC<ModalNuevoBecarioProps> = ({
  open,
  onClose,
  onSave,
  becario,
}) => {
  // Estado local para el formulario
  const [form, setForm] = useState<Becario>({
    id: 0,
    legajo: '',
    apellido: '',
    nombre: '',
    dni: '',
    nroMovil: '',
    usuarioTelegram: '',
    email: '',
    anioCurso: '1',
    areaInscripcion: '',
    beca: '',
  });

  // Opciones dinámicas
  const [areas, setAreas] = useState<string[]>([]);
  const [becas, setBecas] = useState<string[]>([]);

  // Cuando cambian las props de "becario", cargar en el form
  useEffect(() => {
    if (becario) {
      setForm({ ...becario });
    } else {
      setForm({
        id: 0,
        legajo: '',
        apellido: '',
        nombre: '',
        dni: '',
        nroMovil: '',
        usuarioTelegram: '',
        email: '',
        anioCurso: '1',
        areaInscripcion: '',
        beca: '',
      });
    }
  }, [becario]);

  // Cargar opciones desde JSON en public
  useEffect(() => {
    fetch('/areas.json')
      .then((res) => res.json())
      .then((data: string[]) => setAreas(data))
      .catch((err) => console.error('Error cargando áreas:', err));

    fetch('/becas.json')
      .then((res) => res.json())
      .then((data: string[]) => setBecas(data))
      .catch((err) => console.error('Error cargando becas:', err));
  }, []);

  // Handler para <TextField> y <TextArea>
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler para <Select>
  const handleSelectChange = (
    e: SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name!]: value }));
  };

  // Al hacer clic en Guardar
  const handleSubmit = async () => {
    try {
      await onSave(form);
      // onClose se dispara en el componente padre tras el guardado
    } catch (err) {
      console.error('Error guardando becario:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {becario ? 'Editar Becario' : 'Nuevo Becario'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Legajo"
              name="legajo"
              value={form.legajo}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Año"
              name="anioCurso"
              type="number"
              inputProps={{ min: 1, max: 5 }}
              value={form.anioCurso}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="DNI"
              name="dni"
              value={form.dni}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Móvil"
              name="nroMovil"
              value={form.nroMovil}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Telegram"
              name="usuarioTelegram"
              value={form.usuarioTelegram}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="E‑mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="area-label">Área de Inscripción</InputLabel>
              <Select
                labelId="area-label"
                name="areaInscripcion"
                value={form.areaInscripcion}
                onChange={handleSelectChange}
                label="Área de Inscripción"
              >
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="beca-label">Beca</InputLabel>
              <Select
                labelId="beca-label"
                name="beca"
                value={form.beca}
                onChange={handleSelectChange}
                label="Beca"
              >
                {becas.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalNuevoBecario;
