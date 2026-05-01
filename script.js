import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDht5heke57pshhg9JWyhlGoYqg3evj93c",
    authDomain: "lista-juegos-gamecube.firebaseapp.app",
    projectId: "lista-juegos-gamecube",
    storageBucket: "lista-juegos-gamecube.firebasestorage.app",
    messagingSenderId: "497969896150",
    appId: "1:497969896150:web:9fc8cecef549fa2d284777"
};

const startBtn = document.getElementById('start-btn');
const intro = document.getElementById('intro-screen');
const video = document.getElementById('gamecube-intro');
const jingle = document.getElementById('startup-jingle');
const bgMusic = document.getElementById('bg-music');
let introTerminada = false; // Esta es la llave

// PASO 1: Iniciar video al presionar botón
startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    
    // Configuración para Android
    video.muted = false;
    video.volume = 1.0;
    
    video.play().catch(error => {
        video.play();
    });
});

// PASO 2: Al terminar video -> Jingle y Desvanecimiento
video.onended = () => {
    intro.classList.add('fade-out');
    jingle.play();
    
    introTerminada = true; // <--- Abrimos la llave aquí
    animarGrid(); // Disparamos la animación manualmente esta primera vez

    setTimeout(() => {
        if(intro) intro.remove();
    }, 800);
};

function animarGrid() {
    const cards = document.querySelectorAll('.tarjeta-wrapper:not(.show)');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('show');
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

const container = document.getElementById('grid-container');
const modal = document.getElementById('modalDetalle');
const buscador = document.getElementById('inputBuscador');
const imgDisco = document.getElementById('modalDisco');
const selectOrden = document.getElementById('selectOrden');

let stopTimeoutHandle = null;
let debounceTimer; // Para el buscador suave

// --- 3. DETECTAR OS ---
const detectOS = () => {
    const ua = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod/i.test(ua)) {
        document.body.classList.add('mobile-os', 'android-optimizado');
        juegosPorPagina = 8; // <--- En Android solo mostramos 6 (o los que prefieras)
    } else {
        juegosPorPagina = 20; // <--- En PC se mantienen los 12
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
    juegosVisibles.forEach(p => {
        const wrapper = document.createElement('div');
        wrapper.className = 'tarjeta-wrapper'; // Nace invisible (opacity 0)

        const card = document.createElement('div');
        card.className = 'tarjeta';
        card.onclick = () => abrirModal(p);

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
    document.getElementById('page-info').innerText = `PÁGINA ${paginaActual} DE ${totalPaginas}`;
    
    document.getElementById('prev-page').disabled = (paginaActual === 1);
    document.getElementById('next-page').disabled = (paginaActual >= totalPaginas);
}

// --- 6. NAVEGACIÓN SUAVE ---
function cambiarPaginaConEfecto(nuevaPagina) {
    container.classList.add('grid-fade-out');

    setTimeout(() => {
        paginaActual = nuevaPagina;
        renderizarPagina();
        container.classList.remove('grid-fade-out');
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 300);
}

document.getElementById('next-page').addEventListener('click', () => {
    const totalPaginas = Math.ceil(juegosFiltrados.length / juegosPorPagina);
    if (paginaActual < totalPaginas) cambiarPaginaConEfecto(paginaActual + 1);
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (paginaActual > 1) cambiarPaginaConEfecto(paginaActual - 1);
});

// --- 7. BUSCADOR SUAVE (DEBOUNCE) ---
buscador.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const limpiarTexto = (texto) => {
            return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, "");
        };

        const queryInput = limpiarTexto(e.target.value);
        
        juegosFiltrados = productos.filter(p => {
            const nombreLimpio = limpiarTexto(p.nombre || "");
            return nombreLimpio.includes(queryInput);
        });

        paginaActual = 1;
        renderizarPagina();
    }, 250); 
});

// --- 8. ORDENAMIENTO ---
function obtenerPesoNumerico(formatoStr) {
    if (!formatoStr || typeof formatoStr !== 'string') return 0;
    const match = formatoStr.match(/(\d+\.?\d*)\s*(GiB|MiB)/);
    if (!match) return 0;
    let valor = parseFloat(match[1]);
    return match[2] === "GiB" ? valor * 1024 : valor;
}

function ordenarProductos() {
    const metodo = selectOrden.value;

    productos.sort((a, b) => {
        const nombreA = a.nombre || "";
        const nombreB = b.nombre || "";
        if (metodo === "az") return nombreA.localeCompare(nombreB);
        if (metodo === "za") return nombreB.localeCompare(nombreA);
        if (metodo === "peso") return obtenerPesoNumerico(b.formato) - obtenerPesoNumerico(a.formato);
        return 0;
    });

    juegosFiltrados = [...productos]; 
    if (buscador.value) {
        buscador.dispatchEvent(new Event('input'));
    } else {
        paginaActual = 1;
        renderizarPagina();
    }
}

selectOrden.addEventListener('change', ordenarProductos);

// --- 9. LÓGICA DEL MODAL ---
function obtenerAnguloActual(el) {
    const st = window.getComputedStyle(el, null);
    const tr = st.getPropertyValue("transform");
    if (tr === "none") return 0;
    const values = tr.split('(')[1].split(')')[0].split(',');
    return Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
}

function abrirModal(item) {
    document.getElementById('modalTitulo').innerText = item.nombre || "Sin Título";
    document.getElementById('modalID').innerText = item.id || "S/N";
    document.getElementById('modalFormato').innerText = item.formato || "---";
    document.getElementById('modalCompresion').innerText = item.compresion || "Zstandard";
    document.getElementById('modalImagen').src = `${rutaLocalPortadas}${item.id}.png`;
    
    imgDisco.style.transition = 'none';
    imgDisco.style.transform = 'rotate(0deg)';
    imgDisco.classList.remove('girando');
    if (stopTimeoutHandle) clearTimeout(stopTimeoutHandle);

    imgDisco.src = `${rutaLocalDiscos}${item.id}.png`;
    imgDisco.onload = function() {
        this.style.display = 'block';
        this.classList.add('girando');
        stopTimeoutHandle = setTimeout(() => {
            const anguloCapturado = obtenerAnguloActual(this);
            this.classList.remove('girando');
            this.style.transition = 'none';
            this.style.transform = `rotate(${anguloCapturado}deg)`;
            void this.offsetWidth; 
            this.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)'; 
            this.style.transform = `rotate(${Math.ceil((anguloCapturado + 720) / 360) * 360}deg)`;
        }, 2000); 
    };
    imgDisco.onerror = function() { this.style.display = 'none'; };
    
    const btnA = document.querySelector('.btn-gc-a');
    btnA.onclick = () => { if(item.url) window.location.href = item.url; };
    modal.style.display = "flex";
}

window.cerrarModal = function() {
    if (stopTimeoutHandle) clearTimeout(stopTimeoutHandle);
    imgDisco.classList.remove('girando');
    modal.style.display = "none";
};

// --- 10. ACCESO ADMIN ---
let buffer = "";
document.addEventListener('keydown', (e) => {
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