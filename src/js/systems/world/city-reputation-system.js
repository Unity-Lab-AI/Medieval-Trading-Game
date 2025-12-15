// 
// CITY REPUTATION - measuring local contempt
// 
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const CityReputationSystem = {
    // The spectrum of how much they hate you - from worshipped to wanted dead
    levels: {
        HOSTILE: { name: 'Hostile', min: -100, max: -50, color: '#ff0000' },
        UNTRUSTED: { name: 'Untrusted', min: -49, max: -25, color: '#ff4444' },
        SUSPICIOUS: { name: 'Suspicious', min: -24, max: -1, color: '#ff8800' },
        NEUTRAL: { name: 'Neutral', min: 0, max: 24, color: '#ffffff' },
        FRIENDLY: { name: 'Friendly', min: 25, max: 49, color: '#44ff44' },
        TRUSTED: { name: 'Trusted', min: 50, max: 74, color: '#00ff00' },
        ELITE: { name: 'Elite', min: 75, max: 100, color: '#0088ff' }
    },

    // How much each town actually gives a fuck about you
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
                // Corrupted rep data - burn it and pretend nothing happened
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
            // Storage fucked - who cares, reputation isn't life or death
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

        // Broadcast the shift - let the UI know your standing changed
        document.dispatchEvent(new CustomEvent('city-reputation-changed', {
            detail: {
                cityId: cityId,
                oldRep: currentRep,
                newRep: newRep,
                change: amount,
                oldLevel: oldLevel.name,
                newLevel: newLevel.name
            }
        }));
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
        
        // How much they'll price-gouge you based on whether they like you
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

// register with Bootstrap
Bootstrap.register('CityReputationSystem', () => CityReputationSystem.init(), {
    dependencies: ['GameWorld', 'EventBus'],
    priority: 35,
    severity: 'optional'
});