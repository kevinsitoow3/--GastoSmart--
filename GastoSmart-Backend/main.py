from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from contextlib import asynccontextmanager

# Importar conexión a MongoDB
from database.connection import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejar el ciclo de vida de la aplicación"""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Crear aplicación FastAPI
app = FastAPI(
    title="GastoSmart API",
    description="API para el sistema de gestión de gastos GastoSmart",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos del frontend
app.mount("/static", StaticFiles(directory="../Front-end"), name="static")

# Ruta para servir el frontend
@app.get("/")
async def read_index():
    return FileResponse("../Front-end/html/index.html")

# Rutas específicas para cada página HTML
@app.get("/login")
async def read_login():
    return FileResponse("../Front-end/html/login.html")

@app.get("/initial-budget")
async def read_initial_budget():
    return FileResponse("../Front-end/html/initial-budget.html")

@app.get("/password-reset")
async def read_password_reset():
    return FileResponse("../Front-end/html/password-reset.html")

@app.get("/verify-recovery-code")
async def read_verify_recovery_code():
    return FileResponse("../Front-end/html/verify-recovery-code.html")

@app.get("/dashboard")
async def read_dashboard():
    return FileResponse("../Front-end/html/dashboard.html")

@app.get("/budget")
async def read_budget():
    return FileResponse("../Front-end/html/budget.html")

@app.get("/goals")
async def read_goals():
    return FileResponse("../Front-end/html/goals.html")

@app.get("/reports")
async def read_reports():
    return FileResponse("../Front-end/html/reports.html")

@app.get("/settings")
async def read_settings():
    return FileResponse("../Front-end/html/settings.html")

@app.get("/{path:path}")
async def read_frontend(path: str):
    # Verificar si es un archivo HTML
    if path.endswith('.html'):
        file_path = f"../Front-end/html/{path}"
        if os.path.exists(file_path):
            return FileResponse(file_path)
    
    # Si no es HTML, intentar servir como archivo estático
    static_path = f"../Front-end/{path}"
    if os.path.exists(static_path):
        return FileResponse(static_path)
    
    # Si no existe, devolver el index
    return FileResponse("../Front-end/html/index.html")

# Ruta de prueba
@app.get("/api/test")
async def test_api():
    return {"message": "¡GastoSmart API funcionando!", "status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)