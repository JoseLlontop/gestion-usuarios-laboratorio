import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  Alert, Typography
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
  usuarioTelegram: '', // ahora opcional en validación (puede ir vacío)
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
  const [confirmOpen, setConfirmOpen] = useState(false); // <-- diálogo de confirmación

  // errores: clave = nombre del campo, valor = mensaje de error ('')
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
    let val = value;

    // Campos numéricos: limpiamos cualquier carácter no-dígito y acotamos longitud
    const numericFields = ['legajo', 'dni', 'nroMovil'];
    if (numericFields.includes(name)) {
      val = String(val).replace(/\D/g, '');
      if (name === 'legajo') val = val.slice(0, 7);
      if (name === 'dni') val = val.slice(0, 8);
      if (name === 'nroMovil') val = val.slice(0, 10);
    }

    // Limitar longitud de nombre/apellido
    if (name === 'nombre' || name === 'apellido') {
      val = String(val).slice(0, 20);
    }

    setForm(prev => ({ ...prev, [name]: val } as AppBecario));
    // validamos al tipear (feedback inmediato)
    validateField(name, val);
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
        if (isEmpty) msg = 'Campo requerido';
        else if (!/^\d{1,7}$/.test(String(value))) msg = 'Legajo inválido (solo números, hasta 7 dígitos)';
        break;

      case 'nombre':
      case 'apellido': {
        if (isEmpty) msg = 'Campo requerido';
        else {
          const val = String(value).trim();
          // permitir letras (con tildes), espacios, guiones y apóstrofe, entre 2 y 50 caracteres
          const re = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,20}$/;
          if (!re.test(val)) msg = 'Nombre/Apellido inválido (2-20 caracteres, solo letras y espacios)';
        }
        break;
      }

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
        } else if (!/^\d{8}$/.test(String(value))) {
          msg = 'DNI inválido (debe tener exactamente 8 dígitos)';
        }
        break;

      case 'nroMovil':
        // obligatorio y validado: exactamente 10 dígitos
        if (isEmpty) {
          msg = 'Campo requerido';
        } else if (!/^\d{10}$/.test(String(value))) {
          msg = 'Número inválido (debe tener exactamente 10 dígitos)';
        }
        break;

      case 'usuarioTelegram':
        // OPCIONAL: si está vacío no marca error; si está cargado, valida el patrón
        if (!isEmpty) {
          const val = String(value).trim();
          const re = /^@?[a-zA-Z0-9_]{5,32}$/;
          if (!re.test(val)) msg = 'Usuario Telegram inválido (5-32 chars, letras/números/_)';
        }
        break;

      case 'email':
        // obligatorio y validación básica de email
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
    // campos obligatorios (telegram removido)
    const requiredFields = [
      'legajo', 'nombre', 'apellido', 'dni', 'anioCurso',
      'nroMovil', 'email', 'areaInscripcion', 'beca'
    ];
    let valid = true;

    requiredFields.forEach(f => {
      const ok = validateField(f, (form as any)[f]);
      if (!ok) valid = false;
    });

    // validar opcionales solo si están cargados (ej: usuarioTelegram)
    if (form.usuarioTelegram) {
      const ok = validateField('usuarioTelegram', form.usuarioTelegram);
      if (!ok) valid = false;
    }

    return valid;
  };

  // Al clickear "Guardar", primero validamos y si está ok, abrimos confirmación
  const handlePreSubmit = () => {
    const ok = validateForm();
    if (ok) {
      setConfirmOpen(true);
    }
  };

  // Enviar definitivamente tras confirmar
  const handleConfirmSubmit = async () => {
    setSaving(true);
    try {
      await onSave(form); // el padre decide create/update y maneja el doc.id
      setConfirmOpen(false);
    } catch (err) {
      console.error('Error guardando becario:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
                helperText={errors.legajo || 'Hasta 7 dígitos (solo números)'}
                inputProps={{ inputMode: 'numeric', pattern: '\\d*', maxLength: 7 }}
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
                helperText={errors.nombre || '2-20 caracteres (letras, espacios)'}
                inputProps={{ maxLength: 20 }}
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
                helperText={errors.apellido || '2-20 caracteres (letras, espacios)'}
                inputProps={{ maxLength: 20 }}
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
                helperText={errors.dni || '8 dígitos (sin puntos)'}
                inputProps={{ inputMode: 'numeric', pattern: '\\d*', maxLength: 8 }}
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
                helperText={errors.nroMovil || '10 dígitos (ej: 11xxxxxxxx)'}
                inputProps={{ inputMode: 'numeric', pattern: '\\d*', maxLength: 10 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Telegram (opcional)"
                name="usuarioTelegram"
                value={form.usuarioTelegram}
                onChange={handleInputChange}
                onBlur={(e) => validateField(e.target.name, e.target.value)}
                fullWidth
                // REMOVIDO required para que sea opcional
                error={!!errors.usuarioTelegram}
                helperText={errors.usuarioTelegram || 'Opcional. Puede incluir @ (5-32 caracteres)'}
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
            onClick={handlePreSubmit}
            disabled={saving}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación */}
      <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar envío</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ¿Estás seguro de enviar los datos?
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Por favor, verificá cuidadosamente la información ingresada. Una vez enviada, <strong>no se podrá modificar</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={saving}>Volver</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSubmit}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Confirmar y guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModalNuevoBecario;
