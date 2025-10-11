# PROJECT_GUIDE

## 1. Project Overview
- Purpose: Frontend for a multi-role marketplace console that serves admins, sellers, buyers, and support staff through dedicated dashboard areas.
- Key technologies: React 19, TypeScript, Vite 7, TanStack Query 5, React Router 7, Tailwind CSS, shadcn/ui (Radix primitives), lucide-react icons, Sonner toasts, and Quill for rich text editing.
- High-level architecture: Single-page application bootstrapped in `src/main.tsx`, routing defined in `src/App.tsx`, data access centralized in `src/api`, and business capabilities grouped under `src/features` with React Query hooks and shadcn-based UI components.

## 2. Getting Started
### Prerequisites
- Node.js 20+ LTS (needs verification with your deployment target).
- Package manager: npm (default via `package-lock.json`) or Bun 1.1+ (optional, inferred from `bun.lock`). Pick one and stay consistent.
- Backend API reachable at `VITE_API_BASE_URL`; supports optional Basic Auth headers (`VITE_API_BASIC_USER`, `VITE_API_BASIC_PASSWORD`).

### Installation
1. Copy environment template: `cp .env.example .env` (or Windows equivalent).
2. Populate API credentials in `.env`.
3. Install dependencies with `npm install` (or `bun install`).

