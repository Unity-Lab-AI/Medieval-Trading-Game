//
// SAFARI COMPATIBILITY - Polyfills and fixes for Safari browser
//
// Version: 0.91.00 | Unity AI Lab
// This file MUST load before all other scripts
// Fixes: Optional chaining, nullish coalescing, localStorage, AudioContext
//

(function() {
    'use strict';

    console.log('Safari compatibility layer initializing...');

    // Detect Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isOldSafari = isSafari && !window.CSS?.supports?.('selector(:is(*))'); // Pre-14 Safari

    window.SAFARI_COMPAT = {
        isSafari: isSafari,
        isOldSafari: isOldSafari,
        version: 'unknown'
    };

    // Try to detect Safari version
    if (isSafari) {
        const match = navigator.userAgent.match(/Version\/(\d+)/);
        if (match) {
            window.SAFARI_COMPAT.version = parseInt(match[1], 10);
        }
        console.log('Safari detected, version:', window.SAFARI_COMPAT.version);
    }

    // ============================================
    // 1. LOCALSTORAGE FALLBACK (Private Browsing)
    // ============================================

    // Safari Private Browsing throws on localStorage access
    window.safeStorage = {
        _memoryStorage: {},

        getItem: function(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('localStorage unavailable, using memory fallback');
                return this._memoryStorage[key] || null;
            }
        },

        setItem: function(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.warn('localStorage unavailable, using memory fallback');
                this._memoryStorage[key] = String(value);
            }
        },

        removeItem: function(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                delete this._memoryStorage[key];
            }
        },

        clear: function() {
            try {
                localStorage.clear();
            } catch (e) {
                this._memoryStorage = {};
            }
        }
    };

    // Test localStorage availability
    try {
        const testKey = '__safari_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        window.SAFARI_COMPAT.localStorageAvailable = true;
    } catch (e) {
        window.SAFARI_COMPAT.localStorageAvailable = false;
        console.warn('localStorage not available (Private Browsing?). Using memory fallback.');
    }

    // ============================================
    // 2. AUDIOCONTEXT FIX (Safari requires prefix)
    // ============================================

    // Safari uses webkitAudioContext
    if (typeof window.AudioContext === 'undefined' && typeof window.webkitAudioContext !== 'undefined') {
        window.AudioContext = window.webkitAudioContext;
        console.log('AudioContext polyfilled from webkitAudioContext');
    }

    // Safari requires user gesture to start AudioContext
    window.safariAudioUnlocked = false;

    window.unlockSafariAudio = function() {
        if (window.safariAudioUnlocked) return;

        // Create and immediately close a context to unlock audio
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);

            // Resume any suspended contexts
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            window.safariAudioUnlocked = true;
            console.log('Safari audio unlocked');
        } catch (e) {
            console.warn('Failed to unlock Safari audio:', e);
        }
    };

    // Auto-unlock on first user interaction
    const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    const unlockHandler = function() {
        window.unlockSafariAudio();
        unlockEvents.forEach(function(event) {
            document.removeEventListener(event, unlockHandler, true);
        });
    };
    unlockEvents.forEach(function(event) {
        document.addEventListener(event, unlockHandler, true);
    });

    // ============================================
    // 3. OPTIONAL CHAINING POLYFILL
    // ============================================

    // Helper function for safe property access (use instead of ?.)
    window.safeGet = function(obj, path, defaultValue) {
        if (defaultValue === undefined) defaultValue = undefined;
        if (obj === null || obj === undefined) return defaultValue;

        const keys = path.split('.');
        let result = obj;

        for (let i = 0; i < keys.length; i++) {
            if (result === null || result === undefined) {
                return defaultValue;
            }
            result = result[keys[i]];
        }

        return result === undefined ? defaultValue : result;
    };

    // Safe function call (use instead of ?.)
    window.safeCall = function(obj, method) {
        var args = Array.prototype.slice.call(arguments, 2);
        if (obj && typeof obj[method] === 'function') {
            return obj[method].apply(obj, args);
        }
        return undefined;
    };

    // ============================================
    // 4. NULLISH COALESCING POLYFILL
    // ============================================

    // Helper for nullish coalescing (use instead of ??)
    window.nullish = function(value, defaultValue) {
        return (value === null || value === undefined) ? defaultValue : value;
    };

    // ============================================
    // 5. ARRAY/OBJECT METHOD POLYFILLS
    // ============================================

    // Array.prototype.at() - Safari 15.4+
    if (!Array.prototype.at) {
        Array.prototype.at = function(index) {
            index = Math.trunc(index) || 0;
            if (index < 0) index += this.length;
            if (index < 0 || index >= this.length) return undefined;
            return this[index];
        };
    }

    // Object.hasOwn() - Safari 15.4+
    if (!Object.hasOwn) {
        Object.hasOwn = function(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };
    }

    // String.prototype.replaceAll() - Safari 13.1+
    if (!String.prototype.replaceAll) {
        String.prototype.replaceAll = function(search, replacement) {
            return this.split(search).join(replacement);
        };
    }

    // ============================================
    // 6. PROMISE.ALLSETTLED (Safari 13+)
    // ============================================

    if (!Promise.allSettled) {
        Promise.allSettled = function(promises) {
            return Promise.all(promises.map(function(promise) {
                return Promise.resolve(promise)
                    .then(function(value) {
                        return { status: 'fulfilled', value: value };
                    })
                    .catch(function(reason) {
                        return { status: 'rejected', reason: reason };
                    });
            }));
        };
    }

    // ============================================
    // 7. REQUESTIDLECALLBACK (Safari doesn't have it)
    // ============================================

    if (!window.requestIdleCallback) {
        window.requestIdleCallback = function(callback, options) {
            var timeout = options && options.timeout ? options.timeout : 50;
            var start = Date.now();
            return setTimeout(function() {
                callback({
                    didTimeout: false,
                    timeRemaining: function() {
                        return Math.max(0, 50 - (Date.now() - start));
                    }
                });
            }, 1);
        };
    }

    if (!window.cancelIdleCallback) {
        window.cancelIdleCallback = function(id) {
            clearTimeout(id);
        };
    }

    // ============================================
    // 8. CSS FIXES FOR SAFARI
    // ============================================

    if (isSafari) {
        // Add safari class to body for CSS targeting via Bootstrap
        // polyfills above run immediately, CSS classes wait for DOM
        if (typeof Bootstrap !== 'undefined') {
            Bootstrap.register('SafariCSSClasses', () => {
                document.body.classList.add('safari');
                if (isOldSafari) {
                    document.body.classList.add('safari-old');
                }
            }, { dependencies: [], priority: 0, severity: 'optional' });
        } else {
            // fallback if Bootstrap not loaded yet
            document.addEventListener('DOMContentLoaded', function() {
                document.body.classList.add('safari');
                if (isOldSafari) {
                    document.body.classList.add('safari-old');
                }
            });
        }
    }

    // ============================================
    // 9. FETCH CREDENTIALS FIX
    // ============================================

    // Safari sometimes has issues with fetch credentials
    var originalFetch = window.fetch;
    window.fetch = function(url, options) {
        options = options || {};
        // Ensure credentials are set for same-origin requests
        if (!options.credentials) {
            options.credentials = 'same-origin';
        }
        return originalFetch.call(window, url, options);
    };

    // ============================================
    // 10. EVENT TARGET POLYFILL
    // ============================================

    // Ensure EventTarget constructor exists (Safari 14+)
    if (typeof EventTarget === 'undefined') {
        window.EventTarget = function() {};
        EventTarget.prototype.addEventListener = function() {};
        EventTarget.prototype.removeEventListener = function() {};
        EventTarget.prototype.dispatchEvent = function() { return true; };
    }

    // ============================================
    // INIT COMPLETE
    // ============================================

    console.log('Safari compatibility layer loaded:', {
        isSafari: window.SAFARI_COMPAT.isSafari,
        version: window.SAFARI_COMPAT.version,
        localStorageAvailable: window.SAFARI_COMPAT.localStorageAvailable
    });

})();
