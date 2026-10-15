// datos iniciales del catálogo
const productosIniciales = [
  { id: "1", nombre: "Kombucha de limón y jengibre", categoria: "Kombucha", descripcion: "Bebida fermentada, cítrica y refrescante.", precio: 12000, moneda: "COP", imagen: "", destacado: true },
  { id: "2", nombre: "Kombucha de frutos rojos", categoria: "Kombucha", descripcion: "Una combinación frutal con un toque ácido.", precio: 12000, moneda: "COP", imagen: "", destacado: true },
  { id: "3", nombre: "Kombucha de piña", categoria: "Kombucha", descripcion: "Perfil tropical, fresco y afrutado.", precio: 12000, moneda: "COP", imagen: "", destacado: true },
  { id: "4", nombre: "Kéfir natural", categoria: "Kéfir", descripcion: "Bebida fermentada de sabor suave y cremoso.", precio: 10000, moneda: "COP", imagen: "", destacado: false },
  { id: "5", nombre: "Kéfir de fresa", categoria: "Kéfir", descripcion: "Una versión frutal con sabor a fresa.", precio: 11000, moneda: "COP", imagen: "", destacado: false },
  { id: "6", nombre: "Kéfir de frutos rojos", categoria: "Kéfir", descripcion: "Alternativa frutal para ampliar el catálogo.", precio: 11000, moneda: "COP", imagen: "", destacado: false }
];

const claveProductos = "kombechiProductos2026";
const claveSolicitudes = "kombechiSolicitudes";

document.addEventListener("DOMContentLoaded", function () {
  iniciarTienda();
  iniciarFormularioContacto();
  iniciarAdministracion();
});

function leerDatos(clave, datosIniciales) {
  const datosGuardados = localStorage.getItem(clave);

  if (datosGuardados) {
    try {
      return JSON.parse(datosGuardados);
    } catch (error) {
      console.error("No se pudieron leer los datos guardados.", error);
    }
  }

  return datosIniciales.map(function (dato) {
    return { ...dato };
  });
}

function guardarDatos(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

function obtenerProductos() {
  return leerDatos(claveProductos, productosIniciales);
}

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function mostrarPrecio(precio) {
  return "$" + Number(precio || 0).toLocaleString("es-CO") + " COP";
}

// catálogo: búsqueda, filtros, orden y cantidades
function iniciarTienda() {
  const cuadricula = document.getElementById("cuadricula-productos");
  if (!cuadricula) return;

  const buscador = document.getElementById("buscador-productos");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const ordenProductos = document.getElementById("orden-productos");
  const estadoCatalogo = document.getElementById("estado-catalogo");
  const categoriaUrl = new URLSearchParams(window.location.search).get("categoria");
  if (categoriaUrl) filtroCategoria.value = categoriaUrl;

  function actualizarCatalogo() {
    const texto = buscador.value.trim().toLowerCase();
    const categoria = filtroCategoria.value;
    const orden = ordenProductos.value;

    let productos = obtenerProductos().filter(function (producto) {
      const coincideNombre = producto.nombre.toLowerCase().includes(texto);
      const coincideCategoria = !categoria || producto.categoria === categoria;
      return coincideNombre && coincideCategoria;
    });

    if (orden === "nombre") {
      productos.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });
    } else if (orden === "precio-menor-mayor") {
      productos.sort(function (a, b) { return Number(a.precio) - Number(b.precio); });
    } else if (orden === "precio-mayor-menor") {
      productos.sort(function (a, b) { return Number(b.precio) - Number(a.precio); });
    } else {
      productos.sort(function (a, b) { return Number(b.destacado) - Number(a.destacado); });
    }

    cuadricula.replaceChildren();
    estadoCatalogo.textContent = productos.length + (productos.length === 1 ? " producto" : " productos");

    if (productos.length === 0) {
      cuadricula.appendChild(crearElemento("p", "sin-resultados", "No encontramos productos con esa búsqueda."));
      return;
    }

    productos.forEach(function (producto) {
      cuadricula.appendChild(crearTarjetaProducto(producto));
    });

    mostrarDestacados();
  }

  buscador.addEventListener("input", actualizarCatalogo);
  filtroCategoria.addEventListener("change", actualizarCatalogo);
  ordenProductos.addEventListener("change", actualizarCatalogo);
  window.addEventListener("storage", actualizarCatalogo);
  actualizarCatalogo();
  mostrarDestacados();
}

