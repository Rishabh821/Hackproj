# Bus Tracker

This folder is the single app root for the project.

## What is inside

- React + Vite student tracker at `/`
- React admin dashboard at `/admin`
- FastAPI backend in `main.py`
- Driver console served by the backend at `/driver`
- Shared route metadata in `shared/routes.json`

## Setup

1. Create or activate a Python environment.
2. Install backend packages:

```bash
pip install -r requirements.txt
```

3. Copy the environment file and load it into your shell:

```bash
cp .env.example .env
set -a
source .env
set +a
```

4. Start the backend:

```bash
python3 main.py
```

5. In another terminal, start the frontend:

```bash
npm install
npm run dev
```

## Default local URLs

- Student tracker: `http://127.0.0.1:5173/`
- Admin dashboard: `http://127.0.0.1:5173/admin`
- Driver console: `http://127.0.0.1:8000/driver?bus_id=BUS101&token=demo-driver-token`

The admin dashboard expects the token from `.env` or `.env.example`. The default token is `demo-admin-token`.

## Commands

- `npm run dev` starts the Vite frontend
- `npm run backend` starts the FastAPI backend
- `npm run lint` checks the frontend
- `npm run build` builds the frontend
- `npm run test:frontend` runs route utility tests
- `npm run test:backend` runs backend integration tests
