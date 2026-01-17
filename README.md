# Servicio de Carrito de Compras

Servicio de carrito de compras con lógica de negocio completa, diseñado siguiendo principios SOLID y arquitectura modular. Soporta usuarios registrados e invitados, protegido con JWT.

## 🚀 Características

- ✅ Gestión completa de carritos de compras
- ✅ Soporte para usuarios registrados e invitados
- ✅ Autenticación JWT en todos los endpoints
- ✅ Documentación Swagger/OpenAPI interactiva
- ✅ Validación de datos con `class-validator`
- ✅ Arquitectura modular siguiendo principios SOLID
- ✅ Health check endpoint para monitoreo
- ✅ Configuración mediante variables de entorno

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn

## 🔧 Instalación

```bash
# Instalar dependencias
$ npm install
```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
JWT_SECRET=tu-clave-secreta-jwt-aqui
```

> **Nota:** El archivo `.env` está en `.gitignore` y no se subirá al repositorio. Usa `.env.example` como referencia.

## 🏃 Ejecutar el Proyecto

```bash
# Modo desarrollo (con hot-reload)
$ npm run start:dev

# Modo producción
$ npm run start:prod

# Modo debug
$ npm run start:debug
```

Una vez iniciado, el servicio estará disponible en:
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 🧪 Pruebas

```bash
# Pruebas unitarias
$ npm run test

# Pruebas en modo watch
$ npm run test:watch

# Pruebas e2e (end-to-end)
$ npm run test:e2e

# Cobertura de código
$ npm run test:cov
```

## 📚 Documentación

### Endpoints Principales

#### Health Check
- `GET /health` - Verifica el estado del servicio

#### Carrito
- `GET /cart` - Obtener o crear carrito del usuario actual
- `GET /cart/:cartId` - Obtener carrito por ID
- `POST /cart/:cartId/items` - Añadir producto al carrito
- `PUT /cart/:cartId/items` - Actualizar cantidad de producto
- `DELETE /cart/:cartId/items/:productId` - Eliminar producto del carrito

> **Importante:** Todos los endpoints del carrito requieren autenticación JWT.

### Documentación Completa

- **[CART_API.md](./CART_API.md)** - Documentación completa de la API
- **[SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)** - Guía de uso de Swagger UI

## 🏗️ Arquitectura

El servicio está estructurado de forma modular:

```
src/
├── auth/              # Módulo de autenticación JWT
│   ├── guards/        # Guards de autenticación
│   ├── strategies/    # Estrategias de Passport
│   └── decorators/    # Decoradores personalizados
├── cart/              # Módulo de carrito
│   ├── dto/           # Data Transfer Objects
│   ├── services/      # Lógica de negocio
│   ├── repositories/  # Interfaces e implementaciones
│   └── cart.controller.ts
├── common/            # Interfaces y tipos compartidos
└── app.module.ts      # Módulo principal
```

## 🎯 Principios SOLID

1. **Single Responsibility**: Cada servicio tiene una responsabilidad única
2. **Open/Closed**: Fácil extensión mediante interfaces
3. **Liskov Substitution**: Repositorios intercambiables mediante `ICartRepository`
4. **Interface Segregation**: Interfaces específicas y enfocadas
5. **Dependency Inversion**: Dependencia de abstracciones, no de implementaciones

## 🔐 Autenticación

El servicio utiliza JWT (JSON Web Tokens) para autenticación. El token debe enviarse en el header:

```
Authorization: Bearer <tu-token-jwt>
```

### Tipos de Usuario

- **Usuario Registrado**: `{ "sub": "user-id", "type": "registered", "email": "..." }`
- **Usuario Invitado**: `{ "sub": "guest-id", "type": "guest" }`

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run start:dev      # Inicia en modo desarrollo con hot-reload

# Producción
npm run build          # Compila el proyecto
npm run start:prod     # Inicia en modo producción

# Calidad de Código
npm run lint           # Ejecuta el linter
npm run format         # Formatea el código con Prettier

# Pruebas
npm run test           # Ejecuta pruebas unitarias
npm run test:watch     # Ejecuta pruebas en modo watch
npm run test:cov       # Genera reporte de cobertura
npm run test:e2e       # Ejecuta pruebas end-to-end
```

## 📦 Tecnologías Utilizadas

- [NestJS](https://nestjs.com/) - Framework Node.js
- [TypeScript](https://www.typescriptlang.org/) - Lenguaje de programación
- [Passport](https://www.passportjs.org/) - Autenticación
- [JWT](https://jwt.io/) - Tokens de autenticación
- [Swagger](https://swagger.io/) - Documentación de API
- [class-validator](https://github.com/typestack/class-validator) - Validación de datos
- [class-transformer](https://github.com/typestack/class-transformer) - Transformación de objetos

## 🚢 Despliegue

Para desplegar el servicio en producción:

1. Configura las variables de entorno en tu plataforma
2. Compila el proyecto: `npm run build`
3. Ejecuta el proyecto: `npm run start:prod`

### Recomendaciones de Producción

- Usa un `JWT_SECRET` seguro y único
- Configura variables de entorno apropiadas
- Implementa logging y monitoreo
- Configura rate limiting
- Usa HTTPS
- Implementa un repositorio de base de datos real (actualmente usa memoria)

## 📄 Licencia

Este proyecto es privado y está bajo licencia UNLICENSED.

## 👥 Autor

Desarrollado para FARMA.

## 📞 Soporte

Para más información sobre el uso de NestJS, visita la [documentación oficial](https://docs.nestjs.com).
