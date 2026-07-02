export function formatPrecio(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatDescuento(valor) {
  if (valor === null || valor === undefined || valor === "") return "—";
  const num = Number(valor);
  if (Number.isNaN(num)) return String(valor);
  return `${num.toFixed(1)}%`;
}

export function normalizar(texto) {
  if (texto == null) return "";
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
