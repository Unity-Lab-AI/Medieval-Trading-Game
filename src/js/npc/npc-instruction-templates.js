// ═══════════════════════════════════════════════════════════════
// 🖤 NPC INSTRUCTION TEMPLATES - the soul of every conversation 💀
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
//
// 🦇 This system uses embedded NPC data (no fetch required) and generates
// 🦇 standardized API instructions using template placeholders
// ═══════════════════════════════════════════════════════════════

console.log('🎭 NPCInstructionTemplates loading... giving NPCs their voices 🖤💀');

const NPCInstructionTemplates = {
    // 🖤 NPC data loaded from embedded source (no CORS issues!) 💀
    _npcData: {},
    _loaded: false,

    // ═══════════════════════════════════════════════════════════════
    // 📦 DATA LOADING - use embedded data (no fetch required!)
    // ═══════════════════════════════════════════════════════════════

    async loadAllNPCData() {
        if (this._loaded) return this._npcData;

        console.log('🎭 Loading NPC specifications from embedded data...');

        // 🖤 Use embedded data instead of fetch - no CORS errors! 💀
        if (typeof NPC_EMBEDDED_DATA !== 'undefined') {
            this._npcData = { ...NPC_EMBEDDED_DATA };
            this._loaded = true;
            console.log(`🎭 Loaded ${Object.keys(this._npcData).length} NPC specifications from embedded data`);
        } else {
            console.warn('🎭 NPC_EMBEDDED_DATA not found - make sure npc-data-embedded.js is loaded first!');
            this._loaded = true; // Mark as loaded to prevent retry loops
        }

        return this._npcData;
    },

    // 🖤 Get NPC spec by type, with fallback to generic 💀
    getNPCSpec(npcType) {
        // 🦇 Try exact match first
        if (this._npcData[npcType]) {
            return this._npcData[npcType];
        }

        // 🦇 Try lowercase
        const lower = npcType?.toLowerCase();
        if (this._npcData[lower]) {
            return this._npcData[lower];
        }

        // 🦇 Try without underscores
        const noUnderscore = lower?.replace(/_/g, '');
        for (const [key, spec] of Object.entries(this._npcData)) {
            if (key.replace(/_/g, '') === noUnderscore) {
                return spec;
            }
        }

        // 🦇 Return generic fallback
        return this._getGenericSpec(npcType);
    },

    // 🖤 Generic fallback spec for unknown NPC types 💀
    _getGenericSpec(npcType) {
        return {
            type: npcType || 'stranger',
            category: 'common',
            voice: 'nova',
            personality: 'neutral',
            speakingStyle: 'casual and polite',
            background: 'A local going about their business.',
            traits: ['neutral'],
            greetings: ['Hello there.', 'Good day.', 'What do you need?'],
            farewells: ['Goodbye.', 'Take care.', 'See you around.'],
            browseGoods: {
                instruction: 'Respond naturally to the player. Be helpful and in-character.',
                responses: ['How can I help you?', "I'm not sure I can help with that."]
            }
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎯 ACTION TYPES - all possible player actions
    // ═══════════════════════════════════════════════════════════════

    ACTIONS: {
        GREETING: 'greeting',
        FAREWELL: 'farewell',
        CHAT: 'chat',  // 🖤💀 General chat with full quest context
        BROWSE_GOODS: 'browse_goods',
        BUY: 'buy',
        SELL: 'sell',
        HAGGLE: 'haggle',
        ASK_QUEST: 'ask_quest',
        TURN_IN_QUEST: 'turn_in_quest',
        ASK_RUMORS: 'ask_rumors',
        ASK_DIRECTIONS: 'ask_directions',
        REST: 'rest',
        HEAL: 'heal',
        REPAIR: 'repair',
        CUSTOM: 'custom',
        COMBAT_TAUNT: 'combat_taunt',
        COMBAT_WOUNDED: 'combat_wounded',
        COMBAT_VICTORY: 'combat_victory',
        COMBAT_DEFEAT: 'combat_defeat',
        ROBBERY_DEMAND: 'robbery_demand',
        ROBBERY_NEGOTIATE: 'robbery_negotiate'
    },

    // ═══════════════════════════════════════════════════════════════
    // 📝 TEMPLATE RESOLUTION - fill in {placeholders}
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Resolve all {placeholders} in a template string 💀
    resolveTemplate(template, context) {
        if (!template) return '';

        let result = template;

        // 🦇 Replace all {npc.xxx} placeholders
        result = result.replace(/\{npc\.(\w+)\}/g, (match, key) => {
            return context.npc?.[key] ?? match;
        });

        // 🦇 Replace all {player.xxx} placeholders
        result = result.replace(/\{player\.(\w+)\}/g, (match, key) => {
            return context.player?.[key] ?? match;
        });

        // 🦇 Replace all {location.xxx} placeholders
        result = result.replace(/\{location\.(\w+)\}/g, (match, key) => {
            return context.location?.[key] ?? match;
        });

        // 🦇 Replace all {game.xxx} placeholders
        result = result.replace(/\{game\.(\w+)\}/g, (match, key) => {
            return context.game?.[key] ?? match;
        });

        // 🦇 Replace simple {xxx} placeholders
        result = result.replace(/\{(\w+)\}/g, (match, key) => {
            return context[key] ?? match;
        });

        return result;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎭 INSTRUCTION BUILDERS - generate full API instructions
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Master instruction builder - routes to specific action handlers 💀
    buildInstruction(npcType, action, context = {}) {
        console.log(`🎭 NPCInstructionTemplates.buildInstruction called:`);
        console.log(`   - npcType: ${npcType}`);
        console.log(`   - action: ${action}`);
        console.log(`   - _loaded: ${this._loaded}`);

        // 🖤💀 DOOM WORLD CHECK - Use doom instructions when in doom world
        const inDoom = (typeof game !== 'undefined' && game.inDoomWorld) ||
                       (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld?.()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive);

        if (inDoom && typeof DoomNPCInstructionTemplates !== 'undefined') {
            console.log(`💀 DOOM WORLD ACTIVE - Using DoomNPCInstructionTemplates for ${npcType}`);
            return DoomNPCInstructionTemplates.buildDoomInstruction(npcType, action, context);
        }

        const spec = this.getNPCSpec(npcType);
        console.log(`   - spec found: ${spec ? spec.type : 'NO SPEC FOUND'}`);

        // 🦇 Build base context with NPC data
        const fullContext = {
            ...context,
            npc: {
                type: spec.type,
                name: context.npcName || this.formatNPCName(spec.type),
                voice: spec.voice,
                personality: spec.personality,
                speakingStyle: spec.speakingStyle,
                background: spec.background,
                traits: spec.traits?.join(', ') || '',
                ...context.npc
            }
        };

        // 🦇 Route to specific action builder
        switch (action) {
            case this.ACTIONS.GREETING:
                return this._buildGreetingInstruction(spec, fullContext);
            case this.ACTIONS.FAREWELL:
                return this._buildFarewellInstruction(spec, fullContext);
            case this.ACTIONS.CHAT:
                return this._buildChatInstruction(spec, fullContext);
            case this.ACTIONS.BROWSE_GOODS:
                return this._buildBrowseGoodsInstruction(spec, fullContext);
            case this.ACTIONS.BUY:
                return this._buildBuyInstruction(spec, fullContext);
            case this.ACTIONS.SELL:
                return this._buildSellInstruction(spec, fullContext);
            case this.ACTIONS.HAGGLE:
                return this._buildHaggleInstruction(spec, fullContext);
            case this.ACTIONS.ASK_QUEST:
                return this._buildQuestInstruction(spec, fullContext);
            case this.ACTIONS.ASK_RUMORS:
                return this._buildRumorsInstruction(spec, fullContext);
            case this.ACTIONS.ASK_DIRECTIONS:
                return this._buildDirectionsInstruction(spec, fullContext);
            case this.ACTIONS.REST:
                return this._buildRestInstruction(spec, fullContext);
            case this.ACTIONS.HEAL:
                return this._buildHealInstruction(spec, fullContext);
            case this.ACTIONS.COMBAT_TAUNT:
                return this._buildCombatTauntInstruction(spec, fullContext);
            case this.ACTIONS.ROBBERY_DEMAND:
                return this._buildRobberyDemandInstruction(spec, fullContext);
            case this.ACTIONS.TURN_IN_QUEST:
                return this._buildTurnInQuestInstruction(spec, fullContext);
            default:
                return this._buildCustomInstruction(spec, fullContext, context.message);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📜 SPECIFIC ACTION BUILDERS
    // ═══════════════════════════════════════════════════════════════

    // 🖤 GREETING - first contact 💀
    _buildGreetingInstruction(spec, context) {
        return `You are a ${spec.type}. Personality: ${spec.personality}. Say ONE short greeting sentence in character. Examples: "${spec.greetings?.[0] || 'Hello.'}"`;
    },

    // 🖤 FAREWELL - ending conversation 💀
    _buildFarewellInstruction(spec, context) {
        return `You are a ${spec.type}. Say ONE short farewell sentence in character. Example: "${spec.farewells?.[0] || 'Goodbye.'}"`;
    },

    // 🖤💀 CHAT - Full conversation with quest context! 💀
    _buildChatInstruction(spec, context) {
        const npcName = context.npc?.name || spec.type;
        const npcType = spec.type;
        const location = context.location?.name || 'this place';

        // 🖤 Build quest context from QuestSystem
        let questContext = '';
        if (typeof QuestSystem !== 'undefined') {
            const locationId = context.location?.id || game?.currentLocation?.id;
            questContext = QuestSystem.getQuestContextForNPC?.(npcType, locationId) || '';
        }

        // 🖤 Build comprehensive instruction with full quest info
        let instruction = `You are ${npcName}, a ${npcType} in ${location}.

CHARACTER:
- Personality: ${spec.personality || 'friendly'}
- Speaking Style: ${spec.speakingStyle || 'natural'}
- Background: ${spec.background || ''}
${spec.worldKnowledge ? `- World Knowledge: ${spec.worldKnowledge}` : ''}

VOICE INSTRUCTIONS:
${spec.voiceInstructions || 'Speak naturally and in character.'}

${questContext}

RESPONSE RULES:
1. Stay completely in character at ALL times
2. Keep responses to 2-3 sentences. Be concise but informative.
3. Never break character or mention being an AI
4. If player asks about quests, use the QUEST SYSTEM section above
5. Use quest commands like {assignQuest:questId} or {completeQuest:questId} when appropriate
6. CRITICAL: For quest NPCs, prioritize quest dialogue over generic chat
7. If you have quests available, mention them naturally in conversation
8. Commands go in curly braces and are invisible to player - weave them naturally

AVAILABLE COMMANDS:
- {assignQuest:questId} - Give a quest to the player
- {completeQuest:questId} - Complete a quest and give rewards
- {checkQuest:questId} - Check player's quest progress
- {takeQuestItem:itemId} - Take a quest item from player
- {takeCollection:itemName,count} - Take collected items from player
- {openMarket} - Open trade/shop window

The player says: "${context.message || ''}"

Respond in character:`;

        return instruction;
    },

    // 🖤 BROWSE GOODS - player wants to see what you sell 💀
    _buildBrowseGoodsInstruction(spec, context) {
        const inventory = context.npc.inventory || spec.defaultInventory || [];
        const items = Array.isArray(inventory) ? inventory.slice(0, 4).join(', ') : 'various goods';

        return `You are a ${spec.type}. Player wants to browse your wares. Say ONE sentence inviting them to look at your goods (${items}). Then include the command {openMarket} to open the trade panel. Example: "Take a look at what I have! {openMarket}"`;
    },

    // 🖤 BUY - player wants to purchase 💀
    _buildBuyInstruction(spec, context) {
        return `You are a ${spec.type}. Player wants to buy. Say ONE sentence acknowledging and include {openMarket} to open trade. Example: "Let's see what catches your eye. {openMarket}"`;
    },

    // 🖤 SELL - player wants to sell to you 💀
    _buildSellInstruction(spec, context) {
        return `You are a ${spec.type}. Player wants to sell items. Say ONE sentence and include {openMarket}. Example: "Show me what you've got. {openMarket}"`;
    },

    // 🖤 HAGGLE - player trying to negotiate 💀
    _buildHaggleInstruction(spec, context) {
        const accepts = Math.random() < (spec.priceModifiers?.haggleChance || 0.3);
        if (accepts) {
            return `You are a ${spec.type}. Accept the haggle. Say ONE sentence agreeing to lower the price. Include {setDiscount:10}. Example: "Fine, I'll knock a bit off. {setDiscount:10}"`;
        }
        return `You are a ${spec.type}. Reject the haggle. Say ONE firm sentence refusing. Example: "My prices are fair. Take it or leave it."`;
    },

    // 🖤 ASK QUEST - player wants work 💀
    _buildQuestInstruction(spec, context) {
        // 🖤 Use NPCWorkflowSystem's pre-validated checker for reduced API lag 💀
        if (typeof NPCWorkflowSystem !== 'undefined') {
            const npcData = { type: spec.type, quests: context.availableQuests || [] };
            const preValidated = NPCWorkflowSystem.getPreValidatedQuestAction(npcData, context.player || {});

            if (preValidated.action === 'OFFER_QUEST') {
                return `You are a ${spec.type}. Offer quest "${preValidated.questName}" in ONE sentence. ${preValidated.description || ''}. MUST include ${preValidated.command}. Example: "I have a task for you... ${preValidated.command}"`;
            }
        }

        // 🦇 Fallback to old logic
        const availableQuests = context.availableQuests || [];
        if (availableQuests.length > 0) {
            const q = availableQuests[0];
            return `You are a ${spec.type}. Offer this quest in ONE sentence: "${q.name}" - ${q.description}. Reward: ${q.rewards?.gold || 0} gold. MUST include {startQuest:${q.id}} at the end.`;
        }
        return `You are a ${spec.type}. Say ONE sentence: you have no work available right now.`;
    },

    // 🖤 TURN IN QUEST - player delivering/completing a quest 💀
    _buildTurnInQuestInstruction(spec, context) {
        // 🖤 Use NPCWorkflowSystem's pre-validated checker for reduced API lag 💀
        if (typeof NPCWorkflowSystem !== 'undefined') {
            const npcData = { type: spec.type };
            const preValidated = NPCWorkflowSystem.getPreValidatedQuestAction(npcData, context.player || {});

            if (preValidated.action === 'COMPLETE_QUEST') {
                return `You are a ${spec.type}. Quest "${preValidated.questName}" is COMPLETE. Accept turn-in and congratulate player. MUST include ${preValidated.command}. Example: "Well done! Here's your reward. ${preValidated.command}"`;
            } else if (preValidated.action === 'MISSING_ITEMS') {
                return `You are a ${spec.type}. Quest incomplete: ${preValidated.message}. Tell player what they still need. Do NOT use completeQuest command.`;
            } else if (preValidated.action === 'CHECK_PROGRESS') {
                return `You are a ${spec.type}. Player has active quest "${preValidated.questName}" (${preValidated.progress}). Remind them what's needed.`;
            }
        }

        // 🦇 Fallback to old logic
        return `You are a ${spec.type}. Say ONE sentence: you weren't expecting any delivery. Example: "I'm not expecting anything from you."`;
    },

    // 🖤 ASK RUMORS - player wants gossip 💀
    _buildRumorsInstruction(spec, context) {
        const rumors = context.rumors || [];
        const rumor = rumors[0] || 'Things have been quiet lately';
        return `You are a ${spec.type}. Share ONE rumor in ONE sentence: "${rumor}". Example: "I heard ${rumor.toLowerCase()}."`;
    },

    // 🖤 ASK DIRECTIONS - player wants navigation help 💀
    _buildDirectionsInstruction(spec, context) {
        const nearbyLocations = context.nearbyLocations || [];
        const places = nearbyLocations.slice(0, 2).map(l => l.name).join(' and ') || 'other settlements';
        return `You are a ${spec.type}. Give directions in ONE sentence mentioning: ${places}. Example: "Head east for ${places}."`;
    },

    // 🖤 REST - player wants to rest at inn 💀
    _buildRestInstruction(spec, context) {
        const restCost = spec.restCost || 20;
        return `You are an innkeeper. Offer rest in ONE sentence: ${restCost} gold for a room. Include {offerRest:${restCost}}. Example: "A room's ${restCost} gold. {offerRest:${restCost}}"`;
    },

    // 🖤 HEAL - player wants healing 💀
    _buildHealInstruction(spec, context) {
        const healCost = spec.healCost || 50;
        const healAmount = spec.healAmount || 50;
        return `You are a healer. Offer healing in ONE sentence: ${healCost} gold restores ${healAmount} health. Include {offerHeal:${healAmount},${healCost}}. Example: "I can heal you for ${healCost} gold. {offerHeal:${healAmount},${healCost}}"`;
    },

    // 🖤 COMBAT TAUNT - boss taunting during fight 💀
    _buildCombatTauntInstruction(spec, context) {
        const taunt = spec.encounter?.taunt?.responses?.[0] || 'You cannot defeat me!';
        return `You are a ${spec.type} in combat. Say ONE aggressive taunt. Example: "${taunt}"`;
    },

    // 🖤 ROBBERY DEMAND - criminal demanding money 💀
    _buildRobberyDemandInstruction(spec, context) {
        const demandAmount = Math.floor(Math.random() * 150 + 50);
        return `You are a ${spec.type} robbing the player. Demand ${demandAmount} gold in ONE threatening sentence. Include {robDemand:${demandAmount}}. Example: "Give me ${demandAmount} gold or else! {robDemand:${demandAmount}}"`;
    },

    // 🖤 CUSTOM - freeform player message 💀
    _buildCustomInstruction(spec, context, playerMessage) {
        return `You are a ${spec.type}. Player says: "${playerMessage || 'Hello.'}". Respond in ONE sentence, in character. Use {openMarket} if they want to trade.`;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🛠️ UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Format NPC type to display name 💀
    formatNPCName(type) {
        if (!type) return 'Stranger';
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    // 🖤 Get random response from array 💀
    getRandomResponse(responses) {
        if (!responses || !responses.length) return '';
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // 🖤 Get voice for NPC type 💀
    getVoice(npcType) {
        const spec = this.getNPCSpec(npcType);
        return spec?.voice || 'nova';
    },

    // 🖤 Check if NPC type is a vendor 💀
    isVendor(npcType) {
        const spec = this.getNPCSpec(npcType);
        return spec?.category === 'vendor' ||
               spec?.services?.includes('buy_items') ||
               spec?.services?.includes('sell_items');
    },

    // 🖤 Check if NPC is hostile 💀
    isHostile(npcType) {
        const spec = this.getNPCSpec(npcType);
        return spec?.category === 'criminal' ||
               spec?.category === 'boss' ||
               ['robber', 'bandit', 'thief'].includes(npcType);
    },

    // 🖤 Get all NPC types by category 💀
    getByCategory(category) {
        return Object.entries(this._npcData)
            .filter(([_, spec]) => spec.category === category)
            .map(([type, _]) => type);
    }
};

// 🖤 Initialize on load 💀
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        NPCInstructionTemplates.loadAllNPCData();
    });
} else {
    NPCInstructionTemplates.loadAllNPCData();
}

// 🖤 Global access 💀
window.NPCInstructionTemplates = NPCInstructionTemplates;

console.log('🎭 NPCInstructionTemplates ready - NPCs now have standardized voices 🖤💀');
