# 🚀 Configuración de GastoSmart Backend

## 📋 Pasos para configurar tu base de datos

### 1. **Configurar MongoDB Atlas**

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Inicia sesión en tu cuenta
3. Crea un nuevo cluster o usa uno existente
4. Obtén tu string de conexión

### 2. **Configurar variables de entorno**

Crea un archivo `.env` en la carpeta `GastoSmart-Backend` con el siguiente contenido:

```env
# Configuración de MongoDB Atlas
MONGODB_URL=mongodb+srv://usuario:contraseña@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=gastosmart

# Configuración de la aplicación
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**⚠️ IMPORTANTE:** Reemplaza `usuario` y `contraseña` con tus credenciales reales de MongoDB Atlas.

### 3. **Estructura de la base de datos**

Tu base de datos `gastosmart` tendrá la siguiente colección:

#### **Colección: `users`**
```json
{
  "_id": "ObjectId",
  "nombre": "Juan",
  "apellido": "Pérez", 
  "correo_electronico": "juan.perez@ejemplo.com",
  "contraseña": "contraseña_encriptada",
  "presupuesto_inicial": 2000000.00,
  "periodo_presupuesto": "mensual",
  "fecha_registro": "2024-01-15T10:30:00Z",
  "activo": true,
  "ultimo_acceso": "2024-01-15T10:30:00Z",
  "moneda": "COP",
  "zona_horaria": "America/Bogota"
}
```

### 4. **Endpoints disponibles**

Una vez configurado, tendrás estos endpoints:

- `POST /api/users/register` - Registrar nuevo usuario
- `POST /api/users/login` - Iniciar sesión
- `GET /api/users/{user_id}` - Obtener usuario por ID
- `GET /api/users/` - Listar todos los usuarios
- `PUT /api/users/{user_id}/budget` - Actualizar presupuesto
- `DELETE /api/users/{user_id}` - Desactivar usuario

### 5. **Ejemplo de uso**

#### Registrar usuario:
```json
POST /api/users/register
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo_electronico": "juan.perez@ejemplo.com",
  "contraseña": "mi_contraseña_segura_123",
  "presupuesto_inicial": 2000000.00,
  "periodo_presupuesto": "mensual"
}
```

#### Iniciar sesión:
```json
POST /api/users/login
{
  "correo_electronico": "juan.perez@ejemplo.com",
  "contraseña": "mi_contraseña_segura_123"
}
```

### 6. **Ejecutar el servidor**

```bash
# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Ir al directorio del backend
cd GastoSmart-Backend

# Ejecutar servidor
python main.py
```

El servidor estará disponible en: `http://localhost:8000`

### 7. **Documentación automática**

Una vez que el servidor esté corriendo, puedes ver la documentación interactiva en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
