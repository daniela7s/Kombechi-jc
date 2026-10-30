# Kombechi

Tienda de kombucha y kéfir artesanal. El proyecto usa React y Vite para la página, Node.js y Express para la API, y MongoDB para productos y pedidos.

## Estructura

```text
Kombechi-jc/
├── backend/
│   ├── config/         conexión y carga inicial de productos
│   ├── controllers/    acciones de la API
│   ├── data/           catálogo inicial
│   ├── middleware/     acceso protegido del panel
│   ├── models/         productos y pedidos de MongoDB
│   ├── routes/         rutas de la API
│   ├── .env.example    variables necesarias
│   └── server.js       servidor Express
├── frontend/
│   ├── public/         imágenes
│   ├── src/            pantallas React
│   ├── index.html       tienda
│   └── admin.html       panel de administración
└── .github/workflows/  publicación de la página
```

## Requisitos

- Node.js 22 o superior.
- Una base de datos MongoDB accesible desde el equipo donde se ejecutará el servidor.

## Preparar MongoDB y el administrador

1. Desde la carpeta principal, instala las dependencias:

   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Copia `backend/.env.example` como `backend/.env`.
3. En `backend/.env`, agrega la URI de MongoDB y el correo del administrador.
4. Desde la carpeta principal, ejecuta `npm run admin:clave` y escribe la contraseña. El hash quedará guardado en `backend/.env`.
5. Mantén `backend/.env` privado. No lo subas al repositorio.

Si la base está vacía, el servidor agrega los seis productos iniciales. Si ya tiene productos, no los reemplaza.

## Ejecutar en localhost

Abre dos terminales en la carpeta principal:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

Abre `http://localhost:5173`. El panel está en `http://localhost:5173/admin.html`. La API se ejecuta en `http://localhost:3000`; su estado se consulta en `/api/health`.

## Funciones

- La tienda consulta productos en MongoDB y permite buscar, filtrar y ordenar el catálogo.
- El formulario guarda pedidos en MongoDB.
- El administrador inicia sesión, crea, edita y elimina productos.
- El panel muestra pedidos y permite cambiar su estado entre `Pendiente` y `Listo`. Los pedidos se conservan en MongoDB.
- Las rutas de gestión requieren iniciar sesión.

## Publicar

La guía del proyecto pide publicar la página con GitHub Pages. Como Pages solo sirve archivos estáticos, la API y MongoDB necesitan un servidor Node.js público. Esta configuración publica el frontend en Pages y conecta sus formularios con la API.

### 1. Publicar la API Node.js

En el proveedor de Node.js elegido, crea un servicio conectado a este repositorio y configura:

- Comando de instalación: `npm ci --prefix backend`
- Comando de inicio: `npm start --prefix backend`
- Node.js: versión 22 o superior.
- Comprobación de estado: `/api/health`

Agrega estas variables privadas en la configuración del servicio:

| Variable | Valor |
| --- | --- |
| `MONGODB_URI` | La URI de tu base de MongoDB |
| `ADMIN_EMAIL` | El correo de administración |
| `ADMIN_PASSWORD_HASH` | El hash generado con `npm run admin:clave` |
| `FRONTEND_URL` | `https://daniela7s.github.io` |

Configura MongoDB para aceptar conexiones del servidor de la API. Copia la dirección pública de la API, por ejemplo `https://tu-api.example.com`.

### 2. Publicar la página en GitHub Pages

1. En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como fuente de publicación.
2. Abre **Settings → Secrets and variables → Actions → Variables** y crea `VITE_API_URL` con la dirección pública de la API, sin `/` al final.
3. Sube los cambios a la rama `main`. El flujo de GitHub Actions construye el frontend y publica la tienda y el panel.
4. GitHub mostrará la dirección pública en **Settings → Pages**. El panel queda en esa misma dirección, seguido de `/admin.html`.

La dirección de la API es pública; las credenciales de MongoDB y el hash de la contraseña se mantienen únicamente en las variables privadas del servidor.

## Crear una versión local de producción

```bash
npm run build
npm start
```

Express sirve la tienda y el panel desde `frontend/dist` y la API desde el mismo servidor. Abre `http://localhost:3000`.
