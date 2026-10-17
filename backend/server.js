const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importamos el modelo para poder usarlo en las rutas
const Producto = require('./models/productos.js');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// conexion a mongo 
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ ¡CONECTADO CON ÉXITO A MONGO ATLAS!"))
    .catch((err) => console.error("❌ ERROR DE CONEXIÓN A MONGO:", err.message));

//  Cargar los productos JSON
const productos = require('./productos.json');
console.log('Archivo cargado:', require.resolve('./productos.json'));
console.log('Cantidad de productos:', productos.length);

// Enviar datos a mongo
const migrarProductos = async () => {
    try {
        const conteo = await Producto.countDocuments();
        if (productos.length > 0) {
            console.log('🌱 Base de datos vacía. Subiendo productos desde productos.json...');
            await Producto.insertMany(productos);
            console.log('✅ ¡Todos los productos fueron subidos con éxito a Atlas!');
        }
    } catch (error) {
        console.error('❌ Error al migrar datos:', error.message);
    }
};
// Ejecutar la migración automática
migrarProductos();

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const listaProductos = await Producto.find();
        res.json(listaProductos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos de la base de datos' });
    }
});

//Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findOne({ id: Number(req.params.id) });

        if (!producto) {
            return res.status(404).json({ error: 'No encontrado' });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar el producto' });
    }
});

// verificar el estado de Atlas
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "Backend vivo y conectado a Atlas" });
});

//  Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
