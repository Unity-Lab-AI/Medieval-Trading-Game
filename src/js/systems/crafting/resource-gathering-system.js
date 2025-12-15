// 
// RESOURCE GATHERING SYSTEM - mining the earth's corpse
// 
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const ResourceGatheringSystem = {
    // Currently active gathering session
    activeGathering: null,

    // Tool requirements for different resource types
    TOOL_REQUIREMENTS: {
        // Mining resources
        iron_ore: { tool: 'pickaxe', skill: 'mining', minLevel: 0 },
        coal: { tool: 'pickaxe', skill: 'mining', minLevel: 0 },
        stone: { tool: 'pickaxe', skill: 'mining', minLevel: 0 },
        copper_ore: { tool: 'pickaxe', skill: 'mining', minLevel: 1 },
        silver_ore: { tool: 'pickaxe', skill: 'mining', minLevel: 2 },
        gold_ore: { tool: 'pickaxe', skill: 'mining', minLevel: 3 },
        gems: { tool: 'pickaxe', skill: 'mining', minLevel: 4 },
        rare_minerals: { tool: 'pickaxe', skill: 'mining', minLevel: 3 },
        crystals: { tool: 'pickaxe', skill: 'mining', minLevel: 4 },

        // Forestry resources
        wood: { tool: 'axe', skill: 'forestry', minLevel: 0 },
        planks: { tool: 'axe', skill: 'forestry', minLevel: 1 },
        rare_wood: { tool: 'axe', skill: 'forestry', minLevel: 2 },

        // Herbalism resources
        herbs: { tool: 'sickle', skill: 'herbalism', minLevel: 0 },
        medicinal_plants: { tool: 'sickle', skill: 'herbalism', minLevel: 1 },
        rare_herbs: { tool: 'sickle', skill: 'herbalism', minLevel: 2 },
        mushrooms: { tool: 'knife', skill: 'herbalism', minLevel: 1 },

        // Fishing resources
        fish: { tool: 'fishing_rod', skill: 'fishing', minLevel: 0 },
        exotic_fish: { tool: 'fishing_rod', skill: 'fishing', minLevel: 2 },
        river_pearls: { tool: 'fishing_rod', skill: 'fishing', minLevel: 3 },

        // No tool required (can be picked up)
        food: { tool: null, skill: null, minLevel: 0 },
        water: { tool: null, skill: null, minLevel: 0 }
    },

    // Tools and their properties
    TOOLS: {
        pickaxe: {
            id: 'pickaxe',
            name: 'Pickaxe',
            description: 'Used for mining ore and stone',
            durability: 100,
            efficiency: 1.0,
            price: 25
        },
        iron_pickaxe: {
            id: 'iron_pickaxe',
            name: 'Iron Pickaxe',
            description: 'Durable pickaxe for efficient mining',
            durability: 200,
            efficiency: 1.5,
            price: 75
        },
        steel_pickaxe: {
            id: 'steel_pickaxe',
            name: 'Steel Pickaxe',
            description: 'High-quality pickaxe for professional miners',
            durability: 400,
            efficiency: 2.0,
            price: 200
        },
        axe: {
            id: 'axe',
            name: 'Axe',
            description: 'Used for chopping wood',
            durability: 100,
            efficiency: 1.0,
            price: 20
        },
        iron_axe: {
            id: 'iron_axe',
            name: 'Iron Axe',
            description: 'Durable axe for efficient woodcutting',
            durability: 200,
            efficiency: 1.5,
            price: 60
        },
        steel_axe: {
            id: 'steel_axe',
            name: 'Steel Axe',
            description: 'High-quality axe for professional lumberjacks',
            durability: 400,
            efficiency: 2.0,
            price: 180
        },
        sickle: {
            id: 'sickle',
            name: 'Sickle',
            description: 'Used for harvesting herbs and plants',
            durability: 80,
            efficiency: 1.0,
            price: 15
        },
        silver_sickle: {
            id: 'silver_sickle',
            name: 'Silver Sickle',
            description: 'Enchanted sickle for harvesting rare herbs',
            durability: 150,
            efficiency: 1.8,
            price: 120
        },
        knife: {
            id: 'knife',
            name: 'Gathering Knife',
            description: 'Multipurpose knife for gathering',
            durability: 60,
            efficiency: 1.0,
            price: 10
        },
        fishing_rod: {
            id: 'fishing_rod',
            name: 'Fishing Rod',
            description: 'Basic fishing equipment',
            durability: 50,
            efficiency: 1.0,
            price: 15
        },
        quality_fishing_rod: {
            id: 'quality_fishing_rod',
            name: 'Quality Fishing Rod',
            description: 'Well-crafted rod for better catches',
            durability: 120,
            efficiency: 1.6,
            price: 80
        }
    },

    // Location types that support gathering vs trading
    LOCATION_MODES: {
        // NPC trading locations - buy/sell only
        city: 'trade',
        town: 'trade',
        village: 'trade',
        trading_post: 'trade',
        inn: 'trade',
        tavern: 'trade',

        // Gathering locations - player gathers with tools
        mine: 'gather',
        forest: 'gather',
        herb: 'gather',
        fishing: 'gather',
        cave: 'gather',
        ruins: 'gather',

        // Mixed locations
        farm: 'both',  // Can buy or work for resources
        quarry: 'both'
    },

    // wake this fucker up - time to ruin your back gathering rocks
    init() {
        console.log('ResourceGatheringSystem: Crawling out of the mines to serve you...');

        //  make sure player has somewhere to store their pickaxe collection
        this.initPlayerTools();

        //  slap the gathering UI into existence
        this.setupGatheringUI();

        console.log('ResourceGatheringSystem: Ready to break your spine for shiny rocks 🖤');
    },

    //  conjure the player's tool tracking from the void
    initPlayerTools() {
        if (typeof game !== 'undefined' && game.player) {
            game.player.tools = game.player.tools || {};
            game.player.equippedTool = game.player.equippedTool || null;
            game.player.skills = game.player.skills || {
                mining: 0,
                forestry: 0,
                herbalism: 0,
                fishing: 0
            };
        }
    },

    //  reality check - do you even have the right tool or are you gonna mine with your bare hands
    hasRequiredTool(resourceId) {
        const requirement = this.TOOL_REQUIREMENTS[resourceId];
        if (!requirement || !requirement.tool) {
            return { hasTool: true, tool: null }; // ��� no tool needed - peasant work
        }

        if (typeof game === 'undefined' || !game.player) {
            return { hasTool: false, reason: 'Player data not available' };
        }

        //  dig through player's shit to see if they own the right equipment
        const toolType = requirement.tool;
        const playerTools = game.player.tools || {};

        //  find exact match or any upgraded version (because we're generous like that)
        const matchingTools = Object.keys(this.TOOLS).filter(toolId => {
            const tool = this.TOOLS[toolId];
            return toolId === toolType ||
                   toolId.includes(toolType) ||
                   tool.id === toolType;
        });

        const ownedTool = matchingTools.find(t => playerTools[t] && playerTools[t].durability > 0);

        if (!ownedTool) {
            return {
                hasTool: false,
                reason: `You need a ${this.TOOLS[toolType]?.name || toolType} to gather this resource.`,
                requiredTool: toolType
            };
        }

        return { hasTool: true, tool: ownedTool, toolInfo: this.TOOLS[ownedTool] };
    },

    //  skill check - are you even qualified to do this or just pretending
    hasRequiredSkill(resourceId) {
        const requirement = this.TOOL_REQUIREMENTS[resourceId];
        if (!requirement || requirement.minLevel === 0) {
            return { hasSkill: true };
        }

        if (typeof game === 'undefined' || !game.player || !game.player.skills) {
            return { hasSkill: true }; // ��� can't verify - fuck it, let them try
        }

        const playerSkillLevel = game.player.skills[requirement.skill] || 0;

        if (playerSkillLevel < requirement.minLevel) {
            return {
                hasSkill: false,
                reason: `Your ${requirement.skill} skill (${playerSkillLevel}) is too low. Requires level ${requirement.minLevel}.`,
                requiredLevel: requirement.minLevel,
                currentLevel: playerSkillLevel
            };
        }

        return { hasSkill: true };
    },

    // 
    //  DRAIN PREVIEW SYSTEM - know what youre getting into
    // 
    // calculate expected resource consumption before committing

    // Base stamina drain per gathering action by resource type
    GATHERING_DRAIN: {
        // Mining - hardest work, most drain
        iron_ore: { staminaDrain: 15, healthRisk: 5 },
        coal: { staminaDrain: 12, healthRisk: 3 },
        stone: { staminaDrain: 10, healthRisk: 2 },
        copper_ore: { staminaDrain: 15, healthRisk: 4 },
        silver_ore: { staminaDrain: 18, healthRisk: 6 },
        gold_ore: { staminaDrain: 22, healthRisk: 8 },
        gems: { staminaDrain: 25, healthRisk: 10 },
        rare_minerals: { staminaDrain: 20, healthRisk: 7 },
        crystals: { staminaDrain: 28, healthRisk: 12 },

        // Forestry - moderate work
        wood: { staminaDrain: 12, healthRisk: 3 },
        planks: { staminaDrain: 15, healthRisk: 4 },
        rare_wood: { staminaDrain: 18, healthRisk: 5 },

        // Herbalism - lighter work
        herbs: { staminaDrain: 5, healthRisk: 1 },
        medicinal_plants: { staminaDrain: 8, healthRisk: 2 },
        rare_herbs: { staminaDrain: 10, healthRisk: 3 },
        mushrooms: { staminaDrain: 6, healthRisk: 2 },

        // Fishing - patience game
        fish: { staminaDrain: 8, healthRisk: 1 },
        exotic_fish: { staminaDrain: 12, healthRisk: 2 },
        river_pearls: { staminaDrain: 15, healthRisk: 4 },

        // Basic gathering
        food: { staminaDrain: 3, healthRisk: 0 },
        water: { staminaDrain: 2, healthRisk: 0 }
    },

    // Calculate expected drain for a gathering session
    calculateGatheringDrain(resourceId, location) {
        const baseDrain = this.GATHERING_DRAIN[resourceId] || { staminaDrain: 10, healthRisk: 3 };

        // Get player stats
        const playerStats = typeof game !== 'undefined' ? game.player : {};
        const endurance = playerStats?.attributes?.endurance || 5;
        const currentStamina = playerStats?.stats?.stamina || 100;
        const currentHealth = playerStats?.stats?.health || 100;

        //  Location-specific difficulty modifier - uses gatheringDifficulty from game-world.js
        // Each mine/forest/farm/cave has its own difficulty based on resource value
        let difficultyMod = 1.0;
        if (location?.gatheringDifficulty) {
            //  Use the location's specific difficulty (set in game-world.js)
            difficultyMod = location.gatheringDifficulty;
        } else if (location?.region) {
            //  Fallback to region-based difficulty if no specific difficulty set
            const regionMods = {
                capital: 0.7,
                starter: 0.8,
                eastern: 1.0,
                southern: 1.0,
                western: 1.3,
                northern: 1.4
            };
            difficultyMod = regionMods[location.region] || 1.0;
        }

        // Tool efficiency reduces drain
        const toolCheck = this.hasRequiredTool(resourceId);
        const toolEfficiency = toolCheck.toolInfo?.efficiency || 1.0;
        const efficiencyMod = 1 / toolEfficiency;

        // Endurance reduces stamina drain (5% per point above 5)
        const enduranceMod = Math.max(0.5, 1 - (endurance - 5) * 0.05);

        // Calculate final drain estimates
        const staminaDrain = Math.round(baseDrain.staminaDrain * difficultyMod * efficiencyMod * enduranceMod);
        const healthRisk = Math.round(baseDrain.healthRisk * difficultyMod);

        // Determine risk level
        const staminaPercent = staminaDrain / currentStamina;
        const healthPercent = healthRisk / currentHealth;
        const avgRisk = (staminaPercent + healthPercent) / 2;

        let riskLevel, riskColor, riskEmoji;
        if (avgRisk > 0.5) {
            riskLevel = 'EXHAUSTING';
            riskColor = '#ff0000';
            riskEmoji = '💀';
        } else if (avgRisk > 0.3) {
            riskLevel = 'HARD WORK';
            riskColor = '#ff6600';
            riskEmoji = '💪';
        } else if (avgRisk > 0.15) {
            riskLevel = 'MODERATE';
            riskColor = '#ffcc00';
            riskEmoji = '';
        } else {
            riskLevel = 'EASY';
            riskColor = '#00ff00';
            riskEmoji = '😎';
        }

        return {
            staminaDrain: {
                min: Math.max(1, staminaDrain - 3),
                max: staminaDrain + 5,
                current: currentStamina,
                survivable: currentStamina > staminaDrain + 5
            },
            healthRisk: {
                min: 0,
                max: healthRisk,
                current: currentHealth,
                survivable: currentHealth > healthRisk
            },
            difficulty: difficultyMod,
            toolBonus: toolEfficiency,
            enduranceBonus: enduranceMod,
            risk: {
                level: riskLevel,
                color: riskColor,
                emoji: riskEmoji
            },
            canGather: currentStamina > staminaDrain + 5 && currentHealth > healthRisk
        };
    },

    // Get drain preview HTML for display
    getDrainPreviewHTML(resourceId, location) {
        const drain = this.calculateGatheringDrain(resourceId, location);

        return `
            <div class="gathering-drain-preview" style="background: ${drain.risk.color}15; border: 1px solid ${drain.risk.color}40; border-radius: 8px; padding: 10px; margin: 10px 0;">
                <div class="drain-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: bold; color: ${drain.risk.color};">
                        ${drain.risk.emoji} ${drain.risk.level}
                    </span>
                    <span style="color: ${drain.canGather ? '#4caf50' : '#f44336'};">
                        ${drain.canGather ? '✓ Can gather' : '✗ Too exhausted'}
                    </span>
                </div>
                <div class="drain-stats" style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <span style="font-size: 0.9em;">
                        Stamina: ${drain.staminaDrain.min}-${drain.staminaDrain.max}
                        <span style="color: #888;">(you have ${drain.staminaDrain.current})</span>
                    </span>
                    <span style="font-size: 0.9em;">
                        ❤️ Health Risk: 0-${drain.healthRisk.max}
                        <span style="color: #888;">(you have ${drain.healthRisk.current})</span>
                    </span>
                </div>
                ${drain.toolBonus > 1 ? `<div style="margin-top: 5px; font-size: 0.85em; color: #4caf50;">🔧 Tool bonus: ${Math.round((drain.toolBonus - 1) * 100)}% efficiency</div>` : ''}
            </div>
        `;
    },

    // 
    //  CARRY WEIGHT SYSTEM - your back can only take so much
    // 

    // Get player's current carry weight -  fixed: inventory is object not array 
    getCurrentCarryWeight() {
        // get inventory via PlayerStateManager
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        if (!inventory || Object.keys(inventory).length === 0) return 0;

        let totalWeight = 0;
        //  inventory is { itemId: quantity }, not an array of objects
        Object.entries(inventory).forEach(([itemId, quantity]) => {
            const weight = this.getResourceWeight(itemId) || 1;
            totalWeight += weight * (quantity || 1);
        });

        return totalWeight;
    },

    // Get player's max carry capacity
    getMaxCarryCapacity() {
        if (typeof game === 'undefined' || !game.player) return 100;

        // Base capacity + strength bonus + transport bonus
        const baseCapacity = 50;
        const strength = game.player.attributes?.strength || 5;
        const strengthBonus = (strength - 5) * 10; // 10 lbs per point above 5

        // Transport bonuses
        let transportBonus = 0;
        const transport = game.player.transportation || 'foot';
        const transportCapacities = {
            foot: 0,
            mule: 100,
            horse: 50,
            cart: 300,
            wagon: 500
        };
        transportBonus = transportCapacities[transport] || 0;

        return baseCapacity + strengthBonus + transportBonus;
    },

    // Check if player can carry more weight
    canCarryMore(additionalWeight = 0) {
        const current = this.getCurrentCarryWeight();
        const max = this.getMaxCarryCapacity();
        return (current + additionalWeight) <= max;
    },

    // Get weight percentage
    getCarryWeightPercent() {
        const current = this.getCurrentCarryWeight();
        const max = this.getMaxCarryCapacity();
        return Math.min(100, (current / max) * 100);
    },

    // 
    // CONTINUOUS GATHERING SYSTEM - work until you drop
    // 
    // players can leave before first action, but once committed, they work
    // until stamina runs out (then slow pace) or carry weight maxes out (stop)

    // Track if player is committed to this location
    isCommitted: false,

    // Mark player as committed to the location (cant leave freely now)
    commitToLocation(locationId) {
        this.isCommitted = true;
        this.committedLocationId = locationId;
        addMessage('youve committed to this location. finish your work or exhaust yourself trying.', 'info');
    },

    // Check if player can leave current location
    canLeaveLocation() {
        // Can always leave if not committed
        if (!this.isCommitted) return { canLeave: true };

        // If gathering, cannot leave
        if (this.activeGathering) {
            return {
                canLeave: false,
                reason: 'youre in the middle of gathering. finish or cancel first, quitter.'
            };
        }

        // If committed but not actively gathering, they can leave (took a break)
        return { canLeave: true };
    },

    // Reset commitment when leaving location
    resetCommitment() {
        this.isCommitted = false;
        this.committedLocationId = null;
    },

    // Start gathering at a location
    startGathering(locationId, resourceId) {
        // Check if already gathering
        if (this.activeGathering) {
            addMessage('already gathering. one task at a time, eager beaver.', 'warning');
            return false;
        }

        // Find the location
        const location = this.findLocation(locationId);
        if (!location) {
            addMessage('invalid location. did you wander off the map?', 'error');
            return false;
        }

        // Check if location supports this resource
        const resources = location.resources || [];
        if (!resources.includes(resourceId)) {
            addMessage(`no ${resourceId} here. try opening your eyes.`, 'error');
            return false;
        }

        // Check tool requirement
        const toolCheck = this.hasRequiredTool(resourceId);
        if (!toolCheck.hasTool) {
            addMessage(toolCheck.reason, 'error');
            return false;
        }

        // Check skill requirement
        const skillCheck = this.hasRequiredSkill(resourceId);
        if (!skillCheck.hasSkill) {
            addMessage(skillCheck.reason, 'error');
            return false;
        }

        // Check stamina
        const currentStamina = game.player?.stats?.stamina || 0;
        if (currentStamina <= 0) {
            addMessage('💤 youre too exhausted to gather. rest or consume something, weakling.', 'error');
            return false;
        }

        // Check carry weight
        const resourceWeight = this.getResourceWeight(resourceId) || 1;
        if (!this.canCarryMore(resourceWeight)) {
            addMessage('🎒 youre carrying too much! sell or drop something first.', 'error');
            return false;
        }

        // COMMIT to location on first action
        if (!this.isCommitted) {
            this.commitToLocation(locationId);
        }

        //  Calculate gathering time - harder locations take longer but yield better resources
        const baseTime = 15 + Math.random() * 15;
        const toolEfficiency = toolCheck.toolInfo?.efficiency || 1.0;
        const locationDifficulty = location.gatheringDifficulty || 1.0; // ��� Uses location-specific difficulty
        let gatheringTime = Math.round((baseTime * locationDifficulty) / toolEfficiency);

        // SLOW MODE: if stamina is low, gathering takes longer
        const staminaPercent = currentStamina / (game.player?.stats?.maxStamina || 100);
        if (staminaPercent < 0.3) {
            gatheringTime = Math.round(gatheringTime * 2); // double time when exhausted
            addMessage('😓 low stamina... working at half speed. push through the pain.', 'warning');
        }

        // Calculate stamina cost
        const drainInfo = this.calculateGatheringDrain(resourceId, location);
        const staminaCost = Math.round((drainInfo.staminaDrain.min + drainInfo.staminaDrain.max) / 2);

        // Start gathering session
        this.activeGathering = {
            locationId: locationId,
            resourceId: resourceId,
            tool: toolCheck.tool,
            startTime: TimeSystem.getTotalMinutes(),
            duration: gatheringTime,
            abundance: location.abundance?.[resourceId] || 0.5,
            staminaCost: staminaCost,
            isSlowMode: staminaPercent < 0.3,
            cycleCount: (this.activeGathering?.cycleCount || 0) + 1
        };

        // Auto-start time if paused
        if (TimeSystem.isPaused || TimeSystem.currentSpeed === 'PAUSED') {
            TimeSystem.setSpeed('NORMAL');
            if (typeof GameEngine !== 'undefined' && !GameEngine.isRunning) {
                GameEngine.start();
            }
        }

        const slowNote = this.activeGathering.isSlowMode ? ' (slow mode - youre exhausted)' : '';
        addMessage(`gathering ${this.getResourceName(resourceId)}... ~${gatheringTime} min${slowNote}`, 'info');

        // Show gathering progress UI
        this.showGatheringProgress();

        return true;
    },

    // Update gathering progress (called from game loop)
    // Uses TimeMachine's game minutes for time-based progression
    update() {
        if (!this.activeGathering) return;

        // Skip update if time is paused
        if (typeof TimeMachine !== 'undefined' && TimeMachine.isPaused) return;

        const currentTime = TimeSystem.getTotalMinutes();
        const elapsed = currentTime - this.activeGathering.startTime;
        const progress = Math.min(1.0, elapsed / this.activeGathering.duration);

        // Update progress UI with percentage
        this.updateGatheringProgress(progress);

        // Check if complete
        if (progress >= 1.0) {
            this.completeGathering();
        }
    },

    // Complete gathering and give resources
    completeGathering() {
        if (!this.activeGathering) return;

        const { resourceId, staminaCost, locationId, baseYield, action } = this.activeGathering;
        const abundance = this.activeGathering.abundance || 0.5;
        const tool = this.activeGathering.tool || null;
        const isSlowMode = this.activeGathering.isSlowMode || false;

        //  Get location for difficulty-based yield bonus
        const location = this.findLocation(locationId);
        const locationDifficulty = location?.gatheringDifficulty || 1.0;

        // Calculate yield based on action's baseYield range
        const yieldRange = baseYield || { min: 1, max: 3 };
        const baseAmount = yieldRange.min + Math.floor(Math.random() * (yieldRange.max - yieldRange.min + 1));
        const bonusYield = Math.random() < abundance ? 1 : 0;

        //  Higher difficulty locations give better yields (risk vs reward!)
        // Difficulty 2.0 = +50% yield, Difficulty 0.8 = -10% yield
        const difficultyBonus = Math.floor((locationDifficulty - 1.0) * 2);
        let totalYield = baseAmount + bonusYield + Math.max(0, difficultyBonus);

        //  Apply equipment gathering bonuses
        if (typeof EquipmentSystem !== 'undefined') {
            const gatherBonus = EquipmentSystem.getTotalBonus('gathering');
            const toolBonus = EquipmentSystem.getGatheringBonus(tool);
            const luckBonus = EquipmentSystem.getTotalBonus('luck');

            // gathering bonus adds flat yield
            totalYield += Math.floor(gatherBonus / 5);

            // tool-specific bonus adds yield
            totalYield += Math.floor(toolBonus / 10);

            // luck gives chance for extra drops
            if (luckBonus > 0 && Math.random() < (luckBonus / 20)) {
                totalYield += 1;
                addMessage(`🍀 Lucky find! Equipment bonus gave extra yield!`, 'success');
            }
        }

        // Reduce yield in slow mode
        if (isSlowMode) {
            totalYield = Math.max(1, Math.floor(totalYield * 0.5));
        }

        // Check carry weight before adding
        const resourceWeight = this.getResourceWeight(resourceId) || 1;
        const totalNewWeight = resourceWeight * totalYield;

        if (!this.canCarryMore(totalNewWeight)) {
            // Only add what we can carry
            const currentWeight = this.getCurrentCarryWeight();
            const maxCapacity = this.getMaxCarryCapacity();
            const availableCapacity = maxCapacity - currentWeight;
            totalYield = Math.floor(availableCapacity / resourceWeight);

            if (totalYield <= 0) {
                addMessage('🎒 youre completely overloaded! cant carry any more. time to head back.', 'warning');
                this.stopGatheringSession('overweight');
                return;
            }

            addMessage(`🎒 only grabbed ${totalYield} - bags are almost full!`, 'warning');
        }

        // Add resources to inventory via PlayerStateManager
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.add(resourceId, totalYield, 'gathering');
        } else if (typeof game !== 'undefined' && game.player && game.player.inventory) {
            game.player.inventory[resourceId] = (game.player.inventory[resourceId] || 0) + totalYield;
        }
        // Emit item-received for quest progress tracking
        document.dispatchEvent(new CustomEvent('item-received', {
            detail: { item: resourceId, quantity: totalYield, source: 'gathering' }
        }));

        // DRAIN STAMINA
        if (game.player?.stats) {
            game.player.stats.stamina = Math.max(0, game.player.stats.stamina - staminaCost);
        }

        // Reduce tool durability
        if (tool && game.player.tools?.[tool]) {
            game.player.tools[tool].durability -= 5;
            if (game.player.tools[tool].durability <= 0) {
                addMessage(`💔 your ${this.TOOLS[tool]?.name || tool} shattered! the void claims another victim.`, 'warning');
                delete game.player.tools[tool];
            }
        }

        // Grant skill experience
        const requirement = this.TOOL_REQUIREMENTS[resourceId];
        if (requirement?.skill && game.player.skills) {
            const xpGain = 5 + totalYield;
            game.player.skills[requirement.skill] = (game.player.skills[requirement.skill] || 0) + xpGain * 0.01;
        }

        addMessage(`got ${totalYield}x ${this.getResourceName(resourceId)}!`, 'success');

        // Update player stats display
        if (typeof updatePlayerStats === 'function') {
            updatePlayerStats();
        }

        // Check if we should continue gathering (auto-continue feature)
        const currentStamina = game.player?.stats?.stamina || 0;
        const weightPercent = this.getCarryWeightPercent();

        // Stop conditions
        if (currentStamina <= 0) {
            this.stopGatheringSession('exhausted');
            addMessage('💀 completely exhausted! you collapse. time to rest, warrior.', 'warning');
        } else if (weightPercent >= 100) {
            this.stopGatheringSession('overweight');
            addMessage('🎒 bags are bursting! you physically cant carry more. head back.', 'warning');
        } else if (!this.hasRequiredTool(resourceId).hasTool) {
            this.stopGatheringSession('broken_tool');
            addMessage('🔧 tool broke! need a new one to continue.', 'warning');
        } else {
            // AUTO-CONTINUE GATHERING
            // Clear current session and start next cycle
            this.activeGathering = null;
            this.hideGatheringProgress();

            // Small delay then continue
            setTimeout(() => {
                if (this.isCommitted && this.committedLocationId === locationId) {
                    this.startGathering(locationId, resourceId);
                }
            }, 500);
        }
    },

    // Stop gathering session completely
    stopGatheringSession(reason = 'manual') {
        this.activeGathering = null;
        this.hideGatheringProgress();

        // Reset commitment
        this.resetCommitment();

        const reasonMessages = {
            exhausted: '😴 you worked until you dropped. respect.',
            overweight: '🏋️ youre a beast of burden now. go sell this stuff.',
            broken_tool: '🔨 tools have limits. so do you.',
            manual: '👋 called it quits. coward. (jk, self-care is important)'
        };

        console.log(`Gathering stopped: ${reasonMessages[reason] || reason}`);
    },

    // Cancel current gathering
    cancelGathering() {
        if (!this.activeGathering) return;

        addMessage('⏹️ gathering cancelled. the resources will wait. probably.', 'info');
        this.activeGathering = null;
        this.hideGatheringProgress();
        // Note: does NOT reset commitment - player is still stuck at location
    },

    // Find location by ID
    findLocation(locationId) {
        if (typeof TravelSystem !== 'undefined') {
            // Check resource nodes
            const resourceNode = TravelSystem.resourceNodes?.find(n => n.id === locationId);
            if (resourceNode) return resourceNode;

            // Check points of interest
            const poi = TravelSystem.pointsOfInterest?.find(p => p.id === locationId);
            if (poi) return poi;

            // Check locations
            const location = TravelSystem.locations?.[locationId];
            if (location) return location;
        }

        return null;
    },

    // Get resource weight for carry calculations
    getResourceWeight(resourceId) {
        const weights = {
            // Mining resources (heavy)
            iron_ore: 10,
            coal: 8,
            stone: 15,
            copper_ore: 9,
            silver_ore: 10,
            gold_ore: 12,
            gems: 1,
            rare_minerals: 8,
            crystals: 2,
            // Forestry resources
            wood: 5,
            planks: 3,
            rare_wood: 8,
            // Herbalism (light)
            herbs: 0.5,
            medicinal_plants: 0.5,
            rare_herbs: 0.3,
            mushrooms: 0.3,
            // Fishing
            fish: 2,
            exotic_fish: 3,
            river_pearls: 0.5,
            // Survival (light)
            food: 1,
            water: 2,
            bread: 0.5,
            meat: 2,
            berries: 0.3,
            vegetables: 0.5,
            apples: 0.3,
            cheese: 0.5,
            ale: 1,
            wine: 1
        };
        return weights[resourceId] || 1;
    },

    // Get human-readable resource name
    getResourceName(resourceId) {
        const names = {
            iron_ore: 'Iron Ore',
            coal: 'Coal',
            stone: 'Stone',
            copper_ore: 'Copper Ore',
            silver_ore: 'Silver Ore',
            gold_ore: 'Gold Ore',
            gems: 'Gems',
            rare_minerals: 'Rare Minerals',
            crystals: 'Crystals',
            wood: 'Wood',
            planks: 'Planks',
            rare_wood: 'Rare Wood',
            herbs: 'Herbs',
            medicinal_plants: 'Medicinal Plants',
            rare_herbs: 'Rare Herbs',
            mushrooms: 'Mushrooms',
            fish: 'Fish',
            exotic_fish: 'Exotic Fish',
            river_pearls: 'River Pearls',
            food: 'Food',
            water: 'Water'
        };
        return names[resourceId] || resourceId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

    //  Track gathering section collapsed state
    gatheringSectionCollapsed: true,

    //  Toggle gathering section collapse
    toggleGatheringSection() {
        this.gatheringSectionCollapsed = !this.gatheringSectionCollapsed;
        const content = document.getElementById('gathering-section-content');
        const fullHeader = document.getElementById('gathering-full-header');
        const collapsedBtn = document.getElementById('gathering-collapsed-btn');

        if (this.gatheringSectionCollapsed) {
            if (content) content.style.display = 'none';
            if (fullHeader) fullHeader.style.display = 'none';
            if (collapsedBtn) collapsedBtn.style.display = 'block';
        } else {
            if (content) content.style.display = 'block';
            if (fullHeader) fullHeader.style.display = 'flex';
            if (collapsedBtn) collapsedBtn.style.display = 'none';
        }
    },

    //  Add gathering section to location panel (like exploration section)
    // Only shows at locations that support gathering (mine, forest, farm, etc.)
    addGatheringSection(locationId) {
        const location = this.findLocation(locationId);
        if (!location) return;

        // Check if location supports gathering
        const gatherableTypes = ['mine', 'forest', 'farm', 'cave', 'quarry', 'fishing', 'river', 'lake'];
        const hasAvailableResources = location.availableResources && location.availableResources.length > 0;
        const isGatherableType = gatherableTypes.includes(location.type);

        // Don't show gathering section at non-gatherable locations
        if (!hasAvailableResources && !isGatherableType) {
            // Remove existing section if any
            const existingSection = document.getElementById('gathering-section');
            if (existingSection) existingSection.remove();
            return;
        }

        const locationPanel = document.getElementById('location-panel');
        if (!locationPanel) return;

        // Remove existing gathering section
        const existingSection = document.getElementById('gathering-section');
        if (existingSection) existingSection.remove();

        // Get available gathering actions for this location (using location's availableResources)
        const availableActions = this.getAvailableGatheringActions(location.type, location);

        // Create gathering section
        const section = document.createElement('div');
        section.id = 'gathering-section';
        section.className = 'location-gathering-section';
        section.style.cssText = 'margin-top: 10px; border-top: 1px solid #4fc3f740; padding-top: 10px;';

        // Build section HTML
        let contentHTML = `
            <!-- Collapsed state: Simple gather button -->
            <button id="gathering-collapsed-btn"
                    style="display: ${this.gatheringSectionCollapsed ? 'flex' : 'none'};
                           width: 100%; padding: 10px 15px; margin: 5px 0;
                           background: linear-gradient(135deg, #2e5a3a 0%, #1a3a2a 100%);
                           border: 1px solid #4caf50; border-radius: 6px;
                           color: #4caf50; font-weight: bold; cursor: pointer;
                           align-items: center; justify-content: center; gap: 8px;"
                    onclick="ResourceGatheringSystem.toggleGatheringSection()">
                Gather Resources (${availableActions.length} available)
            </button>

            <!-- Expanded state: Full header with details -->
            <div id="gathering-full-header"
                 style="display: ${this.gatheringSectionCollapsed ? 'none' : 'flex'}; justify-content: space-between; align-items: center; margin-bottom: 10px; cursor: pointer;"
                 onclick="ResourceGatheringSystem.toggleGatheringSection()">
                <h3 style="color: #4caf50; margin: 0; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.8em; width: 16px;">▼</span>
                    Gathering
                </h3>
                <span style="color: #888; font-size: 0.85em;">${availableActions.length} resources</span>
            </div>
            <div id="gathering-section-content" style="display: ${this.gatheringSectionCollapsed ? 'none' : 'block'};">
        `;

        if (availableActions.length === 0) {
            contentHTML += `
                <div style="padding: 15px; text-align: center; color: #888;">
                    <p style="margin: 0;">🔍 No resources to gather here.</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.85em; font-style: italic;">
                        Try forests, mines, farms, or fishing spots!
                    </p>
                </div>
            `;
        } else {
            // Scrollable list of available gathering actions
            contentHTML += `
                <div class="gathering-actions-list" style="max-height: 200px; overflow-y: auto; border: 1px solid rgba(76, 175, 80, 0.2); border-radius: 6px;">
            `;

            availableActions.forEach(action => {
                const toolCheck = this.checkToolRequirement(action);
                const canGather = toolCheck.hasRequired;
                const toolInfo = toolCheck.hasRequired
                    ? `<span style="color: #4caf50;">✓ ${toolCheck.toolName || 'No tool needed'}</span>`
                    : `<span style="color: #f44336;">✗ Need ${toolCheck.requiredTool}</span>`;

                contentHTML += `
                    <div class="gathering-action-item"
                         data-action-id="${action.id}"
                         style="
                            padding: 10px 12px;
                            border-bottom: 1px solid rgba(76, 175, 80, 0.1);
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            cursor: ${canGather ? 'pointer' : 'not-allowed'};
                            opacity: ${canGather ? '1' : '0.5'};
                            transition: background 0.2s ease;
                         "
                         ${canGather ? `onclick="ResourceGatheringSystem.startGatheringFromPanel('${action.id}')"` : ''}
                         onmouseenter="this.style.background='rgba(76, 175, 80, 0.1)'"
                         onmouseleave="this.style.background='transparent'"
                    >
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.3em;">${action.icon}</span>
                            <div>
                                <div style="font-weight: bold; color: #e0e0e0;">${action.name}</div>
                                <div style="font-size: 0.75em; color: #888;">
                                    ${toolInfo} • ${action.baseTime}s
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right; font-size: 0.8em;">
                            <div style="color: #4caf50;">${action.baseYield.min}-${action.baseYield.max}x</div>
                            <div style="color: #888;">${action.outputItem}</div>
                        </div>
                    </div>
                `;
            });

            contentHTML += '</div>'; // close gathering-actions-list
        }

        contentHTML += '</div>'; // close gathering-section-content
        section.innerHTML = contentHTML;
        locationPanel.appendChild(section);
    },

    //  Get available gathering actions for a location
    // Uses location's availableResources array if present, otherwise falls back to type
    getAvailableGatheringActions(locationType, location = null) {
        const actions = [];

        // Get the location's available resources if provided
        const availableResources = location?.availableResources || [];

        // If location has specific resources, use those
        if (availableResources.length > 0) {
            availableResources.forEach(resourceId => {
                const actionData = this.getGatheringActionForResource(resourceId, location);
                if (actionData) {
                    actions.push(actionData);
                }
            });
            return actions;
        }

        // Fallback: Use UnifiedItemSystem's location type matching
        if (typeof UnifiedItemSystem !== 'undefined') {
            const gatheringActions = UnifiedItemSystem.gatheringActions || {};

            for (const [actionId, action] of Object.entries(gatheringActions)) {
                if (action.locationTypes && action.locationTypes.includes(locationType)) {
                    actions.push({ id: actionId, ...action });
                }
            }
        }

        return actions;
    },

    // Get gathering action data for a specific resource
    getGatheringActionForResource(resourceId, location = null) {
        // Resource-specific gathering actions with real items
        const resourceActions = {
            // Mining
            stone: { id: 'gather_stone', name: 'Mine Stone', icon: '🪨', outputItem: 'stone', baseTime: 20, baseYield: { min: 2, max: 4 }, toolRequired: null, staminaCost: 5 },
            iron_ore: { id: 'gather_iron', name: 'Mine Iron Ore', icon: '⛏️', outputItem: 'iron_ore', baseTime: 35, baseYield: { min: 1, max: 3 }, toolRequired: 'pickaxe', staminaCost: 8 },
            copper_ore: { id: 'gather_copper', name: 'Mine Copper Ore', icon: '🟤', outputItem: 'copper_ore', baseTime: 30, baseYield: { min: 1, max: 3 }, toolRequired: 'pickaxe', staminaCost: 7 },
            coal: { id: 'gather_coal', name: 'Mine Coal', icon: '⚫', outputItem: 'coal', baseTime: 25, baseYield: { min: 2, max: 4 }, toolRequired: 'pickaxe', staminaCost: 6 },
            silver_ore: { id: 'gather_silver', name: 'Mine Silver Ore', icon: '⚪', outputItem: 'silver_ore', baseTime: 45, baseYield: { min: 1, max: 2 }, toolRequired: 'pickaxe', staminaCost: 10 },
            gold_ore: { id: 'gather_gold', name: 'Mine Gold Ore', icon: '🟡', outputItem: 'gold_ore', baseTime: 60, baseYield: { min: 1, max: 2 }, toolRequired: 'pickaxe', staminaCost: 12 },
            gems: { id: 'gather_gems', name: 'Mine Gems', icon: '💎', outputItem: 'gems', baseTime: 50, baseYield: { min: 1, max: 2 }, toolRequired: 'pickaxe', staminaCost: 10 },

            // Forestry
            wood: { id: 'gather_wood', name: 'Chop Wood', icon: '🪵', outputItem: 'wood', baseTime: 25, baseYield: { min: 2, max: 5 }, toolRequired: 'axe', staminaCost: 6 },
            timber: { id: 'gather_timber', name: 'Harvest Timber', icon: '🌲', outputItem: 'wood', baseTime: 40, baseYield: { min: 3, max: 6 }, toolRequired: 'axe', staminaCost: 8 },

            // Herbalism
            herbs: { id: 'gather_herbs', name: 'Gather Herbs', icon: '🌿', outputItem: 'herbs', baseTime: 15, baseYield: { min: 2, max: 4 }, toolRequired: null, staminaCost: 3 },
            mushrooms: { id: 'gather_mushrooms', name: 'Forage Mushrooms', icon: '🍄', outputItem: 'mushrooms', baseTime: 12, baseYield: { min: 1, max: 3 }, toolRequired: null, staminaCost: 2 },
            berries: { id: 'gather_berries', name: 'Pick Berries', icon: '🫐', outputItem: 'berries', baseTime: 10, baseYield: { min: 2, max: 5 }, toolRequired: null, staminaCost: 2 },
            honey: { id: 'gather_honey', name: 'Collect Honey', icon: '🍯', outputItem: 'honey', baseTime: 20, baseYield: { min: 1, max: 2 }, toolRequired: null, staminaCost: 4 },

            // Farming
            wheat: { id: 'gather_wheat', name: 'Harvest Wheat', icon: '🌾', outputItem: 'wheat', baseTime: 20, baseYield: { min: 3, max: 6 }, toolRequired: null, staminaCost: 5 },
            vegetables: { id: 'gather_vegetables', name: 'Pick Vegetables', icon: '🥕', outputItem: 'vegetables', baseTime: 15, baseYield: { min: 2, max: 4 }, toolRequired: null, staminaCost: 3 },
            eggs: { id: 'gather_eggs', name: 'Collect Eggs', icon: '🥚', outputItem: 'eggs', baseTime: 8, baseYield: { min: 2, max: 5 }, toolRequired: null, staminaCost: 1 },
            milk: { id: 'gather_milk', name: 'Milk Cow', icon: '🥛', outputItem: 'milk', baseTime: 12, baseYield: { min: 1, max: 3 }, toolRequired: null, staminaCost: 2 },
            apples: { id: 'gather_apples', name: 'Pick Apples', icon: '🍎', outputItem: 'apples', baseTime: 10, baseYield: { min: 2, max: 5 }, toolRequired: null, staminaCost: 2 },
            grapes: { id: 'gather_grapes', name: 'Harvest Grapes', icon: '🍇', outputItem: 'grapes', baseTime: 15, baseYield: { min: 2, max: 4 }, toolRequired: null, staminaCost: 3 },

            // Hunting
            meat: { id: 'gather_meat', name: 'Hunt Game', icon: '🥩', outputItem: 'meat', baseTime: 40, baseYield: { min: 1, max: 3 }, toolRequired: 'bow', staminaCost: 10 },
            hide: { id: 'gather_hide', name: 'Skin Animal', icon: '🦌', outputItem: 'hide', baseTime: 30, baseYield: { min: 1, max: 2 }, toolRequired: 'knife', staminaCost: 6 },

            // Fishing
            fish: { id: 'gather_fish', name: 'Catch Fish', icon: '🐟', outputItem: 'fish', baseTime: 25, baseYield: { min: 1, max: 3 }, toolRequired: 'fishing_rod', staminaCost: 4 },

            // Water
            water: { id: 'gather_water', name: 'Collect Water', icon: '💧', outputItem: 'water', baseTime: 8, baseYield: { min: 2, max: 5 }, toolRequired: null, staminaCost: 1 }
        };

        const action = resourceActions[resourceId];
        if (!action) return null;

        // Apply location difficulty modifier to time
        const difficulty = location?.gatheringDifficulty || 1.0;
        return {
            ...action,
            baseTime: Math.round(action.baseTime * difficulty)
        };
    },

    //  Check tool requirement for gathering action
    checkToolRequirement(action) {
        if (!action.toolRequired) {
            return { hasRequired: true, toolName: null, requiredTool: null };
        }

        // Check player inventory for the required tool via PlayerStateManager
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        const toolId = action.toolRequired;

        // Check if player has the tool
        if (inventory[toolId] && inventory[toolId] > 0) {
            return { hasRequired: true, toolName: toolId.replace(/_/g, ' '), requiredTool: null };
        }

        // Check for upgraded versions
        const upgradedTools = Object.keys(inventory).filter(item =>
            item.includes(toolId) || item.includes(toolId.replace('_', ''))
        );

        if (upgradedTools.some(t => inventory[t] > 0)) {
            return { hasRequired: true, toolName: upgradedTools[0].replace(/_/g, ' '), requiredTool: null };
        }

        return { hasRequired: false, toolName: null, requiredTool: action.toolRequired.replace(/_/g, ' ') };
    },

    //  Start gathering from the panel UI
    startGatheringFromPanel(actionId) {
        if (typeof game === 'undefined' || !game.currentLocation) {
            addMessage('cannot gather here - no location data', 'error');
            return;
        }

        const locationId = game.currentLocation.id;
        const location = this.findLocation(locationId);

        // Try to find action from our getGatheringActionForResource first
        // actionId format: 'gather_stone', 'gather_iron', etc.
        const resourceId = actionId.replace('gather_', '');
        let action = this.getGatheringActionForResource(resourceId, location);

        // Fallback to UnifiedItemSystem
        if (!action && typeof UnifiedItemSystem !== 'undefined') {
            action = UnifiedItemSystem.gatheringActions?.[actionId];
        }

        if (!action) {
            addMessage('invalid gathering action', 'error');
            return;
        }

        // Use the output item from the action
        const outputItem = action.outputItem || resourceId;

        // Start gathering with the action's time and yield info
        this.startGatheringWithAction(locationId, outputItem, action);
    },

    // Start gathering with specific action parameters
    startGatheringWithAction(locationId, resourceId, action) {
        // Check if already gathering
        if (this.activeGathering) {
            addMessage('already gathering. one task at a time.', 'warning');
            return false;
        }

        // Find the location
        const location = this.findLocation(locationId);
        if (!location) {
            addMessage('invalid location.', 'error');
            return false;
        }

        // Check tool requirement
        const toolCheck = this.checkToolRequirement(action);
        if (!toolCheck.hasRequired) {
            addMessage(`Need ${toolCheck.requiredTool} to gather this resource.`, 'error');
            return false;
        }

        // Check stamina
        const currentStamina = game.player?.stats?.stamina || 0;
        const staminaCost = action.staminaCost || 5;
        if (currentStamina < staminaCost) {
            addMessage('Too exhausted to gather. Rest first.', 'error');
            return false;
        }

        // Check carry weight
        const resourceWeight = this.getResourceWeight(resourceId) || 1;
        if (!this.canCarryMore(resourceWeight)) {
            addMessage('Inventory full! Sell or drop items first.', 'error');
            return false;
        }

        // Calculate gathering time using action's baseTime
        const gatheringTime = action.baseTime || 20;

        // Start gathering session
        this.activeGathering = {
            locationId: locationId,
            resourceId: resourceId,
            action: action,
            startTime: TimeSystem.getTotalMinutes(),
            duration: gatheringTime,
            staminaCost: staminaCost,
            baseYield: action.baseYield || { min: 1, max: 3 }
        };

        // Auto-start time if paused - use TimeSystem for consistency
        if (typeof TimeSystem !== 'undefined' && (TimeSystem.isPaused || TimeSystem.currentSpeed === 'PAUSED')) {
            TimeSystem.setSpeed('NORMAL');
            if (typeof GameEngine !== 'undefined' && !GameEngine.isRunning) {
                GameEngine.start();
            }
        }

        addMessage(`Gathering ${this.getResourceName(resourceId)}... ~${gatheringTime} min`, 'info');

        // Show gathering progress UI
        this.showGatheringProgress();

        return true;
    },

    // Setup gathering UI elements
    setupGatheringUI() {
        // Create gathering progress container
        if (!document.getElementById('gathering-progress')) {
            const progressDiv = document.createElement('div');
            progressDiv.id = 'gathering-progress';
            progressDiv.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(30, 30, 50, 0.95);
                border: 2px solid #4fc3f7;
                border-radius: 12px;
                padding: 16px 24px;
                z-index: 600; /* Z-INDEX STANDARD: Panel overlays (gathering) */
                display: none;
                min-width: 300px;
                text-align: center;
            `;
            progressDiv.innerHTML = `
                <div class="gathering-title" style="color: #4fc3f7; font-size: 1.1em; margin-bottom: 8px;">
                    Gathering...
                </div>
                <div class="gathering-resource" style="color: #e0e0e0; margin-bottom: 12px;"></div>
                <div class="progress-bar-container" style="
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 8px;
                    height: 20px;
                    overflow: hidden;
                    margin-bottom: 12px;
                ">
                    <div class="progress-bar-fill" style="
                        height: 100%;
                        background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
                        width: 0%;
                        transition: width 0.3s ease;
                    "></div>
                </div>
                <button id="cancel-gathering-btn" style="
                    padding: 8px 16px;
                    background: linear-gradient(180deg, #f44336 0%, #d32f2f 100%);
                    border: none;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                ">Cancel</button>
            `;
            document.body.appendChild(progressDiv);

            document.getElementById('cancel-gathering-btn').onclick = () => {
                this.cancelGathering();
            };
        }
    },

    // Show gathering progress UI
    showGatheringProgress() {
        const progressDiv = document.getElementById('gathering-progress');
        if (progressDiv && this.activeGathering) {
            const resourceName = this.getResourceName(this.activeGathering.resourceId);
            progressDiv.querySelector('.gathering-resource').textContent = `Gathering ${resourceName}`;
            progressDiv.querySelector('.progress-bar-fill').style.width = '0%';
            progressDiv.style.display = 'block';
        }
    },

    // Update gathering progress UI
    updateGatheringProgress(progress) {
        const progressDiv = document.getElementById('gathering-progress');
        if (progressDiv && this.activeGathering) {
            const percentage = Math.min(100, Math.round(progress * 100));
            const progressBar = progressDiv.querySelector('.progress-bar-fill');
            const resourceDisplay = progressDiv.querySelector('.gathering-resource');

            if (progressBar) {
                progressBar.style.width = percentage + '%';
            }

            // Update text with percentage and time remaining
            if (resourceDisplay) {
                const resourceName = this.getResourceName(this.activeGathering.resourceId);
                const timeRemaining = Math.max(0, Math.ceil(this.activeGathering.duration * (1 - progress)));
                resourceDisplay.innerHTML = `
                    <div>Gathering ${resourceName}</div>
                    <div style="font-size: 1.2em; color: #4caf50; margin-top: 4px;">
                        ${percentage}% complete
                    </div>
                    <div style="font-size: 0.85em; color: #888; margin-top: 2px;">
                        ~${timeRemaining} min remaining
                    </div>
                `;
            }
        }
    },

    // Hide gathering progress UI
    hideGatheringProgress() {
        const progressDiv = document.getElementById('gathering-progress');
        if (progressDiv) {
            progressDiv.style.display = 'none';
        }
    },

    // Get mode for a location type
    getLocationMode(locationType) {
        return this.LOCATION_MODES[locationType] || 'trade';
    },

    // Check if location supports gathering
    canGatherAt(locationId) {
        const location = this.findLocation(locationId);
        if (!location) return false;

        const mode = this.getLocationMode(location.type);
        return mode === 'gather' || mode === 'both';
    },

    // Check if location supports trading
    canTradeAt(locationId) {
        const location = this.findLocation(locationId);
        if (!location) return false;

        const mode = this.getLocationMode(location.type);
        return mode === 'trade' || mode === 'both';
    },

    // Buy a tool
    buyTool(toolId) {
        const tool = this.TOOLS[toolId];
        if (!tool) {
            addMessage('Invalid tool!', 'error');
            return false;
        }

        if (typeof game === 'undefined' || !game.player) {
            addMessage('Cannot access player data!', 'error');
            return false;
        }

        if (game.player.gold < tool.price) {
            addMessage(`Not enough gold! You need ${tool.price} gold.`, 'error');
            return false;
        }

        game.player.gold -= tool.price;
        game.player.tools = game.player.tools || {};
        game.player.tools[toolId] = {
            id: toolId,
            durability: tool.durability
        };

        addMessage(`🔧 Purchased ${tool.name} for ${tool.price} gold!`, 'success');

        if (typeof updatePlayerStats === 'function') {
            updatePlayerStats();
        }

        return true;
    },

    // Repair a tool
    repairTool(toolId) {
        const tool = this.TOOLS[toolId];
        if (!tool || !game.player.tools?.[toolId]) {
            addMessage('Invalid tool!', 'error');
            return false;
        }

        const currentDurability = game.player.tools[toolId].durability;
        const repairNeeded = tool.durability - currentDurability;

        if (repairNeeded <= 0) {
            addMessage('Tool is already at full durability!', 'info');
            return false;
        }

        const repairCost = Math.ceil(repairNeeded * tool.price / tool.durability * 0.5);

        if (game.player.gold < repairCost) {
            addMessage(`Not enough gold! Repair costs ${repairCost} gold.`, 'error');
            return false;
        }

        game.player.gold -= repairCost;
        game.player.tools[toolId].durability = tool.durability;

        addMessage(`🔧 Repaired ${tool.name} for ${repairCost} gold!`, 'success');

        return true;
    }
};

// Expose globally
window.ResourceGatheringSystem = ResourceGatheringSystem;

// register with Bootstrap
Bootstrap.register('ResourceGatheringSystem', () => ResourceGatheringSystem.init(), {
    dependencies: ['game', 'ItemDatabase', 'GameWorld'],
    priority: 78,
    severity: 'optional'
});
