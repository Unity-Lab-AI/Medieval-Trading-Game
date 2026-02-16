// ═══════════════════════════════════════════════════════════════
// NPC WORKFLOW SYSTEM - the brains behind every interaction
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

console.log('🎭 NPCWorkflowSystem loading... teaching NPCs how to actually do their jobs');

const NPCWorkflowSystem = {

    // ═══════════════════════════════════════════════════════════════
    // interaction types - every way a player can interact with NPCs
    // ═══════════════════════════════════════════════════════════════

    INTERACTION_TYPES: {
        // === CONVERSATION ===
        GREETING: 'greeting',           // First contact, hello
        GOSSIP: 'gossip',               // General chat, rumors
        DIRECTIONS: 'directions',       // Asking for directions
        FAREWELL: 'farewell',           // Ending conversation

        // === TRADING ===
        TRADING_BUY: 'trading_buy',     // Player wants to buy items
        TRADING_SELL: 'trading_sell',   // Player wants to sell items
        TRADING_BROWSE: 'trading_browse', // Just looking at goods
        HAGGLING: 'haggling',           // Negotiating prices

        // === QUESTS ===
        QUEST_OFFER: 'quest_offer',     // NPC offers a quest
        QUEST_ACCEPT: 'quest_accept',   // Player accepts quest
        QUEST_DECLINE: 'quest_decline', // Player declines quest
        QUEST_PROGRESS: 'quest_progress', // Checking quest progress
        QUEST_TURNIN: 'quest_turnin',   // Turning in completed quest

        // === SERVICES ===
        SERVICES: 'services',           // Inn, blacksmith, healer services

        // === SOCIAL ===
        INTIMIDATION: 'intimidation',   // Threatening NPC
        PERSUASION: 'persuasion',       // Convincing NPC
        ROBBERY: 'robbery',             // NPC robbing player
        BRIBE: 'bribe',                 // Player bribing NPC

        // === COMBAT ===
        COMBAT_START: 'combat_start',   // Combat begins
        COMBAT_ROUND: 'combat_round',   // During combat
        COMBAT_PLAYER_HIT: 'combat_player_hit',   // Player lands a hit
        COMBAT_PLAYER_MISS: 'combat_player_miss', // Player misses
        COMBAT_ENEMY_HIT: 'combat_enemy_hit',     // Enemy lands a hit
        COMBAT_ENEMY_MISS: 'combat_enemy_miss',   // Enemy misses
        COMBAT_PLAYER_WIN: 'combat_player_win',   // Player wins fight
        COMBAT_PLAYER_FLEE: 'combat_player_flee', // Player runs away
        COMBAT_PLAYER_LOSE: 'combat_player_lose', // Player loses fight

        // === BOSS BATTLES ===
        BOSS_ENCOUNTER: 'boss_encounter', // Meeting a boss
        BOSS_COMBAT: 'boss_combat',     // Fighting a boss
        BOSS_TAUNT: 'boss_taunt',       // Boss taunts during fight
        BOSS_WOUNDED: 'boss_wounded',   // Boss at low health
        BOSS_DEFEAT: 'boss_defeat',     // Boss is defeated
        BOSS_KILLS_PLAYER: 'boss_kills_player', // Boss wins

        // === GATHERING ===
        GATHER_START: 'gather_start',   // Begin gathering
        GATHER_SUCCESS: 'gather_success', // Found resources
        GATHER_FAIL: 'gather_fail',     // Found nothing
        GATHER_RARE: 'gather_rare',     // Found rare item
        GATHER_DANGER: 'gather_danger', // Danger while gathering

        // === LOOT & TREASURE ===
        LOOT_FOUND: 'loot_found',       // Found loot/treasure
        LOOT_CHEST: 'loot_chest',       // Opening a chest
        LOOT_CORPSE: 'loot_corpse',     // Looting enemy corpse
        LOOT_RARE: 'loot_rare',         // Found rare/legendary item
        LOOT_TRAP: 'loot_trap',         // Trap on loot

        // === RANDOM EVENTS ===
        EVENT_AMBUSH: 'event_ambush',   // Ambushed by enemies
        EVENT_MERCHANT: 'event_merchant', // Random merchant encounter
        EVENT_BEGGAR: 'event_beggar',   // Beggar asks for help
        EVENT_WOUNDED_NPC: 'event_wounded_npc', // Find wounded NPC
        EVENT_WEATHER: 'event_weather', // Weather event
        EVENT_DISCOVERY: 'event_discovery', // Discover something
        EVENT_THEFT: 'event_theft',     // Something stolen
        EVENT_BLESSING: 'event_blessing', // Receive blessing
        EVENT_CURSE: 'event_curse',     // Receive curse

        // === DUNGEON ===
        DUNGEON_ENTER: 'dungeon_enter', // Enter dungeon
        DUNGEON_EXIT: 'dungeon_exit'    // Exit dungeon
    },

    // ═══════════════════════════════════════════════════════════════
    // command reference - all commands NPCs can use
    // ═══════════════════════════════════════════════════════════════

    COMMAND_REFERENCE: `
=== NPC COMMAND REFERENCE ===
You can affect the game by including commands in your dialogue. Commands are NOT spoken aloud - they are parsed and executed silently.

FORMAT: {commandName:param1,param2}

=== ITEM COMMANDS ===
{giveItem:ITEM_ID,QUANTITY} - Give item to player
  Example: "Here, take this health potion. {giveItem:health_potion,1}"

{takeItem:ITEM_ID,QUANTITY} - Take item from player
  Example: "I'll need those wolf pelts. {takeItem:wolf_pelt,5}"

{giveGold:AMOUNT} - Give gold to player
  Example: "Your reward - 100 gold pieces. {giveGold:100}"

{takeGold:AMOUNT} - Take gold from player
  Example: "That'll be 50 gold. {takeGold:50}"

=== QUEST COMMANDS ===
{startQuest:QUEST_ID} - Start a quest for the player
  Example: "I need you to gather herbs from the forest. {startQuest:herb_gathering}"

{completeQuest:QUEST_ID} - Mark quest as complete and give rewards
  Example: "Excellent work! Here's your reward. {completeQuest:herb_gathering}"

{updateQuest:QUEST_ID,OBJECTIVE,PROGRESS} - Update quest progress
  Example: "You've brought me 3 pelts. {updateQuest:wolf_hunt,pelts,3}"

{giveQuestItem:ITEM_ID} - Give a quest-specific item
  Example: "Take this letter to the mayor. {giveQuestItem:sealed_letter}"

{takeQuestItem:ITEM_ID} - Take quest item from player
  Example: "Ah, the sacred artifact! {takeQuestItem:ancient_relic}"

=== TRADING COMMANDS ===
{sellToPlayer:ITEM_ID,QUANTITY,PRICE} - Sell item to player at price
  Example: "This sword is yours for 200 gold. {sellToPlayer:steel_sword,1,200}"

{buyFromPlayer:ITEM_ID,QUANTITY,PRICE} - Buy item from player at price
  Example: "I'll give you 30 gold for those herbs. {buyFromPlayer:medicinal_herbs,10,30}"

{setDiscount:PERCENT} - Apply discount to next transaction
  Example: "Since you're a friend, 20% off! {setDiscount:20}"

{refuseTrade} - Refuse to trade with player
  Example: "I don't deal with your kind. {refuseTrade}"

=== STAT COMMANDS ===
{damage:AMOUNT} - Deal damage to player
  Example: "*strikes you* {damage:15}"

{heal:AMOUNT} - Heal the player
  Example: "Let me tend to your wounds. {heal:25}"

{restoreHunger:AMOUNT} - Restore player hunger
  Example: "Have some bread. {restoreHunger:30}"

{restoreThirst:AMOUNT} - Restore player thirst
  Example: "Drink this water. {restoreThirst:25}"

{restoreStamina:AMOUNT} - Restore player stamina
  Example: "Rest here a moment. {restoreStamina:20}"

=== REPUTATION COMMANDS ===
{repUp:AMOUNT} - Increase reputation with this NPC/faction
  Example: "You've proven yourself worthy. {repUp:10}"

{repDown:AMOUNT} - Decrease reputation
  Example: "That insult won't be forgotten. {repDown:15}"

=== SPECIAL COMMANDS ===
{unlock:THING_ID} - Unlock location, feature, or secret
  Example: "I'll tell you about the hidden cave. {unlock:secret_cave}"

{teleport:LOCATION_ID} - Teleport player to location
  Example: "Step through this portal. {teleport:mage_tower}"

{spawnEnemy:ENEMY_TYPE} - Spawn an enemy for combat
  Example: "Guards! {spawnEnemy:town_guard}"

{startCombat:ENEMY_ID} - Initiate combat with specific enemy
  Example: "You'll pay for that! {startCombat:bandit_leader}"

{endConversation} - Force end the conversation
  Example: "Leave me. {endConversation}"

=== IMPORTANT RULES ===
1. Commands go AFTER your spoken dialogue
2. Multiple commands can be chained: "Text {cmd1} {cmd2}"
3. Commands are SILENT - they don't appear in speech
4. Always check context before using commands
5. Don't use commands the player hasn't earned
`,

    // ═══════════════════════════════════════════════════════════════
    // trading workflow - how to handle buying and selling
    // ═══════════════════════════════════════════════════════════════

    getTradingContext(npcData, playerData, interactionType) {
        const inventory = npcData.inventory || {};
        const playerGold = playerData.gold || 0;
        const playerInventory = playerData.inventory || {};
        const reputation = playerData.reputation?.[npcData.location] || 0;

        let context = `
=== TRADING CONTEXT ===
You are a merchant. The player wants to trade with you.

YOUR INVENTORY (items you can sell):
${Object.entries(inventory).map(([id, qty]) => `- ${id}: ${qty} available`).join('\n') || '- No items in stock'}

PLAYER'S GOLD: ${playerGold} gold

PLAYER'S INVENTORY (items they can sell to you):
${Object.entries(playerInventory).map(([id, qty]) => `- ${id}: ${qty}`).join('\n') || '- Player has no items'}

YOUR GOLD (max you can pay): ${npcData.gold || 500} gold

REPUTATION WITH PLAYER: ${reputation} (affects prices)
- Negative rep = higher prices, refuse some deals
- Positive rep = discounts, better offers

=== TRADING RULES ===
`;

        if (interactionType === this.INTERACTION_TYPES.TRADING_BUY) {
            context += `
PLAYER WANTS TO BUY FROM YOU:
1. List items you have available with prices
2. If player asks for specific item, quote price
3. To complete sale: "That's [price] gold. {sellToPlayer:ITEM_ID,QTY,PRICE}"
4. If player can't afford: explain they need more gold
5. If out of stock: apologize, suggest alternatives

EXAMPLE SALE:
Player: "I'd like to buy a health potion"
You: "A health potion? That'll be 25 gold. {sellToPlayer:health_potion,1,25}"
`;
        } else if (interactionType === this.INTERACTION_TYPES.TRADING_SELL) {
            context += `
PLAYER WANTS TO SELL TO YOU:
1. Ask what they're selling
2. Offer a fair price (you can haggle)
3. To complete purchase: "I'll give you [price] gold. {buyFromPlayer:ITEM_ID,QTY,PRICE}"
4. If you don't want item: politely refuse
5. If you can't afford: explain your gold is limited

EXAMPLE PURCHASE:
Player: "I want to sell these wolf pelts"
You: "Wolf pelts, eh? I'll give you 15 gold for those. {buyFromPlayer:wolf_pelt,3,15}"
`;
        } else {
            context += `
PLAYER IS BROWSING:
1. Greet them warmly (based on personality)
2. Mention your best items
3. Ask if they want to buy or sell
4. Don't push too hard - let them decide
`;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // pre-validated quest checker - client-side validation to reduce API lag
    // ═══════════════════════════════════════════════════════════════

    /**
     * Pre-validates quest state CLIENT-SIDE so API doesn't have to figure it out.
     * Returns simple action directive instead of raw data dumps.
     */
    getPreValidatedQuestAction(npcData, playerData) {
        const npcType = npcData?.type || npcData?.id;
        const activeQuests = playerData?.activeQuests || (typeof QuestSystem !== 'undefined' ? QuestSystem.activeQuests : {});
        const completedQuests = playerData?.completedQuests || (typeof QuestSystem !== 'undefined' ? QuestSystem.completedQuests : []);

        // priority check: player completed a quest for this puppet - reward them
        for (const [questId, quest] of Object.entries(activeQuests)) {
            const isReady = typeof QuestSystem !== 'undefined' ?
                QuestSystem.checkProgress(questId)?.status === 'ready_to_complete' : false;

            if (isReady && (quest.giver === npcType || quest.turnInNpc === npcType)) {
                // Validate collection items are actually in inventory
                const missingItems = [];
                for (const obj of quest.objectives || []) {
                    if (obj.type === 'collect' && obj.item) {
                        const has = game?.player?.inventory?.[obj.item] || 0;
                        if (has < obj.count) {
                            missingItems.push({ item: obj.item, need: obj.count, have: has });
                        }
                    }
                }

                if (missingItems.length === 0) {
                    return {
                        action: 'COMPLETE_QUEST',
                        questId: questId,
                        questName: quest.name,
                        command: `{completeQuest:${questId}}`,
                        message: `Player has completed "${quest.name}" - accept turn-in and give reward`
                    };
                } else {
                    return {
                        action: 'MISSING_ITEMS',
                        questId: questId,
                        questName: quest.name,
                        missingItems: missingItems,
                        message: `Quest "${quest.name}" objectives done but player missing: ${missingItems.map(m => `${m.need - m.have}x ${m.item}`).join(', ')}`
                    };
                }
            }
        }

        // second check: player has active quest from this hollow soul - give progress update
        for (const [questId, quest] of Object.entries(activeQuests)) {
            if (quest.giver === npcType || quest.turnInNpc === npcType) {
                const progress = typeof QuestSystem !== 'undefined' ? QuestSystem.checkProgress(questId) : null;
                return {
                    action: 'CHECK_PROGRESS',
                    questId: questId,
                    questName: quest.name,
                    progress: progress?.progress || 'unknown',
                    objectives: quest.objectives,
                    message: `Player has active quest "${quest.name}" - remind them what's needed`
                };
            }
        }

        // final check: does this puppet have a fresh quest to offer the player?
        const npcQuests = npcData?.quests || [];
        for (const quest of npcQuests) {
            const qId = quest.id || quest;
            const questDef = typeof QuestSystem !== 'undefined' ? QuestSystem.quests[qId] : quest;
            if (!questDef) continue;

            const alreadyActive = activeQuests[qId];
            const alreadyDone = completedQuests.includes(qId);
            const prereqMet = !questDef.prerequisite || completedQuests.includes(questDef.prerequisite);

            if (!alreadyActive && !alreadyDone && prereqMet) {
                return {
                    action: 'OFFER_QUEST',
                    questId: qId,
                    questName: questDef.name,
                    description: questDef.description,
                    command: `{startQuest:${qId}}`,
                    message: `You can offer quest "${questDef.name}" - use ${`{startQuest:${qId}}`} when player accepts`
                };
            }
        }

        // no quest actions available
        return {
            action: 'NO_QUEST',
            message: 'No quest actions available with this NPC - have normal conversation'
        };
    },

    /**
     * Pre-validates item state CLIENT-SIDE for collection/delivery quests.
     */
    getPreValidatedItemCheck(itemId, requiredQty = 1) {
        const playerHas = game?.player?.inventory?.[itemId] || 0;
        const questItemHas = game?.player?.questItems?.[itemId] ? 1 : 0;

        return {
            itemId: itemId,
            required: requiredQty,
            playerHas: playerHas,
            hasQuestItem: questItemHas > 0,
            canComplete: playerHas >= requiredQty || questItemHas > 0,
            message: playerHas >= requiredQty ?
                `Player HAS ${playerHas}x ${itemId} - can complete` :
                `Player MISSING ${requiredQty - playerHas}x ${itemId}`
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // quest workflow - how to handle quest interactions
    // ═══════════════════════════════════════════════════════════════

    getQuestContext(npcData, playerData, interactionType, questData = null) {
        // use pre-validated quest checker to reduce API context size
        const preValidated = this.getPreValidatedQuestAction(npcData, playerData);

        let context = `\n=== QUEST STATUS (PRE-VALIDATED) ===\n`;

        // simple, direct instructions based on pre-validation
        switch (preValidated.action) {
            case 'COMPLETE_QUEST':
                context += `QUEST READY TO COMPLETE: "${preValidated.questName}"
ACTION: Accept the turn-in and complete the quest.
USE THIS COMMAND: ${preValidated.command}
EXAMPLE: "Well done! You've completed the task. Here's your reward. ${preValidated.command}"
`;
                break;

            case 'MISSING_ITEMS':
                context += `QUEST INCOMPLETE: "${preValidated.questName}"
PROBLEM: ${preValidated.message}
ACTION: Tell player what items they still need. Do NOT complete the quest.
`;
                break;

            case 'CHECK_PROGRESS':
                context += `ACTIVE QUEST: "${preValidated.questName}"
PROGRESS: ${preValidated.progress}
ACTION: Remind player what they need to do. Give hints if asked.
`;
                break;

            case 'OFFER_QUEST':
                context += `NEW QUEST AVAILABLE: "${preValidated.questName}"
DESCRIPTION: ${preValidated.description || 'No description'}
ACTION: Offer this quest to the player. If they accept, use: ${preValidated.command}
EXAMPLE: "I have a task for you... [describe quest]. Will you help? ${preValidated.command}"
`;
                break;

            case 'NO_QUEST':
            default:
                context += `No quest interactions available. Have a normal conversation.
`;
                break;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // gossip & information workflow
    // ═══════════════════════════════════════════════════════════════

    getGossipContext(npcData, locationData, worldState) {
        const location = locationData?.name || 'this area';
        const nearbyLocations = locationData?.connectedTo || [];
        const localEvents = worldState?.events || [];
        const rumors = worldState?.rumors || [];

        return `
=== GOSSIP & INFORMATION CONTEXT ===

CURRENT LOCATION: ${location}

NEARBY PLACES (you can give directions):
${nearbyLocations.map(loc => `- ${loc}`).join('\n') || '- No known nearby locations'}

LOCAL NEWS/EVENTS:
${localEvents.map(e => `- ${e}`).join('\n') || '- Nothing unusual happening'}

RUMORS YOU'VE HEARD:
${rumors.map(r => `- ${r}`).join('\n') || '- No interesting rumors'}

HOW TO HANDLE GOSSIP:
1. Share information based on your personality
2. Greedy NPCs might want payment for info
3. Friendly NPCs share freely
4. Mysterious NPCs speak in riddles
5. You can unlock secrets: {unlock:SECRET_ID}

EXAMPLE:
Player: "Heard any rumors?"
You: "Word is there's a hidden cave north of here... full of treasure, they say. {unlock:hidden_cave} But you didn't hear that from me."
`;
    },

    // ═══════════════════════════════════════════════════════════════
    // services workflow - Inn, Blacksmith, Healer, etc.
    // ═══════════════════════════════════════════════════════════════

    getServicesContext(npcData, playerData, serviceType) {
        const playerGold = playerData.gold || 0;
        const playerHealth = playerData.stats?.health || 100;
        const playerMaxHealth = playerData.stats?.maxHealth || 100;
        const playerHunger = playerData.stats?.hunger || 100;
        const playerThirst = playerData.stats?.thirst || 100;

        let context = `
=== SERVICES CONTEXT ===
PLAYER STATUS:
- Gold: ${playerGold}
- Health: ${playerHealth}/${playerMaxHealth}
- Hunger: ${playerHunger}/100
- Thirst: ${playerThirst}/100
`;

        switch (serviceType) {
            case 'inn':
                context += `
YOU ARE AN INNKEEPER. Services you offer:
1. Room for the night (50 gold) - Full rest
   "A room? 50 gold for the night. {takeGold:50}{heal:${playerMaxHealth - playerHealth}}{restoreHunger:100}{restoreThirst:100}{restoreStamina:100}"

2. Meal (15 gold) - Restores hunger
   "Hot meal coming up! 15 gold. {takeGold:15}{restoreHunger:50}"

3. Drink (5 gold) - Restores thirst
   "Ale or water? 5 gold either way. {takeGold:5}{restoreThirst:30}"

4. Information - Free with personality-appropriate delivery
`;
                break;

            case 'healer':
                context += `
YOU ARE A HEALER. Services you offer:
1. Full healing (${Math.ceil((playerMaxHealth - playerHealth) * 2)} gold)
   "Let me heal your wounds. {takeGold:${Math.ceil((playerMaxHealth - playerHealth) * 2)}}{heal:${playerMaxHealth - playerHealth}}"

2. Cure poison (30 gold)
   "I can cure that poison. 30 gold. {takeGold:30}{curePoison}"

3. Cure disease (50 gold)
   "Disease is tricky... 50 gold. {takeGold:50}{cureDisease}"

4. Sell potions - use trading workflow
`;
                break;

            case 'blacksmith':
                context += `
YOU ARE A BLACKSMITH. Services you offer:
1. Repair equipment (varies by item)
   "I can fix that for [price] gold. {takeGold:PRICE}{repairItem:ITEM_ID}"

2. Buy/Sell weapons and armor - use trading workflow

3. Upgrade equipment (if player has materials)
   "With these materials, I can improve your sword. {takeItem:iron_ingot,3}{takeGold:100}{upgradeItem:steel_sword}"
`;
                break;

            default:
                context += `
Offer services appropriate to your role.
Always quote prices before taking gold.
`;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // 👹 BOSS ENCOUNTER WORKFLOW
    // ═══════════════════════════════════════════════════════════════

    getBossContext(bossData, playerData, interactionType) {
        const bossHealth = bossData.health || 100;
        const bossDamage = bossData.damage || { min: 10, max: 20 };
        const playerHealth = playerData.stats?.health || 100;

        let context = `
=== BOSS ENCOUNTER CONTEXT ===
YOU ARE: ${bossData.name}
YOUR ROLE: ${bossData.title || 'Dungeon Boss'}
YOUR PERSONALITY: ${bossData.personality}

YOUR STATS:
- Health: ${bossHealth}
- Damage: ${bossDamage.min}-${bossDamage.max}

PLAYER STATS:
- Health: ${playerHealth}

`;

        switch (interactionType) {
            case this.INTERACTION_TYPES.BOSS_ENCOUNTER:
                context += `
FIRST ENCOUNTER - You just met the player in your domain.

HOW TO REACT:
1. Be MENACING - this is YOUR territory
2. Threaten them appropriately to your personality
3. Do NOT be friendly - you are a BOSS
4. Do NOT say "greetings traveler" - that's generic NPC garbage
5. Reference your domain, your power, your hunger for their soul/gold/blood

GOOD EXAMPLES:
- Dark Lord: "Foolish mortal... you DARE enter MY domain? Your soul will feed my darkness!"
- Dragon: "Mortal... I have burned KINGDOMS. Your bones will join my hoard."
- Bandit Chief: "Well well... another hero come to die. Your gold AND your life!"
- Frost Lord: "The cold... eternal... Your warmth... fades..."

DO NOT SAY:
- "Greetings traveler"
- "Welcome friend"
- "How can I help you"
- Anything friendly or generic
`;
                break;

            case this.INTERACTION_TYPES.BOSS_COMBAT:
                context += `
COMBAT - You are fighting the player!

HOW TO REACT:
1. Taunt them as you fight
2. Reference your attacks
3. Show your power
4. Can deal damage: {damage:${Math.floor((bossDamage.min + bossDamage.max) / 2)}}

COMBAT TAUNTS:
- "Feel my wrath!" {damage:15}
- "Is that all you have?!"
- "You cannot defeat me!"
- "Your death approaches!"
`;
                break;

            case this.INTERACTION_TYPES.BOSS_DEFEAT:
                context += `
YOU ARE DYING - The player has defeated you!

HOW TO REACT:
1. Express disbelief
2. Curse them
3. Promise vengeance or accept defeat
4. Be dramatic - this is your death scene!

DEATH EXAMPLES:
- "IMPOSSIBLE! I am... eternal..." *dissolves*
- "You... you got lucky... curse you..."
- "The darkness... will return... *dies*"
- "My hoard... my kingdom... NOOOO!"
`;
                break;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // combat context - for all combat interactions
    // ═══════════════════════════════════════════════════════════════

    getCombatContext(enemyData, playerData, interactionType) {
        const enemyHealth = enemyData.health || 100;
        const enemyMaxHealth = enemyData.maxHealth || 100;
        const enemyDamage = enemyData.damage || { min: 5, max: 15 };
        const playerHealth = playerData.stats?.health || 100;
        const enemyType = enemyData.type || 'enemy';
        const enemyName = enemyData.name || 'Enemy';

        let context = `
=== COMBAT CONTEXT ===
YOU ARE: ${enemyName} (${enemyType})
YOUR HEALTH: ${enemyHealth}/${enemyMaxHealth}
YOUR DAMAGE: ${enemyDamage.min}-${enemyDamage.max}
PLAYER HEALTH: ${playerHealth}

`;

        switch (interactionType) {
            case this.INTERACTION_TYPES.COMBAT_START:
                context += `
COMBAT BEGINS! You are attacking the player.

HOW TO REACT based on your type:
- Bandit: "Your gold or your life!" (threaten, demand)
- Wolf/Beast: *snarls and lunges* (no speech, just action)
- Skeleton: *bones rattle as it raises its sword* (minimal speech)
- Goblin: "Get the human! Take its shinies!" (crude, greedy)
- Guard: "Halt! You're under arrest!" (authoritative)

DO NOT say "greetings" or be friendly - you are ATTACKING.
Keep it short - 1 sentence max. Include {damage:X} if striking first.
`;
                break;

            case this.INTERACTION_TYPES.COMBAT_ROUND:
                context += `
COMBAT IN PROGRESS - exchange blows!

React to the current state of battle:
- If winning: taunt, mock, confident
- If losing: desperate, enraged, fearful
- If evenly matched: determined, focused

Keep responses SHORT - combat is fast. 1 sentence.
`;
                break;

            case this.INTERACTION_TYPES.COMBAT_PLAYER_HIT:
                context += `
THE PLAYER JUST HIT YOU! React to taking damage.

Examples:
- "Argh! You'll pay for that!" (angry)
- *staggers back, snarling* (beast)
- "A lucky blow..." (dismissive)
- "Is that all you've got?!" (taunting)

1 sentence. Show pain or defiance.
`;
                break;

            case this.INTERACTION_TYPES.COMBAT_PLAYER_MISS:
                context += `
THE PLAYER MISSED! Mock their failure.

Examples:
- "Too slow!" *counterattacks* {damage:10}
- "Ha! Can't touch me!"
- *sidesteps easily* "Pathetic."

1 sentence. Be cocky. Can counterattack with {damage:X}.
`;
                break;

            case this.INTERACTION_TYPES.COMBAT_ENEMY_HIT:
                context += `
YOU JUST HIT THE PLAYER! Celebrate your strike.

Examples:
- "Feel my blade!" {damage:12}
- *claws rake across them* {damage:8}
- "Die, fool!" {damage:15}

1 sentence. Include {damage:X} with your attack.
`;
                break;

            case this.INTERACTION_TYPES.COMBAT_ENEMY_MISS:
                context += `
YOU MISSED! React to your failure.

Examples:
- "Damn! Hold still!"
- *swings wildly* "I'll get you!"
- *growls in frustration*

1 sentence. Show frustration.
`;
                break;

            case this.INTERACTION_TYPES.COMBAT_PLAYER_WIN:
                context += `
YOU ARE DEFEATED! The player has won.

Examples:
- "No... impossible..." *collapses*
- *whimpers and falls*
- "You... haven't seen... the last..." *dies*
- "Mercy! I yield!" (if can surrender)

Short death/defeat line. Be dramatic or pathetic depending on type.
`;
                break;

            case this.INTERACTION_TYPES.COMBAT_PLAYER_FLEE:
                context += `
THE PLAYER IS RUNNING AWAY! React to their cowardice.

Examples:
- "Run, coward! And don't come back!"
- "That's right, flee before me!"
- *howls in triumph as prey escapes*

1 sentence. Mocking or relieved.
`;
                break;

            case this.INTERACTION_TYPES.COMBAT_PLAYER_LOSE:
                context += `
YOU WON! The player is defeated.

Examples:
- "Another fool falls before me." {damage:999}
- *stands over the fallen body* "Weakling."
- "Your gold is mine now!" {takeGold:50}

Short victory line. Can loot with {takeGold:X} or {takeItem:X,Y}.
`;
                break;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // gathering context - for resource gathering events
    // ═══════════════════════════════════════════════════════════════

    getGatheringContext(gatheringData, playerData, interactionType) {
        const resourceType = gatheringData.resourceType || 'resource';
        const location = gatheringData.location || 'the area';
        const tool = gatheringData.tool || 'hands';

        let context = `
=== GATHERING CONTEXT ===
This is a NARRATION of the player gathering resources.
You are the NARRATOR, not an NPC. Describe what happens in second person ("You...").

RESOURCE: ${resourceType}
LOCATION: ${location}
TOOL: ${tool}

`;

        switch (interactionType) {
            case this.INTERACTION_TYPES.GATHER_START:
                context += `
The player begins gathering. Set the scene briefly.

Examples:
- "You scan the area for ${resourceType}, ${tool} at the ready."
- "You kneel down and begin searching through the undergrowth."
- "You approach the vein of ore, pickaxe in hand."

1-2 sentences. Build anticipation.
`;
                break;

            case this.INTERACTION_TYPES.GATHER_SUCCESS:
                context += `
The player found resources! Describe the success.

Examples:
- "You find some quality ${resourceType}. {giveItem:${resourceType},3}"
- "Your efforts pay off - a decent haul. {giveItem:${resourceType},2}"
- "You gather what you can find. {giveItem:${resourceType},1}"

Include {giveItem:ITEM_ID,QUANTITY} to give the resources.
`;
                break;

            case this.INTERACTION_TYPES.GATHER_FAIL:
                context += `
The player found nothing. Describe the failure.

Examples:
- "You search but find nothing of value here."
- "The area has been picked clean. Nothing remains."
- "Despite your efforts, you come up empty-handed."

1 sentence. No items given.
`;
                break;

            case this.INTERACTION_TYPES.GATHER_RARE:
                context += `
The player found something RARE! Make it exciting!

Examples:
- "Your eyes widen - a rare gem glints in the soil! {giveItem:rare_gem,1}"
- "Incredible! You've found a pristine specimen! {giveItem:perfect_pelt,1}"
- "The gods smile upon you - a legendary find! {giveItem:ancient_artifact,1}"

Make it feel special! Include {giveItem:RARE_ITEM,1}.
`;
                break;

            case this.INTERACTION_TYPES.GATHER_DANGER:
                context += `
DANGER while gathering! Something attacks or threatens.

Examples:
- "A snake strikes from the brush! {damage:10}"
- "You disturb a nest of spiders! {damage:5}"
- "The ground gives way beneath you! {damage:15}"
- "A rival gatherer appears, blade drawn..."

Include {damage:X} if harm occurs. Can trigger combat.
`;
                break;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // loot context - for treasure and loot finds
    // ═══════════════════════════════════════════════════════════════

    getLootContext(lootData, playerData, interactionType) {
        const lootSource = lootData.source || 'container';
        const lootContents = lootData.contents || [];
        const lootGold = lootData.gold || 0;

        let context = `
=== LOOT CONTEXT ===
This is a NARRATION of the player finding/looting something.
You are the NARRATOR. Describe in second person ("You...").

SOURCE: ${lootSource}
POTENTIAL CONTENTS: ${lootContents.join(', ') || 'various items'}
GOLD: ${lootGold}

`;

        switch (interactionType) {
            case this.INTERACTION_TYPES.LOOT_FOUND:
                context += `
The player finds loot! Describe what they discover.

Examples:
- "You find a small pouch of coins. {giveGold:25}"
- "Hidden beneath the debris, you spot a useful item. {giveItem:health_potion,1}"
- "A forgotten stash - your lucky day! {giveGold:50}{giveItem:lockpick,2}"

Include {giveGold:X} and/or {giveItem:ID,QTY} for the loot.
`;
                break;

            case this.INTERACTION_TYPES.LOOT_CHEST:
                context += `
The player opens a chest! Build suspense, then reveal contents.

Examples:
- "The lid creaks open... inside you find gold and supplies! {giveGold:100}{giveItem:rope,1}"
- "The chest is unlocked. You eagerly look inside... {giveGold:75}{giveItem:torch,3}"
- "With a click, the chest opens. A modest treasure awaits. {giveGold:30}"

Make it feel rewarding. Include loot commands.
`;
                break;

            case this.INTERACTION_TYPES.LOOT_CORPSE:
                context += `
The player loots a fallen enemy. Be matter-of-fact or grim.

Examples:
- "You search the body, finding a few coins. {giveGold:15}"
- "The fallen bandit carried little of value. {giveGold:8}{giveItem:rusty_dagger,1}"
- "You strip the corpse of useful items. {giveItem:wolf_pelt,1}"

Keep it brief. Include loot commands.
`;
                break;

            case this.INTERACTION_TYPES.LOOT_RARE:
                context += `
RARE LOOT! The player finds something exceptional!

Examples:
- "Your breath catches - a legendary weapon! {giveItem:flaming_sword,1}"
- "Impossible! An artifact of immense power! {giveItem:dragon_scale_armor,1}"
- "A king's ransom in gold! {giveGold:500}"

Make it EPIC! This is a major find. Include rare item command.
`;
                break;

            case this.INTERACTION_TYPES.LOOT_TRAP:
                context += `
TRAP! The loot was trapped!

Examples:
- "Click. Poison darts shoot from the walls! {damage:20}"
- "The chest explodes! {damage:35}"
- "A blade springs from the lock! {damage:15}"
- "Gas fills the room - you feel weak... {damage:10}"

Include {damage:X}. Player may still get partial loot after.
`;
                break;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // random event context - for world events
    // ═══════════════════════════════════════════════════════════════

    getRandomEventContext(eventData, playerData, interactionType) {
        const eventType = eventData.type || 'unknown';
        const location = eventData.location || 'the road';
        const npcInvolved = eventData.npc || null;

        let context = `
=== RANDOM EVENT CONTEXT ===
A random event occurs! You are the NARRATOR unless an NPC speaks.
LOCATION: ${location}
EVENT TYPE: ${eventType}

`;

        switch (interactionType) {
            case this.INTERACTION_TYPES.EVENT_AMBUSH:
                context += `
AMBUSH! Enemies attack without warning!

Examples:
- "From the shadows they strike! 'Your valuables, now!' {damage:5}"
- "Bandits emerge from hiding! 'Nobody move!'"
- "Wolves burst from the treeline, hungry for prey!"

No "hello" - this is an ATTACK. Start combat immediately.
Include {damage:X} for surprise attack. Sets hostile tone.
`;
                break;

            case this.INTERACTION_TYPES.EVENT_MERCHANT:
                context += `
A wandering merchant appears! They want to trade.

Examples:
- "A cloaked figure waves you down. 'Traveler! I have wares...'"
- "A cart rattles to a stop. 'Looking to buy or sell, friend?'"
- "'Psst! Interested in... special goods?'" (shady merchant)

Merchant personality varies. Can be friendly, shady, or desperate.
`;
                break;

            case this.INTERACTION_TYPES.EVENT_BEGGAR:
                context += `
A beggar approaches asking for help.

Examples:
- "'Please, spare a coin? I haven't eaten in days...'"
- "A ragged figure blocks your path. 'Help a poor soul?'"
- "'Kind traveler, anything you can spare...'"

Can give with {giveGold:X} for karma, or refuse.
Beggars may give info, or could be a trap.
`;
                break;

            case this.INTERACTION_TYPES.EVENT_WOUNDED_NPC:
                context += `
You find a wounded person! They need help.

Examples:
- "A bloodied traveler crawls toward you. 'Please... help me...'"
- "Moaning from the bushes - someone is hurt badly."
- "'Bandits... they took everything... please, water...'"

Player can help (gain reputation) or ignore.
Helping may lead to rewards or quests.
`;
                break;

            case this.INTERACTION_TYPES.EVENT_WEATHER:
                context += `
Weather event! Describe the environmental change.

Examples:
- "Storm clouds gather. Thunder rumbles in the distance..."
- "A sudden downpour soaks you to the bone. Seek shelter!"
- "The fog rolls in thick. You can barely see your hand."
- "Blistering heat beats down. You feel thirst rising. {restoreThirst:-10}"

Can affect stats with commands. Sets atmosphere.
`;
                break;

            case this.INTERACTION_TYPES.EVENT_DISCOVERY:
                context += `
You discover something interesting!

Examples:
- "You notice strange markings on a tree... a hidden message? {unlock:secret_path}"
- "A glint catches your eye - something is buried here!"
- "You stumble upon ancient ruins, untouched for centuries."
- "A hidden cave entrance, concealed by vines..."

Use {unlock:LOCATION_ID} to reveal secrets. Build mystery.
`;
                break;

            case this.INTERACTION_TYPES.EVENT_THEFT:
                context += `
Something was stolen! React to the loss.

Examples:
- "Your coin purse feels light... someone picked your pocket! {takeGold:30}"
- "You reach for your supplies - gone! A thief in the night! {takeItem:rations,5}"
- "A street urchin dashes away with your belongings! {takeGold:20}"

Include {takeGold:X} or {takeItem:ID,QTY} for what was stolen.
`;
                break;

            case this.INTERACTION_TYPES.EVENT_BLESSING:
                context += `
A blessing! Something good happens unexpectedly.

Examples:
- "A priest blesses you as you pass. You feel invigorated! {heal:20}"
- "You find a four-leaf clover. Luck smiles upon you!"
- "A warm feeling washes over you... divine favor. {heal:50}"
- "The shrine glows. Your wounds begin to heal! {heal:100}"

Include {heal:X} or other positive commands. Make it feel earned.
`;
                break;

            case this.INTERACTION_TYPES.EVENT_CURSE:
                context += `
A curse! Bad fortune strikes!

Examples:
- "You feel a cold chill. Something watches from the darkness... {damage:5}"
- "The old crone cackles. 'A curse upon you!' {damage:10}"
- "You broke the tomb's seal. An ancient curse takes hold..."
- "Bad luck follows you like a shadow..."

Include {damage:X} or negative effects. Ominous tone.
`;
                break;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // dungeon context - for dungeon exploration events
    // ═══════════════════════════════════════════════════════════════

    getDungeonContext(dungeonData, playerData, interactionType) {
        const dungeonName = dungeonData.name || 'the dungeon';
        const roomType = dungeonData.roomType || 'chamber';
        const floorLevel = dungeonData.floor || 1;

        let context = `
=== DUNGEON CONTEXT ===
You are the NARRATOR. Describe the dungeon in second person ("You...").
DUNGEON: ${dungeonName}
FLOOR: ${floorLevel}
ROOM TYPE: ${roomType}

`;

        switch (interactionType) {
            case this.INTERACTION_TYPES.DUNGEON_ENTER:
                context += `
The player enters the dungeon! Set an ominous tone.

Examples:
- "You descend into darkness. The air grows cold and damp..."
- "The ancient doors groan as you push them open. Dust fills your lungs."
- "Torchlight flickers against stone walls. Something skitters in the shadows..."

Build atmosphere. Hint at dangers ahead.
`;
                break;

            case this.INTERACTION_TYPES.DUNGEON_EXIT:
                context += `
The player exits the dungeon! Triumphant or retreating?

Examples:
- "Daylight! Fresh air fills your lungs as you emerge victorious."
- "You scramble out of the depths, wounded but alive."
- "The dungeon releases you... for now. Its secrets remain."

Summarize their success or escape. End on appropriate note.
`;
                break;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // greeting context - varies by NPC type
    // ═══════════════════════════════════════════════════════════════

    getGreetingContext(npcData, playerData, interactionType) {
        const npcType = npcData.type || 'civilian';
        const personality = npcData.personality || 'friendly';
        const reputation = playerData.reputation?.[npcData.location] || 0;

        let context = `
=== GREETING CONTEXT ===
NPC TYPE: ${npcType}
PERSONALITY: ${personality}
PLAYER REPUTATION: ${reputation}

HOW DIFFERENT NPCS GREET (or don't):
`;

        // Different greeting styles based on NPC type
        if (npcType === 'merchant' || npcType === 'shopkeeper') {
            context += `
You are a MERCHANT. Greet based on your personality:
- Friendly: "Welcome, welcome! Looking to buy or sell?"
- Greedy: "Hmm, you look like you have coin... Come, see my wares."
- Shrewd: "Ah, a customer. Let's talk business."
- Desperate: "Please, please, I have goods! Very cheap!"
`;
        } else if (npcType === 'guard' || npcType === 'soldier') {
            context += `
You are a GUARD. Be professional or suspicious:
- "State your business, citizen."
- "Move along. No loitering."
- "Keep out of trouble and we'll get along fine."
- If player has bad rep: "You again? I'm watching you..."
`;
        } else if (npcType === 'criminal' || npcType === 'thief' || npcType === 'bandit') {
            context += `
You are a CRIMINAL. You do NOT greet warmly:
- "What do you want?" (suspicious)
- *eyes you silently* (threatening)
- "You didn't see me. Understand?" (warning)
- Might just attack: "Wrong place, wrong time..." {damage:5}
NO friendly greetings! You're a criminal!
`;
        } else if (npcType === 'noble' || npcType === 'aristocrat') {
            context += `
You are NOBILITY. Be haughty and dismissive:
- "Hmph. What does this commoner want?"
- *barely acknowledges you* "Speak quickly, I'm busy."
- "You may address me as Lord/Lady [name]."
`;
        } else if (npcType === 'beggar' || npcType === 'homeless') {
            context += `
You are a BEGGAR. Be desperate and humble:
- "Spare a coin, kind stranger?"
- "Please... I haven't eaten today..."
- "Any help... anything at all..."
`;
        } else if (npcType === 'innkeeper' || npcType === 'bartender') {
            context += `
You are an INNKEEPER. Be welcoming but businesslike:
- "Welcome to my establishment! Room or drink?"
- "Come in, come in! What'll it be?"
- "Weary traveler! Rest your feet, warm your belly."
`;
        } else if (npcType === 'priest' || npcType === 'cleric') {
            context += `
You are a PRIEST. Be serene and spiritual:
- "Blessings upon you, child."
- "The gods welcome all to this sacred place."
- "Peace be with you. How may I serve?"
`;
        } else if (npcType === 'blacksmith' || npcType === 'craftsman') {
            context += `
You are a CRAFTSMAN. Be practical and direct:
- "Need something fixed? Forged? I'm your smith."
- *wipes brow* "What brings you to my forge?"
- "Good steel for good coin. What do you need?"
`;
        } else {
            context += `
You are a CIVILIAN. Base greeting on personality and reputation:
- Friendly + good rep: "Hello there, friend!"
- Friendly + neutral: "Good day to you."
- Suspicious + bad rep: "What do you want?"
- Scared + bad rep: "P-please don't hurt me..."
`;
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // build full context - combines everything for the AI
    // ═══════════════════════════════════════════════════════════════

    buildFullContext(options) {
        const {
            npcData,
            playerData,
            interactionType,
            locationData,
            worldState,
            questData,
            serviceType,
            conversationHistory
        } = options;

        let fullContext = '';

        // 1. Add command reference
        fullContext += this.COMMAND_REFERENCE;

        // 2. Add NPC identity
        fullContext += `
=== YOUR IDENTITY ===
Name: ${npcData.name || 'Unknown NPC'}
Type: ${npcData.type || 'merchant'}
Personality: ${npcData.personality || 'friendly'}
Location: ${locationData?.name || 'Unknown'}

`;

        // 3. Add personality-specific instructions
        if (NPCDialogueSystem && NPCDialogueSystem.getPersona) {
            const persona = NPCDialogueSystem.getPersona(npcData.personality);
            if (persona && persona.systemPrompt) {
                fullContext += `=== PERSONALITY INSTRUCTIONS ===\n${persona.systemPrompt}\n\n`;
            }
        }

        // 4. Add interaction-specific context
        switch (interactionType) {
            // TRADING
            case this.INTERACTION_TYPES.TRADING_BUY:
            case this.INTERACTION_TYPES.TRADING_SELL:
            case this.INTERACTION_TYPES.TRADING_BROWSE:
            case this.INTERACTION_TYPES.HAGGLING:
                fullContext += this.getTradingContext(npcData, playerData, interactionType);
                break;

            // QUESTS
            case this.INTERACTION_TYPES.QUEST_OFFER:
            case this.INTERACTION_TYPES.QUEST_ACCEPT:
            case this.INTERACTION_TYPES.QUEST_DECLINE:
            case this.INTERACTION_TYPES.QUEST_TURNIN:
            case this.INTERACTION_TYPES.QUEST_PROGRESS:
                fullContext += this.getQuestContext(npcData, playerData, interactionType, questData);
                break;

            // GOSSIP/INFO
            case this.INTERACTION_TYPES.GOSSIP:
            case this.INTERACTION_TYPES.DIRECTIONS:
                fullContext += this.getGossipContext(npcData, locationData, worldState);
                break;

            // SERVICES
            case this.INTERACTION_TYPES.SERVICES:
                fullContext += this.getServicesContext(npcData, playerData, serviceType);
                break;

            // GREETINGS (varies by NPC type)
            case this.INTERACTION_TYPES.GREETING:
            case this.INTERACTION_TYPES.FAREWELL:
                fullContext += this.getGreetingContext(npcData, playerData, interactionType);
                break;

            // COMBAT
            case this.INTERACTION_TYPES.COMBAT_START:
            case this.INTERACTION_TYPES.COMBAT_ROUND:
            case this.INTERACTION_TYPES.COMBAT_PLAYER_HIT:
            case this.INTERACTION_TYPES.COMBAT_PLAYER_MISS:
            case this.INTERACTION_TYPES.COMBAT_ENEMY_HIT:
            case this.INTERACTION_TYPES.COMBAT_ENEMY_MISS:
            case this.INTERACTION_TYPES.COMBAT_PLAYER_WIN:
            case this.INTERACTION_TYPES.COMBAT_PLAYER_FLEE:
            case this.INTERACTION_TYPES.COMBAT_PLAYER_LOSE:
                fullContext += this.getCombatContext(npcData, playerData, interactionType);
                break;

            // BOSS BATTLES
            case this.INTERACTION_TYPES.BOSS_ENCOUNTER:
            case this.INTERACTION_TYPES.BOSS_COMBAT:
            case this.INTERACTION_TYPES.BOSS_TAUNT:
            case this.INTERACTION_TYPES.BOSS_WOUNDED:
            case this.INTERACTION_TYPES.BOSS_DEFEAT:
            case this.INTERACTION_TYPES.BOSS_KILLS_PLAYER:
                fullContext += this.getBossContext(npcData, playerData, interactionType);
                break;

            // GATHERING
            case this.INTERACTION_TYPES.GATHER_START:
            case this.INTERACTION_TYPES.GATHER_SUCCESS:
            case this.INTERACTION_TYPES.GATHER_FAIL:
            case this.INTERACTION_TYPES.GATHER_RARE:
            case this.INTERACTION_TYPES.GATHER_DANGER:
                fullContext += this.getGatheringContext(options.gatheringData || {}, playerData, interactionType);
                break;

            // LOOT
            case this.INTERACTION_TYPES.LOOT_FOUND:
            case this.INTERACTION_TYPES.LOOT_CHEST:
            case this.INTERACTION_TYPES.LOOT_CORPSE:
            case this.INTERACTION_TYPES.LOOT_RARE:
            case this.INTERACTION_TYPES.LOOT_TRAP:
                fullContext += this.getLootContext(options.lootData || {}, playerData, interactionType);
                break;

            // RANDOM EVENTS
            case this.INTERACTION_TYPES.EVENT_AMBUSH:
            case this.INTERACTION_TYPES.EVENT_MERCHANT:
            case this.INTERACTION_TYPES.EVENT_BEGGAR:
            case this.INTERACTION_TYPES.EVENT_WOUNDED_NPC:
            case this.INTERACTION_TYPES.EVENT_WEATHER:
            case this.INTERACTION_TYPES.EVENT_DISCOVERY:
            case this.INTERACTION_TYPES.EVENT_THEFT:
            case this.INTERACTION_TYPES.EVENT_BLESSING:
            case this.INTERACTION_TYPES.EVENT_CURSE:
                fullContext += this.getRandomEventContext(options.eventData || {}, playerData, interactionType);
                break;

            // DUNGEON
            case this.INTERACTION_TYPES.DUNGEON_ENTER:
            case this.INTERACTION_TYPES.DUNGEON_EXIT:
                fullContext += this.getDungeonContext(options.dungeonData || {}, playerData, interactionType);
                break;

            // SOCIAL
            case this.INTERACTION_TYPES.INTIMIDATION:
            case this.INTERACTION_TYPES.PERSUASION:
            case this.INTERACTION_TYPES.ROBBERY:
            case this.INTERACTION_TYPES.BRIBE:
                fullContext += this.getGreetingContext(npcData, playerData, interactionType);
                break;

            default:
                fullContext += this.getGossipContext(npcData, locationData, worldState);
        }

        // 5. Add conversation history context
        if (conversationHistory && conversationHistory.length > 0) {
            fullContext += `
=== CONVERSATION SO FAR ===
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Continue the conversation naturally based on above history.
`;
        }

        // 6. Add critical reminders
        fullContext += `
=== CRITICAL REMINDERS ===
1. Respond in first person AS the character
2. Do NOT use asterisks for actions
3. Do NOT narrate - just speak as the character
4. Include commands AFTER your spoken dialogue when appropriate
5. Keep responses to 1-3 sentences unless quest/trading requires more
6. Stay in character - match your personality type
7. NEVER say "greetings traveler" or generic fantasy greetings
8. Be specific to the situation and your character
`;

        return fullContext;
    },

    // ═══════════════════════════════════════════════════════════════
    // detect interaction type - figure out what player wants
    // ═══════════════════════════════════════════════════════════════

    detectInteractionType(playerMessage, npcData, context = {}) {
        const msg = playerMessage.toLowerCase();

        // Trading keywords
        if (msg.includes('buy') || msg.includes('purchase') || msg.includes('how much for')) {
            return this.INTERACTION_TYPES.TRADING_BUY;
        }
        if (msg.includes('sell') || msg.includes('got anything') || msg.includes('take these')) {
            return this.INTERACTION_TYPES.TRADING_SELL;
        }
        if (msg.includes('wares') || msg.includes('what do you have') || msg.includes('show me')) {
            return this.INTERACTION_TYPES.TRADING_BROWSE;
        }

        // Quest keywords
        if (msg.includes('quest') || msg.includes('job') || msg.includes('work') || msg.includes('need help')) {
            if (context.hasActiveQuest) {
                return this.INTERACTION_TYPES.QUEST_PROGRESS;
            }
            return this.INTERACTION_TYPES.QUEST_OFFER;
        }
        if (msg.includes('done') || msg.includes('finished') || msg.includes('completed') || msg.includes('here you go')) {
            return this.INTERACTION_TYPES.QUEST_TURNIN;
        }
        if (msg.includes('accept') || msg.includes('i\'ll do it') || msg.includes('sure')) {
            return this.INTERACTION_TYPES.QUEST_ACCEPT;
        }

        // Service keywords
        if (msg.includes('room') || msg.includes('rest') || msg.includes('sleep')) {
            return this.INTERACTION_TYPES.SERVICES;
        }
        if (msg.includes('heal') || msg.includes('wounded') || msg.includes('hurt')) {
            return this.INTERACTION_TYPES.SERVICES;
        }
        if (msg.includes('repair') || msg.includes('fix') || msg.includes('forge')) {
            return this.INTERACTION_TYPES.SERVICES;
        }

        // Information keywords
        if (msg.includes('rumor') || msg.includes('news') || msg.includes('heard') || msg.includes('gossip')) {
            return this.INTERACTION_TYPES.GOSSIP;
        }
        if (msg.includes('where') || msg.includes('direction') || msg.includes('how do i get')) {
            return this.INTERACTION_TYPES.DIRECTIONS;
        }

        // Conversation flow
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg === '') {
            return this.INTERACTION_TYPES.GREETING;
        }
        if (msg.includes('bye') || msg.includes('farewell') || msg.includes('later')) {
            return this.INTERACTION_TYPES.FAREWELL;
        }

        // Combat/Threat keywords
        if (msg.includes('fight') || msg.includes('attack') || msg.includes('die')) {
            return this.INTERACTION_TYPES.INTIMIDATION;
        }

        // Boss check
        if (npcData.isBoss || npcData.type === 'boss') {
            return this.INTERACTION_TYPES.BOSS_ENCOUNTER;
        }

        // Default to gossip/general chat
        return this.INTERACTION_TYPES.GOSSIP;
    },

    // ═══════════════════════════════════════════════════════════════
    // parse and execute commands from response
    // ═══════════════════════════════════════════════════════════════

    parseCommands(responseText) {
        const commands = [];
        // Match {commandName:params} format
        const commandRegex = /\{(\w+):([^}]*)\}/g;
        let match;

        while ((match = commandRegex.exec(responseText)) !== null) {
            const commandName = match[1];
            const params = match[2].split(',').map(p => p.trim());

            commands.push({
                raw: match[0],
                command: commandName,
                params: params
            });
        }

        // Also match {commandName} without params
        const simpleRegex = /\{(\w+)\}/g;
        while ((match = simpleRegex.exec(responseText)) !== null) {
            // Skip if already matched with params
            if (!commands.find(c => c.raw === match[0])) {
                commands.push({
                    raw: match[0],
                    command: match[1],
                    params: []
                });
            }
        }

        // Clean text for TTS
        const cleanText = responseText.replace(/\{[^}]+\}/g, '').trim();

        return { cleanText, commands };
    },

    executeCommand(command, npcData = {}) {
        const { command: cmd, params } = command;

        if (!game || !game.player) {
            console.warn('🎮 Game not initialized, cannot execute command:', cmd);
            return { success: false, error: 'Game not initialized' };
        }

        console.log(`🎮 Executing command: ${cmd}`, params);

        switch (cmd.toLowerCase()) {
            // Item commands
            case 'giveitem': {
                const [itemId, qty = 1] = params;
                const quantity = parseInt(qty);
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.inventory.add(itemId, quantity, 'workflow_give');
                } else {
                    if (!game.player.inventory) game.player.inventory = {};
                    game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + quantity;
                }
                if (typeof addMessage === 'function') addMessage(`Received ${qty}x ${itemId}`, 'success');
                if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay();
                return { success: true };
            }

            case 'takeitem': {
                const [itemId, qty = 1] = params;
                const quantity = parseInt(qty);

                // Check inventory via PlayerStateManager or fallback
                const hasEnough = typeof PlayerStateManager !== 'undefined' ?
                    PlayerStateManager.inventory.getQuantity(itemId) >= quantity :
                    (game.player.inventory?.[itemId] >= quantity);

                if (!hasEnough) {
                    return { success: false, error: 'Player lacks item' };
                }

                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.inventory.remove(itemId, quantity, 'workflow_take');
                } else {
                    game.player.inventory[itemId] -= quantity;
                    const newTotal = game.player.inventory[itemId] || 0;
                    if (game.player.inventory[itemId] <= 0) delete game.player.inventory[itemId];

                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('inventory:item:removed', {
                            itemId: itemId,
                            quantity: quantity,
                            newTotal: newTotal,
                            reason: 'workflow_take'
                        });
                    }
                }

                if (typeof addMessage === 'function') addMessage(`Lost ${qty}x ${itemId}`);
                if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay();
                return { success: true };
            }

            case 'givegold': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.gold.add(amount, 'workflow_give');
                } else {
                    game.player.gold = (game.player.gold || 0) + amount;
                }
                if (typeof addMessage === 'function') addMessage(`Received ${amount} gold`, 'success');
                if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
                return { success: true };
            }

            case 'takegold': {
                const amount = parseInt(params[0]) || 0;
                const currentGold = typeof PlayerStateManager !== 'undefined' ?
                    PlayerStateManager.gold.get() : (game.player.gold || 0);

                if (currentGold < amount) {
                    return { success: false, error: 'Not enough gold' };
                }

                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.gold.remove(amount, 'workflow_take');
                } else {
                    game.player.gold -= amount;
                }
                if (typeof addMessage === 'function') addMessage(`Paid ${amount} gold`);
                if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
                return { success: true };
            }

            // Quest commands
            case 'startquest': {
                const questId = params[0];
                if (typeof QuestSystem !== 'undefined' && QuestSystem.assignQuest) {
                    const result = QuestSystem.assignQuest(questId, npcData);
                    return result;
                }
                return { success: false, error: 'Quest system not available' };
            }

            case 'completequest': {
                const questId = params[0];
                if (typeof QuestSystem !== 'undefined' && QuestSystem.completeQuest) {
                    const result = QuestSystem.completeQuest(questId);
                    return result;
                }
                return { success: false, error: 'Quest system not available' };
            }

            case 'givequestitem': {
                const itemId = params[0];
                if (!game.player.questItems) game.player.questItems = {};
                game.player.questItems[itemId] = true;
                if (typeof addMessage === 'function') addMessage(`Received quest item: ${itemId}`, 'success');
                return { success: true };
            }

            case 'takequestitem': {
                const itemId = params[0];
                if (game.player.questItems?.[itemId]) {
                    delete game.player.questItems[itemId];
                    if (typeof addMessage === 'function') addMessage(`Quest item taken: ${itemId}`);
                    return { success: true };
                }
                return { success: false, error: 'Player lacks quest item' };
            }

            // Stat commands
            case 'damage': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.subtract('health', amount, 'workflow_damage');
                } else {
                    game.player.stats.health = Math.max(0, (game.player.stats.health || 100) - amount);
                }
                if (typeof addMessage === 'function') addMessage(`Took ${amount} damage!`, 'danger');
                if (typeof updatePlayerStats === 'function') updatePlayerStats();
                return { success: true };
            }

            case 'heal': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.add('health', amount, 'workflow_heal');
                } else {
                    const maxHealth = game.player.stats.maxHealth || 100;
                    game.player.stats.health = Math.min(maxHealth, (game.player.stats.health || 0) + amount);
                }
                if (typeof addMessage === 'function') addMessage(`Healed ${amount} health`, 'success');
                if (typeof updatePlayerStats === 'function') updatePlayerStats();
                return { success: true };
            }

            case 'restorehunger': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.add('hunger', amount, 'workflow_feed');
                } else {
                    game.player.stats.hunger = Math.min(100, (game.player.stats.hunger || 0) + amount);
                }
                if (typeof updatePlayerStats === 'function') updatePlayerStats();
                return { success: true };
            }

            case 'restorethirst': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.add('thirst', amount, 'workflow_hydrate');
                } else {
                    game.player.stats.thirst = Math.min(100, (game.player.stats.thirst || 0) + amount);
                }
                if (typeof updatePlayerStats === 'function') updatePlayerStats();
                return { success: true };
            }

            case 'restorestamina': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.add('stamina', amount, 'workflow_rest');
                } else {
                    game.player.stats.stamina = Math.min(100, (game.player.stats.stamina || 0) + amount);
                }
                if (typeof updatePlayerStats === 'function') updatePlayerStats();
                return { success: true };
            }

            // Reputation
            case 'repup': {
                const amount = parseInt(params[0]) || 1;
                const location = npcData.location || game.currentLocation?.id;
                if (typeof ReputationSystem !== 'undefined' && location) {
                    ReputationSystem.changeReputation(location, amount);
                }
                return { success: true };
            }

            case 'repdown': {
                const amount = parseInt(params[0]) || 1;
                const location = npcData.location || game.currentLocation?.id;
                if (typeof ReputationSystem !== 'undefined' && location) {
                    ReputationSystem.changeReputation(location, -amount);
                }
                return { success: true };
            }

            // Special
            case 'unlock': {
                const thingId = params[0];
                if (!game.player.unlocks) game.player.unlocks = {};
                game.player.unlocks[thingId] = true;
                if (typeof addMessage === 'function') addMessage(`Unlocked: ${thingId}`, 'success');
                return { success: true };
            }

            case 'endconversation': {
                // Signal to close conversation UI
                document.dispatchEvent(new CustomEvent('npc-end-conversation'));
                return { success: true };
            }

            // collection quest commands - "bring me 20 wheat"
            case 'takecollection': {
                const [itemId, qty = 1] = params;
                const quantity = parseInt(qty);

                // Check if player has enough via PlayerStateManager or fallback
                const currentAmount = typeof PlayerStateManager !== 'undefined'
                    ? PlayerStateManager.inventory.getQuantity(itemId)
                    : (game.player.inventory?.[itemId] || 0);

                if (currentAmount < quantity) {
                    return { success: false, error: `Player needs ${quantity}x ${itemId}` };
                }

                // Remove via PlayerStateManager if available
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.inventory.remove(itemId, quantity, 'quest_collection');
                } else {
                    game.player.inventory[itemId] -= quantity;
                    if (game.player.inventory[itemId] <= 0) delete game.player.inventory[itemId];

                    // EventBus emission for fallback path
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('inventory:item:removed', {
                            itemId: itemId,
                            quantity: quantity,
                            newTotal: game.player.inventory?.[itemId] || 0,
                            reason: 'quest_collection'
                        });
                    }
                }

                if (typeof addMessage === 'function') addMessage(`Gave ${quantity}x ${itemId}`, 'info');
                if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay();
                // mark quest collection progress - the puppet remembers what you gave them
                if (typeof QuestSystem !== 'undefined') {
                    QuestSystem.updateProgress('collect', { item: itemId, count: quantity });
                }
                return { success: true };
            }

            // delivery quest confirmation - NPC confirms receipt
            case 'confirmdelivery': {
                const [questId, questItemId] = params;
                if (typeof QuestSystem === 'undefined') {
                    return { success: false, error: 'QuestSystem not loaded' };
                }
                const quest = QuestSystem.activeQuests[questId];
                if (!quest) {
                    return { success: false, error: 'Quest not active' };
                }
                // Mark talk objective for this NPC as complete
                const npcType = npcData.type;
                const talkObj = quest.objectives.find(obj =>
                    obj.type === 'talk' && obj.npc === npcType && !obj.completed
                );
                if (talkObj) {
                    talkObj.completed = true;
                }
                // Take the quest item if specified
                if (questItemId && game.player.questItems?.[questItemId]) {
                    delete game.player.questItems[questItemId];
                    if (typeof addMessage === 'function') addMessage(`Delivered: ${questItemId}`, 'info');
                }
                QuestSystem.saveQuestProgress();
                return { success: true };
            }

            // verify player owns the collection items - inventory check before acceptance
            case 'checkcollection': {
                const [itemId, qty = 1] = params;
                const quantity = parseInt(qty);
                const current = typeof PlayerStateManager !== 'undefined'
                    ? PlayerStateManager.inventory.getQuantity(itemId)
                    : (game.player.inventory?.[itemId] || 0);
                const has = current >= quantity;
                return { success: true, hasItems: has, required: quantity, current: current };
            }

            default:
                console.warn('🎮 Unknown command:', cmd);
                return { success: false, error: `Unknown command: ${cmd}` };
        }
    },

    executeCommands(commands, npcData = {}) {
        const results = [];
        for (const cmd of commands) {
            const result = this.executeCommand(cmd, npcData);
            results.push({ ...cmd, result });
        }
        return results;
    }
};

// Make globally available
window.NPCWorkflowSystem = NPCWorkflowSystem;

console.log('🎭 NPCWorkflowSystem ready - NPCs now know how to do their jobs');
