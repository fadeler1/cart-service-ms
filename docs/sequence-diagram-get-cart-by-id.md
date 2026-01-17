# Diagrama de Secuencia - Obtener Carrito por ID

## Endpoint: GET /cart/:cartId

Diagrama de secuencia para obtener un carrito específico validando que pertenezca al usuario.

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant JwtAuthGuard as JwtAuthGuard
    participant JwtStrategy as JwtStrategy
    participant CartController as CartController
    participant CartManagerService as CartManagerService
    participant CartRepository as CartRepository
    participant MongoDB as MongoDB

    Client->>JwtAuthGuard: GET /cart/:cartId<br/>Authorization: Bearer {token}
    JwtAuthGuard->>JwtStrategy: Validar JWT token
    JwtStrategy-->>JwtAuthGuard: JwtPayload {sub, type, email}
    JwtAuthGuard->>CartController: Request con @CurrentUser()<br/>@Param('cartId')
    
    CartController->>CartManagerService: getCartById(cartId, user)
    
    CartManagerService->>CartRepository: findById(cartId)
    CartRepository->>MongoDB: findById(cartId)
    MongoDB-->>CartRepository: CartDocument | null
    CartRepository-->>CartManagerService: Cart | null
    
    alt Carrito no encontrado
        CartManagerService-->>CartController: NotFoundException<br/>"Carrito con id {cartId} no encontrado"
        CartController-->>Client: 404 Not Found
    else Carrito encontrado
        CartManagerService->>CartManagerService: Validar tipo de usuario<br/>(registered vs guest)
        
        alt Tipo de usuario no coincide
            CartManagerService-->>CartController: BadRequestException<br/>"El carrito no pertenece al tipo de usuario actual"
            CartController-->>Client: 400 Bad Request
        else Tipo coincide, validar propiedad
            alt Carrito no pertenece al usuario
                CartManagerService-->>CartController: BadRequestException<br/>"El carrito no pertenece al usuario actual"
                CartController-->>Client: 400 Bad Request
            else Carrito válido
                CartManagerService->>CartManagerService: formatCartResponse(cart)
                CartManagerService-->>CartController: CartResponse
                CartController-->>Client: 200 OK<br/>CartResponse {cartId, items, total}
            end
        end
    end
```

## Flujo Detallado

1. **Autenticación**: Validación del token JWT
2. **Búsqueda por ID**: Se busca el carrito en MongoDB por su `_id`
3. **Validación de Propiedad**: 
   - Verifica que el `userType` coincida (registered/guest)
   - Verifica que el `userId` o `guestId` del carrito coincida con el del JWT
4. **Formateo de Respuesta**: Si todas las validaciones pasan, se formatea la respuesta

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
- **404 Not Found**: Carrito no encontrado en MongoDB
- **400 Bad Request**: El carrito no pertenece al usuario actual
