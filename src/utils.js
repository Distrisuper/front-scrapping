export function formatPrecio(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function calcPorcentaje(precioDistri, precioProveedor) {
  if (!precioDistri || precioDistri === 0) return 0;
  return ((precioDistri - precioProveedor) / precioDistri) * 100;
}
