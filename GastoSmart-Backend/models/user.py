"""
Modelo de Usuario para GastoSmart

Este archivo define el modelo de datos para los usuarios de la aplicación,
incluyendo información personal y configuración de presupuesto inicial.
"""

#Pydantic: para validar los datos
#EmailStr: para validar el correo electrónico
#Field: para definir los campos del modelo
#Optional: para definir los campos opcionales
#datetime: para definir la fecha y hora
#Enum: para definir los valores posibles

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class BudgetPeriod(str, Enum):
    """Períodos de presupuesto disponibles"""
    QUINCENAL = "quincenal"  # Cada 15 días
    MENSUAL = "mensual"      # Cada mes

class User(BaseModel):
    """
    Modelo de Usuario para GastoSmart
    
    Representa un usuario registrado en la aplicación con toda su información
    personal y configuración financiera inicial.
    """
    
    # Información personal básica
    nombre: str = Field(..., min_length=2, max_length=50, description="Nombre del usuario")
    apellido: str = Field(..., min_length=2, max_length=50, description="Apellido del usuario")
    correo_electronico: EmailStr = Field(..., description="Correo electrónico único del usuario")
    contraseña: str = Field(..., min_length=8, description="Contraseña encriptada del usuario")
    
    # Configuración de presupuesto inicial
    presupuesto_inicial: float = Field(..., gt=0, description="Monto del presupuesto inicial")
    periodo_presupuesto: BudgetPeriod = Field(..., description="Período del presupuesto (quincenal/mensual")
    
    # Metadatos del usuario
    fecha_registro: datetime = Field(default_factory=datetime.now, description="Fecha de registro del usuario")
    activo: bool = Field(default=True, description="Estado activo del usuario")
    ultimo_acceso: Optional[datetime] = Field(default=None, description="Última vez que el usuario accedió")
    
    # Configuración adicional
    moneda: str = Field(default="COP", description="Moneda preferida del usuario")
    zona_horaria: str = Field(default="America/Bogota", description="Zona horaria del usuario")
    
    class Config:
        """Configuración del modelo"""
        json_encoders = {
            datetime: lambda v: v.isoformat() #Para convertir la fecha y hora a JSON, formato ISO
        }
        json_schema_extra = {
            "example": {
                "nombre": "Juan",
                "apellido": "Pérez",
                "correo_electronico": "juan.perez@ejemplo.com",
                "contraseña": "mi_contraseña_segura_123",
                "presupuesto_inicial": 2000000.00,
                "periodo_presupuesto": "mensual",
                "moneda": "COP",
                "zona_horaria": "America/Bogota"
            }
        }

class UserCreate(BaseModel):
    """
    Modelo para crear un nuevo usuario
    
    Se usa en el endpoint de registro, sin incluir metadatos automáticos.
    """
    nombre: str = Field(..., min_length=2, max_length=50)
    apellido: str = Field(..., min_length=2, max_length=50)
    correo_electronico: EmailStr
    contraseña: str = Field(..., min_length=8)
    presupuesto_inicial: float = Field(..., gt=0)
    periodo_presupuesto: BudgetPeriod
    moneda: str = Field(default="COP")
    zona_horaria: str = Field(default="America/Bogota")

class UserResponse(BaseModel):
    """
    Modelo para respuesta de usuario (sin contraseña)
    
    Se usa para devolver información del usuario sin exponer la contraseña.
    """
    id: str = Field(..., description="ID único del usuario")
    nombre: str
    apellido: str
    correo_electronico: EmailStr
    presupuesto_inicial: float
    periodo_presupuesto: BudgetPeriod
    fecha_registro: datetime
    activo: bool
    ultimo_acceso: Optional[datetime]
    moneda: str
    zona_horaria: str

class UserLogin(BaseModel):
    """
    Modelo para login de usuario
    """
    correo_electronico: EmailStr
    contraseña: str

class BudgetUpdate(BaseModel):
    """
    Modelo para actualizar presupuesto del usuario
    """
    presupuesto_inicial: float = Field(..., gt=0)
    periodo_presupuesto: BudgetPeriod
