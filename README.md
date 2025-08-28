# Rimac Medical Appointment Backend

Sistema backend serverless para agendamiento de citas médicas usando AWS Lambda, construido con TypeScript y el Serverless Framework.

## 📋 Descripción del Proyecto

Este sistema permite a los asegurados agendar citas médicas. La arquitectura está diseñada para procesar solicitudes de manera asíncrona y soporta diferentes países (Perú y Chile) con lógicas de procesamiento específicas.

Adicionalmente, cuenta con un sistema de **autenticación basado en JWT** para proteger las rutas y una **documentación de API interactiva** construida con Scalar.

### Flujo del Sistema

1. **Recepción**: Un Lambda recibe la petición POST y guarda en DynamoDB con estado "pending"
2. **Distribución**: El Lambda envía la información a SNS con filtros por país
3. **Procesamiento**: SNS distribuye a SQS específicos por país (PE/CL)
4. **Almacenamiento**: Lambdas específicos procesan desde SQS y guardan en RDS MySQL
5. **Confirmación**: Los lambdas envían eventos de confirmación via EventBridge
6. **Actualización**: EventBridge envía a SQS que actualiza el estado a "completed" en DynamoDB

## 🏗️ Arquitectura

```
API Gateway → Lambda (appointment) → DynamoDB
                ↓
               SNS Topic
                ↓
        ┌──────────────────┐
        ↓                  ↓
    SQS_PE              SQS_CL
        ↓                  ↓
  Lambda_PE          Lambda_CL
        ↓                  ↓
      RDS MySQL      RDS MySQL
        ↓                  ↓
        └──→ EventBridge ←─┘
                ↓
        SQS_Completion
                ↓
        Lambda (appointment)
                ↓
            DynamoDB
```

## 🛠️ Tecnologías Utilizadas

- **Runtime**: Node.js 20.x
- **Lenguaje**: TypeScript
- **Framework**: Serverless Framework v4
- **Bundler**: ESBuild (nativo en v4)
- **Servicios AWS**:
  - Lambda Functions
  - API Gateway (HTTP API v2)
  - DynamoDB
  - SNS (Simple Notification Service)
  - SQS (Simple Queue Service)
  - EventBridge
  - RDS MySQL
- **Arquitectura**: Clean Architecture con principios SOLID
- **Patrones**: Repository, Dependency Injection
- **Testing**: Jest
- **Documentación**: OpenAPI 3.0

## 📁 Estructura del Proyecto

```
├── docs/
│   ├── api.yaml                    # Documentación OpenAPI/Swagger
│   └── Reto - Rimac Backend.pdf    # Especificaciones del reto
├── src/
│   ├── application/
│   │   └── usecases/               # Casos de uso de la aplicación
│   ├── domain/
│   │   ├── entities/               # Entidades del dominio
│   │   └── services/               # Servicios del dominio
│   ├── infrastructure/
│   │   ├── repositories/           # Implementaciones de repositorios
│   │   └── services/               # Servicios de infraestructura
│   ├── handlers/                   # Handlers de AWS Lambda
│   ├── types/                      # Definiciones de tipos TypeScript
│   └── utils/                      # Utilidades
├── tests/                          # Tests unitarios
├── scripts/                        # Scripts de deployment y utilidades
├── serverless.yml                  # Configuración Serverless Framework
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🌐 Endpoints de la API

La URL base para el entorno local es `http://localhost:3000`.

### Autenticación

Estos endpoints son públicos y no requieren token de autenticación.

- **`POST /auth/register`**
  - **Descripción**: Registra un nuevo usuario en el sistema.
  - **Body**: `name`, `email`, `password`, `insuredId`, `countryISO`.
  - **Respuesta**: Devuelve los datos del usuario y un token JWT.

- **`POST /auth/login`**
  - **Descripción**: Autentica a un usuario existente.
  - **Body**: `email`, `password`.
  - **Respuesta**: Devuelve los datos del usuario y un token JWT.

### Citas Médicas (Appointments)

Estos endpoints requieren un token JWT válido en la cabecera `Authorization`.

- **`POST /appointment`**
  - **Descripción**: Crea una nueva solicitud de cita médica. La solicitud se procesa de forma asíncrona.
  - **Body**: `insuredId`, `scheduleId`, `countryISO`.
  - **Respuesta**: Confirma la recepción de la solicitud y devuelve los detalles de la cita con estado `pending`.

- **`GET /appointment/{insuredId}`**
  - **Descripción**: Obtiene el historial de citas para un asegurado específico.
  - **Parámetro**: `insuredId` (ID del asegurado).
  - **Respuesta**: Lista de todas las citas del asegurado.

### Documentación de la API

- **`GET /docs`**
  - **Descripción**: Sirve la documentación interactiva de la API utilizando Scalar. Es la forma recomendada de explorar y probar los endpoints.

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20.x o superior
- AWS CLI configurado
- Serverless Framework v4 CLI (`npm install -g serverless@4`)
- `pnpm` como gestor de paquetes (`npm install -g pnpm`)
- Acceso a una instancia RDS MySQL (o configuración local)

### Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/rimac-appointment-api.git
   cd rimac-appointment-api
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Variables de entorno**:
   - Crea un archivo `.env` en la raíz del proyecto.
   - Define las variables de conexión a tu base de datos RDS. Puedes usar el archivo `params.yml` como guía para las variables necesarias (`RDS_HOST`, `RDS_PORT`, etc.).

## 💻 Desarrollo Local

Para levantar el entorno de desarrollo local, que simula API Gateway y Lambda, ejecuta:

```bash
pnpm dev
```

Este comando utiliza `serverless offline` para iniciar el servicio. Los endpoints estarán disponibles en `http://localhost:3000`.

La documentación interactiva estará disponible en:
**[http://localhost:3000/docs](http://localhost:3000/docs)**

## 📦 Despliegue

El proyecto incluye scripts para facilitar el despliegue en diferentes entornos.

- **Desplegar en `dev`**:
  ```bash
  pnpm deploy:dev
  ```

- **Desplegar en `prod`**:
  ```bash
  pnpm deploy:prod
  ```

- **Eliminar el servicio**:
  - Para `dev`: `pnpm remove:dev`
  - Para `prod`: `pnpm remove:prod`

## ✅ Testing

Para ejecutar los tests unitarios, utiliza el siguiente comando:

```bash
pnpm test
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico, contactar:
- Email: support@rimac.com
- Documentación API: [Ver Swagger UI](./docs/api.yaml)

## 🔗 Enlaces Útiles

- [Documentación Serverless Framework](https://www.serverless.com/framework/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

---

Desarrollado con ❤️ para Rimac Seguros
