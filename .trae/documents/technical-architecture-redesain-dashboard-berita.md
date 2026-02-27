## 1.Architecture design
```mermaid
graph TD
  A["User Browser"] --> B["React Frontend Application"]
  B --> C["Existing Data API (Berita)"]

  subgraph "Frontend Layer"
    B
  end

  subgraph "Service Layer"
    C
  end
```

## 2.Technology Description
- Frontend: React@18 + TypeScript + vite
- Styling/UI: tailwindcss@3 (atau sistem token CSS yang sudah ada di website)
- Backend: None (redesign UI saja; konsumsi sumber data yang sudah ada)

## 3.Route definitions
| Route | Purpose |
|-------|---------|
| /dashboard/berita | Halaman Dashboard Berita dengan mode list/grid/table dan state UI (loading/empty/error) yang responsif dan aksesibel |
