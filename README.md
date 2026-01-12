## SentraIQ – Local Development (Frontend & Backend)

This document explains how to run the **SentraIQ Evidence Lakehouse** locally, mirroring the production architecture:

- **Frontend**: React + Vite (Vercel in production)
- **Backend**: FastAPI + Python 3.11 (Render.com in production)
- **Database**: SQLite by default for local development (PostgreSQL in production)

For local development, we will run:

- **Backend API** on `http://localhost:8080`
- **Frontend UI** on `http://localhost:8081`

---

## 1. Prerequisites

- **Python**: 3.11 (or compatible 3.10+)
- **Node.js**: v18+ (recommended) with `npm`
- OS: Linux/macOS/WSL (commands below are for bash)

Project root (where this file lives):

```bash
cd /root/sai/SentraIQ-main/SentraIQ-main
```

---

## 2. Backend – FastAPI on port 8080

### 2.1. Create & activate virtual environment

```bash
cd /root/sai/SentraIQ-main/SentraIQ-main

python3 -m venv .venv
source .venv/bin/activate
```

### 2.2. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.3. (Optional) Configure `.env`

Create `.env` in `SentraIQ-main/` (same folder as `backend/config.py`) if you want to override defaults:

```bash
cd /root/sai/SentraIQ-main/SentraIQ-main

cat > .env << 'EOF'
ENVIRONMENT=development
# DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname  # (optional) use Postgres instead of SQLite
# OPENAI_API_KEY=sk-...                                         # (optional) enable AI features
EOF
```

If you skip this, sensible defaults are used:

- SQLite database file `sentraiq.db` in the project root.
- `ENVIRONMENT="development"` (enables auto‑reload when run as a module).

### 2.4. Run backend on port 8080

From `SentraIQ-main/` with venv **activated**:

```bash
cd /root/sai/SentraIQ-main/SentraIQ-main

uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload
```

Key URLs:

- Health check: `http://localhost:8080/health`
- API docs (Swagger UI): `http://localhost:8080/docs`
- Base API prefix: `http://localhost:8080/api/v1/...`

This mirrors production:

- Render.com → `https://sentraiq.onrender.com` → local `http://localhost:8080`

---

## 3. Frontend – React/Vite on port 8081

### 3.1. Install frontend dependencies

```bash
cd /root/sai/SentraIQ-main/SentraIQ-main/frontend/sentraiq-dashboard

npm install
```

### 3.2. Configure API base URL

The frontend uses `VITE_API_URL` to reach the FastAPI backend. Set it to your local backend URL:

```bash
cd /root/sai/SentraIQ-main/SentraIQ-main/frontend/sentraiq-dashboard

cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:8080
EOF
```

This makes all API calls go to:

- `http://localhost:8080/api/v1/...`

which mirrors production:

- Vercel → `https://sentraiq.vercel.app` → calls Render API at `https://sentraiq.onrender.com/api/v1/...`

### 3.3. Run Vite dev server on port 8081

The default Vite port is 3000, but we explicitly run on **8081**:

```bash
cd /root/sai/SentraIQ-main/SentraIQ-main/frontend/sentraiq-dashboard

npm run dev -- --host 0.0.0.0 --port 8081
```

Now open:

- Frontend UI: `http://localhost:8081/`

The UI should connect to the backend at `http://localhost:8080`.

---

## 4. Quick start (summary)

From the project root `SentraIQ-main/`:

- **Backend (terminal 1)**:

  ```bash
  cd /root/sai/SentraIQ-main/SentraIQ-main
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload
  ```

- **Frontend (terminal 2)**:

  ```bash
  cd /root/sai/SentraIQ-main/SentraIQ-main/frontend/sentraiq-dashboard
  npm install
  echo "VITE_API_URL=http://localhost:8080" > .env.local
  npm run dev -- --host 0.0.0.0 --port 8081
  ```

You now have the full SentraIQ stack running locally:

- **API**: `http://localhost:8080` (`/health`, `/docs`, `/api/v1/*`)
- **Dashboard**: `http://localhost:8081`

