#!/usr/bin/env python3
"""
Script de depuración para verificar el estado de un usuario en la base de datos
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import bcrypt

async def debug_user(email):
    """Depurar información de un usuario específico"""
    
    # Conectar a MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.gastosmart
    users_collection = db.users
    
    print(f"[DEBUG] Buscando usuario: {email}")
    print("=" * 50)
    
    # Buscar usuario por email
    user_doc = await users_collection.find_one({"email": email})
    
    if not user_doc:
        print("❌ Usuario NO encontrado en la base de datos")
        return
    
    print("✅ Usuario encontrado:")
    print(f"  - ID: {user_doc['_id']}")
    print(f"  - Nombre: {user_doc.get('first_name', 'N/A')} {user_doc.get('last_name', 'N/A')}")
    print(f"  - Email: {user_doc['email']}")
    print(f"  - is_active: {user_doc.get('is_active', 'N/A')}")
    print(f"  - email_verified: {user_doc.get('email_verified', 'N/A')}")
    print(f"  - Fecha registro: {user_doc.get('registration_date', 'N/A')}")
    print(f"  - Último acceso: {user_doc.get('last_access', 'N/A')}")
    print(f"  - password_updated: {user_doc.get('password_updated', 'N/A')}")
    
    # Verificar si tiene contraseña
    if 'password' in user_doc:
        print(f"  - Tiene contraseña: ✅")
        print(f"  - Hash de contraseña: {user_doc['password'][:20]}...")
    else:
        print(f"  - Tiene contraseña: ❌")
    
    # Buscar códigos de verificación
    verification_codes = db.verification_codes
    codes = await verification_codes.find({"email": email}).sort("created_at", -1).limit(3).to_list(3)
    
    print(f"\n📧 Códigos de verificación recientes:")
    if codes:
        for i, code in enumerate(codes, 1):
            print(f"  {i}. Código: {code.get('code', 'N/A')}")
            print(f"     Propósito: {code.get('purpose', 'N/A')}")
            print(f"     Usado: {code.get('used', 'N/A')}")
            print(f"     Creado: {code.get('created_at', 'N/A')}")
            print(f"     Expira: {code.get('expires_at', 'N/A')}")
    else:
        print("  No hay códigos de verificación")
    
    # Cerrar conexión
    client.close()

async def test_password_verification(email, password):
    """Probar verificación de contraseña"""
    
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.gastosmart
    users_collection = db.users
    
    print(f"\n🔐 Probando verificación de contraseña:")
    print("=" * 50)
    
    user_doc = await users_collection.find_one({"email": email})
    
    if not user_doc:
        print("❌ Usuario no encontrado")
        return
    
    if 'password' not in user_doc:
        print("❌ Usuario no tiene contraseña")
        return
    
    stored_password = user_doc['password']
    
    try:
        # Verificar contraseña
        is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8'))
        
        if is_valid:
            print("✅ Contraseña VÁLIDA")
        else:
            print("❌ Contraseña INVÁLIDA")
            
        print(f"  - Contraseña ingresada: {password}")
        print(f"  - Hash almacenado: {stored_password[:20]}...")
        
    except Exception as e:
        print(f"❌ Error al verificar contraseña: {e}")
    
    client.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python debug_user.py <email> [password]")
        print("Ejemplo: python debug_user.py usuario@ejemplo.com mi_password")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Ejecutar depuración
    asyncio.run(debug_user(email))
    
    # Si se proporcionó contraseña, probarla
    if password:
        asyncio.run(test_password_verification(email, password))
