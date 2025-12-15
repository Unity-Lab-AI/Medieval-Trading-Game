// ═══════════════════════════════════════════════════════════════
// BROWSER COMPATIBILITY - taming the browser chaos
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const BrowserCompatibility = {
    // Browser detection
    browser: {
        name: '',
        version: 0,
        isIE: false,
        isEdge: false,
        isChrome: false,
        isFirefox: false,
        isSafari: false,
        isMobile: false,
        supportsPassive: false,
        supportsIntersection: false,
        supportsResizeObserver: false,
        supportsRequestIdle: false
    },
    
    // Feature detection
    features: {
        customEvents: false,
        localStorage: false,
        sessionStorage: false,
        webWorkers: false,
        webGL: false,
        canvas: false,
        audio: false,
        video: false,
        geolocation: false,
        notifications: false,
        fullscreen: false,
        clipboard: false,
        fileAPI: false,
        historyAPI: false
    },
    
    // Initialize browser compatibility
    init() {
        this.detectBrowser();
        this.detectFeatures();
        this.setupPolyfills();
        this.setupEventCompatibility();
        this.setupStorageCompatibility();
        this.setupCompatibilityFixes();
        console.log('Browser compatibility initialized:', this.browser.name, this.browser.version);
    },
    
    // Detect browser and version
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor || '';
        
        // Detect Internet Explorer
        if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident/') !== -1) {
            this.browser.isIE = true;
            this.browser.name = 'Internet Explorer';
            const match = userAgent.match(/(?:MSIE |Trident\/.*?rv:)(\d+\.?\d*)/i);
            this.browser.version = match ? parseFloat(match[1]) : 0;
        }
        // Detect Edge
        else if (userAgent.indexOf('Edge/') !== -1) {
            this.browser.isEdge = true;
            this.browser.name = 'Microsoft Edge';
            this.browser.version = parseFloat(userAgent.split('Edge/')[1]);
        }
        // Detect Chrome
        else if (userAgent.indexOf('Chrome/') !== -1 && vendor.indexOf('Google') === 0) {
            this.browser.isChrome = true;
            this.browser.name = 'Google Chrome';
            this.browser.version = parseFloat(userAgent.split('Chrome/')[1].split(' ')[0]);
        }
        // Detect Firefox
        else if (userAgent.indexOf('Firefox/') !== -1) {
            this.browser.isFirefox = true;
            this.browser.name = 'Mozilla Firefox';
            this.browser.version = parseFloat(userAgent.split('Firefox/')[1]);
        }
        // Detect Safari
        else if (userAgent.indexOf('Safari/') !== -1 && userAgent.indexOf('Chrome') === -1) {
            this.browser.isSafari = true;
            this.browser.name = 'Apple Safari';
            this.browser.version = parseFloat(userAgent.split('Safari/')[1].split(' ')[0]);
        }
        
        // Detect mobile
        this.browser.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        // Detect feature support
        this.browser.supportsPassive = this.detectPassiveEvents();
        this.browser.supportsIntersection = 'IntersectionObserver' in window;
        this.browser.supportsResizeObserver = 'ResizeObserver' in window;
        this.browser.supportsRequestIdle = 'requestIdleCallback' in window;
    },
    
    // Detect passive event support
    detectPassiveEvents() {
        let supportsPassive = false;
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    supportsPassive = true;
                }
            });
            window.addEventListener('testPassive', null, opts);
            window.removeEventListener('testPassive', null, opts);
        } catch (e) {}
        return supportsPassive;
    },
    
    // Detect browser features
    detectFeatures() {
        // Storage APIs
        this.features.localStorage = this.testLocalStorage();
        this.features.sessionStorage = this.testSessionStorage();
        
        // Web APIs
        this.features.webWorkers = typeof Worker !== 'undefined';
        this.features.webGL = this.testWebGL();
        this.features.canvas = this.testCanvas();
        this.features.audio = this.testAudio();
        this.features.video = this.testVideo();
        this.features.geolocation = 'geolocation' in navigator;
        this.features.notifications = 'Notification' in window;
        this.features.fullscreen = this.testFullscreen();
        this.features.clipboard = this.testClipboard();
        this.features.fileAPI = this.testFileAPI();
        this.features.historyAPI = 'history' in window && 'pushState' in window.history;
        
        // Event support
        this.features.customEvents = 'CustomEvent' in window;
    },
    
    // Test localStorage
    testLocalStorage() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Test sessionStorage
    testSessionStorage() {
        try {
            const testKey = '__test__';
            sessionStorage.setItem(testKey, testKey);
            sessionStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Test WebGL
    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    },
    
    // Test Canvas
    testCanvas() {
        try {
            const canvas = document.createElement('canvas');
            const hasContext = !!(canvas.getContext && canvas.getContext('2d'));
            // 🖤 Log failure for deboogering - canvas is critical for rendering 💀
            if (!hasContext) {
                console.warn('⚠️ Canvas 2D context not available - rendering may be limited');
            }
            return hasContext;
        } catch (e) {
            console.warn('⚠️ Canvas detection failed:', e.message);
            return false;
        }
    },
    
    // Test Audio
    testAudio() {
        try {
            return !!(document.createElement('audio').canPlayType);
        } catch (e) {
            return false;
        }
    },
    
    // Test Video
    testVideo() {
        try {
            return !!(document.createElement('video').canPlayType);
        } catch (e) {
            return false;
        }
    },
    
    // Test Fullscreen
    testFullscreen() {
        return !!(document.fullscreenEnabled || 
            document.webkitFullscreenEnabled || 
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled);
    },
    
    // Test Clipboard
    testClipboard() {
        return !!(navigator.clipboard || 
            document.execCommand ||
            window.clipboardData);
    },
    
    // Test File API
    testFileAPI() {
        return !!(window.File && 
            window.FileReader && 
            window.FileList && 
            window.Blob);
    },
    
    // Setup polyfills
    setupPolyfills() {
        // Polyfill for requestAnimationFrame
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = 
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    return window.setTimeout(callback, 1000 / 60);
                };
        }
        
        // Polyfill for cancelAnimationFrame
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = 
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.oCancelAnimationFrame ||
                window.msCancelAnimationFrame ||
                function(id) {
                    window.clearTimeout(id);
                };
        }
        
        // Polyfill for performance.now
        if (!window.performance || !window.performance.now) {
            window.performance = window.performance || {};
            const nowOffset = Date.now();
            window.performance.now = function() {
                return Date.now() - nowOffset;
            };
        }
        
        // Polyfill for CustomEvent
        if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
            window.CustomEvent = function(event, params) {
                params = params || { bubbles: false, cancelable: false, detail: null };
                const evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            };
        }
        
        // Polyfill for console methods in old browsers
        if (!window.console) {
            window.console = {
                log: function() {},
                warn: function() {},
                error: function() {},
                info: function() {}
            };
        }
    },
    
    // Setup event compatibility
    setupEventCompatibility() {
        // Standardize event names
        const eventMap = {
            'transitionend': this.browser.isIE ? 'msTransitionEnd' : 'transitionend',
            'animationend': this.browser.isIE ? 'msAnimationEnd' : 'animationend',
            'fullscreenchange': this.getFullscreenChangeEvent()
        };
        
        // Store event map for use by other systems
        this.eventMap = eventMap;
    },
    
    // Get fullscreen change event name
    getFullscreenChangeEvent() {
        if (document.fullscreenEnabled) return 'fullscreenchange';
        if (document.webkitFullscreenEnabled) return 'webkitfullscreenchange';
        if (document.mozFullScreenEnabled) return 'mozfullscreenchange';
        if (document.msFullscreenEnabled) return 'MSFullscreenChange';
        return 'fullscreenchange';
    },
    
    // Setup storage compatibility
    setupStorageCompatibility() {
        // 🖤 Fallback storage size limit (5MB like real localStorage) 💀
        const MAX_FALLBACK_SIZE = 5 * 1024 * 1024;

        // Helper to check storage size
        const getStorageSize = (data) => {
            let size = 0;
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    size += key.length + data[key].length;
                }
            }
            return size * 2; // UTF-16 = 2 bytes per char
        };

        // Fallback for localStorage
        if (!this.features.localStorage) {
            window.localStorage = {
                _data: {},
                setItem: function(id, val) {
                    const strVal = String(val);
                    // 🖤 Check size before adding 💀
                    const newSize = getStorageSize(this._data) + (id.length + strVal.length) * 2;
                    if (newSize > MAX_FALLBACK_SIZE) {
                        console.warn('🖤 Fallback localStorage full, cannot store:', id);
                        return;
                    }
                    this._data[id] = strVal;
                },
                getItem: function(id) {
                    return this._data.hasOwnProperty(id) ? this._data[id] : null;
                },
                removeItem: function(id) {
                    delete this._data[id];
                },
                clear: function() {
                    this._data = {};
                }
            };
        }

        // Fallback for sessionStorage
        if (!this.features.sessionStorage) {
            window.sessionStorage = {
                _data: {},
                setItem: function(id, val) {
                    const strVal = String(val);
                    // 🖤 Check size before adding 💀
                    const newSize = getStorageSize(this._data) + (id.length + strVal.length) * 2;
                    if (newSize > MAX_FALLBACK_SIZE) {
                        console.warn('🖤 Fallback sessionStorage full, cannot store:', id);
                        return;
                    }
                    this._data[id] = strVal;
                },
                getItem: function(id) {
                    return this._data.hasOwnProperty(id) ? this._data[id] : null;
                },
                removeItem: function(id) {
                    delete this._data[id];
                },
                clear: function() {
                    this._data = {};
                }
            };
        }
    },
    
    // Setup compatibility fixes
    setupCompatibilityFixes() {
        // Fix for IE console.log
        if (this.browser.isIE && window.console) {
            const originalLog = console.log;
            const originalError = console.error;
            console.log = function(message) {
                try {
                    originalLog.apply(console, arguments);
                } catch (e) {
                    // 🖤 Don't completely suppress - log to error stream if available 💀
                    if (originalError) {
                        try { originalError.call(console, '[IE console.log failed]', e.message); } catch (_) {}
                    }
                }
            };
        }
        
        // 🖤 Fix for iOS Safari scroll behavior - guard against duplicate listeners 💀
        if (this.browser.isSafari && this.browser.isMobile && !this._iOSTouchGuard) {
            this._iOSTouchGuard = true;
            document.addEventListener('touchmove', function(e) {
                if (e.scale !== 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        // Fix for Edge canvas rendering
        if (this.browser.isEdge) {
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(contextType) {
                const context = originalGetContext.call(this, contextType);
                if (contextType === '2d') {
                    // Add fix for Edge canvas rendering
                    context.originalFillRect = context.fillRect;
                    context.fillRect = function(x, y, width, height) {
                        this.originalFillRect(x, y, width, height);
                        this.stroke();
                    };
                }
                return context;
            };
        }
        
        // Fix for Firefox performance
        if (this.browser.isFirefox) {
            // Add fix for Firefox scrolling performance
            document.body.style.willChange = 'transform';
        }
    },
    
    // Get standardized event name
    getEventName(originalEvent) {
        return this.eventMap && this.eventMap[originalEvent] ? 
            this.eventMap[originalEvent] : originalEvent;
    },
    
    // Add event listener with compatibility
    addEventListener(element, event, handler, options) {
        const eventName = this.getEventName(event);
        
        // Handle passive events
        if (options && options.passive && !this.browser.supportsPassive) {
            // Fallback for browsers that don't support passive events
            const passiveHandler = function(e) {
                // Don't prevent default for passive listeners
                handler.call(this, e);
            };
            return element.addEventListener(eventName, passiveHandler, false);
        }
        
        return element.addEventListener(eventName, handler, options);
    },
    
    // Remove event listener with compatibility
    removeEventListener(element, event, handler, options) {
        const eventName = this.getEventName(event);
        return element.removeEventListener(eventName, handler, options);
    },
    
    // Safe JSON parse with fallback
    safeJSONParse(jsonString, fallback = null) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.warn('JSON parse failed, using fallback:', e);
            return fallback;
        }
    },
    
    // Safe JSON stringify with fallback
    safeJSONStringify(obj, fallback = '{}') {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            console.warn('JSON stringify failed, using fallback:', e);
            return fallback;
        }
    },
    
    // Check if browser supports feature
    supportsFeature(feature) {
        return this.features[feature] || false;
    },
    
    // Get browser information
    getBrowserInfo() {
        return {
            name: this.browser.name,
            version: this.browser.version,
            isIE: this.browser.isIE,
            isEdge: this.browser.isEdge,
            isChrome: this.browser.isChrome,
            isFirefox: this.browser.isFirefox,
            isSafari: this.browser.isSafari,
            isMobile: this.browser.isMobile,
            supportsPassive: this.browser.supportsPassive,
            supportsIntersection: this.browser.supportsIntersection,
            supportsResizeObserver: this.browser.supportsResizeObserver,
            supportsRequestIdle: this.browser.supportsRequestIdle
        };
    },
    
    // Get supported features
    getSupportedFeatures() {
        return { ...this.features };
    },
    
    // Apply browser-specific CSS classes
    applyBrowserClasses() {
        const body = document.body;
        body.className += ' ' + this.browser.name.toLowerCase().replace(/\s+/g, '-');
        
        if (this.browser.isMobile) {
            body.className += ' mobile';
        }
        
        if (this.browser.isIE) {
            body.className += ' ie ie' + Math.floor(this.browser.version);
        }
        
        if (this.browser.isEdge) {
            body.className += ' edge';
        }
        
        if (this.browser.isChrome) {
            body.className += ' chrome';
        }
        
        if (this.browser.isFirefox) {
            body.className += ' firefox';
        }
        
        if (this.browser.isSafari) {
            body.className += ' safari';
        }
    },
    
    // Initialize all compatibility features
    initialize() {
        this.init();
        this.applyBrowserClasses();
    }
};

// register with Bootstrap - needs to run early for polyfills
Bootstrap.register('BrowserCompatibility', () => BrowserCompatibility.initialize(), {
    dependencies: [],
    priority: 0,  // first thing to run
    severity: 'required'
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibility;
}