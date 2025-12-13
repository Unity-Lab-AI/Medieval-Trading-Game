// ═══════════════════════════════════════════════════════════════
// NPC MANAGER - puppetmaster pulling strings of virtual souls
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const NPCManager = {
    // NPC registry - every soul catalogued in the digital void
    npcs: new Map(),

    // currently active NPC - the soul the player is haunting
    activeNPC: null,

    // npcs by location for quick lookup
    npcsByLocation: new Map(),

    // timer that keeps these hollow souls ticking - the void's metronome
    _updateInterval: null,

    // extra logging to watch these puppets dance - the debooger sees all
    _deboogMode: false,

    // awaken the puppetmaster - time to pull the strings of these digital marionettes
    init() {
        console.log('👤 NPCManager awakening from the digital void...');

        // start periodic updates
        this._updateInterval = setInterval(() => this.update(), 1000);

        // listen for location changes
        document.addEventListener('location-changed', (e) => {
            this.onLocationChange(e.detail);
        });

        console.log('👤 NPCManager initialized - puppets await your command 💀');
    },

    // register an NPC
    register(npc) {
        if (!npc || !npc.id) {
            console.warn('👤 Cannot register NPC without id');
            return false;
        }

        this.npcs.set(npc.id, npc);

        // catalogue this soul by location - every puppet needs a stage
        if (npc.location) {
            if (!this.npcsByLocation.has(npc.location)) {
                this.npcsByLocation.set(npc.location, new Set());
            }
            this.npcsByLocation.get(npc.location).add(npc.id);
        }

        console.log(`👤 Registered NPC: ${npc.name || npc.id} at ${npc.location || 'unknown'}`);
        return true;
    },

    // unregister an NPC
    unregister(npcId) {
        const npc = this.npcs.get(npcId);
        if (!npc) return false;

        // erase this ghost from its haunting grounds - one less puppet on the stage
        if (npc.location && this.npcsByLocation.has(npc.location)) {
            this.npcsByLocation.get(npc.location).delete(npcId);
        }

        this.npcs.delete(npcId);

        if (this.activeNPC?.id === npcId) {
            this.activeNPC = null;
        }

        return true;
    },

    // summon a specific soul from the registry - fetch your puppet by name
    get(npcId) {
        return this.npcs.get(npcId) || null;
    },

    // gather every hollow soul bound to this location - count the meat sacks
    getNPCsAtLocation(locationId) {
        const npcIds = this.npcsByLocation.get(locationId);
        if (!npcIds) return [];

        // map IDs to NPCs, warn about missing ones in deboog mode
        const npcs = Array.from(npcIds).map(id => {
            const npc = this.npcs.get(id);
            if (!npc && this._deboogMode) {
                console.warn(`🦇 NPC ${id} referenced at ${locationId} but not found in registry`);
            }
            return npc;
        }).filter(npc => npc);

        return npcs;
    },

    // which puppets can the player touch right now? schedules determine who's awake
    getAvailableNPCs(locationId = null) {
        const location = locationId || game?.currentLocation?.id;
        if (!location) return [];

        const npcsHere = this.getNPCsAtLocation(location);

        // filter by schedule if NPCScheduleSystem exists
        if (typeof NPCScheduleSystem !== 'undefined') {
            return npcsHere.filter(npc => {
                const schedule = NPCScheduleSystem.getNPCSchedule(npc.id);
                if (!schedule) return true; // no schedule = always available
                return NPCScheduleSystem.isNPCAvailable(npc.id);
            });
        }

        return npcsHere;
    },

    // choose which soul gets center stage - this puppet speaks now
    setActiveNPC(npcId) {
        const npc = this.npcs.get(npcId);
        if (!npc) {
            console.warn(`👤 NPC not found: ${npcId}`);
            return false;
        }

        this.activeNPC = npc;

        // fire event
        document.dispatchEvent(new CustomEvent('npc-activated', { detail: { npc } }));

        return true;
    },

    // clear active NPC
    clearActiveNPC() {
        const previousNPC = this.activeNPC;
        this.activeNPC = null;

        if (previousNPC) {
            document.dispatchEvent(new CustomEvent('npc-deactivated', { detail: { npc: previousNPC } }));
        }
    },

    // periodic update - runs every second
    update() {
        // update these soulless routines - watch the puppets dance their daily scripts
        if (typeof NPCScheduleSystem !== 'undefined') {
            NPCScheduleSystem.update();
        }

        // random encounters
        // NPCEncounterSystem hooks into TravelSystem and CityEventSystem directly
        // No periodic polling needed - encounters trigger on travel/arrival/events
    },

    // player moved - dismiss the old puppets, summon new ones from the void
    onLocationChange(detail) {
        const newLocation = detail?.location?.id || detail?.locationId;
        if (!newLocation) return;

        // clear active NPC when changing locations
        this.clearActiveNPC();

        // announce NPCs at new location
        const npcsHere = this.getAvailableNPCs(newLocation);
        if (npcsHere.length > 0) {
            const npcNames = npcsHere.map(n => n.name).join(', ');
            if (typeof addMessage === 'function') {
                addMessage(`👤 NPCs here: ${npcNames}`);
            }
        }
    },

    // start conversation with NPC
    startConversation(npcId) {
        const npc = this.get(npcId);
        if (!npc) {
            if (typeof addMessage === 'function') {
                addMessage('👤 NPC not found!', 'warning');
            }
            return false;
        }

        this.setActiveNPC(npcId);

        // discover NPC's faction when talking to them
        if (npc.faction && typeof FactionSystem !== 'undefined' && FactionSystem.discoverFaction) {
            FactionSystem.discoverFaction(npc.faction);
        }

        // use dialogue system if available
        if (typeof NPCDialogueSystem !== 'undefined') {
            NPCDialogueSystem.startDialogue(npc);
        } else if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.startChat(npc);
        } else {
            // fallback - just show a message
            if (typeof addMessage === 'function') {
                addMessage(`${npc.name}: "Hello, traveler!"`);
            }
        }

        return true;
    },

    // open trade with NPC
    openTrade(npcId) {
        const npc = this.get(npcId);
        if (!npc) return false;

        this.setActiveNPC(npcId);

        // discover NPC's faction when trading with them
        if (npc.faction && typeof FactionSystem !== 'undefined' && FactionSystem.discoverFaction) {
            FactionSystem.discoverFaction(npc.faction);
        }

        // use appropriate trading system
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

    // how much does this hollow thing tolerate you? check the favorability meter
    getRelationship(npcId) {
        if (typeof NPCRelationshipSystem !== 'undefined') {
            return NPCRelationshipSystem.getRelationship(npcId);
        }
        return { level: 0, title: 'Stranger' };
    },

    // modify relationship
    modifyRelationship(npcId, amount) {
        if (typeof NPCRelationshipSystem !== 'undefined') {
            return NPCRelationshipSystem.modifyRelationship(npcId, amount);
        }
        return false;
    },

    // expose this puppet's vital signs for display - show the player who they're dealing with
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

    // search the puppet registry by name or function - find your meat sack
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

    // spawn random NPC encounter
    spawnEncounter(type = 'random') {
        if (typeof NPCEncounterSystem !== 'undefined' && NPCEncounterSystem.spawnRandomEncounter) {
            return NPCEncounterSystem.spawnRandomEncounter('road', type === 'random' ? null : type);
        }
        return null;
    },

    // serialize the puppet registry for preservation - save these hollow souls to disk
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
                // don't save transient state
            });
        });

        return data;
    },

    // resurrect the puppets from the save file - breathe digital life back into them
    loadSaveData(data) {
        if (!data) return;

        // restore NPCs
        if (data.npcs && Array.isArray(data.npcs)) {
            data.npcs.forEach(npcData => {
                const existingNPC = this.npcs.get(npcData.id);
                if (existingNPC) {
                    // overlay saved state onto existing puppet - refresh their programming
                    Object.assign(existingNPC, npcData);
                } else {
                    // register new NPC
                    this.register(npcData);
                }
            });
        }

        // restore active NPC
        if (data.activeNPC) {
            this.setActiveNPC(data.activeNPC);
        }
    },

    // cleanup
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

// expose to global scope
window.NPCManager = NPCManager;

// register with Bootstrap
Bootstrap.register('NPCManager', () => NPCManager.init(), {
    dependencies: ['GameWorld', 'EventBus'],
    priority: 55,
    severity: 'optional'
});

// cleanup on page unload - no memory leaks in my realm
window.addEventListener('beforeunload', () => NPCManager.destroy());
