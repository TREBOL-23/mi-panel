// script.js

const API_BACKEND = "https://mi-panel-coral.vercel.app/api";
// Elementos de la página
const servicioSelect = document.getElementById("servicio");
const enlaceInput = document.getElementById("enlace");
const cantidadInput = document.getElementById("cantidad");
const resultado = document.getElementById("resultado");

// Mostrar mensaje
function mostrarMensaje(mensaje, tipo = "info") {
    resultado.textContent = mensaje;

    resultado.style.padding = "12px";
    resultado.style.marginTop = "15px";
    resultado.style.borderRadius = "8px";

    if (tipo === "error") {
        resultado.style.background = "#ffe5e5";
    } else if (tipo === "success") {
        resultado.style.background = "#e5ffe9";
    } else {
        resultado.style.background = "#eeeeee";
    }
}


// ==========================================
// CARGAR SERVICIOS
// ==========================================

async function cargarServicios() {

    try {

        mostrarMensaje("Cargando servicios...");

        const respuesta = await fetch(`${API_BACKEND}/services`);

        if (!respuesta.ok) {
            throw new Error("Error del servidor");
        }

        const servicios = await respuesta.json();

        servicioSelect.innerHTML =
            '<option value="">Selecciona un servicio</option>';

        servicios.forEach(servicio => {

            const opcion = document.createElement("option");

            opcion.value = servicio.service;

            opcion.textContent =
                `${servicio.name} | $${servicio.rate} | ${servicio.min}-${servicio.max}`;

            servicioSelect.appendChild(opcion);
        });

        resultado.textContent = "";

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudieron cargar los servicios.",
            "error"
        );
    }
}


// ==========================================
// CREAR ORDEN
// ==========================================

async function realizarOrden() {

    const servicio = servicioSelect.value;
    const enlace = enlaceInput.value.trim();
    const cantidad = cantidadInput.value.trim();

    if (!servicio) {
        mostrarMensaje("Selecciona un servicio.", "error");
        return;
    }

    if (!enlace) {
        mostrarMensaje("Escribe el enlace del perfil.", "error");
        return;
    }

    if (!cantidad || Number(cantidad) < 1) {
        mostrarMensaje("Escribe una cantidad válida.", "error");
        return;
    }

    try {

        mostrarMensaje("Creando orden...");

        const respuesta = await fetch(`${API_BACKEND}/order`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                service: servicio,
                link: enlace,
                quantity: Number(cantidad)
            })
        });


        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.error || "No se pudo crear la orden."
            );
        }


        if (datos.order) {

            mostrarMensaje(
                `Orden creada correctamente. ID: ${datos.order}`,
                "success"
            );

        } else {

            mostrarMensaje(
                "La API respondió, pero no devolvió un ID de orden.",
                "error"
            );
        }


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message || "Error al crear la orden.",
            "error"
        );
    }
}


// ==========================================
// INICIAR
// ==========================================

cargarServicios();
