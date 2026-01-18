# Diagrama de Secuencia - Fusionar Carrito de Invitado

## Endpoint: POST /cart/merge

Diagrama de secuencia para fusionar el carrito de un usuario invitado con el carrito del usuario registrado.

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant JwtAuthGuard as JwtAuthGuard
    participant JwtStrategy as JwtStrategy
    participant ValidationPipe as ValidationPipe
    participant CartController as CartController
    participant CartManagerService as CartManagerService
    participant CartRepository as CartRepository
    participant GuestSessionModel as GuestSessionModel
    participant MongoDB as MongoDB

    Client->>JwtAuthGuard: POST /cart/merge<br/>Authorization: Bearer {token}<br/>Body: {guestSessionId}
    JwtAuthGuard->>JwtStrategy: Validar JWT token
    JwtStrategy-->>JwtAuthGuard: JwtPayload {sub, type: "registered", email}
    JwtAuthGuard->>ValidationPipe: Request con DTO
    ValidationPipe->>ValidationPipe: Validar MergeCartDto<br/>(guestSessionId requerido)
    
    alt Validación falla
        ValidationPipe-->>Client: 400 Bad Request<br/>{errors}
    else Usuario es invitado
        ValidationPipe->>CartController: Request validado
        CartController->>CartController: Verificar tipo de usuario
        CartController-->>Client: 400 Bad Request<br/>"Solo para usuarios registrados"
    else Validación exitosa y usuario registrado
        ValidationPipe->>CartController: Request validado
        CartController->>CartManagerService: mergeGuestCartIntoUserCart(userId, guestSessionId)
        
        Note over CartManagerService: Buscar carrito de invitado
        CartManagerService->>CartRepository: findByGuestId(guestSessionId)
        CartRepository->>MongoDB: findOne({ guestSessionId, status: 'active' })
        MongoDB-->>CartRepository: CartDocument | null
        CartRepository-->>CartManagerService: guestCart | null
        
        Note over CartManagerService: Buscar o crear carrito del usuario
        CartManagerService->>CartRepository: findByUserId(userId)
        CartRepository->>MongoDB: findOne({ userId, status: 'active' })
        MongoDB-->>CartRepository: CartDocument | null
        CartRepository-->>CartManagerService: userCart | null
        
        alt Carrito de usuario no existe
            CartManagerService->>CartRepository: create(userId, null, REGISTERED)
            CartRepository->>MongoDB: create({ userId, items: [], status: 'active' })
            MongoDB-->>CartRepository: CartDocument
            CartRepository-->>CartManagerService: userCart
        end
        
        alt Carrito de invitado existe y tiene items
            Note over CartManagerService: Fusionar items<br/>Sumar cantidades si mismo producto
            CartManagerService->>CartManagerService: Crear Map de items por productId
            CartManagerService->>CartManagerService: Agregar items del usuario al Map
            CartManagerService->>CartManagerService: Fusionar items del invitado<br/>(sumar cantidades si existe)
            CartManagerService->>CartManagerService: Convertir Map a Array
            
            CartManagerService->>CartRepository: update(userCart con items fusionados)
            CartRepository->>MongoDB: findByIdAndUpdate(userCartId, {items, updatedAt})
            MongoDB-->>CartRepository: CartDocument actualizado
            CartRepository-->>CartManagerService: userCart actualizado
            
            Note over CartManagerService: Eliminar carrito de invitado
            CartManagerService->>CartRepository: delete(guestCart.id)
            CartRepository->>MongoDB: findByIdAndDelete(guestCartId)
            MongoDB-->>CartRepository: OK
            
            Note over CartManagerService: Eliminar sesión de invitado
            CartManagerService->>GuestSessionModel: deleteOne({ sessionId: guestSessionId })
            GuestSessionModel->>MongoDB: deleteOne({ sessionId })
            MongoDB-->>GuestSessionModel: OK
        else Carrito de invitado vacío o no existe
            alt Carrito de invitado existe pero vacío
                CartManagerService->>CartRepository: delete(guestCart.id)
                CartRepository->>MongoDB: findByIdAndDelete(guestCartId)
            end
        end
        
        Note over CartManagerService: Siempre eliminar sesión de invitado
        CartManagerService->>GuestSessionModel: deleteOne({ sessionId: guestSessionId })
        GuestSessionModel->>MongoDB: deleteOne({ sessionId })
        MongoDB-->>GuestSessionModel: OK
        
        CartManagerService->>CartManagerService: formatCartResponse(userCart)
        CartManagerService-->>CartController: CartResponse
        CartController-->>Client: 200 OK<br/>CartResponse {cartId, items, total}
    end
