// ═══════════════════════════════════════════════════════════════
// DEBOOGER SYSTEM - opt-in debugging for dark souls of code
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// disabled by default for performance, enable when you need to suffer

const DeboogerSystem = {
    enabled: false,  // NOW respects GameConfig - check on init
    maxEntries: 500, // prevent memory bloat like my todo list at 3am
    _initialized: false,
    _originalLog: null,
    _originalWarn: null,
    _originalError: null,

    // wake the debooger from its slumber - but only if config allows
    init() {
        // GameConfig is god here - if it says no, we stay dead
        var deboogerBtn = document.getElementById('toggle-debooger-console');
        var deboogerPanel = document.getElementById('debooger-console');

        if (typeof GameConfig !== 'undefined' && GameConfig.debooger && GameConfig.debooger.enabled === true) {
            this.enabled = true;
            this.setupConsoleCapture();
            // reveal the forbidden button to the chosen ones
            if (deboogerBtn) deboogerBtn.style.display = 'block';
            console.log('🐛 Debooger system enabled - Super Hacker mode!');
        } else {
            this.enabled = false;
            // bury the evidence - production builds see nothing
            if (deboogerBtn) deboogerBtn.style.display = 'none';
            if (deboogerPanel) deboogerPanel.style.display = 'none';
            console.log('🔒 Debooger system DISABLED by config');
        }
    },

    // try to enable manually - but the config is absolute law
    enable() {
        // config vetos everything - if it says no, you're fucked
        if (typeof GameConfig !== 'undefined' && GameConfig.debooger && GameConfig.debooger.enabled === false) {
            console.log('🔒 Cannot enable - GameConfig.debooger.enabled = false is ABSOLUTE');
            return;
        }
        this.enabled = true;
        this.setupConsoleCapture();
        console.log('🐛 Debooger system manually enabled');
    },

    // Disable Debooger
    disable() {
        this.enabled = false;
        if (this._originalLog) {
            console.log = this._originalLog;
            console.warn = this._originalWarn;
            console.error = this._originalError;
        }
        // purge the console logs before they consume all memory
        const contentEl = document.getElementById('debooger-console-content');
        if (contentEl) {
            contentEl.innerHTML = '';
        }
        console.log('🐛 Debooger system disabled');
    },

    // hijack console.log and force it to spill its guts here
    setupConsoleCapture() {
        if (this._initialized) return;

        const deboogerConsoleContent = () => document.getElementById('debooger-console-content');

        const addToDeboogerConsole = (type, args) => {
            if (!this.enabled) return;
            const contentEl = deboogerConsoleContent();
            if (!contentEl) return;

            const timestamp = new Date().toLocaleTimeString();
            const colors = { log: '#0f0', warn: '#ff0', error: '#f00', info: '#0ff' };
            const color = colors[type] || '#0f0';
            const message = Array.from(args).map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            const entry = document.createElement('div');
            entry.style.color = color;
            entry.style.marginBottom = '3px';
            entry.innerHTML = `<span style="color: #666;">[${timestamp}]</span> ${message}`;
            contentEl.appendChild(entry);
            contentEl.scrollTop = contentEl.scrollHeight;

            while (contentEl.children.length > this.maxEntries) {
                contentEl.removeChild(contentEl.firstChild);
            }
        };

        // stash the originals so we can bring them back from the dead later
        this._originalLog = console.log;
        this._originalWarn = console.warn;
        this._originalError = console.error;

        console.log = (...args) => { this._originalLog.apply(console, args); addToDeboogerConsole('log', args); };
        console.warn = (...args) => { this._originalWarn.apply(console, args); addToDeboogerConsole('warn', args); };
        console.error = (...args) => { this._originalError.apply(console, args); addToDeboogerConsole('error', args); };

        this._initialized = true;
    }
};

// throw it into the global void for everyone to see
window.DeboogerSystem = DeboogerSystem;

// register with Bootstrap - only if config enables it
if (typeof GameConfig !== 'undefined' && GameConfig.debooger?.enabled === true) {
    Bootstrap.register('DeboogerSystem', () => DeboogerSystem.init(), {
        dependencies: ['GameConfig'],
        priority: 200,  // late init, debug tools
        severity: 'optional'
    });
    console.log('🐛 Debooger System registered with Bootstrap');
} else {
    console.log('🔒 Debooger System DISABLED by config - not registering');
}
