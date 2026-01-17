# Instrucciones para Subir a GitHub

## 1. Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `cart-service-ms`
3. Descripción: "Servicio de carrito de compras con MongoDB, JWT y Swagger"
4. Visibilidad: Privado o Público (según prefieras)
5. **NO** marques las opciones de inicializar con README, .gitignore o licencia
6. Haz clic en "Create repository"

## 2. Conectar el repositorio local con GitHub

Después de crear el repositorio, GitHub te mostrará comandos. Ejecuta estos comandos en la terminal:

```bash
# Agregar el repositorio remoto (reemplaza USERNAME con tu usuario de GitHub)
git remote add origin https://github.com/USERNAME/cart-service-ms.git

# O si usas SSH:
# git remote add origin git@github.com:USERNAME/cart-service-ms.git

# Subir el código
git push -u origin main
```

## 3. Verificar

1. Ve a https://github.com/USERNAME/cart-service-ms
2. Deberías ver todos los archivos del proyecto

## Notas

- El archivo `.env` está en `.gitignore` y no se subirá (es correcto por seguridad)
- El archivo `.env.example` se subirá como plantilla
- Todos los archivos de código fuente están incluidos
