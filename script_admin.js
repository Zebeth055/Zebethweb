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

// 3. VARIABLES DE ELEMENTOS Y ESTADO
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
const btnEdit = document.getElementById("btn-toggle-edit");
const editStatus = document.getElementById("edit-status");

let seleccionados = new Set(); 
let editMode = false;

// 4. FUNCIONES MODALES DE SISTEMA
function customConfirm(mensaje) {
    return new Promise((resolve) => {
        confirmMessage.innerHTML = mensaje;
        confirmModal.style.display = "flex";
        optionYes.onclick = () => { confirmModal.style.display = "none"; resolve(true); };
        optionNo.onclick = () => { confirmModal.style.display = "none"; resolve(false); };
    });
}

function showWarning() {
    return new Promise((resolve) => {
        warningModal.style.display = "flex";
        btnOkWarning.onclick = () => { warningModal.style.display = "none"; resolve(); };
    });
}

function showSuccess() {
    return new Promise((resolve) => {
        if (!successModal) return resolve();
        successModal.style.display = "flex";
        btnOk.onclick = () => { successModal.style.display = "none"; resolve(); };
    });
}

// 5. LÓGICA DE SELECCIÓN Y BATCH
function toggleSeleccion(id, elemento) {
    if (seleccionados.has(id)) {
        seleccionados.delete(id);
        elemento.classList.remove("selected-batch");
    } else {
        seleccionados.add(id);
        elemento.classList.add("selected-batch");
    }
    actualizarBarraBatch();
}

function actualizarBarraBatch() {
    if (!infoText) return;
    if (seleccionados.size > 0) {
        infoText.parentElement.style.borderColor = "#ff3366";
        infoText.style.color = "#ff3366";
        infoText.innerHTML = `
            BATCH MODE: ${seleccionados.size} SELECTED 
            <span id="run-batch" style="cursor:pointer; text-decoration:underline; margin-left:15px;">[ DELETE ALL ]</span> | 
            <span id="cancel-batch" style="cursor:pointer; margin-left:5px;">[ CANCEL ]</span>`;
        
        document.getElementById("run-batch").onclick = ejecutarBorradoLote;
        document.getElementById("cancel-batch").onclick = () => {
            seleccionados.clear();
            iniciarEscuchaDB(); 
            resetBarraInfo();
        };
    } else {
        resetBarraInfo();
    }
}

function resetBarraInfo() {
    if (!infoText) return;
    infoText.parentElement.style.borderColor = "#ffffff";
    infoText.style.color = "white";
    infoText.innerText = "Zebethweb Database - Select a game";
}

async function ejecutarBorradoLote() {
    const confirmar = await customConfirm(`BATCH DELETE:<br>¿Eliminar ${seleccionados.size} juegos?`);
    if (confirmar) {
        try {
            const promesas = Array.from(seleccionados).map(id => deleteDoc(doc(db, "juegos", id)));
            await Promise.all(promesas);
            seleccionados.clear();
            await showSuccess();
        } catch (error) { console.error("Error batch:", error); }
    }
}

// 6. TOGGLE EDIT MODE
if (btnEdit) {
    btnEdit.onclick = () => {
        editMode = !editMode;
        document.body.classList.toggle("edit-mode-active", editMode);
        editStatus.innerText = editMode ? "ON" : "OFF";
        editStatus.className = editMode ? "status-on" : "status-off";
        if (!editMode) {
            seleccionados.clear();
            actualizarBarraBatch();
            iniciarEscuchaDB();
        }
    };
}

// 7. CARGAR JUEGOS (TIEMPO REAL)
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
            if (seleccionados.has(idDoc)) item.classList.add("selected-batch");

            item.innerHTML = `
                <button class="delete-btn" data-id="${idDoc}">X</button>
                <img src="./portadas discos/${datos.id}.png" class="disco-icon" onerror="this.src='./portadas discos/undefinedcd.png';">
            `;

            item.onclick = (e) => {
                if (e.target.classList.contains("delete-btn")) return;
                if (editMode) {
                    toggleSeleccion(idDoc, item);
                } else {
                    abrirModalDetalle(datos, idDoc);
                }
            };

            item.onmouseenter = () => {
                if (infoText && !seleccionados.size) {
                    infoText.innerHTML = `${datos.nombre} <span style="color:#00ffff">[${datos.id}]</span>`;
                }
            };
            listaContainer.appendChild(item);
        });
        vincularBotonesBorrarRapido();
    });
}

