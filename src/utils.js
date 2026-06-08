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

export function normalizar(texto) {
  if (texto == null) return "";
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
