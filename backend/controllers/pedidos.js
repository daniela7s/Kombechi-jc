const Pedido = require('../models/pedidos');

async function crearPedido(req, res) {
  const { nombre, correo, telefono, producto, productoId, cantidad, mensaje = '' } = req.body || {};
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo || '').trim());
  if (!String(nombre || '').trim() || String(nombre).length > 100 || !correoValido ||
      !String(telefono || '').trim() || String(telefono).length > 40 ||
      !String(producto || '').trim() || String(producto).length > 100 ||
      !Number.isInteger(Number(cantidad)) || Number(cantidad) < 1 || Number(cantidad) > 99 || String(mensaje).length > 1000) {
    return res.status(400).json({ error: 'Completa tus datos y el producto que quieres pedir.' });
  }
  try {
    const pedido = await Pedido.create({
      nombre: String(nombre).trim(),
      correo: String(correo).trim(),
      telefono: String(telefono).trim(),
      producto: String(producto).trim(),
      productoId: Number(productoId) || undefined,
      cantidad: Number(cantidad),
      mensaje: String(mensaje).trim(),
    });
    res.status(201).json({ mensaje: 'Tu pedido quedó registrado.', pedidoId: pedido.id });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo registrar el pedido.' });
  }
}

async function listarPedidos(req, res) {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 }).lean();
    res.json(pedidos.map((pedido) => ({ ...pedido, estado: pedido.estado || 'Pendiente' })));
  } catch (error) {
    res.status(503).json({ error: 'No se pudieron cargar los pedidos.' });
  }
}

async function actualizarEstadoPedido(req, res) {
  const { estado } = req.body || {};
  if (!['Pendiente', 'Listo'].includes(estado)) {
    return res.status(400).json({ error: 'El estado debe ser Pendiente o Listo.' });
  }
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, { estado }, { new: true, runValidators: true });
    if (!pedido) return res.status(404).json({ error: 'No se encontró el pedido.' });
    res.json({ mensaje: `Pedido actualizado: ${estado}.`, pedido });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo actualizar el pedido.' });
  }
}

module.exports = { actualizarEstadoPedido, crearPedido, listarPedidos };
