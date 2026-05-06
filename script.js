// --- 1. IMPORTS DE FIREBASE (Siempre al inicio) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 2. CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDht5heke57pshhg9JWyhlGoYqg3evj93c",
    authDomain: "lista-juegos-gamecube.firebaseapp.app",
    projectId: "lista-juegos-gamecube",
    storageBucket: "lista-juegos-gamecube.firebasestorage.app",
    messagingSenderId: "497969896150",
    appId: "1:497969896150:web:9fc8cecef549fa2d284777"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Variables de historial (por si las usas más adelante)
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 20; 

// --- 3. ELEMENTOS DEL DOM GLOBALES ---
const startBtn = document.getElementById("start-btn");
const intro = document.getElementById("intro-screen");
const video = document.getElementById("gamecube-intro");
const jingle = document.getElementById("startup-jingle");
const bgMusic = document.getElementById("bg-music");
const led = document.getElementById('power-led');
const lid = document.getElementById('gc-lid');

const jewelDiv = document.getElementById('jewel-container');
const gridContainer = document.getElementById("grid-container");
const selectOrden = document.getElementById("selectOrden");
const buscador = document.getElementById("inputBuscador");
const volumeSlider = document.getElementById("master-volume");
const adminZone = document.querySelector(".admin-header-zone");

const modalDetalle = document.getElementById("modalDetalle");
const imgDisco = document.getElementById("modalDisco");
const modalLogin = document.getElementById("modalLogin");
const modalAlert = document.getElementById("modalAlert");

// --- 4. VARIABLES DE ESTADO ---
let introTerminada = false;
let productos = [];
let juegosFiltrados = [];
let paginaActual = 1;
let juegosPorPagina = 12;
let debounceTimer;
let stopTimeoutHandle = null;

const rutaLocalPortadas = "Assets/Covers/";
const rutaLocalDiscos = "Assets/CoversCD/";

// --- 5. DETECTAR OS (Paginación) ---
const detectOS = () => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        document.body.classList.add("mobile-os", "android-optimizado");
        juegosPorPagina = 20;
    } else {
        juegosPorPagina = 25;
    }
};
detectOS();

// --- 6. LÓGICA DEL JEWEL Y REFLEJO ---
let mouseX = 50, followX = 50;
const suavizado = 0.05, offsetJewel = -50;

fetch('Assets/jewel.svg')
    .then(response => response.text())
    .then(data => {
        if (jewelDiv) {
            jewelDiv.innerHTML = data;
            const svg = jewelDiv.querySelector('svg');
            if (svg) svg.id = 'jewel-logo';
        }
    });

function animateReflejo() {
    followX += (mouseX + offsetJewel - followX) * suavizado;
    if (jewelDiv) jewelDiv.style.setProperty('--reflejo-x', `${followX}%`);
    requestAnimationFrame(animateReflejo);
}
animateReflejo();

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 100;
});

// --- 7. SECUENCIA DE ENCENDIDO (POWER) ---
if (startBtn) {
    startBtn.onclick = () => {
        startBtn.style.display = "none";
        if (led) led.classList.add('led-on');
        if (lid) lid.classList.add('lid-open');
        video.muted = false;
        video.volume = 1.0;
        setTimeout(() => { video.play().catch(e => console.log(e)); }, 150);
    };
}

video.onended = () => {
    intro.classList.add("fade-out");
    if (jingle) jingle.play();
    introTerminada = true; 
    renderizarPagina();
    setTimeout(() => { if (intro) intro.remove(); }, 800);
};

if (jingle) {
    jingle.onended = () => {
        bgMusic.volume = 0.4;
        bgMusic.play();
    };
}

