export const proveedores = [
  { id: "competencia", nombre: "Competencia" },
];

export const productos = [
  // SKF - Rodamientos
  { codigo: "SKF-6205-2RS", descripcion: "Rodamiento 6205 2RS", marca: "SKF", linea: "Rodamientos", precioDistri: 12500, precioProveedor: 10450, proveedor: "competencia" },
  { codigo: "SKF-6203-2RS", descripcion: "Rodamiento 6203 2RS", marca: "SKF", linea: "Rodamientos", precioDistri: 9800, precioProveedor: 8320, proveedor: "competencia" },
  { codigo: "SKF-6308-2RS", descripcion: "Rodamiento 6308 2RS", marca: "SKF", linea: "Rodamientos", precioDistri: 18200, precioProveedor: 15600, proveedor: "competencia" },
  { codigo: "SKF-6004-2RS", descripcion: "Rodamiento 6004 2RS", marca: "SKF", linea: "Rodamientos", precioDistri: 7650, precioProveedor: 6430, proveedor: "competencia" },
  { codigo: "SKF-6305-2RS", descripcion: "Rodamiento 6305 2RS", marca: "SKF", linea: "Rodamientos", precioDistri: 14200, precioProveedor: 12100, proveedor: "competencia" },

  // SKF - Tensores
  { codigo: "SKF-VKM-13240", descripcion: "Tensor correa distribución VW Gol", marca: "SKF", linea: "Tensores", precioDistri: 45000, precioProveedor: 38200, proveedor: "competencia" },
  { codigo: "SKF-VKM-13261", descripcion: "Tensor correa distribución Fiat Palio", marca: "SKF", linea: "Tensores", precioDistri: 42000, precioProveedor: 36800, proveedor: "competencia" },
  { codigo: "SKF-VKM-15000", descripcion: "Tensor correa poly-v Chevrolet Corsa", marca: "SKF", linea: "Tensores", precioDistri: 38500, precioProveedor: 33200, proveedor: "competencia" },

  // Mahle - Filtros de aceite
  { codigo: "MAHLE-OC-232", descripcion: "Filtro aceite VW Gol / Polo", marca: "Mahle", linea: "Filtros de aceite", precioDistri: 8900, precioProveedor: 7200, proveedor: "competencia" },
  { codigo: "MAHLE-OC-306", descripcion: "Filtro aceite Fiat Palio / Siena", marca: "Mahle", linea: "Filtros de aceite", precioDistri: 9200, precioProveedor: 7650, proveedor: "competencia" },
  { codigo: "MAHLE-OC-405", descripcion: "Filtro aceite Ford Focus / Fiesta", marca: "Mahle", linea: "Filtros de aceite", precioDistri: 10500, precioProveedor: 8900, proveedor: "competencia" },
  { codigo: "MAHLE-OC-501", descripcion: "Filtro aceite Toyota Hilux", marca: "Mahle", linea: "Filtros de aceite", precioDistri: 14200, precioProveedor: 12800, proveedor: "competencia" },

  // Mahle - Filtros de aire
  { codigo: "MAHLE-LX-1640", descripcion: "Filtro aire VW Gol Trend", marca: "Mahle", linea: "Filtros de aire", precioDistri: 15800, precioProveedor: 14200, proveedor: "competencia" },
  { codigo: "MAHLE-LX-1850", descripcion: "Filtro aire Ford EcoSport", marca: "Mahle", linea: "Filtros de aire", precioDistri: 17500, precioProveedor: 15100, proveedor: "competencia" },
  { codigo: "MAHLE-LX-2077", descripcion: "Filtro aire Toyota Corolla", marca: "Mahle", linea: "Filtros de aire", precioDistri: 16200, precioProveedor: 13800, proveedor: "competencia" },

  // NGK - Bujías
  { codigo: "NGK-BKR6E", descripcion: "Bujía BKR6E estándar", marca: "NGK", linea: "Bujías", precioDistri: 4500, precioProveedor: 3850, proveedor: "competencia" },
  { codigo: "NGK-BKR5EIX", descripcion: "Bujía Iridium IX VW", marca: "NGK", linea: "Bujías", precioDistri: 12800, precioProveedor: 10900, proveedor: "competencia" },
  { codigo: "NGK-ILTR5A-13G", descripcion: "Bujía Iridium Ford Focus", marca: "NGK", linea: "Bujías", precioDistri: 14500, precioProveedor: 12200, proveedor: "competencia" },
  { codigo: "NGK-DCPR8EIX", descripcion: "Bujía Iridium Fiat", marca: "NGK", linea: "Bujías", precioDistri: 13200, precioProveedor: 11500, proveedor: "competencia" },

  // NGK - Cables de bujía
  { codigo: "NGK-RC-VW046", descripcion: "Juego cables bujía VW Gol 1.6", marca: "NGK", linea: "Cables de bujía", precioDistri: 52000, precioProveedor: 45500, proveedor: "competencia" },
  { codigo: "NGK-RC-FD035", descripcion: "Juego cables bujía Ford Ka 1.6", marca: "NGK", linea: "Cables de bujía", precioDistri: 48000, precioProveedor: 43200, proveedor: "competencia" },

  // Gates - Correas
  { codigo: "GATES-5PK1150", descripcion: "Correa poly-v Chevrolet Corsa", marca: "Gates", linea: "Correas", precioDistri: 22000, precioProveedor: 19800, proveedor: "competencia" },
  { codigo: "GATES-5PK0875", descripcion: "Correa poly-v Fiat Palio", marca: "Gates", linea: "Correas", precioDistri: 18500, precioProveedor: 15900, proveedor: "competencia" },
  { codigo: "GATES-T297", descripcion: "Correa distribución VW Gol", marca: "Gates", linea: "Correas", precioDistri: 28000, precioProveedor: 24500, proveedor: "competencia" },
  { codigo: "GATES-T305", descripcion: "Correa distribución Fiat Siena", marca: "Gates", linea: "Correas", precioDistri: 31000, precioProveedor: 26800, proveedor: "competencia" },

  // Ferodo - Pastillas de freno
  { codigo: "FER-FDB1368", descripcion: "Pastillas freno del. VW Gol", marca: "Ferodo", linea: "Pastillas de freno", precioDistri: 32000, precioProveedor: 28500, proveedor: "competencia" },
  { codigo: "FER-FDB1544", descripcion: "Pastillas freno del. Ford Focus", marca: "Ferodo", linea: "Pastillas de freno", precioDistri: 38000, precioProveedor: 32800, proveedor: "competencia" },
  { codigo: "FER-FDB1636", descripcion: "Pastillas freno del. Toyota Corolla", marca: "Ferodo", linea: "Pastillas de freno", precioDistri: 41000, precioProveedor: 36200, proveedor: "competencia" },
  { codigo: "FER-FDB4218", descripcion: "Pastillas freno del. Chevrolet Cruze", marca: "Ferodo", linea: "Pastillas de freno", precioDistri: 44000, precioProveedor: 39600, proveedor: "competencia" },
];
