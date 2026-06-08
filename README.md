# Comparador de Precios — Distrisuper vs Competencia

Aplicación web para comparar precios de productos entre Distrisuper y la competencia, agrupados por marca y línea.

## Stack

- React 19
- Vite 8
- Tailwind CSS 4

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173/`.

## Build de producción

```bash
npm run build
npm run preview
```

## Funcionalidades

- Carga manual de productos (marca, línea, código, descripción, precio Distrisuper, precio Competencia)
- Agrupación automática por marca + línea
- Cálculo de diferencia porcentual entre precios
- Persistencia en `localStorage`
- Filtros por marca y línea
- Edición y eliminación de productos individuales o grupos completos
