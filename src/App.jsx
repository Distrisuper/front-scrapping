import { useState, useMemo, useCallback, useEffect } from "react";
import useLocalStorage from "./hooks/useLocalStorage.js";
import ComparisonTable from "./components/ComparisonTable.jsx";
import Filters from "./components/Filters.jsx";

export default function App() {
  const [productos, setProductos] = useLocalStorage("comparador-productos", []);
  const [competidores, setCompetidores] = useLocalStorage("comparador-competidores", []);
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroLinea, setFiltroLinea] = useState("");

  // Migración automática: si existen productos con precioProveedor (modelo viejo) y no hay
  // competidores configurados, creamos "Competidor 1" y movemos los precios al nuevo modelo.
  useEffect(() => {
    const needsMigration = productos.some(
      (p) => p.precioProveedor !== undefined && (!p.precios || Object.keys(p.precios).length === 0)
    );
    if (!needsMigration) return;

    const competidorId = competidores[0]?.id || "comp1";
    if (competidores.length === 0) {
      setCompetidores([{ id: competidorId, nombre: "Competidor 1" }]);
    }
    setProductos((prev) =>
      prev.map((p) => {
        if (p.precioProveedor === undefined) return p;
        const { precioProveedor, proveedor, ...rest } = p;
        return {
          ...rest,
          precios: { ...(p.precios || {}), [competidorId]: precioProveedor || 0 },
        };
      })
    );
  }, [productos, competidores, setProductos, setCompetidores]);

  const marcas = useMemo(() => [...new Set(productos.map((p) => p.marca))].sort(), [productos]);

  const lineas = useMemo(() => {
    const filtered = filtroMarca ? productos.filter((p) => p.marca === filtroMarca) : productos;
    return [...new Set(filtered.map((p) => p.linea))].sort();
  }, [productos, filtroMarca]);

  const handleMarcaChange = (val) => {
    setFiltroMarca(val);
    setFiltroLinea("");
  };

  const addProducto = useCallback((producto) => {
    setProductos((prev) => [
      ...prev,
      { ...producto, precios: producto.precios || {}, id: crypto.randomUUID() },
    ]);
  }, [setProductos]);

  const deleteProducto = useCallback((id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }, [setProductos]);

  const deleteGrupo = useCallback((marca, linea) => {
    setProductos((prev) => prev.filter((p) => !(p.marca === marca && p.linea === linea)));
  }, [setProductos]);

  const updateProducto = useCallback((id, updates) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, [setProductos]);

  const updatePrecioCompetidor = useCallback((id, competidorId, precio) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, precios: { ...(p.precios || {}), [competidorId]: precio } } : p
      )
    );
  }, [setProductos]);

  const addCompetidor = useCallback((nombre) => {
    const id = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setCompetidores((prev) => [...prev, { id, nombre: nombre.trim() }]);
  }, [setCompetidores]);

  const renameCompetidor = useCallback((id, nombre) => {
    setCompetidores((prev) => prev.map((c) => (c.id === id ? { ...c, nombre: nombre.trim() } : c)));
  }, [setCompetidores]);

  const deleteCompetidor = useCallback((id) => {
    setCompetidores((prev) => prev.filter((c) => c.id !== id));
    setProductos((prev) =>
      prev.map((p) => {
        if (!p.precios || p.precios[id] === undefined) return p;
        const { [id]: _removed, ...resto } = p.precios;
        return { ...p, precios: resto };
      })
    );
  }, [setCompetidores, setProductos]);

  const totalProductos = productos.length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Comparador de Precios</h1>
              <p className="text-sm text-gray-400 mt-0.5">Distrisuper vs Competidores</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <span className="text-gray-700 font-medium">{totalProductos}</span> productos cargados
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {totalProductos > 0 ? (
          <Filters
            marcas={marcas}
            lineas={lineas}
            filtroMarca={filtroMarca}
            filtroLinea={filtroLinea}
            onMarcaChange={handleMarcaChange}
            onLineaChange={setFiltroLinea}
          />
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">No hay productos cargados</p>
            <p className="text-sm">Usá el botón <span className="text-blue-500 font-medium">+ Agregar producto</span> para empezar</p>
          </div>
        )}

        <ComparisonTable
          productos={productos}
          competidores={competidores}
          filtroMarca={filtroMarca}
          filtroLinea={filtroLinea}
          onAdd={addProducto}
          onDelete={deleteProducto}
          onDeleteGrupo={deleteGrupo}
          onUpdate={updateProducto}
          onUpdatePrecio={updatePrecioCompetidor}
          onAddCompetidor={addCompetidor}
          onRenameCompetidor={renameCompetidor}
          onDeleteCompetidor={deleteCompetidor}
        />
      </main>
    </div>
  );
}
