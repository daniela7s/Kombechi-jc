function cargarTienda() {
    // subir catalogo desde mongo
    fetch('/api/productos')
        .then(respuesta => {
            if (!respuesta.ok) throw new Error('Error al traer datos del servidor');
            return respuesta.json();
        })
        .then(listaProductos => {
            const contenedor = document.getElementById('contenedor-kombuchas');
            contenedor.innerHTML = ""; // Limpiamos el contenedor

            // Por cada producto que nos mande el servidor, fabricamos un bloque HTML
            listaProductos.forEach(producto => {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta-producto'; // Pon aquí la clase exacta de tu CSS

                //  ingresa texto y precio
                tarjeta.innerHTML = `
                    <h3>${producto.nombre}</h3>
                    <p>Categoría: ${producto.categoria}</p>
                    <span>Precio: $${producto.precio}</span>
                    <button>Comprar</button>
                `;

                // agregrar elemento
                contenedor.appendChild(tarjeta);
            });
        })
        .catch(error => console.error("Error crítico en la prueba:", error));
}

// Ejecutar automáticamente cuando la página termine de cargar
document.addEventListener('DOMContentLoaded', cargarTienda);
const buscador = document.getElementById("buscador-productos");
const tarjetas = document.getElementsByClassName("tarjeta-producto");

//Función para buscar productos por nombre
if (buscador) {
  buscador.addEventListener("input", function () {
    const textoBuscado = buscador.value.toLowerCase().trim();

    for (let i = 0; i < tarjetas.length; i++) {
      const titulo = tarjetas[i].querySelector("h2").textContent.toLowerCase();
      //verifica que coincida el nombre buscado con el nombre del producto
      if (titulo.includes(textoBuscado)) {
        //Si coincide la muestra
        tarjetas[i].style.display = "";
      } else {
        // Si no coincide oculta la tarjeta
        tarjetas[i].style.display = "none";
      }
    }
  });
}

//Formulario
const formulario = document.getElementById("formulario-contacto");
const estadoContacto = document.getElementById("estado-contacto");
const productoSeleccionado = document.getElementById("producto-seleccionado");
const cantidadPedida = document.getElementById("cantidad-pedida");

//Registrar pedidos
if (productoSeleccionado && cantidadPedida) {
  for (let i = 0; i < tarjetas.length; i++) {
    const botonAumentar = tarjetas[i].querySelector(".aumentar-cantidad");
    const botonDisminuir = tarjetas[i].querySelector(".disminuir-cantidad");
    const botonComprar = tarjetas[i].querySelector(".boton-tarjeta");
    const numeroCantidad = tarjetas[i].querySelector(".numero-cantidad");

    if (botonAumentar) {
      botonAumentar.addEventListener("click", function () {
        numeroCantidad.textContent = Number(numeroCantidad.textContent) + 1;
      });
    }

    if (botonDisminuir) {
      botonDisminuir.addEventListener("click", function () {
        const cantidadActual = Number(numeroCantidad.textContent);

        if (cantidadActual > 1) {
          numeroCantidad.textContent = cantidadActual - 1;
        }
      });
    }

    if (botonComprar) {
      botonComprar.addEventListener("click", function () {
        productoSeleccionado.value = tarjetas[i].querySelector("h2").textContent.trim();
        cantidadPedida.value = numeroCantidad.textContent;
      });
    }
  }
}

if (formulario && estadoContacto) {
  formulario.addEventListener("invalid", function () {
    estadoContacto.textContent = "Completa los campos obligatorios antes de enviar tu pedido.";
  }, true);

  formulario.addEventListener("submit", function (evento) {
    //Previene el default
    evento.preventDefault();

    const nombreUsuario = document.getElementById("nombre").value;

    //Envia mensaje
    alert(`Hola ${nombreUsuario}, tu pedido ha sido enviado con éxito.`);

    this.reset();
  });
}

const formularioAcceso = document.getElementById("formulario-acceso");
const accesoAdmin = document.getElementById("acceso-admin");
const panelAdmin = document.getElementById("panel-admin");
const estadoAcceso = document.getElementById("estado-acceso");
const botonCerrarSesion = document.getElementById("boton-cerrar-sesion");

if (formularioAcceso && accesoAdmin && panelAdmin && estadoAcceso) {
  formularioAcceso.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const correo = formularioAcceso.elements.correo.value.trim();
    const contrasena = formularioAcceso.elements.contrasena.value;

    if (correo === "admin@tienda.com" && contrasena === "admin123") {
      accesoAdmin.hidden = true;
      panelAdmin.hidden = false;
    } else {
      estadoAcceso.textContent = "El correo o la contraseña no son correctos.";
    }
  });
}

if (botonCerrarSesion && accesoAdmin && panelAdmin && formularioAcceso) {
  botonCerrarSesion.addEventListener("click", function () {
    panelAdmin.hidden = true;
    accesoAdmin.hidden = false;
    formularioAcceso.reset();
  });
}
