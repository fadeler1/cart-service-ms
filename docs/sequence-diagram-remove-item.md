# Diagrama de Secuencia - Eliminar Producto del Carrito

## Endpoint: DELETE /cart/:cartId/items/:productId

Diagrama de secuencia para eliminar un producto del carrito completamente.

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant JwtAuthGuard as JwtAuthGuard
    participant JwtStrategy as JwtStrategy
    participant CartController as CartController
    participant CartManagerService as CartManagerService
    participant CartRepository as CartRepository
    participant MongoDB as MongoDB

    Client->>JwtAuthGuard: DELETE /cart/:cartId/items/:productId<br/>Authorization: Bearer {token}
    JwtAuthGuard->>JwtStrategy: Validar JWT token
    JwtStrategy-->>JwtAuthGuard: JwtPayload {sub, type, email}
    JwtAuthGuard->>CartController: Request con @CurrentUser()<br/>@Param('cartId')<br/>@Param('productId')
    
    CartController->>CartManagerService: removeItemFromCart(cartId, user, productId)
    
    Note over CartManagerService: Llama a getCartById<br/>para validar propiedad
    CartManagerService->>CartRepository: findById(cartId)
    CartRepository->>MongoDB: findById(cartId)
    MongoDB-->>CartRepository: CartDocument
    CartRepository-->>CartManagerService: Cart
    
    CartManagerService->>CartManagerService: Validar propiedad del carrito
    
    alt Carrito no encontrado
        CartManagerService-->>CartController: NotFoundException<br/>"Carrito con id {cartId} no encontrado"
        CartController-->>Client: 404 Not Found
    else Carrito no pertenece al usuario
        CartManagerService-->>CartController: BadRequestException<br/>"El carrito no pertenece al usuario actual"
        CartController-->>Client: 400 Bad Request
    else Carrito válido
        CartManagerService->>CartManagerService: Buscar item<br/>findIndex(productId)
        
        alt Producto no encontrado
            CartManagerService-->>CartController: NotFoundException<br/>"Producto con id {productId} no encontrado"
            CartController-->>Client: 404 Not Found
        else Producto encontrado
            CartManagerService->>CartManagerService: Eliminar item<br/>items.splice(index, 1)
            
            CartManagerService->>CartRepository: update(cart)
            CartRepository->>MongoDB: findByIdAndUpdate(cartId, {items, updatedAt})
            MongoDB-->>CartRepository: CartDocument actualizado
            CartRepository-->>CartManagerService: Cart actualizado
            
            CartManagerService->>CartManagerService: formatCartResponse(cart)
            CartManagerService-->>CartController: CartResponse
            CartController-->>Client: 200 OK<br/>CartResponse {cartId, items, total}
        end
    end
```

## Flujo Detallado

1. **Autenticación**: Validación del token JWT
2. **Validación del Carrito**: 
   - Se busca el carrito por ID
   - Se verifica que exista y pertenezca al usuario
3. **Búsqueda del Producto**: Se busca el producto en el array de items
4. **Eliminación**: Si se encuentra, se elimina del array usando `splice()`
5. **Persistencia**: Se guarda el carrito actualizado en MongoDB
6. **Respuesta**: Se retorna el carrito completo con el total recalculado

## Respuesta Ejemplo

Si el carrito tenía 2 productos y se elimina uno:

```json
{
  "cartId": "696afadbd52f03224c802944",
  "items": [
    {
      "productId": "prod-456",
      "quantity": 1,
      "price": 19.99,
      "name": "Otro Producto"
    }
  ],
  "total": 19.99
}
```

## Casos de Error

- **401 Unauthorized**: Token JWT inválido o faltante
- **400 Bad Request**: El carrito no pertenece al usuario actual
- **404 Not Found**: Carrito o producto no encontrado

## Notas

- La eliminación es permanente: el producto se remueve completamente del carrito
- El total se recalcula automáticamente después de la eliminación
- Si el carrito queda vacío, el array `items` será `[]` y el `total` será `0`
