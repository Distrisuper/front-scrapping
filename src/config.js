// Configuración central de la API. La URL base sale de VITE_API_URL
// (ver .env); de ahí derivamos el resto de los endpoints.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/data";

export const PRODUCTOS_URL = API_URL;
export const COMPETIDORES_URL = new URL("/api/competitors", API_URL).href;

export const PAGE_SIZE = 20;
