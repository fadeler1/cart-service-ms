# API del Servicio de Carrito de Compras

## Descripción

Servicio de carrito de compras con lógica de negocio completa, diseñado siguiendo principios SOLID y arquitectura modular. Soporta usuarios registrados e invitados, protegido con JWT.

## 📚 Documentación Swagger

La documentación interactiva de la API está disponible en Swagger UI:

```
http://localhost:3000/api
```

Una vez que inicies el servicio, podrás acceder a la documentación interactiva donde podrás:
- Ver todos los endpoints disponibles
- Probar las operaciones directamente desde el navegador
- Ver los esquemas de datos (DTOs)
- Autenticarte con tu token JWT usando el botón "Authorize"

## Arquitectura

El servicio está estructurado de forma modular:

- **`/auth`**: Módulo de autenticación con JWT Guard y estrategias
- **`/cart`**: Módulo de carrito con servicios, repositorios y controladores
- **`/common/interfaces`**: Interfaces compartidas para tipo seguro

## Principios SOLID Aplicados

1. **Single Responsibility**: Cada servicio tiene una responsabilidad única
2. **Open/Closed**: Fácil extensión mediante interfaces
3. **Liskov Substitution**: Repositorios intercambiables mediante ICartRepository
4. **Interface Segregation**: Interfaces específicas y enfocadas
5. **Dependency Inversion**: Dependencia de abstracciones (ICartRepository) no de implementaciones

## Endpoints

Todas las rutas requieren autenticación JWT mediante header `Authorization: Bearer <token>`

### Base URL
```
http://localhost:3000/cart
```

### 1. Obtener o crear carrito
**GET** `/cart`

Obtiene el carrito del usuario actual, o crea uno nuevo si no existe.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "cartId": "uuid-del-carrito",
  "items": [],
  "total": 0
}
```

### 2. Obtener carrito por ID
**GET** `/cart/:cartId`

Obtiene un carrito específico validando que pertenezca al usuario.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "cartId": "uuid-del-carrito",
  "items": [
    {
      "productId": "prod-123",
      "quantity": 2,
      "price": 29.99,
      "name": "Producto Ejemplo"
    }
  ],
  "total": 59.98
}
```

### 3. Añadir producto al carrito
**POST** `/cart/:cartId/items`

Añade un producto al carrito o incrementa su cantidad si ya existe.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "productId": "prod-123",
  "quantity": 1,
  "price": 29.99,
  "name": "Producto Ejemplo"
}
```

**Response:**
```json
{
  "cartId": "uuid-del-carrito",
  "items": [
    {
      "productId": "prod-123",
      "quantity": 1,
      "price": 29.99,
      "name": "Producto Ejemplo"
    }
  ],
  "total": 29.99
}
```

### 4. Actualizar cantidad de un producto
**PUT** `/cart/:cartId/items`

Actualiza la cantidad de un producto específico en el carrito.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "productId": "prod-123",
  "quantity": 3
}
```

**Response:**
```json
{
  "cartId": "uuid-del-carrito",
  "items": [
    {
      "productId": "prod-123",
      "quantity": 3,
      "price": 29.99,
      "name": "Producto Ejemplo"
    }
  ],
  "total": 89.97
}
```

### 5. Eliminar producto del carrito
**DELETE** `/cart/:cartId/items/:productId`

Elimina un producto del carrito.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "cartId": "uuid-del-carrito",
  "items": [],
  "total": 0
}
```

## Tipos de Usuario

### Usuario Registrado
El JWT debe contener:
```json
{
  "sub": "user-id-123",
  "type": "registered",
  "email": "usuario@example.com"
}
```

### Usuario Invitado (Guest)
El JWT debe contener:
```json
{
  "sub": "guest-id-456",
  "type": "guest"
}
```

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `400 Bad Request`: Datos inválidos o carrito no pertenece al usuario
- `401 Unauthorized`: Token JWT inválido o faltante
- `404 Not Found`: Carrito o producto no encontrado

## Validaciones

- Todos los DTOs son validados automáticamente con `class-validator`
- El JWT debe ser válido en todas las peticiones
- Solo el propietario del carrito puede modificarlo
- Los productos deben tener `quantity >= 1` y `price >= 0`

## Variables de Entorno

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

## Instalación de Dependencias

```bash
npm install
```

## Ejecutar el Servicio

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

Una vez iniciado, podrás acceder a:
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api

## Notas Técnicas

- El repositorio actual usa implementación en memoria (`InMemoryCartRepository`)
- Para producción, se puede cambiar fácilmente por una implementación de base de datos
- Solo necesitas crear una nueva clase que implemente `ICartRepository` y actualizar el provider en `cart.module.ts`
- La lógica de negocio queda desacoplada de la implementación del repositorio
