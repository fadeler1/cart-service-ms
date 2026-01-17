# Diagrama de Secuencia - Actualizar Cantidad de Producto

## Endpoint: PUT /cart/:cartId/items

Diagrama de secuencia para actualizar la cantidad de un producto específico en el carrito.

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant JwtAuthGuard as JwtAuthGuard
    participant JwtStrategy as JwtStrategy
    participant ValidationPipe as ValidationPipe
    participant CartController as CartController
    participant CartManagerService as CartManagerService
    participant CartRepository as CartRepository
    participant MongoDB as MongoDB

    Client->>JwtAuthGuard: PUT /cart/:cartId/items<br/>Authorization: Bearer {token}<br/>Body: UpdateItemDto
    JwtAuthGuard->>JwtStrategy: Validar JWT token
    JwtStrategy-->>JwtAuthGuard: JwtPayload {sub, type, email}
    JwtAuthGuard->>ValidationPipe: Request con DTO
    ValidationPipe->>ValidationPipe: Validar UpdateItemDto<br/>(productId, quantity ≥ 1)
    
    alt Validación falla
        ValidationPipe-->>Client: 400 Bad Request<br/>{errors}
    else Validación exitosa
        ValidationPipe->>CartController: Request validado
        CartController->>CartManagerService: updateItemQuantity(cartId, user, updateItemDto)
        
        Note over CartManagerService: Llama a getCartById<br/>para validar propiedad
        CartManagerService->>CartRepository: findById(cartId)
        CartRepository->>MongoDB: findById(cartId)
        MongoDB-->>CartRepository: CartDocument
        CartRepository-->>CartManagerService: Cart
        
        CartManagerService->>CartManagerService: Validar propiedad del carrito
        
        alt Carrito no pertenece al usuario
            CartManagerService-->>CartController: BadRequestException
            CartController-->>Client: 400 Bad Request
        else Carrito válido
            CartManagerService->>CartManagerService: Buscar item<br/>findIndex(productId)
            
            alt Producto no encontrado
                CartManagerService-->>CartController: NotFoundException<br/>"Producto con id {productId} no encontrado"
                CartController-->>Client: 404 Not Found
            else Producto encontrado
                CartManagerService->>CartManagerService: Actualizar cantidad<br/>items[index].quantity = updateItemDto.quantity
                
                CartManagerService->>CartRepository: update(cart)
                CartRepository->>MongoDB: findByIdAndUpdate(cartId, {items, updatedAt})
                MongoDB-->>CartRepository: CartDocument actualizado
                CartRepository-->>CartManagerService: Cart actualizado
                
                CartManagerService->>CartManagerService: formatCartResponse(cart)
                CartManagerService-->>CartController: CartResponse
                CartController-->>Client: 200 OK<br/>CartResponse {cartId, items, total}
            end
        end
    end
```

## Flujo Detallado

1. **Autenticación y Validación**: 
   - Validación del JWT
   - Validación del DTO (productId requerido, quantity ≥ 1)
2. **Validación del Carrito**: Se verifica que el carrito exista y pertenezca al usuario
3. **Búsqueda del Producto**: Se busca el producto en el array de items del carrito
4. **Actualización**: Se actualiza la cantidad del producto encontrado
5. **Persistencia**: Se guarda el carrito actualizado en MongoDB
6. **Respuesta**: Se retorna el carrito completo con el total actualizado

## Request Body

```json
{
  "productId": "prod-123",
  "quantity": 5
}
```

## Respuesta Ejemplo

```json
{
  "cartId": "696afadbd52f03224c802944",
  "items": [
    {
      "productId": "prod-123",
      "quantity": 5,
      "price": 29.99,
      "name": "Producto Ejemplo"
    }
  ],
  "total": 149.95
}
```

## Casos de Error

- **401 Unauthorized**: Token JWT inválido o faltante
- **400 Bad Request**: DTO inválido o carrito no pertenece al usuario
- **404 Not Found**: Carrito o producto no encontrado en el carrito