// 8. BORRADO RÁPIDO (BOTÓN X)
function vincularBotonesBorrarRapido() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            if (await customConfirm("FAST DELETE:<br>¿Eliminar entrada ahora?")) {
                await deleteDoc(doc(db, "juegos", id));
                await showSuccess();
            }
        };
    });
}

// 9. MODAL DETALLE (EDICIÓN)
async function abrirModalDetalle(datos, idDoc) {
    const modal = document.getElementById("modalDetalle");
    document.getElementById("modalImagen").src = `./portadas/${datos.id}.png`;
    const disco = document.getElementById("modalDisco");
    disco.src = `./portadas discos/${datos.id}.png`;
    disco.classList.add("girando");

    document.getElementById("editNombre").value = datos.nombre || "";
    document.getElementById("editID").value = datos.id || "";
    document.getElementById("editFormato").value = datos.formato || "";
    document.getElementById("editURL").value = datos.url || "";
    document.getElementById("modalFecha").innerText = datos.fecha_subida?.toDate ? datos.fecha_subida.toDate().toLocaleDateString() : "N/A";

    document.getElementById("btnActualizarModal").onclick = async () => {
        if (await customConfirm("¿Guardar cambios?")) {
            await updateDoc(doc(db, "juegos", idDoc), {
                nombre: document.getElementById("editNombre").value,
                id: document.getElementById("editID").value,
                formato: document.getElementById("editFormato").value,
                url: document.getElementById("editURL").value
            });
            modal.style.display = "none";
            await showSuccess();
        }
    };

    document.getElementById("btnBorrarDesdeModal").onclick = async () => {
        if (await customConfirm(`¿ELIMINAR PERMANENTEMENTE?<br>${datos.nombre}`)) {
            await deleteDoc(doc(db, "juegos", idDoc));
            modal.style.display = "none";
            await showSuccess();
        }
    };

    document.getElementById("btnCerrarModal").onclick = () => {
        modal.style.display = "none";
        disco.classList.remove("girando");
    };
    modal.style.display = "flex";
}

// 10. GUARDAR NUEVO
document.getElementById("btnGuardar").onclick = async () => {
    const nombre = document.getElementById("nombre").value;
    const id = document.getElementById("id_serial").value;
    const formato = document.getElementById("formato").value;
    const url = document.getElementById("link_descarga").value;

    if (!nombre.trim() || !id.trim() || !formato.trim() || !url.trim()) {
        await showWarning(); return;
    }
    await addDoc(collection(db, "juegos"), { nombre, id, formato, url, fecha_subida: new Date() });
    await showSuccess();
    document.querySelectorAll(".left-panel input").forEach(i => i.value = "");
};

// 11. CERRAR MODAL CLIC FUERA
window.onclick = (e) => {
    const modal = document.getElementById("modalDetalle");
    if (e.target === modal) {
        modal.style.display = "none";
        document.getElementById("modalDisco").classList.remove("girando");
    }
};

// --- 12. GENERADOR DE DATOS DE PRUEBA (SEEDER) ---
const btnSeed = document.getElementById("btn-seed-data");

if (btnSeed) {
    btnSeed.onclick = async () => {
        const cantidad = prompt("¿Cuántos juegos de prueba quieres generar?", "15");
        if (!cantidad || isNaN(cantidad)) return;

        btnSeed.classList.add("generating-active");
        btnSeed.innerText = "INJECTING...";

        const nombres = ["Super", "Legend of", "Mario", "Metroid", "Sonic", "Extreme", "Star", "Mega"];
        const sufijos = ["Adventure", "Prime", "Sunshine", "Battle", "Strikers", "Chronicles", "Galaxy"];
        
        try {
            for (let i = 0; i < parseInt(cantidad); i++) {
                const nombreFake = `${nombres[Math.floor(Math.random() * nombres.length)]} ${sufijos[Math.floor(Math.random() * sufijos.length)]} ${i+1}`;
                
                // Generar un ID tipo GALE01, GLME01, etc.
                const idFake = `G${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}E0${i}`;

                await addDoc(collection(db, "juegos"), {
                    nombre: nombreFake,
                    id: idFake, // Esto buscará una imagen inexistente o el undefinedcd.png
                    formato: "ISO",
                    url: "https://example.com/download",
                    fecha_subida: new Date(Date.now() - (i * 3600000)) // Los desfasa por 1 hora para probar el orden
                });
            }
            alert(`Inyección completada: ${cantidad} juegos creados.`);
        } catch (error) {
            console.error("Error en el seeding:", error);
        } finally {
            btnSeed.classList.remove("generating-active");
            btnSeed.innerText = "GENERATE TEST DATA";
        }
    };
}

// INICIALIZACIÓN
iniciarEscuchaDB();