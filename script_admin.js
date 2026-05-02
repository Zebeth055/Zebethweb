// 1. LOS IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const listaContainer = document.getElementById("lista-juegos");
const confirmModal = document.getElementById("confirmModal");
const optionYes = document.getElementById("optionYes");
const optionNo = document.getElementById("optionNo");
const confirmMessage = document.getElementById("confirmMessage");
const successModal = document.getElementById("successModal");
const btnOk = document.getElementById("btnOk");
const warningModal = document.getElementById("warningModal");
const btnOkWarning = document.getElementById("btnOkWarning");
const infoText = document.getElementById("info-text");

// 4. FUNCIONES MODALES DE SISTEMA
function customConfirm(mensaje) {
    return new Promise((resolve) => {
        confirmMessage.innerHTML = mensaje;
        confirmModal.style.display = "flex";
        optionYes.onclick = () => {
            confirmModal.style.display = "none";
            resolve(true);
        };
        optionNo.onclick = () => {
            confirmModal.style.display = "none";
            resolve(false);
        };
    });
}

function showWarning() {
    return new Promise((resolve) => {
        warningModal.style.display = "flex";
        btnOkWarning.onclick = () => {
            warningModal.style.display = "none";
            resolve();
        };
    });
}

function showSuccess() {
    return new Promise((resolve) => {
        if (!successModal) return resolve();
        successModal.style.display = "flex";
        btnOk.onclick = () => {
            successModal.style.display = "none";
            resolve();
        };
    });
}

// 5. CARGAR JUEGOS (TIEMPO REAL)
function iniciarEscuchaDB() {
    if (!listaContainer) return;

    const q = query(collection(db, "juegos"), orderBy("fecha_subida", "desc"));

    onSnapshot(q, (querySnapshot) => {
        listaContainer.innerHTML = "";

        querySnapshot.forEach((documento) => {
            const datos = documento.data();
            const idDoc = documento.id;

            const item = document.createElement("div");
            item.className = "db-item";
            item.innerHTML = `
                <button class="delete-btn" data-id="${idDoc}">X</button>
                <img src="./portadas discos/${datos.id}.png" 
                     class="disco-icon" 
                     title="${datos.nombre}" 
                     onerror="this.src='./portadas discos/undefinedcd.png'; this.onerror=null;">
            `;

            item.onclick = (e) => {
                if (!e.target.classList.contains("delete-btn")) {
                    abrirModalDetalle(datos, idDoc);
                }
            };

            item.onmouseenter = () => {
                if (infoText) {
                    // Usamos color cian neon para el ID como en tu diseño
                    infoText.innerHTML = `${datos.nombre} <span style="font-size: 0.8em; color: #00ffff; margin-left: 15px;">[${datos.id}]</span>`;
                }
            };

            item.onmouseleave = () => {
                if (infoText) infoText.innerText = "Zebethweb Database - Select a game";
            };

            listaContainer.appendChild(item);
        });

        vincularBotonesBorrarRapido();
    });
}

// 6. LÓGICA DE BORRADO RÁPIDO
function vincularBotonesBorrarRapido() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            const confirmar = await customConfirm("FAST DELETE:<br>¿Eliminar entrada ahora?");

            if (confirmar) {
                try {
                    await deleteDoc(doc(db, "juegos", id));
                    await showSuccess();
                } catch (error) {
                    console.error("Error:", error);
                }
            }
        };
    });
}

// 7. MODAL DETALLE
async function abrirModalDetalle(datos, idDoc) {
    const modal = document.getElementById("modalDetalle");
    const modalImagen = document.getElementById("modalImagen");
    const modalDisco = document.getElementById("modalDisco");

    if (modalImagen) modalImagen.src = `./portadas/${datos.id}.png`;
    if (modalDisco) {
        modalDisco.src = `./portadas discos/${datos.id}.png`;
        modalDisco.classList.add("girando");
    }

    const inputNombre = document.getElementById("editNombre");
    const inputID = document.getElementById("editID");
    const inputFormato = document.getElementById("editFormato");
    const inputURL = document.getElementById("editURL");

    if (inputNombre) inputNombre.value = datos.nombre || "";
    if (inputID) inputID.value = datos.id || "";
    if (inputFormato) inputFormato.value = datos.formato || "";
    if (inputURL) inputURL.value = datos.url || "";

    const fechaTxt = document.getElementById("modalFecha");
    if (fechaTxt) {
        fechaTxt.innerText = datos.fecha_subida?.toDate ? datos.fecha_subida.toDate().toLocaleDateString() : "N/A";
    }

    document.getElementById("btnActualizarModal").onclick = async () => {
        const confirmar = await customConfirm("¿Guardar cambios en la base de datos?");
        if (confirmar) {
            try {
                await updateDoc(doc(db, "juegos", idDoc), {
                    nombre: inputNombre.value,
                    id: inputID.value,
                    formato: inputFormato.value,
                    url: inputURL.value
                });
                modal.style.display = "none";
                await showSuccess();
            } catch (error) {
                console.error("Error al actualizar:", error);
            }
        }
    };

    document.getElementById("btnBorrarDesdeModal").onclick = async () => {
        const confirmar = await customConfirm(`¿ELIMINAR PERMANENTEMENTE?<br>${datos.nombre}`);
        if (confirmar) {
            await deleteDoc(doc(db, "juegos", idDoc));
            modal.style.display = "none";
            await showSuccess();
        }
    };

    document.getElementById("btnCerrarModal").onclick = () => {
        modal.style.display = "none";
        if (modalDisco) modalDisco.classList.remove("girando");
    };

    modal.style.display = "flex";
}

// 8. EVENTOS DE CIERRE
window.onclick = (event) => {
    const modal = document.getElementById("modalDetalle");
    if (event.target === modal) {
        modal.style.display = "none";
        const disco = document.getElementById("modalDisco");
        if (disco) disco.classList.remove("girando");
    }
};

// 9. GUARDAR NUEVO JUEGO
document.getElementById("btnGuardar").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value;
    const id = document.getElementById("id_serial").value;
    const formato = document.getElementById("formato").value;
    const url = document.getElementById("link_descarga").value; // Mapeo correcto al ID del HTML

    if (!nombre.trim() || !id.trim() || !formato.trim() || !url.trim()) {
        await showWarning();
        return;
    }

    try {
        await addDoc(collection(db, "juegos"), {
            nombre,
            id,
            formato,
            url,
            fecha_subida: new Date()
        });
        await showSuccess();
        limpiarCampos();
    } catch (e) {
        console.error("Error al guardar:", e);
    }
});

function limpiarCampos() {
    document.querySelectorAll(".left-panel input").forEach((i) => (i.value = ""));
}

document.getElementById("btnLimpiar").addEventListener("click", limpiarCampos);

// 10. LÓGICA DEL MONITOR REFRESH
const refreshBtn = document.getElementById("btn-refresh-preview");
const iframe = document.getElementById("preview-iframe");

if (refreshBtn && iframe) {
    refreshBtn.onclick = () => {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = "RELOADING...";
        refreshBtn.style.opacity = "0.5";
        refreshBtn.disabled = true;

        const currentSrc = iframe.src.split("?")[0];
        iframe.src = `${currentSrc}?t=${new Date().getTime()}`;

        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.style.opacity = "1";
            refreshBtn.disabled = false;
        }, 600);
    };
}

// 11. INICIALIZACIÓN
iniciarEscuchaDB();
