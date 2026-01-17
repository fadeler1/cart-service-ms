# Diagrama de Secuencia - Obtener o Crear Carrito

## Endpoint: GET /cart

Diagrama de secuencia para obtener el carrito del usuario actual o crear uno nuevo si no existe.

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant JwtAuthGuard as JwtAuthGuard
    participant JwtStrategy as JwtStrategy
    participant CartController as CartController
    participant CartManagerService as CartManagerService
    participant CartRepository as CartRepository
    participant MongoDB as MongoDB

    Client->>JwtAuthGuard: GET /cart<br/>Authorization: Bearer {token}
    JwtAuthGuard->>JwtStrategy: Validar JWT token
    JwtStrategy-->>JwtAuthGuard: JwtPayload {sub, type, email}
    JwtAuthGuard->>CartController: Request con @CurrentUser()
    
    CartController->>CartManagerService: getOrCreateCart(user: JwtPayload)
    
    alt Usuario Registrado
        CartManagerService->>CartRepository: findByUserId(userId)
        CartRepository->>MongoDB: findOne({ userId, status: 'active' })
        MongoDB-->>CartRepository: Cart | null
        CartRepository-->>CartManagerService: Cart | null
    else Usuario Invitado
        CartManagerService->>CartRepository: findByGuestId(guestId)
        CartRepository->>MongoDB: findOne({ guestSessionId, status: 'active' })
        MongoDB-->>CartRepository: Cart | null
        CartRepository-->>CartManagerService: Cart | null
    end
    
    alt Carrito no existe
        CartManagerService->>CartRepository: create(userId, guestId, userType)
        CartRepository->>MongoDB: create({ userId/guestSessionId, items: [], status: 'active' })
        MongoDB-->>CartRepository: CartDocument
        CartRepository-->>CartManagerService: Cart
    end
    
    CartManagerService->>CartManagerService: formatCartResponse(cart)
    CartManagerService-->>CartController: CartResponse
    CartController-->>Client: 200 OK<br/>CartResponse {cartId, items, total}
```

## Flujo Detallado

1. **Autenticación**: El JWT Guard valida el token y extrae el payload del usuario
2. **Búsqueda del Carrito**: Se busca un carrito existente según el tipo de usuario
   - Usuarios registrados: búsqueda por `userId`
   - Usuarios invitados: búsqueda por `guestSessionId`
3. **Creación si no existe**: Si no se encuentra carrito, se crea uno nuevo
4. **Formateo de Respuesta**: Se calcula el total y se formatea la respuesta

## Respuesta Ejemplo

```json
{
  "cartId": "696afadbd52f03224c802944",
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

## Casos de Error

- **401 Unauthorized**: Token JWT inválido o faltante
- **500 Internal Server Error**: Error al crear o leer el carrito en MongoDB
