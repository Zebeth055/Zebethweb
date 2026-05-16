// 1. LOS IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    initializeFirestore, collection, addDoc, deleteDoc, doc, getDocs, 
    query, orderBy, onSnapshot, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});

signInWithEmailAndPassword(auth, "tu-email@ejemplo.com", "tu-password")
  .then((userCredential) => console.log("Logueado como:", userCredential.user.uid))
  .catch((error) => console.error("Error de login:", error.message));

// 3. VARIABLES DE ESTADO Y DOM
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

// Variables para el Switch de Consola
const btnConsole = document.getElementById("btn-toggle-console");
const consoleLabel = document.getElementById("console-label");
const consoleIcon = document.getElementById("console-icon");

let consolaActual = "gamecube"; // Estado inicial: gamecube o gba
let unsubscribeDB = null; 

let seleccionados = new Set(); 
let editMode = false;
let ultimoSeleccionadoIdx = null;

// Helper para obtener el nombre exacto de la colección
function obtenerColeccion() {
    return consolaActual === "gamecube" ? "juegos" : "gba juegos";
}

// --- LÓGICA DEL SWITCH DE CONSOLA ---
// --- LÓGICA DEL SWITCH DE CONSOLA ---
if (btnConsole) {
    btnConsole.onclick = () => {
        consolaActual = (consolaActual === "gamecube") ? "gba" : "gamecube";
        
        if (consolaActual === "gba") {
            consoleLabel.innerText = "GBA";
            btnConsole.style.borderColor = "#00ff5d";
            btnConsole.style.color = "#00ff5d";
            
            // Cambiar el src al icono de Game Boy Advance
            consoleIcon.src = "Assets/icons/gba icon.png"; 
        } else {
            consoleLabel.innerText = "GAMECUBE";
            btnConsole.style.borderColor = "#ff3366";
            btnConsole.style.color = "#ff3366";
            
            // Cambiar el src al icono de GameCube
            consoleIcon.src = "Assets/icons/gamecube icon.png";
        }

        // Limpiar estados de selección previa
        seleccionados.clear();
        ultimoSeleccionadoIdx = null;
        actualizarBarraBatch();
        
        // Escuchar la nueva base de datos correspondiente
        iniciarEscuchaDB();
    };
}

// --- BOTÓN GENERAR DATA DE PRUEBA (ARREGLADO) ---
const btnSeedData = document.getElementById("btn-seed-data");
if (btnSeedData) {
    btnSeedData.onclick = async () => {
        const msg = `SEED DATA:<br>¿Generar 3 juegos de prueba en la colección de ${consolaActual.toUpperCase()}?`;
        if (await customConfirm(msg)) {
            let juegosPrueba = [];
            
            if (consolaActual === "gba") {
                juegosPrueba = [
                    { nombre_mostrar: "Pokémon Esmeralda", nombre_archivo: "BPEE", formato: "GBA", url: "https://firebasestorage.googleapis.com/.../pokemon.gba", fecha_subida: new Date() },
                    { nombre_mostrar: "The Legend of Zelda: The Minish Cap", nombre_archivo: "BZME", formato: "GBA", url: "https://firebasestorage.googleapis.com/.../zelda.gba", fecha_subida: new Date() },
                    { nombre_mostrar: "Metroid Fusion", nombre_archivo: "BMFE", formato: "GBA", url: "https://firebasestorage.googleapis.com/.../metroid.gba", fecha_subida: new Date() }
                ];
            } else {
                juegosPrueba = [
                    { nombre: "Super Smash Bros. Melee", id: "GALE01", formato: "ISO", url: "https://firebasestorage.googleapis.com/.../smash.iso", fecha_subida: new Date() },
                    { nombre: "The Legend of Zelda: The Wind Waker", id: "GZLE01", formato: "ISO", url: "https://firebasestorage.googleapis.com/.../zelda.iso", fecha_subida: new Date() },
                    { nombre: "Metroid Prime 2: Echoes", id: "G2EE01", formato: "NKIT", url: "https://firebasestorage.googleapis.com/.../metroid2.nkit", fecha_subida: new Date() }
                ];
            }

            try {
                for (const juego of juegosPrueba) {
                    await addDoc(collection(db, obtenerColeccion()), juego);
                }
                await showSuccess();
            } catch (error) {
                console.error("Error inyectando datos de prueba:", error);
            }
        }
    };
}