// --- 8. GESTIÓN DE SESIÓN (BOTONES ADMIN DINÁMICOS) ---
onAuthStateChanged(auth, (user) => {
    const btnAdminOriginal = document.getElementById("btn-admin-login");
    
    if (user) {
        if (btnAdminOriginal) btnAdminOriginal.style.display = "none";
        document.getElementById("btn-modificar")?.remove();
        document.getElementById("btn-logout")?.remove();

        const modBtn = document.createElement("button");
        modBtn.id = "btn-modificar";
        modBtn.className = "gc-btn-mini";
        modBtn.style.marginRight = "10px";
        modBtn.innerHTML = `<span class="btn-icon-admin" style="filter: hue-rotate(90deg);"></span> MODIFICAR`;
        modBtn.onclick = () => window.location.href = "admin.html";

        const logoutBtn = document.createElement("button");
        logoutBtn.id = "btn-logout";
        logoutBtn.className = "gc-btn-mini";
        logoutBtn.style.borderColor = "var(--btn-b)";
        logoutBtn.innerHTML = `<span class="btn-icon b" style="padding: 2px 5px; font-size: 10px; margin-right: 5px;">B</span> SALIR`;
        logoutBtn.onclick = () => signOut(auth).then(() => window.location.reload());

        if(adminZone) {
            adminZone.appendChild(modBtn);
            adminZone.appendChild(logoutBtn);
        }
    } else {
        if (btnAdminOriginal) {
            btnAdminOriginal.style.display = "flex";
            btnAdminOriginal.onclick = () => {
                modalLogin.style.display = "flex";
                document.getElementById("loginEmail").focus();
            };
        }
        document.getElementById("btn-modificar")?.remove();
        document.getElementById("btn-logout")?.remove();
    }
});

// --- 9. CARGA DE BASE DE DATOS Y RENDERIZADO ---
async function cargarDesdeFirebase() {
    try {
        const querySnapshot = await getDocs(query(collection(db, "juegos")));
        productos = [];
        querySnapshot.forEach((doc) => productos.push(doc.data()));
        ordenarProductos();
    } catch (error) {
        console.error("Error BD:", error);
    }
}

function renderizarPagina() {
    if (!gridContainer) return;
    gridContainer.innerHTML = "";

    const inicio = (paginaActual - 1) * juegosPorPagina;
    const juegosVisibles = juegosFiltrados.slice(inicio, inicio + juegosPorPagina);

    if (juegosVisibles.length === 0) {
        gridContainer.innerHTML = `<div style="color:white; grid-column: 1/-1; text-align:center; padding: 50px; font-family: 'JetBrains Mono', monospace;">[ SIN DATOS EN ESTA SECCIÓN ]</div>`;
        actualizarControlesPaginacion();
        return;
    }

    juegosVisibles.forEach((p, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "tarjeta-wrapper";
        
        const card = document.createElement("div");
        card.className = "tarjeta";
        card.innerHTML = `
            <img src="${rutaLocalPortadas}${p.id}.png" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/210x270'">
            <div class="tarjeta-info">${p.nombre}</div>
        `;

        card.onclick = () => {
            const randomNum = Math.floor(Math.random() * 3) + 1;
            const sound = document.getElementById(`sound-select-${randomNum}`);
            if (sound) { sound.currentTime = 0; sound.play().catch(()=>{}); }
            window.abrirModal(p.id);
        };

        wrapper.appendChild(card);
        gridContainer.appendChild(wrapper);
        
        if (introTerminada) setTimeout(() => wrapper.classList.add("show"), 50 * index);
    });

    actualizarControlesPaginacion();
}

// --- 10. PAGINACIÓN Y NAVEGACIÓN ---
function actualizarControlesPaginacion() {
    const totalPaginas = Math.ceil(juegosFiltrados.length / juegosPorPagina) || 1;
    const containerPuertos = document.getElementById('container-puertos');
    if (!containerPuertos) return;

    containerPuertos.innerHTML = "";
    for (let i = 1; i <= totalPaginas; i++) {
        const port = document.createElement('div');
        port.className = `port ${i === paginaActual ? 'active' : ''}`;
        port.style.cursor = "pointer";
        port.innerHTML = `<div class="port-index">${'<span></span>'.repeat(i)}</div><div class="pin-grid"></div>`;
        
        port.onclick = () => {
            if (i !== paginaActual) {
                playNavSound("sound-select-1");
                cambiarPaginaConEfecto(i);
            }
        };
        containerPuertos.appendChild(port);
    }

    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');
    if (btnPrev) btnPrev.disabled = (paginaActual === 1);
    if (btnNext) btnNext.disabled = (paginaActual >= totalPaginas);
}

