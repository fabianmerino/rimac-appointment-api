# Rimac Medical Appointment Backend

Sistema backend serverless para agendamiento de citas médicas usando AWS Lambda, construido con TypeScript y el Serverless Framework.

## 📋 Descripción

Este sistema permite a los asegurados agendar citas médicas con procesamiento asíncrono específico por país (Perú y Chile). Incluye autenticación JWT y documentación interactiva con Scalar.

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

## 🛠️ Tecnologías

- **Runtime**: Node.js 20.x
- **Lenguaje**: TypeScript
- **Framework**: Serverless Framework v4
- **Servicios AWS**: Lambda, API Gateway, DynamoDB, SNS, SQS, EventBridge, RDS
- **Documentación**: OpenAPI 3.0 con Scalar

## 📁 Estructura del Proyecto

```
├── docs/
│   ├── api.yaml                    # Especificación OpenAPI 3.0
│   └── index.html                  # Interfaz Scalar
├── src/
│   ├── application/usecases/       # Casos de uso
│   ├── domain/
│   │   ├── entities/               # Entidades del dominio
│   │   ├── repositories/           # Interfaces de repositorios
│   │   └── services/               # Servicios del dominio
│   ├── infrastructure/
│   │   ├── repositories/           # Implementaciones DynamoDB/MySQL
│   │   └── services/               # Servicios AWS
│   ├── handlers/                   # Handlers Lambda
│   ├── types/                      # Tipos TypeScript
│   └── utils/                      # Utilidades
├── tests/                          # Tests unitarios
└── scripts/                        # Scripts de deployment
```

## 🌐 Endpoints de la API

### Autenticación (Públicos)
- `POST /auth/register` - Registra un nuevo usuario
- `POST /auth/login` - Autentica usuario existente

### Citas Médicas (Requieren JWT)
- `POST /appointment` - Crea nueva cita médica
- `GET /appointment/{insuredId}` - Obtiene historial de citas

### Documentación
- `GET /docs` - Documentación interactiva (Scalar)

## 🚀 Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

3. **Desarrollo local**:
   ```bash
   pnpm dev
   ```
   Accede a: http://localhost:3000

4. **Documentación**: http://localhost:3000/docs

## 📦 Despliegue

```bash
# Desarrollo
pnpm deploy:dev

# Producción
pnpm deploy:prod
```

## ✅ Testing

```bash
# Ejecutar tests
pnpm test

# Con cobertura
pnpm test:coverage
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
