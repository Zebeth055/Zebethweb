// secret/script.js
(function() {
    // --- 1. ESTILOS CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        .ee-object {
            position: fixed;
            z-index: 10001;
            pointer-events: auto;
            cursor: grab;
            width: 64px;
            height: 72px;
            background-image: url('./Assets/secret/objects.png');
            background-repeat: no-repeat;
            background-size: 704px 72px;
            image-rendering: pixelated;
            filter: drop-shadow(0 10px 10px rgba(0,0,0,0.8));
            transition: top 0.1s linear; 
        }
        .ee-object:active { cursor: grabbing; }
        
        .pikmin-entity {
            position: fixed;
            z-index: 10000;
            width: 28px;
            height: 80px;
            background-repeat: no-repeat;
            background-size: 56px 40px;
            background-position: 0px 0px;
            image-rendering: pixelated;
            transition: left 0.5s ease-out, transform 0.2s ease-in-out, opacity 0.3s ease;
            pointer-events: none;
            user-select: none;
        }

        .pikmin-running { animation: pikminRunLoop 0.3s steps(2) infinite; }

        @keyframes pikminRunLoop {
            from { background-position: 0px 0px; }
            to { background-position: -56px 0px; } 
        }
    `;
    document.head.appendChild(style);

    // --- 2. CONFIGURACIÓN Y VARIABLES ---
    const PIKMIN_TYPES = [
        { img: './Assets/secret/pikmin.png', colorGlow: "#ff3333" },
        { img: './Assets/secret/pikmin2.png', colorGlow: "#3366ff" },
        { img: './Assets/secret/pikmin3.png', colorGlow: "#ffcc00" }
    ];

    let eeBuffer = "";
    let audioContextUnlocked = false;

    // --- 3. GESTIÓN DE AUDIO ---
    const unlockAudio = () => {
        if (audioContextUnlocked) return;
        const silentAudio = new Audio();
        silentAudio.play().then(() => {
            audioContextUnlocked = true;
            window.removeEventListener("click", unlockAudio);
            window.removeEventListener("keydown", unlockAudio);
        });
    };
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    const playSound = (path, volume = 0.4) => {
        // Nota: Asegúrate que los nombres de archivos coincidan (mayúsculas/espacios)
        const audio = new Audio(`./Assets/sounds/secret/${path}`);
        audio.volume = volume;
        audio.play().catch(() => console.log("Audio esperando interacción del usuario."));
    };

    // --- 4. DETECTOR DE TECLADO ---
    window.addEventListener("keydown", (e) => {
        eeBuffer += e.key.toLowerCase();
        if (eeBuffer.includes("pik")) {
            playSound('Whistle.wav', 0.5); 
            triggerPikminEvent();
            eeBuffer = "";
        }
        if (eeBuffer.length > 10) eeBuffer = eeBuffer.substring(1);
    });

    // --- 5. EVENTO PRINCIPAL (CAÍDA Y ARRASTRE) ---
    function triggerPikminEvent() {
        const obj = document.createElement('div');
        obj.className = 'ee-object';
        const index = Math.floor(Math.random() * 11);
        obj.style.backgroundPosition = `-${index * 64}px 0px`;
        
        const startX = Math.random() * 80 + 10;
        obj.style.left = startX + "vw";
        obj.style.top = "-70px"; 
        document.body.appendChild(obj);
       
        let pos = -70;
        const ground = window.innerHeight * (Math.random() * 0.45 + 0.40);
        let isDragging = false;
        let currentPikmins = [];

        // Lógica de arrastre
        obj.addEventListener('mousedown', () => {
            isDragging = true;
            obj.dataset.isDragging = "true";
            obj.style.transition = "none";
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const newX = e.clientX - 32;
            obj.style.left = newX + "px";
            obj.style.top = (e.clientY - 36) + "px";
            pos = e.clientY - 36; // Actualizar posición para la caída

            currentPikmins.forEach((p, i) => {
                const offset = (i * 12) - (currentPikmins.length * 6);
                p.style.left = (e.clientX + offset) + "px";
                p.classList.add('pikmin-running');
                if (e.movementX > 0) { p.dataset.facing = 'right'; p.style.transform = ''; }
                else if (e.movementX < 0) { p.dataset.facing = 'left'; p.style.transform = 'scaleX(-1)'; }
            });
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            obj.dataset.isDragging = "false";
            obj.style.transition = "top 0.8s ease-in, left 5s linear";
        });

        const fallInterval = setInterval(() => {
            if (isDragging) return;
            pos += 8;
            obj.style.top = pos + "px";
            obj.style.transform = `rotate(${pos * 1.5}deg)`;

            if (pos >= ground) {
                clearInterval(fallInterval);
                obj.style.top = ground + "px";
                obj.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
                currentPikmins = spawnPikmin(obj, ground);
            }
        }, 16); 
    }

    // --- 6. LEGIÓN DE PIKMIN ---
    function spawnPikmin(targetObj, groundLevel) {
        const pikminCount = Math.floor(Math.random() * 5) + 3;
        const pikmins = [];
        const targetRect = targetObj.getBoundingClientRect();
        const targetX_centered = targetRect.left + (targetRect.width / 2);

        for (let i = 0; i < pikminCount; i++) {
            const p = document.createElement('div');
            const type = PIKMIN_TYPES[Math.floor(Math.random() * PIKMIN_TYPES.length)];
            p.className = 'pikmin-entity pikmin-running';
            p.style.backgroundImage = `url('${type.img}')`;
            p.style.filter = `drop-shadow(0 0 5px ${type.colorGlow})`;
            p.style.top = (groundLevel + 20) + "px";
            
            const spawnSide = Math.random() > 0.5 ? -100 : window.innerWidth + 100;
            p.style.left = spawnSide + "px";
            p.style.opacity = "0"; 
            p.dataset.facing = spawnSide < 0 ? 'right' : 'left';
            if (p.dataset.facing === 'left') p.style.transform = 'scaleX(-1)';
            
            document.body.appendChild(p);
            pikmins.push(p);

            setTimeout(() => {
                p.style.opacity = "1";
                const r = Math.floor(Math.random() * 9) + 1;
                playSound(`pikmin/Greeting ${r}.wav`, 0.2);

                const jX = (Math.random() * 30 - 15);
                const jY = (Math.random() * 10 - 5);
                const finalX = targetX_centered + (i * 10) - (pikminCount * 5) + jX;
                
                moverConTorpeza(p, finalX);
                
                setTimeout(() => {
                    if (targetObj.dataset.isDragging !== "true") {
                        p.style.top = (groundLevel + 20 + jY) + "px";
                        p.classList.remove('pikmin-running'); 
                        p.style.transform = p.dataset.facing === 'left' ? 'scaleX(-1)' : '';
                    }
                }, 1500);
            }, 50 + (i * 120));
        }

        // Lógica de retiro del objeto
        setTimeout(() => {
            const intentarSalida = () => {
                if (targetObj.dataset.isDragging === "true") {
                    setTimeout(intentarSalida, 1000);
                    return;
                }
                playSound('pikmin/Grab Item.wav', 0.5);
                targetObj.style.transition = "top 0.8s ease-in-out, left 5s linear";
                targetObj.style.top = (groundLevel - 20) + "px";

                setTimeout(() => {
                    const irADerecha = Math.random() > 0.5;
                    const exitX = irADerecha ? window.innerWidth + 250 : -250;
                    playSound('pikmin/Carrying.wav', 0.4);
                    targetObj.style.left = exitX + "px";

                    pikmins.forEach((p, i) => {
                        p.dataset.facing = irADerecha ? 'right' : 'left';
                        p.style.transform = irADerecha ? '' : 'scaleX(-1)';
                        p.classList.add('pikmin-running'); 
                        p.style.transition = "left 5s linear, transform 0.2s ease-in-out";
                        p.style.left = (exitX + (i * 10) - (pikminCount * 5)) + "px";
                        setTimeout(() => p.remove(), 5500);
                    });
                    setTimeout(() => targetObj.remove(), 5500);
                }, 1200);
            };
            intentarSalida();
        }, 4000);

        return pikmins;
    }

    function moverConTorpeza(entidad, destinoX) {
        const xActual = parseFloat(entidad.style.left) || 0;
        if (Math.random() < 0.07) {
            const puntoChoque = xActual + (destinoX - xActual) * 0.6;
            entidad.style.left = puntoChoque + "px";
            setTimeout(() => {
                const flip = entidad.dataset.facing === 'left' ? 'scaleX(-1)' : '';
                entidad.style.transform = `${flip} rotate(-90deg) translateY(10px)`;
                setTimeout(() => {
                    entidad.style.transform = flip;
                    entidad.style.left = destinoX + "px";
                }, 800);
            }, 300);
        } else {
            entidad.style.left = destinoX + "px";
        }
    }
})();