import { DateTime } from 'luxon';

// 🌍 Zona horaria fija para todo el sistema
const ZONA = 'America/Lima';

/**
 * Fecha y hora actual en Lima como Luxon DateTime
 * Útil para cálculos, filtros y manipulación de fechas internas.
 */
export const ahoraLima = (): DateTime =>
  DateTime.now().setZone(ZONA);

/**
 * Devuelve la fecha actual en Lima como string en formato dd/MM/yyyy
 * Ideal para respuestas API que muestran fechas legibles al usuario.
 */
export const fechaFormateadaLima = (): string =>
  ahoraLima().toFormat('dd/MM/yyyy');

/**
 * Convierte una fecha existente (Date o ISO) a zona Lima y formato dd/MM/yyyy
 * Útil cuando lees fechas desde la BD o recibís desde otro origen y querés mostrarlas correctamente.
 */
// export const formatearFechaALima = (fecha: Date | string): string =>
//   DateTime.fromJSDate(new Date(fecha)).setZone(ZONA).toFormat('dd/MM/yyyy');

// export const formatearFechaALima = (fecha: string | Date | null): string | null => {
//   if (!fecha) return null;
//   const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
//   if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;

//   return DateTime.fromJSDate(dateObj)
//     .setZone(ZONA)
//     .toFormat('dd/MM/yyyy');
// };


export const formatearFechaALima = (fecha: string | Date | null): string | null => {
  if (!fecha) return null;

  let dt: DateTime;

  if (typeof fecha === 'string') {
    const isoHasTime = fecha.includes('T');
    dt = isoHasTime
      ? DateTime.fromISO(fecha, { zone: 'utc' })     // string ISO con hora
      : DateTime.fromISO(fecha + 'T05:00:00.000Z');  // string ISO sin hora → asumimos 00:00 Lima
  } else {
    dt = DateTime.fromJSDate(fecha as Date, { zone: 'utc' });
  }

  return dt.setZone('America/Lima').toFormat('dd/MM/yyyy');
};









/**
 * Fecha actual como objeto JavaScript Date (en hora Lima)
 * Útil para guardar en PostgreSQL sin desfase.
 */
export const fechaDateLima = (): Date =>
  ahoraLima().toJSDate();

/**
 * Rango del día actual en Lima en ISO strings
 * Ideal para filtros de "cuotas del día", "eventos de hoy", etc.
 */
export const rangoDelDiaLima = (): { desde: string; hasta: string } => {
  const hoy = ahoraLima();
  return {
    desde: hoy.startOf('day').toISO() ?? '',
    hasta: hoy.endOf('day').toISO() ?? ''
  };
};

/**
 * Rango del mes actual en Lima en ISO strings
 * Útil para acumulados, resúmenes mensuales o filtros por cuota base del mes.
 */
export const rangoDelMesLima = (): { desde: string; hasta: string } => {
  const hoy = ahoraLima();
  return {
    desde: hoy.startOf('month').toISO() ?? '',
    hasta: hoy.endOf('month').toISO() ?? ''
  };
};

export const parseFechaISOALima = (fecha: string | Date): Date | null => {
  if (!fecha) return null;
  const fechaISO = typeof fecha === 'string' ? fecha : fecha.toISOString();
  const parsed = DateTime.fromISO(fechaISO, { zone: ZONA });
  return parsed.isValid ? parsed.startOf('day').toJSDate() : null;
};

// export const parseFechaCumpleDesdeFrontend = (fecha: string): Date => {
//   return DateTime.fromISO(fecha, { zone: 'America/Lima' })
//     .startOf('day')
//     .toUTC()
//     .toJSDate();
// };

export const parseFechaCumpleDesdeFrontend = (fecha: string): Date => {
  return DateTime.fromFormat(fecha, 'yyyy-MM-dd', { zone: 'America/Lima' })
    .startOf('day')
    .toUTC()
    .toJSDate();
};





