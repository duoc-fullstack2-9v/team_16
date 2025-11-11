/**
 * Formatea una fecha a formato legible en español
 * @param {string|Date} fecha - Fecha a formatear
 * @param {boolean} incluirHora - Si se debe incluir la hora
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha, incluirHora = false) => {
  if (!fecha) return '-';
  
  const date = new Date(fecha);
  
  if (isNaN(date.getTime())) return '-';
  
  const opciones = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  if (incluirHora) {
    opciones.hour = '2-digit';
    opciones.minute = '2-digit';
  }
  
  return date.toLocaleDateString('es-CL', opciones);
};

/**
 * Formatea una hora en formato HH:mm
 * @param {string} hora - Hora en formato string
 * @returns {string} Hora formateada
 */
export const formatearHora = (hora) => {
  if (!hora) return '-';
  return hora;
};

/**
 * Formatea un número a moneda chilena
 * @param {number} valor - Valor a formatear
 * @returns {string} Valor formateado
 */
export const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined) return '-';
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(valor);
};

/**
 * Formatea un RUT chileno
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 */
export const formatearRut = (rut) => {
  if (!rut) return '-';
  
  // Eliminar puntos y guión
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  
  if (rutLimpio.length < 2) return rut;
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Formatear cuerpo con puntos
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${cuerpoFormateado}-${dv}`;
};

/**
 * Calcula la diferencia de días entre dos fechas
 * @param {string|Date} fechaInicio - Fecha de inicio
 * @param {string|Date} fechaFin - Fecha de fin
 * @returns {number} Número de días
 */
export const calcularDiferenciaDias = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0;
  
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  const diferencia = fin.getTime() - inicio.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
};