function crearTarjetaProducto(producto) {
  const tarjeta = crearElemento("article", "tarjeta-producto");
  tarjeta.dataset.categoria = producto.categoria;
  tarjeta.dataset.precio = producto.precio;

  const espacioImagen = crearElemento("div", "imagen-producto");
  if (producto.imagen) {
    const imagen = crearElemento("img");
    imagen.src = producto.imagen;
    imagen.alt = "Imagen de " + producto.nombre;
    espacioImagen.appendChild(imagen);
  }

  const informacion = crearElemento("div", "info-producto");
  const datos = crearElemento("div");
  datos.appendChild(crearElemento("h2", "", producto.nombre));
  datos.appendChild(crearElemento("p", "", producto.categoria));
  datos.appendChild(crearElemento("p", "descripcion-producto", producto.descripcion || ""));
  informacion.append(datos, crearElemento("span", "precio", mostrarPrecio(producto.precio)));

  const controles = crearElemento("div", "cantidad-producto");
  controles.appendChild(crearElemento("span", "", "Cantidad"));
  const botones = crearElemento("div", "controles-cantidad");
  const restar = crearElemento("button", "boton-cantidad", "−");
  const numero = crearElemento("span", "numero-cantidad", "1");
  const sumar = crearElemento("button", "boton-cantidad", "+");
  restar.type = "button";
  sumar.type = "button";
  restar.setAttribute("aria-label", "Restar una unidad de " + producto.nombre);
  sumar.setAttribute("aria-label", "Agregar una unidad de " + producto.nombre);
  restar.addEventListener("click", function () {
    numero.textContent = Math.max(1, Number(numero.textContent) - 1);
  });
  sumar.addEventListener("click", function () {
    numero.textContent = Number(numero.textContent) + 1;
  });
  botones.append(restar, numero, sumar);
  controles.appendChild(botones);

  const comprar = crearElemento("a", "boton-tarjeta", "Comprar ahora");
  comprar.href = "#contacto";
  comprar.addEventListener("click", function () {
    const campoProducto = document.getElementById("producto-seleccionado");
    const campoCantidad = document.getElementById("cantidad-pedida");
    campoProducto.value = producto.nombre;
    campoCantidad.value = numero.textContent;
  });

  tarjeta.append(espacioImagen, informacion, controles, comprar);
  return tarjeta;
}

function mostrarDestacados() {
  const cuadricula = document.querySelector(".cuadricula-destacados");
  if (!cuadricula) return;

  const destacados = obtenerProductos().filter(function (producto) {
    return producto.destacado;
  }).slice(0, 3);

  cuadricula.replaceChildren();
  destacados.forEach(function (producto) {
    const tarjeta = crearElemento("article", "tarjeta-destacada");
    tarjeta.appendChild(crearElemento("div", "imagen-destacada"));
    const informacion = crearElemento("div", "info-destacada");
    const fila = crearElemento("div", "fila-destacada");
    fila.append(
      crearElemento("h3", "", producto.nombre),
      crearElemento("span", "precio", mostrarPrecio(producto.precio))
    );
    informacion.appendChild(fila);
    const boton = crearElemento("a", "boton-destacado", "Ver producto");
    boton.href = "#catalogo";
    informacion.appendChild(boton);
    tarjeta.appendChild(informacion);
    cuadricula.appendChild(tarjeta);
  });
}

// formulario: guarda las solicitudes de contacto
function iniciarFormularioContacto() {
  const formulario = document.getElementById("formulario-contacto");
  if (!formulario) return;

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const datos = new FormData(formulario);
    const solicitudes = leerDatos(claveSolicitudes, []);
    solicitudes.push({
      id: Date.now().toString(),
      nombre: datos.get("nombre").trim(),
      correo: datos.get("correo").trim(),
      telefono: datos.get("telefono").trim(),
      producto: datos.get("producto").trim(),
      cantidad: Number(datos.get("cantidad")),
      mensaje: datos.get("mensaje").trim(),
      fecha: new Date().toISOString()
    });

    guardarDatos(claveSolicitudes, solicitudes);
    document.getElementById("estado-contacto").textContent =
      "Solicitud guardada en este navegador. Se conectará al servidor más adelante.";
    formulario.reset();

    if (document.getElementById("lista-solicitudes-admin")) {
      actualizarSolicitudesAdmin();
    }
  });
}

// administración: acceso y gestión del panel
function iniciarAdministracion() {
  const formularioAcceso = document.getElementById("formulario-acceso");
  if (!formularioAcceso) return;

  const accesoAdmin = document.getElementById("acceso-admin");
  const panelAdmin = document.getElementById("panel-admin");
  const estadoAcceso = document.getElementById("estado-acceso");
  const botonCerrarSesion = document.getElementById("boton-cerrar-sesion");
  const formularioProducto = document.getElementById("formulario-producto");
  const listaProductos = document.getElementById("lista-productos-admin");
  const estadoProducto = document.getElementById("estado-producto");
  const botonBorrarSolicitudes = document.getElementById("boton-borrar-solicitudes");

  formularioAcceso.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const correo = document.getElementById("correo-admin").value.trim();
    const clave = document.getElementById("clave-admin").value;

    if (correo === "admin@tienda.com" && clave === "admin123") {
      accesoAdmin.hidden = true;
      panelAdmin.hidden = false;
      actualizarPanelAdmin();
    } else {
      estadoAcceso.textContent = "Correo o contraseña incorrectos.";
    }
  });

  botonCerrarSesion.addEventListener("click", function () {
    panelAdmin.hidden = true;
    accesoAdmin.hidden = false;
    formularioAcceso.reset();
  });

  formularioProducto.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const datos = new FormData(formularioProducto);
    const productos = obtenerProductos();
    const id = datos.get("id");
    const producto = {
      id: id || Date.now().toString(),
      nombre: datos.get("nombre").trim(),
      categoria: datos.get("categoria"),
      descripcion: datos.get("descripcion").trim(),
      precio: Number(datos.get("precio")),
      moneda: "COP",
      imagen: datos.get("imagen").trim(),
      destacado: datos.get("destacado") === "on"
    };
    const indice = productos.findIndex(function (elemento) { return elemento.id === id; });

    if (indice >= 0) {
      productos[indice] = producto;
      estadoProducto.textContent = "Producto actualizado.";
    } else {
      productos.push(producto);
      estadoProducto.textContent = "Producto agregado.";
    }

    guardarDatos(claveProductos, productos);
    formularioProducto.reset();
    formularioProducto.elements.id.value = "";
    document.getElementById("boton-guardar-producto").textContent = "Agregar producto";
    document.getElementById("boton-cancelar-edicion").hidden = true;
    actualizarPanelAdmin();
  });

  document.getElementById("boton-cancelar-edicion").addEventListener("click", function () {
    formularioProducto.reset();
    formularioProducto.elements.id.value = "";
    document.getElementById("boton-guardar-producto").textContent = "Agregar producto";
    this.hidden = true;
    estadoProducto.textContent = "Edición cancelada.";
  });

  botonBorrarSolicitudes.addEventListener("click", function () {
    guardarDatos(claveSolicitudes, []);
    actualizarSolicitudesAdmin();
  });

  window.addEventListener("storage", actualizarPanelAdmin);
}

