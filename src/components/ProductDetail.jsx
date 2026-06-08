import { useState } from "react";
import AddProductForm from "./AddProductForm.jsx";
import { formatPrecio, calcPorcentaje } from "../utils.js";

export default function ProductDetail({ productos, marca, linea, onAdd, onDelete, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  return (
    <tr>
      <td colSpan={6} className="p-0">
        <div className="bg-slate-50 border-t border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase">
                <th className="text-left py-2 px-4 pl-12">Código</th>
                <th className="text-left py-2 px-4">Descripción</th>
                <th className="text-right py-2 px-4">Diferencia</th>
                <th className="text-right py-2 px-4">Distrisuper</th>
                <th className="text-right py-2 px-4">Competencia</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => {
                const pct = calcPorcentaje(p.precioDistri, p.precioProveedor);
                const isEditing = editingId === p.id;

                if (isEditing) {
                  return (
                    <EditRow
                      key={p.id}
                      producto={p}
                      onSave={(updates) => { onUpdate(p.id, updates); setEditingId(null); }}
                      onCancel={() => setEditingId(null)}
                    />
                  );
                }

                return (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-blue-50/40 text-sm group">
                    <td className="py-2 px-4 pl-12 font-mono text-gray-500">{p.codigo || "—"}</td>
                    <td className="py-2 px-4 text-gray-600">{p.descripcion || "—"}</td>
                    <td className="py-2 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${pct > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {pct > 0 ? "▼" : "▲"} {Math.abs(pct).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right text-gray-600">{formatPrecio(p.precioDistri)}</td>
                    <td className="py-2 px-4 text-right text-gray-600">{formatPrecio(p.precioProveedor)}</td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingId(p.id)}
                          className="text-gray-300 hover:text-blue-400 transition-colors text-xs"
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="text-gray-300 hover:text-rose-400 transition-colors text-xs"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

function EditRow({ producto, onSave, onCancel }) {
  const [form, setForm] = useState({
    codigo: producto.codigo || "",
    descripcion: producto.descripcion || "",
    precioDistri: producto.precioDistri || "",
    precioProveedor: producto.precioProveedor || "",
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const inputClass =
    "bg-white border border-gray-200 rounded px-2 py-1 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200 w-full";

  return (
    <tr className="border-t border-gray-100 bg-blue-50/30 text-sm">
      <td className="py-2 px-4 pl-12">
        <input className={inputClass} value={form.codigo} onChange={(e) => set("codigo", e.target.value)} />
      </td>
      <td className="py-2 px-4">
        <input className={inputClass} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
      </td>
      <td className="py-2 px-4">
        <input type="number" step="0.01" className={inputClass} value={form.precioDistri} onChange={(e) => set("precioDistri", e.target.value)} />
      </td>
      <td className="py-2 px-4">
        <input type="number" step="0.01" className={inputClass} value={form.precioProveedor} onChange={(e) => set("precioProveedor", e.target.value)} />
      </td>
      <td className="py-2 px-4 text-right" colSpan={2}>
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => onSave({ codigo: form.codigo, descripcion: form.descripcion, precioDistri: parseFloat(form.precioDistri) || 0, precioProveedor: parseFloat(form.precioProveedor) || 0 })}
            className="px-2 py-1 bg-emerald-200 hover:bg-emerald-300 text-emerald-700 text-xs rounded transition-colors"
          >
            ✓
          </button>
          <button
            onClick={onCancel}
            className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs transition-colors"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}
