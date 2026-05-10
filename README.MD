# func-management-lab-az

Azure Function con un endpoint HTTP para gestionar usuarios en Azure SQL Database usando Managed Identity (token de Azure AD).

## Endpoints

### `GET /api/users`
Trae todos los usuarios.

```bash
curl http://localhost:7071/api/users
```

### `GET /api/users?id=1`
Trae un usuario por su ID. Devuelve `404` si no existe.

```bash
curl "http://localhost:7071/api/users?id=1"
```

### `POST /api/users`
Registra un nuevo usuario.

| Campo  | Tipo   | Obligatorio | Descripción            |
|--------|--------|-------------|------------------------|
| name   | string | Sí          | Nombre del usuario     |
| email  | string | No          | Correo del usuario     |

```bash
curl -X POST http://localhost:7071/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan", "email": "juan@example.com"}'
```

## Respuestas

| Código | Descripción                                      |
|--------|--------------------------------------------------|
| 200    | Operación exitosa                                |
| 400    | Faltó el campo `name` o el JSON es inválido      |
| 404    | Usuario no encontrado (GET por id)               |
| 500    | Error interno del servidor                       |

## Probar errores

```bash
# Sin name — devuelve 400
curl -X POST http://localhost:7071/api/users \
  -H "Content-Type: application/json" \
  -d '{}'

# JSON inválido — devuelve 400
curl -X POST http://localhost:7071/api/users \
  -H "Content-Type: application/json" \
  -d 'no-es-json'

# ID inexistente — devuelve 404
curl "http://localhost:7071/api/users?id=9999"
```

## Requisitos para correr localmente

1. **Azure Functions Core Tools** instalado
2. **Azure CLI** (`az login`) — para que `DefaultAzureCredential` obtenga el token de Azure AD localmente
3. La Managed Identity de la Function App debe tener permisos de escritura en la BD

## Estructura del proyecto

```
func-management-lab-az/
├── src/
│   ├── index.js                # Entry point de la Function App
│   ├── db.js                   # Conexión a Azure SQL con Managed Identity
│   ├── services/
│   │   └── userService.js      # Lógica de negocio (CRUD de usuarios)
│   └── functions/
│       └── users.js            # Función HTTP (router)
├── resources/
│   └── schema.sql              # Script para crear la BD y tabla Users
├── local.settings.json         # Variables de entorno locales
├── host.json
├── package.json
└── README.md
```
## App setting

- Comando para agregar las variables en la funcion en azure

```bash 
az functionapp config appsettings set \
  --name <function-app-name> \
  --resource-group <rg> \
  --settings DB_SERVER="sql-azure-server-lab.database.windows.net" DB_NAME="free-sql-db-azure-lab"
```


## Schema to sql

- Tabla basica para la integracion de la funcion con la base 

```sql 
CREATE USER [func-management-lab-az] FROM EXTERNAL PROVIDER;

ALTER ROLE db_datawriter ADD MEMBER [func-management-lab-az];

CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

```