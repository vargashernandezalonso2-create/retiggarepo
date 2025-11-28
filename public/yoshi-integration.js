(function() {
    'use strict';

    console.log('Iniciando integración Yoshi Sprites...');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIntegration);
    } else {
        initIntegration();
    }

    function initIntegration() {
        console.log('DOM listo - Configurando integración');
        const btnDoctorVirtual = document.getElementById('btn-doctor-virtual');
        const btnDoctorHero = document.getElementById('btn-doctor-hero');

        if (btnDoctorVirtual) {
            const originalClickHandler = btnDoctorVirtual.onclick;
            btnDoctorVirtual.addEventListener('click', function(e) {
                console.log('Evento: Apertura del modal del doctor');
                
                setTimeout(() => {
                    if (window.YoshiSprite) {
                        window.YoshiSprite.events.onDoctorModalOpen();
                    }
                }, 300);
            });
        }

        if (btnDoctorHero) {
            btnDoctorHero.addEventListener('click', function(e) {
                setTimeout(() => {
                    if (window.YoshiSprite) {
                        window.YoshiSprite.events.onDoctorModalOpen();
                    }
                }, 300);
            });
        }
        const btnCloseDoctor = document.getElementById('btn-close-doctor');
        const doctorModal = document.getElementById('doctor-modal');

        if (btnCloseDoctor) {
            btnCloseDoctor.addEventListener('click', function() {
                console.log('🎭 Evento: Cierre del modal');
                if (window.YoshiSprite) {
                    window.YoshiSprite.events.onDoctorModalClose();
                }
            });
        }
        if (doctorModal) {
            doctorModal.addEventListener('click', function(e) {
                if (e.target === doctorModal) {
                    if (window.YoshiSprite) {
                        window.YoshiSprite.events.onDoctorModalClose();
                    }
                }
            });
        }
        const doctorChat = document.getElementById('doctorChat');
        
        if (doctorChat) {
            const chatObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            handleNewChatElement(node);
                        }
                    });
                });
            });

            chatObserver.observe(doctorChat, {
                childList: true,
                subtree: true
            });

            console.log('Observer del chat activado');
        }
        if (window.doctorAcceptConsent) {
            const originalAcceptConsent = window.doctorAcceptConsent;
            window.doctorAcceptConsent = function() {
                console.log('🎭 Evento: Consentimiento aceptado');
                originalAcceptConsent.apply(this, arguments);
                
                if (window.YoshiSprite) {
                    window.YoshiSprite.events.onConsentAccepted();
                }
            };
        }

        console.log('Integración Yoshi completada');
    }
    function handleNewChatElement(element) {
        if (!window.YoshiSprite) return;
        if (element.classList && element.classList.contains('doctor-consent')) {
            console.log('🎭 Detectado: Pantalla de consentimiento');
            const sprite = window.YoshiSprite.getInstance();
            if (sprite) {
                sprite.changeState('greeting', 100);
            }
            return;
        }
        if (element.classList && element.classList.contains('doctor-message')) {
            const isUserMessage = element.classList.contains('user');
            
            if (isUserMessage) {
                console.log('Detectado: Respuesta del usuario');
                window.YoshiSprite.events.onUserResponse();
            } else {

                const content = element.querySelector('.doctor-message-content');
                if (content) {
                    analyzeDoctorMessage(content);
                }
            }
            return;
        }

        const parent = element.closest('.doctor-message');
        if (parent) {
            analyzeDoctorMessage(element);
        }
    }

    function analyzeDoctorMessage(element) {
        if (!window.YoshiSprite) return;
        if (element.querySelector('.doctor-options') || 
            element.classList.contains('doctor-options')) {
            console.log('🎭 Detectado: Pregunta con opciones');
            window.YoshiSprite.events.onQuestionAsked();
            return;
        }
        if (element.querySelector('.doctor-scale') || 
            element.classList.contains('doctor-scale')) {
            console.log('🎭 Detectado: Escala de evaluación');
            window.YoshiSprite.events.onQuestionAsked();
            return;
        }
        if (element.querySelector('.doctor-result') || 
            element.classList.contains('doctor-result')) {
            console.log('🎭 Detectado: Resultado/Diagnóstico');
            window.YoshiSprite.events.onResultShown();
            return;
        }
        if (element.querySelector('.emergency-alert') || 
            element.classList.contains('emergency-alert')) {
            console.log('Detectado: Alerta de emergencia');
            window.YoshiSprite.events.onEmergencyAlert();
            return;
        }
        if (element.querySelector('.typing-indicator') || 
            element.classList.contains('typing-indicator-msg')) {
            console.log('Detectado: Procesando respuesta');
            window.YoshiSprite.events.onProcessing();
            return;
        }
        const textContent = element.textContent || '';
        if (textContent.includes('?')) {
            console.log('Detectado: Pregunta del doctor');
            window.YoshiSprite.events.onQuestionAsked();
            return;
        }
        if (textContent.toLowerCase().includes('analizando') || 
            textContent.toLowerCase().includes('procesando') ||
            textContent.toLowerCase().includes('calculando')) {
            console.log('Detectado: Análisis en proceso');
            window.YoshiSprite.events.onProcessing();
            return;
        }
    }
    window.yoshiDebug = {
        testGreeting: () => {
            console.log('Test: Saludo');
            if (window.YoshiSprite) {
                const sprite = window.YoshiSprite.getInstance();
                if (sprite) {
                    sprite.changeState('greeting');
                    sprite.show();
                }
            }
        },
        testPointing: () => {
            console.log('Test: Señalando');
            if (window.YoshiSprite) {
                window.YoshiSprite.events.onQuestionAsked();
            }
        },
        testReading: () => {
            console.log('Test: Leyendo');
            if (window.YoshiSprite) {
                window.YoshiSprite.events.onProcessing();
            }
        },
        testThumbsUp: () => {
            console.log('Test: Pulgares arriba');
            if (window.YoshiSprite) {
                window.YoshiSprite.events.onResultShown();
            }
        },
        getCurrentState: () => {
            if (window.YoshiSprite) {
                const sprite = window.YoshiSprite.getInstance();
                if (sprite) {
                    console.log('📊 Estado actual:', sprite.getState());
                    return sprite.getState();
                }
            }
            return null;
        }
    };

    console.log('🎮 Comandos debug disponibles:');
    console.log('  - yoshiDebug.testGreeting()');
    console.log('  - yoshiDebug.testPointing()');
    console.log('  - yoshiDebug.testReading()');
    console.log('  - yoshiDebug.testThumbsUp()');
    console.log('  - yoshiDebug.getCurrentState()');

})();
if (!document.getElementById('yoshi-sprite-styles')) {
    const style = document.createElement('style');
    style.id = 'yoshi-sprite-styles';
    style.textContent = `
        /* Contenedor del sprite */
        .yoshi-sprite-container {
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 200px;
            height: 200px;
            z-index: 2999;
            pointer-events: none;
            opacity: 0;
            transform: translateY(50px) scale(0.8);
            transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        /* Cuando está visible */
        .yoshi-sprite-container.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        /* Imagen del sprite */
        .yoshi-sprite-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center bottom;
            animation: yoshiBreathe 4s ease-in-out infinite;
        }

        /* Animación de respiración */
        @keyframes yoshiBreathe {
            0%, 100% {
                transform: translateY(0) scale(1);
            }
            50% {
                transform: translateY(-5px) scale(1.02);
            }
        }

        /* Dentro del modal del doctor */
        #doctor-modal .yoshi-sprite-container {
            position: absolute;
            bottom: 80px;
            right: 20px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .yoshi-sprite-container {
                width: 150px;
                height: 150px;
                bottom: 60px;
                right: 15px;
            }
        }

        @media (max-width: 480px) {
            .yoshi-sprite-container {
                width: 120px;
                height: 120px;
                bottom: 50px;
                right: 10px;
            }
        }

        /* Ocultar en pantallas muy pequeñas */
        @media (max-width: 380px) {
            .yoshi-sprite-container {
                display: none;
            }
        }

        /* Reducir animaciones si el usuario lo prefiere */
        @media (prefers-reduced-motion: reduce) {
            .yoshi-sprite-container,
            .yoshi-sprite-image {
                animation: none !important;
                transition: opacity 0.3s ease !important;
            }
        }
    `;
    document.head.appendChild(style);
    console.log('Estilos Yoshi inyectados');
}