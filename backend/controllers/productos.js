const Producto = require('../models/productos');

function datosValidos(body) {
  return String(body?.nombre || '').trim() &&
    String(body.nombre).length <= 70 &&
    ['Kombucha', 'Kéfir'].includes(body?.categoria) &&
    Number.isFinite(Number(body?.precio)) && Number(body.precio) >= 0 &&
    String(body?.descripcion || '').trim() && String(body.descripcion).length <= 500 &&
    String(body?.imagen || '').length <= 500;
}

async function listarProductos(req, res) {
  try {
    res.json(await Producto.find().sort({ id: 1 }).lean());
  } catch (error) {
    res.status(503).json({ error: 'No se pudieron cargar los productos. Revisa la conexión con MongoDB.' });
  }
}

async function crearProducto(req, res) {
  const { nombre, categoria, precio, descripcion, imagen = '', destacado = false } = req.body || {};
  if (!datosValidos(req.body)) return res.status(400).json({ error: 'Completa nombre, categoría, precio y descripción.' });
  try {
    const ultimo = await Producto.findOne().sort({ id: -1 }).select('id').lean();
    const producto = await Producto.create({
      id: (ultimo?.id || 0) + 1,
      nombre: String(nombre).trim(),
      categoria,
      precio: Number(precio),
      descripcion: String(descripcion).trim(),
      imagen: String(imagen).trim(),
      destacado: Boolean(destacado),
    });
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar el producto.' });
  }
}

async function actualizarProducto(req, res) {
  const { nombre, categoria, precio, descripcion, imagen = '', destacado = false } = req.body || {};
  if (!datosValidos(req.body)) return res.status(400).json({ error: 'Completa nombre, categoría, precio y descripción.' });
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, {
      nombre: String(nombre).trim(),
      categoria,
      precio: Number(precio),
      descripcion: String(descripcion).trim(),
      imagen: String(imagen).trim(),
      destacado: Boolean(destacado),
    }, { new: true, runValidators: true });
    if (!producto) return res.status(404).json({ error: 'No se encontró el producto.' });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: 'No se pudieron guardar los cambios del producto.' });
  }
}

async function eliminarProducto(req, res) {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ error: 'No se encontró el producto.' });
    res.json({ mensaje: 'Producto eliminado.' });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo eliminar el producto.' });
  }
}

module.exports = { actualizarProducto, crearProducto, eliminarProducto, listarProductos };
