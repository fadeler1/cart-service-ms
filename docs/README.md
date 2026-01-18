# Diagramas de Secuencia - Cart Service

Esta carpeta contiene los diagramas de secuencia para cada endpoint del servicio de carrito.

## Endpoints Documentados

### 1. Health Check
📄 [sequence-diagram-health.md](./sequence-diagram-health.md)
- **Endpoint**: `GET /health`
- **Descripción**: Verifica el estado de salud del servicio
- **Autenticación**: No requiere

### 2. Obtener o Crear Carrito
📄 [sequence-diagram-get-cart.md](./sequence-diagram-get-cart.md)
- **Endpoint**: `GET /cart`
- **Descripción**: Obtiene el carrito del usuario actual o crea uno nuevo
- **Autenticación**: JWT requerido

### 3. Obtener Carrito por ID
📄 [sequence-diagram-get-cart-by-id.md](./sequence-diagram-get-cart-by-id.md)
- **Endpoint**: `GET /cart/:cartId`
- **Descripción**: Obtiene un carrito específico validando propiedad
- **Autenticación**: JWT requerido

### 4. Añadir Producto al Carrito
📄 [sequence-diagram-add-item.md](./sequence-diagram-add-item.md)
- **Endpoint**: `POST /cart/:cartId/items`
- **Descripción**: Añade un producto al carrito o incrementa su cantidad
- **Autenticación**: JWT requerido

### 5. Actualizar Cantidad de Producto
📄 [sequence-diagram-update-item.md](./sequence-diagram-update-item.md)
- **Endpoint**: `PUT /cart/:cartId/items`
- **Descripción**: Actualiza la cantidad de un producto en el carrito
- **Autenticación**: JWT requerido

### 6. Eliminar Producto del Carrito
📄 [sequence-diagram-remove-item.md](./sequence-diagram-remove-item.md)
- **Endpoint**: `DELETE /cart/:cartId/items/:productId`
- **Descripción**: Elimina un producto del carrito completamente
- **Autenticación**: JWT requerido

### 7. Fusionar Carrito de Invitado
📄 [sequence-diagram-merge-cart.md](./sequence-diagram-merge-cart.md)
- **Endpoint**: `POST /cart/merge`
- **Descripción**: Fusiona el carrito de invitado con el carrito del usuario registrado
- **Autenticación**: JWT requerido (solo usuarios registrados)

## Formato de los Diagramas

Los diagramas están en formato **Mermaid**, que es renderizado automáticamente por:

- ✅ GitHub (al ver los archivos .md)
- ✅ GitLab
- ✅ Bitbucket
- ✅ Muchos editores Markdown modernos

### Ver los Diagramas

Puedes ver los diagramas de varias formas:

1. **En GitHub**: Navega a la carpeta `docs/` en el repositorio y abre cualquier archivo `.md`
2. **En VS Code**: Instala la extensión "Markdown Preview Mermaid Support"
3. **Online**: Copia el código Mermaid y pégalo en https://mermaid.live/

## Componentes del Diagrama

Los diagramas muestran la interacción entre:

- **Cliente**: El cliente HTTP (aplicación frontend, Postman, etc.)
- **JwtAuthGuard**: Guard de autenticación NestJS
- **JwtStrategy**: Estrategia de validación de JWT
- **ValidationPipe**: Pipe de validación de DTOs
- **CartController**: Controlador REST del carrito
- **CartManagerService**: Servicio de lógica de negocio
- **CartRepository**: Repositorio de acceso a datos
- **MongoDB**: Base de datos MongoDB

## Flujo General

La mayoría de los endpoints siguen este flujo:

1. **Autenticación**: Validación del JWT mediante JwtAuthGuard
2. **Validación**: Validación de DTOs y parámetros mediante ValidationPipe
3. **Autorización**: Verificación de que el recurso pertenece al usuario
4. **Lógica de Negocio**: Procesamiento en CartManagerService
5. **Persistencia**: Guardado/lectura en MongoDB mediante CartRepository
6. **Respuesta**: Formateo y retorno de la respuesta al cliente

## Notas Técnicas

- Todos los endpoints del carrito (excepto `/health`) requieren autenticación JWT
- Los carritos se almacenan en la colección `CART` de MongoDB
- Los usuarios registrados usan `userId` (ObjectId)
- Los usuarios invitados usan `guestSessionId` (string)
- Todos los carritos activos tienen `status: 'active'`
