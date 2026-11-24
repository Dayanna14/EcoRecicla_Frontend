// ⚠️ NO ENSEÑADO EN CLASE: utilidad compartida para saber si un centro está abierto ahora.
// El horario se guarda como "HH:mm-HH:mm" (así lo arma el formulario de centros).

/** true = abierto, false = cerrado, null = el horario no tiene el formato esperado */
export function estaAbierto(horario: string | null | undefined, ahora: Date = new Date()): boolean | null {
  const partes = /^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/.exec(horario ?? '');
  if (!partes) {
    return null;
  }
  const abre = Number(partes[1]) * 60 + Number(partes[2]);
  const cierra = Number(partes[3]) * 60 + Number(partes[4]);
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  return minutos >= abre && minutos < cierra;
}

/** Texto para mostrar junto al horario */
export function textoHorario(horario: string | null | undefined, activo: boolean = true): string {
  if (!activo) {
    return 'Inactivo';
  }
  const abierto = estaAbierto(horario);
  return abierto === null ? '' : abierto ? 'Abierto ahora' : 'Cerrado ahora';
}
