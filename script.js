import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDht5heke57pshhg9JWyhlGoYqg3evj93c",
    authDomain: "lista-juegos-gamecube.firebaseapp.app",
    projectId: "lista-juegos-gamecube",
    storageBucket: "lista-juegos-gamecube.firebasestorage.app",
    messagingSenderId: "497969896150",
    appId: "1:497969896150:web:9fc8cecef549fa2d284777"
};

const startBtn = document.getElementById("start-btn");
const intro = document.getElementById("intro-screen");
const video = document.getElementById("gamecube-intro");
const jingle = document.getElementById("startup-jingle");
const bgMusic = document.getElementById("bg-music");
let introTerminada = false; // Esta es la llave

// PASO 1: Iniciar video al presionar botón
startBtn.addEventListener("click", () => {
    startBtn.style.display = "none";

    // Configuración para Android
    video.muted = false;
    video.volume = 1.0;

    video.play().catch((error) => {
        video.play();
    });
});

// PASO 2: Al terminar video -> Jingle y Desvanecimiento
video.onended = () => {
    intro.classList.add("fade-out");
    jingle.play();

    introTerminada = true; // <--- Abrimos la llave aquí
    animarGrid(); // Disparamos la animación manualmente esta primera vez

    setTimeout(() => {
        if (intro) intro.remove();
    }, 800);
};

function animarGrid() {
    const cards = document.querySelectorAll(".tarjeta-wrapper:not(.show)");

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, 50 * index); // 50ms para un efecto cascada más fluido
    });
}

// PASO 3: Al terminar Jingle -> Música de fondo
jingle.onended = () => {
    bgMusic.volume = 0.4;
    bgMusic.play();
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 2. VARIABLES DE ESTADO ---
let productos = [];
let juegosFiltrados = [];
let paginaActual = 1;
let juegosPorPagina = 0;

const rutaLocalPortadas = "./portadas/";
const rutaLocalDiscos = "./portadas discos/";

const container = document.getElementById("grid-container");
const modal = document.getElementById("modalDetalle");
const buscador = document.getElementById("inputBuscador");
const imgDisco = document.getElementById("modalDisco");
const selectOrden = document.getElementById("selectOrden");

let stopTimeoutHandle = null;
let debounceTimer; // Para el buscador suave

// --- 3. DETECTAR OS ---
const detectOS = () => {
    const ua = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod/i.test(ua)) {
        document.body.classList.add("mobile-os", "android-optimizado");
        juegosPorPagina = 8; // <--- En Android solo mostramos 6 (o los que prefieras)
    } else {
        juegosPorPagina = 15; // <--- En PC se mantienen los 12
    }
};
detectOS();

// --- 4. CARGA DE DATOS ---
async function cargarDesdeFirebase() {
    try {
        const q = query(collection(db, "juegos"));
        const querySnapshot = await getDocs(q);
        productos = [];
        querySnapshot.forEach((doc) => {
            productos.push(doc.data());
        });
        ordenarProductos();
    } catch (error) {
        console.error("Error cargando base de datos:", error);
    }
}

// --- 5. LÓGICA DE RENDERIZADO ---
function renderizarPagina() {
    if (!container) return;
    container.innerHTML = "";

    const inicio = (paginaActual - 1) * juegosPorPagina;
    const fin = inicio + juegosPorPagina;
    const juegosVisibles = juegosFiltrados.slice(inicio, fin);

    // Si no hay juegos (ej. búsqueda sin éxito)
    if (juegosVisibles.length === 0) {
        container.innerHTML = `<div style="color:white; grid-column: 1/-1; text-align:center; padding: 50px; font-family: 'JetBrains Mono', monospace;">
                                [ SIN DATOS EN ESTA SECCIÓN ]
                               </div>`;
        actualizarControlesPaginacion();
        return;
    }

    // Dibujamos los juegos
    juegosVisibles.forEach((p) => {
        const wrapper = document.createElement("div");
        wrapper.className = "tarjeta-wrapper";

        const card = document.createElement("div");
        card.className = "tarjeta";

        // --- AQUÍ ES DONDE VA EL SONIDO ---
        card.onclick = () => {
            // 1. Generar número aleatorio entre 1 y 3
            const randomNum = Math.floor(Math.random() * 3) + 1;

            // 2. Seleccionar el sonido correspondiente usando el número
            const selectSound = document.getElementById(`sound-select-${randomNum}`);

            if (selectSound) {
                selectSound.currentTime = 0;
                selectSound.play().catch((e) => console.log("Audio bloqueado:", e));
            }
            abrirModal(p); // Llama al modal después del sonido
        };

        card.innerHTML = `
            <img src="${rutaLocalPortadas}${p.id}.png" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/210x270'">
            <div class="tarjeta-info">${p.nombre}</div>
        `;

        wrapper.appendChild(card);
        container.appendChild(wrapper);
    });

    // --- LA LLAVE DE SEGURIDAD ---
    // Si la intro ya terminó (o sea, estamos buscando u ordenando), animamos ya.
    // Si NO ha terminado, no hacemos nada aquí, porque el "video.onended" lo hará después.
    if (introTerminada) {
        requestAnimationFrame(() => {
            animarGrid();
        });
    }

    actualizarControlesPaginacion();
}

