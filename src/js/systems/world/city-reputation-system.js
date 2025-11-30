// ═══════════════════════════════════════════════════════════════
// CITY REPUTATION - measuring local contempt
// ═══════════════════════════════════════════════════════════════
// Version: 0.88 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const CityReputationSystem = {
    // 📊 Reputation levels - from "loved" to "shoot on sight"
    levels: {
        HOSTILE: { name: 'Hostile', min: -100, max: -50, color: '#ff0000' },
        UNTRUSTED: { name: 'Untrusted', min: -49, max: -25, color: '#ff4444' },
        SUSPICIOUS: { name: 'Suspicious', min: -24, max: -1, color: '#ff8800' },
        NEUTRAL: { name: 'Neutral', min: 0, max: 24, color: '#ffffff' },
        FRIENDLY: { name: 'Friendly', min: 25, max: 49, color: '#44ff44' },
        TRUSTED: { name: 'Trusted', min: 50, max: 74, color: '#00ff00' },
        ELITE: { name: 'Elite', min: 75, max: 100, color: '#0088ff' }
    },

    // City reputation data
    cityReputation: {},

    // Initialize reputation system
    init() {
        this.loadReputation();
    },

    // Load reputation from localStorage
    loadReputation() {
        const saved = localStorage.getItem('tradingGameCityReputation');
        if (saved) {
            try {
                this.cityReputation = JSON.parse(saved);
            } catch (e) {
                // 🖤 Corrupt data? Nuke it and start fresh - silent fallback
                localStorage.removeItem('tradingGameCityReputation');
                this.cityReputation = {};
            }
        }
    },

    // Save reputation to localStorage
    saveReputation() {
        try {
            localStorage.setItem('tradingGameCityReputation', JSON.stringify(this.cityReputation));
        } catch (e) {
            // 🖤 Storage full or blocked - silent fail, not critical
        }
    },

    // Get reputation for a city
    getReputation(cityId) {
        return this.cityReputation[cityId] || 0;
    },

    // Change reputation for a city
    changeReputation(cityId, amount) {
        const currentRep = this.getReputation(cityId);
        const newRep = Math.max(-100, Math.min(100, currentRep + amount));
        this.cityReputation[cityId] = newRep;
        
        const oldLevel = this.getReputationLevel(currentRep);
        const newLevel = this.getReputationLevel(newRep);
        
        if (oldLevel.name !== newLevel.name) {
            addMessage(`Your reputation in ${cityId} is now ${newLevel.name}!`);
        }
        
        this.saveReputation();
    },

    // Get reputation level
    getReputationLevel(reputation) {
        for (const [levelName, levelData] of Object.entries(this.levels)) {
            if (reputation >= levelData.min && reputation <= levelData.max) {
                return { name: levelName, ...levelData };
            }
        }
        return this.levels.NEUTRAL;
    },

    // Get price modifier based on reputation
    getPriceModifier(cityId) {
        const reputation = this.getReputation(cityId);
        const level = this.getReputationLevel(reputation);
        
        // Price modifiers based on reputation level
        const modifiers = {
            HOSTILE: 1.2,      // 20% higher prices
            UNTRUSTED: 1.1,   // 10% higher prices
            SUSPICIOUS: 1.05,  // 5% higher prices
            NEUTRAL: 1.0,      // Normal prices
            FRIENDLY: 0.95,    // 5% lower prices
            TRUSTED: 0.9,     // 10% lower prices
            ELITE: 0.8         // 20% lower prices
        };
        
        return modifiers[level.name] || 1.0;
    },

    // Add reputation (positive action)
    addReputation(cityId, amount) {
        this.changeReputation(cityId, Math.abs(amount));
    },

    // Remove reputation (negative action)
    removeReputation(cityId, amount) {
        this.changeReputation(cityId, -Math.abs(amount));
    },

    // Get reputation color for UI
    getReputationColor(cityId) {
        const reputation = this.getReputation(cityId);
        const level = this.getReputationLevel(reputation);
        return level.color;
    },

    // Get reputation text for UI
    getReputationText(cityId) {
        const reputation = this.getReputation(cityId);
        const level = this.getReputationLevel(reputation);
        return level.name;
    },

    // Get all reputations for save system
    getAllReputations() {
        return this.cityReputation;
    },
    
    // Load reputations from save system
    loadReputations(reputations) {
        this.cityReputation = reputations || {};
        this.saveReputation();
    },
    
    // Reset all reputation
    resetReputation() {
        this.cityReputation = {};
        this.saveReputation();
        addMessage('All city reputation has been reset!');
    }
};

// Initialize reputation system when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            CityReputationSystem.init();
        }, 100);
    });
} else {
    setTimeout(() => {
        CityReputationSystem.init();
    }, 100);
}