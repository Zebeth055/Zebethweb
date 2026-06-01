document.addEventListener("DOMContentLoaded", () => {
    const romInput = document.getElementById("rom-upload");
    const statusText = document.getElementById("emu-status");
    const controlsDiv = document.querySelector(".gba-controls");
    const wrapper = document.querySelector(".gba-emulator-wrapper");

    // 1. Crear botón de CERRAR/RESET
    const resetBtn = document.createElement("button");
    resetBtn.className = "btn-gc btn-gc-b";
    resetBtn.innerHTML = "<span>(X)</span> CERRAR";
    resetBtn.style.display = "none";
    controlsDiv.appendChild(resetBtn);

    // 2. Crear botón para AGRANDAR la ventanita
    const sizeBtn = document.createElement("button");
    sizeBtn.className = "btn-gc btn-gc-a";
    sizeBtn.innerHTML = "<span>(Z)</span> AGRANDAR";
    sizeBtn.style.display = "none";
    controlsDiv.appendChild(sizeBtn);

    // 3. Manejador de carga de ROM
    romInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        statusText.innerText = "SINTONIZANDO MOTOR...";

        // Configuración de EmulatorJS
        window.EJS_player = '#gba-canvas-container';
        window.EJS_core = 'gba';
        window.EJS_gameUrl = URL.createObjectURL(file);
        window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
        window.EJS_startOnLoaded = true;
        window.EJS_fullscreen = true; 
        window.EJS_color = '#00ff5d';

        // Inyección del motor
        const script = document.createElement('script');
        script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
        
        script.onload = () => {
            // Ocultar elementos de carga original
            statusText.style.display = 'none';
            const romInputLabel = document.querySelector("label[for='rom-upload']");
            if(romInputLabel) romInputLabel.style.display = 'none';
            romInput.style.display = 'none';

            // Ocultar botón de PAUSA (si existía)
            const pauseBtn = document.getElementById("btn-pause");
            if(pauseBtn) pauseBtn.style.display = 'none';

            // Mostrar botones personalizados
            controlsDiv.style.display = 'flex'; 
            resetBtn.style.display = 'flex';
            sizeBtn.style.display = 'flex';
        };

        document.body.appendChild(script);
    });

    // Eventos de los botones
    resetBtn.addEventListener("click", () => {
        window.location.reload(); 
    });

    sizeBtn.addEventListener("click", () => {
        wrapper.classList.toggle("large-size");
        if (wrapper.classList.contains("large-size")) {
            sizeBtn.innerHTML = "<span>(Z)</span> ENCOGER";
        } else {
            sizeBtn.innerHTML = "<span>(Z)</span> AGRANDAR";
        }
    });
});