function actualizarControlesPaginacion() {
    const totalPaginas = Math.ceil(juegosFiltrados.length / juegosPorPagina) || 1;
    const containerPuertos = document.getElementById('container-puertos');
    
    if (!containerPuertos) return;

    // 1. Limpiamos puertos anteriores
    containerPuertos.innerHTML = "";

    // 2. Generamos los puertos dinámicamente
    for (let i = 1; i <= totalPaginas; i++) {
        const port = document.createElement('div');
        // Si es la página actual, le ponemos la clase 'active' para el brillo cian
        port.className = `port ${i === paginaActual ? 'active' : ''}`;
        port.id = `port-${i}`;
        port.style.cursor = "pointer"; // Para que sepa que es clickable

        // Generamos los puntitos de relieve según el número de puerto
        let puntosHTML = '';
        for (let j = 0; j < i; j++) {
            puntosHTML += '<span></span>';
        }

        port.innerHTML = `
            <div class="port-index">${puntosHTML}</div>
            <div class="pin-grid"></div>
        `;
        
        // --- LA MAGIA DEL CLIC DIRECTO ---
        port.onclick = () => {
            if (i !== paginaActual) {
                // Usamos tu función de efecto suave para navegar
                playNavSound("sound-select-1"); // Sonido de clic retro
                cambiarPaginaConEfecto(i);
            }
        };
        
        containerPuertos.appendChild(port);
    }

    // 3. Estado de los Slots (Memory Cards) - Botones Atrás/Sig
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');
    
    if (btnPrev) btnPrev.disabled = (paginaActual === 1);
    if (btnNext) btnNext.disabled = (paginaActual >= totalPaginas);
}

// --- 6. NAVEGACIÓN SUAVE ---
function cambiarPaginaConEfecto(nuevaPagina) {
    container.classList.add("grid-fade-out");

    setTimeout(() => {
        paginaActual = nuevaPagina;
        renderizarPagina();
        container.classList.remove("grid-fade-out");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, 300);
}
function playNavSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        // Aplicamos el volumen actual del slider si quieres que sea consistente
        const currentVol = localStorage.getItem("gamecube-volume") || 0.5;
        sound.volume = currentVol;

        sound.play().catch((e) => console.warn("Navegación silenciada:", e));
    }
}
// Botón Siguiente
document.getElementById("next-page").addEventListener("click", () => {
    const totalPaginas = Math.ceil(juegosFiltrados.length / juegosPorPagina);
    if (paginaActual < totalPaginas) {
        playNavSound("sound-next"); // <--- Sonido Siguiente
        cambiarPaginaConEfecto(paginaActual + 1);
    }
});

// Botón Atrás
document.getElementById("prev-page").addEventListener("click", () => {
    if (paginaActual > 1) {
        playNavSound("sound-prev"); // <--- Sonido Atrás
        cambiarPaginaConEfecto(paginaActual - 1);
    }
});

// --- 7. BUSCADOR SUAVE (DEBOUNCE) ---
buscador.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const limpiarTexto = (texto) => {
            return texto
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s]/gi, "");
        };

        const queryInput = limpiarTexto(e.target.value);

        juegosFiltrados = productos.filter((p) => {
            const nombreLimpio = limpiarTexto(p.nombre || "");
            return nombreLimpio.includes(queryInput);
        });

        paginaActual = 1;
        renderizarPagina();
    }, 250);
});

