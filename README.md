# jwt-auth-login-system (Mini Project)

## Docker / Local development using Docker Compose

This project uses a Node.js + Express backend with SQLite and JWT-based authentication, and a static frontend.

### Prerequisites
- Docker (Engine) and Docker Compose installed
- Optionally, GitHub Actions will run CI on pushes/PRs to `main`

### Quick start (development)
1. Create an `.env` file in the project root (optional) with values for secrets:

   JWT_SECRET=supersecretreplace
   DB_PATH=/data/database.sqlite

2. Build and start services with Docker Compose:

```powershell
# from the project root
docker-compose up --build
```

- Backend will be available at: http://localhost:4000
- Frontend (static via nginx) will be available at: http://localhost:8080

Notes:
- The backend Dockerfile is located at `Backend/Dockerfile` and exposes port 4000.
- The backend image is optimized for caching (copies package.json first, installs production deps).
- SQLite DB file is persisted to the Docker volume `db_data` mapped to `/data` inside the container. You can override `DB_PATH` to a host path if needed.

### Production / image build
To build the backend image manually (no push):

```powershell
# from project root
docker build -f Backend/Dockerfile -t my-app-backend:latest Backend
```

### GitHub Actions (CI)
A workflow is provided at `.github/workflows/ci.yml`.
- Runs on push and pull_request to `main`.
- Steps performed:
  - Checkout
  - Setup Node.js 18
  - npm ci (in `Backend`)
  - npm test (in `Backend`) — your `Backend/package.json` should include a `test` script
  - Build Docker image for the backend and run a simple smoke test
- A placeholder `deploy` job is included; update it to push the built image to your container registry (Docker Hub, GitHub Container Registry, etc.) and deploy to your chosen host (Render, Railway, Vercel, etc.).

### Setting environment variables / secrets
- Locally: use a `.env` file at project root referenced by `docker-compose.yml`.
- On GitHub: add `JWT_SECRET` and other sensitive vars as repository Secrets (Settings -> Secrets -> Actions). The CI workflow can be extended to use these secrets when building/pushing/deploying.

### Tips and best practices
- Keep secrets out of source control; never commit `.env` files containing real secrets.
- For smaller images in production, consider using a distroless base or further multi-stage optimizations if you add build steps.
- Add a `HEALTH` endpoint to the backend (e.g., `/health`) so CI smoke tests can reliably check service readiness.

### Next steps / deployment
- Add a registry push step to `deploy` job (authenticate using GitHub Secrets) and deploy to a provider (Render, Railway, DigitalOcean App Platform, etc.).
- Add unit/integration tests to the backend and ensure `npm test` returns non-zero on failures.

