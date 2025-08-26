import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';

// Tipo del modelo (sin id)
import { Becario as AppBecario } from '../../models/types';
import { subscribeAreas } from '../../services/areas';
import { subscribeBecas } from '../../services/becas';

type ModalNuevoBecarioProps = {
  open: boolean;
  onClose: () => void;
  onSave: (becario: AppBecario) => Promise<void>;
  becario: AppBecario | null;
};

// EMPTY_FORM sin id
const EMPTY_FORM: AppBecario = {
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
};

const ModalNuevoBecario: React.FC<ModalNuevoBecarioProps> = ({ open, onClose, onSave, becario }) => {
  const [form, setForm] = useState<AppBecario>({ ...EMPTY_FORM });
  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>([]);
  const [becas, setBecas] = useState<{ id: string; nombre: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // errores: clave = nombre del campo, valor = mensaje de error ('' sin error)
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (becario) setForm({ ...EMPTY_FORM, ...becario });
    else setForm({ ...EMPTY_FORM });
    // reset de errores cada vez que abrimos/recibimos un becario distinto
    setErrors({});
  }, [becario, open]);

  useEffect(() => {
    const unsubA = subscribeAreas(items => setAreas(items.map(a => ({ id: a.id ?? '', nombre: a.nombre }))));
    const unsubB = subscribeBecas(items => setBecas(items.map(b => ({ id: b.id ?? '', nombre: b.nombre }))));
    return () => { unsubA(); unsubB(); };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value } as AppBecario));
    // validamos al tipear (feedback inmediato)
    validateField(name, value);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setForm(prev => ({ ...prev, [name]: value } as AppBecario));
    validateField(name, value);
  };

  // validaciones por campo
  const validateField = (name: string, value: any) => {
    let msg = '';

    const isEmpty = value === undefined || value === null || String(value).trim() === '';

    switch (name) {
      // campos texto obligatorios simples
      case 'legajo':
      case 'nombre':
      case 'apellido':
      case 'areaInscripcion':
      case 'beca':
        if (isEmpty) msg = 'Campo requerido';
        break;

      case 'anioCurso': {
        if (isEmpty) {
          msg = 'Campo requerido';
        } else {
          // aceptar sólo enteros entre 1 y 5 (ajustado)
          const n = Number(value);
          if (!Number.isInteger(n) || n < 1 || n > 5) msg = 'Ingrese un año válido (1-5)';
        }
        break;
      }

      case 'dni':
        if (isEmpty) {
          msg = 'Campo requerido';
        } else if (!/^\d+$/.test(String(value))) {
          msg = 'Solo números';
        } else if (String(value).length < 7) {
          msg = 'DNI incompleto';
        }
        break;

      case 'nroMovil':
        // ahora obligatorio y validado: solo números y longitud razonable (8-15)
        if (isEmpty) {
          msg = 'Campo requerido';
        } else if (!/^\d{8,15}$/.test(String(value))) {
          msg = 'Número inválido (solo dígitos, 8-15 caracteres)';
        }
        break;

      case 'usuarioTelegram':
        // obligatorio, acepta con o sin @, longitud 5-32, letras/números/underscore
        if (isEmpty) {
          msg = 'Campo requerido';
        } else {
          const val = String(value).trim();
          const re = /^@?[a-zA-Z0-9_]{5,32}$/;
          if (!re.test(val)) msg = 'Usuario Telegram inválido (5-32 chars, letras/números/_)';
        }
        break;

      case 'email':
        // ahora obligatorio y validación básica de email
        if (isEmpty) {
          msg = 'Campo requerido';
        } else {
          // validación simple de email
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(String(value))) msg = 'Email inválido';
        }
        break;

      default:
        msg = '';
    }

    setErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const validateForm = (): boolean => {
    // ahora todos estos campos son obligatorios
    const requiredFields = [
      'legajo', 'nombre', 'apellido', 'dni', 'anioCurso',
      'nroMovil', 'usuarioTelegram', 'email', 'areaInscripcion', 'beca'
    ];
    let valid = true;

    // validar campos obligatorios y algunos opcionales con reglas
    requiredFields.forEach(f => {
      const ok = validateField(f, (form as any)[f]);
      if (!ok) valid = false;
    });

    return valid;
  };

  const handleSubmit = async () => {
    setSaving(true);
    const ok = validateForm();
    if (!ok) {
      // si no es válido, no enviamos y mostramos errores
      setSaving(false);
      return;
    }

    try {
      await onSave(form); // el padre decide create/update y maneja el doc.id
    } catch (err) {
      console.error('Error guardando becario:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nuevo / Editar Becario</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Legajo"
              name="legajo"
              value={form.legajo}
              onChange={handleInputChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              fullWidth
              required
              error={!!errors.legajo}
              helperText={errors.legajo}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Año"
              name="anioCurso"
              type="number"
              inputProps={{ min: 1, max: 5, step: 1 }}
              value={String(form.anioCurso ?? '')}
              onChange={handleInputChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              fullWidth
              required
              error={!!errors.anioCurso}
              helperText={errors.anioCurso}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleInputChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              fullWidth
              required
              error={!!errors.nombre}
              helperText={errors.nombre}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleInputChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              fullWidth
              required
              error={!!errors.apellido}
              helperText={errors.apellido}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="DNI"
              name="dni"
              value={form.dni}
              onChange={handleInputChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              fullWidth
              required
              error={!!errors.dni}
              helperText={errors.dni}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Móvil"
              name="nroMovil"
              value={form.nroMovil}
              onChange={handleInputChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              fullWidth
              required
              error={!!errors.nroMovil}
              helperText={errors.nroMovil}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Telegram"
              name="usuarioTelegram"
              value={form.usuarioTelegram}
              onChange={handleInputChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              fullWidth
              required
              error={!!errors.usuarioTelegram}
              helperText={errors.usuarioTelegram || 'Puede incluir @ o no (5-32 caracteres)'}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.areaInscripcion}>
              <InputLabel id="area-label">Área de Inscripción</InputLabel>
              <Select
                labelId="area-label"
                name="areaInscripcion"
                value={form.areaInscripcion}
                onChange={handleSelectChange}
                onBlur={() => validateField('areaInscripcion', form.areaInscripcion)}
                label="Área de Inscripción"
                displayEmpty
                required
              >
                <MenuItem value=""></MenuItem>
                {areas.map(area => <MenuItem key={area.id} value={area.nombre}>{area.nombre}</MenuItem>)}
              </Select>
              {errors.areaInscripcion ? <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: 6 }}>{errors.areaInscripcion}</div> : null}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.beca}>
              <InputLabel id="beca-label">Beca</InputLabel>
              <Select
                labelId="beca-label"
                name="beca"
                value={form.beca}
                onChange={handleSelectChange}
                onBlur={() => validateField('beca', form.beca)}
                label="Beca"
                displayEmpty
                required
              >
                <MenuItem value=""></MenuItem>
                {becas.map(b => <MenuItem key={b.id} value={b.nombre}>{b.nombre}</MenuItem>)}
              </Select>
              {errors.beca ? <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: 6 }}>{errors.beca}</div> : null}
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalNuevoBecario;