```

## Flujo Detallado

1. **Autenticación y Validación**: 
   - Validación del JWT (debe ser usuario registrado)
   - Validación del DTO (guestSessionId requerido)

2. **Búsqueda de Carritos**:
   - Buscar carrito de invitado por `guestSessionId`
   - Buscar o crear carrito del usuario registrado por `userId`

3. **Fusión de Items**:
   - Si el carrito de invitado tiene items:
     - Crear un Map indexado por `productId`
     - Agregar items del carrito del usuario
     - Fusionar items del carrito de invitado:
       - Si el producto ya existe: **sumar las cantidades**
       - Si es un producto nuevo: agregarlo al Map
     - Convertir el Map de vuelta a Array

4. **Persistencia**:
   - Actualizar el carrito del usuario con los items fusionados
   - Eliminar el carrito de invitado después de la fusión

5. **Respuesta**: Retornar el carrito del usuario con todos los items fusionados

## Request Body

```json
{
  "guestSessionId": "2fa6708506a3ee01ab55f669b79eab60832ec7853043b080f84fda84770b7632"
}
```

## Ejemplo de Fusión

### Antes de la Fusión

**Carrito de Usuario (userId: "user-123"):**
```json
{
  "items": [
    { "productId": "prod-1", "quantity": 2, "price": 10.00, "name": "Producto 1" },
    { "productId": "prod-2", "quantity": 1, "price": 20.00, "name": "Producto 2" }
  ]
}
```

**Carrito de Invitado (guestSessionId: "guest-456"):**
```json
{
  "items": [
    { "productId": "prod-1", "quantity": 3, "price": 10.00, "name": "Producto 1" },
    { "productId": "prod-3", "quantity": 1, "price": 15.00, "name": "Producto 3" }
  ]
}
```

### Después de la Fusión

**Carrito del Usuario (resultado):**
```json
{
  "cartId": "user-cart-id",
  "items": [
    { "productId": "prod-1", "quantity": 5, "price": 10.00, "name": "Producto 1" }, // 2 + 3 = 5
    { "productId": "prod-2", "quantity": 1, "price": 20.00, "name": "Producto 2" },
    { "productId": "prod-3", "quantity": 1, "price": 15.00, "name": "Producto 3" } // Nuevo
  ],
  "total": 85.00
}
```

**Carrito de Invitado**: ❌ Eliminado

## Respuesta Ejemplo

```json
{
  "cartId": "696afadbd52f03224c802944",
  "items": [
    {
      "productId": "prod-1",
      "quantity": 5,
      "price": 10.00,
      "name": "Producto 1"
    },
    {
      "productId": "prod-2",
      "quantity": 1,
      "price": 20.00,
      "name": "Producto 2"
    }
  ],
  "total": 70.00
}
```

## Casos de Error

- **401 Unauthorized**: Token JWT inválido o faltante
- **400 Bad Request**: 
  - DTO inválido (guestSessionId faltante)
  - Usuario es invitado (solo usuarios registrados pueden fusionar)
- **404 Not Found**: Carrito de invitado no encontrado (no es error, simplemente no hay nada que fusionar)

## Notas Importantes

- ✅ **Solo usuarios registrados** pueden usar este endpoint
- ✅ Si hay productos duplicados, **se suman las cantidades**
- ✅ El carrito de invitado **se elimina automáticamente** después de la fusión
- ✅ La sesión de invitado en **GUEST_SESSIONS se elimina** después de la fusión
- ✅ Si el carrito de invitado está vacío, solo se elimina sin modificar el del usuario
- ✅ Si el usuario no tiene carrito, se crea uno nuevo con los items del invitado
