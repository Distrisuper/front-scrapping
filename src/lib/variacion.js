// Umbrales: cuánto % está el precio main POR ENCIMA del competidor.
// Negativo o <= 0 → competidor es más caro → siempre verde.
export const THRESHOLDS = {
  green: 5,   // <= 5 % → verde
  yellow: 12, // 6–12 % → amarillo
  orange: 19, // 13–19 % → naranja
              // > 19 %  → rojo
};

// Base = competidor: (main - comp) / comp * 100
// Positivo → main está X% por encima del competidor (nos cuesta caro)
// Negativo → competidor está por encima (somos más baratos)
export function calcVariacion(mainPrice, compPrice) {
  if (!mainPrice || !compPrice) return null;
  return ((mainPrice - compPrice) / compPrice) * 100;
}

export function getVariacionTier(pct) {
  if (pct === null || pct === undefined) return null;
  if (pct <= THRESHOLDS.green)  return "green";
  if (pct <= THRESHOLDS.yellow) return "yellow";
  if (pct <= THRESHOLDS.orange) return "orange";
  return "red";
}

export const TIER_STYLES = {
  green:  "bg-emerald-100 text-emerald-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  red:    "bg-rose-100 text-rose-700",
};
