import { useState } from "react";

const emptyForm = { codigo: "", descripcion: "", marca: "", linea: "", precioDistri: "", precioProveedor: "" };

export default function AddProductForm({ onAdd, onCancel, defaults }) {
  const [form, setForm] = useState({ ...emptyForm, ...defaults });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.marca.trim() || !form.linea.trim()) return;
    onAdd({
      codigo: form.codigo.trim(),
      descripcion: form.descripcion.trim(),
      marca: form.marca.trim(),
      linea: form.linea.trim(),
      precioDistri: parseFloat(form.precioDistri) || 0,
      precioProveedor: parseFloat(form.precioProveedor) || 0,
      proveedor: "competencia",
    });
    setForm({ ...emptyForm, marca: form.marca, linea: form.linea });
  };

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder-gray-300";

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Marca *</label>
          <input
            className={inputClass}
            placeholder="Ej: SKF"
            value={form.marca}
            onChange={(e) => set("marca", e.target.value)}
            required
            disabled={!!defaults?.marca}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Línea *</label>
          <input
            className={inputClass}
            placeholder="Ej: Rodamientos"
            value={form.linea}
            onChange={(e) => set("linea", e.target.value)}
            required
            disabled={!!defaults?.linea}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Código</label>
          <input
            className={inputClass}
            placeholder="Ej: SKF-6205"
            value={form.codigo}
            onChange={(e) => set("codigo", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Descripción</label>
          <input
            className={inputClass}
            placeholder="Ej: Rodamiento 6205 2RS"
            value={form.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Precio Distrisuper</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            placeholder="0.00"
            value={form.precioDistri}
            onChange={(e) => set("precioDistri", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Precio Competencia</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            placeholder="0.00"
            value={form.precioProveedor}
            onChange={(e) => set("precioProveedor", e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-700 text-sm font-medium rounded-lg transition-colors"
        >
          Agregar
        </button>
      </div>
    </form>
  );
}
