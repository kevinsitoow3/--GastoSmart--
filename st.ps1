# Script para iniciar GastoSmart automáticamente
Write-Host "Iniciando GastoSmart..." -ForegroundColor Green

# Activar virtual environment
Write-Host "Activando virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Ir a la carpeta del backend
Write-Host "Cambiando a directorio del backend..." -ForegroundColor Yellow
Set-Location GastoSmart-Backend

# Ejecutar la aplicación
Write-Host "Ejecutando aplicacion FastAPI..." -ForegroundColor Cyan
python main.py