// --- 8. ORDENAMIENTO ---

/**
 * Extrae el peso de una cadena tipo "RVZ (1.2GB)" o "ISO (500MB)"
 * y lo convierte a un valor numérico en MB para comparar.
 */
function obtenerPesoNumerico(formatoStr) {
    if (!formatoStr || typeof formatoStr !== "string") return 0;

    // Buscamos el número y la unidad dentro de los paréntesis
    // Soporta: GB, GiB, MB, MiB
    const regex = /\(([\d.]+)\s*(GB|GiB|MB|MiB)\)/i;
    const match = formatoStr.match(regex);

    if (!match) return 0;

    let valor = parseFloat(match[1]);
    let unidad = match[2].toUpperCase();

    // Si es Gigabytes, multiplicamos por 1024 para pasar a Megabytes
    if (unidad.includes("G")) {
        return valor * 1024;
    }

    return valor;
}

function ordenarProductos() {
    const metodo = selectOrden.value;

    productos.sort((a, b) => {
        const nombreA = a.nombre || "";
        const nombreB = b.nombre || "";

        switch (metodo) {
            case "az":
                return nombreA.localeCompare(nombreB);
            case "za":
                return nombreB.localeCompare(nombreA);
            case "peso":
                // Ordenar de Mayor a Menor peso
                const pesoA = obtenerPesoNumerico(a.formato);
                const pesoB = obtenerPesoNumerico(b.formato);

                // Si los pesos son iguales, ordenamos por nombre para que no baile el grid
                if (pesoB === pesoA) return nombreA.localeCompare(nombreB);
                return pesoB - pesoA;
            default:
                return 0;
        }
    });

    juegosFiltrados = [...productos];

    // Si hay algo en el buscador, respetamos el filtro después de ordenar
    if (buscador.value) {
        // Disparamos el evento de input para que filtre sobre la lista recién ordenada
        const event = new Event("input", { bubbles: true });
        buscador.dispatchEvent(event);
    } else {
        paginaActual = 1;
        renderizarPagina();
    }
}

selectOrden.addEventListener("change", ordenarProductos);

// --- 9. LÓGICA DEL MODAL ---
function obtenerAnguloActual(el) {
    const st = window.getComputedStyle(el, null);
    const tr = st.getPropertyValue("transform");
    if (tr === "none") return 0;
    const values = tr.split("(")[1].split(")")[0].split(",");
    return Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
}

function abrirModal(item) {
    document.getElementById("modalTitulo").innerText = item.nombre || "Sin Título";
    document.getElementById("modalID").innerText = item.id || "S/N";
    document.getElementById("modalFormato").innerText = item.formato || "---";
    document.getElementById("modalCompresion").innerText = item.compresion || "Zstandard";
    document.getElementById("modalImagen").src = `${rutaLocalPortadas}${item.id}.png`;

    imgDisco.style.transition = "none";
    imgDisco.style.transform = "rotate(0deg)";
    imgDisco.classList.remove("girando");
    if (stopTimeoutHandle) clearTimeout(stopTimeoutHandle);

    imgDisco.src = `${rutaLocalDiscos}${item.id}.png`;
    imgDisco.onload = function () {
        this.style.display = "block";
        this.classList.add("girando");
        stopTimeoutHandle = setTimeout(() => {
            const anguloCapturado = obtenerAnguloActual(this);
            this.classList.remove("girando");
            this.style.transition = "none";
            this.style.transform = `rotate(${anguloCapturado}deg)`;
            void this.offsetWidth;
            this.style.transition = "transform 3s cubic-bezier(0.33, 1, 0.68, 1)";
            this.style.transform = `rotate(${Math.ceil((anguloCapturado + 720) / 360) * 360}deg)`;
        }, 2000);
    };
    imgDisco.onerror = function () {
        this.style.display = "none";
    };

    const btnA = document.querySelector(".btn-gc-a");
    btnA.onclick = () => {
        if (item.url) window.location.href = item.url;
    };
    modal.style.display = "flex";
}

