// ═══════════════════════════════════════════════════════════════
// TUTORIAL HIGHLIGHTER - Visual spotlight for UI elements
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.02 | Unity AI Lab
//
// Creates visual highlights to guide players to UI elements during
// the tutorial. Uses a dark overlay with cutouts and pulsing effects.
// ═══════════════════════════════════════════════════════════════

const TutorialHighlighter = {
    // Currently highlighted elements
    activeHighlights: new Map(),

    // The dark overlay element
    overlay: null,

    // Tooltip element for instructions
    tooltip: null,

    // Is the system initialized?
    initialized: false,

    // ═══════════════════════════════════════════════════════════════
    //  WAKE UP THE SPOTLIGHT - Initialize the highlighter
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this.initialized) return;

        this.createStyles();
        this.createOverlay();
        this.createTooltip();
        this.initialized = true;

        console.log('🔦 TutorialHighlighter initialized - ready to guide the lost souls');
    },

    // ═══════════════════════════════════════════════════════════════
    //  CREATE THE DARKNESS - Build overlay element
    // ═══════════════════════════════════════════════════════════════
    createOverlay() {
        if (this.overlay) return;

        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-highlight-overlay';
        this.overlay.className = 'tutorial-overlay';
        document.body.appendChild(this.overlay);
    },

    // ═══════════════════════════════════════════════════════════════
    //  CREATE THE HELPFUL ARROW - Build tooltip element
    // ═══════════════════════════════════════════════════════════════
    createTooltip() {
        if (this.tooltip) return;

        this.tooltip = document.createElement('div');
        this.tooltip.id = 'tutorial-highlight-tooltip';
        this.tooltip.className = 'tutorial-tooltip';
        this.tooltip.innerHTML = `
            <div class="tutorial-tooltip-arrow"></div>
            <div class="tutorial-tooltip-content"></div>
        `;
        document.body.appendChild(this.tooltip);
    },

    // ═══════════════════════════════════════════════════════════════
    //  INJECT THE STYLES - Add CSS for highlights
    // ═══════════════════════════════════════════════════════════════
    createStyles() {
        if (document.getElementById('tutorial-highlighter-styles')) return;

        const style = document.createElement('style');
        style.id = 'tutorial-highlighter-styles';
        style.textContent = `
            /* Dark overlay that covers the screen */
            .tutorial-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.75);
                z-index: 99998;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .tutorial-overlay.active {
                opacity: 1;
            }

            /* The spotlight cutout effect on highlighted elements */
            .tutorial-spotlight {
                position: relative;
                z-index: 99999 !important;
                pointer-events: auto !important;
            }

            /* Pulsing glow ring around highlighted element */
            .tutorial-spotlight::before {
                content: '';
                position: absolute;
                top: -8px;
                left: -8px;
                right: -8px;
                bottom: -8px;
                border: 3px solid #ffd700;
                border-radius: 8px;
                box-shadow:
                    0 0 20px rgba(255, 215, 0, 0.6),
                    0 0 40px rgba(255, 215, 0, 0.4),
                    inset 0 0 20px rgba(255, 215, 0, 0.2);
                animation: tutorial-pulse 1.5s ease-in-out infinite;
                pointer-events: none;
                z-index: -1;
            }

            /* Pulse animation */
            @keyframes tutorial-pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                    box-shadow:
                        0 0 20px rgba(255, 215, 0, 0.6),
                        0 0 40px rgba(255, 215, 0, 0.4);
                }
                50% {
                    transform: scale(1.02);
                    opacity: 0.8;
                    box-shadow:
                        0 0 30px rgba(255, 215, 0, 0.8),
                        0 0 60px rgba(255, 215, 0, 0.5);
                }
            }

            /* Tooltip styling */
            .tutorial-tooltip {
                position: fixed;
                z-index: 100000;
                background: linear-gradient(135deg, #2a3a2a 0%, #1a2a1a 100%);
                border: 2px solid #ffd700;
                border-radius: 8px;
                padding: 12px 16px;
                max-width: 280px;
                box-shadow:
                    0 4px 20px rgba(0, 0, 0, 0.5),
                    0 0 30px rgba(255, 215, 0, 0.3);
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
            }

            .tutorial-tooltip.active {
                opacity: 1;
                transform: translateY(0);
            }

            .tutorial-tooltip-content {
                color: #f0f0f0;
                font-size: 14px;
                line-height: 1.5;
            }

            .tutorial-tooltip-content strong {
                color: #ffd700;
            }

            .tutorial-tooltip-content kbd {
                background: #1a1a1a;
                border: 1px solid #555;
                border-radius: 4px;
                padding: 2px 8px;
                font-family: monospace;
                font-size: 13px;
                color: #ff9800;
                margin: 0 2px;
            }

            /* Arrow pointing to element */
            .tutorial-tooltip-arrow {
                position: absolute;
                width: 0;
                height: 0;
                border: 10px solid transparent;
            }

            .tutorial-tooltip.arrow-top .tutorial-tooltip-arrow {
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                border-bottom-color: #ffd700;
            }

            .tutorial-tooltip.arrow-bottom .tutorial-tooltip-arrow {
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border-top-color: #ffd700;
            }

            .tutorial-tooltip.arrow-left .tutorial-tooltip-arrow {
                right: 100%;
                top: 50%;
                transform: translateY(-50%);
                border-right-color: #ffd700;
            }

            .tutorial-tooltip.arrow-right .tutorial-tooltip-arrow {
                left: 100%;
                top: 50%;
                transform: translateY(-50%);
                border-left-color: #ffd700;
            }

            /* Click instruction animation */
            .tutorial-click-hint {
                display: inline-block;
                animation: tutorial-bounce 0.6s ease infinite;
            }

            @keyframes tutorial-bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }
        `;
        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════
    //  SHINE THE LIGHT - Highlight an element
    // ═══════════════════════════════════════════════════════════════
    highlight(selector, options = {}) {
        if (!this.initialized) this.init();

        const {
            message = null,          // Tooltip message
            position = 'auto',       // Tooltip position: auto, top, bottom, left, right
            showOverlay = true,      // Show dark overlay
            duration = 0,            // Auto-remove after ms (0 = manual)
            pulseOnly = false,       // Just pulse, no overlay
            onClick = null           // Callback when element is clicked
        } = options;

        // Find the element
        const element = this.findElement(selector);
        if (!element) {
            console.warn(`🔦 TutorialHighlighter: Element not found: ${selector}`);
            return false;
        }

        console.log(`🔦 Highlighting: ${selector}`, options);

        // Store the highlight
        this.activeHighlights.set(selector, { element, options });

        // Add spotlight class to element
        element.classList.add('tutorial-spotlight');

        // Show overlay if requested
        if (showOverlay && !pulseOnly && this.overlay) {
            this.overlay.classList.add('active');
        }

        // Show tooltip with message
        if (message && this.tooltip) {
            this.showTooltip(element, message, position);
        }

        // Setup click handler
        if (onClick) {
            const clickHandler = (e) => {
                onClick(e);
                element.removeEventListener('click', clickHandler);
            };
            element.addEventListener('click', clickHandler);
        }

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeHighlight(selector);
            }, duration);
        }

        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    //  FIND THE THING - Locate element by various selectors
    // ═══════════════════════════════════════════════════════════════
    findElement(selector) {
        // Try direct ID
        let element = document.getElementById(selector);
        if (element) return element;

        // If selector already looks like a CSS selector, try it directly first
        if (selector.startsWith('[') || selector.startsWith('.') || selector.startsWith('#')) {
            try {
                element = document.querySelector(selector);
                if (element) return element;
            } catch (e) {
                // Invalid selector, continue with other methods
            }
        }

        // Try data-panel attribute (for action bar buttons)
        // Skip if selector already contains brackets to avoid double-wrapping
        if (!selector.includes('[')) {
            element = document.querySelector(`[data-panel="${selector}"]`);
            if (element) return element;

            // Try data-action attribute
            element = document.querySelector(`[data-action="${selector}"]`);
            if (element) return element;
        }

        // Try button with specific text
        if (selector.startsWith('button:')) {
            const buttonText = selector.replace('button:', '');
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
                if (btn.textContent.includes(buttonText)) return btn;
            }
        }

        // Try CSS selector
        element = document.querySelector(selector);
        if (element) return element;

        // Special handling for common tutorial targets
        const specialSelectors = {
            'people-button': '[data-panel="people-panel"]',
            'people-panel-button': '[data-panel="people-panel"]',
            'market-button': '[data-panel="market-panel"]',
            'inventory-button': '[data-panel="inventory-panel"]',
            'travel-button': '[data-panel="travel-panel"]',
            'quest-button': '[data-panel="quest-overlay"]',
            'pause-button': '#pause-btn, .pause-button, [data-action="pause"]',
            'speed-control': '#speed-control, .speed-selector, .time-speed',
        };

        if (specialSelectors[selector]) {
            element = document.querySelector(specialSelectors[selector]);
            if (element) return element;
        }

        return null;
    },

    // ═══════════════════════════════════════════════════════════════
    //  SHOW THE HELPER TEXT - Position and display tooltip
    // ═══════════════════════════════════════════════════════════════
    showTooltip(element, message, preferredPosition = 'auto') {
        if (!this.tooltip) return;

        const content = this.tooltip.querySelector('.tutorial-tooltip-content');
        if (content) {
            content.innerHTML = message;
        }

        // Get element position
        const rect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        // Calculate best position
        let position = preferredPosition;
        if (position === 'auto') {
            // Prefer bottom, but check if there's room
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;

            if (spaceBelow > 150) position = 'bottom';
            else if (spaceAbove > 150) position = 'top';
            else if (spaceRight > 300) position = 'right';
            else if (spaceLeft > 300) position = 'left';
            else position = 'bottom'; // fallback
        }

        // Remove old arrow classes
        this.tooltip.classList.remove('arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');

        // Position the tooltip
        let left, top;
        const gap = 15;

        switch (position) {
            case 'top':
                left = rect.left + (rect.width / 2) - 140;
                top = rect.top - gap - 80;
                this.tooltip.classList.add('arrow-bottom');
                break;
            case 'bottom':
                left = rect.left + (rect.width / 2) - 140;
                top = rect.bottom + gap;
                this.tooltip.classList.add('arrow-top');
                break;
            case 'left':
                left = rect.left - 300 - gap;
                top = rect.top + (rect.height / 2) - 40;
                this.tooltip.classList.add('arrow-right');
                break;
            case 'right':
                left = rect.right + gap;
                top = rect.top + (rect.height / 2) - 40;
                this.tooltip.classList.add('arrow-left');
                break;
        }

        // Keep tooltip on screen
        left = Math.max(10, Math.min(left, window.innerWidth - 300));
        top = Math.max(10, Math.min(top, window.innerHeight - 100));

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        this.tooltip.classList.add('active');
    },

    // ═══════════════════════════════════════════════════════════════
    //  KILL THE LIGHT - Remove highlight from element
    // ═══════════════════════════════════════════════════════════════
    removeHighlight(selector) {
        const highlight = this.activeHighlights.get(selector);
        if (!highlight) {
            // Try to find and clean up anyway
            const element = this.findElement(selector);
            if (element) {
                element.classList.remove('tutorial-spotlight');
            }
            return;
        }

        const { element } = highlight;
        element.classList.remove('tutorial-spotlight');
        this.activeHighlights.delete(selector);

        // Hide overlay if no more highlights
        if (this.activeHighlights.size === 0) {
            if (this.overlay) this.overlay.classList.remove('active');
            if (this.tooltip) this.tooltip.classList.remove('active');
        }

        console.log(`🔦 Removed highlight: ${selector}`);
    },

    // ═══════════════════════════════════════════════════════════════
    //  LIGHTS OUT - Remove all highlights
    // ═══════════════════════════════════════════════════════════════
    clearAll() {
        for (const [selector, highlight] of this.activeHighlights) {
            highlight.element.classList.remove('tutorial-spotlight');
        }
        this.activeHighlights.clear();

        if (this.overlay) this.overlay.classList.remove('active');
        if (this.tooltip) this.tooltip.classList.remove('active');

        console.log('🔦 All highlights cleared');
    },

    // ═══════════════════════════════════════════════════════════════
    //  SEQUENCE HIGHLIGHTS - Show multiple highlights in order
    // ═══════════════════════════════════════════════════════════════
    async highlightSequence(steps, options = {}) {
        const { delayBetween = 500 } = options;

        for (const step of steps) {
            this.clearAll();
            await new Promise(resolve => setTimeout(resolve, 100));

            this.highlight(step.selector, {
                message: step.message,
                position: step.position,
                ...step.options
            });

            if (step.waitForClick) {
                await new Promise(resolve => {
                    const element = this.findElement(step.selector);
                    if (element) {
                        const handler = () => {
                            element.removeEventListener('click', handler);
                            resolve();
                        };
                        element.addEventListener('click', handler);
                    } else {
                        resolve();
                    }
                });
            } else if (step.duration) {
                await new Promise(resolve => setTimeout(resolve, step.duration));
            }
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TutorialHighlighter.init());
} else {
    TutorialHighlighter.init();
}

// Global access
if (typeof window !== 'undefined') {
    window.TutorialHighlighter = TutorialHighlighter;
}

console.log('🔦 TutorialHighlighter loaded - ready to illuminate the path');
