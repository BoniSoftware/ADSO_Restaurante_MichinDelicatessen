// App.js adaptado para utilizar el backend MySQL
// Reemplaza el uso de localStorage por la API REST.

const API_URL = "http://localhost:8000/api/pedidos";

const sopas = document.getElementById("sopas");
const platos = document.getElementById("platos");
const bebidas = document.getElementById("bebidas");
const postres = document.getElementById("postres");
const adicionales = document.getElementById("adicionales");

const detallePedido = document.getElementById("detallePedido");
const totalElemento = document.getElementById("total");
const listaPedidos = document.getElementById("listaPedidos");

const selects = [
  sopas,
  platos,
  bebidas,
  postres,
  adicionales
];

selects.forEach(select => {
  select.addEventListener("change", actualizarResumen);
});

function actualizarResumen() {
  let html = "";
  let total = 0;

  selects.forEach(select => {
    if (select.selectedIndex > 0) {
      const opcion = select.options[select.selectedIndex];
      const nombre = opcion.dataset.nombre;
      const precio = Number(opcion.value);

      let categoria = "";

      if (select.id === "sopas") categoria = "🍲 Sopa";
      if (select.id === "platos") categoria = "🍝 Plato Principal";
      if (select.id === "bebidas") categoria = "☕ Bebida";
      if (select.id === "postres") categoria = "🍨 Postre";
      if (select.id === "adicionales") categoria = "🥙 Adicional";

      html += `
        <strong>${categoria}:</strong> ${nombre}
        <span style="float:right">
          $${precio.toLocaleString("es-CO")}
        </span>
        <br>
      `;

      total += precio;
    }
  });

  detallePedido.innerHTML =
    html || "No hay productos seleccionados";

  totalElemento.textContent =
    total.toLocaleString("es-CO");
}

function obtenerPedido() {
  const productos = [
    sopas,
    platos,
    bebidas,
    postres,
    adicionales
  ];

  const hayProducto = productos.some(
    select => select.selectedIndex > 0
  );

  if (!hayProducto) {
    return null;
  }

  return {
    sopa: sopas.selectedIndex > 0
      ? sopas.options[sopas.selectedIndex].dataset.nombre
      : null,

    plato: platos.selectedIndex > 0
      ? platos.options[platos.selectedIndex].dataset.nombre
      : null,

    bebida: bebidas.selectedIndex > 0
      ? bebidas.options[bebidas.selectedIndex].dataset.nombre
      : null,

    postre: postres.selectedIndex > 0
      ? postres.options[postres.selectedIndex].dataset.nombre
      : null,

    adicional: adicionales.selectedIndex > 0
      ? adicionales.options[adicionales.selectedIndex].dataset.nombre
      : null,

    total:
      Number(sopas.value || 0) +
      Number(platos.value || 0) +
      Number(bebidas.value || 0) +
      Number(postres.value || 0) +
      Number(adicionales.value || 0)
  };
}

async function guardarPedido() {
  const pedido = obtenerPedido();

  if (!pedido) {
    alert("Seleccione al menos un producto.");
    return false;
  }

  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pedido)
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje || "No se pudo guardar el pedido"
      );
    }

    await mostrarPedidosGuardados();

    return true;

  } catch (error) {
    console.error(error);

    alert(
      "No se pudo guardar el pedido: " +
      error.message
    );

    return false;
  }
}

document.getElementById("formPedido").addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const guardado = await guardarPedido();

    if (!guardado) {
      return;
    }

    alert("Pedido enviado correctamente.");

    document.getElementById("formPedido").reset();

    detallePedido.innerHTML =
      "No hay productos seleccionados";

    totalElemento.textContent = "0";

    setTimeout(() => {
      const mensaje =
        document.getElementById("mensaje");

      if (mensaje) {
        mensaje.innerHTML = "";
      }
    }, 15000);
  }
);

async function mostrarPedidosGuardados() {

  try {
    const respuesta = await fetch(API_URL);

    const pedidos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        "No se pudo consultar el historial"
      );
    }

    if (!listaPedidos) {
      return;
    }

    if (pedidos.length === 0) {
      listaPedidos.innerHTML =
        "No existen pedidos almacenados.";
      return;
    }

    let html = "";

    pedidos.forEach((pedido, index) => {

      const fecha = pedido.fecha
        ? new Date(pedido.fecha)
            .toLocaleString("es-CO")
        : "Sin fecha";

      html += `
        <div class="pedido-guardado">

          <p></p>

          <h3>Pedido ${index + 1}</h3>

          <strong>Fecha:</strong>
          ${fecha}<br>

          ${pedido.sopa
            ? `${pedido.sopa}<br>`
            : ""}

          ${pedido.plato
            ? `${pedido.plato}<br>`
            : ""}

          ${pedido.bebida
            ? `${pedido.bebida}<br>`
            : ""}

          ${pedido.postre
            ? `${pedido.postre}<br>`
            : ""}

          ${pedido.adicional
            ? `${pedido.adicional}<br>`
            : ""}

          <p>
            <strong>Total:</strong>
            $${Number(pedido.total)
              .toLocaleString("es-CO")}
          </p>

          <button
            onclick="eliminarPedido(${pedido.id})">
            🗑 Eliminar
          </button>

          <hr>

        </div>
      `;
    });

    listaPedidos.innerHTML = html;

  } catch (error) {

    console.error(error);

    if (listaPedidos) {
      listaPedidos.innerHTML =
        "No se pudo cargar el historial de pedidos.";
    }
  }
}

async function eliminarPedido(id) {

  if (!confirm("¿Desea eliminar este pedido?")) {
    return;
  }

  try {

    const respuesta = await fetch(
      `${API_URL}/${id}`,
      {
        method: "DELETE"
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje ||
        "No se pudo eliminar el pedido"
      );
    }

    await mostrarPedidosGuardados();

  } catch (error) {

    console.error(error);

    alert(
      "Error al eliminar el pedido: " +
      error.message
    );
  }
}

async function borrarHistorial() {

  if (!confirm("¿Desea eliminar todos los pedidos?")) {
    return;
  }

  try {

    const respuesta = await fetch(
      API_URL,
      {
        method: "DELETE"
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje ||
        "No se pudo borrar el historial"
      );
    }

    if (listaPedidos) {
      listaPedidos.innerHTML =
        "No existen pedidos almacenados.";
    }

  } catch (error) {

    console.error(error);

    alert(
      "Error al borrar el historial: " +
      error.message
    );
  }
}

// Cargar historial al iniciar
mostrarPedidosGuardados();