### Running the app
- Start dev server: `npm run dev` (opens Vite on http://localhost:5173 by default). Includes Hot Module Replacement.
- Lint before committing: `npm run lint`.
- Build production bundle: `npm run build` (runs `tsc -b` then `vite build`).
- Preview production build locally: `npm run preview`.

### Tests
- Automated tests are not yet configured. Consider adding React Testing Library and Vitest; integrate via `npm run test` once available.

## 3. Project Structure
- `src/main.tsx`: Application entry point; wires `QueryClientProvider`, `AuthProvider`, router, accessibility widget, and Sonner toasts.
- `src/App.tsx`: Central router map with role-gated sections via `ProtectedRoute` and `DashboardLayout`.
- `src/api/`: HTTP utilities (`client.ts`) and endpoint-specific helpers (`auth.ts`, `categories.ts`, feature APIs). `apiFetch` injects base URL, Basic Auth headers, JSON serialization, and consistent error handling.
- `src/auth/`: Authentication context (`AuthContext.tsx`), role types, and `ProtectedRoute` component that gates routes and handles loading/redirects.
- `src/components/`: Shared UI such as `DashboardLayout.tsx`, analytics cards, accessibility tooling, and shadcn/ui primitives under `src/components/ui`.
- `src/features/`: Feature-first modules (e.g., `admin`, `seller`, `buyer`, `dashboard`, `account`, `products`). Each mixes pages, hooks, API wrappers, and types tailored to the domain area.
  - Seller shipping lives in `src/features/seller/ShippingPage.tsx` (listing), `ShippingCreatePage.tsx`, `ShippingEditPage.tsx`, and shared form logic under `src/features/seller/shipping/ShippingMethodForm.tsx`.
- `src/pages/`: Layout-level pages (auth flows, dashboard landing, unauthorized page) that wrap feature components.
- `src/hooks/`: Reusable hooks (`use-debounce`, product editing helpers, image utilities).
- `src/lib/utils.ts`: Utility helpers including the Tailwind `cn` merger and API error parsing.
- `src/query/client.ts`: Shared TanStack Query client with default retry and refetch policies.
- `src/enums/`, `src/types/`: Domain enums (roles, statuses) and shared TypeScript interfaces (e.g., categories).
- `public/`: Static assets served by Vite.
- Configuration files: `package.json` scripts, `vite.config.ts` aliasing `@` to `src`, Tailwind theme in `tailwind.config.cjs`, `eslint.config.js` rules, TypeScript settings in `tsconfig.app.json`, shadcn config `components.json`, and environment templates `.env.example`.

## 4. Development Workflow
- Coding standards: TypeScript `strict` mode with linting via ESLint (`npm run lint`). Follow feature-folder organization and keep shared utilities colocated in `src/lib` or `src/hooks`.
- Styling: Tailwind CSS with CSS variables and `cn` helper; prefer shadcn/ui components for consistency. Extend Tailwind through `tailwind.config.cjs`.
- Data fetching: Use `apiFetch` for HTTP calls and wrap server state with TanStack Query hooks (`useQuery`, `useMutation`). Provide stable `queryKey`s (e.g., `['seller','shipping-methods',storeId]`) to enable targeted cache invalidation after create/update/delete flows.
- State and routing: Leverage `AuthProvider` for session data, `ProtectedRoute` for role checks, and nested routes under `/dashboard` aligning with user roles. Seller routes now include `/dashboard/seller/shipping`, `/dashboard/seller/shipping/new`, and `/dashboard/seller/shipping/:shippingId/edit`.
- Build and deployment: Run `npm run build`; deploy the generated `dist/` folder behind a static host/CDN. Ensure environment variables are set on the hosting platform and that the API supports cookie-based auth (credentials are included on fetch).
- Contribution guidelines (needs verification): Adopt feature branches, run lint/build before PRs, maintain Spanish copy where present, and document new feature modules with a local `guide.md` when helpful.

## 5. Key Concepts
- Roles and access control: `admin`, `support`, `seller`, `buyer` drive navigation, route access, and dashboards (`src/auth/ProtectedRoute.tsx`, `src/components/Layout.tsx`).
- Auth lifecycle: `AuthProvider` fetches `/api/auth/me`, exposes `login`, `logout`, `refresh`, and shares session state across the app.
- API wrapper: `apiFetch` centralizes base URL management, Basic Auth headers, JSON serialization, and standardized error handling for all modules.
- Server state management: Feature hooks (e.g., `src/features/dashboard/hooks.ts`, `src/features/seller/hooks.ts`) encapsulate TanStack Query usage to keep components declarative. The new `useStoreShippingMethods` hook aligns shipping with existing seller flows.
- UI composition: shadcn/ui primitives under `src/components/ui`, domain widgets (charts, tables) in `src/components`, and layout scaffolding in `DashboardLayout`.
- Domain entities: Users, stores, products, promotions, discounts, taxes, shipping methods, orders, loyalty metrics. Type definitions live alongside features (e.g., `src/features/admin/types.ts`, `src/features/seller/types.ts`, `src/features/users/types.ts`).

## 6. Common Tasks
- Creating a new data workflow:
  1. Add an API helper in the relevant feature module using `apiFetch`.
  2. Expose a React Query hook (`useQuery`/`useMutation`) with a descriptive `queryKey`.
  3. Consume the hook inside feature components and handle loading/error states with Sonner toasts and skeleton UI.
- Managing seller shipping methods:
  1. Listing happens in `SellerShippingPage` with `useStoreShippingMethods` and cache-key `['seller','shipping-methods',storeId]`.
  2. Creation usa `SellerShippingCreatePage` y `ShippingMethodForm`; invalida la cache al completar para refrescar la tabla.
  3. Edicion recurre a `SellerShippingEditPage` y el mismo formulario; la mutacion invalida tanto el detalle como la coleccion.
- Adding a dashboard route:
  1. Build the page component under `src/features/<area>/`.
  2. Register the route in `src/App.tsx` inside the appropriate `ProtectedRoute` block.
  3. If needed, append navigation metadata in `src/components/Layout.tsx` to surface the route in side menus.
- Introducing a shared UI component:
  1. Generate a shadcn/ui component (`npx shadcn@latest add <component>`), or handcraft it under `src/components/ui`.
  2. Wrap repetitive layouts in `src/components/` and export via barrel files for reuse.
- Configuring environment variables: Update `.env`, restart the dev server, and avoid committing secrets. Keep `.env.example` in sync when introducing new variables.

## 7. Troubleshooting
- Stuck on login loop: Ensure the backend sets cookies for the Vite dev origin and that `VITE_API_BASE_URL` is correct; check browser network logs.
- 401/403 on protected routes: Confirm Basic Auth credentials in `.env` and that the user role returned by `/api/auth/me` matches the route's `allowRoles`.
- Styles not applying: Verify `src/index.css` imports remain in `src/main.tsx` and that Tailwind content globs include new file locations.
- Build failures: Run `npm run lint` and `npm run build` locally to catch TypeScript/ESLint errors before deployment; inspect Vite output for missing env vars.
- React Query cache inconsistencies: Use the Devtools (enabled in dev) and manually call `queryClient.invalidateQueries` after mutations. Shipping flows already handle this; extend the pattern when you add new mutations.

## 8. References
- Application entry: `src/main.tsx`, `src/App.tsx`.
- Authentication: `src/auth/AuthContext.tsx`, `src/auth/ProtectedRoute.tsx`.
- API client: `src/api/client.ts`.
- Layout and navigation: `src/components/Layout.tsx`.
- Feature samples: `src/features/admin/`, `src/features/seller/`, `src/features/dashboard/`. Shipping examples viven en `src/features/seller/ShippingPage.tsx`, `ShippingCreatePage.tsx`, `ShippingEditPage.tsx`, y `shipping/ShippingMethodForm.tsx`.
- Configuration: `vite.config.ts`, `tailwind.config.cjs`, `tsconfig.app.json`, `eslint.config.js`.
- External docs: [React](https://react.dev/), [Vite](https://vitejs.dev/), [TanStack Query](https://tanstack.com/query/latest), [React Router](https://reactrouter.com/en/main), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Sonner](https://sonner.emilkowal.ski/).

---
Tip: Create additional `guide.md` or `rules.md` files inside feature folders when you need deeper, domain-specific runbooks.

## 9. Módulos de API del Frontend

Esta sección resume los puntos de interacción de la API del frontend, organizados por funcionalidad. Todos los módulos utilizan un cliente `apiFetch` centralizado (`/src/api/client.ts`) que gestiona la URL base, las cabeceras de autenticación y el manejo de errores.

### **APIs Globales (`/src/api`)**

*   **`auth.ts`**: Gestiona todos los flujos de autenticación de usuarios (login, registro, verificación, recuperación de contraseña).
*   **`categories.ts`**: Proporciona una función global para obtener todas las categorías de productos.

### **APIs de Administrador (`/src/features/admin/api.ts`)**

*   Gestiona los datos para el panel de administración.
*   **Usuarios**: Lectura y actualización de usuarios.
*   **Tiendas**: Lectura, actualización de estado y eliminación de tiendas.
*   **Productos**: Lectura de productos.
*   **Categorías**: CRUD completo para categorías.
*   **Impuestos**: Lectura de impuestos.
*   **Pedidos**: Lectura y actualización de estado de pedidos.

### **APIs de Comprador (`/src/features/buyer/api.ts`)**

*   Gestiona los datos para el panel del comprador.
*   **Pedidos**: Lectura de los pedidos del propio usuario.
*   **Lealtad**: Lectura de la cuenta de lealtad.

### **APIs de Dashboard (`/src/features/dashboard/api.ts`)**

*   Proporciona datos agregados y analíticas.
*   **Ventas**: Resumen y series temporales de ventas.
*   **Pedidos**: Resumen de estados de pedidos.
*   **Lealtad**: Resumen de puntos de lealtad.
*   **Productos**: Ranking de productos más vendidos.

### **APIs de Vendedor (`/src/features/seller/api.ts`)**

*   Conjunto completo de funciones para que los vendedores gestionen su tienda.
*   **Tienda**: Lectura y actualización de detalles e imágenes.
*   **Productos**: CRUD completo de productos.
*   **Productos Relacionados**: Gestión de productos relacionados.
*   **Promociones**: CRUD completo de promociones.
*   **Descuentos**: CRUD completo de descuentos.
*   **Impuestos**: CRUD completo de impuestos.
*   **Envíos**: CRUD completo de métodos de envío.
*   **Pedidos**: Lectura y actualización del estado de los pedidos de la tienda.
*   **Imágenes**: Subida de imágenes.

### **APIs de Usuario (`/src/features/users/api.ts`)**

*   Gestiona los datos del perfil de usuario.
*   **Perfil**: Lectura, actualización y eliminación de la cuenta de usuario.