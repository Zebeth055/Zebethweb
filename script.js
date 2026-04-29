const productos = [
    { 
        nombre: "Animal Crossing", 
        id: "GAFE01", 
        idCompleta: "DOL-P-GAFE",
        formato: "RVZ (18.56 MiB)", 
        compresion: "Zstandard",
        descripcion: "Vive una vida tranquila en un pueblo lleno de animales, donde el tiempo pasa como en la vida real.",
        url: "animalcrossing.html" 
    },
    { 
        nombre: "Baten Kaitos: Eternal Wings and the Lost Ocean", 
        id: "GKBEAF", 
        idCompleta: "DOL-P-GKBE",
        formato: "RVZ (1.27 GiB)", 
        compresion: "Zstandard",
        descripcion: "Un RPG único basado en cartas donde exploras islas flotantes en un mundo sin océanos.",
        url: "batenkaitos.html" 
    },
    { 
        nombre: "Baten Kaitos Origins", 
        id: "GK4E01", 
        idCompleta: "DOL-P-GK7E",
        formato: "RVZ (1.28 GiB)", 
        compresion: "Zstandard",
        descripcion: "La precuela de las Alas Eternas que profundiza en el sistema de combate y el origen del imperio.",
        url: "bkorigins.html" 
    },
    { 
        nombre: "Chibi-Robo!", 
        id: "GGTE01", 
        idCompleta: "DOL-P-GGTE",
        formato: "RVZ (324.93 MiB)", 
        compresion: "Zstandard",
        descripcion: "Controla a un pequeño robot para limpiar la casa de los Sanderson y hacer a todos felices.",
        url: "chibirobo.html" 
    },
    { 
        nombre: "Donkey Kong: Jungle Beat", 
        id: "GYBE01", 
        idCompleta: "DOL-P-GYBE",
        formato: "RVZ (550.33 MiB)", 
        compresion: "Zstandard",
        descripcion: "Usa los bongós para guiar a Donkey Kong a través de frenéticas plataformas y combates.",
        url: "dkjungle.html" 
    },
    { 
        nombre: "Donkey Konga", 
        id: "GKGE01", 
        idCompleta: "DOL-P-GKNE",
        formato: "RVZ (241.79 MiB)", 
        compresion: "Zstandard",
        descripcion: "Sigue el ritmo de la música usando los DK Bongos en este divertido juego de percusión.",
        url: "donkeykonga.html" 
    },
    { 
        nombre: "Eternal Darkness", 
        id: "GEDE01", 
        idCompleta: "DOL-P-GEDE",
        formato: "RVZ (1.25 GiB)", 
        compresion: "Zstandard",
        descripcion: "Un thriller psicológico que atraviesa siglos de historia y pone a prueba tu cordura.",
        url: "eternaldarkness.html" 
    },
    { 
        nombre: "F-Zero GX", 
        id: "GFZE01", 
        idCompleta: "DOL-P-GFZE",
        formato: "RVZ (1.20 GiB)", 
        compresion: "Zstandard",
        descripcion: "Las carreras más rápidas y peligrosas de la galaxia a bordo de naves a velocidades extremas.",
        url: "fzerogx.html" 
    },
    { 
        nombre: "Fire Emblem: Path of Radiance", 
        id: "GFEE01", 
        idCompleta: "DOL-P-GFEE",
        formato: "RVZ (1.03 GiB)", 
        compresion: "Zstandard",
        descripcion: "Estrategia táctica profunda en un continente al borde de la guerra entre humanos y laguz.",
        url: "fireemblem.html" 
    },
    { 
        nombre: "Killer7", 
        id: "GK7E08", // Corregido para NTSC
        idCompleta: "DOL-P-GK7E",
        formato: "RVZ (903.82 MiB)", 
        compresion: "Zstandard",
        descripcion: "Toma el control de siete asesinos con habilidades únicas en esta surrealista historia de venganza.",
        url: "killer7.html" 
    },
    { 
        nombre: "Lara Croft Tomb Raider: Legend", 
        id: "GL8E4F", 
        idCompleta: "DOL-P-GLRE",
        formato: "RVZ (1.16 GiB)", 
        compresion: "Zstandard",
        descripcion: "Acompaña a Lara en una búsqueda global para recuperar un artefacto antiguo de su pasado.",
        url: "tombraider.html" 
    },
    { 
        nombre: "LEGO Star Wars", 
        id: "GL5E4F", 
        idCompleta: "DOL-P-G2LE",
        formato: "RVZ (559.90 MiB)", 
        compresion: "Zstandard",
        descripcion: "Revive la trilogía de las precuelas de Star Wars con el humor y la jugabilidad clásica de LEGO.",
        url: "legostarwars.html" 
    },
    { 
        nombre: "Luigi's Mansion", 
        id: "GLME01", 
        idCompleta: "DOL-P-GLME",
        formato: "RVZ (150.28 MiB)", 
        compresion: "Zstandard",
        descripcion: "Luigi debe rescatar a Mario de una mansión encantada usando su aspiradora de fantasmas.",
        url: "luigismansion.html" 
    },
    { 
        nombre: "Mario Kart: Double Dash!!", 
        id: "GM4E01", 
        idCompleta: "DOL-P-GM4E",
        formato: "RVZ (377.96 MiB)", 
        compresion: "Zstandard",
        descripcion: "Dos corredores por coche significan el doble de caos en las pistas más locas del Reino Champiñón.",
        url: "mariokart.html" 
    },
    { 
        nombre: "Mario Party 4", 
        id: "GMPE01", 
        idCompleta: "DOL-P-GMPE",
        formato: "RVZ (448.58 MiB)", 
        compresion: "Zstandard",
        descripcion: "La fiesta continúa con nuevos tableros, minijuegos y la clásica competitividad de Mario Party.",
        url: "marioparty4.html" 
    },
    { 
        nombre: "Mario Party 5", 
        id: "GP5E01", 
        idCompleta: "DOL-P-GP5E",
        formato: "RVZ (860.49 MiB)", 
        compresion: "Zstandard",
        descripcion: "Explora el mundo de los sueños con nuevos modos de juego y el sistema de cápsulas.",
        url: "marioparty5.html" 
    },
    { 
        nombre: "Mario Party 6", 
        id: "GP6E01", 
        idCompleta: "DOL-P-GP6E",
        formato: "RVZ (629.29 MiB)", 
        compresion: "Zstandard",
        descripcion: "Introduce la mecánica del día y la noche, cambiando los tableros y las reglas según la hora.",
        url: "marioparty6.html" 
    },
    { 
        nombre: "Mario Power Tennis", 
        id: "GOME01", 
        idCompleta: "DOL-P-GOME",
        formato: "RVZ (556.35 MiB)", 
        compresion: "Zstandard",
        descripcion: "Tenis arcade frenético con golpes especiales y pistas temáticas del universo de Mario.",
        url: "mariotennis.html" 
    },
    { 
        nombre: "Metroid Prime", 
        id: "GM8E01", 
        idCompleta: "DOL-P-GM8E",
        formato: "RVZ (1.08 GiB)", 
        compresion: "Zstandard",
        descripcion: "La primera aventura en 3D de Samus Aran en el peligroso y misterioso planeta Tallon IV.",
        url: "metroidprime.html" 
    },
    { 
        nombre: "Mortal Kombat: Deadly Alliance", 
        id: "GMKE5D",
        idCompleta: "DOL-P-GMKE",
        formato: "RVZ (1.10 GiB)", 
        compresion: "Zstandard",
        descripcion: "Una alianza mortal entre Shang Tsung y Quan Chi amenaza con destruir los reinos.",
        url: "mortalkombat.html" 
    },
    { 
        nombre: "P.N.03", 
        id: "GPNE08", 
        idCompleta: "DOL-P-GPNE",
        formato: "RVZ (638.05 MiB)", 
        compresion: "Zstandard",
        descripcion: "Vanessa Z. Schneider debe detener una amenaza robótica con movimientos rítmicos y acrobacias.",
        url: "pn03.html" 
    },
    { 
        nombre: "Paper Mario: The Thousand-Year Door", 
        id: "G8ME01", 
        idCompleta: "DOL-P-G8ME",
        formato: "RVZ (315.18 MiB)", 
        compresion: "Zstandard",
        descripcion: "Mario se embarca en una aventura de papel para abrir la legendaria Puerta Milenaria.",
        url: "papermario.html" 
    },
    { 
        nombre: "Pikmin", 
        id: "GPIE01", 
        idCompleta: "DOL-P-GPIE",
        formato: "RVZ (529.50 MiB)", 
        compresion: "Zstandard",
        descripcion: "El Capitán Olimar debe reconstruir su nave en 30 días con la ayuda de pequeñas criaturas.",
        url: "pikmin.html" 
    },
    { 
        nombre: "Pikmin 2", 
        id: "GPVE01", 
        idCompleta: "DOL-P-GPVE",
        formato: "RVZ (868.67 MiB)", 
        compresion: "Zstandard",
        descripcion: "Olimar regresa con su asistente Louie para recolectar tesoros con la ayuda de nuevos tipos de Pikmin.",
        url: "pikmin2.html" 
    },
    { 
        nombre: "Resident Evil 2", 
        id: "GHAE08", 
        idCompleta: "DOL-P-GHAE",
        formato: "RVZ (1.07 GiB)", 
        compresion: "Zstandard",
        descripcion: "Leon y Claire intentan sobrevivir al brote del virus T en Raccoon City.",
        url: "re2.html" 
    },
    { 
        nombre: "Resident Evil 3: Nemesis", 
        id: "GLEE08", 
        idCompleta: "DOL-P-GLEE",
        formato: "RVZ (756.43 MiB)", 
        compresion: "Zstandard",
        descripcion: "Jill Valentine intenta escapar de la ciudad mientras es perseguida por el implacable Nemesis.",
        url: "re3.html" 
    },
    { 
        nombre: "Resident Evil Code: Veronica X", 
        id: "GCDE08", // Corregido
        idCompleta: "DOL-P-GCDE",
        formato: "RVZ (833.89 MiB)", 
        compresion: "Zstandard",
        descripcion: "Claire Redfield busca a su hermano Chris en una isla remota propiedad de Umbrella.",
        url: "codeveronica.html" 
    },
    { 
        nombre: "Resident Evil Zero", 
        id: "GBZE08", 
        idCompleta: "DOL-P-GZ2E",
        formato: "RVZ (1.16 GiB)", 
        compresion: "Zstandard",
        descripcion: "Descubre los eventos previos al incidente de la mansión con Rebecca Chambers y Billy Coen.",
        url: "rezero.html" 
    },
    { 
        nombre: "SoulCalibur II", 
        id: "GRSEAF", 
        idCompleta: "DOL-P-GS8E",
        formato: "RVZ (744.01 MiB)", 
        compresion: "Zstandard",
        descripcion: "El juego de lucha con armas por excelencia, con Link como invitado especial.",
        url: "soulcalibur2.html" 
    },
    { 
        nombre: "Star Fox Adventures", 
        id: "GSAE01", 
        idCompleta: "DOL-P-GSRE",
        formato: "RVZ (504.91 MiB)", 
        compresion: "Zstandard",
        descripcion: "Fox McCloud explora Dinosaur Planet en una aventura épica a pie y en Arwing.",
        url: "starfoxadv.html" 
    },
    { 
        nombre: "Star Fox: Assault", 
        id: "GF7E01", 
        idCompleta: "DOL-P-GSAE",
        formato: "RVZ (1.02 GiB)", 
        compresion: "Zstandard",
        descripcion: "El equipo Star Fox se reúne para detener la amenaza de los Aparoides en aire y tierra.",
        url: "starfoxassault.html" 
    },
    { 
        nombre: "Star Wars Jedi Knight II", 
        id: "GJKE52", 
        idCompleta: "DOL-P-GJOE",
        formato: "RVZ (1.09 GiB)", 
        compresion: "Zstandard",
        descripcion: "Kyle Katarn debe recuperar su conexión con la Fuerza.",
        url: "jedioutcast.html" 
    },
    { 
        nombre: "Star Wars Rogue Squadron II", 
        id: "GSWE64", 
        idCompleta: "DOL-P-GSWE",
        formato: "RVZ (1.22 GiB)", 
        compresion: "Zstandard",
        descripcion: "Pilota las naves más icónicas de la Alianza Rebelde.",
        url: "rogueleader.html" 
    },
    { 
        nombre: "Star Wars Rogue Squadron III", 
        id: "GLRE64", 
        idCompleta: "DOL-P-GLRE",
        formato: "RVZ (1.21 GiB)", 
        compresion: "Zstandard",
        descripcion: "Continúa la lucha contra el Imperio.",
        url: "rebelstrike.html" 
    },
    { 
        nombre: "Star Wars: Bounty Hunter", 
        id: "GBWE64", 
        idCompleta: "DOL-P-GBHE",
        formato: "RVZ (1.14 GiB)", 
        compresion: "Zstandard",
        descripcion: "Caza a los forajidos controlando a Jango Fett.",
        url: "bountyhunter.html" 
    },
    { 
        nombre: "Super Mario Strikers", 
        id: "G4QE01", 
        idCompleta: "DOL-P-G4ME",
        formato: "RVZ (406.79 MiB)", 
        compresion: "Zstandard",
        descripcion: "Fútbol agresivo y sin reglas con los personajes de Mario.",
        url: "mariostrikers.html" 
    },
    { 
        nombre: "Super Mario Sunshine", 
        id: "GMSE01", 
        idCompleta: "DOL-P-GMSE",
        formato: "RVZ (1002.15 MiB)", 
        compresion: "Zstandard",
        descripcion: "Limpia la Isla Delfino y rescata a la Princesa Peach.",
        url: "mariosunshine.html" 
    },
    { 
        nombre: "Super Monkey Ball", 
        id: "GMBE8P", 
        idCompleta: "DOL-P-GMBE",
        formato: "RVZ (276.76 MiB)", 
        compresion: "Zstandard",
        descripcion: "Guía a los monos en burbujas a través de laberintos.",
        url: "monkeyball.html" 
    },
    { 
        nombre: "Super Monkey Ball 2", 
        id: "GM2E8P", 
        idCompleta: "DOL-P-GM2E",
        formato: "RVZ (616.72 MiB)", 
        compresion: "Zstandard",
        descripcion: "Más niveles y más minijuegos adictivos.",
        url: "monkeyball2.html" 
    },
    { 
        nombre: "Zelda: Collector's Edition", 
        id: "PZLE01", 
        idCompleta: "DOL-P-PZLE",
        formato: "RVZ (887.16 MiB)", 
        compresion: "Zstandard",
        descripcion: "Incluye los clásicos de NES y Nintendo 64.",
        url: "zeldacollector.html" 
    },
    { 
        nombre: "Zelda: Four Swords Adventures", 
        id: "G4SE01", 
        idCompleta: "DOL-P-G4SE",
        formato: "RVZ (224.67 MiB)", 
        compresion: "Zstandard",
        descripcion: "Aventura multijugador para salvar Hyrule.",
        url: "fourswords.html" 
    },
    { 
        nombre: "Zelda: Ocarina / Master Quest", 
        id: "D43E01", 
        idCompleta: "DOL-P-D43E",
        formato: "RVZ (883.22 MiB)", 
        compresion: "Zstandard",
        descripcion: "El clásico de N64 con mazmorras rediseñadas.",
        url: "ocarina.html" 
    },
    { 
        nombre: "Zelda: The Wind Waker", 
        id: "GZLE01", 
        idCompleta: "DOL-P-GZLE",
        formato: "RVZ (823.38 MiB)", 
        compresion: "Zstandard",
        descripcion: "Link surca el Gran Mar en una aventura cel-shaded.",
        url: "windwaker.html" 
    },
    { 
        nombre: "Zelda: Twilight Princess", 
        id: "GZ2E01", 
        idCompleta: "DOL-P-GZPE",
        formato: "RVZ (886.83 MiB)", 
        compresion: "Zstandard",
        descripcion: "Salva a Hyrule del Reino Crepuscular.",
        url: "twilightprincess.html" 
    },
    { 
        nombre: "Viewtiful Joe", 
        id: "GVCE08", 
        idCompleta: "DOL-P-GVCE",
        formato: "RVZ (893.60 MiB)", 
        compresion: "Zstandard",
        descripcion: "Acción estilizada en un mundo de película.",
        url: "viewtifuljoe.html" 
    },
    { 
        nombre: "Viewtiful Joe 2", 
        id: "G2VE08", 
        idCompleta: "DOL-P-G2VE",
        formato: "RVZ (639.89 MiB)", 
        compresion: "Zstandard",
        descripcion: "Joe y Silvia luchan contra la organización Gedow.",
        url: "viewtifuljoe2.html" 
    },
    { 
        nombre: "Wario World", 
        id: "GWWE01", 
        idCompleta: "DOL-P-GWWE",
        formato: "RVZ (188.69 MiB)", 
        compresion: "Zstandard",
        descripcion: "Wario busca tesoros en un mundo de plataformas.",
        url: "warioworld.html" 
    },
    { 
        nombre: "WarioWare: Mega Party Game$!", 
        id: "GZWE01", 
        idCompleta: "DOL-P-GZWE",
        formato: "RVZ (638.56 MiB)", 
        compresion: "Zstandard",
        descripcion: "Microjuegos frenéticos para poner a prueba tus reflejos.",
        url: "warioware.html" 
    },
    { 
        nombre: "Wave Race: Blue Storm", 
        id: "GWRE01", 
        idCompleta: "DOL-P-GWRE",
        formato: "RVZ (1.02 GiB)", 
        compresion: "Zstandard",
        descripcion: "Carreras de motos de agua con físicas realistas.",
        url: "waverace.html" 
    }
];
const rutaLocalPortadas = "./portadas/";
const rutaLocalDiscos = "./portadas discos/"; 

