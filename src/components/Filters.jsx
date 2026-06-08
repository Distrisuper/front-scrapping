import SearchableSelect from "./SearchableSelect.jsx";

export default function Filters({ marcas, lineas, filtroMarca, filtroLinea, onMarcaChange, onLineaChange }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <SearchableSelect
        label="Marca"
        placeholder="Buscar marca..."
        value={filtroMarca}
        options={marcas}
        onChange={onMarcaChange}
      />
      {filtroMarca && (
        <SearchableSelect
          label="Línea"
          placeholder="Buscar línea..."
          value={filtroLinea}
          options={lineas}
          onChange={onLineaChange}
        />
      )}
    </div>
  );
}
