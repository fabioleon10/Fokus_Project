/**
 * Fokus - Modern Pomodoro Timer Application
 * Enhanced with ES6+ features, better organization, and improved UX
 */

class FokusTimer {
    constructor() {
        // DOM Elements
        this.html = document.documentElement;
        this.modeButtons = document.querySelectorAll('.app__mode-button');
        this.banner = document.querySelector('.app__image');
        this.title = document.querySelector('.app__title');
        this.startPauseBtn = document.querySelector('#start-pause');
        this.musicToggle = document.querySelector('#alternar-musica');
        this.startPauseText = document.querySelector('#start-pause span');
        this.startPauseIcon = document.querySelector('.app__start-icon');
        this.timerDisplay = document.querySelector('#timer');

        // Audio instances
        this.audio = {
            backgroundMusic: new Audio('./sons/luna-rise-part-one.mp3'),
            play: new Audio('./sons/play.wav'),
            pause: new Audio('./sons/pause.mp3'),
            finish: new Audio('./sons/beep.mp3')
        };

        // Timer state
        this.state = {
            currentTime: 1500, // 25 minutes in seconds
            intervalId: null,
            isRunning: false,
            currentMode: 'foco'
        };

        // Timer durations (in seconds)
        this.durations = {
            foco: 1500,          // 25 minutes
            'descanso-curto': 300,   // 5 minutes  
            'descanso-longo': 900    // 15 minutes
        };

        // Mode configurations
        this.modes = {
            foco: {
                title: 'Otimize sua produtividade,<br><strong class="app__title-strong">mergulhe no que importa.</strong>',
                image: 'foco.png'
            },
            'descanso-curto': {
                title: 'Que tal dar uma respirada? <strong class="app__title-strong">Faça uma pausa curta!</strong>',
                image: 'descanso-curto.png'
            },
            'descanso-longo': {
                title: 'Hora de voltar à superfície. <strong class="app__title-strong">Faça uma pausa longa.</strong>',
                image: 'descanso-longo.png'
            }
        };

        this.init();
    }

    init() {
        this.setupAudio();
        this.bindEvents();
        this.updateTimerDisplay();
        this.setMode('foco');
    }

    setupAudio() {
        this.audio.backgroundMusic.loop = true;
        this.audio.backgroundMusic.volume = 0.3;
        
        // Optimize audio loading
        Object.values(this.audio).forEach(audio => {
            audio.preload = 'auto';
        });
    }