const container = document.getElementById('grid-container');
const modal = document.getElementById('modalDetalle');
const buscador = document.getElementById('inputBuscador');
const imgDisco = document.getElementById('modalDisco');

let stopTimeoutHandle = null;

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

function inicializarGrid() {
    container.innerHTML = "";
    productos.forEach(p => {
        // Creamos el envoltorio
        const wrapper = document.createElement('div');
        wrapper.className = 'tarjeta-wrapper';
        
        // La tarjeta va dentro del envoltorio
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

function abrirModal(item) {
    document.getElementById('modalTitulo').innerText = item.nombre;
    document.getElementById('modalID').innerText = item.idCompleta;
    document.getElementById('modalImagen').src = `${rutaLocalPortadas}${item.id}.png`;
    document.getElementById('modalFormato').innerText = item.formato;
    document.getElementById('modalCompresion').innerText = item.compresion;

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
    btnA.onclick = () => window.location.href = item.url;
    modal.style.display = "flex";
}

function cerrarModal() {
    if (stopTimeoutHandle) clearTimeout(stopTimeoutHandle);
    imgDisco.classList.remove('girando');
    imgDisco.style.transition = 'none';
    modal.style.display = "none";
}

buscador.addEventListener('input', (e) => {
    // Función interna para limpiar texto (quita acentos y puntuación)
    const limpiarTexto = (texto) => {
        return texto
            .toLowerCase()
            .normalize("NFD") // Descompone caracteres (ej: 'ñ' -> 'n' + '~')
            .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
            .replace(/[^\w\s]/gi, ""); // Elimina todo lo que no sea letra, número o espacio
    };

    const query = limpiarTexto(e.target.value);
    
    document.querySelectorAll('.tarjeta-wrapper').forEach(wrapper => {
        const nombreOriginal = wrapper.querySelector('.tarjeta-info').innerText;
        const nombreLimpio = limpiarTexto(nombreOriginal);
        
        if (nombreLimpio.includes(query)) {
            wrapper.style.display = "block"; 
        } else {
            wrapper.style.display = "none"; 
        }
    });
});

const selectOrden = document.getElementById('selectOrden');

// Función para extraer el valor numérico del peso para comparar
function obtenerPesoNumerico(formatoStr) {
    // Extrae el número. Si es GiB lo multiplica por 1024 para normalizar a MiB
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

    // Re-renderizar el grid con el nuevo orden
    inicializarGrid();
    
    // Si había algo escrito en el buscador, aplicar el filtro inmediatamente
    buscador.dispatchEvent(new Event('input'));
}

selectOrden.addEventListener('change', ordenarProductos);

inicializarGrid();