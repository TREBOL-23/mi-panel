// ===============================
// CONFIGURACIÓN
// ===============================

const SUPABASE_URL = "https://gnfzamjepixqfpxkjuqy.supabase.co";

// PEGA AQUÍ tu Publishable key / anon public key
const SUPABASE_KEY = "sb_publishable_hPpstP4dXGS3RaReY6dQ4A_qD0UFy_z";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const API_BACKEND = "https://mi-panel-coral.vercel.app/api";

// ===============================
// ELEMENTOS
// ===============================

const loginBox = document.getElementById("loginBox");
const panelUsuario = document.getElementById("panelUsuario");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const authResultado = document.getElementById("authResultado");

const usuarioEmail = document.getElementById("usuarioEmail");
const saldoElemento = document.getElementById("saldo");

const servicioSelect = document.getElementById("servicio");
const enlaceInput = document.getElementById("enlace");
const cantidadInput = document.getElementById("cantidad");
const resultado = document.getElementById("resultado");

// ===============================
// MENSAJES
// ===============================

function mostrarAuthMensaje(mensaje, tipo = "info") {
    authResultado.textContent = mensaje;
    authResultado.style.padding = "12px";
    authResultado.style.marginTop = "15px";
    authResultado.style.borderRadius = "8px";

    if (tipo === "error") {
        authResultado.style.background = "#ffe5e5";
    } else if (tipo === "success") {
        authResultado.style.background = "#e5ffe9";
    } else {
        authResultado.style.background = "#eeeeee";
    }
}

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

// ===============================
// REGISTRO
// ===============================

async function registrarse() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        mostrarAuthMensaje(
            "Escribe tu correo y contraseña.",
            "error"
        );
        return;
    }

    if (password.length < 6) {
        mostrarAuthMensaje(
            "La contraseña debe tener al menos 6 caracteres.",
            "error"
        );
        return;
    }

    try {
        mostrarAuthMensaje("Creando cuenta...");

        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        if (data.session) {
            mostrarAuthMensaje(
                "Cuenta creada correctamente.",
                "success"
            );

            mostrarPanelUsuario(data.session.user);
        } else {
            mostrarAuthMensaje(
                "Cuenta creada. Revisa tu correo para confirmar la cuenta.",
                "success"
            );
        }

    } catch (error) {
        console.error(error);

        mostrarAuthMensaje(
            error.message || "No se pudo crear la cuenta.",
            "error"
        );
    }
}

// ===============================
// INICIAR SESIÓN
// ===============================

async function iniciarSesion() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        mostrarAuthMensaje(
            "Escribe tu correo y contraseña.",
            "error"
        );
        return;
    }

    try {
        mostrarAuthMensaje("Iniciando sesión...");

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        mostrarAuthMensaje(
            "Sesión iniciada correctamente.",
            "success"
        );

        mostrarPanelUsuario(data.user);

    } catch (error) {
        console.error(error);

        mostrarAuthMensaje(
            error.message || "No se pudo iniciar sesión.",
            "error"
        );
    }
}

// ===============================
// MOSTRAR PANEL
// ===============================

async function mostrarPanelUsuario(user) {
    loginBox.style.display = "none";
    panelUsuario.style.display = "block";

    usuarioEmail.textContent = user.email || "";

    await cargarSaldo(user.id);
    await cargarServicios();
}

// ===============================
// CARGAR SALDO
// ===============================

async function cargarSaldo(userId) {
    try {
        saldoElemento.textContent = "...";

        const respuesta = await fetch(
            `${API_BACKEND}/balance?user_id=${encodeURIComponent(userId)}`
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.error || "No se pudo consultar el saldo."
            );
        }

        saldoElemento.textContent =
            Number(datos.balance).toFixed(2);

    } catch (error) {
        console.error(error);

        saldoElemento.textContent = "0.00";

        mostrarMensaje(
            "No se pudo cargar el saldo.",
            "error"
        );
    }
}

// ===============================
// CERRAR SESIÓN
// ===============================

async function cerrarSesion() {
    await supabaseClient.auth.signOut();

    panelUsuario.style.display = "none";
    loginBox.style.display = "block";

    emailInput.value = "";
    passwordInput.value = "";

    saldoElemento.textContent = "0.00";
}

// ===============================
// CARGAR SERVICIOS
// ===============================

async function cargarServicios() {
    try {
        mostrarMensaje("Cargando servicios...");

        const respuesta =
            await fetch(`${API_BACKEND}/services`);

        if (!respuesta.ok) {
            throw new Error("Error del servidor");
        }

        const servicios = await respuesta.json();

        servicioSelect.innerHTML =
            '<option value="">Selecciona un servicio</option>';

        servicios.forEach(servicio => {
            const opcion =
                document.createElement("option");

            opcion.value = servicio.service;

            opcion.textContent =
                `${serv
