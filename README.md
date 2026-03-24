# Proxyra

Proxyium-style web proxy replica with:

- `frontend/`: React + TypeScript + Tailwind landing page built with pnpm/Vite
- `backend/`: Rust + Rocket proxy service that fetches upstream pages and rewrites HTML links back through `/proxy`

## Folder structure

```text
.
├── backend
│   ├── Cargo.toml
│   └── src
│       └── main.rs
├── frontend
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── public
│   │   └── .gitkeep
│   ├── src
│   │   ├── App.tsx
│   │   ├── components
│   │   ├── index.css
│   │   ├── lib
│   │   ├── main.tsx
│   │   └── pages
│   ├── tailwind.config.cjs
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── README.md
```

## Local development

Create `.env` files for each side (already included in the repo):
- `backend/.env`: `ROCKET_ADDRESS=0.0.0.0`, `ROCKET_PORT=8000`
- `frontend/.env`: `VITE_BACKEND_URL=http://127.0.0.1:8000`

Backend:

```bash
cd backend
cargo run --release
```

In another terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://127.0.0.1:5173`.

The frontend now reads the backend URL from `VITE_BACKEND_URL` in `.env`, and the backend reads Rocket config from `ROCKET_ADDRESS` / `ROCKET_PORT` (or `PORT` for deploys).
## Notes

- The backend supports `GET /health`, `GET /proxy`, and `POST /proxy`.
- HTML responses are rewritten so links, forms, scripts, and assets continue loading through the proxy route.
- Some websites may still resist proxying because of CSP, bot checks, or advanced client-side protections.