// 4. SISTEMA JSON
document.getElementById('btn-export-json').onclick = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, obtenerColeccion()));
        const data = querySnapshot.docs.map(doc => doc.data());
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${consolaActual}_${new Date().toISOString().slice(0,10)}.json`;
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
            if (await customConfirm(`DATABASE INJECTION:<br>¿Importar ${juegosParaImportar.length} entradas a ${consolaActual.toUpperCase()}?`)) {
                for (const juego of juegosParaImportar) {
                    await addDoc(collection(db, obtenerColeccion()), {
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

    if (event.shiftKey && ultimoSeleccionadoIdx !== null) {
        const start = Math.min(ultimoSeleccionadoIdx, index);
        const end = Math.max(ultimoSeleccionadoIdx, index);
        
        if (!event.ctrlKey && !event.metaKey) {
            seleccionados.clear();
            items.forEach(el => el.classList.remove("selected-batch"));
        }

        for (let i = start; i <= end; i++) {
            const idRango = todosLosDocs[i].id;
            seleccionados.add(idRango);
            items[i].classList.add("selected-batch");
        }
    } 
    else if (event.ctrlKey || event.metaKey) {
        if (seleccionados.has(id)) {
            seleccionados.delete(id);
            elemento.classList.remove("selected-batch");
        } else {
            seleccionados.add(id);
            elemento.classList.add("selected-batch");
        }
        ultimoSeleccionadoIdx = index;
    } 
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
    if (await customConfirm(`BATCH DELETE:<br>¿Eliminar ${seleccionados.size} juegos de ${consolaActual.toUpperCase()}?`)) {
        const promesas = Array.from(seleccionados).map(id => deleteDoc(doc(db, obtenerColeccion(), id)));
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
        
        if (!editMode) { 
            seleccionados.clear(); 
            ultimoSeleccionadoIdx = null; 
            actualizarBarraBatch(); 
        }
    };
}

// 8. ESCUCHA DB REALTIME (INTEGRACIÓN INDEPENDIENTE)
function iniciarEscuchaDB() {
    if (!listaContainer) return;
    if (unsubscribeDB) unsubscribeDB(); // Detener escucha previa

    const q = query(collection(db, obtenerColeccion()), orderBy("fecha_subida", "desc"));

    unsubscribeDB = onSnapshot(q, (querySnapshot) => {
        listaContainer.innerHTML = "";
        const docsArray = querySnapshot.docs; 
        let index = 0;

        querySnapshot.forEach((documento) => {
            const datos = documento.data();
            const idDoc = documento.id;
            const item = document.createElement("div");
            
            item.className = "db-item";
            item.style.opacity = "0"; 
            item.style.transform = "scale(0.8)";
            item.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            item.style.transitionDelay = `${index * 0.04}s`; 

            if (seleccionados.has(idDoc)) item.classList.add("selected-batch");

            // Mapeos independientes por consola
            const itemID = (consolaActual === "gba") ? (datos.nombre_archivo || idDoc) : (datos.id || idDoc);
            const itemNom = (consolaActual === "gba") ? (datos.nombre_mostrar || "Sin Título") : (datos.nombre || "Sin Título");
            
            // Portadas independientes (GBA usa imágenes rectangulares frontales, GC usa sus CDs)
            const rutaImg = (consolaActual === "gba") 
                ? `Assets/CoversGBA/${itemID}.png` 
                : `Assets/CoversCD//${itemID}.png`;

            const fallbackImg = (consolaActual === "gba")
                ? `https://via.placeholder.com/50x70?text=GBA`
                : `Assets/CoversCD//undefinedcd.png`;

            // Cambiamos la clase de la imagen de 'disco-icon' a 'gba-cover-icon' para quitar la forma de CD
            const claseImagen = (consolaActual === "gba") ? "gba-cover-icon" : "disco-icon";

            item.innerHTML = `
                <button class="delete-btn" data-id="${idDoc}">X</button>
                <img src="${rutaImg}" class="${claseImagen}" onerror="this.src='${fallbackImg}';">
            `;

            item.onclick = (e) => {
                if (e.target.classList.contains("delete-btn")) return;
                if (editMode) {
                    toggleSeleccion(idDoc, item, e, index, docsArray);
                } else {
                    abrirModalDetalle(datos, idDoc, itemID, itemNom);
                }
            };

            item.onmouseenter = () => {
                if (infoText && !seleccionados.size) {
                    infoText.innerHTML = `${itemNom} <span style="color:#00ffff">[${itemID}]</span>`;
                }
            };

            listaContainer.appendChild(item);

            requestAnimationFrame(() => {
                item.style.opacity = "1";
                item.style.transform = "scale(1)";
            });

            index++; 
        });
        vincularBotonesBorrarRapido();
    });
}

