// ═══════════════════════════════════════════════════════════════
// GAME-LOGGER - because print debugging is a legitimate strategy
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// tracks game events and lets you dump logs for debugging when shit breaks

const GameLogger = {
    logs: [],
    maxLogs: 500, // keep last 500 logs
    startTime: Date.now(),

    // record whatever the fuck happened
    log: function(category, message, data = null) {
        const timestamp = Date.now() - this.startTime;
        const logEntry = {
            time: timestamp,
            timestamp: new Date().toLocaleTimeString(),
            category: category,
            message: message,
            data: data
        };

        this.logs.push(logEntry);

        // trim old logs - can't keep everything forever
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // spit it to console with emoji decoration
        const emoji = this.getCategoryEmoji(category);
        if (data) {
            console.log(`${emoji} [${category}] ${message}`, data);
        } else {
            console.log(`${emoji} [${category}] ${message}`);
        }

        return logEntry;
    },

    // pick the right emoji for this category
    getCategoryEmoji: function(category) {
        const emojis = {
            'INIT': '🌙',
            'EVENT': '⚡',
            'GOLD': '💰',
            'DIFFICULTY': '🎯',
            'PERK': '✨',
            'ATTRIBUTE': '📊',
            'TRAVEL': '🗺️',
            'MARKET': '🏪',
            'ERROR': '❌',
            'WARNING': '⚠️',
            'SUCCESS': '✅',
            'DEBOOGER': '🔍'
        };
        return emojis[category] || '📝';
    },

    // dump the entire log history
    getAllLogs: function() {
        return this.logs;
    },

    // filter logs to one category
    getLogsByCategory: function(category) {
        return this.logs.filter(log => log.category === category);
    },

    // grab the last N logs
    getRecentLogs: function(count = 50) {
        return this.logs.slice(-count);
    },

    // format all logs as plain text for export
    exportLogs: function() {
        let text = '═══════════════════════════════════════\n';
        text += '📝 GAME LOG EXPORT\n';
        text += `Generated: ${new Date().toLocaleString()}\n`;
        text += `Total Logs: ${this.logs.length}\n`;
        text += '═══════════════════════════════════════\n\n';

        this.logs.forEach(log => {
            text += `[${log.timestamp}] ${log.category}: ${log.message}\n`;
            if (log.data) {
                text += `  Data: ${JSON.stringify(log.data)}\n`;
            }
        });

        return text;
    },

    // save logs to a .txt file and download it
    downloadLogs: function() {
        const text = this.exportLogs();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-log-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('✅ Logs downloaded!');
    },

    // dump logs into the browser console
    printLogs: function(count = 50) {
        console.log('═══════════════════════════════════════');
        console.log('📝 GAME LOGS (Last', count, 'entries)');
        console.log('═══════════════════════════════════════');
        const logs = this.getRecentLogs(count);
        logs.forEach(log => {
            const emoji = this.getCategoryEmoji(log.category);
            console.log(`${emoji} [${log.timestamp}] [${log.category}] ${log.message}`);
            if (log.data) {
                console.log('  └─', log.data);
            }
        });
        console.log('═══════════════════════════════════════');
        console.log('💡 Tip: Use GameLogger.downloadLogs() to save logs to file');
    },

    // wipe the log history
    clear: function() {
        this.logs = [];
        console.log('🗑️ Logs cleared');
    }
};

// make it global for console access
window.GameLogger = GameLogger;

// shortcut commands for lazy typing
window.showLogs = () => GameLogger.printLogs();
window.downloadLogs = () => GameLogger.downloadLogs();
window.clearLogs = () => GameLogger.clear();

// ═══════════════════════════════════════════════════════════════
// DEBOOGER HELPERS - console commands for manual testing
// ═══════════════════════════════════════════════════════════════

// debooger helper - test difficulty system manually from console
window.testDifficulty = (difficulty = 'easy') => {
    console.log('🔥🔥🔥 MANUAL DIFFICULTY TEST 🔥🔥🔥');
    console.log('Testing difficulty:', difficulty);

    // Find and check the radio
    const radio = document.getElementById(`difficulty-${difficulty}`);
    console.log('Radio element:', radio);
    console.log('Radio exists:', !!radio);

    if (radio) {
        console.log('Before click - checked:', radio.checked);
        radio.checked = true;
        console.log('After manual check - checked:', radio.checked);

        // Manually trigger the change
        console.log('Calling onDifficultyChange()...');
        if (typeof onDifficultyChange === 'function') {
            onDifficultyChange();
        } else {
            console.warn('🖤 onDifficultyChange function not found');
        }

        // Check the gold display
        const goldEl = document.getElementById('setup-gold-amount');
        console.log('Gold display element:', goldEl);
        console.log('Gold display text:', goldEl ? goldEl.textContent : 'NOT FOUND');
    } else {
        console.warn(`🖤 Radio button not found for difficulty: ${difficulty}`);
    }

    console.log('GameLogger entries:', GameLogger.logs.length);
    console.log('Call showLogs() to see all logs');
};

// debooger helper - test attribute system manually from console
window.testAttribute = (attr = 'strength', direction = 'up') => {
    console.log('🔥🔥🔥 MANUAL ATTRIBUTE TEST 🔥🔥🔥');
    console.log('Testing attribute:', attr, 'direction:', direction);

    // characterCreationState is defined in game.js - will be available at runtime
    if (typeof characterCreationState === 'undefined') {
        console.warn('🖤 characterCreationState not available - are you in character creation?');
        return;
    }

    console.log('Current state:', {
        manualValue: characterCreationState.manualAttributes[attr],
        finalValue: characterCreationState.attributes[attr],
        availablePoints: characterCreationState.availableAttributePoints
    });

    if (direction === 'up') {
        console.log('Calling increaseAttribute...');
        if (typeof increaseAttribute === 'function') {
            increaseAttribute(attr);
        } else {
            console.warn('🖤 increaseAttribute function not found');
        }
    } else {
        console.log('Calling decreaseAttribute...');
        if (typeof decreaseAttribute === 'function') {
            decreaseAttribute(attr);
        } else {
            console.warn('🖤 decreaseAttribute function not found');
        }
    }

    console.log('After change:', {
        manualValue: characterCreationState.manualAttributes[attr],
        finalValue: characterCreationState.attributes[attr],
        availablePoints: characterCreationState.availableAttributePoints
    });
};

// debooger helper - check button states
window.checkButtons = () => {
    console.log('🔥🔥🔥 CHECKING ALL ATTRIBUTE BUTTONS 🔥🔥🔥');
    const buttons = document.querySelectorAll('.attr-btn');
    console.log('Found', buttons.length, 'buttons');
    buttons.forEach(btn => {
        console.log(`Button [${btn.dataset.attr}] [${btn.classList.contains('attr-up') ? 'UP' : 'DOWN'}]:`, {
            disabled: btn.disabled,
            visible: btn.offsetParent !== null,
            inDOM: document.contains(btn)
        });
    });

    // characterCreationState is defined in game.js - will be available at runtime
    if (typeof characterCreationState !== 'undefined') {
        console.log('Character creation state:', {
            availablePoints: characterCreationState.availableAttributePoints,
            manualAttributes: characterCreationState.manualAttributes,
            finalAttributes: characterCreationState.attributes
        });
    } else {
        console.warn('🖤 characterCreationState not available');
    }
};

console.log('📝 GameLogger loaded - type showLogs() to see the log');
