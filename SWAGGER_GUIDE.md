# Guía de Uso de Swagger UI

## Acceso a Swagger

Una vez que el servicio esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:3000/api
```

## Características de Swagger UI

### 1. Autenticación JWT

Para probar los endpoints protegidos:

1. Haz clic en el botón **"Authorize"** 🔒 en la parte superior derecha
2. En el modal que aparece, ingresa tu token JWT en el campo `Value`
   - El formato es: `Bearer <tu-token-jwt>`
   - O simplemente: `<tu-token-jwt>` (Swagger añadirá el prefijo "Bearer" automáticamente)
3. Haz clic en **"Authorize"** y luego en **"Close"**

Ahora todos los endpoints protegidos tendrán el token configurado.

### 2. Probar Endpoints

#### GET /cart
Obtiene o crea el carrito del usuario actual.

**Headers automáticos:**
- `Authorization: Bearer <tu-token-jwt>` (si autorizaste)

**Ejemplo de respuesta:**
```json
{
  "cartId": "550e8400-e29b-41d4-a716-446655440000",
  "items": [],
  "total": 0
}
```

#### GET /cart/:cartId
Obtiene un carrito específico por ID.

**Parámetros:**
- `cartId`: ID del carrito (obténlo del endpoint GET /cart)

**Ejemplo de respuesta:**
```json
{
  "cartId": "550e8400-e29b-41d4-a716-446655440000",
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

#### POST /cart/:cartId/items
Añade un producto al carrito.

**Parámetros:**
- `cartId`: ID del carrito

**Body (JSON):**
```json
{
  "productId": "prod-123",
  "quantity": 2,
  "price": 29.99,
  "name": "Producto Ejemplo"
}
```

#### PUT /cart/:cartId/items
Actualiza la cantidad de un producto.

**Parámetros:**
- `cartId`: ID del carrito

**Body (JSON):**
```json
{
  "productId": "prod-123",
  "quantity": 5
}
```

#### DELETE /cart/:cartId/items/:productId
Elimina un producto del carrito.

**Parámetros:**
- `cartId`: ID del carrito
- `productId`: ID del producto a eliminar

### 3. Esquemas de Datos

Swagger muestra automáticamente todos los DTOs (Data Transfer Objects) con sus propiedades:

- **AddItemDto**: Para añadir productos
- **UpdateItemDto**: Para actualizar cantidades
- **CartResponseDto**: Respuesta del carrito
- **CartItemDto**: Item individual del carrito

Cada esquema incluye:
- Descripción de cada campo
- Tipo de dato
- Valores de ejemplo
- Restricciones (mínimos, máximos, requeridos)

### 4. Códigos de Estado HTTP

Cada endpoint muestra los posibles códigos de respuesta:

- **200 OK**: Operación exitosa
- **400 Bad Request**: Datos inválidos
- **401 Unauthorized**: Token JWT inválido o faltante
- **404 Not Found**: Recurso no encontrado

### 5. Descargas

Puedes descargar:
- **OpenAPI JSON**: Especificación completa en formato JSON
- **OpenAPI YAML**: Especificación completa en formato YAML

Estos archivos pueden ser importados en herramientas como Postman, Insomnia, o generar clientes SDK automáticamente.

## Ejemplos de Tokens JWT

### Usuario Registrado
```json
{
  "sub": "user-id-123",
  "type": "registered",
  "email": "usuario@example.com",
  "iat": 1234567890,
  "exp": 1235173890
}
```

### Usuario Invitado (Guest)
```json
{
  "sub": "guest-id-456",
  "type": "guest",
  "iat": 1234567890,
  "exp": 1235173890
}
```

**Nota:** Los tokens deben estar firmados con el mismo `JWT_SECRET` configurado en el servicio.

## Tips para Probar la API

1. **Flujo recomendado:**
   - Primero autoriza con tu token JWT
   - Obtén o crea tu carrito con `GET /cart`
   - Usa el `cartId` retornado para las demás operaciones
   - Añade productos con `POST /cart/:cartId/items`
   - Actualiza cantidades con `PUT /cart/:cartId/items`
   - Elimina productos con `DELETE /cart/:cartId/items/:productId`

2. **Validaciones:**
   - Swagger valida automáticamente los campos requeridos
   - Los campos numéricos deben cumplir con los mínimos especificados
   - Intenta enviar datos inválidos para ver los mensajes de error

3. **Respuestas de Error:**
   - Si falta el token, verás un error 401
   - Si los datos son inválidos, verás un error 400 con los detalles
   - Si el carrito no existe o no te pertenece, verás un error 404 o 400

## Integración con Herramientas Externas

### Postman
1. Exporta el OpenAPI JSON desde Swagger
2. En Postman: `File > Import > Upload Files`
3. Selecciona el archivo JSON descargado
4. Se crearán todas las colecciones automáticamente

### cURL
Cada endpoint en Swagger muestra un ejemplo de cURL que puedes copiar y usar directamente en terminal.

### Generar SDK
Puedes usar herramientas como:
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)

Con el JSON/YAML de OpenAPI puedes generar clientes en múltiples lenguajes (TypeScript, Python, Java, etc.).
