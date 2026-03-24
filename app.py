from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import aiosqlite
import os

app = FastAPI(
    title="Portfolio API",
    description="Backend do portfólio pessoal",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "visitors.db"


# ── Inicializa o banco ao subir ──────────────────────
async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS visitors (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()


@app.on_event("startup")
async def startup():
    await init_db()


# ── Rotas ────────────────────────────────────────────
@app.post("/api/visit", summary="Registra visita e retorna total")
async def register_visit():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("INSERT INTO visitors DEFAULT VALUES")
        await db.commit()
        async with db.execute("SELECT COUNT(*) FROM visitors") as cursor:
            row = await cursor.fetchone()
    return {"count": row[0]}


@app.get("/api/visitors", summary="Retorna total de visitantes")
async def get_visitors():
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM visitors") as cursor:
            row = await cursor.fetchone()
    return {"count": row[0]}


# ── Serve o frontend estático ────────────────────────
if os.path.exists("index.html"):
    @app.get("/", include_in_schema=False)
    async def root():
        return FileResponse("index.html")

    app.mount("/", StaticFiles(directory="."), name="static")
