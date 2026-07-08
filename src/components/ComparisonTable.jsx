import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { createPortal } from "react-dom";
import { formatPrecio, formatDescuento } from "../utils.js";
import { calcVariacion, getVariacionTier, TIER_STYLES } from "../lib/variacion.js";

const DESC_LIMIT = 80;

// Tooltip se renderiza en un portal a document.body y se posiciona con
// coordenadas de viewport (position: fixed) para no quedar recortado por
// los contenedores con overflow-auto de la tabla.
function HoverInfo({ trigger, children, triggerClassName = "" }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.top, left: rect.left + rect.width / 2 });
  };
  const hide = () => setPos(null);

  return (
    <span
      ref={ref}
      className={`relative inline-flex ${triggerClassName}`}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {trigger}
      {pos &&
        createPortal(
          <span
            className="pointer-events-none fixed -translate-x-1/2 -translate-y-full -mt-1.5 flex flex-col gap-0.5 whitespace-nowrap rounded-md bg-gray-900 text-white text-[11px] font-normal normal-case tracking-normal px-2.5 py-1.5 shadow-lg z-[9999]"
            style={{ top: pos.top, left: pos.left }}
          >
            {children}
          </span>,
          document.body
        )}
    </span>
  );
}

function DescuentoInput({ label, value, original, onChange }) {
  const modificado = value !== "" && Number(value) !== (Number(original) || 0);
  return (
    <label className="contents font-normal normal-case tracking-normal text-[10px] text-gray-400">
      <span className="whitespace-nowrap text-left">{label}</span>
      <span className="relative inline-flex items-center">
        <input
          type="number"
          step="any"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-9 rounded border px-1 py-0.5 pr-4 text-right text-[11px] font-medium tabular-nums focus:border-blue-400 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            modificado
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-700"
          }`}
        />
        <span className="pointer-events-none absolute right-1 text-[10px] text-gray-400">%</span>
      </span>
    </label>
  );
}

function CompetidorHeader({ comp, descuentos, onChange }) {
  return (
    <div className="flex justify-center">
      <div className="flex max-w-full flex-col items-start gap-1.5">
        <span className="max-w-full truncate">{comp.nombre}</span>
        <div className="grid grid-cols-[auto_auto] items-center justify-start gap-x-1 gap-y-1">
          <DescuentoInput
            label="DTO Gral"
            value={descuentos?.gral ?? ""}
            original={comp.descuentoGral}
            onChange={(v) => onChange("gral", v)}
          />
          <DescuentoInput
            label="DTO PP"
            value={descuentos?.pp ?? ""}
            original={comp.descuentoPp}
            onChange={(v) => onChange("pp", v)}
          />
        </div>
      </div>
    </div>
  );
}

// El precio del back ya viene con los descuentos originales aplicados en
// cascada (precio = base × (1 − gral%) × (1 − pp%)). Para simular un descuento
// editado se des-aplica el original y se aplica el nuevo.
function factorDescuento(original, editado) {
  const orig = Number(original) || 0;
  if (orig >= 100) return 1;
  const num = editado === "" || editado == null ? orig : Number(editado);
  if (Number.isNaN(num)) return 1;
  const nuevo = Math.min(100, Math.max(0, num));
  return (100 - nuevo) / (100 - orig);
}

const initDescuentos = (competidores) =>
  Object.fromEntries(
    competidores.map((c) => [c.id, { gral: c.descuentoGral ?? "", pp: c.descuentoPp ?? "" }])
  );

function getPrecioEntry(producto, competidorKey) {
  return (
    (producto.precios || []).find(
      (p) => String(p.competidorId) === String(competidorKey) && p.precio > 0
    ) ?? null
  );
}

function avgVariacion(productos, mainId, competidorId, factores) {
  const fMain = factores?.[mainId] ?? 1;
  const fComp = factores?.[competidorId] ?? 1;
  const vals = productos
    .map((p) => {
      const mainPrice = (getPrecioEntry(p, mainId)?.precio ?? 0) * fMain;
      const compPrice = (getPrecioEntry(p, competidorId)?.precio ?? 0) * fComp;
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
      {pct < 0 ? "▼" : "▲"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default function ComparisonTable({
  data,
  competidores,
  loading,
  indicePrioridad = 0,
}) {
  const [expandedMarcas, setExpandedMarcas] = useState(new Set());
  const [expandedLineas, setExpandedLineas] = useState(new Set());
  const [expandedDescs, setExpandedDescs] = useState(new Set());

  const mainComp = useMemo(() => competidores.find((c) => c.main) ?? null, [competidores]);
  const otherComps = useMemo(() => competidores.filter((c) => !c.main), [competidores]);
  const totalCols = 1 + (mainComp ? 1 : 0) + otherComps.length + 1;

  // Variador de descuentos por competidor: al editar se recalculan los precios
  // y variaciones en front para simular escenarios. No dispara nada al back.
  const [descuentosEdit, setDescuentosEdit] = useState({});

  useEffect(() => {
    setDescuentosEdit(initDescuentos(competidores));
  }, [competidores]);

  const setDescuento = (compId, campo, valor) =>
    setDescuentosEdit((prev) => ({
      ...prev,
      [compId]: { ...prev[compId], [campo]: valor },
    }));

  const resetDescuentos = () => setDescuentosEdit(initDescuentos(competidores));

  const hayModificados = useMemo(
    () =>
      competidores.some((c) => {
        const edit = descuentosEdit[c.id];
        if (!edit) return false;
        return ["gral", "pp"].some((campo) => {
          const orig = Number(campo === "gral" ? c.descuentoGral : c.descuentoPp) || 0;
          const val = edit[campo];
          const num = val === "" || val == null ? orig : Number(val);
          return !Number.isNaN(num) && num !== orig;
        });
      }),
    [competidores, descuentosEdit]
  );

  const factores = useMemo(() => {
    const map = {};
    for (const c of competidores) {
      const edit = descuentosEdit[c.id];
      map[c.id] =
        factorDescuento(c.descuentoGral, edit?.gral) *
        factorDescuento(c.descuentoPp, edit?.pp);
    }
    return map;
  }, [competidores, descuentosEdit]);

  const toggleMarca = (key) => {
    setExpandedMarcas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  useEffect(() => {
    const keys = data.filter((d) => d.lineas?.length === 1 && expandedMarcas.has(d.marca) && !expandedLineas.has(`${d.marca}||${d.lineas[0].linea}`));
    for (const key of keys) {
      toggleLinea(`${key.marca}||${key.lineas[0].linea}`);
    }
  },[expandedMarcas]); 

  const toggleLinea = (key) => {
    setExpandedLineas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const toggleDesc = (key) =>
    setExpandedDescs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16 text-gray-400 text-sm">Cargando...</div>
        ) : !data.length ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No hay productos</p>
          </div>
        ) : (
        <table className="w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="text-left py-3 px-3 font-semibold">
                <div className="flex flex-col items-start gap-2">
                  <span>Descripción</span>
                  <button
                    type="button"
                    onClick={resetDescuentos}
                    disabled={!hayModificados}
                    className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                  >
                    ↺ Reiniciar descuentos
                  </button>
                </div>
              </th>
              {mainComp && (
                <th className="w-32 text-center py-3 px-2 font-semibold">
                  <CompetidorHeader
                    comp={mainComp}
                    descuentos={descuentosEdit[mainComp.id]}
                    onChange={(campo, valor) => setDescuento(mainComp.id, campo, valor)}
                  />
                </th>
              )}
              {otherComps.map((c) => (
                <th key={c.id} className="w-36 text-center py-3 px-2 font-semibold">
                  <CompetidorHeader
                    comp={c}
                    descuentos={descuentosEdit[c.id]}
                    onChange={(campo, valor) => setDescuento(c.id, campo, valor)}
                  />
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {data.map((marcaData, idx) => {
              const marcaKey = marcaData.marca;
              const isMarcaExpanded = expandedMarcas.has(marcaKey);
              const todosProductos = marcaData.lineas.flatMap((l) => l.productos);
              const esPrioritaria = idx < indicePrioridad;
              const showSeparador8020 = idx === 0 && indicePrioridad > 0;
              const showSeparadorOtras =
                idx === indicePrioridad && indicePrioridad > 0 && indicePrioridad < data.length;

              return (
                <Fragment key={marcaKey}>
                  {showSeparador8020 && (
                    <tr>
                      <td
                        colSpan={totalCols}
                        className="py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border-t-2 border-b border-blue-200"
                      >
                        80/20
                      </td>
                    </tr>
                  )}
                  {showSeparadorOtras && (
                    <tr>
                      <td
                        colSpan={totalCols}
                        className="py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 border-t-2 border-b border-gray-300"
                      >
                        Otras marcas
                      </td>
                    </tr>
                  )}
                  {/* ── FILA MARCA ── */}
                  <tr
                    className={`border-t border-gray-200 cursor-pointer select-none transition-colors ${
                      isMarcaExpanded
                        ? "bg-gray-100"
                        : esPrioritaria
                        ? "bg-blue-50 bg-opacity-20 hover:bg-blue-100/60"
                        : "hover:bg-gray-50"
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
                      <td key={c.id} className="py-3 px-4 text-center">
                        <VariacionBadge
                          pct={
                            mainComp
                              ? avgVariacion(todosProductos, mainComp.id, c.id, factores)
                              : null
                          }
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
                              <td key={c.id} className="py-2.5 px-4 text-center">
                                <VariacionBadge
                                  pct={
                                    mainComp
                                      ? avgVariacion(lineaData.productos, mainComp.id, c.id, factores)
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
                              const mainPrice =
                                (mainEntry?.precio ?? 0) *
                                (mainComp ? factores[mainComp.id] ?? 1 : 1);

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
                                            {formatPrecio(mainPrice)}
                                            {mainEntry.precioOriginal != null && (
                                              <HoverInfo
                                                triggerClassName="cursor-help text-blue-500 font-bold ml-0.5 align-super text-xs"
                                                trigger={<span>*</span>}
                                              >
                                                <span>Precio de lista: {formatPrecio(mainEntry.precioOriginal)}</span>
                                                <span>Dto por marca: {formatDescuento(mainEntry.descuentoMarca)}</span>
                                              </HoverInfo>
                                            )}
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
                                    const precioComp = entry.precio * (factores[c.id] ?? 1);
                                    const pct = calcVariacion(mainPrice, precioComp);
                                    const tier = getVariacionTier(pct);
                                    return (
                                      <td key={c.id} className="py-2.5 px-4 text-center align-middle">
                                        <div className="flex flex-col items-center gap-0.5">
                                          {pct !== null ? (
                                            <span
                                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${TIER_STYLES[tier]}`}
                                            >
                                              {pct < 0 ? "▼" : "▲"} {Math.abs(pct).toFixed(1)}%
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-400 italic">
                                              sin ref.
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-500 tabular-nums">
                                            {formatPrecio(precioComp)}
                                            {entry.precioOriginal != null && (
                                              <HoverInfo
                                                triggerClassName="cursor-help text-blue-500 font-bold ml-0.5 align-super"
                                                trigger={<span>*</span>}
                                              >
                                                <span>Precio de lista: {formatPrecio(entry.precioOriginal)}</span>
                                                <span>Dto por marca: {formatDescuento(entry.descuentoMarca)}</span>
                                              </HoverInfo>
                                            )}
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
        )}
      </div>
    </div>
  );
}
