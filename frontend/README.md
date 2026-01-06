# Electronics POS — Frontend 📱

This folder contains the React + Vite frontend for the Electronics POS application. The UI is built with React (v19), routed with React Router, styled with Tailwind, and communicates with the backend API using Axios.

---

## 🚀 Quick start

- Install dependencies:

```bash
cd frontend
npm install
```

- Run development server (hot reload, Vite):

```bash
npm run dev
```

- Build for production:

```bash
npm run build
```

- Preview the production build locally:

```bash
npm run preview
```

- Run linter:

```bash
npm run lint
```

> Note: The frontend expects the backend server to be running (see `../backend`). Set the API base URL in an environment variable (example below).

---

## 🧰 Tech stack

- **Vite** — dev server and build tool
- **React** — UI library
- **React Router** — client-side routing
- **Axios** — HTTP client
- **Tailwind CSS** — utility-first styling
- **ESLint** — linting

---

## 📁 Project structure (frontend)

Top-level files you’ll interact with:

- `index.html` — Vite entry HTML
- `src/main.jsx` — mounts React app and applies global providers
- `src/App.jsx` — root routes and layout
- `src/index.css`, `src/App.css` — global styles
- `src/assets/` — images and static frontend assets

Important folders:

- `src/components/` — reusable UI components
  - `ErrorBoundary.jsx` — catches rendering errors and shows fallback UI
  - `Loading.jsx` — small loading indicator used across pages
  - `PageNav.jsx` — top navigation component used by dashboards and pages
  - `ProtectedRoute.jsx` — enforces authentication and role-based access control for routes
  - `ToastProvider.jsx` — provides global toast notifications

- `src/pages/` — route components (each file corresponds to a route/view)
  - `Login.jsx` — authentication form
  - `Products.jsx` — product listing and search
  - `ProductDetails.jsx` — single product view
  - `AddProduct.jsx` / `AdminProducts.jsx` — admin product management
  - `Cart.jsx` / `Checkout.jsx` — cart and checkout flow
  - `Orders.jsx`, `Sales.jsx` — order and sales views
  - `Profile.jsx` — user profile
  - `Support.jsx` — help / support page
  - `ClientDashboard.jsx`, `TellerDashboard.jsx`, `AdminDashboard.jsx` — dashboards for different roles


---

## 🔌 How the frontend works (overview)

- On app start, `main.jsx` mounts the app and wraps it with any global providers (e.g., `ToastProvider`).
- `App.jsx` defines application routes and uses `ProtectedRoute` for routes requiring authentication or specific roles (Admin, Teller, Client).
- The app communicates with the backend API via **Axios**. Typical requests include product CRUD (admin), fetching product lists, creating sales/orders, and user profile updates.
- Tailwind is used for most styling; you can modify Tailwind config in the project root.
- Error states are caught by `ErrorBoundary` and transient UI states show `Loading` to indicate progress.

---

## ⚙️ Environment variables

Create a `.env` file at the `frontend/` root (or use system env vars). Common variable:

```bash
VITE_API_URL=https://localhost:5000/api
```

Use `import.meta.env.VITE_API_URL` in code to access this value.

---

## 🧩 Development notes & guidelines

- Add new pages to `src/pages/` and wire them in `src/App.jsx` (routes).
- Keep UI logic in components under `src/components/` and page-specific logic in `src/pages/`.
- Use `ToastProvider` for user-facing notifications and `ErrorBoundary` for unexpected errors.
- For file uploads / product images, the backend serves images from its `public/` folder; the frontend references them by URL.

---

## ✅ Scripts (from `package.json`)

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview build locally
- `npm run lint` — run ESLint

---

## 🔐 Security & Roles

The frontend enforces route access via `ProtectedRoute` and checks user roles before rendering role-specific UI. Server-side role enforcement is handled in the backend, so the frontend should never be the only access-control mechanism relied upon.

---

## 🧾 Credits & License

**Developed by:** Oswald Nelson Adjetey Adjei

**Supervisor:** Williams Anaba A. — RIM Institute

Please see the project root for the repository license and any contributor acknowledgments.

---

## 💡 Need help or want to contribute?

- For API changes, update the backend in `../backend` and coordinate any contract changes (endpoints/payloads) with the frontend.
- If you add new endpoints, update the corresponding frontend services that use Axios to point to the new paths.

---

**Enjoy developing!** ⚡
