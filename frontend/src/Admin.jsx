import { createRoot } from 'react-dom/client';

const API_URL = import.meta.env.VITE_API_URL || '';
const moneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

function FilasProductos({ productos, eliminar, editar }) {
  if (!productos.length) return <tr><td colSpan="5">Todavía no hay productos.</td></tr>;
  return productos.map((producto) => <tr key={producto._id}>
    <td>{producto.nombre}</td><td>{producto.categoria}</td><td>{producto.descripcion}</td>
    <td>{moneda.format(producto.precio)}</td><td><div className="acciones-tabla-producto">
      <button className="boton-secundario" type="button" onClick={() => editar(producto)}>Editar</button>
      <button className="boton-secundario" type="button" onClick={() => eliminar(producto._id)}>Eliminar</button>
    </div></td>
  </tr>);
}

function TarjetasPedidos({ pedidos, marcarEstado }) {
  if (!pedidos.length) return <p className="nota-vacia">Todavía no hay pedidos guardados.</p>;
  return pedidos.map((pedido) => <article className="tarjeta-solicitud" key={pedido._id}>
    <div className="encabezado-solicitud"><strong>{pedido.nombre}</strong><time>{new Date(pedido.createdAt).toLocaleString('es-CO')}</time></div>
    <p><strong>Producto:</strong> {pedido.producto} · <strong>Cantidad:</strong> {pedido.cantidad}</p>
    <p><strong>Contacto:</strong> <a href={`mailto:${pedido.correo}`}>{pedido.correo}</a> · {pedido.telefono}</p>
    {pedido.mensaje && <p><strong>Mensaje:</strong> {pedido.mensaje}</p>}
    <p><strong>Estado:</strong> {pedido.estado || 'Pendiente'}</p>
    <button className="boton-secundario" type="button" onClick={() => marcarEstado(pedido._id, pedido.estado === 'Listo' ? 'Pendiente' : 'Listo')}>
      {pedido.estado === 'Listo' ? 'Marcar pendiente' : 'Marcar listo'}
    </button>
  </article>);
}

