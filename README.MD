# func-management-lab-az

Azure Function con un endpoint HTTP para gestionar usuarios en **PostgreSQL (Supabase)**.

## Endpoints

### `GET /api/users`
Trae todos los usuarios.

```bash
curl http://localhost:7071/api/users
```

### `GET /api/users?id=<uuid>`
Trae un usuario por su ID. Devuelve `404` si no existe.

```bash
curl "http://localhost:7071/api/users?id=uuid-del-usuario"
```

### `GET /api/users?email=<email>`
Trae un usuario por su email.

```bash
curl "http://localhost:7071/api/users?email=juan@example.com"
```

### `POST /api/users`
Registra un nuevo usuario.

| Campo         | Tipo   | Obligatorio | Descripción                    |
|---------------|--------|-------------|--------------------------------|
| name          | string | Sí          | Nombre del usuario             |
| email         | string | Sí          | Correo del usuario (único)     |
| password_hash | string | No          | Hash de contraseña             |

```bash
curl -X POST http://localhost:7071/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan", "email": "juan@example.com"}'
```

## Respuestas

| Código | Descripción                                      |
|--------|--------------------------------------------------|
| 200    | Operación exitosa                                |
| 400    | Faltó `name`/`email` o el JSON es inválido       |
| 404    | Usuario no encontrado (GET por id o email)       |
| 409    | Email ya registrado (POST duplicado)             |
| 500    | Error interno del servidor                       |

## Probar errores

```bash
# Sin name o email — devuelve 400
curl -X POST http://localhost:7071/api/users \
  -H "Content-Type: application/json" \
  -d '{}'

# JSON inválido — devuelve 400
curl -X POST http://localhost:7071/api/users \
  -H "Content-Type: application/json" \
  -d 'no-es-json'

# ID inexistente — devuelve 404
curl "http://localhost:7071/api/users?id=00000000-0000-0000-0000-000000000000"
```

## Requisitos para correr localmente

1. **Azure Functions Core Tools** instalado
2. Conexión a Supabase (la URI va en `DATABASE_URL` de `local.settings.json`)

## Estructura del proyecto

```
func-management-lab-az/
├── src/
│   ├── index.js                # Entry point de la Function App
│   ├── db.js                   # Conexión a PostgreSQL (Supabase)
│   ├── services/
│   │   └── userService.js      # Lógica de negocio (CRUD de usuarios)
│   └── functions/
│       └── httpTrigger.js      # Función HTTP (router)
├── resources/
│   └── schema.sql              # Script para crear tablas
├── local.settings.json         # Variables de entorno locales
├── host.json
├── package.json
└── README.md
```

## App settings (para deploy en Azure)

```bash
az functionapp config appsettings set  --name func-management-lab-az  --resource-group lab-functions-apps  --settings DATABASE_URL="postgresql://...."
```
