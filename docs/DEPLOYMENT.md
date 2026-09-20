# ReadmitFlow Deployment Guide

This guide details step-by-step instructions to deploy **ReadmitFlow**:
- **Backend API**: Deployed to [Render](https://render.com) using Docker containerization.
- **Frontend Dashboard**: Deployed to [Vercel](https://vercel.com) using Next.js native deployment.
- **Local Containerization**: Orchestrated locally via Docker Compose.

---

## 1. Backend Deployment (Render)

The FastAPI backend is fully containerized via `backend/Dockerfile` and supports dynamic port binding (`$PORT`) required by Render.

### Option A: Automatic Blueprint Deployment (Recommended)
1. Push your latest code to your GitHub repository.
2. Log into your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository (`ReadmitFlow`).
5. Render will automatically detect the root `render.yaml` and configure the web service:
   - **Docker Context**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Health Check Path**: `/health`
   - **Environment Variables**:
     - `DEMO_ONLY`: `true`
     - `ALLOWED_ORIGINS`: `https://<your-vercel-app-name>.vercel.app,http://localhost:3000`
6. Click **Apply**. Render will build the Docker container and deploy the service.

### Option B: Manual Web Service Deployment
1. Log into [Render Dashboard](https://dashboard.render.com) -> Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Select **Docker** environment.
4. Set **Root Directory**: `backend`.
5. Set **Dockerfile Path**: `Dockerfile`.
6. Add Environment Variables:
   - `DEMO_ONLY`: `true`
   - `ALLOWED_ORIGINS`: `*` (or your Vercel URL)
7. Set **Health Check Path**: `/health`.
8. Click **Create Web Service**.

Once deployed, copy your Render backend URL (e.g., `https://readmitflow-backend.onrender.com`).

> **Note:** Render free tier has cold-start latency of up to ~5 seconds. The frontend API client has an 8-second timeout to accommodate this.

---

## 2. Frontend Deployment (Vercel)

The Next.js frontend is configured for deployment on Vercel.

### Deployment Steps
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`ReadmitFlow`).
4. Set **Root Directory**: Select `frontend`.
5. Environment Variables:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://<your-render-backend-name>.onrender.com` (Your deployed Render URL from Step 1)
6. Framework Preset: **Next.js** (Auto-detected via `frontend/vercel.json`).
7. Click **Deploy**.

### Fallback behavior

If the backend is unreachable (e.g., Render cold start, network issues), the frontend automatically falls back to built-in mock patients. The demo always works regardless of backend availability.

---

## 3. Local Containerized Execution (Docker Compose)

To test both frontend and backend in isolated containers locally:

```bash
# Build and launch containers
docker compose up --build

# Backend Health Check: http://localhost:8000/health
# Backend API Docs:     http://localhost:8000/docs
# Frontend Dashboard:    http://localhost:3000
```

To stop local containers:
```bash
docker compose down
```

The `docker-compose.yml` configures:
- Backend on port 8000 with health checks (`/health` every 15s)
- Frontend on port 3000, depends on backend health
- CORS origins include both `localhost` and the container network hostname

---

## 4. Local Development (Without Docker)

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env.local` and set:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 5. Environment Variables Reference

| Component | Variable Name | Recommended Value | Description |
| :--- | :--- | :--- | :--- |
| **Backend** | `DEMO_ONLY` | `true` | Enforces demo safety label boundary |
| **Backend** | `ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:3000` | Allowed CORS origins (comma-separated) |
| **Backend** | `PORT` | Set automatically by Render (`8000`) | Server binding port |
| **Frontend** | `NEXT_PUBLIC_API_URL` | `https://<your-render-backend-name>.onrender.com` | Deployed backend service endpoint |

---

## 6. Pre-Demo Verification

After deployment, verify the following:

1. **Backend health**: `curl https://<backend-url>/health` returns `{"status": "ok", "demo_only": true, ...}`
2. **API docs**: Visit `https://<backend-url>/docs` for interactive Swagger documentation.
3. **Frontend loads**: Visit the Vercel URL; the Command Center should show patient data.
4. **Fallback works**: Disconnect the backend and verify the frontend still shows mock patients.
5. **Handoff export**: Open a patient, click Handoff, and download a PDF.
6. **Reset demo**: Use the Reset Demo control and verify state returns to defaults.
