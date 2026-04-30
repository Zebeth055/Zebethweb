const detectOS = () => {
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

    if (isMobile) {
        document.body.classList.add('mobile-os');
    }
};

detectOS();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. CONFIGURACIÓN FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDht5heke57pshhg9JWyhlGoYqg3evj93c",
    authDomain: "lista-juegos-gamecube.firebaseapp.com",
    projectId: "lista-juegos-gamecube",
    storageBucket: "lista-juegos-gamecube.firebasestorage.app",
    messagingSenderId: "497969896150",
    appId: "1:497969896150:web:9fc8cecef549fa2d284777"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reemplazamos la lista estática por una variable dinámica
let productos = [];

// --- TU LÓGICA ORIGINAL DE INICIO ---
document.addEventListener("DOMContentLoaded", function () {
    if (/Android/i.test(navigator.userAgent)) {
        document.body.classList.add("no-blur", "no-fixed-bg");
        document.body.classList.add("android-optimizado");
    }
});

const rutaLocalPortadas = "./portadas/";
const rutaLocalDiscos = "./portadas discos/"; 

const container = document.getElementById('grid-container');
const modal = document.getElementById('modalDetalle');
const buscador = document.getElementById('inputBuscador');
const imgDisco = document.getElementById('modalDisco');
const selectOrden = document.getElementById('selectOrden');

let stopTimeoutHandle = null;

// --- FUNCIÓN NUEVA: CARGA DE DATOS ---
async function cargarDesdeFirebase() {
    try {
        const q = query(collection(db, "juegos"));
        const querySnapshot = await getDocs(q);
        productos = [];
        querySnapshot.forEach((doc) => {
            productos.push(doc.data());
        });
        // Una vez cargados, disparamos tu lógica original
        ordenarProductos(); 
    } catch (error) {
        console.error("Error cargando base de datos:", error);
    }
}

// --- TU FUNCIÓN: OBTENER ÁNGULO ---
function obtenerAnguloActual(el) {
    const st = window.getComputedStyle(el, null);
    const tr = st.getPropertyValue("transform");
    if (tr === "none") return 0;

    const values = tr.split('(')[1].split(')')[0].split(',');
    const a = values[0];
    const b = values[1];
    const angleRadianes = Math.atan2(b, a);
    let angleGrados = Math.round(angleRadianes * (180 / Math.PI));
    if (angleGrados < 0) angleGrados += 360;
    return angleGrados;
}

// --- TU FUNCIÓN: INICIALIZAR GRID ---
function inicializarGrid() {
    container.innerHTML = "";
    productos.forEach(p => {
        const wrapper = document.createElement('div');
        wrapper.className = 'tarjeta-wrapper';
        
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
}

// --- TU FUNCIÓN: ABRIR MODAL ---
function abrirModal(item) {
    // Usamos los nombres exactos de tu Firebase: id, formato y nombre
    // Agregamos || "---" por si algún campo está vacío o es null
    const idCorto = item.id || "S/N";
    const formatoTexto = item.formato || "No disponible";
    const compresionTexto = item.compresion || "Zstandard"; // Si no lo tienes en Firebase, saldrá este por defecto
    const tituloJuego = item.nombre || "Sin Título";

    document.getElementById('modalTitulo').innerText = tituloJuego;
    document.getElementById('modalID').innerText = idCorto;
    document.getElementById('modalFormato').innerText = formatoTexto;
    document.getElementById('modalCompresion').innerText = compresionTexto;

    // Lógica de imágenes (esta ya te funcionaba bien)
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

            const vueltasDeInercia = 720; 
            const anguloFinalDestino = Math.ceil((anguloCapturado + vueltasDeInercia) / 360) * 360;

            this.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)'; 
            this.style.transform = `rotate(${anguloFinalDestino}deg)`;
        }, 2000); 
    };

    imgDisco.onerror = function() { this.style.display = 'none'; };
    
    const btnA = document.querySelector('.btn-gc-a');
    btnA.onclick = () => {
        if(item.url) window.location.href = item.url;
    };
    
    modal.style.display = "flex";
}

// --- TU FUNCIÓN: CERRAR MODAL ---
window.cerrarModal = function() {
    if (stopTimeoutHandle) clearTimeout(stopTimeoutHandle);
    imgDisco.classList.remove('girando');
    imgDisco.style.transition = 'none';
    modal.style.display = "none";
}

// --- TU LÓGICA DE BUSCADOR ---
buscador.addEventListener('input', (e) => {
    const limpiarTexto = (texto) => {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/gi, "");
    };

    const queryInput = limpiarTexto(e.target.value);
    
    document.querySelectorAll('.tarjeta-wrapper').forEach(wrapper => {
        const nombreOriginal = wrapper.querySelector('.tarjeta-info').innerText;
        const nombreLimpio = limpiarTexto(nombreOriginal);
        
        if (nombreLimpio.includes(queryInput)) {
            wrapper.style.display = "block"; 
        } else {
            wrapper.style.display = "none"; 
        }
    });
});

// --- TU LÓGICA DE PESO Y ORDEN ---
function obtenerPesoNumerico(formatoStr) {
    // Si el formato es null o no es un texto, devolvemos 0
    if (!formatoStr || typeof formatoStr !== 'string') return 0;
    
    const match = formatoStr.match(/(\d+\.?\d*)\s*(GiB|MiB)/);
    if (!match) return 0;
    
    let valor = parseFloat(match[1]);
    const unidad = match[2];
    
    return unidad === "GiB" ? valor * 1024 : valor;
}

function ordenarProductos() {
    const metodo = selectOrden.value;

    productos.sort((a, b) => {
        if (metodo === "az") {
            return a.nombre.localeCompare(b.nombre);
        } else if (metodo === "za") {
            return b.nombre.localeCompare(a.nombre);
        } else if (metodo === "peso") {
            return obtenerPesoNumerico(b.formato) - obtenerPesoNumerico(a.formato);
        }
        return 0;
    });

    inicializarGrid();
    buscador.dispatchEvent(new Event('input'));
}

selectOrden.addEventListener('change', ordenarProductos);

let buffer = "";
document.addEventListener('keydown', (e) => {
    // Si el usuario está escribiendo en el buscador, NO activar el código
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    buffer += e.key.toLowerCase();
    if (buffer.includes("admin")) {
        const pass = prompt("INTRODUCE ACCESS CODE:");
        if (pass === "TU_CONTRASEÑA_AQUÍ") {
            window.location.href = "admin.html";
        }
        buffer = ""; 
    }
    if (buffer.length > 10) buffer = buffer.substring(1);
});
// DISPARO INICIAL
cargarDesdeFirebase();

