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
        nombre: "Eternal Darkness", 
        id: "GEDE01", 
        idCompleta: "DOL-P-GEDE",
        formato: "RVZ (1.25 GiB)", 
        compresion: "Zstandard",
        descripcion: "Un thriller psicológico que atraviesa siglos de historia y pone a prueba tu cordura.",
        url: "eternaldarkness.html" 
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
        nombre: "Mario Kart: Double Dash!!", 
        id: "GM4E01", 
        idCompleta: "DOL-P-GM4E",
        formato: "RVZ (377.96 MiB)", 
        compresion: "Zstandard",
        descripcion: "Dos corredores por coche significan el doble de caos en las pistas más locas del Reino Champiñón.",
        url: "mariokart.html" 
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
        nombre: "Super Mario Sunshine", 
        id: "GMSE01", 
        idCompleta: "DOL-P-GMSE",
        formato: "RVZ (1002.15 MiB)", 
        compresion: "Zstandard",
        descripcion: "Usa el A.C.U.A.C. para limpiar la Isla Delfino y rescatar a la Princesa Peach.",
        url: "mariosunshine.html" 
    },
    { 
        nombre: "The Legend of Zelda: Twilight Princess", 
        id: "GZLE01", 
        idCompleta: "DOL-P-GZLE",
        formato: "RVZ (886.83 MiB)", 
        compresion: "Zstandard",
        descripcion: "Link debe salvar Hyrule de la invasión del Reino Crepuscular transformándose en lobo.",
        url: "twilightprincess.html" 
    },
    { 
        nombre: "Viewtiful Joe", 
        id: "GVCE01", 
        idCompleta: "DOL-P-GVCE",
        formato: "RVZ (893.60 MiB)", 
        compresion: "Zstandard",
        descripcion: "Acción estilizada en 2.5D donde usas poderes de efectos de película para derrotar enemigos.",
        url: "viewtifuljoe.html" 
    },
    { 
        nombre: "Wario World", 
        id: "GWWE01", 
        idCompleta: "DOL-P-GWWE",
        formato: "RVZ (188.69 MiB)", 
        compresion: "Zstandard",
        descripcion: "Wario reparte puñetazos y busca tesoros en un mundo lleno de plataformas y acción.",
        url: "warioworld.html" 
    },
    { 
        nombre: "Wave Race: Blue Storm", 
        id: "GWRE01", 
        idCompleta: "DOL-P-GWRE",
        formato: "RVZ (1.02 GiB)", 
        compresion: "Zstandard",
        descripcion: "Carreras de motos de agua con físicas de olas realistas y clima dinámico.",
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
    const query = e.target.value.toLowerCase();
    
    // Seleccionamos el wrapper, que es el que ocupa el espacio en el grid
    document.querySelectorAll('.tarjeta-wrapper').forEach(wrapper => {
        const nombre = wrapper.querySelector('.tarjeta-info').innerText.toLowerCase();
        
        if (nombre.includes(query)) {
            // "flex" o "block" permite que el grid lo cuente
            wrapper.style.display = "block"; 
        } else {
            // "none" lo quita totalmente del diseño y los demás se mueven
            wrapper.style.display = "none"; 
        }
    });
});

inicializarGrid();