// 1. LOS IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore, collection, addDoc, deleteDoc, doc, getDocs, 
    query, orderBy, onSnapshot, updateDoc
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

// 3. VARIABLES DE ESTADO
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
let ultimoSeleccionadoIdx = null;

// 4. SISTEMA JSON
document.getElementById('btn-export-json').onclick = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "juegos"));
        const data = querySnapshot.docs.map(doc => doc.data());
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_zebethweb_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) { console.error("Error al exportar:", error); }
};

document.getElementById('input-import-json').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const juegosParaImportar = JSON.parse(event.target.result);
            if (await customConfirm(`DATABASE INJECTION:<br>¿Importar ${juegosParaImportar.length} entradas?`)) {
                for (const juego of juegosParaImportar) {
                    await addDoc(collection(db, "juegos"), {
                        ...juego,
                        fecha_subida: new Date()
                    });
                }
                await showSuccess();
                location.reload(); 
            }
        } catch (err) { console.error("Error en importación:", err); }
    };
    reader.readAsText(file);
};

// 5. MODALES
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

// 6. BATCH MODE & AVANCED SELECTION
function toggleSeleccion(id, elemento, event, index, todosLosDocs) {
    const items = document.querySelectorAll(".db-item");

    // CASO A: SHIFT + CLICK (Selección de Rango)
    if (event.shiftKey && ultimoSeleccionadoIdx !== null) {
        const start = Math.min(ultimoSeleccionadoIdx, index);
        const end = Math.max(ultimoSeleccionadoIdx, index);
        
        // Si no se presiona Ctrl, limpiamos selección previa para crear el nuevo rango
        if (!event.ctrlKey && !event.metaKey) {
            seleccionados.clear();
            items.forEach(el => el.classList.remove("selected-batch"));
        }

        // Marcamos todos los elementos dentro del rango
        for (let i = start; i <= end; i++) {
            const idRango = todosLosDocs[i].id;
            seleccionados.add(idRango);
            items[i].classList.add("selected-batch");
        }
    } 
    // CASO B: CTRL / CMD + CLICK (Añadir/Quitar individual)
    else if (event.ctrlKey || event.metaKey) {
        if (seleccionados.has(id)) {
            seleccionados.delete(id);
            elemento.classList.remove("selected-batch");
        } else {
            seleccionados.add(id);
            elemento.classList.add("selected-batch");
        }
        // Actualizamos el índice base para el próximo Shift+Click
        ultimoSeleccionadoIdx = index;
    } 
    // CASO C: CLICK SIMPLE (Selección única)
    else {
        seleccionados.clear();
        items.forEach(el => el.classList.remove("selected-batch"));
        
        seleccionados.add(id);
        elemento.classList.add("selected-batch");
        ultimoSeleccionadoIdx = index;
    }

    actualizarBarraBatch();
}

