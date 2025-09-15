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
from models.user import User, UserCreate, UserResponse, UserLogin, BudgetUpdate

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
            "correo_electronico": user_data.correo_electronico
        })
        
        if existing_user:
            raise ValueError("El correo electrónico ya está registrado")
        
        # Encriptar contraseña
        hashed_password = self._hash_password(user_data.contraseña)
        
        # Crear documento de usuario
        user_doc = {
            "nombre": user_data.nombre,
            "apellido": user_data.apellido,
            "correo_electronico": user_data.correo_electronico,
            "contraseña": hashed_password,
            "presupuesto_inicial": user_data.presupuesto_inicial,
            "periodo_presupuesto": user_data.periodo_presupuesto,
            "fecha_registro": datetime.now(),
            "activo": True,
            "ultimo_acceso": None,
            "moneda": user_data.moneda,
            "zona_horaria": user_data.zona_horaria
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
            "correo_electronico": email,
            "activo": True
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
                "activo": True
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
            "correo_electronico": login_data.correo_electronico,
            "activo": True
        })
        
        if user_doc and self._verify_password(login_data.contraseña, user_doc["contraseña"]):
            # Actualizar último acceso
            await self.collection.update_one(
                {"_id": user_doc["_id"]},
                {"$set": {"ultimo_acceso": datetime.now()}}
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
                {"_id": ObjectId(user_id), "activo": True},
                {
                    "$set": {
                        "presupuesto_inicial": budget_data.presupuesto_inicial,
                        "periodo_presupuesto": budget_data.periodo_presupuesto
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
                {"$set": {"activo": False}}
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
        cursor = self.collection.find({"activo": True}).skip(skip).limit(limit)
        users = []
        
        async for user_doc in cursor:
            users.append(self._user_doc_to_response(user_doc))
        
        return users
    
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
            nombre=user_doc["nombre"],
            apellido=user_doc["apellido"],
            correo_electronico=user_doc["correo_electronico"],
            presupuesto_inicial=user_doc["presupuesto_inicial"],
            periodo_presupuesto=user_doc["periodo_presupuesto"],
            fecha_registro=user_doc["fecha_registro"],
            activo=user_doc["activo"],
            ultimo_acceso=user_doc.get("ultimo_acceso"),
            moneda=user_doc.get("moneda", "COP"),
            zona_horaria=user_doc.get("zona_horaria", "America/Bogota")
        )
