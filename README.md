# WebViewer V2 FrontEnd

A modern Web GIS frontend built with **React**, **TypeScript**, **Vite**, and **Leaflet**. This application provides the user interface for managing GIS projects, basemaps, layers, and styles—integrated with the WebViewer V2 backend.

---

## ✨ Features

- **Page Routing** via React Router (Projects, Layers, Basemaps, Styles, etc.)
- **JWT Authentication** via `AuthContext` and secure API wrappers
- **Interactive Map Viewer** with Leaflet and clustering support via `MapContext`
- **Material UI (MUI)** theme customization (palettes, typography)
- **Reusable Components** for tables, forms, and modals (in `src/components`)
- **Typed API Services** using Axios wrappers (`src/services`)

---

## 📁 Project Structure

```
WebViewer-V2-FrontEnd/
├── public/                         # Static assets
├── src/
│   ├── assets/                     # Images and icons
│   ├── components/                 # Shared UI components
│   ├── config/                     # API and map config constants
│   ├── context/                    # React Contexts (Auth, Map)
│   ├── pages/                      # Feature pages (Projects, Layers, etc.)
│   ├── services/                   # API service wrappers
│   ├── styles/                     # Global styles
│   ├── theme/                      # MUI theme setup
│   ├── types/                      # Global TypeScript types
│   ├── utils/                      # Utility functions
│   ├── App.tsx                     # App routes and layout
│   └── main.tsx                    # Entry point
├── index.html                      # Vite HTML template
├── vite.config.ts                  # Vite config
└── package.json                    # Scripts and dependencies
```

---

## 🔧 Configuration

Set environment variables in a `.env` file at the project root:

```ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_USE_MOCK_API: string;
  readonly VITE_ANALYTICS_ID: string;
  readonly VITE_MAX_UPLOAD_SIZE: string;
}
```

These are loaded by Vite at build/startup time.

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

### 5. Lint the codebase

```bash
npm run lint
```

> Script definitions are located in `package.json`

---

## 🗺️ Map Viewer

- Built with **Leaflet** and managed via `MapContext` and `MapContainer`
- Fetches **basemaps**, **layers**, and **tools** from the backend
- `MapToolbar`, `LayerControl`, `BasemapControl` provide interactive map tools

- Main Client Deliverable - Standalone Viewer
---

## 🔍 Explore More

- Browse `src/services/` for backend integration
- Dive into `src/components/map/` for custom controls
- Each feature (Projects, Layers, Clients) is under `src/pages/`
- Tweak global styling in `src/theme/`

---

> Pairs with the [WebViewer V2 Backend](../WebViewer-V2-BackEnd) to deliver a full-featured Web GIS platform.

