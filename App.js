const API_URL = "http://localhost:8000/api";

// =====================================================
// ELEMENTOS DEL HTML
// =====================================================

const formulario = document.getElementById("formPedido");
const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const direccion = document.getElementById("direccion");
const sopas = document.getElementById("sopas");
const platos = document.getElementById("platos");
const bebidas = document.getElementById("bebidas");
const postres = document.getElementById("postres");
const adicionales = document.getElementById("adicionales");
const observaciones = document.getElementById("observaciones");
const detallePedido = document.getElementById("detallePedido");
const totalElemento = document.getElementById("total");
const listaPedidos = document.getElementById("listaPedidos");
const mensaje = document.getElementById("mensaje");
const botonEnviar = document.getElementById("btnEnviar");

// =====================================================
// CARGAR PEDIDOS AL INICIAR
// =====================================================

mostrarPedidosGuardados();

// =====================================================
// ACTUALIZAR RESUMEN
// =====================================================

const selects = [
sopas,
platos,
bebidas,
postres,
adicionales,
observaciones
];

selects.forEach(select => {

select.addEventListener(
    "change",
    actualizarResumen
);
});

function actualizarResumen() {

let html = "";
let total = 0;

selects.forEach(select => {

    if (select.selectedIndex > 0) {
        const opcion =
            select.options[
                select.selectedIndex
            ];

        const nombreProducto = opcion.dataset.nombre;
        const precio = Number(opcion.value);

        let categoria = "";

        if (select.id === "sopas") {
            categoria = "🍲 Sopa";
        }
        if (select.id === "platos") {
            categoria = "🍝 Plato Principal";
        }
        if (select.id === "bebidas") {
            categoria = "☕ Bebida";
        }
        if (select.id === "postres") {
            categoria = "🍨 Postre";
        }
        if (select.id === "adicionales") {
            categoria = "🥙 Adicional";
        }

        html += `
            <strong>${categoria}:</strong>
            ${nombreProducto}

            <span style="float:right">
                $${precio.toLocaleString("es-CO")}
            </span>
            <br>
        `;
        total += precio;
    }
});

if (html === "") {
    detallePedido.innerHTML =
        "No hay productos seleccionados";
} else {
    detallePedido.innerHTML = html;
}

totalElemento.textContent =
    total.toLocaleString("es-CO");
}

// =====================================================
// OBTENER DATOS DEL PEDIDO
// =====================================================

function obtenerDatosPedido() {
return {

    // DATOS DEL CLIENTE
    nombre: nombre.value.trim(),
    telefono: telefono.value.trim(),
    direccion: direccion.value.trim(),

    // PRODUCTOS
    sopa:
        sopas.selectedIndex > 0
            ? sopas.options[
                sopas.selectedIndex
              ].dataset.nombre
            : null,
    plato:
        platos.selectedIndex > 0
            ? platos.options[
                platos.selectedIndex
              ].dataset.nombre
            : null,
    bebida:
        bebidas.selectedIndex > 0
            ? bebidas.options[
                bebidas.selectedIndex
              ].dataset.nombre
            : null,
    postre:
        postres.selectedIndex > 0
            ? postres.options[
                postres.selectedIndex
              ].dataset.nombre
            : null,
    adicional:
        adicionales.selectedIndex > 0
            ? adicionales.options[
                adicionales.selectedIndex
              ].dataset.nombre
            : null,
    observaciones:
        observaciones.value.trim() || null,

    // TOTAL
    total:
        Number(sopas.value || 0) +
        Number(platos.value || 0) +
        Number(bebidas.value || 0) +
        Number(postres.value || 0) +
        Number(adicionales.value || 0)
};
}

// =====================================================
// GUARDAR PEDIDO EN MYSQL
// =====================================================

async function guardarPedido() {
const pedido = obtenerDatosPedido();

// ==========================================
// VALIDAR CLIENTE
// ==========================================

if (!pedido.nombre) {
    alert(
        "Ingrese el nombre del cliente."
    );
    nombre.focus();
    return false;
}

if (!pedido.telefono) {
    alert(
        "Ingrese el teléfono del cliente."
    );
    telefono.focus();
    return false;
}

if (!pedido.direccion) {
    alert(
        "Ingrese la dirección de entrega."
    );
    direccion.focus();
    return false;
}

// ==========================================
// VALIDAR PRODUCTOS
// ==========================================

if (
    !pedido.sopa &&
    !pedido.plato &&
    !pedido.bebida &&
    !pedido.postre &&
    !pedido.adicional &&
    !pedido.observaciones
) {
    alert(
        "Seleccione al menos un producto."
    );
    return false;
}


// ==========================================
// VALIDAR TOTAL
// ==========================================

if (
    !Number.isFinite(pedido.total) ||
    pedido.total <= 0
) {
    alert(
        "El total debe ser un número positivo."
    );
    return false;
}

// ==========================================
// ENVIAR AL BACKEND
// ==========================================

try {
    const respuesta = await fetch(
        `${API_URL}/pedidos`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body:
                JSON.stringify(pedido)
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            "Error al guardar el pedido."
        );
    }
    console.log(
        "Pedido guardado:",
        datos
    );
    return datos;

} catch (error) {
    console.error(
        "Error al guardar pedido:",
        error
    );

    alert(
        "No fue posible guardar el pedido.\n\n" +
        "Verifique que el servidor esté funcionando."
    );
    return false;
}
}

// =====================================================
// ENVIAR FORMULARIO
// =====================================================