function actualizarBarraBatch() {
    if (!infoText) return;
    if (seleccionados.size > 0) {
        infoText.parentElement.style.borderColor = "#ff3366";
        infoText.style.color = "#ff3366";
        infoText.innerHTML = `BATCH MODE: ${seleccionados.size} SELECTED <span id="run-batch" style="cursor:pointer; text-decoration:underline; margin-left:15px; font-weight:bold;">[ DELETE ALL ]</span>`;
        document.getElementById("run-batch").onclick = ejecutarBorradoLote;
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
    if (await customConfirm(`BATCH DELETE:<br>¿Eliminar ${seleccionados.size} juegos?`)) {
        const promesas = Array.from(seleccionados).map(id => deleteDoc(doc(db, "juegos", id)));
        await Promise.all(promesas);
        seleccionados.clear();
        await showSuccess();
    }
}

if (btnEdit) {
    btnEdit.onclick = () => {
        editMode = !editMode;
        document.body.classList.toggle("edit-mode-active", editMode);
        editStatus.innerText = editMode ? "ON" : "OFF";
        editStatus.className = editMode ? "status-on" : "status-off";
        
        // Limpiamos selección e índice al apagar
        if (!editMode) { 
            seleccionados.clear(); 
            ultimoSeleccionadoIdx = null; // <--- Importante
            actualizarBarraBatch(); 
        }
    };
}

// 8. ESCUCHA DB + ANIMACIONES DE ENTRADA
function iniciarEscuchaDB() {
    if (!listaContainer) return;
    const q = query(collection(db, "juegos"), orderBy("fecha_subida", "desc"));

    onSnapshot(q, (querySnapshot) => {
        listaContainer.innerHTML = "";
        const docsArray = querySnapshot.docs; // Array de referencia para los índices
        let index = 0;

        querySnapshot.forEach((documento) => {
            const datos = documento.data();
            const idDoc = documento.id;
            const item = document.createElement("div");
            
            item.className = "db-item";
            
            // Estilos de animación inicial
            item.style.opacity = "0"; 
            item.style.transform = "scale(0.8)";
            item.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            item.style.transitionDelay = `${index * 0.04}s`; 

            if (seleccionados.has(idDoc)) item.classList.add("selected-batch");

            item.innerHTML = `
                <button class="delete-btn" data-id="${idDoc}">X</button>
                <img src="Assets/CoversCD//${datos.id}.png" class="disco-icon" onerror="this.src='Assets/CoversCD//undefinedcd.png';">
            `;

            // UN SOLO ONCLICK QUE GESTIONE TODO
            item.onclick = (e) => {
                if (e.target.classList.contains("delete-btn")) return;
                
                if (editMode) {
                    // Pasamos el índice actual (index) y el array completo
                    toggleSeleccion(idDoc, item, e, index, docsArray);
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

            requestAnimationFrame(() => {
                item.style.opacity = "1";
                item.style.transform = "scale(1)";
            });

            index++; // Este contador es vital para el Shift+Click
        });
        vincularBotonesBorrarRapido();
    });
}

// 9. BORRADO RÁPIDO + ANIMACIÓN DE SALIDA
function vincularBotonesBorrarRapido() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            const itemElement = btn.closest(".db-item");

            if (await customConfirm("FAST DELETE:<br>¿Eliminar entrada ahora?")) {
                itemElement.classList.add("item-exit"); // Activamos CSS glitchDelete
                setTimeout(async () => {
                    await deleteDoc(doc(db, "juegos", id));
                    await showSuccess();
                }, 300); 
            }
        };
    });
}

// 10. MODAL DETALLE
async function abrirModalDetalle(datos, idDoc) {
    const modal = document.getElementById("modalDetalle");
    const disco = document.getElementById("modalDisco");
    
    document.getElementById("modalImagen").src = `Assets/Covers/${datos.id}.png`;
    disco.src = `Assets/CoversCD//${datos.id}.png`;
    disco.classList.add("girando");

    document.getElementById("editNombre").value = datos.nombre || "";
    document.getElementById("editID").value = datos.id || "";
    document.getElementById("editFormato").value = datos.formato || "";
    document.getElementById("editURL").value = datos.url || "";
    
    const fecha = datos.fecha_subida?.toDate ? datos.fecha_subida.toDate().toLocaleDateString() : "N/A";
    document.getElementById("modalFecha").innerText = fecha;

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

// 11. GUARDAR NUEVO
document.getElementById("btnGuardar").onclick = async () => {
    const campos = {
        nombre: document.getElementById("nombre").value,
        id: document.getElementById("id_serial").value,
        formato: document.getElementById("formato").value,
        url: document.getElementById("link_descarga").value
    };

    if (Object.values(campos).some(v => !v.trim())) {
        await showWarning(); return;
    }

    await addDoc(collection(db, "juegos"), { ...campos, fecha_subida: new Date() });
    await showSuccess();
    document.querySelectorAll(".left-panel input").forEach(i => i.value = "");
};

// 12. CERRAR MODAL CLIC FUERA
window.onclick = (e) => {
    const modal = document.getElementById("modalDetalle");
    if (e.target === modal) {
        modal.style.display = "none";
        document.getElementById("modalDisco").classList.remove("girando");
    }
};


iniciarEscuchaDB();