// 9. BORRADO RÁPIDO
function vincularBotonesBorrarRapido() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            const itemElement = btn.closest(".db-item");

            if (await customConfirm("FAST DELETE:<br>¿Eliminar entrada ahora?")) {
                itemElement.classList.add("item-exit"); 
                setTimeout(async () => {
                    await deleteDoc(doc(db, obtenerColeccion(), id));
                    await showSuccess();
                }, 300); 
            }
        };
    });
}

// 10. MODAL DETALLE (ARREGLADO PARA PORTADAS GBA)
async function abrirModalDetalle(datos, idDoc, itemID, itemNom) {
    const modal = document.getElementById("modalDetalle");
    const disco = document.getElementById("modalDisco");
    const imgModal = document.getElementById("modalImagen");
    
    if (consolaActual === "gba") {
        // En GBA cargamos la portada frontal de la caja y apagamos el disco
        if (imgModal) imgModal.src = `Assets/CoversGBA/${itemID}.png`;
        if (disco) disco.style.display = "none";
    } else {
        // En GameCube cargamos la portada normal y el CD rotatorio
        if (imgModal) imgModal.src = `Assets/Covers/${itemID}.png`;
        if (disco) {
            disco.style.display = "block";
            disco.src = `Assets/CoversCD//${itemID}.png`;
            disco.classList.add("girando");
        }
    }

    document.getElementById("editNombre").value = itemNom;
    document.getElementById("editID").value = itemID;
    document.getElementById("editFormato").value = datos.formato || "";
    document.getElementById("editURL").value = datos.url || "";
    
    const fecha = datos.fecha_subida?.toDate ? datos.fecha_subida.toDate().toLocaleDateString() : "N/A";
    document.getElementById("modalFecha").innerText = fecha;

    document.getElementById("btnActualizarModal").onclick = async () => {
        if (await customConfirm("¿Guardar cambios?")) {
            const camposActualizados = {
                formato: document.getElementById("editFormato").value,
                url: document.getElementById("editURL").value
            };

            if (consolaActual === "gba") {
                camposActualizados.nombre_mostrar = document.getElementById("editNombre").value;
                camposActualizados.nombre_archivo = document.getElementById("editID").value;
            } else {
                camposActualizados.nombre = document.getElementById("editNombre").value;
                camposActualizados.id = document.getElementById("editID").value;
            }

            await updateDoc(doc(db, obtenerColeccion(), idDoc), camposActualizados);
            modal.style.display = "none";
            if (disco) disco.classList.remove("girando");
            await showSuccess();
        }
    };

    document.getElementById("btnBorrarDesdeModal").onclick = async () => {
        if (await customConfirm(`¿ELIMINAR PERMANENTEMENTE?<br>${itemNom}`)) {
            await deleteDoc(doc(db, obtenerColeccion(), idDoc));
            modal.style.display = "none";
            if (disco) disco.classList.remove("girando");
            await showSuccess();
        }
    };

    document.getElementById("btnCerrarModal").onclick = () => {
        modal.style.display = "none";
        if (disco) disco.classList.remove("girando");
    };
    modal.style.display = "flex";
}

// 11. GUARDAR NUEVO DESDE EL PANEL IZQUIERDO
document.getElementById("btnGuardar").onclick = async () => {
    const inputNom = document.getElementById("nombre").value;
    const inputID = document.getElementById("id_serial").value;
    
    const campos = {
        formato: document.getElementById("formato").value,
        url: document.getElementById("link_descarga").value,
        fecha_subida: new Date()
    };

    if (consolaActual === "gba") {
        campos.nombre_mostrar = inputNom;
        campos.nombre_archivo = inputID;
    } else {
        campos.nombre = inputNom;
        campos.id = inputID;
    }

    if (!campos.url.trim() || !inputNom.trim()) {
        await showWarning(); return;
    }

    await addDoc(collection(db, obtenerColeccion()), campos);
    await showSuccess();
    document.querySelectorAll(".left-panel input").forEach(i => i.value = "");
};

// 12. CERRAR MODAL CLIC FUERA
window.onclick = (e) => {
    const modal = document.getElementById("modalDetalle");
    if (e.target === modal) {
        modal.style.display = "none";
        const disco = document.getElementById("modalDisco");
        if (disco) disco.classList.remove("girando");
    }
};

// --- INICIAR PRIMERA CARGA ---
iniciarEscuchaDB();