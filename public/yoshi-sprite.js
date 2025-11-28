class YoshiSpriteManager {
    constructor() {
        this.sprites = {
    greeting: '/resources/yoshi-doctor-saludo.png',
    pointing: '/resources/yoshi-doctor-señalando.png',
    reading: '/resources/yoshi-doctor-sentado-leyendo.png',
    thumbsup: '/resources/yoshi-doctor-pulgares-arriba.png'
};


        this.currentState = null;
        this.container = null;
        this.imageElement = null;
        this.transitionInProgress = false;
        this.transitionDebounce = null;
        this.init();
    }
    init() {
        this.createContainer();
        this.preloadImages();
        console.log('Sistema de Sprites Yoshi inicializado');
    }
    createContainer() {
        if (document.getElementById('yoshi-sprite-container')) {
            this.container = document.getElementById('yoshi-sprite-container');
            this.imageElement = document.getElementById('yoshi-sprite-image');
            return;
        }
        this.container = document.createElement('div');
        this.container.id = 'yoshi-sprite-container';
        this.container.className = 'yoshi-sprite-container';
        this.imageElement = document.createElement('img');
        this.imageElement.id = 'yoshi-sprite-image';
        this.imageElement.className = 'yoshi-sprite-image';
        this.imageElement.alt = 'Asistente Virtual';
        
        this.container.appendChild(this.imageElement);

        const doctorChat = document.getElementById('doctorChat');
        if (doctorChat) {
            doctorChat.appendChild(this.container);
        }
    }
    preloadImages() {
        Object.keys(this.sprites).forEach(state => {
            const img = new Image();
            img.src = this.sprites[state];
        });
    }

    /**
     * Cambiar el estado del sprite con animación
     * @param {string} newState - Nuevo estado ('greeting', 'pointing', 'reading', 'thumbsup')
     * @param {number} delay - Retraso antes de cambiar (ms)
     */
    changeState(newState, delay = 0) {
      
        if (!this.sprites[newState]) {
            console.warn(`Estado no válido: ${newState}`);
            return;
        }

    
        if (this.currentState === newState && !delay) {
            return;
        }
        clearTimeout(this.transitionDebounce);

        this.transitionDebounce = setTimeout(() => {
            this._performTransition(newState);
        }, delay);
    }

    /**
     * Ejecutar la transición visual
     * @private
     */
    _performTransition(newState) {
        if (this.transitionInProgress) return;
        this.transitionInProgress = true;
        this.imageElement.style.opacity = '0';
        this.imageElement.style.transform = 'translateY(10px) scale(0.95)';

        setTimeout(() => {
            this.imageElement.src = this.sprites[newState];
            this.currentState = newState;
            this.imageElement.style.opacity = '1';
            this.imageElement.style.transform = 'translateY(0) scale(1)';

            this.transitionInProgress = false;
        }, 400);
    }

    show() {
        if (this.container) {
            this.container.classList.add('visible');
        }
    }
    hide() {
        if (this.container) {
            this.container.classList.remove('visible');
        }
    }
    getState() {
        return this.currentState;
    }
}
let yoshiSprite = null;
function initYoshiSprites() {
    if (!yoshiSprite) {
        yoshiSprite = new YoshiSpriteManager();
    }
    return yoshiSprite;
}
const YoshiSpriteEvents = {
    
    onDoctorModalOpen: () => {
        const sprite = initYoshiSprites();
        sprite.changeState('greeting');
        sprite.show();
        console.log('Yoshi: Saludo inicial');
    },

    onConsentAccepted: () => {
        if (yoshiSprite) {
            yoshiSprite.changeState('thumbsup', 500);
            console.log('Yoshi: Confirmación del consentimiento');
            setTimeout(() => {
                yoshiSprite.changeState('pointing');
            }, 2000);
        }
    },

    onQuestionAsked: () => {
        if (yoshiSprite) {
            yoshiSprite.changeState('pointing', 300);
            console.log('Yoshi: Haciendo pregunta');
        }
    },
    onProcessing: () => {
        if (yoshiSprite) {
            yoshiSprite.changeState('reading', 200);
            console.log('Yoshi: Analizando respuestas');
        }
    },
    onResultShown: () => {
        if (yoshiSprite) {
            yoshiSprite.changeState('thumbsup', 500);
            console.log('Yoshi: Mostrando resultado');
        }
    },
    onUserResponse: () => {
        if (yoshiSprite) {
            yoshiSprite.changeState('reading', 100);
        
            setTimeout(() => {
                yoshiSprite.changeState('pointing');
            }, 1000);
        }
    },
    onEmergencyAlert: () => {
        if (yoshiSprite) {
            yoshiSprite.changeState('pointing', 200);
            console.log('Yoshi: Alerta de emergencia');
        }
    },
    onDoctorModalClose: () => {
        if (yoshiSprite) {
            yoshiSprite.hide();
            console.log('Yoshi: Ocultado');
        }
    },

    onRestart: () => {
        if (yoshiSprite) {
            yoshiSprite.changeState('greeting', 300);
            console.log('Yoshi: Reinicio - Saludo');
        }
    }
};
window.YoshiSprite = {
    init: initYoshiSprites,
    events: YoshiSpriteEvents,
    getInstance: () => yoshiSprite
};

console.log('Sistema de Sprites Yoshi cargado exitosamente');