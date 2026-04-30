// 1. LOS IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. CONFIGURACIÓN
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

// 3. VARIABLES DE ELEMENTOS
const listaContainer = document.getElementById('lista-juegos');
const confirmModal = document.getElementById('confirmModal');
const optionYes = document.getElementById('optionYes');
const optionNo = document.getElementById('optionNo');
const confirmMessage = document.getElementById('confirmMessage');
const successModal = document.getElementById('successModal');
const btnOk = document.getElementById('btnOk');
const warningModal = document.getElementById('warningModal');
const btnOkWarning = document.getElementById('btnOkWarning');
const infoText = document.getElementById('info-text');

// 4. FUNCIONES MODALES
function customConfirm(mensaje) {
    return new Promise((resolve) => {
        confirmMessage.innerHTML = mensaje;
        confirmModal.style.display = 'flex';
        optionYes.onclick = () => { confirmModal.style.display = 'none'; resolve(true); };
        optionNo.onclick = () => { confirmModal.style.display = 'none'; resolve(false); };
    });
}

function showWarning() {
    return new Promise((resolve) => {
        warningModal.style.display = 'flex';
        btnOkWarning.onclick = () => {
            warningModal.style.display = 'none';
            resolve();
        };
    });
}

function showSuccess() {
    return new Promise((resolve) => {
        if(!successModal) return resolve();
        successModal.style.display = 'flex';
        btnOk.onclick = () => { successModal.style.display = 'none'; resolve(); };
    });
}

// 5. CARGAR JUEGOS (TIEMPO REAL CON ONSNAPSHOT)
function iniciarEscuchaDB() {
    if (!listaContainer) return;

    const q = query(collection(db, "juegos"), orderBy("fecha_subida", "desc"));

    onSnapshot(q, (querySnapshot) => {
        listaContainer.innerHTML = "";
        
        querySnapshot.forEach((documento) => {
            const datos = documento.data();
            const idDoc = documento.id;

            const item = document.createElement('div');
            item.className = 'db-item';
            item.innerHTML = `
                <button class="delete-btn" data-id="${idDoc}">X</button>
                <img src="./portadas discos/${datos.id}.png" class="disco-icon" title="${datos.nombre}" onerror="this.src='https://via.placeholder.com/60?text=No+Disc'">
            `;

            // EVENTOS DE MOUSE PARA EL RECTÁNGULO DE INFORMACIÓN
           item.onmouseenter = () => {
    if (infoText) {
        // Mostramos Nombre e ID (puedes ajustar el formato aquí)
        infoText.innerHTML = `${datos.nombre} <span style="font-size: 0.8em; color: var(--gc-cyan-neon); margin-left: 15px;">[${datos.id}]</span>`;
    }
};

item.onmouseleave = () => {
    if (infoText) {
        infoText.innerText = "Zebethweb Database - Select a game";
    }
};

            listaContainer.appendChild(item);
        });

        // Re-vincular eventos de borrar a los nuevos elementos generados
        vincularBotonesBorrar();
    });
}

function vincularBotonesBorrar() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation(); // Evita que el click se confunda con otros eventos
            const id = e.target.getAttribute('data-id');
            const confirmar = await customConfirm("The entry will be deleted.<br>Format it now?");
            
            if(confirmar) {
                await deleteDoc(doc(db, "juegos", id));
                await showSuccess(); 
            }
        };
    });
}

// 6. GUARDAR JUEGO
document.getElementById('btnGuardar').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value;
    const id = document.getElementById('id_serial').value;
    const formato = document.getElementById('formato').value;
    const url = document.getElementById('link_descarga').value;

    if (!nombre.trim() || !id.trim() || !formato.trim() || !url.trim()) {
        await showWarning(); 
        return;
    }

    try {
        await addDoc(collection(db, "juegos"), {
            nombre, id, formato, url, fecha_subida: new Date()
        });
        
        await showSuccess();
        limpiarCampos();
    } catch (e) { 
        console.error("Error al guardar:", e); 
    }
});

// 7. UTILIDADES
function limpiarCampos() {
    document.querySelectorAll('.form-container input').forEach(i => i.value = "");
}

document.getElementById('btnLimpiar').addEventListener('click', limpiarCampos);

// INICIAR ESCUCHA AL CARGAR
iniciarEscuchaDB();