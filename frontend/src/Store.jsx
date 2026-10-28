import { useEffect, useMemo, useState } from 'react';

const moneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

async function cargarProductos() {
  const respuesta = await fetch('/api/productos');
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || 'No se pudieron cargar los productos.');
  return Array.isArray(datos) ? datos : [];
}

export function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState(() => new URLSearchParams(location.search).get('categoria') || '');
  const [orden, setOrden] = useState('destacados');
  const [cantidades, setCantidades] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const buscador = document.getElementById('buscador-productos');
    const filtro = document.getElementById('filtro-categoria');
    const selectorOrden = document.getElementById('orden-productos');
    const actualizarBusqueda = (evento) => setBusqueda(evento.target.value);
    const actualizarCategoria = (evento) => setCategoria(evento.target.value);
    const actualizarOrden = (evento) => setOrden(evento.target.value);
    buscador?.addEventListener('input', actualizarBusqueda);
    filtro?.addEventListener('change', actualizarCategoria);
    selectorOrden?.addEventListener('change', actualizarOrden);
    if (filtro) filtro.value = categoria;
    cargarProductos().then(setProductos).catch((problema) => setError(problema.message));
    return () => {
      buscador?.removeEventListener('input', actualizarBusqueda);
      filtro?.removeEventListener('change', actualizarCategoria);
      selectorOrden?.removeEventListener('change', actualizarOrden);
    };
  }, []);

  const visibles = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es');
    const lista = productos.filter((producto) =>
      (!categoria || producto.categoria === categoria) &&
      `${producto.nombre || ''} ${producto.descripcion || ''}`.toLocaleLowerCase('es').includes(consulta),
    );
    if (orden === 'nombre') return lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
    if (orden === 'precio-menor-mayor') return lista.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (orden === 'precio-mayor-menor') return lista.sort((a, b) => Number(b.precio) - Number(a.precio));
    return lista.sort((a, b) => Number(b.destacado) - Number(a.destacado));
  }, [productos, busqueda, categoria, orden]);

  useEffect(() => {
    const estado = document.getElementById('estado-catalogo');
    if (estado) estado.textContent = error || `${visibles.length} productos`;
  }, [error, visibles.length]);

  function pedir(producto, cantidad) {
    const campoProducto = document.getElementById('producto-seleccionado');
    const campoCantidad = document.getElementById('cantidad-pedida');
    if (campoProducto) campoProducto.value = producto.nombre;
    if (campoCantidad) campoCantidad.value = String(cantidad);
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }

  return <>
    {visibles.map((producto, indice) => {
      const cantidad = cantidades[producto._id] || 1;
      return <article className="tarjeta-producto" key={producto._id || producto.id}>
        <div className={`imagen-producto tono-${(indice % 4) + 1}`}>
          {producto.imagen ? <img src={producto.imagen} alt={producto.nombre} loading="lazy" /> : null}
          <span className="etiqueta-producto">{producto.categoria}</span>
        </div>
        <div className="info-producto">
          <div><h2>{producto.nombre}</h2><p>{producto.categoria}</p><p className="descripcion-producto">{producto.descripcion}</p></div>
          <span className="precio">{moneda.format(Number(producto.precio) || 0)}</span>
        </div>
        <div className="cantidad-producto"><span>Cantidad</span><div className="controles-cantidad">
          <button className="boton-cantidad disminuir-cantidad" type="button" aria-label={`Disminuir cantidad de ${producto.nombre}`} onClick={() => setCantidades((actuales) => ({ ...actuales, [producto._id]: Math.max(1, cantidad - 1) }))}>−</button>
          <span className="numero-cantidad">{cantidad}</span>
          <button className="boton-cantidad aumentar-cantidad" type="button" aria-label={`Aumentar cantidad de ${producto.nombre}`} onClick={() => setCantidades((actuales) => ({ ...actuales, [producto._id]: cantidad + 1 }))}>+</button>
        </div></div>
        <a className="boton-tarjeta" href="#contacto" onClick={() => pedir(producto, cantidad)}>Comprar ahora</a>
      </article>;
    })}
    {!visibles.length && <p className="sin-resultados">{error || 'No hay productos para mostrar.'}</p>}
  </>;
}

export function Destacados() {
  const [productos, setProductos] = useState([]);
  useEffect(() => {
    cargarProductos().then((lista) => setProductos(lista.filter((producto) => producto.destacado).slice(0, 3))).catch(() => setProductos([]));
  }, []);
  return <>
    {productos.map((producto) => <article className="tarjeta-destacada" key={producto._id || producto.id}>
      <div className="imagen-destacada">
        {producto.imagen ? <img src={producto.imagen} alt={producto.nombre} loading="lazy" /> : null}
      </div>
      <div className="info-destacada"><h3>{producto.nombre}</h3><div className="fila-destacada"><span className="precio">{moneda.format(Number(producto.precio) || 0)}</span><a className="boton-destacado" href="#catalogo">Ver producto</a></div></div>
    </article>)}
  </>;
}

export function conectarFormularioPedido() {
  const formulario = document.getElementById('formulario-contacto');
  const estado = document.getElementById('estado-contacto');
  if (!formulario || !estado) return;
  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = Object.fromEntries(new FormData(formulario).entries());

    try {
      const respuesta = await fetch('/api/pedidos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, cantidad: Number(datos.cantidad) }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo enviar el pedido.');
      formulario.reset();
      estado.textContent = 'Tu pedido fue enviado. La tienda se pondrá en contacto contigo.';
    } catch (problema) {
      estado.textContent = problema.message;
    }
  });
}

