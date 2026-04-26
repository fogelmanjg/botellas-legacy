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

Configuration for remote DB
---------------------------

The backend reads database connection values from environment variables. Copy `./.env.example` to `./.env` and update values as needed. To point to the server `jg-server` use:

```
DB_HOST=jg-server
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=botellas
PORT=3000
```

Running migrations
------------------

To apply TypeORM migrations against the configured database run from the `backend` folder:

```bash
# ensure env is set (or create .env)
npm run migration:run
```

If the remote `jg-server` requires different credentials, export them as environment variables before running the commands, for example in PowerShell:

```powershell
$env:DB_HOST = 'jg-server'
$env:DB_USER = 'postgres'
$env:DB_PASS = 'yourpassword'
$env:DB_NAME = 'botellas'
npm run migration:run
```

API endpoints:
- `GET /health` - health check
- `POST /bottles` - create bottles (body: `{ count: number, specialSpaces: number }`)
- `GET /bottles` - list saved bottles
