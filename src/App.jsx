import { useState, useMemo, useCallback } from "react";
import useLocalStorage from "./hooks/useLocalStorage.js";
import ComparisonTable from "./components/ComparisonTable.jsx";
import Filters from "./components/Filters.jsx";
import { formatPrecio, calcPorcentaje } from "./utils.js";

export default function App() {
  const [productos, setProductos] = useLocalStorage("comparador-productos", []);
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroLinea, setFiltroLinea] = useState("");

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
    setProductos((prev) => [...prev, { ...producto, id: crypto.randomUUID() }]);
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

  const totalProductos = productos.length;
  const totalDistri = productos.reduce((s, p) => s + (p.precioDistri || 0), 0);
  const totalProv = productos.reduce((s, p) => s + (p.precioProveedor || 0), 0);
  const ahorroGlobal = totalDistri > 0 ? calcPorcentaje(totalDistri, totalProv) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Comparador de Precios</h1>
              <p className="text-sm text-gray-400 mt-0.5">Distrisuper vs Proveedores</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <span className="text-gray-700 font-medium">{totalProductos}</span> productos cargados
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {totalProductos > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <p className="text-sm text-blue-400 mb-1">Total Distrisuper</p>
                <p className="text-2xl font-bold text-gray-800">{formatPrecio(totalDistri)}</p>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-5">
                <p className="text-sm text-violet-400 mb-1">Total Competencia</p>
                <p className="text-2xl font-bold text-gray-800">{formatPrecio(totalProv)}</p>
              </div>
              <div className={`rounded-xl p-5 border ${ahorroGlobal > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
                <p className={`text-2xl font-bold mb-1 ${ahorroGlobal > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {ahorroGlobal > 0 ? "▲" : "▼"} {Math.abs(ahorroGlobal).toFixed(1)}%
                </p>
                <p className="text-sm font-medium text-gray-500">
                  Distrisuper está más {ahorroGlobal > 0 ? "caro" : "barato"} en relación con Competencia
                </p>
              </div>
            </div>

            <Filters
              marcas={marcas}
              lineas={lineas}
              filtroMarca={filtroMarca}
              filtroLinea={filtroLinea}
              onMarcaChange={handleMarcaChange}
              onLineaChange={setFiltroLinea}
            />
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">No hay productos cargados</p>
            <p className="text-sm">Usá el botón <span className="text-blue-500 font-medium">+ Agregar producto</span> para empezar</p>
          </div>
        )}

        <ComparisonTable
          productos={productos}
          filtroMarca={filtroMarca}
          filtroLinea={filtroLinea}
          onAdd={addProducto}
          onDelete={deleteProducto}
          onDeleteGrupo={deleteGrupo}
          onUpdate={updateProducto}
        />
      </main>
    </div>
  );
}
