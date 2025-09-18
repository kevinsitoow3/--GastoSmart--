"""
Endpoints de API para Usuarios

Este archivo contiene todos los endpoints REST para manejar operaciones
relacionadas con usuarios en GastoSmart.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from typing import List
from database.connection import get_async_database
from database.user_operations import UserOperations
from models.user import UserCreate, UserResponse, UserLogin, BudgetUpdate, VerificationCodeRequest, VerificationCodeConfirm
from motor.motor_asyncio import AsyncIOMotorDatabase

# Crear router para usuarios
router = APIRouter(prefix="/api/users", tags=["usuarios"])

# Configurar autenticación 
security = HTTPBearer()

def get_user_operations(db: AsyncIOMotorDatabase = Depends(get_async_database)) -> UserOperations:
    """
    Obtener instancia de operaciones de usuario
    
    Args:
        db: Base de datos MongoDB
        
    Returns:
        UserOperations: Instancia para operaciones de usuario
    """
    return UserOperations(db)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    user_ops: UserOperations = Depends(get_user_operations)
):
    """
    Registrar un nuevo usuario en GastoSmart
    
    Este endpoint permite a los usuarios crear una nueva cuenta con su información
    personal y configuración de presupuesto inicial.
    
    Args:
        user_data: Datos del usuario a registrar
        user_ops: Operaciones de usuario
        
    Returns:
        UserResponse: Usuario creado exitosamente
        
    Raises:
        HTTPException: Si el correo ya existe o hay error en la validación
    """
    try:
        user = await user_ops.create_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/login", response_model=UserResponse)
async def login_user(
    login_data: UserLogin,
    user_ops: UserOperations = Depends(get_user_operations)
):
    """
    Iniciar sesión de usuario
    
    Autentica al usuario con su correo electrónico y contraseña.
    
    Args:
        login_data: Datos de login (correo y contraseña)
        user_ops: Operaciones de usuario
        
    Returns:
        UserResponse: Usuario autenticado
        
    Raises:
        HTTPException: Si las credenciales son inválidas
    """
    user = await user_ops.authenticate_user(login_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    return user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    user_ops: UserOperations = Depends(get_user_operations)
):
    """
    Obtener información de un usuario por ID
    
    Args:
        user_id: ID único del usuario
        user_ops: Operaciones de usuario
        
    Returns:
        UserResponse: Información del usuario
        
    Raises:
        HTTPException: Si el usuario no existe
    """
    user = await user_ops.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return user

@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    user_ops: UserOperations = Depends(get_user_operations)
):
    """
    Obtener lista de todos los usuarios (con paginación)
    
    Args:
        skip: Número de usuarios a saltar
        limit: Límite de usuarios a devolver
        user_ops: Operaciones de usuario
        
    Returns:
        List[UserResponse]: Lista de usuarios
    """
    users = await user_ops.get_all_users(skip=skip, limit=limit)
    return users

@router.put("/{user_id}/budget", response_model=UserResponse)
async def update_user_budget(
    user_id: str,
    budget_data: BudgetUpdate,
    user_ops: UserOperations = Depends(get_user_operations)
):
    """
    Actualizar presupuesto del usuario
    
    Permite al usuario modificar su presupuesto inicial y período.
    
    Args:
        user_id: ID único del usuario
        budget_data: Nuevos datos de presupuesto
        user_ops: Operaciones de usuario
        
    Returns:
        UserResponse: Usuario con presupuesto actualizado
        
    Raises:
        HTTPException: Si el usuario no existe
    """
    user = await user_ops.update_budget(user_id, budget_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user(
    user_id: str,
    user_ops: UserOperations = Depends(get_user_operations)
):
    """
    Desactivar usuario (soft delete)
    
    Args:
        user_id: ID único del usuario
        user_ops: Operaciones de usuario
        
    Raises:
        HTTPException: Si el usuario no existe
    """
    success = await user_ops.deactivate_user(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    user_ops: UserOperations = Depends(get_user_operations)
):
    """
    Obtener usuario por correo electrónico
    
    Args:
        email: Correo electrónico del usuario
        user_ops: Operaciones de usuario
        
    Returns:
        UserResponse: Información del usuario
        
    Raises:
        HTTPException: Si el usuario no existe
    """
    user = await user_ops.get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return user

@router.post("/send-verification-code")
async def send_verification_code(
    request: VerificationCodeRequest,
    user_ops: UserOperations = Depends(get_user_operations)):
    """
    Enviar código de verificación por correo
    
    Envía un código único de 6 dígitos al correo del usuario para
    verificación en registro o recuperación de contraseña.
    """
    try:
        # Para registro, verificar que el correo no esté registrado
        if request.purpose == "registration":
            existing_user = await user_ops.get_user_by_email(request.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El correo electrónico ya está registrado"
                )
        
        # Enviar código de verificación
        success = await user_ops.send_verification_code(
            request.email, 
            request.purpose
        )
        
        if success:
            return {"message": "Código de verificación enviado exitosamente"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al enviar el código de verificación"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/verify-code")
async def verify_code(
    request: VerificationCodeConfirm,
    user_ops: UserOperations = Depends(get_user_operations)):
    """
    Verificar código de verificación
    
    Valida el código enviado por correo para completar el proceso
    de registro o recuperación de contraseña.
    """
    try:
        is_valid = await user_ops.verify_code(
            request.email,
            request.code,
            request.purpose
        )
        
        if is_valid:
            return {"message": "Código verificado exitosamente", "valid": True}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código inválido o expirado"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )
