from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import uvicorn
# Importar conexión a MongoDB
from database.connection import connect_to_mongo, close_mongo_connection

# Cargar variables de entorno
load_dotenv()

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
    description="API para el sistema de gestión de gastos GastoSmart - Colombia",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos del frontend
app.mount("/static", StaticFiles(directory="../Front-end"), name="static")

# Ruta para servir el frontend
@app.get("/")
async def read_index():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/signup.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

# Rutas específicas para cada página HTML
@app.get("/login")
async def read_login():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/login.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

@app.get("/initial-budget")
async def read_initial_budget():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/initial-budget.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

@app.get("/password-reset")
async def read_password_reset():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/password-reset.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

@app.get("/verify-recovery-code")
async def read_verify_recovery_code():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/verify-recovery-code.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

@app.get("/dashboard")
async def read_dashboard():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/dashboard.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

@app.get("/budget")
async def read_budget():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/budget.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

@app.get("/goals")
async def read_goals():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/goals.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

@app.get("/reports")
async def read_reports():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/reports.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

@app.get("/settings")
async def read_settings():
    from fastapi.responses import HTMLResponse
    with open("../Front-end/html/settings.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)

# Importar routers
from routers.users import router as users_router

# Incluir routers en la aplicación
app.include_router(users_router)

# Ruta de prueba
@app.get("/api/test")
async def test_api():
    return {"message": "¡GastoSmart API funcionando!", "status": "success"}

# Ruta para obtener configuración regional
@app.get("/api/config/regional")
async def get_regional_config():
    """
    Obtener configuración regional de Colombia
    """
    from config.regional import (
        CURRENCY, CURRENCY_SYMBOL, CURRENCY_NAME, TIMEZONE, 
        COUNTRY, DATE_FORMAT, NUMBER_FORMAT, EXPENSE_CATEGORIES
    )
    
    return {
        "country": COUNTRY,
        "currency": {
            "code": CURRENCY,
            "symbol": CURRENCY_SYMBOL,
            "name": CURRENCY_NAME
        },
        "timezone": TIMEZONE,
        "date_format": DATE_FORMAT,
        "number_format": NUMBER_FORMAT,
        "expense_categories": EXPENSE_CATEGORIES
    }

# Ruta catch-all para servir archivos del frontend (DEBE ir al final)
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
    return FileResponse("../Front-end/html/signup.html")

if __name__ == "__main__":
    
    # Usar localhost para desarrollo local
    uvicorn.run(app, host="127.0.0.1", port=8000)