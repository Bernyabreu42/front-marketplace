# CONTINUE.md - Marketplace Frontend

This document provides a comprehensive guide for developers working on the Marketplace Frontend project. It covers the project's architecture, development workflow, and key concepts to help you get started and contribute effectively.

## 1. Project Overview

The Marketplace Frontend is a web application that provides the user interface for a multi-faceted e-commerce platform. It includes separate dashboards and functionalities for Buyers, Sellers, and Administrators. The application is built as a single-page application (SPA).

### Key Technologies

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **State Management:** TanStack Query v5 (for server state) & React Context (for global UI state)
- **Styling:** Tailwind CSS with Shadcn/ui components
- **Linting:** ESLint
- **Rich Text:** Quill.js

### High-Level Architecture

The application is structured around a feature-based architecture. The main components are:

- **`src/pages`**: Contains layout components and authentication forms.
- **`src/features`**: Contains the core business logic, UI, and routes for different user roles (Admin, Buyer, Seller).
- **`src/components`**: Contains shared, reusable UI components.
- **`src/api`**: Handles communication with the backend API.
- **`src/auth`**: Manages authentication logic and protected routes.
- **`src/query`**: Configures the TanStack Query client.

## 2. Getting Started

Follow these instructions to set up your local development environment.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Bun](https://bun.sh/) (as `bun.lock` is present) or `npm`/`yarn`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd front-marketplace
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    # or
    npm install
    ```

3.  **Set up environment variables:**
    Copy the `.env.example` file to a new file named `.env` and fill in the required environment variables (e.g., API endpoint).
    ```bash
    cp .env.example .env
    ```

### Running the Application

To start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Running Tests

The project uses ESLint for linting. To run the linter:

```bash
bun run lint
```

*(Note: No specific testing framework like Jest or Vitest is configured in `package.json`. Tests may need to be added.)*

## 3. Project Structure

The codebase is organized into the following main directories:

- **`.continue/`**: Contains configuration for the Continue extension, including this guide.
- **`public/`**: Static assets that are publicly accessible.
- **`src/`**: The main application source code.
  - **`api/`**: Functions for making API requests to the backend.
  - **`auth/`**: Authentication context (`AuthContext.tsx`) and route protection (`ProtectedRoute.tsx`).
  - **`components/`**: Shared UI components (`Layout.tsx`, `StatCard.tsx`, etc.) and Shadcn/ui components.
  - **`enums/`**: TypeScript enums, like `RolesEnum.ts`.
  - **`features/`**: The core of the application, with subdirectories for each user role (`admin`, `buyer`, `seller`). Each feature folder contains pages, components, and API logic specific to that role.
  - **`hooks/`**: Reusable custom React hooks.
  - **`lib/`**: Utility functions.
  - **`pages/`**: Top-level pages and layouts, primarily for authentication.
  - **`query/`**: Configuration for TanStack Query.
  - **`types/`**: Global TypeScript type definitions.

### Key Files

- **`vite.config.ts`**: Vite build configuration, including the `@` path alias for `src/`.
- **`tailwind.config.cjs`**: Tailwind CSS configuration.
- **`src/main.tsx`**: The application entry point where the React app is initialized and providers are set up.
- **`src/App.tsx`**: Defines the application's routing structure using `react-router-dom`.

## 4. Development Workflow

### Coding Standards

- Follow the existing code style and conventions.
- Use the `@/` alias for imports from the `src` directory (e.g., `import { Button } from "@/components/ui/button";`).
- Keep components small and focused on a single responsibility.
- Define component-specific types within the component file or in a `types.ts` file within the same feature directory.

### API Layer

- API requests are managed using functions that encapsulate `fetch` calls, as seen in files like `src/api/auth.ts`.
- Use TanStack Query for server state management (fetching, caching, updating data). Define query keys and mutation functions in the relevant `features/.../api.ts` or `features/.../hooks.ts` files.

### Contribution Guidelines

1.  Create a new branch for your feature or bug fix.
2.  Implement your changes, adhering to the coding standards.
3.  Ensure the code lints successfully (`bun run lint`).
4.  (If applicable) Add or update tests for your changes.
5.  Submit a pull request with a clear description of the changes.

## 5. Key Concepts

### Role-Based Access Control (RBAC)

The application uses a `ProtectedRoute` component to manage access to different parts of the dashboard based on user roles (`admin`, `seller`, `buyer`). The allowed roles are passed as a prop to the `ProtectedRoute` in `src/App.tsx`.

### Feature-Based Structure

The code is organized by feature/domain rather than by file type. For example, everything related to seller products (pages, API calls, types) is located in `src/features/seller/`. This makes it easier to locate and work on related code.

### Server State Management

TanStack Query is the primary tool for managing data from the server. It handles caching, background refetching, and data mutations. When working with backend data, you should use hooks like `useQuery` and `useMutation`.

## 6. Common Tasks

### Adding a New Page to a Dashboard

1.  Create a new component for the page in the appropriate feature directory (e.g., `src/features/seller/NewPage.tsx`).
2.  Export the component.
3.  Open `src/App.tsx`.
4.  Import your new page component.
5.  Add a new route definition within the appropriate dashboard section (e.g., under the `path: "seller"` children array).

### Creating a Shared Component

1.  Create the component file in `src/components/`.
2.  Build the component using existing primitives from `src/components/ui/` if possible.
3.  Export the component from its file.
4.  Import and use it wherever needed in the application.

### Adding a New API Endpoint

1.  Add a new function to the relevant API file in `src/api/` or a feature-specific `api.ts`.
2.  Create a custom hook (e.g., `useNewData`) in the feature's `hooks.ts` file that uses `useQuery` or `useMutation` to call the new API function.
3.  Use the custom hook in your components to access or modify the data.

## 7. Troubleshooting

- **Invalid API Host**: If you are getting network errors, ensure the `VITE_API_URL` in your `.env` file is correct and the backend server is running and accessible.
- **Styling Issues**: If Tailwind CSS classes are not being applied, check that the file is included in the `content` array in `tailwind.config.cjs` and that the development server is running.
- **Type Errors**: The project uses TypeScript. If you encounter type errors, ensure your data structures match the defined types in the `types/` or feature-specific `types.ts` files.

## 8. References

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
