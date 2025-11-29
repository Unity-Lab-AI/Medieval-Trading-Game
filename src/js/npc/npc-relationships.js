// ═══════════════════════════════════════════════════════════════
// 💕 NPC RELATIONSHIP SYSTEM - memories, reputation, and bonds
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// NPCs remember you, love you, hate you, and everything in between.
// Because what's a medieval trading game without social anxiety
// about whether the blacksmith still likes you after that lowball offer?
// ═══════════════════════════════════════════════════════════════

const NPCRelationshipSystem = {
    // ═══════════════════════════════════════════════════════════════
    // 📋 STATE
    // ═══════════════════════════════════════════════════════════════
    initialized: false,
    relationships: {},     // NPC-specific relationships
    factionReputation: {}, // Faction-wide reputation
    playerTitle: null,     // Earned title based on reputation

    // ═══════════════════════════════════════════════════════════════
    // 🎭 RELATIONSHIP LEVELS
    // ═══════════════════════════════════════════════════════════════
    levels: {
        hostile:    { min: -100, max: -50, label: 'Hostile', icon: '😠', color: '#ff4444' },
        unfriendly: { min: -50,  max: -20, label: 'Unfriendly', icon: '😒', color: '#ff8844' },
        wary:       { min: -20,  max: 0,   label: 'Wary', icon: '🤨', color: '#ffaa44' },
        neutral:    { min: 0,    max: 20,  label: 'Neutral', icon: '😐', color: '#aaaaaa' },
        friendly:   { min: 20,   max: 50,  label: 'Friendly', icon: '😊', color: '#88cc44' },
        trusted:    { min: 50,   max: 80,  label: 'Trusted', icon: '😄', color: '#44cc88' },
        beloved:    { min: 80,   max: 100, label: 'Beloved', icon: '🥰', color: '#44aaff' }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏛️ FACTIONS
    // ═══════════════════════════════════════════════════════════════
    factions: {
        merchants_guild: {
            name: "Merchants' Guild",
            description: 'The trade union of all legitimate merchants',
            members: ['merchant', 'traveling_merchant', 'peddler'],
            benefits: {
                50: 'Better prices (5% discount)',
                80: 'Access to rare goods',
                100: 'Honorary member status'
            }
        },
        blacksmiths_union: {
            name: "Blacksmiths' Union",
            description: 'The brotherhood of metalworkers',
            members: ['blacksmith'],
            benefits: {
                50: 'Priority forging queue',
                80: 'Custom weapon options',
                100: 'Master-crafted equipment'
            }
        },
        healers_circle: {
            name: "Healers' Circle",
            description: 'Those who preserve life',
            members: ['apothecary', 'healer'],
            benefits: {
                50: 'Free basic healing',
                80: 'Rare potion recipes',
                100: 'Resurrection services'
            }
        },
        innkeepers_association: {
            name: "Innkeepers' Association",
            description: 'Hospitality professionals',
            members: ['innkeeper'],
            benefits: {
                50: 'Free meals',
                80: 'Best rooms reserved',
                100: 'Free stays anywhere'
            }
        },
        town_guard: {
            name: 'Town Guard',
            description: 'Protectors of the realm',
            members: ['guard', 'captain'],
            benefits: {
                50: 'Warnings instead of arrests',
                80: 'Guard escort available',
                100: 'Honorary deputy status'
            }
        },
        underworld: {
            name: 'The Underworld',
            description: 'Those who operate in shadows',
            members: ['thief', 'bandit', 'informant'],
            benefits: {
                50: 'Black market access',
                80: 'Robbery immunity',
                100: 'Crime boss connections'
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this.initialized) {
            console.log('💕 NPCRelationshipSystem already initialized');
            return this;
        }

        console.log('💕 NPCRelationshipSystem awakening...');
        this.loadRelationships();
        this.setupEventListeners();
        this.initialized = true;
        console.log('💕 NPCRelationshipSystem ready - NPCs will remember you');
        return this;
    },

    // ═══════════════════════════════════════════════════════════════
    // 💾 PERSISTENCE
    // ═══════════════════════════════════════════════════════════════

    saveRelationships() {
        const saveData = {
            relationships: this.relationships,
            factionReputation: this.factionReputation,
            playerTitle: this.playerTitle
        };
        try {
            localStorage.setItem('medievalTradingGameRelationships', JSON.stringify(saveData));
        } catch (e) {
            // 🦇 Storage full - relationships live in memory only
            console.warn('💕 Relationships not persisted - storage full');
        }
    },

    loadRelationships() {
        try {
            const saved = localStorage.getItem('medievalTradingGameRelationships');
            if (saved) {
                const data = JSON.parse(saved);
                this.relationships = data.relationships || {};
                this.factionReputation = data.factionReputation || {};
                this.playerTitle = data.playerTitle || null;
                console.log('💕 Loaded relationships:', Object.keys(this.relationships).length, 'NPCs remembered');
            }
        } catch (e) {
            // 🦇 Corrupt relationship data - start fresh
            console.warn('💕 Relationships reset - previous data corrupt');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 👤 RELATIONSHIP MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get or create relationship data for an NPC
     * @param {string} npcId - Unique NPC identifier
     * @param {object} npcData - Optional NPC data for initialization
     * @returns {object} Relationship data
     */
    getRelationship(npcId, npcData = null) {
        if (!this.relationships[npcId]) {
            // 💀 Birth a new bond - every soul starts as a stranger in the void 🖤
            this.relationships[npcId] = {
                npcId: npcId,
                npcName: npcData?.name || npcId,
                npcType: npcData?.type || 'villager',
                reputation: 0,           // -100 to 100
                timesInteracted: 0,
                timesTraded: 0,
                totalGoldTraded: 0,
                questsCompleted: 0,
                questsFailed: 0,
                lastInteraction: null,
                firstMet: Date.now(),
                memories: {},            // Key-value storage for NPC to remember things
                gifts: [],               // Items given to NPC
                mood: 'neutral',
                specialFlags: []         // For quest-related flags
            };
        }
        return this.relationships[npcId];
    },

    /**
     * Modify reputation with an NPC
     * @param {string} npcId - NPC identifier
     * @param {number} amount - Amount to change (+/-)
     * @param {string} reason - Why reputation changed (for logging)
     * @returns {object} Updated relationship
     */
    modifyReputation(npcId, amount, reason = '') {
        const relationship = this.getRelationship(npcId);
        const oldRep = relationship.reputation;
        const oldLevel = this.getRelationshipLevel(oldRep);

        // 🎭 Adjust the emotional ledger - love and hate are capped at mortal limits 💕
        relationship.reputation = Math.max(-100, Math.min(100, oldRep + amount));
        relationship.lastInteraction = Date.now();

        const newLevel = this.getRelationshipLevel(relationship.reputation);

        // 🦇 Did we cross the threshold? From stranger to friend... or enemy? 💔
        if (oldLevel.label !== newLevel.label) {
            const event = new CustomEvent('relationship-level-changed', {
                detail: {
                    npcId,
                    oldLevel: oldLevel.label,
                    newLevel: newLevel.label,
                    reputation: relationship.reputation
                }
            });
            document.dispatchEvent(event);

            if (typeof addMessage === 'function') {
                const direction = amount > 0 ? 'improved' : 'worsened';
                addMessage(`Your relationship with ${relationship.npcName} has ${direction} to ${newLevel.label}!`,
                    amount > 0 ? 'success' : 'warning');
            }
        }

        // 👥 Ripple effects - they all talk to each other, remember? 🗣️
        this.updateFactionReputation(relationship.npcType, amount * 0.5);

        this.saveRelationships();

        console.log(`💕 Reputation with ${relationship.npcName}: ${oldRep} → ${relationship.reputation} (${reason})`);

        return relationship;
    },

    /**
     * Get the relationship level for a reputation value
     * @param {number} reputation - Reputation value
     * @returns {object} Level data
     */
    getRelationshipLevel(reputation) {
        for (const [key, level] of Object.entries(this.levels)) {
            if (reputation >= level.min && reputation < level.max) {
                return { key, ...level };
            }
        }
        return { key: 'neutral', ...this.levels.neutral };
    },

    /**
     * Record an interaction with an NPC
     * @param {string} npcId - NPC identifier
     * @param {string} type - Type of interaction
     * @param {object} data - Additional data
     */
    recordInteraction(npcId, type, data = {}) {
        const relationship = this.getRelationship(npcId);
        relationship.timesInteracted++;
        relationship.lastInteraction = Date.now();

        switch (type) {
            case 'conversation':
                // 🦇 talking to an NPC - first meeting unlocks their quests in the Available filter
                // the void tracks every whisper... every word exchanged... 🖤
                if (data.npcData?.name) {
                    relationship.npcName = data.npcData.name;
                }
                if (data.npcData?.type) {
                    relationship.npcType = data.npcData.type;
                }
                // tiny rep boost for being social (not all of us have that skill...)
                this.modifyReputation(npcId, 1, 'had conversation');
                break;

            case 'trade':
                relationship.timesTraded++;
                relationship.totalGoldTraded += data.goldValue || 0;
                // 💰 A transaction is a tiny thread in the web of connection ⚖️
                this.modifyReputation(npcId, 1, 'completed trade');
                break;

            case 'quest_complete':
                relationship.questsCompleted++;
                // 🎯 Proving yourself through deeds - they remember the heroes 🏆
                this.modifyReputation(npcId, data.repBonus || 10, 'completed quest');
                break;

            case 'quest_fail':
                relationship.questsFailed++;
                this.modifyReputation(npcId, -(data.repPenalty || 5), 'failed quest');
                break;

            case 'gift':
                relationship.gifts.push({
                    item: data.itemId,
                    date: Date.now()
                });
                // 🎁 Gifts speak when words fail - the value of kindness measured in gold 💎
                const giftBonus = Math.floor((data.value || 10) / 10);
                this.modifyReputation(npcId, giftBonus, 'gave gift');
                break;

            case 'insult':
                this.modifyReputation(npcId, -10, 'insulted');
                break;

            case 'help':
                this.modifyReputation(npcId, data.amount || 5, 'helped');
                break;

            case 'attack':
                this.modifyReputation(npcId, -50, 'attacked');
                // ⚔️ Violence echoes - their whole community feels this betrayal 🩸
                this.updateFactionReputation(relationship.npcType, -25);
                break;
        }

        this.saveRelationships();
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧠 NPC MEMORY
    // ═══════════════════════════════════════════════════════════════

    /**
     * Store a memory about the player
     * @param {string} npcId - NPC identifier
     * @param {string} key - Memory key
     * @param {any} value - Memory value
     */
    rememberAboutPlayer(npcId, key, value) {
        const relationship = this.getRelationship(npcId);
        relationship.memories[key] = {
            value: value,
            timestamp: Date.now()
        };
        this.saveRelationships();
        console.log(`💕 ${relationship.npcName} remembers: ${key} = ${value}`);
    },

    /**
     * Get what an NPC remembers about the player
     * @param {string} npcId - NPC identifier
     * @param {string} key - Memory key (optional, returns all if not provided)
     * @returns {any} Memory value(s)
     */
    getMemory(npcId, key = null) {
        const relationship = this.getRelationship(npcId);
        if (key) {
            return relationship.memories[key]?.value;
        }
        // 🧠 Extract all memories from the vault of their mind 🔮
        const memories = {};
        for (const [k, v] of Object.entries(relationship.memories)) {
            memories[k] = v.value;
        }
        return memories;
    },

    /**
     * Check if NPC remembers something specific
     * @param {string} npcId - NPC identifier
     * @param {string} key - Memory key
     * @returns {boolean}
     */
    doesRemember(npcId, key) {
        const relationship = this.relationships[npcId];
        return relationship?.memories?.[key] !== undefined;
    },

    /**
     * Forget a memory
     * @param {string} npcId - NPC identifier
     * @param {string} key - Memory key
     */
    forgetAboutPlayer(npcId, key) {
        const relationship = this.relationships[npcId];
        if (relationship?.memories?.[key]) {
            delete relationship.memories[key];
            this.saveRelationships();
        }
    },

    /**
     * Generate context string for AI about player relationship
     * @param {string} npcId - NPC identifier
     * @returns {string} Context for AI prompt
     */
    getRelationshipContext(npcId) {
        const relationship = this.relationships[npcId];
        if (!relationship) return '';

        const level = this.getRelationshipLevel(relationship.reputation);
        let context = `\n[RELATIONSHIP WITH PLAYER]\n`;
        context += `- Relationship level: ${level.label} (${relationship.reputation}/100)\n`;
        context += `- Times met: ${relationship.timesInteracted}\n`;
        context += `- Times traded: ${relationship.timesTraded}\n`;

        if (relationship.questsCompleted > 0) {
            context += `- Quests completed for you: ${relationship.questsCompleted}\n`;
        }

        // 💭 What do they remember about you? The past haunts every conversation 👻
        const memories = this.getMemory(npcId);
        if (Object.keys(memories).length > 0) {
            context += `- You remember about the player:\n`;
            for (const [key, value] of Object.entries(memories)) {
                context += `  - ${key}: ${value}\n`;
            }
        }

        // 🎭 How should they treat you? Their feelings dictate their mask 😈
        if (level.key === 'hostile') {
            context += `- Be cold, dismissive, or hostile to the player.\n`;
        } else if (level.key === 'beloved') {
            context += `- Be warm and welcoming. Offer the player special deals or information.\n`;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏛️ FACTION REPUTATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Update reputation with a faction
     * @param {string} npcType - Type of NPC (used to determine faction)
     * @param {number} amount - Amount to change
     */
    updateFactionReputation(npcType, amount) {
        // 🏛️ Every soul belongs to a tribe - find their collective and adjust accordingly 👥
        for (const [factionId, faction] of Object.entries(this.factions)) {
            if (faction.members.includes(npcType)) {
                const oldRep = this.factionReputation[factionId] || 0;
                this.factionReputation[factionId] = Math.max(-100, Math.min(100, oldRep + amount));

                // 🔓 Have we earned their trust? Check if doors have opened 🚪
                this.checkFactionBenefits(factionId);

                this.saveRelationships();
                break;
            }
        }
    },

    /**
     * Get reputation with a faction
     * @param {string} factionId - Faction identifier
     * @returns {number} Reputation value
     */
    getFactionReputation(factionId) {
        return this.factionReputation[factionId] || 0;
    },

    /**
     * Check and notify about faction benefits
     * @param {string} factionId - Faction identifier
     */
    checkFactionBenefits(factionId) {
        const faction = this.factions[factionId];
        const rep = this.factionReputation[factionId] || 0;

        for (const [threshold, benefit] of Object.entries(faction.benefits)) {
            const thresholdNum = parseInt(threshold);
            // 🎯 Did we just unlock a new tier of their favor? (tracking needs work) 📊
        }
    },

    /**
     * Get all unlocked faction benefits
     * @returns {object} Benefits by faction
     */
    getUnlockedBenefits() {
        const benefits = {};

        for (const [factionId, faction] of Object.entries(this.factions)) {
            const rep = this.factionReputation[factionId] || 0;
            benefits[factionId] = {
                name: faction.name,
                reputation: rep,
                unlocked: []
            };

            for (const [threshold, benefit] of Object.entries(faction.benefits)) {
                if (rep >= parseInt(threshold)) {
                    benefits[factionId].unlocked.push(benefit);
                }
            }
        }

        return benefits;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎭 MOOD SYSTEM
    // ═══════════════════════════════════════════════════════════════

    /**
     * Update NPC's current mood
     * @param {string} npcId - NPC identifier
     * @param {string} mood - New mood
     */
    setMood(npcId, mood) {
        const relationship = this.getRelationship(npcId);
        relationship.mood = mood;
        this.saveRelationships();
    },

    /**
     * Get NPC's current mood
     * @param {string} npcId - NPC identifier
     * @returns {string} Current mood
     */
    getMood(npcId) {
        const relationship = this.relationships[npcId];
        return relationship?.mood || 'neutral';
    },

    /**
     * Calculate NPC's disposition based on relationship and mood
     * @param {string} npcId - NPC identifier
     * @returns {object} Disposition data
     */
    getDisposition(npcId) {
        const relationship = this.getRelationship(npcId);
        const level = this.getRelationshipLevel(relationship.reputation);
        const mood = relationship.mood;

        // 🎭 Mood + relationship = how they'll treat you today 💸
        let priceModifier = 0;
        let dialogueStyle = 'neutral';

        switch (level.key) {
            case 'hostile':
                priceModifier = 30; // 30% markup
                dialogueStyle = 'hostile';
                break;
            case 'unfriendly':
                priceModifier = 15;
                dialogueStyle = 'cold';
                break;
            case 'wary':
                priceModifier = 5;
                dialogueStyle = 'cautious';
                break;
            case 'neutral':
                priceModifier = 0;
                dialogueStyle = 'neutral';
                break;
            case 'friendly':
                priceModifier = -5;
                dialogueStyle = 'warm';
                break;
            case 'trusted':
                priceModifier = -10;
                dialogueStyle = 'friendly';
                break;
            case 'beloved':
                priceModifier = -15;
                dialogueStyle = 'enthusiastic';
                break;
        }

        // 😠 Bad mood = bad prices. They're taking it out on you 💢
        if (mood === 'angry') priceModifier += 10;
        if (mood === 'happy') priceModifier -= 5;

        return {
            level: level,
            mood: mood,
            priceModifier: priceModifier,
            dialogueStyle: dialogueStyle,
            willTrade: level.key !== 'hostile',
            willGiveQuest: relationship.reputation >= -20,
            willShareSecrets: relationship.reputation >= 50
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎧 EVENT LISTENERS
    // ═══════════════════════════════════════════════════════════════

    setupEventListeners() {
        // Trade completed
        document.addEventListener('trade-completed', (e) => {
            const npcId = e.detail.npc?.id || e.detail.npc?.name;
            if (npcId) {
                const goldValue = (e.detail.playerGave?.gold || 0) + (e.detail.playerReceived?.gold || 0);
                this.recordInteraction(npcId, 'trade', { goldValue });
            }
        });

        // Quest completed
        document.addEventListener('quest-completed', (e) => {
            const quest = e.detail.quest;
            if (quest?.assignedBy) {
                const npcId = quest.assignedBy;
                const repBonus = e.detail.rewards?.reputation || 10;
                this.recordInteraction(npcId, 'quest_complete', { repBonus });
            }
        });

        // Quest failed
        document.addEventListener('quest-failed', (e) => {
            const quest = e.detail.quest;
            if (quest?.assignedBy) {
                const npcId = quest.assignedBy;
                this.recordInteraction(npcId, 'quest_fail', { repPenalty: 5 });
            }
        });

        // Reputation change from API command
        document.addEventListener('reputation-change', (e) => {
            const npcId = e.detail.npc?.id || e.detail.npc?.name;
            if (npcId) {
                this.modifyReputation(npcId, e.detail.amount, 'API command');
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔧 UTILITIES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get all relationships summary
     * @returns {array} Array of relationship summaries
     */
    getAllRelationships() {
        return Object.values(this.relationships).map(rel => {
            const level = this.getRelationshipLevel(rel.reputation);
            return {
                npcId: rel.npcId,
                npcName: rel.npcName,
                npcType: rel.npcType,
                reputation: rel.reputation,
                level: level.label,
                levelIcon: level.icon,
                timesInteracted: rel.timesInteracted,
                lastInteraction: rel.lastInteraction
            };
        }).sort((a, b) => b.reputation - a.reputation);
    },

    /**
     * Get system status
     * @returns {object} Status info
     */
    getStatus() {
        return {
            initialized: this.initialized,
            totalRelationships: Object.keys(this.relationships).length,
            factionReputations: this.factionReputation,
            playerTitle: this.playerTitle
        };
    },

    /**
     * Reset all relationships (use with caution!)
     */
    resetAll() {
        this.relationships = {};
        this.factionReputation = {};
        this.playerTitle = null;
        this.saveRelationships();
        console.log('💕 All relationships reset');
    },

    /**
     * Debug: List all NPCs and their feelings about the player
     */
    debugListAll() {
        console.log('💕 === NPC Relationships ===');
        for (const [npcId, rel] of Object.entries(this.relationships)) {
            const level = this.getRelationshipLevel(rel.reputation);
            console.log(`${level.icon} ${rel.npcName}: ${rel.reputation} (${level.label})`);
        }
        console.log('💕 === Faction Reputations ===');
        for (const [factionId, rep] of Object.entries(this.factionReputation)) {
            const faction = this.factions[factionId];
            console.log(`${faction?.name || factionId}: ${rep}`);
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL BINDING
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.NPCRelationshipSystem = NPCRelationshipSystem;
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => NPCRelationshipSystem.init());
    } else {
        NPCRelationshipSystem.init();
    }
}

console.log('💕 NPCRelationshipSystem loaded... awaiting initialization');
