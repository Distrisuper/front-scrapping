import { normalizar } from "./text.js";
import { calcVariacion } from "./format.js";

/** Busca el precio de un competidor dentro de un producto.
 *  Casa por nombre normalizado porque los datos traen el competidor como
 *  string ("distriSuper") y con distinto case que /api/competitors. Las
 *  entradas cuyo competidor no matchea ninguno conocido (basura del
 *  scrapping) quedan fuera. Ignora precios en 0 / inexistentes. */
export function getPrecioEntry(producto, competidorKey) {
  return (
    (producto.precios || []).find(
      (p) =>
        normalizar(p.competidorId ?? p.competidor) === competidorKey &&
        p.precio > 0
    ) ?? null
  );
}

/** Variación promedio (simple) de un competidor vs. el nuestro, sobre los
 *  productos donde ambos tienen precio. Devuelve null si no hay referencia. */
export function avgVariacion(productos, propioKey, competidorKey) {
  const vals = [];
  for (const producto of productos) {
    const propio = getPrecioEntry(producto, propioKey)?.precio ?? 0;
    const comp = getPrecioEntry(producto, competidorKey)?.precio ?? 0;
    if (propio && comp) vals.push(calcVariacion(propio, comp));
  }
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
}
