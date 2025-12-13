// ═══════════════════════════════════════════════════════════════
// UI POLISH SYSTEM - smooth animations and transitions
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const UIPolishSystem = {
    // UI settings
    settings: {
        animationsEnabled: true,
        hoverEffectsEnabled: true,
        transitionsEnabled: true,
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium', // 'small', 'medium', 'large'
        theme: 'default' // 'default', 'dark', 'high-contrast'
    },
    
    // UI state tracking
    activeTransitions: [],
    tooltipElements: [],
    notificationQueue: [],
    
    // awaken the illusion - make these pixels dance
    init() {
        this.loadSettings();
        this.setupGlobalStyles();
        this.setupEventListeners();
        this.setupTooltipSystem();
        this.setupNotificationSystem();
        console.log('UI polish system initialized');
    },
    
    // Load settings from localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('tradingGameUIPolishSettings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                // silent fallback - corrupt data just means we use defaults
                localStorage.removeItem('tradingGameUIPolishSettings');
            }
        }
        this.applySettings();
    },
    
    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('tradingGameUIPolishSettings', JSON.stringify(this.settings));
    },
    
    // Apply settings to the UI
    applySettings() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.documentElement.setAttribute('data-font-size', this.settings.fontSize);
        document.documentElement.setAttribute('data-reduced-motion', this.settings.reducedMotion);
        document.documentElement.setAttribute('data-high-contrast', this.settings.highContrast);
    },
    
    // paint the void with style - inject our aesthetic poison
    setupGlobalStyles() {
        const style = document.createElement('style');
        style.id = 'ui-polish-styles';
        style.textContent = `
            /* Base transition styles */
            * {
                transition-property: none !important;
            }
            
            [data-transitions-enabled="true"] * {
                transition-property: background-color, color, border-color, transform, opacity, box-shadow, filter !important;
                transition-duration: var(--transition-duration, 0.2s) !important;
                transition-timing-function: var(--transition-easing, ease-in-out) !important;
            }
            
            /* Reduced motion styles */
            [data-reduced-motion="true"] * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            /* High contrast styles */
            [data-high-contrast="true"] {
                filter: contrast(1.5);
            }
            
            [data-high-contrast="true"] button,
            [data-high-contrast="true"] .btn {
                border: 2px solid currentColor !important;
            }
            
            /* Font size styles */
            [data-font-size="small"] {
                font-size: 14px;
            }
            
            [data-font-size="medium"] {
                font-size: 16px;
            }
            
            [data-font-size="large"] {
                font-size: 18px;
            }

            /* Panel transition styles */
            .panel-transition {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .panel-enter {
                opacity: 0;
                transform: translateY(20px);
            }
            
            .panel-enter-active {
                opacity: 1;
                transform: translateY(0);
            }
            
            .panel-exit {
                opacity: 1;
                transform: translateY(0);
            }
            
            .panel-exit-active {
                opacity: 0;
                transform: translateY(-20px);
            }
            
            /* Tooltip styles */
            .tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                pointer-events: none;
                z-index: 800; /* Z-INDEX STANDARD: Tooltips */
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
                max-width: 200px;
                word-wrap: break-word;
            }
            
            .tooltip.show {
                opacity: 1;
            }
            
            .tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 5px solid transparent;
                border-top-color: rgba(0, 0, 0, 0.9);
            }
            
            /* Notification styles */
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 850; /* Z-INDEX STANDARD: Notifications */
                pointer-events: none;
            }
            
            .notification {
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                margin-bottom: 10px;
                min-width: 250px;
                max-width: 350px;
                pointer-events: auto;
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                background: rgba(76, 175, 80, 0.9);
            }
            
            .notification.error {
                background: rgba(244, 67, 54, 0.9);
            }
            
            .notification.warning {
                background: rgba(255, 152, 0, 0.9);
            }
            
            .notification.info {
                background: rgba(33, 150, 243, 0.9);
            }
            
            /* Progress bar styles */
            .progress-bar {
                position: relative;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                overflow: hidden;
            }
            
            .progress-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #45a049);
                border-radius: 10px;
                transition: width 0.3s ease-in-out;
                position: relative;
                overflow: hidden;
            }
            
            .progress-bar-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                animation: progress-shine 2s infinite;
            }
            
            @keyframes progress-shine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            /* Icon animation styles */
            .icon-bounce {
                animation: bounce 0.5s ease-in-out;
            }
            
            .icon-spin {
                animation: spin 1s linear infinite;
            }
            
            .icon-pulse {
                animation: pulse 1s ease-in-out infinite;
            }
            
            .icon-shake {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            /* Text scroll styles */
            .text-scroll {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            
            .text-scroll-container {
                position: relative;
                overflow: hidden;
            }
            
            .text-scroll-content {
                display: inline-block;
                animation: scroll-text 10s linear infinite;
            }
            
            @keyframes scroll-text {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
            
            /* Theme styles */
            [data-theme="dark"] {
                background-color: #1a1a1a;
                color: #e0e0e0;
            }
            
            [data-theme="dark"] .panel {
                background-color: #2d2d2d;
                border-color: #444;
            }
            
            [data-theme="high-contrast"] {
                background-color: #000;
                color: #fff;
            }
            
            [data-theme="high-contrast"] .panel {
                background-color: #111;
                border: 2px solid #fff;
            }
            
            [data-theme="high-contrast"] button,
            [data-theme="high-contrast"] .btn {
                background-color: #000;
                color: #fff;
                border: 2px solid #fff;
            }
        `;
        document.head.appendChild(style);
    },
    
    // bind the handlers - let the interface respond to every desperate touch
    setupEventListeners() {
        // Enable transitions based on settings
        document.documentElement.setAttribute('data-transitions-enabled', this.settings.transitionsEnabled);

        // Setup button hover effects
        this.setupButtonEffects();

        // Setup panel transitions
        this.setupPanelTransitions();

        // Setup form input effects
        this.setupInputEffects();

        // Setup keyboard navigation enhancements
        this.setupKeyboardNavigation();
    },
    
    // Setup button hover effects - DISABLED
    setupButtonEffects() {
        // No button hover effects - keeping it clean
    },

    onButtonHover(event, isEntering) {
        // Disabled - no hover effects
    },

    onButtonPress(event, isPressed) {
        // Disabled - no press effects
    },

    onButtonFocus(event, isFocused) {
        // Disabled - no focus effects
    },
    
    // choreograph the reveal - panels materialize from shadow
    setupPanelTransitions() {
        const panels = document.querySelectorAll('.panel, .modal, .popup');
        
        panels.forEach(panel => {
            panel.classList.add('panel-transition');
            
            // Add enter/exit animations
            this.observePanel(panel);
        });
    },
    
    observePanel(panel) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isVisible = panel.style.display !== 'none';
                    
                    if (isVisible && !panel.classList.contains('panel-enter-active')) {
                        this.animatePanelEnter(panel);
                    } else if (!isVisible && !panel.classList.contains('panel-exit-active')) {
                        this.animatePanelExit(panel);
                    }
                }
            });
        });
        
        observer.observe(panel, { attributes: true });
    },
    
    animatePanelEnter(panel) {
        if (!this.settings.transitionsEnabled) return;
        
        panel.classList.add('panel-enter');
        panel.classList.add('panel-enter-active');
        
        TimerManager.setTimeout(() => {
            panel.classList.remove('panel-enter');
            panel.classList.remove('panel-enter-active');
        }, 300);
    },
    
    animatePanelExit(panel) {
        if (!this.settings.transitionsEnabled) return;
        
        panel.classList.add('panel-exit');
        panel.classList.add('panel-exit-active');
        
        TimerManager.setTimeout(() => {
            panel.classList.remove('panel-exit');
            panel.classList.remove('panel-exit-active');
        }, 300);
    },
    
    // watch the input fields - they hunger for attention
    setupInputEffects() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            EventManager.addEventListener(input, 'focus', (e) => this.onInputFocus(e, true));
            EventManager.addEventListener(input, 'blur', (e) => this.onInputFocus(e, false));
        });
    },
    
    onInputFocus(event, isFocused) {
        const input = event.target;
        
        if (isFocused) {
            input.style.borderColor = '#4CAF50';
            input.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        } else {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }
    },
    
    // arm the keyboard - every key a potential escape route
    setupKeyboardNavigation() {
        EventManager.addEventListener(document, 'keydown', (e) => {
            // Enhanced tab navigation
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
            
            // Escape key handling
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });
    },
    
    handleTabNavigation(event) {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    },
    
    handleEscapeKey(event) {
        // Check if ModalSystem has an active modal - let it handle ESC
        if (typeof ModalSystem !== 'undefined' && ModalSystem.activeModals && ModalSystem.activeModals.size > 0) {
            return; // Modal's own ESC handler will deal with this
        }

        // NEVER close character creation or game setup - that sends you to the void
        const charCreation = document.getElementById('character-creation-overlay');
        const gameSetup = document.getElementById('game-setup-panel');

        if (charCreation && (charCreation.classList.contains('active') || charCreation.style.display === 'flex')) {
            return; // Don't touch it, let the player finish creating their character
        }
        if (gameSetup && !gameSetup.classList.contains('hidden') && gameSetup.style.display !== 'none') {
            return; // Don't touch game setup either!
        }

        // banish the visible windows back into the dark (except protected ones)
        const openPanels = document.querySelectorAll('.panel[style*="display: block"], .modal[style*="display: block"]');

        openPanels.forEach(panel => {
            // Skip character creation and game setup even if found via selector
            if (panel.id === 'character-creation-overlay' || panel.id === 'game-setup-panel') return;
            panel.style.display = 'none';
        });
    },

    // panel transition methods - the darkness fades in and out
    fadeIn(element, duration = 300) {
        if (!element) return;
        element.style.opacity = '0';
        element.style.display = '';
        element.style.transition = `opacity ${duration}ms ease-in-out`;

        // force reflow then fade in
        void element.offsetWidth;
        element.style.opacity = '1';

        // clean up transition after complete
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
    },

    fadeOut(element, duration = 300) {
        if (!element) return;
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';

        // remove from sight once the shadows consume it
        setTimeout(() => {
            element.style.display = 'none';
            element.style.transition = '';
            element.style.opacity = '';
        }, duration);
    },

    // tooltips - DISABLED: Use TooltipSystem from tooltip-system.js instead
    // This duplicate system was showing raw JSON instead of parsed content
    setupTooltipSystem() {
        // DISABLED - TooltipSystem handles all tooltips properly with JSON parsing
        // The old implementation here just displayed data-tooltip as raw text,
        // which caused JSON like {"title":"Zoom In","desc":"..."} to appear
        console.log('🔧 UIPolish tooltip system disabled - using TooltipSystem instead');
    },

    setupTooltipTriggers() {
        // DISABLED - TooltipSystem handles this
    },

    showTooltip(event) {
        // DISABLED - TooltipSystem handles this with proper JSON parsing
    },

    hideTooltip(event) {
        // DISABLED - TooltipSystem handles this
    },
    
    // notifications - messages that intrude upon your consciousness
    setupNotificationSystem() {
        // Create notification container
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    },
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        // Trigger animation
        TimerManager.setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-hide after duration
        TimerManager.setTimeout(() => {
            notification.classList.remove('show');
            TimerManager.setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    },
    
    // Progress bar animation
    animateProgressBar(progressBar, value, maxValue = 100) {
        if (!progressBar) return;
        
        const fillElement = progressBar.querySelector('.progress-bar-fill') || 
                           progressBar.querySelector('[role="progressbar"]');
        
        if (!fillElement) return;
        
        const percentage = Math.min((value / maxValue) * 100, 100);
        fillElement.style.width = `${percentage}%`;
        fillElement.setAttribute('aria-valuenow', value);
    },
    
    // Text scrolling
    setupTextScroll(element, text) {
        if (!element) return;
        
        element.classList.add('text-scroll-container');
        
        const content = document.createElement('div');
        content.className = 'text-scroll-content';
        content.textContent = text;
        
        element.innerHTML = '';
        element.appendChild(content);
    },
    
    // Icon animations
    animateIcon(iconElement, animationType, duration = 1000) {
        if (!iconElement || !this.settings.animationsEnabled) return;

        // exorcise all previous animations from this icon's soul
        iconElement.classList.remove('icon-bounce', 'icon-spin', 'icon-pulse', 'icon-shake');

        // possess it with new dark energy
        iconElement.classList.add(`icon-${animationType}`);

        // release the spirit when the ritual is complete
        setTimeout(() => {
            iconElement.classList.remove(`icon-${animationType}`);
        }, duration);
    },
    
    // Cross-fade between elements
    crossFade(outElement, inElement, duration = 300) {
        if (!this.settings.transitionsEnabled) {
            outElement.style.display = 'none';
            inElement.style.display = 'block';
            return;
        }
        
        // Fade out
        outElement.style.transition = `opacity ${duration / 1000}s ease-in-out`;
        outElement.style.opacity = '0';
        
        TimerManager.setTimeout(() => {
            outElement.style.display = 'none';
            inElement.style.display = 'block';
            inElement.style.opacity = '0';
            
            // Fade in
            inElement.style.transition = `opacity ${duration / 1000}s ease-in-out`;
            TimerManager.setTimeout(() => {
                inElement.style.opacity = '1';
            }, 10);
        }, duration);
    },
    
    // Highlight element
    highlightElement(element, options = {}) {
        if (!element) return;
        
        const defaults = {
            color: '#FFD700',
            duration: 1000,
            pulse: true
        };
        
        const config = { ...defaults, ...options };
        
        const originalBoxShadow = element.style.boxShadow;
        const originalTransition = element.style.transition;
        
        element.style.transition = `box-shadow ${config.duration / 1000}s ease-in-out`;
        element.style.boxShadow = `0 0 20px ${config.color}`;
        
        if (config.pulse) {
            this.animateIcon(element, 'pulse', config.duration);
        }
        
        TimerManager.setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
            element.style.transition = originalTransition;
        }, config.duration);
    },
    
    // Settings management
    setTheme(theme) {
        this.settings.theme = theme;
        this.applySettings();
        this.saveSettings();
    },
    
    setFontSize(size) {
        this.settings.fontSize = size;
        this.applySettings();
        this.saveSettings();
    },
    
    toggleAnimations() {
        this.settings.animationsEnabled = !this.settings.animationsEnabled;
        document.documentElement.setAttribute('data-transitions-enabled', this.settings.transitionsEnabled);
        this.saveSettings();
    },
    
    toggleHoverEffects() {
        this.settings.hoverEffectsEnabled = !this.settings.hoverEffectsEnabled;
        this.saveSettings();
    },
    
    toggleTransitions() {
        this.settings.transitionsEnabled = !this.settings.transitionsEnabled;
        document.documentElement.setAttribute('data-transitions-enabled', this.settings.transitionsEnabled);
        this.saveSettings();
    },
    
    toggleReducedMotion() {
        this.settings.reducedMotion = !this.settings.reducedMotion;
        this.applySettings();
        this.saveSettings();
    },
    
    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        this.applySettings();
        this.saveSettings();
    },
    
    // Dynamic style updates
    updateVariable(variable, value) {
        document.documentElement.style.setProperty(variable, value);
    },
    
    // Accessibility enhancements
    enhanceAccessibility() {
        // Add ARIA labels where missing
        this.addAriaLabels();
        
        // Improve keyboard navigation
        this.improveKeyboardNavigation();
        
        // Add screen reader announcements
        this.setupScreenReaderAnnouncements();
    },
    
    addAriaLabels() {
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
    },
    
    improveKeyboardNavigation() {
        // Add focus indicators
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #4CAF50 !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    },
    
    setupScreenReaderAnnouncements() {
        // summon a voice for the screen readers - unseen but heard
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        
        this.screenReaderRegion = liveRegion;
    },
    
    announceToScreenReader(message) {
        if (this.screenReaderRegion) {
            this.screenReaderRegion.textContent = message;
            TimerManager.setTimeout(() => {
                this.screenReaderRegion.textContent = '';
            }, 1000);
        }
    },
    
    // Cleanup
    cleanup() {
        // Remove event listeners
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            button.removeEventListener('mouseenter', this.onButtonHover);
            button.removeEventListener('mouseleave', this.onButtonHover);
            button.removeEventListener('mousedown', this.onButtonPress);
            button.removeEventListener('mouseup', this.onButtonPress);
            button.removeEventListener('focus', this.onButtonFocus);
            button.removeEventListener('blur', this.onButtonFocus);
        });
        
        // Remove tooltip
        if (this.tooltipContainer) {
            this.tooltipContainer.remove();
        }
        
        // Remove notification container
        if (this.notificationContainer) {
            this.notificationContainer.remove();
        }
        
        // Remove styles
        const styles = document.getElementById('ui-polish-styles');
        if (styles) {
            styles.remove();
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIPolishSystem;
}