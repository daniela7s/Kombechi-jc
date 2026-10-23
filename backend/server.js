
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar el modelo y las rutas
const Producto = require('./models/Producto.js');
const productosRoutes = require('./routes/productos.js');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('¡Conectado con éxito a MongoDB Atlas!');
    })
    .catch((err) => {
        console.error('Error de conexión a MongoDB:', err.message);
    });

// Cargar los productos del archivo JSON
const productos = require('./data/productos.json');

console.log(
    'Archivo cargado:',
    require.resolve('./data/productos.json')
);
console.log('Cantidad de productos:', productos.length);

// Migrar los productos a MongoDB si la colección está vacía
const migrarProductos = async () => {
    try {
        const conteo = await Producto.countDocuments();

        if (conteo === 0 && productos.length > 0) {
            console.log('Subiendo productos iniciales a Atlas...');

            await Producto.insertMany(productos);

            console.log('Productos subidos con éxito a Atlas');
        }
    } catch (error) {
        console.error('Error al migrar datos:', error.message);
    }
};

// Registrar las rutas de productos
app.use('/api/productos', productosRoutes);

// Verificar el estado del backend
app.get('/api/prueba', (req, res) => {
    res.json({
        mensaje: 'Backend vivo y conectado a Atlas'
    });
});

// Iniciar el servidor después de conectar con MongoDB
mongoose.connection.once('open', async () => {
    await migrarProductos();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
});
