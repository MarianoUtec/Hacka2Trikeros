# TropelCare Control Room

> Hackathon Frontend · Pizza Protocol

## Integrantes

<!-- Completa con los nombres y códigos del equipo -->
- Mariano Arce — código
- Sebastian C — código
- Fabricio Cruz — código

## Deploy

🔗 **[Link del deploy](<URL_AQUI>)**

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores que el TA te entregó:

```bash
cp .env.example .env.local
```

```env
VITE_API_BASE_URL=https://<backend-url>/api/v1
```

## Comandos

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run typecheck  # Verificar tipos sin compilar
npm run preview    # Preview del build
```

## Arquitectura y decisiones técnicas

### Stack
- **React 18 + TypeScript** estricto, componentes `.tsx`
- **Vite** para bundling
- **React Router v6** para navegación y estado en URL
- **Tailwind CSS** para estilos (sin clases de terceros)
- **Axios** para peticiones HTTP

### Checkpoints implementados

**CP1 — Login y sesión**  
Login con `teamCode + email + password`, JWT guardado en `localStorage`, restauración via `/auth/me` al recargar, `RequireAuth` guard en rutas privadas.

**CP2 — Atlas de Tropeles**  
Paginación real del servidor, filtros combinables (especie, estado vital, sort, tamaño de página, búsqueda con debounce), todos reflejados en URL con `useSearchParams`. Cancela requests obsoletas con `AbortController`.

**CP3 — Feed infinito**  
`useSignalFeed` hook con cursor-based infinite scroll via `IntersectionObserver`. Deduplicación por ID, una sola request en vuelo (`inFlightRef`), filtros en URL, recuperación de error sin borrar páginas previas.

**CP4 — Atender señales**  
Detalle con carga real, botones PATCH deshabilitados durante vuelo, manejo de error con botón de reintento, conservación del `scrollY` al volver al feed.

**CP5 — Sector Story Engine**  
Layout sticky left/right en desktop. Narrativa por etapas activadas via `IntersectionObserver` (threshold 0.5). Visual persistente que cambia por opacidad. Navegación por teclado (↑↓). View Transition API para la navegación de vuelta. `prefers-reduced-motion` respetado via CSS global. Fallback funcional cuando no hay soporte.
