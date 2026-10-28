# Kombechi

Tienda de kombucha y kéfir con React en el frontend, Express en el backend y MongoDB para guardar productos y pedidos. El panel permite agregar y eliminar productos; los pedidos se marcan como listos y se quitan de la lista.

## Preparar el proyecto

1. Instala una versión de Node.js compatible con Vite 8.
2. Desde la carpeta principal `Kombechi-jc`, instala las dependencias:
   - `npm install --prefix backend`
   - `npm install --prefix frontend`
3. Crea `backend/.env` copiando `backend/.env.example`.
4. En MongoDB Atlas, copia la URI del clúster en `MONGODB_URI`.
5. Escribe tu correo de administración en `ADMIN_EMAIL`.
6. Ejecuta `npm run admin:clave`, elige una contraseña y pega el hash que aparece en `backend/.env` como `ADMIN_PASSWORD_HASH`.

## Ejecutar en desarrollo

Abre dos terminales en la carpeta principal:

- Terminal 1: `npm run dev:api`
- Terminal 2: `npm run dev:web`

Abre la dirección local que muestra la terminal web. Para el panel, agrega `/admin.html`.

## Crear la versión de producción

Ejecuta `npm run build` y luego `npm start`. Express servirá la tienda y el panel desde `frontend/dist`.

El frontend React y sus estilos están en `frontend/src`, `frontend/styles.css` y `frontend/admin.css`. La API y sus modelos viven en `backend`.
