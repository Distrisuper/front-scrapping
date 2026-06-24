const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formatea un número como precio en pesos argentinos. */
export function formatPrecio(valor) {
  return currency.format(valor);
}

/** Variación porcentual del precio del competidor respecto al nuestro.
 *  Positivo = nosotros más caros; negativo = nosotros más baratos. */
export function calcVariacion(precioPropio, precioCompetidor) {
  if (!precioPropio) return 0;
  return ((precioPropio - precioCompetidor) / precioPropio) * 100;
}
