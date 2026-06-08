import { useState, useMemo, Fragment } from "react";
import ProductDetail from "./ProductDetail.jsx";
import AddProductForm from "./AddProductForm.jsx";
import { formatPrecio, calcPorcentaje } from "../utils.js";

export default function ComparisonTable({
  productos,
  competidores,
  filtroMarca,
  filtroLinea,
  onAdd,
  onDelete,
  onDeleteGrupo,
  onUpdate,
  onUpdatePrecio,
  onAddCompetidor,
  onRenameCompetidor,
  onDeleteCompetidor,
}) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingCompetidor, setAddingCompetidor] = useState(false);
  const [newCompetidorName, setNewCompetidorName] = useState("");
  const [editingCompetidorId, setEditingCompetidorId] = useState(null);
  const [editingCompetidorName, setEditingCompetidorName] = useState("");

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      if (filtroMarca && p.marca !== filtroMarca) return false;
      if (filtroLinea && p.linea !== filtroLinea) return false;
      return true;
    });
  }, [productos, filtroMarca, filtroLinea]);

  const agrupados = useMemo(() => {
    const map = {};
    filtrados.forEach((p) => {
      const key = `${p.marca}||${p.linea}`;
      if (!map[key]) {
        map[key] = {
          marca: p.marca,
          linea: p.linea,
          totalDistri: 0,
          totalesCompetidores: {},
          productos: [],
        };
      }
      map[key].totalDistri += p.precioDistri || 0;
      competidores.forEach((c) => {
        const precio = (p.precios && p.precios[c.id]) || 0;
        map[key].totalesCompetidores[c.id] = (map[key].totalesCompetidores[c.id] || 0) + precio;
      });
      map[key].productos.push(p);
    });
    return Object.values(map).sort(
      (a, b) => a.marca.localeCompare(b.marca) || a.linea.localeCompare(b.linea)
    );
  }, [filtrados, competidores]);

  const totales = useMemo(() => {
    const totalDistri = agrupados.reduce((s, g) => s + g.totalDistri, 0);
    const totalesCompetidores = {};
    competidores.forEach((c) => {
      totalesCompetidores[c.id] = agrupados.reduce((s, g) => s + (g.totalesCompetidores[c.id] || 0), 0);
    });
    return { totalDistri, totalesCompetidores };
  }, [agrupados, competidores]);

  const toggleRow = (key) => {
    setExpandedRow(expandedRow === key ? null : key);
  };

  // Columnas: Marca/Línea + Distrisuper + (Precio + Variación) x competidores + botón "+ Competidor" + acciones
  const totalCols = 2 + competidores.length * 2 + 1 + 1;

  const handleAddCompetidor = () => {
    if (newCompetidorName.trim()) {
      onAddCompetidor(newCompetidorName);
      setNewCompetidorName("");
      setAddingCompetidor(false);
    }
  };

  const handleRenameCompetidor = () => {
    if (editingCompetidorName.trim()) {
      onRenameCompetidor(editingCompetidorId, editingCompetidorName);
      setEditingCompetidorId(null);
      setEditingCompetidorName("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-700 text-sm font-medium rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span> Agregar producto
        </button>
      </div>

      {showAddForm && (
        <AddProductForm
          onAdd={(p) => { onAdd(p); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {agrupados.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-semibold">Marca</th>
                <th className="text-right py-3 px-4 font-semibold">Distrisuper</th>
                {competidores.map((c) => (
                  <Fragment key={c.id}>
                    <th className="text-right py-3 px-4 font-semibold normal-case tracking-normal">
                      {editingCompetidorId === c.id ? (
                        <input
                          type="text"
                          value={editingCompetidorName}
                          autoFocus
                          onChange={(e) => setEditingCompetidorName(e.target.value)}
                          onBlur={handleRenameCompetidor}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameCompetidor();
                            else if (e.key === "Escape") { setEditingCompetidorId(null); setEditingCompetidorName(""); }
                          }}
                          className="bg-white border border-blue-300 rounded px-2 py-1 text-gray-700 text-sm font-semibold w-32 focus:outline-none focus:ring-1 focus:ring-blue-200"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1 group/header">
                          <span className="uppercase tracking-wider">{c.nombre}</span>
                          <span className="opacity-0 group-hover/header:opacity-100 transition-opacity inline-flex gap-1">
                            <button
                              onClick={() => { setEditingCompetidorId(c.id); setEditingCompetidorName(c.nombre); }}
                              className="text-gray-300 hover:text-blue-400 text-xs"
                              title="Renombrar"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar competidor "${c.nombre}"? Se borrarán todos sus precios.`)) {
                                  onDeleteCompetidor(c.id);
                                }
                              }}
                              className="text-gray-300 hover:text-rose-400 text-xs"
                              title="Eliminar competidor"
                            >
                              ✕
                            </button>
                          </span>
                        </span>
                      )}
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">Variación</th>
                  </Fragment>
                ))}
                <th className="text-center py-3 px-2 font-semibold normal-case">
                  {addingCompetidor ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nombre"
                        value={newCompetidorName}
                        onChange={(e) => setNewCompetidorName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddCompetidor();
                          else if (e.key === "Escape") { setAddingCompetidor(false); setNewCompetidorName(""); }
                        }}
                        onBlur={handleAddCompetidor}
                        className="bg-white border border-blue-300 rounded px-2 py-1 text-gray-700 text-sm font-normal w-32 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingCompetidor(true)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                      title="Agregar competidor"
                    >
                      + Competidor
                    </button>
                  )}
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {agrupados.map((grupo) => {
                const key = `${grupo.marca}||${grupo.linea}`;
                const isExpanded = expandedRow === key;

                return (
                  <Fragment key={key}>
                    <tr
                      className={`border-t border-gray-100 cursor-pointer transition-colors duration-150 ${
                        isExpanded ? "bg-blue-50/50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4" onClick={() => toggleRow(key)}>
                        <div className="flex items-center gap-2">
                          <span className={`text-gray-300 transition-transform duration-200 text-xs ${isExpanded ? "rotate-90" : ""}`}>
                            ▶
                          </span>
                          <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-gray-800">{grupo.marca}</span>
                            <span className="text-sm text-gray-500">{grupo.linea}</span>
                            <span className="text-xs text-gray-300 mt-0.5">{grupo.productos.length} items</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-700" onClick={() => toggleRow(key)}>
                        {formatPrecio(grupo.totalDistri)}
                      </td>
                      {competidores.map((c) => {
                        const totalComp = grupo.totalesCompetidores[c.id] || 0;
                        const pct = calcPorcentaje(grupo.totalDistri, totalComp);
                        return (
                          <Fragment key={c.id}>
                            <td className="py-3 px-4 text-right font-medium text-gray-700" onClick={() => toggleRow(key)}>
                              {totalComp > 0 ? formatPrecio(totalComp) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-4 text-right" onClick={() => toggleRow(key)}>
                              {totalComp > 0 ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                                    pct > 0
                                      ? "bg-rose-100 text-rose-600"
                                      : "bg-emerald-100 text-emerald-600"
                                  }`}
                                >
                                  {pct > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          </Fragment>
                        );
                      })}
                      <td onClick={() => toggleRow(key)}></td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteGrupo(grupo.marca, grupo.linea); }}
                          className="text-gray-300 hover:text-rose-400 transition-colors text-sm"
                          title="Eliminar grupo"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <ProductDetail
                        productos={grupo.productos}
                        competidores={competidores}
                        marca={grupo.marca}
                        linea={grupo.linea}
                        colSpan={totalCols}
                        onAdd={onAdd}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        onUpdatePrecio={onUpdatePrecio}
                      />
                    )}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800">TOTAL</td>
                <td className="py-3 px-4 text-right font-bold text-gray-800">{formatPrecio(totales.totalDistri)}</td>
                {competidores.map((c) => {
                  const totalComp = totales.totalesCompetidores[c.id] || 0;
                  const pct = calcPorcentaje(totales.totalDistri, totalComp);
                  return (
                    <Fragment key={c.id}>
                      <td className="py-3 px-4 text-right font-bold text-gray-800">{formatPrecio(totalComp)}</td>
                      <td className="py-3 px-4 text-right">
                        {totales.totalDistri > 0 && totalComp > 0 && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                              pct > 0
                                ? "bg-rose-100 text-rose-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            {pct > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </Fragment>
                  );
                })}
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
