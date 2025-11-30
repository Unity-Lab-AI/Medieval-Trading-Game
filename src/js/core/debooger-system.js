// ═══════════════════════════════════════════════════════════════
// 🐛 DEBOOGER SYSTEM - Opt-in deboogering for the dark souls of code 🖤
// ═══════════════════════════════════════════════════════════════
// disabled by default for performance, enable when you need to suffer 💀
// File Version: GameConfig.version.file | Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com

const DeboogerSystem = {
    enabled: true,  // 🔥 ON by default - for the Super Hacker achievement 🖤💀
    maxEntries: 500, // prevent memory bloat like my todo list 🦇
    _initialized: false,
    _originalLog: null,
    _originalWarn: null,
    _originalError: null,

    // 🖤 Initialize Debooger system - ON by default for Super Hacker achievement ⚰️
    init() {
        // always setup console capture - Debooger is on by default now 🦇
        this.setupConsoleCapture();
        console.log('🐛 Debooger system enabled by default - Super Hacker mode! 💀');
    },

    // 🔓 Enable Debooger manually 🗡️
    enable() {
        this.enabled = true;
        this.setupConsoleCapture();
        console.log('🐛 Debooger system manually enabled');
    },

    // 🔒 Disable Debooger 🌙
    disable() {
        this.enabled = false;
        if (this._originalLog) {
            console.log = this._originalLog;
            console.warn = this._originalWarn;
            console.error = this._originalError;
        }
        console.log('🐛 Debooger system disabled');
    },

    // 🎯 Setup console capture (only when enabled) 🔮
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

        // 💀 Store originals for restoration
        this._originalLog = console.log;
        this._originalWarn = console.warn;
        this._originalError = console.error;

        console.log = (...args) => { this._originalLog.apply(console, args); addToDeboogerConsole('log', args); };
        console.warn = (...args) => { this._originalWarn.apply(console, args); addToDeboogerConsole('warn', args); };
        console.error = (...args) => { this._originalError.apply(console, args); addToDeboogerConsole('error', args); };

        this._initialized = true;
    }
};

// 🌙 expose to global scope 🦇
window.DeboogerSystem = DeboogerSystem;

// 🖤 AUTO-INIT - Debooger system initializes itself on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DeboogerSystem.init();
    });
} else {
    // DOM already loaded, init now
    DeboogerSystem.init();
}

console.log('🐛 Debooger System loaded!');