formulario.addEventListener(
"submit",
async function(event) {

    event.preventDefault();
    botonEnviar.disabled = true;
    botonEnviar.value =
        "Enviando pedido...";

    const pedidoGuardado = await guardarPedido();

    if (!pedidoGuardado) {
        botonEnviar.disabled = false;
        botonEnviar.value =
            "Enviar Pedido";
        return;
    }

    // ==========================================
    // MENSAJE DE CONFIRMACIÓN
    // ==========================================

    mensaje.innerHTML = `
        <hr>
        <p>
            Pedido procesado correctamente
            👨🏻‍🍳✅
            <br>
            Llegará aproximadamente en
            20 minutos 🏍️🕒
            <br>
            Gracias por tu compra ❤️
        </p>
    `;

    // ==========================================
    // LIMPIAR FORMULARIO
    // ==========================================

    formulario.reset();

    detallePedido.innerHTML =
        "No hay productos seleccionados";
    totalElemento.textContent =
        "0";

    // ==========================================
    // ACTUALIZAR HISTORIAL
    // ==========================================

    await mostrarPedidosGuardados();

    botonEnviar.disabled = false;
    botonEnviar.value =
        "Enviar Pedido";
    setTimeout(() => {
        mensaje.innerHTML = "";
    }, 15000);
}
);

// =====================================================
// MOSTRAR PEDIDOS DESDE MYSQL
// =====================================================

async function mostrarPedidosGuardados() {
try {
    const respuesta =
        await fetch(
            `${API_URL}/pedidos`
        );

    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener los pedidos."
        );
    }

    const pedidos =
        await respuesta.json();

    if (pedidos.length === 0) {
        listaPedidos.innerHTML =
            "No existen pedidos almacenados.";
        return;
    }

    let html = "";

    pedidos.forEach((pedido, index) => {

        const fecha =
            new Date(
                pedido.fecha
            ).toLocaleString("es-CO");

        html += `
            <div class="pedido-guardado">
                <h3>
                    Pedido ${index + 1}
                </h3>
                <strong>
                    📅 Fecha:
                </strong>
                ${fecha}
                <hr>
                <div class="datos-cliente">
                    <strong>
                        👤 Cliente:
                    </strong>
                    ${pedido.nombre}
                    <br>
                    <strong>
                        📱 Teléfono:
                    </strong>
                    ${pedido.telefono}
                    <br>
                    <strong>
                        🏠 Dirección:
                    </strong>
                    ${pedido.direccion}
                    ${
                        pedido.observaciones
                            ? `
                                <br>
                                <strong>
                                    📝 Observaciones:
                                </strong>
                                ${pedido.observaciones}
                              `
                            : ""
                    }
                </div>
                <hr>
                ${
                    pedido.sopa
                        ? `
                            🍲
                            <strong>
                                Sopa:
                            </strong>
                            ${pedido.sopa}
                            <br>
                          `
                        : ""
                }
                ${
                    pedido.plato
                        ? `
                            🍝
                            <strong>
                                Plato:
                            </strong>
                            ${pedido.plato}
                            <br>
                          `
                        : ""
                }
                ${
                    pedido.bebida
                        ? `
                            ☕
                            <strong>
                                Bebida:
                            </strong>
                            ${pedido.bebida}
                            <br>
                          `
                        : ""
                }
                ${
                    pedido.postre
                        ? `
                            🍨
                            <strong>
                                Postre:
                            </strong>
                            ${pedido.postre}
                            <br>
                          `
                        : ""
                }
                ${
                    pedido.adicional
                        ? `
                            🥙
                            <strong>
                                Adicional:
                            </strong>
                            ${pedido.adicional}
                            <br>
                          `
                        : ""
                }
                <p>
                    <strong>
                        Total:
                    </strong>
                    $${Number(
                        pedido.total
                    ).toLocaleString("es-CO")}
                </p>
                <button
                    type="button"
                    onclick="eliminarPedido(${pedido.id})"
                >
                    🗑 Eliminar
                </button>
                <hr>
            </div>
        `;
    });

    listaPedidos.innerHTML =
        html;

} catch (error) {

    console.error(
        "Error al obtener pedidos:",
        error
    );

    listaPedidos.innerHTML = `
        <p>
            ❌ No fue posible cargar
            los pedidos.
            <br>
            Verifique que el backend
            esté funcionando.
        </p>
    `;
}
}

// =====================================================
// ELIMINAR UN PEDIDO
// =====================================================

async function eliminarPedido(id) {

if (
    !confirm(
        "¿Desea eliminar este pedido?"
    )
) {
    return;
}

try {
    const respuesta =
        await fetch(
            `${API_URL}/pedidos/${id}`,
            {
                method: "DELETE"
            }
        );
    const datos =
        await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            "No se pudo eliminar el pedido."
        );
    }

    alert(
        "Pedido eliminado correctamente."
    );

    await mostrarPedidosGuardados();

} catch (error) {
    console.error(
        "Error al eliminar pedido:",
        error
    );
    alert(
        "No fue posible eliminar el pedido."
    );
}
}

// =====================================================
// BORRAR TODO EL HISTORIAL
// =====================================================

async function borrarHistorial() {
if (
    !confirm(
        "¿Desea eliminar todos los pedidos?"
    )
) {
    return;
}
try {

    const respuesta =
        await fetch(
            `${API_URL}/pedidos`,
            {
                method: "DELETE"
            }
        );
    const datos =
        await respuesta.json();
    if (!respuesta.ok) {

        throw new Error(
            datos.mensaje ||
            "No se pudo eliminar el historial."
        );
    }
    alert(
        "Historial eliminado correctamente."
    );
    await mostrarPedidosGuardados();

} catch (error) {
    console.error(
        "Error al eliminar historial:",
        error
    );
    alert(
        "No fue posible eliminar el historial."
    );
}
}