    bindEvents() {
        // Mode buttons
        this.modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.target.dataset.contexto;
                this.setMode(mode);
            });
        });

        // Start/Pause button
        this.startPauseBtn.addEventListener('click', () => {
            this.toggleTimer();
        });

        // Music toggle
        this.musicToggle.addEventListener('change', (e) => {
            this.toggleBackgroundMusic(e.target.checked);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Visibility API for pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.isRunning) {
                this.pauseTimer();
            }
        });
    }

    handleKeyboard(e) {
        // Prevent shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.toggleTimer();
                break;
            case 'Digit1':
                this.setMode('foco');
                break;
            case 'Digit2':
                this.setMode('descanso-curto');
                break;
            case 'Digit3':
                this.setMode('descanso-longo');
                break;
            case 'KeyM':
                this.musicToggle.checked = !this.musicToggle.checked;
                this.toggleBackgroundMusic(this.musicToggle.checked);
                break;
        }
    }

    setMode(mode) {
        if (!this.modes[mode]) return;

        // Reset timer when switching modes
        if (this.state.isRunning) {
            this.pauseTimer();
        }

        this.state.currentMode = mode;
        this.state.currentTime = this.durations[mode];

        // Update UI
        this.updateModeButtons(mode);
        this.updateContext(mode);
        this.updateTimerDisplay();

        // Announce mode change for screen readers
        this.announceChange(`Modo ${mode.replace('-', ' ')} selecionado`);
    }

    updateModeButtons(activeMode) {
        this.modeButtons.forEach(button => {
            const isActive = button.dataset.contexto === activeMode;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive);
        });
    }

    updateContext(mode) {
        this.html.setAttribute('data-contexto', mode);
        
        const config = this.modes[mode];
        this.title.innerHTML = config.title;
        this.banner.src = `./imagens/${config.image}`;
        this.banner.alt = `Ilustração representando ${mode.replace('-', ' ')}`;
    }

    toggleTimer() {
        if (this.state.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.state.currentTime <= 0) {
            this.state.currentTime = this.durations[this.state.currentMode];
        }

        this.playSound('play');
        this.state.isRunning = true;
        this.state.intervalId = setInterval(() => this.countdown(), 1000);

        this.updateStartButton('pause');
        this.announceChange('Timer iniciado');
    }

    pauseTimer() {
        this.playSound('pause');
        this.state.isRunning = false;
        
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.state.intervalId = null;
        }

        this.updateStartButton('play');
        this.announceChange('Timer pausado');
    }

    countdown() {
        this.state.currentTime--;
        this.updateTimerDisplay();

        if (this.state.currentTime <= 0) {
            this.finishTimer();
        }
    }

    finishTimer() {
        this.pauseTimer();
        this.playSound('finish');
        
        // Modern notification instead of alert
        this.showNotification('Timer finalizado!', 'Tempo concluído. Que tal fazer uma pausa?');
        
        // Reset timer for next session
        this.state.currentTime = this.durations[this.state.currentMode];
        this.updateTimerDisplay();
        
        this.announceChange('Timer finalizado');
    }

    updateStartButton(state) {
        const isPlaying = state === 'pause';
        
        this.startPauseText.textContent = isPlaying ? 'Pausar' : 'Começar';
        this.startPauseIcon.src = `./imagens/${isPlaying ? 'pause' : 'play_arrow'}.png`;
        this.startPauseIcon.alt = isPlaying ? 'Pausar' : 'Iniciar';
        
        this.startPauseBtn.setAttribute('aria-label', 
            isPlaying ? 'Pausar timer' : 'Iniciar timer'
        );
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.state.currentTime / 60);
        const seconds = this.state.currentTime % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timerDisplay.textContent = formattedTime;
        
        // Update document title for browser tab
        document.title = `${formattedTime} - Fokus`;
        
        // Update progress in page visibility API
        if ('setAppBadge' in navigator) {
            navigator.setAppBadge(this.state.currentTime);
        }
    }

    toggleBackgroundMusic(enabled) {
        if (enabled) {
            this.audio.backgroundMusic.play().catch(e => {
                console.log('Audio autoplay prevented:', e);
            });
        } else {
            this.audio.backgroundMusic.pause();
        }
    }

    playSound(type) {
        if (this.audio[type]) {
            // Reset audio to beginning and play
            this.audio[type].currentTime = 0;
            this.audio[type].play().catch(e => {
                console.log('Sound play failed:', e);
            });
        }
    }

    showNotification(title, body) {
        // Check for notification permission
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, { 
                    body, 
                    icon: './imagens/favicon.ico',
                    tag: 'fokus-timer'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, { 
                            body, 
                            icon: './imagens/favicon.ico',
                            tag: 'fokus-timer'
                        });
                    }
                });
            }
        }
        
        // Fallback: show in-app notification
        this.showInAppNotification(title, body);
    }

    showInAppNotification(title, body) {
        // Create a modern in-app notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>${title}</h3>
                <p>${body}</p>
                <button class="notification-close" aria-label="Fechar notificação">×</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-button);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.8rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-content h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
                .notification-content p { margin: 0; font-size: 0.9rem; opacity: 0.9; }
                .notification-close { 
                    position: absolute; 
                    top: 5px; 
                    right: 10px; 
                    background: none; 
                    border: none; 
                    color: white; 
                    font-size: 1.2rem; 
                    cursor: pointer; 
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 5 seconds or when clicked
        const remove = () => notification.remove();
        notification.querySelector('.notification-close').addEventListener('click', remove);
        setTimeout(remove, 5000);
    }

    announceChange(message) {
        // Create or update screen reader announcement
        let announcer = document.querySelector('#sr-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = message;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FokusTimer();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}