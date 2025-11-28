document.addEventListener('DOMContentLoaded', () => {
    
    const doctorState = {
        sessionId: null,
        currentStep: 1,
        consent: false,
        consentTimestamp: null,
        userData: {
            name: null, // <--- 1. AGREGAR ESTA LÍNEA
            age: null,
            ageNumeric: null,
            sex: null,
            weight: null,
            height: null,
            bmi: null,
            pregnant: null,
            allergies: [],
            medications: [],
            chronicConditions: [],
            familyHistory: [],
            lifestyle: {
                smoking: null,
                smokingYears: null,
                alcohol: null,
                exercise: null,
                stress: null
            }
        },
        symptoms: {
            primary: '',
            system: null,
            description: '',
            duration: null,
            durationDays: null,
            severity: null,
            onset: null,
            fever: null,
            feverTemp: null,
            associatedSymptoms: []
        },
        answers: [],
        hypotheses: [],
        scores: {},
        redFlags: {
            detected: false,
            level: null,
            flags: []
        },
        questionsAsked: 0,
        currentQuestionId: null
    };
    const CLINICAL_KNOWLEDGE = {
        // Mantenemos las banderas rojas por seguridad legal
        criticalRedFlags: [
            { id: 'rf_breathing', text: 'dificultad severa para respirar', priority: 10, action: 'emergency_911' },
            { id: 'rf_chest', text: 'dolor en el pecho opresivo', priority: 10, action: 'emergency_911' },
            { id: 'rf_unconscious', text: 'pérdida de consciencia', priority: 10, action: 'emergency_911' }
        ],

        systems: {
            respiratory: {
                name: 'Respiratorio / Gripe',
                emoji: '🤧',
                keywords: ['tos', 'gripe', 'moco', 'garganta', 'resfriado'],
                questions: [
                    {
                        id: 'q_resp_symptom',
                        text: '¿Cuál es tu síntoma más molesto?',
                        type: 'single',
                        options: [
                            { id: 'flemas', text: 'Tos con flemas', weight: { 'Jarabe_Expectorante': 3, 'Ambroxol': 2 } },
                            { id: 'seca', text: 'Tos seca / picazón', weight: { 'Jarabe_Antitusivo': 3, 'Miel_con_Propoleo': 1 } },
                            { id: 'cuerpo', text: 'Cuerpo cortado y escurrimiento', weight: { 'Antigripal_NF_Capsulas': 3, 'Paracetamol_500mg': 1 } }
                        ]
                    },
                    {
                        id: 'q_resp_fever',
                        text: '¿Tienes fiebre o dolor de cabeza?',
                        type: 'single',
                        options: [
                            { id: 'yes', text: 'Sí, algo de fiebre/dolor', weight: { 'Paracetamol_500mg': 2, 'Ibuprofeno_400mg': 2 } },
                            { id: 'no', text: 'No, solo la molestia local', weight: { 'Jarabe_Expectorante': 1, 'Jarabe_Antitusivo': 1 } }
                        ]
                    }
                ],
                // AQUI CAMBIAMOS ENFERMEDADES POR PRODUCTOS
                conditions: {
                    'Jarabe_Expectorante': { 
                        prior: 0.2, 
                        desc: 'Ayuda a expulsar las flemas.',
                        price: '$120.00',
                        img: 'https://placehold.co/100x100?text=Jarabe',
                        tests: [] 
                    },
                    'Antigripal_NF_Capsulas': { 
                        prior: 0.2, 
                        desc: 'Alivio completo para gripe y cuerpo cortado.',
                        price: '$85.50',
                        img: 'https://placehold.co/100x100?text=Antigripal',
                        tests: [] 
                    },
                    'Paracetamol_500mg': { 
                        prior: 0.2, 
                        desc: 'Efectivo para fiebre y dolor leve.',
                        price: '$45.00',
                        img: 'https://placehold.co/100x100?text=Paracetamol',
                        tests: [] 
                    },
                    'Jarabe_Antitusivo': {
                        prior: 0.2,
                        desc: 'Calma la tos seca irritante.',
                        price: '$110.00',
                        img: 'https://placehold.co/100x100?text=Antitusivo',
                        tests: []
                    }
                }
            },

            digestive: {
                name: 'Estomacal',
                emoji: '🤢',
                keywords: ['estomago', 'panza', 'acidez', 'diarrea', 'vomito'],
                questions: [
                    {
                        id: 'q_dig_main',
                        text: '¿Qué sientes en el estómago?',
                        type: 'single',
                        options: [
                            { id: 'ardor', text: 'Ardor / Acidez / Reflujo', weight: { 'Omeprazol_20mg': 3, 'Antiácido_Masticable': 2 } },
                            { id: 'dolor', text: 'Dolor tipo cólico', weight: { 'Butylhioscina_Pastillas': 3 } },
                            { id: 'suelto', text: 'Diarrea', weight: { 'Loperamida_2mg': 3, 'Suero_Oral': 2 } }
                        ]
                    }
                ],
                conditions: {
                    'Omeprazol_20mg': { prior: 0.3, desc: 'Protector gástrico para gastritis y acidez.', price: '$55.00', img: '', tests: [] },
                    'Loperamida_2mg': { prior: 0.2, desc: 'Auxiliar para detener la diarrea ocasional.', price: '$40.00', img: '', tests: [] },
                    'Suero_Oral': { prior: 0.2, desc: 'Hidratación necesaria si hay pérdida de líquidos.', price: '$25.00', img: '', tests: [] },
                    'Antiácido_Masticable': { prior: 0.2, desc: 'Alivio rápido para la acidez estomacal.', price: '$35.00', img: '', tests: [] }
                }
            },

            pain: {
                name: 'Dolores Generales',
                emoji: '🤕',
                keywords: ['dolor', 'golpe', 'cabeza', 'musculo', 'inflamacion'],
                questions: [
                    {
                        id: 'q_pain_type',
                        text: '¿Qué tipo de dolor es?',
                        type: 'single',
                        options: [
                            { id: 'head', text: 'Dolor de cabeza', weight: { 'Aspirina_500': 2, 'Paracetamol_500mg': 2 } },
                            { id: 'muscle', text: 'Muscular / Inflamación', weight: { 'Ibuprofeno_400mg': 3, 'Gel_Antiinflamatorio': 2 } },
                            { id: 'strong', text: 'Dolor muy fuerte (muela/cólico)', weight: { 'Ketorolaco_10mg': 3 } }
                        ]
                    }
                ],
                conditions: {
                    'Ibuprofeno_400mg': { prior: 0.3, desc: 'Desinflama y quita el dolor muscular.', price: '$60.00', img: '', tests: [] },
                    'Paracetamol_500mg': { prior: 0.3, desc: 'Ideal para dolor de cabeza leve.', price: '$45.00', img: '', tests: [] },
                    'Gel_Antiinflamatorio': { prior: 0.2, desc: 'Aplicación tópica para golpes.', price: '$95.00', img: '', tests: [] }
                }
            }
        },
        // Eliminamos la sección de otcMedications vieja porque ya integramos los productos arriba
        otcMedications: {} 
    };
    const doctorModal = document.getElementById('doctor-modal');
    const doctorChat = document.getElementById('doctorChat');
    const doctorInputArea = document.getElementById('doctorInputArea');
    const doctorInput = document.getElementById('doctorInput');
    const doctorSendBtn = document.getElementById('doctorSendBtn');
    const btnCloseDoctor = document.getElementById('btn-close-doctor');
    const progressLine = document.getElementById('progressLine');
    document.getElementById('btn-doctor-virtual')?.addEventListener('click', openDoctorModal);
    document.getElementById('btn-doctor-hero')?.addEventListener('click', openDoctorModal);
    btnCloseDoctor?.addEventListener('click', closeDoctorModal);
    
    doctorModal?.addEventListener('click', (e) => {
        if (e.target === doctorModal) closeDoctorModal();
    });
    if (doctorSendBtn) {
        doctorSendBtn.addEventListener('click', handleDoctorTextSubmit);
    }

    if (doctorInput) {
        doctorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleDoctorTextSubmit();
            }
        });
    }
    function openDoctorModal() {
        if (!doctorModal) return;
        doctorModal.style.display = 'flex';
        setTimeout(() => doctorModal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
        
        if (doctorChat.children.length === 0) {
            initializeSession();
        }
    }

    function closeDoctorModal() {
        if (!doctorModal) return;
        doctorModal.classList.remove('active');
        setTimeout(() => {
            doctorModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // iniciar la secion 
    function initializeSession() {
        doctorState.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        showConsentScreen();
    }

    // front de consentimiento ahhhhhhhhhhhh
   
    function showConsentScreen() {
        const consentHTML = `
            <div class="doctor-consent">
                <h2>Consentimiento Informado</h2>
                <div class="consent-content">
                    <h3>Propósito</h3>
                    <ul>
                        <li><strong>Sistema de orientación médica automatizado</strong></li>
                        <li><strong>NO es un diagnóstico médico definitivo</strong></li>
                        <li>NO reemplaza consulta con profesional de salud</li>
                        <li>Usa un modelo probabilístico de apoyo al triage</li>
                    </ul>
                    
                    <h3>⚖️ Limitaciones</h3>
                    <ul>
                        <li>NO prescribe medicamentos controlados</li>
                        <li>Sugiere solo medicamentos OTC con advertencias</li>
                        <li>Deriva a atención médica cuando detecta signos de alarma</li>
                    </ul>

                    <h3> Privacidad y Datos</h3>
                    <ul>
                        <li>Datos cifrados y almacenados temporalmente</li>
                        <li>Cumplimiento LFPDPPP (México)</li>
                        <li>Puedes solicitar eliminación de tus datos</li>
                        <li>Session ID: <code>${doctorState.sessionId}</code></li>
                    </ul>

                    <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 10px; margin-top: 1rem;">
                        <strong>IMPORTANTE:</strong> Si experimentas emergencia médica (dificultad respirar, dolor pecho, sangrado profuso), llama al 911 inmediatamente.
                    </div>
                </div>
                <div class="consent-actions">
                    <button class="btn btn-success" onclick="window.doctorAcceptConsent()">
                        Acepto y Entiendo
                    </button>
                    <button class="btn btn-secondary" onclick="window.doctorDeclineConsent()">
                        No Acepto
                    </button>
                </div>
            </div>
        `;
        doctorChat.innerHTML = consentHTML;
        scrollDoctorToBottom();
    }

    // Aqui pides el consentimiento 
    window.doctorAcceptConsent = async function() {
        doctorState.consent = true;
        doctorState.consentTimestamp = new Date().toISOString();
        
        console.log('Consentimiento aceptado:', {
            sessionId: doctorState.sessionId,
            timestamp: doctorState.consentTimestamp
        });

        updateDoctorProgress(1);
        doctorChat.innerHTML = '';
        await startDoctorConversation();
    };

    window.doctorDeclineConsent = function() {
        const declineHTML = `
            <div class="doctor-consent">
                <h2>Consentimiento No Otorgado</h2>
                <p style="color: var(--text-light); line-height: 1.8; margin: 1rem 0;">
                    Entendemos tu decisión. Sin consentimiento no podemos proceder. 
                    Si necesitas atención médica, contacta directamente a un profesional de salud.
                </p>
                <div class="consent-actions">
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Volver a Revisar
                    </button>
                </div>
            </div>
        `;
        doctorChat.innerHTML = declineHTML;
    };
    // INICIAR CONVERSACIÓN
    async function startDoctorConversation() {
        // 2. CAMBIO DE SALUDO Y PRIMERA PREGUNTA:
        await addDoctorMessage("¡Hola! 👋 Soy tu Asistente Virtual."); 
        await delay(1000);
        await addDoctorMessage("Haré preguntas específicas para entender tu situación y darte la mejor orientación.");
        await delay(800);
        askName(); // <--- Ahora llama a askName en vez de askAge
    }
    // Aqui va la probabilidad weee 
    function initializeHypotheses(system) {
        const conditions = CLINICAL_KNOWLEDGE.systems[system].conditions;
        doctorState.scores = {};
        
        for (const [conditionName, conditionData] of Object.entries(conditions)) {
            doctorState.scores[conditionName] = conditionData.prior;
        }
    }

    function updateScores(questionId, answerId, system) {
        const question = CLINICAL_KNOWLEDGE.systems[system].questions.find(q => q.id === questionId);
        if (!question) return;

        const selectedOption = question.options.find(opt => opt.id === answerId);
        if (!selectedOption || !selectedOption.weight) return;
        for (const [condition, weightValue] of Object.entries(selectedOption.weight)) {
            if (doctorState.scores[condition] !== undefined) {
                doctorState.scores[condition] *= (1 + weightValue * 0.1);
            }
        }
        const totalScore = Object.values(doctorState.scores).reduce((sum, val) => sum + val, 0);
        if (totalScore > 0) {
            for (const condition in doctorState.scores) {
                doctorState.scores[condition] /= totalScore;
            }
        }
    }

    function checkRedFlags(text, questionId = null, answerId = null) {
        const detectedFlags = [];
        const lowerText = text.toLowerCase();
        CLINICAL_KNOWLEDGE.criticalRedFlags.forEach(flag => {
            if (lowerText.includes(flag.text.toLowerCase())) {
                detectedFlags.push(flag);
            }
        });
        if (questionId && answerId) {
            for (const system of Object.values(CLINICAL_KNOWLEDGE.systems)) {
                const question = system.questions.find(q => q.id === questionId);
                if (question) {
                    const option = question.options.find(opt => opt.id === answerId);
                    if (option && option.redFlag) {
                        detectedFlags.push({
                            id: `rf_${questionId}_${answerId}`,
                            text: option.text,
                            priority: 8,
                            action: 'urgent_consult'
                        });
                    }
                }
            }
        }

        return detectedFlags;
    }

    function generateHypotheses() {
        const hypotheses = [];
        
        // Convertimos los puntajes en lista de productos
        for (const [prodName, score] of Object.entries(doctorState.scores)) {
            if (score > 0.05) { // Filtro mínimo
                const system = findSystemForCondition(prodName);
                const prodData = system ? system.conditions[prodName] : null;
                
                if (prodData) {
                    hypotheses.push({
                        condition: prodName.replace(/_/g, ' '), // El nombre del producto
                        probability: Math.round(score * 100),
                        description: prodData.desc,
                        price: prodData.price,
                        img: prodData.img || 'resources/medicamento-generico.png', // Usa una imagen genérica si no hay
                        confidenceRange: '' // Ya no es necesario
                    });
                }
            }
        }
        
        // Ordenamos: el producto con más puntaje va primero
        hypotheses.sort((a, b) => b.probability - a.probability);
        
        // Retornamos solo el top 1 o top 2
        return hypotheses.slice(0, 2);
    }

    function findSystemForCondition(conditionName) {
        for (const system of Object.values(CLINICAL_KNOWLEDGE.systems)) {
            if (system.conditions[conditionName]) {
                return system;
            }
        }
        return null;
    }

   
    // Aqui van las funciones
   
    async function addDoctorMessage(text) {
        const messageHTML = `
            <div class="doctor-message">
                <div class="doctor-avatar">⚕️</div>
                <div class="doctor-message-content">
                    <p>${text}</p>
                </div>
            </div>
        `;
        doctorChat.insertAdjacentHTML('beforeend', messageHTML);
        scrollDoctorToBottom();
    }

    function addUserMessage(text) {
        const messageHTML = `
            <div class="doctor-message user">
                <div class="doctor-avatar user">👤</div>
                <div class="doctor-message-content">
                    <p>${text}</p>
                </div>
            </div>
        `;
        doctorChat.insertAdjacentHTML('beforeend', messageHTML);
        scrollDoctorToBottom();
    }

    function showDoctorOptions(options, callback) {
        const optionsHTML = `
            <div class="doctor-message">
                <div class="doctor-avatar">⚕️</div>
                <div class="doctor-message-content" style="max-width: 100%;">
                    <div class="doctor-options">
                        ${options.map(opt => `
                            <button class="doctor-option-btn" data-value="${opt.value}" 
                                    data-numeric="${opt.numeric || ''}" data-days="${opt.days || ''}">
                                ${opt.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        doctorChat.insertAdjacentHTML('beforeend', optionsHTML);
        scrollDoctorToBottom();
        
        const buttons = doctorChat.querySelectorAll('.doctor-option-btn:not(.disabled)');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const numeric = this.getAttribute('data-numeric');
                const days = this.getAttribute('data-days');
                
                buttons.forEach(b => {
                    b.disabled = true;
                    b.classList.add('disabled');
                });
                
                if (numeric) {
                    callback(value, parseInt(numeric, 10));
                } else if (days) {
                    callback(value, parseFloat(days));
                } else {
                    callback(value);
                }
            });
        });
    }

    function showDoctorMultipleChoice(options, callback) {
        const optionsHTML = `
            <div class="doctor-message">
                <div class="doctor-avatar">⚕️</div>
                <div class="doctor-message-content" style="max-width: 100%;">
                    <div class="doctor-options">
                        ${options.map((opt, idx) => `
                            <label class="doctor-checkbox-option" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: white; border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s; margin-bottom: 0.5rem;">
                                <input type="checkbox" value="${opt.value}" id="opt-${idx}" style="width: 20px; height: 20px;">
                                <span style="flex: 1;">${opt.text}</span>
                            </label>
                        `).join('')}
                        <button class="btn btn-primary" id="btn-confirm-multiple" style="margin-top: 1rem; width: 100%;">
                            Confirmar selección
                        </button>
                    </div>
                </div>
            </div>
        `;
        doctorChat.insertAdjacentHTML('beforeend', optionsHTML);
        scrollDoctorToBottom();
        
        const confirmBtn = document.getElementById('btn-confirm-multiple');
        confirmBtn.addEventListener('click', function() {
            const checkboxes = doctorChat.querySelectorAll('.doctor-checkbox-option input[type="checkbox"]:checked');
            const selectedValues = Array.from(checkboxes).map(cb => cb.value);
            
            if (selectedValues.length === 0) {
                alert('Selecciona al menos una opción');
                return;
            }
            
            doctorChat.querySelectorAll('.doctor-checkbox-option input').forEach(cb => cb.disabled = true);
            this.disabled = true;
            
            callback(selectedValues);
        });
    }

    function showDoctorTextInput(callback) {
        if (doctorInputArea) {
            doctorInputArea.classList.remove('hidden');
        }
        if (doctorInput) {
            doctorInput.value = '';
            doctorInput.focus();
        }
        scrollDoctorToBottom();
        window.currentDoctorTextCallback = callback;
        console.log('Callback registrado para input');
    }

    function handleDoctorTextSubmit() {
        if (!doctorInput) {
            console.error('Input no encontrado');
            return;
        }

        const text = doctorInput.value.trim();
        if (!text) {
            console.log('Input vacío');
            return;
        }

        console.log('Procesando input:', text);
        addUserMessage(text);
        doctorInput.value = '';
        if (doctorInputArea) {
            doctorInputArea.classList.add('hidden');
        }
        if (window.currentDoctorTextCallback) {
            console.log('Ejecutando callback');
            try {
                const callback = window.currentDoctorTextCallback;
                window.currentDoctorTextCallback = null; 
                callback(text);
            } catch (err) {
                console.error('Error en callback de input:', err);
            }
        } else {
            console.warn('No hay respuesta definida');
        }
    }

    function showTypingIndicator() {
        const typingHTML = `
            <div class="doctor-message typing-indicator-msg">
                <div class="doctor-avatar"></div>
                <div class="doctor-message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        doctorChat.insertAdjacentHTML('beforeend', typingHTML);
        scrollDoctorToBottom();
    }

    function hideTypingIndicator() {
        const typing = doctorChat.querySelector('.typing-indicator-msg');
        if (typing) typing.remove();
    }

    function updateDoctorProgress(step) {
        doctorState.currentStep = step;
        
        for (let i = 1; i <= 3; i++) {
            const stepEl = document.getElementById(`step${i}`);
            if (!stepEl) continue;
            
            if (i < step) {
                stepEl.classList.add('completado');
                stepEl.classList.remove('activado');
            } else if (i === step) {
                stepEl.classList.add('activado');
                stepEl.classList.remove('completado');
            } else {
                stepEl.classList.remove('activado', 'completado');
            }
        }
        
        if (progressLine) {
            const percentage = ((step - 1) / 2) * 100;
            progressLine.style.width = `${percentage}%`;
        }
    }

    function scrollDoctorToBottom() {
        setTimeout(() => {
            doctorChat.scrollTop = doctorChat.scrollHeight;
        }, 100);
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function resetDoctor() {
        Object.assign(doctorState, {
            sessionId: null,
            currentStep: 1,
            consent: false,
            consentTimestamp: null,
            userData: {
                name: null, age: null, ageNumeric: null, sex: null, weight: null, height: null,
                bmi: null, pregnant: null, allergies: [], medications: [],
                chronicConditions: [], familyHistory: [],
                lifestyle: { smoking: null, smokingYears: null, alcohol: null, exercise: null, stress: null }
            },
            symptoms: {
                primary: '', system: null, description: '', duration: null,
                durationDays: null, severity: null, onset: null, fever: null,
                feverTemp: null, associatedSymptoms: []
            },
            answers: [],
            hypotheses: [],
            scores: {},
            redFlags: { detected: false, level: null, flags: [] },
            questionsAsked: 0,
            currentQuestionId: null
        });
        
        doctorChat.innerHTML = '';
        updateDoctorProgress(1);
        initializeSession();
    }
    // WEYES aqui van las preguntas basicas 
    // <--- 3. PEGAR ESTA FUNCIÓN NUEVA AQUÍ
    function askName() {
        addDoctorMessage("Por favor, escribe el nombre completo del paciente:");
        
        showDoctorTextInput((text) => {
            const name = text.trim();
            if (name.length < 2) {
                addDoctorMessage("Por favor ingresa un nombre válido.");
                askName(); 
                return;
            }
            
            doctorState.userData.name = name.toUpperCase();
            addUserMessage(name); // Muestra lo que escribió el usuario en el chat
            addDoctorMessage(`Gracias ${doctorState.userData.name}, continuamos.`);
            setTimeout(() => askAge(), 800);
        });
    }
    function askAge() {
        addDoctorMessage("¿Cuál es tu edad?");
        addDoctorMessage("Ingresa tu edad en años (ejemplo: 25)");
        
        showDoctorTextInput((text) => {
            const age = parseInt(text.trim(), 10);
            
            if (isNaN(age) || age < 0 || age > 120) {
                addDoctorMessage("Por favor ingresa una edad válida entre 0 y 120 años.");
                askAge();
                return;
            }
            
            doctorState.userData.age = `${age} años`;
            doctorState.userData.ageNumeric = age;
            
            doctorState.answers.push({
                questionId: 'q_age',
                text: `${age} años`,
                timestamp: Date.now(),
                relevant: true
            });
            
            if (age < 18) {
                addDoctorMessage("Para menores de 18, requiero que un adulto supervise. ¿Hay un adulto presente?");
                showDoctorOptions([
                    { text: "Sí", value: "yes" },
                    { text: "No", value: "no" }
                ], (response) => {
                    addUserMessage(response === "yes" ? "Sí" : "No");
                    if (response === "no") {
                        addDoctorMessage("No podemos continuar sin supervisión adulta. Consulta con un adulto responsable.");
                        return;
                    }
                    askWeight();
                });
            } else {
                askWeight();
            }
        });
    }

    function askWeight() {
        addDoctorMessage("¿Cuál es tu peso aproximado?");
        addDoctorMessage("Ingresa solo el número en kilogramos (ejemplo: 70)");
        
        showDoctorTextInput((text) => {
            const cleanText = text.trim().toLowerCase()
                .replace(/kg|k|kilogramos?|kilos?/gi, '')
                .replace(/,/g, '.')
                .trim();
            
            const weight = parseFloat(cleanText);
            
            if (isNaN(weight) || weight < 20 || weight > 300) {
                addDoctorMessage("Por favor ingresa un peso válido entre 20 y 300 kg (ejemplo: 70)");
                setTimeout(() => askWeight(), 500);
                return;
            }
            
            doctorState.userData.weight = weight;
            
            doctorState.answers.push({
                questionId: 'q_weight',
                text: `${weight} kg`,
                timestamp: Date.now(),
                relevant: true
            });
            
            askHeight();
        });
    }

    function askHeight() {
        addDoctorMessage("¿Cuál es tu estatura?");
        addDoctorMessage("Ingresa en metros (ejemplo: 1.74) o en centímetros (ejemplo: 174)");
        
        showDoctorTextInput((text) => {
            const cleanText = text.trim().toLowerCase()
                .replace(/cm|centimetros?|metros?|m/gi, '')
                .replace(/,/g, '.')
                .trim();
            
            let height = parseFloat(cleanText);
            
            if (height > 3) {
                height = height / 100;
            }
            
            if (isNaN(height) || height < 0.5 || height > 2.5) {
                addDoctorMessage("Por favor ingresa una estatura válida (ejemplo: 1.74 o 174)");
                setTimeout(() => askHeight(), 500);
                return;
            }
            
            doctorState.userData.height = Math.round(height * 100);
            const heightInMeters = height.toFixed(2);
            const bmi = doctorState.userData.weight / (height * height);
            doctorState.userData.bmi = Math.round(bmi * 10) / 10;
            
            doctorState.answers.push({
                questionId: 'q_height',
                text: `${heightInMeters} m`,
                timestamp: Date.now(),
                relevant: true
            });
            
            delay(500).then(() => {
                let imcInterpretation = '';
                let imcEmoji = '';
                
                if (bmi < 18.5) {
                    imcInterpretation = '(Bajo peso)';
                    imcEmoji = '⚠️';
                } else if (bmi < 25) {
                    imcInterpretation = '(Peso normal)';
                    imcEmoji = '✅';
                } else if (bmi < 30) {
                    imcInterpretation = '(Sobrepeso)';
                    imcEmoji = '⚠️';
                } else {
                    imcInterpretation = '(Obesidad)';
                    imcEmoji = '🔴';
                }
                
                addDoctorMessage(`${imcEmoji} Tu IMC es ${doctorState.userData.bmi} ${imcInterpretation}`);
                delay(800).then(() => askAllergies());
            });
        });
    }

    function askAllergies() {
        addDoctorMessage("¿Tienes alergias a medicamentos?");
        showDoctorOptions([
            { text: "No", value: "none" },
            { text: "Sí", value: "yes" }
        ], (value) => {
            addUserMessage(value === "none" ? "No" : "Sí");
            
            if (value === "yes") {
                addDoctorMessage("Lista tus alergias (separadas por comas):");
                showDoctorTextInput((text) => {
                    doctorState.userData.allergies = text.split(',').map(a => a.trim()).filter(a => a);
                    askCurrentMedications();
                });
            } else {
                askCurrentMedications();
            }
        });
    }

    function askCurrentMedications() {
        addDoctorMessage("¿Tomas medicamentos regularmente?");
        showDoctorOptions([
            { text: "No", value: "none" },
            { text: "Sí", value: "yes" }
        ], (value) => {
            addUserMessage(value === "none" ? "No" : "Sí");
            
            if (value === "yes") {
                addDoctorMessage("Lista los medicamentos que tomas:");
                showDoctorTextInput((text) => {
                    doctorState.userData.medications = text.split(',').map(m => m.trim()).filter(m => m);
                    completeBasicInfo();
                });
            } else {
                completeBasicInfo();
            }
        });
    }

    async function completeBasicInfo() {
        updateDoctorProgress(2);
        await addDoctorMessage("Información básica completa. Ahora sobre tus síntomas...");
        await delay(800);
        askSymptomDescription();
    }
    // LAS preguntas wee
    
    function askSymptomDescription() {
        addDoctorMessage("Describe brevemente tu síntoma principal:");
        addDoctorMessage("Ej: 'Tengo tos y me cuesta respirar' o 'Moretones y mucho cansancio'");
        
        showDoctorTextInput(async (text) => {
            doctorState.symptoms.description = text;
            doctorState.symptoms.primary = text.split('.')[0];
            
            const redFlags = checkRedFlags(text);
            
            if (redFlags.length > 0 && redFlags.some(rf => rf.priority >= 9)) {
                doctorState.redFlags.detected = true;
                doctorState.redFlags.level = 'critical';
                doctorState.redFlags.flags = redFlags;
                await showEmergencyAlert(redFlags);
                return;
            }
            
            const identifiedSystem = identifySystem(text);
            doctorState.symptoms.system = identifiedSystem;
            
            const systemData = CLINICAL_KNOWLEDGE.systems[identifiedSystem];
            await addDoctorMessage(`🔍 Sistema identificado: ${systemData.emoji} ${systemData.name}`);
            await delay(800);
            
            initializeHypotheses(identifiedSystem);
            
            askAdaptiveQuestion(identifiedSystem, 0);
        });
    }

    function identifySystem(symptomText) {
        const text = symptomText.toLowerCase();
        let maxScore = 0;
        let identifiedSystem = 'respiratory';
        
        for (const [system, data] of Object.entries(CLINICAL_KNOWLEDGE.systems)) {
            let score = 0;
            data.keywords.forEach(keyword => {
                if (text.includes(keyword)) score += 1;
            });
            
            if (score > maxScore) {
                maxScore = score;
                identifiedSystem = system;
            }
        }
        
        return identifiedSystem;
    }
    // fent tvh aqui van las respuestas adaptativas 
    function askAdaptiveQuestion(system, questionIndex) {
        const systemData = CLINICAL_KNOWLEDGE.systems[system];
        const questions = systemData.questions;
        
        if (questionIndex >= questions.length || doctorState.questionsAsked >= 8) {
            generateDiagnosisAndRecommendations();
            return;
        }
        
        const question = questions[questionIndex];
        doctorState.currentQuestionId = question.id;
        doctorState.questionsAsked++;
        
        addDoctorMessage(question.text);
        
        const options = question.options.map(opt => ({
            text: opt.text,
            value: opt.id
        }));
        
        if (question.type === 'multiple') {
            showDoctorMultipleChoice(options, (selectedIds) => {
                const selectedTexts = question.options
                    .filter(opt => selectedIds.includes(opt.id))
                    .map(opt => opt.text);
                    
                addUserMessage(selectedTexts.join(', '));
                
                selectedIds.forEach(answerId => {
                    updateScores(question.id, answerId, system);
                    
                    const flags = checkRedFlags('', question.id, answerId);
                    if (flags.length > 0) {
                        doctorState.redFlags.flags.push(...flags);
                    }
                });
                
                doctorState.answers.push({
                    questionId: question.id,
                    text: selectedTexts.join(', '),
                    timestamp: Date.now(),
                    relevant: true
                });
                
                if (doctorState.redFlags.flags.some(rf => rf.priority >= 8)) {
                    doctorState.redFlags.detected = true;
                    doctorState.redFlags.level = 'urgent';
                    showUrgentAlert(doctorState.redFlags.flags);
                }
                
                askAdaptiveQuestion(system, questionIndex + 1);
            });
        } else {
            showDoctorOptions(options, (answerId) => {
                const selectedOption = question.options.find(opt => opt.id === answerId);
                addUserMessage(selectedOption.text);
                
                updateScores(question.id, answerId, system);
                
                const flags = checkRedFlags('', question.id, answerId);
                if (flags.length > 0) {
                    doctorState.redFlags.flags.push(...flags);
                }
                
                doctorState.answers.push({
                    questionId: question.id,
                    text: selectedOption.text,
                    timestamp: Date.now(),
                    relevant: true
                });
                
                if (doctorState.redFlags.flags.some(rf => rf.priority >= 8)) {
                    doctorState.redFlags.detected = true;
                    doctorState.redFlags.level = 'urgent';
                    showUrgentAlert(doctorState.redFlags.flags);
                }
                
                askAdaptiveQuestion(system, questionIndex + 1);
            });
        }
    }
    // Kike aqui pega tu codigo para hacer las alertas 
    
    async function showUrgentAlert(redFlags) {
        const urgentHTML = `
            <div class="doctor-message">
                <div class="doctor-avatar"></div>
                <div class="doctor-message-content" style="max-width: 100%;">
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 1rem 0;"> ATENCIÓN URGENTE NECESARIA</h3>
                        <p style="margin-bottom: 1rem;">
                            Basado en tus respuestas, se detectaron signos que requieren evaluación médica pronto.
                        </p>
                        
                        <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <strong> Signos detectados:</strong>
                            <ul style="margin: 0.5rem 0 0 1.25rem;">
                                ${redFlags.map(f => `<li>${f.text}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <p style="font-weight: 700; margin-top: 1rem;">
                             Recomendación: Contacta a tu médico o acude a urgencias en las próximas 2-6 horas.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        doctorChat.insertAdjacentHTML('beforeend', urgentHTML);
        scrollDoctorToBottom();
        
        await delay(1500);
        await addDoctorMessage("Continuaré con la evaluación pero es importante que busques atención médica pronto.");
    }

    async function showEmergencyAlert(redFlags) {
        const emergencyHTML = `
            <div class="doctor-message">
                <div class="doctor-avatar">⚕️</div>
                <div class="doctor-message-content" style="max-width: 100%;">
                    <div class="emergency-alert">
                        <h3> EMERGENCIA DETECTADA</h3>
                        <p style="font-size: 1.2rem; margin: 1rem 0;">
                            Los síntomas descritos requieren <strong>ATENCIÓN MÉDICA INMEDIATA</strong>
                        </p>
                        
                        <div style="background: rgba(255,255,255,0.3); padding: 1.25rem; border-radius: 10px; margin: 1rem 0;">
                            <strong> Signos de alarma detectados:</strong>
                            <ul style="margin: 0.75rem 0 0 1.25rem;">
                                ${redFlags.map(f => `<li style="font-weight: 600;">${f.text}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div style="background: rgba(255, 255, 255, 0.95); color: #1e293b; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                            <p style="font-weight: 700; font-size: 1.3rem; margin-bottom: 1rem;">
                                 ACCIONES INMEDIATAS:
                            </p>
                            <ol style="margin-left: 1.5rem; line-height: 2;">
                                <li>Llamar al <strong>911</strong> AHORA</li>
                                <li>Si es posible, pedir ayuda a alguien cercano</li>
                                <li>NO conducir - esperar ambulancia o pedir transporte</li>
                                <li>Tener documentos de identidad listos</li>
                            </ol>
                        </div>
                        
                        <div class="emergency-numbers">
                            <strong> NÚMEROS DE EMERGENCIA MÉXICO:</strong><br>
                             <strong>911</strong> - Emergencias Generales<br>
                             <strong>065</strong> - Cruz Roja<br>
                             Locatel: <strong>55-5658-1111</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        doctorChat.insertAdjacentHTML('beforeend', emergencyHTML);
        scrollDoctorToBottom();
        
        await delay(2000);
        await addDoctorMessage("No puedo continuar con la evaluación. Tu seguridad es prioridad. Busca ayuda médica AHORA. 🏥");
    }

    //regenul aqui va el codigo para generar el reporte
    async function generateDiagnosisAndRecommendations() {
        updateDoctorProgress(3);
        
        await addDoctorMessage("Analizando información y calculando probabilidades...");
        showTypingIndicator();
        
        await delay(2500);
        hideTypingIndicator();
        
        const hypotheses = generateHypotheses();
        doctorState.hypotheses = hypotheses;
        
        await showDiagnosisReport();
        // await showRecommendations(); // Ya no es necesario
        // await showExportOptions(); // La nueva función de reporte maneja esto
    }

    async function showDiagnosisReport() {
        const topProduct = doctorState.hypotheses[0];

        if (!topProduct) {
            await addDoctorMessage("No hay suficiente información para generar una receta. Por favor consulta a un médico.");
            return;
        }

        const productHTML = `
            <div class="doctor-message">
                <div class="doctor-avatar">💊</div>
                <div class="doctor-message-content" style="max-width: 100%; width: 100%;">
                    <div class="doctor-result" style="text-align: center;">
                        <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Recomendación Clínica:</h3>
                        
                        <div style="border: 2px solid var(--primary-color); border-radius: 15px; padding: 1.5rem; margin: 1rem 0; background: white;">
                            <h2 style="font-size: 1.4rem; color: #1e293b; margin-bottom: 0.5rem;">${topProduct.condition}</h2>
                            <p style="color: #64748b; margin-bottom: 1rem;">${topProduct.description}</p>
                            
                            <div style="font-size: 1.8rem; font-weight: bold; color: var(--success-color); margin-bottom: 1rem;">
                                ${topProduct.price}
                            </div>

                            <div style="display: flex; gap: 10px; justify-content: center;">
                                <button onclick="alert('Agregado al carrito')" 
                                    style="background: var(--success-color); color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; flex: 1;">
                                    🛒 Comprar
                                </button>
                                
                                <button onclick="printPrescription()" 
                                    style="background: #64748b; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; flex: 1;">
                                    🖨️ Imprimir Receta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        doctorChat.insertAdjacentHTML('beforeend', productHTML);
        scrollDoctorToBottom();
        
        // --- NUEVO: LANZAR CONFETI AUTOMÁTICAMENTE ---
        // Justo cuando aparece el botón y el diagnóstico finaliza:
        setTimeout(() => {
            lanzarCelebracion();
        }, 1000); // Espera 1 segundo después de mostrar el botón para lanzar el confeti
        
        await delay(1000);
        await addDoctorMessage("¿Deseas buscar otro producto?");
        showDoctorOptions([
            { text: "Sí, buscar otro", value: "new" },
            { text: "No, finalizar", value: "end" }
        ], handleExportAction);
    }

    async function showRecommendations() {
       // Función vaciada intencionalmente
    }

    function determineUrgencyLevel() {
        const topHypothesis = doctorState.hypotheses[0] || { probability: 0, condition: '' };
        const hasUrgentFlags = doctorState.redFlags.flags.some(rf => rf.priority >= 8);
        
        if (hasUrgentFlags || topHypothesis.probability >= 60) {
            return {
                emoji: '🚨',
                title: 'ATENCIÓN MÉDICA URGENTE',
                timeframe: 'Consulta en las próximas 2-6 horas',
                color: '#f59e0b',
                actions: [
                    'Acudir a urgencias o consulta médica pronto',
                    'Llamar a tu médico de confianza',
                    'Preparar lista detallada de síntomas',
                    'Llevar lista de medicamentos actuales'
                ]
            };
        }
        
        if (topHypothesis.probability >= 40) {
            return {
                emoji: '⚕️',
                title: 'CONSULTA MÉDICA RECOMENDADA',
                timeframe: 'Agenda cita en próximos 3-7 días',
                color: '#3b82f6',
                actions: [
                    'Agendar consulta médica',
                    'Llevar registro de síntomas',
                    'Anotar medicamentos y alergias',
                    'Prepararse para posibles pruebas diagnósticas'
                ]
            };
        }
        
        return {
            emoji: '🏠',
            title: 'AUTOCUIDADO Y MONITOREO',
            timeframe: 'Vigilar evolución - Consultar si empeora',
            color: '#10b981',
            actions: [
                'Descansar adecuadamente',
                'Mantenerse bien hidratado (2-3L/día)',
                'Alimentación saludable y balanceada',
                'Monitorear síntomas diariamente',
                'Consultar si síntomas persisten >5-7 días'
            ]
        };
    }

    function getOTCRecommendations() {
        const recommendations = [];
        
        if (doctorState.userData.pregnant !== 'no' && doctorState.userData.pregnant !== null) {
            return [];
        }
        
        if (doctorState.redFlags.flags.length > 0) {
            return [];
        }
        
        const topHypotheses = doctorState.hypotheses.filter(h => h.probability > 20).slice(0, 2);
        
        for (const hyp of topHypotheses) {
            const conditionKey = hyp.condition.replace(/ /g, '_');
            const system = findSystemForCondition(conditionKey);
            
            if (system && system.conditions[conditionKey]) {
                const productData = system.conditions[conditionKey];
                
                const recommendation = {
                    name: hyp.condition,
                    indications: [productData.desc],
                    dosage: 'Según indicaciones en el empaque',
                    maxDaily: 'No exceder la dosis recomendada',
                    pregnancy: 'Consultar al médico',
                    warnings: [],
                    interactions: []
                };
                
                const hasAllergy = doctorState.userData.allergies.some(allergy => 
                    recommendation.name.toLowerCase().includes(allergy.toLowerCase())
                );
                
                if (!hasAllergy) {
                    recommendations.push(recommendation);
                }
            }
        }
        
        return recommendations;
    }
    async function showExportOptions() {
        await addDoctorMessage("¿Deseas exportar este reporte?");
        showDoctorOptions([
            { text: "Exportar JSON", value: "json" },
            { text: "Copiar resumen", value: "copy" },
            { text: "Nueva consulta", value: "new" },
            { text: "Finalizar", value: "end" }
        ], handleExportAction);
    }

    function handleExportAction(action) {
        addUserMessage(action);
        
        if (action === "json") {
            exportSessionJSON();
        } else if (action === "copy") {
            copySessionSummary();
        } else if (action === "new") {
            resetDoctor();
        } else {
            addDoctorMessage("Gracias por usar Doctor Virtual BHR. ¡Cuídate! 💙");
            setTimeout(() => {
                showDoctorOptions([{ text: "Cerrar", value: "close" }], () => closeDoctorModal());
            }, 2000);
        }
    }

    function exportSessionJSON() {
        const exportData = {
            sessionId: doctorState.sessionId,
            timestamp: new Date().toISOString(),
            consent: {
                accepted: doctorState.consent,
                timestamp: doctorState.consentTimestamp
            },
            userData: doctorState.userData,
            symptoms: doctorState.symptoms,
            answers: doctorState.answers,
            hypotheses: doctorState.hypotheses,
            redFlags: doctorState.redFlags,
            metadata: {
                questionsAsked: doctorState.questionsAsked,
                systemIdentified: doctorState.symptoms.system,
                completedSteps: doctorState.currentStep
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `doctor-virtual-${doctorState.sessionId}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        addDoctorMessage("Archivo JSON descargado exitosamente");
    }

    function copySessionSummary() {
        const summary = `
REPORTE ASISTENTE VIRTUAL BHR
==========================
Session ID: ${doctorState.sessionId}
Fecha: ${new Date().toLocaleString('es-MX')}

DATOS DEL PACIENTE:
- Edad: ${doctorState.userData.ageNumeric} años
- IMC: ${doctorState.userData.bmi}
- Alergias: ${doctorState.userData.allergies.length > 0 ? doctorState.userData.allergies.join(', ') : 'Ninguna'}
- Medicamentos: ${doctorState.userData.medications.length > 0 ? doctorState.userData.medications.join(', ') : 'Ninguno'}

SÍNTOMA PRINCIPAL:
${doctorState.symptoms.description}

SISTEMA IDENTIFICADO:
${CLINICAL_KNOWLEDGE.systems[doctorState.symptoms.system].name}

DIAGNÓSTICO PROBABILÍSTICO:
${doctorState.hypotheses.map((h, i) => `${i+1}. ${h.condition}: ${h.probability}%`).join('\n')}

RECOMENDACIÓN: 
Consultar con profesional de salud para confirmación diagnóstica.
Este reporte es orientativo y NO constituye diagnóstico médico definitivo.
        `.trim();
        
        navigator.clipboard.writeText(summary).then(() => {
            addDoctorMessage("Resumen copiado al portapapeles");
        }).catch(() => {
            addDoctorMessage("Error al copiar. Intenta exportar JSON.");
        });
    }
    // Función global para que el botón HTML la encuentre
    window.printPrescription = function() {
        // Opcional: Lanzar confeti también al hacer clic en imprimir
        lanzarCelebracion(); 
        // Un pequeño retraso para ver el confeti antes de que salga el diálogo de impresión
        setTimeout(() => {
            const product = doctorState.hypotheses[0];
            const user = doctorState.userData;
            const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
            
            // Creamos una ventana nueva para imprimir
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receta Médica - Farmacia PO'S</title>
                <style>
                    body {
                        font-family: 'Times New Roman', serif;
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                        color: #000;
                    }
                    .header {
                        border-bottom: 2px solid #0056b3;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .logo-text h1 { margin: 0; color: #0056b3; font-size: 24px; }
                    .logo-text p { margin: 5px 0 0; color: #666; font-size: 12px; }
                    
                    .patient-info {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 14px;
                    }
                    
                    .rx-body {
                        min-height: 400px;
                        padding: 20px 0;
                    }
                    
                    .rx-symbol {
                        font-size: 40px;
                        font-weight: bold;
                        font-family: sans-serif;
                        margin-bottom: 20px;
                    }
                    
                    .medication {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    
                    .instructions {
                        font-size: 16px;
                        margin-bottom: 30px;
                    }
                    
                    .footer {
                        margin-top: 50px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                    }
                    
                    .doctor-signature {
                        text-align: center;
                        width: 250px;
                        border-top: 1px solid black;
                        padding-top: 10px;
                    }
                    
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-text">
                        <h1>Farmacia PO'S</h1>
                        <p>Dr. Yoshi Virtual | Medicina General</p>
                        <p>Av. Siempre Viva 742, CDMX | Tel: 55-1234-5678</p>
                    </div>
                    <div style="font-size: 40px;">⚕️</div>
                </div>

                <div class="patient-info">
                    <div>
                        <strong>Paciente:</strong> ${user.name || '___________________________________'}<br><br>
                        <strong>Edad:</strong> ${user.ageNumeric || '__'} años &nbsp;&nbsp; 
                        <strong>Peso:</strong> ${user.weight || '__'} kg
                    </div>
                    <div style="text-align: right;">
                        <strong>Fecha:</strong> ${date}<br><br>
                        <strong>Folio:</strong> ${doctorState.sessionId.substr(-6).toUpperCase()}
                    </div>
                </div>

                <div class="rx-body">
                    <div class="rx-symbol">Rp.</div>
                    
                    <div class="medication">
                        1. ${product.condition}
                    </div>
                    <div class="instructions">
                        ${product.description}
                    </div>
                    
                    <p style="margin-top: 20px; color: #666; font-style: italic;">
                        (Espacio para indicaciones adicionales del médico)
                    </p>
                    <div style="border-bottom: 1px dashed #ccc; margin: 30px 0;"></div>
                    <div style="border-bottom: 1px dashed #ccc; margin: 30px 0;"></div>
                </div>

                <div class="footer">
                    <div style="font-size: 10px; color: #999; max-width: 300px;">
                        Esta receta fue generada por un asistente virtual como sugerencia. 
                        Requiere validación y firma de un médico titulado para ser válida.
                    </div>
                    
                    <div class="doctor-signature">
                        <strong>Firma del Médico</strong><br>
                        <span style="font-size: 12px">Cédula Prof: ________________</span>
                    </div>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
        }, 500);
    };
    console.log('Asistente Virtual BHR v3.2 FIXED - Sistema Cargado');
    console.log('Motor de Inferencia Probabilística Activo');
    console.log('Preguntas Adaptativas Tipo Akinator Habilitadas');
    console.log('Listo para Asistencia Médica Inteligente');

});

// ==========================================
// FUNCIÓN PARA EFECTO DE CONFETI
// Pega esto al final de doctor-virtual.js
// ==========================================
function lanzarCelebracion() {
    // Lanza confeti desde la izquierda
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6, x: 0.1 }, // Desde abajo a la izquierda
        colors: ['#FFD700', '#FF4500', '#00BFFF', '#32CD32'] // Colores festivos
    });

    // Lanza confeti desde la derecha poco después
    setTimeout(() => {
         confetti({
             particleCount: 100,
             spread: 70,
             origin: { y: 0.6, x: 0.9 }, // Desde abajo a la derecha
             colors: ['#FFD700', '#FF4500', '#00BFFF', '#32CD32']
         });
    }, 250);
}
