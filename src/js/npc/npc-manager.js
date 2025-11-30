// ═══════════════════════════════════════════════════════════════
// 👤 NPC MANAGER - central coordination for all our digital souls 🖤
// ═══════════════════════════════════════════════════════════════
// the puppet master pulling the strings of virtual existence 💀
// File Version: GameConfig.version.file | Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com

const NPCManager = {
    // 📋 NPC Registry - all NPCs in the game world ⚰️
    npcs: new Map(),

    // 🎯 Currently active NPC (the one player is interacting with) 🦇
    activeNPC: null,

    // 🏠 NPCs by location for quick lookup 🗡️
    npcsByLocation: new Map(),

    // 🔄 Update interval ID 🌙
    _updateInterval: null,

    // 🖤 Initialize the NPC Manager ⚰️
    init() {
        console.log('👤 NPCManager awakening from the digital void...');

        // 🔄 Start periodic updates 🦇
        this._updateInterval = setInterval(() => this.update(), 1000);

        // 🎭 Listen for location changes 🗡️
        document.addEventListener('location-changed', (e) => {
            this.onLocationChange(e.detail);
        });

        console.log('👤 NPCManager initialized - puppets await your command 💀');
    },

    // ➕ Register an NPC 🌙
    register(npc) {
        if (!npc || !npc.id) {
            console.warn('👤 Cannot register NPC without id');
            return false;
        }

        this.npcs.set(npc.id, npc);

        // 🏠 Add to location index 🔮
        if (npc.location) {
            if (!this.npcsByLocation.has(npc.location)) {
                this.npcsByLocation.set(npc.location, new Set());
            }
            this.npcsByLocation.get(npc.location).add(npc.id);
        }

        console.log(`👤 Registered NPC: ${npc.name || npc.id} at ${npc.location || 'unknown'}`);
        return true;
    },

    // ➖ Unregister an NPC 💀
    unregister(npcId) {
        const npc = this.npcs.get(npcId);
        if (!npc) return false;

        // 🏠 Remove from location index 🖤
        if (npc.location && this.npcsByLocation.has(npc.location)) {
            this.npcsByLocation.get(npc.location).delete(npcId);
        }

        this.npcs.delete(npcId);

        if (this.activeNPC?.id === npcId) {
            this.activeNPC = null;
        }

        return true;
    },

    // 🔍 Get NPC by ID ⚰️
    get(npcId) {
        return this.npcs.get(npcId) || null;
    },

    // 🏠 Get all NPCs at a location 🦇
    getNPCsAtLocation(locationId) {
        const npcIds = this.npcsByLocation.get(locationId);
        if (!npcIds) return [];

        return Array.from(npcIds).map(id => this.npcs.get(id)).filter(npc => npc);
    },

    // 🎭 Get available NPCs for interaction 🗡️
    getAvailableNPCs(locationId = null) {
        const location = locationId || game?.currentLocation?.id;
        if (!location) return [];

        const npcsHere = this.getNPCsAtLocation(location);

        // 🕐 Filter by schedule if NPCScheduleSystem exists 🌙
        if (typeof NPCScheduleSystem !== 'undefined') {
            return npcsHere.filter(npc => {
                const schedule = NPCScheduleSystem.getNPCSchedule(npc.id);
                if (!schedule) return true; // no schedule = always available
                return NPCScheduleSystem.isNPCAvailable(npc.id);
            });
        }

        return npcsHere;
    },

    // 🎯 Set active NPC (for interaction) 🔮
    setActiveNPC(npcId) {
        const npc = this.npcs.get(npcId);
        if (!npc) {
            console.warn(`👤 NPC not found: ${npcId}`);
            return false;
        }

        this.activeNPC = npc;

        // 🎭 Fire event 💀
        document.dispatchEvent(new CustomEvent('npc-activated', { detail: { npc } }));

        return true;
    },

    // ⛔ Clear active NPC 🖤
    clearActiveNPC() {
        const previousNPC = this.activeNPC;
        this.activeNPC = null;

        if (previousNPC) {
            document.dispatchEvent(new CustomEvent('npc-deactivated', { detail: { npc: previousNPC } }));
        }
    },

    // 🔄 Periodic update - runs every second ⚰️
    update() {
        // 📍 Update NPC positions/schedules 🦇
        if (typeof NPCScheduleSystem !== 'undefined') {
            NPCScheduleSystem.update();
        }

        // 🎲 Random encounters 🗡️
        if (typeof NPCEncounterSystem !== 'undefined' && Math.random() < 0.01) {
            // 1% chance per second for encounter check
            NPCEncounterSystem.checkForEncounter();
        }
    },

    // 🏠 Handle location change 🌙
    onLocationChange(detail) {
        const newLocation = detail?.location?.id || detail?.locationId;
        if (!newLocation) return;

        // 🎭 Clear active NPC when changing locations 🔮
        this.clearActiveNPC();

        // 📢 Announce NPCs at new location 💀
        const npcsHere = this.getAvailableNPCs(newLocation);
        if (npcsHere.length > 0) {
            const npcNames = npcsHere.map(n => n.name).join(', ');
            if (typeof addMessage === 'function') {
                addMessage(`👤 NPCs here: ${npcNames}`);
            }
        }
    },

    // 💬 Start conversation with NPC 🖤
    startConversation(npcId) {
        const npc = this.get(npcId);
        if (!npc) {
            if (typeof addMessage === 'function') {
                addMessage('👤 NPC not found!', 'warning');
            }
            return false;
        }

        this.setActiveNPC(npcId);

        // 🎙️ Use dialogue system if available ⚰️
        if (typeof NPCDialogueSystem !== 'undefined') {
            NPCDialogueSystem.startDialogue(npc);
        } else if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.startChat(npc);
        } else {
            // 🎭 Fallback - just show a message 🦇
            if (typeof addMessage === 'function') {
                addMessage(`${npc.name}: "Hello, traveler!"`);
            }
        }

        return true;
    },

    // 💰 Open trade with NPC 🗡️
    openTrade(npcId) {
        const npc = this.get(npcId);
        if (!npc) return false;

        this.setActiveNPC(npcId);

        // 🛒 Use appropriate trading system 🌙
        if (npc.type === 'merchant' && typeof NPCMerchantSystem !== 'undefined') {
            NPCMerchantSystem.openMerchantShop(npc);
        } else if (typeof NPCTradeWindow !== 'undefined') {
            NPCTradeWindow.open(npc);
        } else {
            if (typeof addMessage === 'function') {
                addMessage(`${npc.name} has nothing to trade.`, 'info');
            }
        }

        return true;
    },

    // ❤️ Get relationship with NPC 🔮
    getRelationship(npcId) {
        if (typeof NPCRelationshipSystem !== 'undefined') {
            return NPCRelationshipSystem.getRelationship(npcId);
        }
        return { level: 0, title: 'Stranger' };
    },

    // ❤️ Modify relationship 💀
    modifyRelationship(npcId, amount) {
        if (typeof NPCRelationshipSystem !== 'undefined') {
            return NPCRelationshipSystem.modifyRelationship(npcId, amount);
        }
        return false;
    },

    // 📊 Get NPC stats for display 🖤
    getNPCStats(npcId) {
        const npc = this.get(npcId);
        if (!npc) return null;

        const relationship = this.getRelationship(npcId);

        return {
            id: npc.id,
            name: npc.name,
            type: npc.type,
            location: npc.location,
            relationship: relationship,
            isAvailable: this.getAvailableNPCs().some(n => n.id === npcId),
            mood: npc.mood || 'neutral',
            portrait: npc.portrait || npc.icon || '👤'
        };
    },

    // 🔍 Search NPCs by name/type ⚰️
    search(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        this.npcs.forEach(npc => {
            if (npc.name?.toLowerCase().includes(lowerQuery) ||
                npc.type?.toLowerCase().includes(lowerQuery)) {
                results.push(npc);
            }
        });

        return results;
    },

    // 🎲 Spawn random NPC encounter 🦇
    spawnEncounter(type = 'random') {
        if (typeof NPCEncounterSystem !== 'undefined') {
            return NPCEncounterSystem.spawnEncounter(type);
        }
        return null;
    },

    // 💾 Get save data 🗡️
    getSaveData() {
        const data = {
            npcs: [],
            activeNPC: this.activeNPC?.id || null
        };

        this.npcs.forEach(npc => {
            data.npcs.push({
                id: npc.id,
                name: npc.name,
                type: npc.type,
                location: npc.location,
                mood: npc.mood,
                // 🎭 Don't save transient state 🌙
            });
        });

        return data;
    },

    // 💾 Load save data 🔮
    loadSaveData(data) {
        if (!data) return;

        // 🔄 Restore NPCs 💀
        if (data.npcs && Array.isArray(data.npcs)) {
            data.npcs.forEach(npcData => {
                const existingNPC = this.npcs.get(npcData.id);
                if (existingNPC) {
                    // 🔄 Update existing NPC 🖤
                    Object.assign(existingNPC, npcData);
                } else {
                    // ➕ Register new NPC ⚰️
                    this.register(npcData);
                }
            });
        }

        // 🎯 Restore active NPC 🦇
        if (data.activeNPC) {
            this.setActiveNPC(data.activeNPC);
        }
    },

    // 🧹 Cleanup 🗡️
    destroy() {
        if (this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = null;
        }

        this.npcs.clear();
        this.npcsByLocation.clear();
        this.activeNPC = null;

        console.log('👤 NPCManager destroyed - puppets rest in peace 🖤');
    }
};

// 🌙 expose to global scope 🦇
window.NPCManager = NPCManager;

// 🎯 Auto-initialize when DOM is ready 💀
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NPCManager.init());
} else {
    NPCManager.init();
}
