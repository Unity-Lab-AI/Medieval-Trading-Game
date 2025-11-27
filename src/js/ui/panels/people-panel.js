// ═══════════════════════════════════════════════════════════════
// 👥 PEOPLE PANEL - who's hanging around this place anyway?
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - tracking the lonely souls of each location
// ═══════════════════════════════════════════════════════════════

const PeoplePanel = {
    // 🔧 CONFIG
    panelId: 'people-panel',
    isOpen: false,

    // 🚀 INITIALIZE
    init() {
        this.createPanelHTML();
        this.setupEventListeners();
        console.log('👥 PeoplePanel: Ready to show you the locals...');
    },

    // 🏗️ CREATE PANEL HTML - dynamically inject the panel
    createPanelHTML() {
        // 🖤 check if panel already exists
        if (document.getElementById(this.panelId)) {
            return;
        }

        const overlayContainer = document.getElementById('overlay-container');
        if (!overlayContainer) {
            console.warn('👥 PeoplePanel: overlay-container not found');
            return;
        }

        const panel = document.createElement('section');
        panel.id = this.panelId;
        panel.className = 'panel overlay-panel hidden';
        panel.innerHTML = `
            <button class="panel-close-x" data-close-overlay="${this.panelId}" title="Close">×</button>
            <div class="panel-header">
                <h2>👥 People Here</h2>
            </div>
            <div class="panel-content">
                <p class="location-context" id="people-location-context">Loading...</p>
                <div id="people-list" class="people-list">
                    <!-- NPCs will be rendered here -->
                </div>
                <div id="people-empty" class="people-empty hidden">
                    <p>No one interesting seems to be around...</p>
                    <p class="empty-hint">Try visiting during different times or check the tavern!</p>
                </div>
            </div>
            <div class="panel-footer">
                <button class="panel-close-btn-footer" onclick="PeoplePanel.close()">Close</button>
            </div>
        `;

        overlayContainer.appendChild(panel);
        console.log('👥 PeoplePanel: Panel HTML created');
    },

    // 👂 SETUP EVENT LISTENERS
    setupEventListeners() {
        // 🖤 listen for location changes to update NPC list
        document.addEventListener('location-changed', (e) => {
            if (this.isOpen) {
                this.refresh();
            }
        });

        // 🖤 listen for panel close events
        document.addEventListener('click', (e) => {
            if (e.target.matches(`[data-close-overlay="${this.panelId}"]`)) {
                this.close();
            }
        });
    },

    // 🔓 OPEN PANEL
    open() {
        const panel = document.getElementById(this.panelId);
        if (!panel) {
            console.error('👥 PeoplePanel: Panel not found, creating...');
            this.createPanelHTML();
            return this.open();
        }

        panel.classList.remove('hidden');
        this.isOpen = true;

        // 🖤 refresh the NPC list
        this.refresh();

        console.log('👥 PeoplePanel: Opened');
    },

    // 🔒 CLOSE PANEL
    close() {
        const panel = document.getElementById(this.panelId);
        if (panel) {
            panel.classList.add('hidden');
        }
        this.isOpen = false;
        console.log('👥 PeoplePanel: Closed');
    },

    // 🔄 TOGGLE PANEL
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    // 🔄 REFRESH NPC LIST
    refresh() {
        const locationContext = document.getElementById('people-location-context');
        const peopleList = document.getElementById('people-list');
        const emptyState = document.getElementById('people-empty');

        if (!peopleList) return;

        // 🖤 clear existing content
        peopleList.innerHTML = '';

        // 📍 get current location
        const currentLocation = game?.currentLocation;
        const locationName = currentLocation?.name || 'Unknown Location';
        const locationId = currentLocation?.id || null;

        if (locationContext) {
            locationContext.textContent = `📍 ${locationName}`;
        }

        // 👥 get NPCs at this location
        let npcs = [];

        // 🖤 try multiple sources for NPCs
        if (typeof NPCManager !== 'undefined' && locationId) {
            npcs = NPCManager.getAvailableNPCs(locationId) || [];
        }

        // 🖤 also check NPCScheduleSystem
        if (npcs.length === 0 && typeof NPCScheduleSystem !== 'undefined' && locationId) {
            const scheduledNPCs = NPCScheduleSystem.getNPCsAtLocation(locationId) || [];
            npcs = scheduledNPCs.map(npcId => {
                if (typeof NPCPersonaDatabase !== 'undefined') {
                    return NPCPersonaDatabase.getPersona(npcId) || { id: npcId, name: npcId };
                }
                return { id: npcId, name: npcId };
            });
        }

        // 🖤 also check GameWorld for location NPCs
        if (npcs.length === 0 && typeof GameWorld !== 'undefined' && locationId) {
            const locationData = GameWorld.locations?.[locationId];
            if (locationData?.npcs) {
                npcs = locationData.npcs.map(npcId => {
                    if (typeof NPCPersonaDatabase !== 'undefined') {
                        const persona = NPCPersonaDatabase.getPersona(npcId);
                        if (persona) return { ...persona, id: npcId };
                    }
                    return { id: npcId, name: this.formatNPCName(npcId), type: npcId };
                });
            }
        }

        // 📋 render NPCs or show empty state
        if (npcs.length > 0) {
            if (emptyState) emptyState.classList.add('hidden');

            npcs.forEach(npc => {
                const npcCard = this.createNPCCard(npc);
                peopleList.appendChild(npcCard);
            });
        } else {
            if (emptyState) emptyState.classList.remove('hidden');
        }

        console.log(`👥 PeoplePanel: Showing ${npcs.length} NPCs at ${locationName}`);
    },

    // 🎴 CREATE NPC CARD
    createNPCCard(npc) {
        const card = document.createElement('div');
        card.className = 'npc-card';
        card.dataset.npcId = npc.id;

        // 🖤 determine NPC icon based on type
        const icon = this.getNPCIcon(npc.type || npc.id);
        const name = npc.name || this.formatNPCName(npc.id);
        const title = npc.title || this.getNPCTitle(npc.type || npc.id);
        const description = npc.description || this.getNPCDescription(npc.type || npc.id);

        // 🖤 check for quests from this NPC
        const hasQuest = this.npcHasQuest(npc.id || npc.type);
        const questBadge = hasQuest ? '<span class="quest-badge">!</span>' : '';

        card.innerHTML = `
            <div class="npc-card-icon">${icon}${questBadge}</div>
            <div class="npc-card-info">
                <div class="npc-card-name">${name}</div>
                <div class="npc-card-title">${title}</div>
                <div class="npc-card-description">${description}</div>
            </div>
            <div class="npc-card-actions">
                <button class="npc-talk-btn" onclick="PeoplePanel.talkTo('${npc.id || npc.type}')">🗨️ Talk</button>
            </div>
        `;

        // 🖤 clicking the card also opens dialogue
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.talkTo(npc.id || npc.type);
            }
        });

        return card;
    },

    // 🗨️ TALK TO NPC
    talkTo(npcId) {
        console.log(`👥 PeoplePanel: Initiating conversation with ${npcId}`);

        // 🖤 close the people panel first
        this.close();

        // 🖤 get NPC data
        let npcData = null;

        if (typeof NPCManager !== 'undefined') {
            npcData = NPCManager.get(npcId);
        }

        if (!npcData && typeof NPCPersonaDatabase !== 'undefined') {
            const persona = NPCPersonaDatabase.getPersona(npcId);
            if (persona) {
                npcData = {
                    id: npcId,
                    name: persona.name || this.formatNPCName(npcId),
                    type: npcId,
                    ...persona
                };
            }
        }

        // 🖤 fallback to basic data
        if (!npcData) {
            npcData = {
                id: npcId,
                name: this.formatNPCName(npcId),
                type: npcId
            };
        }

        // 🖤 open NPC chat UI
        if (typeof NPCChatUI !== 'undefined' && NPCChatUI.open) {
            NPCChatUI.open(npcData);
        } else if (typeof NPCDialogueSystem !== 'undefined' && NPCDialogueSystem.startDialogue) {
            NPCDialogueSystem.startDialogue(npcData);
        } else {
            // 🖤 fallback - show modal
            if (typeof ModalSystem !== 'undefined') {
                ModalSystem.show({
                    title: `🗨️ ${npcData.name}`,
                    content: `<p>You approach ${npcData.name}.</p><p style="color: #888;">NPC dialogue system not available.</p>`,
                    buttons: [{ text: 'Close', onClick: () => ModalSystem.hide() }]
                });
            }
        }
    },

    // 📜 CHECK IF NPC HAS QUEST
    npcHasQuest(npcId) {
        if (typeof QuestSystem === 'undefined') return false;

        // 🖤 check available/discovered quests for this giver
        const quests = Object.values(QuestSystem.quests || {});
        return quests.some(q => {
            const giverMatches = q.giver === npcId || q.giverName?.toLowerCase().includes(npcId);
            const isAvailable = QuestSystem.discoveredQuests?.includes(q.id) &&
                !QuestSystem.activeQuests?.some(aq => aq.id === q.id) &&
                !QuestSystem.completedQuests?.includes(q.id);
            return giverMatches && isAvailable;
        });
    },

    // 🎨 GET NPC ICON
    getNPCIcon(type) {
        const icons = {
            elder: '👴',
            guard: '⚔️',
            blacksmith: '🔨',
            merchant: '💰',
            innkeeper: '🍺',
            healer: '💚',
            priest: '⛪',
            apothecary: '🧪',
            traveler: '🚶',
            courier: '📜',
            noble: '👑',
            beggar: '🙏',
            thief: '🗡️',
            spy: '👁️',
            ferryman: '⛵',
            stablemaster: '🐴',
            guild_master: '📋',
            drunk: '🍻',
            scholar: '📚',
            jeweler: '💎',
            tailor: '🧵',
            baker: '🍞',
            farmer: '🌾',
            fisherman: '🐟',
            miner: '⛏️',
            woodcutter: '🪓',
            barkeep: '🍺',
            default: '👤'
        };

        return icons[type] || icons.default;
    },

    // 📋 GET NPC TITLE
    getNPCTitle(type) {
        const titles = {
            elder: 'Village Elder',
            guard: 'Town Guard',
            blacksmith: 'Blacksmith',
            merchant: 'Traveling Merchant',
            innkeeper: 'Innkeeper',
            healer: 'Healer',
            priest: 'Temple Priest',
            apothecary: 'Apothecary',
            traveler: 'Traveler',
            courier: 'Royal Courier',
            noble: 'Noble',
            beggar: 'Beggar',
            thief: 'Shady Character',
            spy: 'Mysterious Figure',
            ferryman: 'Ferryman',
            stablemaster: 'Stablemaster',
            guild_master: 'Guild Master',
            drunk: 'Local Drunk',
            scholar: 'Scholar',
            jeweler: 'Jeweler',
            tailor: 'Tailor',
            baker: 'Baker',
            farmer: 'Farmer',
            fisherman: 'Fisherman',
            miner: 'Miner',
            woodcutter: 'Woodcutter',
            barkeep: 'Barkeep',
            default: 'Villager'
        };

        return titles[type] || titles.default;
    },

    // 📝 GET NPC DESCRIPTION
    getNPCDescription(type) {
        const descriptions = {
            elder: 'A wise figure who knows much about the village and its history.',
            guard: 'Keeps watch over the settlement and its people.',
            blacksmith: 'Hammers away at the forge, crafting tools and weapons.',
            merchant: 'Has goods from distant lands for trade.',
            innkeeper: 'Runs the local tavern and knows all the gossip.',
            healer: 'Tends to the sick and wounded.',
            priest: 'Offers spiritual guidance and blessings.',
            apothecary: 'Brews potions and remedies.',
            traveler: 'A wanderer passing through.',
            courier: 'Carries important messages throughout the realm.',
            noble: 'A person of status and influence.',
            beggar: 'Down on their luck, asking for charity.',
            default: 'A local resident going about their business.'
        };

        return descriptions[type] || descriptions.default;
    },

    // 🔤 FORMAT NPC NAME
    formatNPCName(id) {
        if (!id) return 'Unknown';
        return id.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL ACCESS
// ═══════════════════════════════════════════════════════════════
window.PeoplePanel = PeoplePanel;
window.openPeoplePanel = function() { PeoplePanel.open(); };
window.closePeoplePanel = function() { PeoplePanel.close(); };
window.togglePeoplePanel = function() { PeoplePanel.toggle(); };

// 🚀 INITIALIZE on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => PeoplePanel.init(), 500);
    });
} else {
    setTimeout(() => PeoplePanel.init(), 500);
}

console.log('👥 People Panel loaded - ready to introduce you to the locals');