function cambiarPaginaConEfecto(nuevaPagina) {
    gridContainer.classList.add("grid-fade-out");
    setTimeout(() => {
        paginaActual = nuevaPagina;
        renderizarPagina();
        gridContainer.classList.remove("grid-fade-out");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
}

function playNavSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.volume = localStorage.getItem("gamecube-volume") || 0.5;
        sound.play().catch(()=>{});
    }
}

document.getElementById("next-page")?.addEventListener("click", () => {
    if (paginaActual < Math.ceil(juegosFiltrados.length / juegosPorPagina)) {
        playNavSound("sound-next");
        cambiarPaginaConEfecto(paginaActual + 1);
    }
});

document.getElementById("prev-page")?.addEventListener("click", () => {
    if (paginaActual > 1) {
        playNavSound("sound-prev");
        cambiarPaginaConEfecto(paginaActual - 1);
    }
});

// --- 11. BÚSQUEDA Y ORDENAMIENTO ---
if(buscador){
    buscador.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const limpiarTexto = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, "");
            const queryInput = limpiarTexto(e.target.value);
            juegosFiltrados = productos.filter(p => limpiarTexto(p.nombre || "").includes(queryInput));
            paginaActual = 1;
            renderizarPagina();
        }, 250);
    });
}

function obtenerPesoNumerico(formatoStr) {
    if (!formatoStr) return 0;
    const match = formatoStr.match(/\(([\d.]+)\s*(GB|GiB|MB|MiB)\)/i);
    if (!match) return 0;
    return match[2].toUpperCase().includes("G") ? parseFloat(match[1]) * 1024 : parseFloat(match[1]);
}

function ordenarProductos() {
    if(!selectOrden) return;
    const metodo = selectOrden.value;
    productos.sort((a, b) => {
        const nomA = a.nombre || "", nomB = b.nombre || "";
        if (metodo === "az") return nomA.localeCompare(nomB);
        if (metodo === "za") return nomB.localeCompare(nomA);
        if (metodo === "peso") {
            const pesoA = obtenerPesoNumerico(a.formato);
            const pesoB = obtenerPesoNumerico(b.formato);
            return pesoB === pesoA ? nomA.localeCompare(nomB) : pesoB - pesoA;
        }
        return 0;
    });
    juegosFiltrados = [...productos];
    if (buscador && buscador.value) buscador.dispatchEvent(new Event("input", { bubbles: true }));
    else { paginaActual = 1; renderizarPagina(); }
}
if(selectOrden) selectOrden.addEventListener("change", ordenarProductos);

// --- 12. LÓGICA DEL MODAL (DISCO GIRATORIO Y REDIRECCIÓN) ---
function obtenerAnguloActual(el) {
    const st = window.getComputedStyle(el, null);
    const tr = st.getPropertyValue("transform");
    if (tr === "none") return 0;
    const values = tr.split("(")[1].split(")")[0].split(",");
    return Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
}

