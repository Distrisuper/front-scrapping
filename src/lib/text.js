/** Normaliza texto para comparaciones robustas: saca acentos, pasa a
 *  minúsculas y recorta espacios. Lo usamos como clave de matcheo de
 *  competidores (los datos vienen con distinto case que /api/competitors). */
export function normalizar(texto) {
  if (texto == null) return "";
  return String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