export function iniciarAdmin() {
  const formularioAcceso = document.getElementById('formulario-acceso');
  const formularioProducto = document.getElementById('formulario-producto');
  const acceso = document.getElementById('acceso-admin');
  const panel = document.getElementById('panel-admin');
  const estadoAcceso = document.getElementById('estado-acceso');
  const estadoProducto = document.getElementById('estado-producto');
  const botonGuardarProducto = document.getElementById('boton-guardar-producto');
  const botonCancelarEdicion = document.getElementById('boton-cancelar-edicion');
  const tabla = document.getElementById('lista-productos-admin');
  const listaPedidos = document.getElementById('lista-solicitudes-admin');
  const botonSalir = document.getElementById('boton-cerrar-sesion');
  if (!formularioAcceso || !formularioProducto || !tabla || !listaPedidos) return;

  const raizProductos = createRoot(tabla);
  const raizPedidos = createRoot(listaPedidos);
  let token = sessionStorage.getItem('kombechi-admin-token');
  let productosActuales = [];
  let pedidosActuales = [];
  let productoEditandoId = null;
  const api = async (url, opciones = {}) => {
    const respuesta = await fetch(`${API_URL}${url}`, {
      ...opciones,
      headers: {
        ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opciones.headers,
      },
    });
    const tipoContenido = respuesta.headers.get('content-type') || '';
    if (!tipoContenido.includes('application/json')) {
      throw new Error(`La API no respondió con datos (HTTP ${respuesta.status}). Revisa la dirección y que el servidor esté disponible.`);
    }
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error || 'No se pudo completar la solicitud.');
    return datos;
  };
  const mostrarAcceso = () => { acceso.hidden = false; panel.hidden = true; };
  const mostrarPanel = () => { acceso.hidden = true; panel.hidden = false; };
  const renderizar = () => {
    raizProductos.render(<FilasProductos productos={productosActuales} eliminar={eliminarProducto} editar={editarProducto} />);
    raizPedidos.render(<TarjetasPedidos pedidos={pedidosActuales} marcarEstado={marcarEstado} />);
    document.getElementById('contador-productos').textContent = String(productosActuales.length);
    document.getElementById('contador-categorias').textContent = String(new Set(productosActuales.map((producto) => producto.categoria)).size);
    document.getElementById('contador-solicitudes').textContent = String(pedidosActuales.filter((pedido) => pedido.estado !== 'Listo').length);
  };
  async function cargarDatos() {
    try {
      const [productos, pedidos] = await Promise.all([api('/api/productos'), api('/api/pedidos')]);
      productosActuales = productos;
      pedidosActuales = pedidos;
      renderizar();
      if (estadoProducto) estadoProducto.textContent = '';
      return true;
    } catch (error) {
      if (error.message.includes('Inicia sesión')) {
        sessionStorage.removeItem('kombechi-admin-token');
        token = null;
        mostrarAcceso();
        estadoAcceso.textContent = 'La sesión terminó. Ingresa nuevamente.';
      } else if (estadoProducto) {
        estadoProducto.textContent = error.message;
      }
      return false;
    }
  }
  async function eliminarProducto(id) {
    try {
      await api(`/api/productos/${id}`, { method: 'DELETE' });
      await cargarDatos();
      estadoProducto.textContent = 'Producto eliminado.';
    } catch (error) { estadoProducto.textContent = error.message; }
  }
  function editarProducto(producto) {
    productoEditandoId = producto._id;
    formularioProducto.elements.nombre.value = producto.nombre;
    formularioProducto.elements.categoria.value = producto.categoria;
    formularioProducto.elements.descripcion.value = producto.descripcion;
    formularioProducto.elements.precio.value = String(producto.precio);
    formularioProducto.elements.imagen.value = producto.imagen || '';
    formularioProducto.elements.destacado.checked = Boolean(producto.destacado);
    botonGuardarProducto.textContent = 'Guardar cambios';
    botonCancelarEdicion.hidden = false;
    estadoProducto.textContent = `Editando: ${producto.nombre}`;
    formularioProducto.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function cancelarEdicion() {
    productoEditandoId = null;
    formularioProducto.reset();
    formularioProducto.elements.categoria.value = 'Kombucha';
    botonGuardarProducto.textContent = 'Agregar producto';
    botonCancelarEdicion.hidden = true;
    estadoProducto.textContent = '';
  }
  async function marcarEstado(id, estado) {
    try {
      const resultado = await api(`/api/pedidos/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      pedidosActuales = pedidosActuales.map((pedido) => pedido._id === id ? resultado.pedido : pedido);
      renderizar();
    } catch (error) { estadoProducto.textContent = error.message; }
  }

  formularioAcceso.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    estadoAcceso.textContent = '';
    const datos = Object.fromEntries(new FormData(formularioAcceso).entries());
    try {
      const respuesta = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo iniciar sesión.');
      token = resultado.token;
      sessionStorage.setItem('kombechi-admin-token', token);
      mostrarPanel();
      formularioAcceso.reset();
      await cargarDatos();
    } catch (error) { estadoAcceso.textContent = error.message; }
  });

  formularioProducto.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const campos = Object.fromEntries(new FormData(formularioProducto).entries());
    campos.precio = Number(campos.precio);
    campos.destacado = new FormData(formularioProducto).has('destacado');
    try {
      const editando = Boolean(productoEditandoId);
      const ruta = editando ? `/api/productos/${productoEditandoId}` : '/api/productos';
      await api(ruta, { method: editando ? 'PUT' : 'POST', body: JSON.stringify(campos) });
      cancelarEdicion();
      await cargarDatos();
      estadoProducto.textContent = editando ? 'Cambios guardados en MongoDB.' : 'Producto agregado al catálogo.';
    } catch (error) { estadoProducto.textContent = error.message; }
  });

  botonCancelarEdicion?.addEventListener('click', cancelarEdicion);

  botonSalir?.addEventListener('click', async () => {
    try { await api('/api/admin/logout', { method: 'POST' }); } catch { /* Se cierra la sesión local igualmente. */ }
    sessionStorage.removeItem('kombechi-admin-token');
    token = null;
    mostrarAcceso();
  });

  if (token) {
    mostrarPanel();
    cargarDatos();
  } else {
    mostrarAcceso();
    renderizar();
  }
}
