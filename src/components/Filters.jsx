export default function Filters({ marcas, lineas, filtroMarca, filtroLinea, onMarcaChange, onLineaChange }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-500 mb-1">Marca</label>
        <select
          value={filtroMarca}
          onChange={(e) => onMarcaChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        >
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-500 mb-1">Línea</label>
        <select
          value={filtroLinea}
          onChange={(e) => onLineaChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        >
          <option value="">Todas las líneas</option>
          {lineas.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
