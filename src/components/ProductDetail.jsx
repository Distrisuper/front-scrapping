import { useState, Fragment } from "react";
import AddProductForm from "./AddProductForm.jsx";
import EditableCell from "./EditableCell.jsx";
import { calcPorcentaje } from "../utils.js";

export default function ProductDetail({
  productos,
  competidores,
  marca,
  linea,
  colSpan = 6,
  onAdd,
  onDelete,
  onUpdate,
  onUpdatePrecio,
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <div className="bg-slate-50 border-t border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase">
                <th className="text-left py-2 px-4 pl-12">Producto</th>
                <th className="text-right py-2 px-4">Distrisuper</th>
                {competidores.map((c) => (
                  <Fragment key={c.id}>
                    <th className="text-right py-2 px-4">{c.nombre}</th>
                    <th className="text-right py-2 px-4">Variación</th>
                  </Fragment>
                ))}
                <th className="w-10"></th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-blue-50/40 text-sm group">
                  <td className="py-2 px-4 pl-12">
                    <div className="flex flex-col">
                      <span className="text-gray-700">{p.descripcion || "—"}</span>
                      {p.codigo && (
                        <span className="text-xs text-gray-400 font-mono">{p.codigo}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-1 px-2">
                    <EditableCell
                      value={p.precioDistri}
                      onSave={(v) => onUpdate(p.id, { precioDistri: v })}
                    />
                  </td>
                  {competidores.map((c) => {
                    const precio = (p.precios && p.precios[c.id]) || 0;
                    const pct = calcPorcentaje(p.precioDistri, precio);
                    return (
                      <Fragment key={c.id}>
                        <td className="py-1 px-2">
                          <EditableCell
                            value={precio}
                            onSave={(v) => onUpdatePrecio(p.id, c.id, v)}
                          />
                        </td>
                        <td className="py-2 px-4 text-right">
                          {precio > 0 ? (
                            <span className={`inline-flex items-center gap-1 text-sm font-medium ${pct > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                              {pct > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-300 text-sm">—</span>
                          )}
                        </td>
                      </Fragment>
                    );
                  })}
                  <td></td>
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => onDelete(p.id)}
                      className="text-gray-300 hover:text-rose-400 transition-colors text-xs opacity-0 group-hover:opacity-100"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-gray-100">
            {showAddForm ? (
              <AddProductForm
                defaults={{ marca, linea }}
                onAdd={(p) => { onAdd(p); setShowAddForm(false); }}
                onCancel={() => setShowAddForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-500 transition-colors ml-8"
              >
                <span className="text-lg leading-none">+</span> Agregar producto a {marca} – {linea}
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
