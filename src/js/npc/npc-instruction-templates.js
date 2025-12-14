// ═══════════════════════════════════════════════════════════════
// NPC INSTRUCTION TEMPLATES - the soul of every conversation
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
//
// this system uses embedded NPC data (no fetch required) and generates
// standardized API instructions using template placeholders
// ═══════════════════════════════════════════════════════════════

console.log('🎭 NPCInstructionTemplates loading... giving NPCs their voices 🖤💀');

const NPCInstructionTemplates = {
    // NPC data loaded from embedded source (no CORS issues!)
    _npcData: {},
    _loaded: false,

    // ═══════════════════════════════════════════════════════════════
    // DATA LOADING - use embedded data (no fetch required!)
    // ═══════════════════════════════════════════════════════════════

    async loadAllNPCData() {
        if (this._loaded) return this._npcData;

        console.log('🎭 Loading NPC specifications from embedded data...');

        // use embedded data instead of fetch - no CORS errors!
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

    // get NPC spec by type, with fallback to generic
    getNPCSpec(npcType) {
        // try exact match first
        if (this._npcData[npcType]) {
            return this._npcData[npcType];
        }

        // try lowercase
        const lower = npcType?.toLowerCase();
        if (this._npcData[lower]) {
            return this._npcData[lower];
        }

        // try without underscores
        const noUnderscore = lower?.replace(/_/g, '');
        for (const [key, spec] of Object.entries(this._npcData)) {
            if (key.replace(/_/g, '') === noUnderscore) {
                return spec;
            }
        }

        // return generic fallback
        return this._getGenericSpec(npcType);
    },

    // generic fallback spec for unknown NPC types
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
    // ACTION TYPES - all possible player actions
    // ═══════════════════════════════════════════════════════════════

    ACTIONS: {
        GREETING: 'greeting',
        FAREWELL: 'farewell',
        CHAT: 'chat',  // general chat with full quest context
        BROWSE_GOODS: 'browse_goods',
        BUY: 'buy',
        SELL: 'sell',
        HAGGLE: 'haggle',
        ASK_QUEST: 'ask_quest',
        OFFER_QUEST: 'OFFER_QUEST',      // unified quest button - offer a quest
        TURN_IN_QUEST: 'turn_in_quest',
        DELIVER_ITEM: 'DELIVER_ITEM',    // unified quest button - deliver item to NPC
        CHECK_PROGRESS: 'CHECK_PROGRESS', // unified quest button - check quest progress
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
    // TEMPLATE RESOLUTION - fill in {placeholders}
    // ═══════════════════════════════════════════════════════════════

    // resolve all {placeholders} in a template string
    resolveTemplate(template, context) {
        if (!template) return '';

        let result = template;

        // replace all {npc.xxx} placeholders
        result = result.replace(/\{npc\.(\w+)\}/g, (match, key) => {
            return context.npc?.[key] ?? match;
        });

        // replace all {player.xxx} placeholders
        result = result.replace(/\{player\.(\w+)\}/g, (match, key) => {
            return context.player?.[key] ?? match;
        });

        // replace all {location.xxx} placeholders
        result = result.replace(/\{location\.(\w+)\}/g, (match, key) => {
            return context.location?.[key] ?? match;
        });

        // replace all {game.xxx} placeholders
        result = result.replace(/\{game\.(\w+)\}/g, (match, key) => {
            return context.game?.[key] ?? match;
        });

        // replace simple {xxx} placeholders
        result = result.replace(/\{(\w+)\}/g, (match, key) => {
            return context[key] ?? match;
        });

        return result;
    },

    // ═══════════════════════════════════════════════════════════════
    // INSTRUCTION BUILDERS - generate full API instructions
    // ═══════════════════════════════════════════════════════════════

    // master instruction builder - routes to specific action handlers
    buildInstruction(npcType, action, context = {}) {
        console.log(`🎭 NPCInstructionTemplates.buildInstruction called:`);
        console.log(`   - npcType: ${npcType}`);
        console.log(`   - action: ${action}`);
        console.log(`   - _loaded: ${this._loaded}`);

        // DOOM WORLD CHECK - use doom instructions when in doom world
        const inDoom = (typeof game !== 'undefined' && game.inDoomWorld) ||
                       (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld?.()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive);

        if (inDoom && typeof DoomNPCInstructionTemplates !== 'undefined') {
            console.log(`💀 DOOM WORLD ACTIVE - Using DoomNPCInstructionTemplates for ${npcType}`);
            return DoomNPCInstructionTemplates.buildDoomInstruction(npcType, action, context);
        }

        const spec = this.getNPCSpec(npcType);
        console.log(`   - spec found: ${spec ? spec.type : 'NO SPEC FOUND'}`);

        // build base context with NPC data
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

        // route to specific action builder
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
            case this.ACTIONS.OFFER_QUEST:
            case 'OFFER_QUEST':  // handle both enum and string versions
                return this._buildOfferQuestInstruction(spec, fullContext);
            case this.ACTIONS.DELIVER_ITEM:
            case 'DELIVER_ITEM':  // handle both enum and string versions
                return this._buildDeliverItemInstruction(spec, fullContext);
            case this.ACTIONS.CHECK_PROGRESS:
            case 'CHECK_PROGRESS':  // handle both enum and string versions
                return this._buildCheckProgressInstruction(spec, fullContext);
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
            case this.ACTIONS.ROBBERY_NEGOTIATE:
                return this._buildRobberyNegotiateInstruction(spec, fullContext);
            case this.ACTIONS.REPAIR:
                return this._buildRepairInstruction(spec, fullContext);
            case this.ACTIONS.COMBAT_WOUNDED:
                return this._buildCombatWoundedInstruction(spec, fullContext);
            case this.ACTIONS.COMBAT_VICTORY:
                return this._buildCombatVictoryInstruction(spec, fullContext);
            case this.ACTIONS.COMBAT_DEFEAT:
                return this._buildCombatDefeatInstruction(spec, fullContext);
            case this.ACTIONS.TURN_IN_QUEST:
                return this._buildTurnInQuestInstruction(spec, fullContext);
            default:
                return this._buildCustomInstruction(spec, fullContext, context.message);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SPECIFIC ACTION BUILDERS
    // ═══════════════════════════════════════════════════════════════

    // GREETING - first contact
    _buildGreetingInstruction(spec, context) {
        return `You are a ${spec.type}. Personality: ${spec.personality}. Say ONE short greeting sentence in character. Examples: "${spec.greetings?.[0] || 'Hello.'}"`;
    },

    // FAREWELL - ending conversation
    _buildFarewellInstruction(spec, context) {
        return `You are a ${spec.type}. Say ONE short farewell sentence in character. Example: "${spec.farewells?.[0] || 'Goodbye.'}"`;
    },

    // CHAT - full conversation with quest context!
    _buildChatInstruction(spec, context) {
        const npcName = context.npc?.name || spec.type;
        const npcType = spec.type;
        const location = context.location?.name || 'this place';

        // build quest context from QuestSystem
        let questContext = '';
        if (typeof QuestSystem !== 'undefined') {
            const locationId = context.location?.id || game?.currentLocation?.id;
            questContext = QuestSystem.getQuestContextForNPC?.(npcType, locationId) || '';
        }

        // build comprehensive instruction with full quest info
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

    // BROWSE GOODS - player wants to see what you sell
    _buildBrowseGoodsInstruction(spec, context) {
        const inventory = context.npc.inventory || spec.defaultInventory || [];
        const items = Array.isArray(inventory) ? inventory.slice(0, 4).join(', ') : 'various goods';

        return `You are a ${spec.type}. Player wants to browse your wares. Say ONE sentence inviting them to look at your goods (${items}). Then include the command {openMarket} to open the trade panel. Example: "Take a look at what I have! {openMarket}"`;
    },

    // BUY - player wants to purchase
    _buildBuyInstruction(spec, context) {
        return `You are a ${spec.type}. Player wants to buy. Say ONE sentence acknowledging and include {openMarket} to open trade. Example: "Let's see what catches your eye. {openMarket}"`;
    },

    // SELL - player wants to sell to you
    _buildSellInstruction(spec, context) {
        return `You are a ${spec.type}. Player wants to sell items. Say ONE sentence and include {openMarket}. Example: "Show me what you've got. {openMarket}"`;
    },

    // HAGGLE - player trying to negotiate
    _buildHaggleInstruction(spec, context) {
        const accepts = Math.random() < (spec.priceModifiers?.haggleChance || 0.3);
        if (accepts) {
            return `You are a ${spec.type}. Accept the haggle. Say ONE sentence agreeing to lower the price. Include {setDiscount:10}. Example: "Fine, I'll knock a bit off. {setDiscount:10}"`;
        }
        return `You are a ${spec.type}. Reject the haggle. Say ONE firm sentence refusing. Example: "My prices are fair. Take it or leave it."`;
    },

    // ASK QUEST - player wants work
    _buildQuestInstruction(spec, context) {
        // use NPCWorkflowSystem's pre-validated checker for reduced API lag
        if (typeof NPCWorkflowSystem !== 'undefined') {
            const npcData = { type: spec.type, quests: context.availableQuests || [] };
            const preValidated = NPCWorkflowSystem.getPreValidatedQuestAction(npcData, context.player || {});

            if (preValidated.action === 'OFFER_QUEST') {
                return `You are a ${spec.type}. Offer quest "${preValidated.questName}" in ONE sentence. ${preValidated.description || ''}. MUST include ${preValidated.command}. Example: "I have a task for you... ${preValidated.command}"`;
            }
        }

        // fallback to old logic
        const availableQuests = context.availableQuests || [];
        if (availableQuests.length > 0) {
            const q = availableQuests[0];
            return `You are a ${spec.type}. Offer this quest in ONE sentence: "${q.name}" - ${q.description}. Reward: ${q.rewards?.gold || 0} gold. MUST include {startQuest:${q.id}} at the end.`;
        }
        return `You are a ${spec.type}. Say ONE sentence: you have no work available right now.`;
    },

    // TURN IN QUEST - player delivering/completing a quest
    _buildTurnInQuestInstruction(spec, context) {
        // use NPCWorkflowSystem's pre-validated checker for reduced API lag
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

        // fallback to old logic
        return `You are a ${spec.type}. Say ONE sentence: you weren't expecting any delivery. Example: "I'm not expecting anything from you."`;
    },

    // ═══════════════════════════════════════════════════════════════
    // UNIFIED QUEST BUTTON INSTRUCTIONS - synced with PeoplePanel buttons
    // ═══════════════════════════════════════════════════════════════

    // OFFER QUEST - player clicked "Ask about: [Quest Name]" button
    _buildOfferQuestInstruction(spec, context) {
        // get quest context from the button click
        const questContext = context.questContext || context.questAction?.quest || {};
        const questId = questContext.questId || questContext.id;
        const questName = questContext.questName || questContext.name || 'a task';
        const questType = questContext.questType || questContext.type || 'task';
        const rewards = questContext.rewards || {};

        // build reward description
        let rewardDesc = '';
        if (rewards.gold) rewardDesc += `${rewards.gold} gold`;
        if (rewards.experience) rewardDesc += `${rewardDesc ? ', ' : ''}${rewards.experience} XP`;
        if (rewards.items) {
            const itemList = Object.entries(rewards.items).map(([k, v]) => `${v}x ${k}`).join(', ');
            rewardDesc += `${rewardDesc ? ', ' : ''}${itemList}`;
        }
        if (!rewardDesc) rewardDesc = 'a fair reward';

        // check if NPC can actually offer this quest
        if (!questId) {
            return `You are a ${spec.type}. Player is asking about work. Say ONE sentence: you don't have any tasks available right now. Be apologetic but brief.`;
        }

        // generate instruction for offering the specific quest
        return `You are a ${spec.type}. Player clicked "Ask about: ${questName}" button.

QUEST TO OFFER:
- Name: "${questName}"
- Type: ${questType}
- Rewards: ${rewardDesc}

YOUR RESPONSE:
1. Briefly describe the quest in ONE sentence
2. Mention the reward
3. MUST include {assignQuest:${questId}} at the end of your response

Example: "I need someone to ${questType === 'delivery' ? 'deliver a package' : 'handle a task'}. I'll pay ${rewardDesc}. {assignQuest:${questId}}"`;
    },

    // DELIVER ITEM - player clicked "Deliver: [Item]" button
    _buildDeliverItemInstruction(spec, context) {
        // get delivery context from the button click
        const questContext = context.questContext || context.questAction || {};
        const questId = questContext.questId;
        const itemName = questContext.itemName || 'the package';
        const giverName = questContext.giverName || 'someone';

        if (!questId) {
            return `You are a ${spec.type}. Player claims to have a delivery but you don't recognize it. Say ONE confused sentence. Example: "A delivery? I wasn't expecting anything..."`;
        }

        // generate instruction for accepting the delivery
        return `You are a ${spec.type}. Player clicked "📦 Deliver: ${itemName}" button.

DELIVERY DETAILS:
- Item: ${itemName}
- Sent by: ${giverName}
- Quest ID: ${questId}

YOUR RESPONSE:
1. Acknowledge receiving the delivery with relief/gratitude
2. Thank the player for bringing it
3. MUST include {confirmDelivery:${questId}} at the end

Example: "Ah, the ${itemName} from ${giverName}! Finally! Thank you for bringing this. {confirmDelivery:${questId}}"`;
    },

    // CHECK PROGRESS - player clicked "Progress: [Quest Name]" button
    _buildCheckProgressInstruction(spec, context) {
        // get progress context from the button click
        const questContext = context.questContext || context.questAction?.quest || {};
        const progressInfo = context.progressInfo || {};
        const questName = questContext.questName || questContext.name || 'the task';
        const progress = progressInfo.progress || 'in progress';
        const objectives = progressInfo.objectives || [];

        // build objective status description
        let objectiveDesc = '';
        if (objectives.length > 0) {
            const objList = objectives.map(obj => {
                const current = obj.current || 0;
                const target = obj.count || obj.rooms || 1;
                const done = obj.completed || (current >= target);
                return `${done ? '✓' : '○'} ${obj.description || obj.type}: ${current}/${target}`;
            }).join('\n');
            objectiveDesc = `\nObjectives:\n${objList}`;
        }

        // generate instruction for checking progress
        return `You are a ${spec.type}. Player clicked "⏳ Progress: ${questName}" button.

QUEST STATUS:
- Quest: "${questName}"
- Progress: ${progress}${objectiveDesc}

YOUR RESPONSE:
1. Acknowledge player is checking on the quest
2. Tell them their current progress
3. If incomplete: encourage them to continue
4. If complete: remind them they can turn it in

DO NOT include any command tags. Just provide information.

Example: "Ah yes, ${questName}. You're ${progress}. ${objectives.length > 0 && objectives.every(o => o.completed) ? 'Looks like you have everything - come back when ready!' : 'Keep at it, you are making progress.'}"`;
    },

    // ASK RUMORS - player wants gossip
    _buildRumorsInstruction(spec, context) {
        const rumors = context.rumors || [];
        const rumor = rumors[0] || 'Things have been quiet lately';
        return `You are a ${spec.type}. Share ONE rumor in ONE sentence: "${rumor}". Example: "I heard ${rumor.toLowerCase()}."`;
    },

    // ASK DIRECTIONS - player wants navigation help
    _buildDirectionsInstruction(spec, context) {
        const nearbyLocations = context.nearbyLocations || [];
        const places = nearbyLocations.slice(0, 2).map(l => l.name).join(' and ') || 'other settlements';
        return `You are a ${spec.type}. Give directions in ONE sentence mentioning: ${places}. Example: "Head east for ${places}."`;
    },

    // REST - player wants to rest at inn (10 gold, 6 hours, 100% vitals restored)
    _buildRestInstruction(spec, context) {
        const restCost = spec.restCost || 10;
        return `You are an innkeeper. Offer rest in ONE sentence: ${restCost} gold for a room (6 hours, fully restores all vitals). Include {offerRest:${restCost}}. Example: "A room's ${restCost} gold for the night. {offerRest:${restCost}}"`;
    },

    // HEAL - player wants healing
    _buildHealInstruction(spec, context) {
        const healCost = spec.healCost || 50;
        const healAmount = spec.healAmount || 50;
        return `You are a healer. Offer healing in ONE sentence: ${healCost} gold restores ${healAmount} health. Include {offerHeal:${healAmount},${healCost}}. Example: "I can heal you for ${healCost} gold. {offerHeal:${healAmount},${healCost}}"`;
    },

    // COMBAT TAUNT - boss taunting during fight
    _buildCombatTauntInstruction(spec, context) {
        const taunt = spec.encounter?.taunt?.responses?.[0] || 'You cannot defeat me!';
        return `You are a ${spec.type} in combat. Say ONE aggressive taunt. Example: "${taunt}"`;
    },

    // ROBBERY DEMAND - criminal demanding money
    _buildRobberyDemandInstruction(spec, context) {
        const demandAmount = Math.floor(Math.random() * 150 + 50);
        return `You are a ${spec.type} robbing the player. Demand ${demandAmount} gold in ONE threatening sentence. Include {robDemand:${demandAmount}}. Example: "Give me ${demandAmount} gold or else! {robDemand:${demandAmount}}"`;
    },

    // ROBBERY NEGOTIATE - player trying to negotiate with robber
    _buildRobberyNegotiateInstruction(spec, context) {
        const accepts = Math.random() < 0.4; // 40% chance of accepting negotiation
        if (accepts) {
            const reducedAmount = Math.floor((context.demandAmount || 100) * 0.6);
            return `You are a ${spec.type}. Player is trying to negotiate. Grudgingly accept a lower price. Say ONE sentence agreeing to ${reducedAmount} gold. Include {robDemand:${reducedAmount}}. Example: "Fine, ${reducedAmount} gold and you can go. {robDemand:${reducedAmount}}"`;
        }
        return `You are a ${spec.type}. Player is trying to negotiate. Reject their offer angrily. Say ONE threatening sentence refusing to lower your demand. Example: "No bargaining! Pay up or face my blade!"`;
    },

    // REPAIR - blacksmith repairing equipment
    _buildRepairInstruction(spec, context) {
        const repairCost = context.repairCost || 25;
        const itemName = context.itemName || 'your equipment';
        return `You are a ${spec.type}. Player wants ${itemName} repaired. Offer repair in ONE sentence: ${repairCost} gold to fix it. Include {offerRepair:${repairCost}}. Example: "I can fix ${itemName} for ${repairCost} gold. {offerRepair:${repairCost}}"`;
    },

    // COMBAT WOUNDED - NPC dialogue when player is badly wounded
    _buildCombatWoundedInstruction(spec, context) {
        const playerHealth = context.playerHealth || 'very low';
        return `You are a ${spec.type}. Player is wounded (${playerHealth} health). Say ONE concerned/mocking sentence depending on your personality. Example (friendly): "You look terrible! Let me help." Example (hostile): "Hah! Nearly finished you!"`;
    },

    // COMBAT VICTORY - NPC reaction after player wins combat
    _buildCombatVictoryInstruction(spec, context) {
        const enemyName = context.enemyName || 'the enemy';
        return `You are a ${spec.type}. Player just defeated ${enemyName}. Say ONE sentence reacting to their victory. Be impressed, congratulatory, or relieved depending on your personality. Example: "Well fought! ${enemyName} won't trouble us anymore."`;
    },

    // COMBAT DEFEAT - NPC reaction after player loses combat
    _buildCombatDefeatInstruction(spec, context) {
        const enemyName = context.enemyName || 'the enemy';
        return `You are a ${spec.type}. Player was just defeated by ${enemyName} and retreated. Say ONE sentence reacting - be sympathetic, offer advice, or mock them depending on your personality. Example: "That was a close call. Perhaps prepare better next time."`;
    },

    // CUSTOM - freeform player message
    _buildCustomInstruction(spec, context, playerMessage) {
        return `You are a ${spec.type}. Player says: "${playerMessage || 'Hello.'}". Respond in ONE sentence, in character. Use {openMarket} if they want to trade.`;
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════

    // format NPC type to display name
    formatNPCName(type) {
        if (!type) return 'Stranger';
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    // get random response from array
    getRandomResponse(responses) {
        if (!responses || !responses.length) return '';
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // get voice for NPC type
    getVoice(npcType) {
        const spec = this.getNPCSpec(npcType);
        return spec?.voice || 'nova';
    },

    // check if NPC type is a vendor
    isVendor(npcType) {
        const spec = this.getNPCSpec(npcType);
        return spec?.category === 'vendor' ||
               spec?.services?.includes('buy_items') ||
               spec?.services?.includes('sell_items');
    },

    // check if NPC is hostile
    isHostile(npcType) {
        const spec = this.getNPCSpec(npcType);
        return spec?.category === 'criminal' ||
               spec?.category === 'boss' ||
               ['robber', 'bandit', 'thief'].includes(npcType);
    },

    // get all NPC types by category
    getByCategory(category) {
        return Object.entries(this._npcData)
            .filter(([_, spec]) => spec.category === category)
            .map(([type, _]) => type);
    }
};

// global access
window.NPCInstructionTemplates = NPCInstructionTemplates;

// register with Bootstrap
Bootstrap.register('NPCInstructionTemplates', () => NPCInstructionTemplates.loadAllNPCData(), {
    dependencies: ['NPCManager'],
    priority: 57,
    severity: 'optional'
});

console.log('🎭 NPCInstructionTemplates ready - NPCs now have standardized voices 🖤💀');