function actualizarPanelAdmin() {
  const listaProductos = document.getElementById("lista-productos-admin");
  if (!listaProductos) return;

  const productos = obtenerProductos();
  listaProductos.replaceChildren();
  document.getElementById("contador-productos").textContent = productos.length;
  document.getElementById("contador-categorias").textContent =
    new Set(productos.map(function (producto) { return producto.categoria; })).size;

  productos.forEach(function (producto) {
    const fila = document.createElement("tr");
    fila.append(
      crearElemento("td", "", producto.nombre),
      crearElemento("td", "", producto.categoria),
      crearElemento("td", "", producto.descripcion || ""),
      crearElemento("td", "", mostrarPrecio(producto.precio))
    );
    const acciones = crearElemento("td");
    const editar = crearElemento("button", "", "Editar");
    editar.type = "button";
    editar.addEventListener("click", function () { editarProducto(producto); });
    const borrar = crearElemento("button", "", "Eliminar");
    borrar.type = "button";
    borrar.addEventListener("click", function () { eliminarProducto(producto.id); });
    acciones.append(editar, borrar);
    fila.appendChild(acciones);
    listaProductos.appendChild(fila);
  });

  actualizarSolicitudesAdmin();
  mostrarDestacados();
}

function editarProducto(producto) {
  const formulario = document.getElementById("formulario-producto");
  formulario.elements.id.value = producto.id;
  formulario.elements.nombre.value = producto.nombre;
  formulario.elements.categoria.value = producto.categoria;
  formulario.elements.descripcion.value = producto.descripcion || "";
  formulario.elements.precio.value = producto.precio;
  formulario.elements.imagen.value = producto.imagen || "";
  formulario.elements.destacado.checked = Boolean(producto.destacado);
  document.getElementById("boton-guardar-producto").textContent = "Guardar cambios";
  document.getElementById("boton-cancelar-edicion").hidden = false;
  formulario.scrollIntoView({ behavior: "smooth", block: "center" });
}

function eliminarProducto(id) {
  const productos = obtenerProductos().filter(function (producto) { return producto.id !== id; });
  guardarDatos(claveProductos, productos);
  document.getElementById("estado-producto").textContent = "Producto eliminado.";
  actualizarPanelAdmin();
}

function actualizarSolicitudesAdmin() {
  const lista = document.getElementById("lista-solicitudes-admin");
  if (!lista) return;

  const solicitudes = leerDatos(claveSolicitudes, []);
  lista.replaceChildren();
  document.getElementById("contador-solicitudes").textContent = solicitudes.length;

  if (solicitudes.length === 0) {
    lista.appendChild(crearElemento("p", "nota-vacia", "Todavía no hay solicitudes guardadas."));
    return;
  }

  solicitudes.slice().reverse().forEach(function (solicitud) {
    const tarjeta = crearElemento("article", "tarjeta-solicitud");
    const encabezado = crearElemento("div", "encabezado-solicitud");
    encabezado.append(
      crearElemento("strong", "", solicitud.nombre),
      crearElemento("time", "", new Date(solicitud.fecha).toLocaleString("es-CO"))
    );
    tarjeta.appendChild(encabezado);
    tarjeta.appendChild(crearElemento("p", "", "Correo: " + solicitud.correo));
    if (solicitud.telefono) tarjeta.appendChild(crearElemento("p", "", "Teléfono: " + solicitud.telefono));
    tarjeta.appendChild(crearElemento("p", "", "Producto: " + solicitud.producto + " · Cantidad: " + solicitud.cantidad));
    tarjeta.appendChild(crearElemento("p", "", "Mensaje: " + solicitud.mensaje));
    lista.appendChild(tarjeta);
  });
}
