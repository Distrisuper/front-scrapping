import { useState, useMemo, Fragment } from "react";
import { formatPrecio } from "../utils.js";
import { calcVariacion, getVariacionTier, TIER_STYLES } from "../lib/variacion.js";

const DESC_LIMIT = 80;

function getPrecioEntry(producto, competidorKey) {
  return (
    (producto.precios || []).find(
      (p) => String(p.competidorId) === String(competidorKey) && p.precio > 0
    ) ?? null
  );
}

function avgVariacion(productos, mainId, competidorId) {
  const vals = productos
    .map((p) => {
      const mainPrice = getPrecioEntry(p, mainId)?.precio ?? 0;
      const compPrice = getPrecioEntry(p, competidorId)?.precio ?? 0;
      return calcVariacion(mainPrice, compPrice);
    })
    .filter((v) => v !== null);
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
}

function VariacionBadge({ pct }) {
  if (pct === null) return <span className="text-gray-300 text-sm">—</span>;
  const tier = getVariacionTier(pct);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${TIER_STYLES[tier]}`}
    >
      {pct > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default function ComparisonTable({
  data,
  competidores,
  pagination,
  page,
  onPageChange,
  loading,
}) {
  const [expandedMarcas, setExpandedMarcas] = useState(new Set());
  const [expandedLineas, setExpandedLineas] = useState(new Set());
  const [expandedDescs, setExpandedDescs] = useState(new Set());

  const mainComp = useMemo(() => competidores.find((c) => c.main) ?? null, [competidores]);
  const otherComps = useMemo(() => competidores.filter((c) => !c.main), [competidores]);

  const toggleMarca = (key) =>
    setExpandedMarcas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleLinea = (key) =>
    setExpandedLineas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleDesc = (key) =>
    setExpandedDescs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const { pages } = pagination ?? {};

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-gray-400 text-sm">
        Cargando...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No hay productos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="text-left py-3 px-3 font-semibold">Descripción</th>
              {mainComp && (
                <th className="w-32 text-center py-3 px-4 font-semibold">
                  {mainComp.nombre}
                </th>
              )}
              {otherComps.map((c) => (
                <th key={c.id} className="w-36 text-center py-3 px-4 font-semibold">
                  {c.nombre}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {data.map((marcaData) => {
              const marcaKey = marcaData.marca;
              const isMarcaExpanded = expandedMarcas.has(marcaKey);
              const todosProductos = marcaData.lineas.flatMap((l) => l.productos);

              return (
                <Fragment key={marcaKey}>
                  {/* ── FILA MARCA ── */}
                  <tr
                    className={`border-t border-gray-200 cursor-pointer select-none transition-colors ${
                      isMarcaExpanded ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleMarca(marcaKey)}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-gray-400 text-xs transition-transform duration-200 shrink-0 ${
                            isMarcaExpanded ? "rotate-90" : ""
                          }`}
                        >
                          ▶
                        </span>
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="font-bold text-gray-900 text-sm uppercase tracking-wide truncate">
                            {marcaData.marca}
                          </span>
                          <span className="text-xs text-gray-400">
                            {marcaData.lineas.length} líneas · {todosProductos.length} productos
                          </span>
                        </div>
                      </div>
                    </td>
                    {mainComp && <td className="py-3 px-4" />}
                    {otherComps.map((c) => (
                      <td key={c.id} className="py-3 px-4 text-right">
                        <VariacionBadge
                          pct={mainComp ? avgVariacion(todosProductos, mainComp.id, c.id) : null}
                        />
                      </td>
                    ))}
                    <td />
                  </tr>

                  {/* ── FILAS LÍNEA ── */}
                  {isMarcaExpanded &&
                    marcaData.lineas.map((lineaData) => {
                      const lineaKey = `${marcaKey}||${lineaData.linea}`;
                      const isLineaExpanded = expandedLineas.has(lineaKey);

                      return (
                        <Fragment key={lineaKey}>
                          <tr
                            className={`border-t border-gray-100 cursor-pointer select-none transition-colors ${
                              isLineaExpanded ? "bg-blue-50/40" : "hover:bg-gray-50/80"
                            }`}
                            onClick={() => toggleLinea(lineaKey)}
                          >
                            <td className="py-2.5 px-3 pl-8">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-gray-300 text-xs transition-transform duration-200 shrink-0 ${
                                    isLineaExpanded ? "rotate-90" : ""
                                  }`}
                                >
                                  ▶
                                </span>
                                <div className="flex flex-col leading-tight min-w-0">
                                  <span className="font-semibold text-gray-700 text-sm truncate">
                                    {lineaData.linea || (
                                      <span className="italic text-gray-400 font-normal">
                                        Sin línea
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {lineaData.productos.length} productos
                                  </span>
                                </div>
                              </div>
                            </td>
                            {mainComp && <td className="py-2.5 px-4" />}
                            {otherComps.map((c) => (
                              <td key={c.id} className="py-2.5 px-4 text-right">
                                <VariacionBadge
                                  pct={
                                    mainComp
                                      ? avgVariacion(lineaData.productos, mainComp.id, c.id)
                                      : null
                                  }
                                />
                              </td>
                            ))}
                            <td />
                          </tr>

                          {/* ── FILAS PRODUCTO ── */}
                          {isLineaExpanded &&
                            lineaData.productos.map((p, idx) => {
                              const mainEntry = mainComp
                                ? getPrecioEntry(p, mainComp.id)
                                : null;
                              const mainPrice = mainEntry?.precio ?? 0;

                              const descKey = p.codigo_particular || idx;
                              const isDescExpanded = expandedDescs.has(descKey);
                              const desc = p.descripcion || "—";
                              const isLong = desc.length > DESC_LIMIT;

                              return (
                                <tr
                                  key={p.codigo_particular || idx}
                                  className="border-t border-gray-100 hover:bg-gray-50/60 bg-white text-sm"
                                >
                                  {/* descripción — truncada, expandible al click */}
                                  <td className="py-2.5 px-3 pl-14 align-middle">
                                    <span
                                      className={`text-gray-700 text-sm leading-snug ${
                                        isLong ? "cursor-pointer hover:text-gray-900" : ""
                                      }`}
                                      onClick={isLong ? () => toggleDesc(descKey) : undefined}
                                    >
                                      {isDescExpanded || !isLong
                                        ? desc
                                        : `${desc.slice(0, DESC_LIMIT)}…`}
                                    </span>
                                  </td>

                                  {/* precio main — sin resaltado, sin variación */}
                                  {mainComp && (
                                    <td className="py-2.5 px-4 text-center align-middle">
                                      {mainEntry ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className="font-semibold text-gray-800 tabular-nums">
                                            {formatPrecio(mainEntry.precio)}
                                          </span>
                                          {mainEntry.codigoOriginal && (
                                            <span className="text-xs text-gray-400 font-mono">
                                              {mainEntry.codigoOriginal}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-300">—</span>
                                      )}
                                    </td>
                                  )}

                                  {/* precios competidores — con variación vs main */}
                                  {otherComps.map((c) => {
                                    const entry = getPrecioEntry(p, c.id);
                                    if (!entry) {
                                      return (
                                        <td key={c.id} className="py-2.5 px-4 text-center align-middle">
                                          <span className="text-gray-300">—</span>
                                        </td>
                                      );
                                    }
                                    const pct = calcVariacion(mainPrice, entry.precio);
                                    const tier = getVariacionTier(pct);
                                    return (
                                      <td key={c.id} className="py-2.5 px-4 text-center align-middle">
                                        <div className="flex flex-col items-center gap-0.5">
                                          {pct !== null ? (
                                            <span
                                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${TIER_STYLES[tier]}`}
                                            >
                                              {pct > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-400 italic">
                                              sin ref.
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-500 tabular-nums">
                                            {formatPrecio(entry.precio)}
                                          </span>
                                          {entry.codigoOriginal && (
                                            <span className="text-xs text-gray-300 font-mono">
                                              {entry.codigoOriginal}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    );
                                  })}

                                  <td />
                                </tr>
                              );
                            })}
                        </Fragment>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 py-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página{" "}
            <span className="font-medium text-gray-700">{pagination.page}</span> de{" "}
            <span className="font-medium text-gray-700">{pages}</span>
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
