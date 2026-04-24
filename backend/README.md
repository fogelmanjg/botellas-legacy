# Botellas backend

Minimal Express + TypeORM backend scaffold for the "botellas" app.

Quick start (from `backend` folder):

```bash
# install deps
npm install

# copy .env.example to .env and edit if needed
npx cross-env-shell "" || true

# run in dev mode
npm run dev
```

API endpoints:
- `GET /health` - health check
- `POST /bottles` - create bottles (body: `{ count: number, specialSpaces: number }`)
- `GET /bottles` - list saved bottles
