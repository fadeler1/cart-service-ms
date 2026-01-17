# Diagrama de Secuencia - Añadir Producto al Carrito

## Endpoint: POST /cart/:cartId/items

Diagrama de secuencia para añadir un producto al carrito. Si el producto ya existe, incrementa su cantidad.

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

    Client->>JwtAuthGuard: POST /cart/:cartId/items<br/>Authorization: Bearer {token}<br/>Body: AddItemDto
    JwtAuthGuard->>JwtStrategy: Validar JWT token
    JwtStrategy-->>JwtAuthGuard: JwtPayload {sub, type, email}
    JwtAuthGuard->>ValidationPipe: Request con DTO
    ValidationPipe->>ValidationPipe: Validar AddItemDto<br/>(productId, quantity, price, name)
    
    alt Validación falla
        ValidationPipe-->>Client: 400 Bad Request<br/>{errors}
    else Validación exitosa
        ValidationPipe->>CartController: Request validado
        CartController->>CartManagerService: addItemToCart(cartId, user, addItemDto)
        
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
            CartManagerService->>CartManagerService: Buscar item existente<br/>findIndex(productId)
            
            alt Producto ya existe
                CartManagerService->>CartManagerService: Incrementar cantidad<br/>items[index].quantity += addItemDto.quantity
            else Producto nuevo
                CartManagerService->>CartManagerService: Añadir nuevo item<br/>items.push({productId, quantity, price, name})
            end
            
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

1. **Autenticación y Validación**: 
   - Validación del JWT
   - Validación del DTO (productId, quantity ≥ 1, price ≥ 0, name requerido)
2. **Validación del Carrito**: Se verifica que el carrito exista y pertenezca al usuario
3. **Gestión del Item**:
   - Si el producto ya existe: se incrementa la cantidad
   - Si el producto es nuevo: se añade al array de items
4. **Actualización en MongoDB**: Se guarda el carrito actualizado
5. **Respuesta Formateada**: Se calcula el total y se retorna el carrito completo

## Request Body

```json
{
  "productId": "prod-123",
  "quantity": 2,
  "price": 29.99,
  "name": "Producto Ejemplo"
}
```

## Respuesta Ejemplo

```json
{
  "cartId": "696afadbd52f03224c802944",
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

## Casos de Error

- **401 Unauthorized**: Token JWT inválido o faltante
- **400 Bad Request**: DTO inválido o carrito no pertenece al usuario
- **404 Not Found**: Carrito no encontrado
