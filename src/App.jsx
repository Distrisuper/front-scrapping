import { useState, useMemo, useEffect } from "react";
import ComparisonTable from "./components/ComparisonTable.jsx";
import Filters from "./components/Filters.jsx";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/data";
const COMPETITORS_URL = new URL("/api/competitors", API_URL).href;

export default function App() {
  const [apiData, setApiData] = useState({ data: [], total: 0, page: 1, limit: 11, pages: 0 });
  const [competidores, setCompetidores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroLinea, setFiltroLinea] = useState("");

  useEffect(() => {
    fetch(COMPETITORS_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setCompetidores)
      .catch((e) => console.error("Error al cargar competidores:", e.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: 1, limit: 3000 });
    if (filtroMarca) params.set("marca", filtroMarca);
    if (filtroLinea) params.set("linea", filtroLinea);

    fetch(`${API_URL}?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setApiData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filtroMarca, filtroLinea]);

  // Fuente de verdad de las columnas: el endpoint /api/competitors.
  // El join de precios se hace por `id` numérico (String(c.id) === String(p.competidorId)).
  const competidoresEffective = useMemo(() => {
    const derived = competidores.map((c) => ({
      id: String(c.id),
      nombre: c.nombre,
      main: Boolean(c.main),
    }));
    if (competidores.length && !derived.some((c) => c.main)) {
      console.warn(
        "[Comparador] Ningún competidor tiene main=1. Revisar /api/competitors.",
        competidores
      );
    }
    return derived;
  }, [competidores]);

  const marcas = useMemo(
    () => apiData.data.map((d) => d.marca).filter(Boolean).sort(),
    [apiData.data]
  );

  const lineas = useMemo(() => {
    const marcaData = apiData.data.find((d) => d.marca === filtroMarca);
    return (marcaData?.lineas ?? []).map((l) => l.linea).filter(Boolean).sort();
  }, [apiData.data, filtroMarca]);

  const handleMarcaChange = (val) => {
    setFiltroMarca(val);
    setFiltroLinea("");
  };

  const mainNombre = competidoresEffective.find((c) => c.main)?.nombre ?? "";
  const otherNombres = competidoresEffective.filter((c) => !c.main).map((c) => c.nombre).join(", ");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Comparador de Precios</h1>
              {mainNombre && (
                <p className="text-sm text-gray-400 mt-0.5">
                  <span className="text-blue-500 font-medium">{mainNombre}</span>
                  {otherNombres && <span> vs {otherNombres}</span>}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-gray-400">
              <span className="text-gray-700 font-medium">{apiData.total}</span> productos
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Filters
          marcas={marcas}
          lineas={lineas}
          filtroMarca={filtroMarca}
          filtroLinea={filtroLinea}
          onMarcaChange={handleMarcaChange}
          onLineaChange={(val) => setFiltroLinea(val)}
        />

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
            Error al cargar datos: {error}
          </div>
        )}

        <ComparisonTable
          data={apiData.data}
          competidores={competidoresEffective}
          loading={loading}
        />
      </main>
    </div>
  );
}
