// secret/script.js
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .ee-object {
            position: fixed;
            z-index: 10001;
            pointer-events: none;
            width: 64px;
            height: 72px;
            background-image: url('Assets/secret/objects.png');
            background-repeat: no-repeat;
            background-size: 704px 72px;
            image-rendering: pixelated;
            filter: drop-shadow(0 10px 10px rgba(0,0,0,0.8));
            transition: left 5s linear; 
        }
        
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

        .pikmin-running {
            animation: pikminRunLoop 0.3s steps(2) infinite;
        }

        @keyframes pikminRunLoop {
            from { background-position: 0px 0px; }
            to { background-position: -56px 0px; } 
        }
    `;
    document.head.appendChild(style);

    const PIKMIN_TYPES = [
        { img: 'Assets/secret/pikmin.png', colorGlow: "#ff3333" },  // Rojo
        { img: 'Assets/secret/pikmin2.png', colorGlow: "#3366ff" }, // Azul
        { img: 'Assets/secret/pikmin3.png', colorGlow: "#ffcc00" }  // Amarillo
    ];
    
    const playSound = (path, volume = 0.4) => {
        const audio = new Audio(`sounds/secret/${path}`);
        audio.volume = volume;
        audio.play().catch(e => console.log("Audio play blocked"));
    };

    let eeBuffer = "";
    
    window.addEventListener("keydown", (e) => {
        eeBuffer += e.key.toLowerCase();
        if (eeBuffer.includes("pik")) {
            playSound('Whistle.wav', 0.5); 
            triggerPikminEvent();
            eeBuffer = "";
        }
        if (eeBuffer.length > 10) eeBuffer = eeBuffer.substring(1);
    });

    function triggerPikminEvent() {
        const obj = document.createElement('div');
        obj.className = 'ee-object';
        const totalObjetos = 11;
        const index = Math.floor(Math.random() * totalObjetos);
        const posX = index * 64;
        obj.style.backgroundPosition = `-${posX}px 0px`;
        
        const startX = Math.random() * 80 + 10;
        obj.style.left = startX + "vw";
        obj.style.top = "-70px"; 
        document.body.appendChild(obj);
       
        let pos = -70;
        const groundPercentage = Math.random() * (0.85 - 0.40) + 0.40;
        const ground = window.innerHeight * groundPercentage;
        
        const fallInterval = setInterval(() => {
            pos += 8;
            obj.style.top = pos + "px";
            obj.style.transform = `rotate(${pos * 1.5}deg)`;

            if (pos >= ground) {
                clearInterval(fallInterval);
                obj.style.top = ground + "px";
                obj.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
                spawnPikmin(obj, ground);
            }
        }, 16); 
    }

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
            p.style.filter = `drop-shadow(0 0 5px ${type.colorGlow})`; // Limpiado hue-rotate
            p.style.top = (groundLevel + 20) + "px";
            
            const spawnSide = Math.random() > 0.5 ? -100 : window.innerWidth + 100;
            p.style.left = spawnSide + "px";
            p.style.opacity = "0"; 
            
            const facingDirection = spawnSide < 0 ? 'right' : 'left';
            p.dataset.facing = facingDirection;
            
            if (facingDirection === 'left') {
                p.style.transform = 'scaleX(-1)';
            }
            
            document.body.appendChild(p);
            pikmins.push(p);

            setTimeout(() => {
                p.style.opacity = "1";
                
                const numAleatorio = Math.floor(Math.random() * 9) + 1;
                playSound(`pikmin/Greeting_${numAleatorio}.wav`, 0.2); //

                const jitterX = (Math.random() * 30 - 15);
                const jitterY = (Math.random() * 10 - 5); // Corrección: Definir jitterY aquí
                const finalX = targetX_centered + (i * 10) - (pikminCount * 5) + jitterX;
                
                moverConTorpeza(p, finalX);
                
                setTimeout(() => {
                    p.style.top = (groundLevel + 20 + jitterY) + "px";
                    p.classList.remove('pikmin-running'); 
                    p.style.transform = p.dataset.facing === 'left' ? 'scaleX(-1)' : '';
                }, 1500);
            }, 50 + (i * 120));
        }

        setTimeout(() => {
            playSound('pikmin/Grab Item.wav', 0.5); //
            
            targetObj.style.transition = "top 0.8s ease-in-out, left 5s linear";
            targetObj.style.top = (groundLevel - 20) + "px";

            setTimeout(() => {
                const irADerecha = Math.random() > 0.5;
                const exitX = irADerecha ? window.innerWidth + 250 : -250;

                playSound('pikmin/Carrying.wav', 0.4); //

                targetObj.style.left = exitX + "px";

                pikmins.forEach((p, i) => {
                    if (irADerecha) {
                        p.dataset.facing = 'right';
                        p.style.transform = ''; 
                    } else {
                        p.dataset.facing = 'left';
                        p.style.transform = 'scaleX(-1)'; 
                    }

                    p.classList.add('pikmin-running'); 
                    p.style.transition = "left 5s linear, transform 0.2s ease-in-out";
                    
                    const groupOffset = (i * 10) - (pikminCount * 5);
                    p.style.left = (exitX + groupOffset) + "px";
                    
                    setTimeout(() => p.remove(), 5500);
                });
                
                setTimeout(() => {
                    targetObj.remove();
                }, 5500);
            }, 1200); 
        }, 3500);
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