window.cerrarModal = function () {
    if (stopTimeoutHandle) clearTimeout(stopTimeoutHandle);
    imgDisco.classList.remove("girando");
    modal.style.display = "none";
};

// --- 10. ACCESO ADMIN ---
let buffer = "";
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    buffer += e.key.toLowerCase();
    if (buffer.includes("admin")) {
        const pass = prompt("INTRODUCE ACCESS CODE:");
        if (pass === "TU_CONTRASEÑA") window.location.href = "admin.html";
        buffer = "";
    }
    if (buffer.length > 10) buffer = buffer.substring(1);
});

cargarDesdeFirebase();
// --- 11. CONTROL DE VOLUMEN MAESTRO ---
const volumeSlider = document.getElementById("master-volume");

function updateVolumeStyle(value) {
    if (!volumeSlider) return;
    const percentage = value * 100;
    volumeSlider.style.background = `linear-gradient(90deg, #00ffff ${percentage}%, #050520 ${percentage}%)`;
}

function updateGlobalVolume(volume) {
    const allAudios = document.querySelectorAll("audio");
    allAudios.forEach((audio) => {
        if (audio.id === "bg-music") {
            audio.volume = volume * 0.4;
        } else {
            audio.volume = volume;
        }
    });
}

// INICIALIZACIÓN DEL VOLUMEN (Esto es lo que faltaba)
if (volumeSlider) {
    const savedVol = localStorage.getItem("gamecube-volume") || 0.5;
    volumeSlider.value = savedVol;
    updateVolumeStyle(savedVol);
    setTimeout(() => updateGlobalVolume(savedVol), 1000);

    volumeSlider.addEventListener("input", (e) => {
        const val = e.target.value;
        updateGlobalVolume(val);
        updateVolumeStyle(val);
        localStorage.setItem("gamecube-volume", val);
    });
}

// --- 12. SISTEMA DE LOGIN Y ALERTAS RETRO ---
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);
const modalLogin = document.getElementById("modalLogin");
const modalAlert = document.getElementById("modalAlert");
const alertTitle = document.getElementById("alertTitle");
const alertMessage = document.getElementById("alertMessage");

// --- FUNCIÓN MAESTRA DE ALERTAS ---
function showRetroAlert(title, message) {
    alertTitle.innerText = title;
    alertMessage.innerText = message;
    modalAlert.style.display = "flex";

    // Reproducir sonido de error
    const errorSound = document.getElementById("sound-error");
    if (errorSound) {
        errorSound.currentTime = 0; // Reinicia el sonido por si acaso
        errorSound.play().catch((e) => console.log("Audio de error bloqueado:", e));
    }
}

// Lógica de botones de Alerta
document.getElementById("btn-close-alert").onclick = () => {
    modalAlert.style.display = "none";
};

// Lógica de botones de Login
document.getElementById("btn-admin-login").onclick = () => {
    modalLogin.style.display = "flex";
    document.getElementById("loginEmail").focus();
};

document.getElementById("btn-cancel-login").onclick = () => {
    modalLogin.style.display = "none";
};

// --- PROCESO DE LOGIN CON MODALES ---
document.getElementById("btn-confirm-login").onclick = () => {
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPass").value;

    // CASO 1: Faltan datos
    if (!email || !pass) {
        showRetroAlert("DATA MISSING", "PLEASE INSERT ALL REQUIRED SYSTEM CREDENTIALS.");
        return;
    }

    signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            window.location.href = "admin.html";
        })
        .catch((error) => {
            // CASO 2: Datos incorrectos o errores de Firebase
            let errorMsg = "INVALID ACCESS CODE OR USER ID.";

            if (error.code === "auth/invalid-email") {
                errorMsg = "THE USER_ID FORMAT IS INCORRECT.";
            } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                errorMsg = "CREDENTIALS NOT FOUND IN MEMORY CARD.";
            }

            showRetroAlert("ACCESS DENIED", errorMsg);
            console.error(error.code);
        });
};

// Cerrar modales al hacer clic fuera
window.addEventListener("click", (event) => {
    if (event.target == modalLogin) modalLogin.style.display = "none";
    if (event.target == modalAlert) modalAlert.style.display = "none";
});