window.abrirModal = function(idJuego) {
    const item = productos.find(p => p.id === idJuego);
    if(!item || !modalDetalle) return;

    document.getElementById("modalTitulo").innerText = item.nombre || "Sin Título";
    document.getElementById("modalID").innerText = item.id || "S/N";
    document.getElementById("modalFormato").innerText = item.formato || "---";
    document.getElementById("modalCompresion").innerText = item.compresion || "Zstandard";
    document.getElementById("modalImagen").src = `${rutaLocalPortadas}${item.id}.png`;

    if(imgDisco) {
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
        imgDisco.onerror = function () { this.style.display = "none"; };
    }
    
    // --- LÓGICA DE REDIRECCIÓN (RESTAURADA) ---
    const btnA = modalDetalle.querySelector(".btn-gc-a");
    if (btnA) {
        btnA.onclick = () => {
            if (item.url) window.location.href = item.url;
        };
    }

    modalDetalle.style.display = "flex";
}

window.cerrarModal = function () {
    if (stopTimeoutHandle) clearTimeout(stopTimeoutHandle);
    if(imgDisco) imgDisco.classList.remove("girando");
    if(modalDetalle) modalDetalle.style.display = "none";
};

// --- 13. CONTROL DE VOLUMEN MAESTRO ---
function updateVolumeStyle(value) {
    if (!volumeSlider) return;
    const percentage = value * 100;
    volumeSlider.style.background = `linear-gradient(90deg, #00ffff ${percentage}%, #050520 ${percentage}%)`;
}

function updateGlobalVolume(volume) {
    document.querySelectorAll("audio").forEach(audio => {
        audio.volume = audio.id === "bg-music" ? volume * 0.4 : volume;
    });
}

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

// --- 14. SISTEMA COMPLETO DE LOGIN Y ALERTAS RETRO ---
function showRetroAlert(title, message) {
    const titleEl = document.getElementById("alertTitle");
    const msgEl = document.getElementById("alertMessage");
    if(titleEl) titleEl.innerText = title;
    if(msgEl) msgEl.innerText = message;
    
    if(modalAlert) modalAlert.style.display = "flex";

    const errorSound = document.getElementById("sound-error");
    if (errorSound) {
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
    }
}

const btnCloseAlert = document.getElementById("btn-close-alert");
if(btnCloseAlert) btnCloseAlert.onclick = () => modalAlert.style.display = "none";

const btnCancelLogin = document.getElementById("btn-cancel-login");
if(btnCancelLogin) btnCancelLogin.onclick = () => modalLogin.style.display = "none";

const btnConfirmLogin = document.getElementById("btn-confirm-login");
if(btnConfirmLogin) {
    btnConfirmLogin.onclick = () => {
        const email = document.getElementById("loginEmail").value;
        const pass = document.getElementById("loginPass").value;

        if (!email || !pass) {
            showRetroAlert("DATA MISSING", "PLEASE INSERT ALL REQUIRED SYSTEM CREDENTIALS.");
            return;
        }

        signInWithEmailAndPassword(auth, email, pass)
            .then(() => { 
                modalLogin.style.display = "none"; 
                // La UI cambiará sola gracias al onAuthStateChanged
            })
            .catch((error) => {
                let errorMsg = "INVALID ACCESS CODE OR USER ID.";
                if (error.code === "auth/invalid-email") errorMsg = "THE USER_ID FORMAT IS INCORRECT.";
                else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                    errorMsg = "CREDENTIALS NOT FOUND IN MEMORY CARD.";
                }
                showRetroAlert("ACCESS DENIED", errorMsg);
            });
    };
}

// Acceso secreto mediante escritura 'admin'
let buffer = "";
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    buffer += e.key.toLowerCase();
    if (buffer.includes("admin")) {
        if(modalLogin) modalLogin.style.display = "flex";
        const emailInput = document.getElementById("loginEmail");
        if(emailInput) emailInput.focus();
        buffer = "";
    }
    if (buffer.length > 10) buffer = buffer.substring(1);
});

// Cerrar modales al dar clic afuera
window.addEventListener("click", (event) => {
    if (event.target == modalLogin) modalLogin.style.display = "none";
    if (event.target == modalAlert) modalAlert.style.display = "none";
    if (event.target == modalDetalle) window.cerrarModal();
});

// --- 15. INICIALIZACIÓN FINAL ---
cargarDesdeFirebase();