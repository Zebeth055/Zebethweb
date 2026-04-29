const productos = [
{ 
        nombre: "Metroid Prime", 
        id: "GM8E01", 
        idCompleta: "DOL-P-GMSE",
        formato: "RVZ (1.35 GiB)", 
        compresion: "Zstandard",
        url: "metroid.html" 
    },
    { 
        nombre: "Zelda: Wind Waker", 
        id: "GZLE01", 
        idCompleta: "DOL-P-GZLE",
        url: "zelda.html" 
    },
    { 
        nombre: "Luigi's Mansion", 
        id: "GLME01", 
        idCompleta: "DOL-P-GLME",
        url: "luigi.html"
    },
    { 
        nombre: "F-Zero GX", 
        id: "GFZE01", 
        idCompleta: "DOL-P-GFZE",
        url: "fzero.html"
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