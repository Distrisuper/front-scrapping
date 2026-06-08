import { useState, useMemo, Fragment } from "react";
import ProductDetail from "./ProductDetail.jsx";
import AddProductForm from "./AddProductForm.jsx";
import { formatPrecio, calcPorcentaje } from "../utils.js";

export default function ComparisonTable({ productos, filtroMarca, filtroLinea, onAdd, onDelete, onDeleteGrupo, onUpdate }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
        map[key] = { marca: p.marca, linea: p.linea, totalDistri: 0, totalProv: 0, productos: [] };
      }
      map[key].totalDistri += p.precioDistri || 0;
      map[key].totalProv += p.precioProveedor || 0;
      map[key].productos.push(p);
    });
    return Object.values(map).sort((a, b) => a.marca.localeCompare(b.marca) || a.linea.localeCompare(b.linea));
  }, [filtrados]);

  const totales = useMemo(() => {
    return agrupados.reduce(
      (acc, g) => ({ totalDistri: acc.totalDistri + g.totalDistri, totalProv: acc.totalProv + g.totalProv }),
      { totalDistri: 0, totalProv: 0 }
    );
  }, [agrupados]);

  const toggleRow = (key) => {
    setExpandedRow(expandedRow === key ? null : key);
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
                <th className="text-left py-3 px-4 font-semibold">Línea</th>
                <th className="text-right py-3 px-4 font-semibold">Diferencia</th>
                <th className="text-right py-3 px-4 font-semibold">Distrisuper</th>
                <th className="text-right py-3 px-4 font-semibold">Competencia</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {agrupados.map((grupo) => {
                const key = `${grupo.marca}||${grupo.linea}`;
                const pct = calcPorcentaje(grupo.totalDistri, grupo.totalProv);
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
                          <span className="font-semibold text-gray-800">{grupo.marca}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600" onClick={() => toggleRow(key)}>
                        {grupo.linea}
                        <span className="ml-2 text-xs text-gray-300">({grupo.productos.length} items)</span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={() => toggleRow(key)}>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                            pct > 0
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {pct > 0 ? "▼" : "▲"} {Math.abs(pct).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-700" onClick={() => toggleRow(key)}>
                        {formatPrecio(grupo.totalDistri)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-700" onClick={() => toggleRow(key)}>
                        {formatPrecio(grupo.totalProv)}
                      </td>
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
                        marca={grupo.marca}
                        linea={grupo.linea}
                        onAdd={onAdd}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                      />
                    )}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800" colSpan={2}>TOTAL</td>
                <td className="py-3 px-4 text-right">
                  {totales.totalDistri > 0 && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                        calcPorcentaje(totales.totalDistri, totales.totalProv) > 0
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {calcPorcentaje(totales.totalDistri, totales.totalProv) > 0 ? "▼" : "▲"}{" "}
                      {Math.abs(calcPorcentaje(totales.totalDistri, totales.totalProv)).toFixed(1)}%
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-800">{formatPrecio(totales.totalDistri)}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-800">{formatPrecio(totales.totalProv)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
