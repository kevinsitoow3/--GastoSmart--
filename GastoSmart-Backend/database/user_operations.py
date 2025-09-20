"""
Operaciones de Base de Datos para Usuarios

Este archivo contiene todas las operaciones CRUD (Create, Read, Update, Delete)
relacionadas con los usuarios en la base de datos MongoDB.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List
from datetime import datetime
import bcrypt
from models.user import User, UserCreate, UserResponse, UserLogin, BudgetUpdate, VerificationCodeRequest, VerificationCodeConfirm

class UserOperations:
    """
    Clase para manejar operaciones de usuarios en la base de datos
    """
    
    def __init__(self, database: AsyncIOMotorDatabase):
        """
        Inicializar operaciones de usuario
        
        Args:
            database: Instancia de la base de datos MongoDB
        """
        self.database = database
        self.collection = database.users  # Colección 'users'
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """
        Crear un nuevo usuario en la base de datos
        
        Args:
            user_data: Datos del usuario a crear
            
        Returns:
            UserResponse: Usuario creado (sin contraseña)
            
        Raises:
            ValueError: Si el correo ya existe
        """
        # Verificar si el correo ya existe
        existing_user = await self.collection.find_one({
            "email": user_data.email
        })
        
        if existing_user:
            raise ValueError("El correo electrónico ya está registrado")
        
        # Encriptar contraseña
        hashed_password = self._hash_password(user_data.password)
        
        # Crear documento de usuario (INACTIVO hasta verificar email)
        user_doc = {
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "email": user_data.email,
            "password": hashed_password,
            "initial_budget": user_data.initial_budget,
            "budget_period": user_data.budget_period,
            "registration_date": datetime.now(),
            "is_active": False,  # INACTIVO hasta verificar código
            "email_verified": False,  # Campo para controlar verificación
            "last_access": None,
            "currency": user_data.currency,
            "timezone": user_data.timezone
        }
        
        # Insertar en la base de datos
        result = await self.collection.insert_one(user_doc)
        
        # Obtener el usuario creado
        created_user = await self.collection.find_one({"_id": result.inserted_id})
        
        return self._user_doc_to_response(created_user)
    
    async def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """
        Obtener usuario por correo electrónico
        
        Args:
            email: Correo electrónico del usuario
            
        Returns:
            UserResponse o None si no se encuentra
        """
        user_doc = await self.collection.find_one({
            "email": email,
            "is_active": True
        })
        
        if user_doc:
            return self._user_doc_to_response(user_doc)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        """
        Obtener usuario por ID
        
        Args:
            user_id: ID del usuario
            
        Returns:
            UserResponse o None si no se encuentra
        """
        try:
            user_doc = await self.collection.find_one({
                "_id": ObjectId(user_id),
                "is_active": True
            })
            
            if user_doc:
                return self._user_doc_to_response(user_doc)
            return None
        except Exception:
            return None
    
    async def authenticate_user(self, login_data: UserLogin) -> Optional[UserResponse]:
        """
        Autenticar usuario con correo y contraseña
        
        Args:
            login_data: Datos de login (correo y contraseña)
            
        Returns:
            UserResponse si la autenticación es exitosa, None en caso contrario
        """
        # Buscar usuario por correo
        user_doc = await self.collection.find_one({
            "email": login_data.email,
            "is_active": True
        })
        
        if user_doc and self._verify_password(login_data.password, user_doc["password"]):
            # Actualizar último acceso
            await self.collection.update_one(
                {"_id": user_doc["_id"]},
                {"$set": {"last_access": datetime.now()}}
            )
            
            return self._user_doc_to_response(user_doc)
        
        return None
    
    async def update_budget(self, user_id: str, budget_data: BudgetUpdate) -> Optional[UserResponse]:
        """
        Actualizar presupuesto del usuario
        
        Args:
            user_id: ID del usuario
            budget_data: Nuevos datos de presupuesto
            
        Returns:
            UserResponse actualizado o None si no se encuentra
        """
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(user_id), "is_active": True},
                {
                    "$set": {
                        "initial_budget": budget_data.initial_budget,
                        "budget_period": budget_data.budget_period
                    }
                }
            )
            
            if result.modified_count > 0:
                return await self.get_user_by_id(user_id)
            return None
        except Exception:
            return None
    
    async def deactivate_user(self, user_id: str) -> bool:
        """
        Desactivar usuario (soft delete)
        
        Args:
            user_id: ID del usuario
            
        Returns:
            True si se desactivó correctamente
        """
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"is_active": False}}
            )
            return result.modified_count > 0
        except Exception:
            return False
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """
        Obtener todos los usuarios (con paginación)
        
        Args:
            skip: Número de usuarios a saltar
            limit: Límite de usuarios a devolver
            
        Returns:
            Lista de usuarios
        """
        cursor = self.collection.find({"is_active": True}).skip(skip).limit(limit)
        users = []
        
        async for user_doc in cursor:
            users.append(self._user_doc_to_response(user_doc))
        
        return users
    
    async def send_verification_code(self, email: str, purpose: str, user_name: str = None) -> bool:
        """
        Enviar código de verificación por correo
        
        Args:
            email: Correo electrónico del usuario
            purpose: Propósito del código ('registration' o 'password_recovery')
            user_name: Nombre del usuario (opcional)
            
        Returns:
            bool: True si se envió correctamente
        """
        try:
            from services.email_service import EmailService
            email_service = EmailService(self.database)
            code = await email_service.generate_verification_code(email, purpose)
            return await email_service.send_verification_email(email, code, purpose, user_name)
        except Exception:
            return False
    
    async def verify_code(self, email: str, code: str, purpose: str) -> dict:
        """
        Verificar código de verificación
        
        Args:
            email: Correo electrónico del usuario
            code: Código de verificación
            purpose: Propósito del código
            
        Returns:
            dict: {"valid": bool, "message": str, "attempts_left": int}
        """
        try:
            from services.email_service import EmailService
            email_service = EmailService(self.database)
            result = await email_service.verify_code(email, code, purpose)
            
            # Si la verificación es exitosa y es para registro, activar la cuenta
            if result["valid"] and purpose == "registration":
                await self.activate_user_account(email)
                result["message"] = "Cuenta activada exitosamente"
            
            return result
        except Exception:
            return {
                "valid": False,
                "message": "Error interno del servidor",
                "attempts_left": 0
            }
    
    async def activate_user_account(self, email: str) -> bool:
        """
        Activar cuenta de usuario después de verificar email
        
        Args:
            email: Correo electrónico del usuario
            
        Returns:
            bool: True si se activó correctamente
        """
        try:
            result = await self.collection.update_one(
                {"email": email},
                {
                    "$set": {
                        "is_active": True,
                        "email_verified": True,
                        "verification_date": datetime.now()
                    }
                }
            )
            return result.modified_count > 0
        except Exception:
            return False
    
    def _hash_password(self, password: str) -> str:
        """
        Encriptar contraseña usando bcrypt
        
        Args:
            password: Contraseña en texto plano
            
        Returns:
            Contraseña encriptada
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def _verify_password(self, password: str, hashed_password: str) -> bool:
        """
        Verificar contraseña
        
        Args:
            password: Contraseña en texto plano
            hashed_password: Contraseña encriptada
            
        Returns:
            True si la contraseña es correcta
        """
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def _user_doc_to_response(self, user_doc: dict) -> UserResponse:
        """
        Convertir documento de MongoDB a UserResponse
        
        Args:
            user_doc: Documento de usuario de MongoDB
            
        Returns:
            UserResponse
        """
        return UserResponse(
            id=str(user_doc["_id"]),
            first_name=user_doc["first_name"],
            last_name=user_doc["last_name"],
            email=user_doc["email"],
            initial_budget=user_doc["initial_budget"],
            budget_period=user_doc["budget_period"],
            registration_date=user_doc["registration_date"],
            is_active=user_doc["is_active"],
            email_verified=user_doc.get("email_verified", False),
            last_access=user_doc.get("last_access"),
            currency=user_doc.get("currency", "COP"),
            timezone=user_doc.get("timezone", "America/Bogota")
        )
