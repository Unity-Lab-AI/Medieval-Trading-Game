// 
// SKILL SYSTEM - power through practice and pain
// 
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 
//
//  THE SACRED TREES:
// - Trading: The art of turning copper into gold
// - Combat: When words fail, steel speaks
// - Crafting: Creation from destruction
// - Exploration: The world reveals its secrets to the worthy
// - Social: Manipulation wrapped in velvet words
//
// DEPENDENCIES (The chains that bind):
// - EventBus (optional): For the whispers between systems
// - game.player: The vessel of all progression
// - AudioSystem (optional): The sounds of triumph
//
//  INTEGRATION POINTS:
// - Character Creation: Starting skills feed into this system
// - Combat System: getCombatBonuses() fuels the violence
// - Trading: getBuyPriceModifier() / getSellPriceModifier()
// - Travel: getTravelBonuses() for the wanderer
// - Crafting: getCraftingBonuses() for the maker
//
// @author Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com
// @version 0.91.10
// 

const SkillSystem = {
    /**
     * The five skill trees - each a path toward mastery or oblivion
     */
    skillTrees: {
        //  THE MERCHANT'S PATH - Where gold flows like water
        trading: {
            name: 'Trading',
            icon: '💰',
            description: 'Master the art of commerce',
            color: '#ffd700',
            //  Skills within this dark art
            skills: {
                bargaining: {
                    name: 'Bargaining',
                    description: 'Reduce buy prices by 2% per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8], // Fibonacci-inspired costs
                    requires: null,
                    effect: (level) => ({ buyDiscount: level * 0.02 })
                },
                salesmanship: {
                    name: 'Salesmanship',
                    description: 'Increase sell prices by 2% per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ sellBonus: level * 0.02 })
                },
                marketAnalysis: {
                    name: 'Market Analysis',
                    description: 'See price trends and predictions',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { bargaining: 2, salesmanship: 2 },
                    effect: (level) => ({ pricePrediction: level })
                },
                bulkTrading: {
                    name: 'Bulk Trading',
                    description: 'Better prices for large quantities',
                    maxLevel: 3,
                    cost: [5, 8, 12],
                    requires: { marketAnalysis: 1 },
                    effect: (level) => ({ bulkDiscount: level * 0.05 })
                },
                masterMerchant: {
                    name: 'Master Merchant',
                    description: 'Unlock exclusive merchant deals',
                    maxLevel: 1,
                    cost: [20],
                    requires: { bulkTrading: 3, marketAnalysis: 3 },
                    effect: () => ({ exclusiveDeals: true })
                }
            }
        },

        // THE WARRIOR'S PATH - Blood and steel
        combat: {
            name: 'Combat',
            icon: '',
            description: 'Defend yourself on dangerous roads',
            color: '#dc3545',
            skills: {
                swordsmanship: {
                    name: 'Swordsmanship',
                    description: '+5 attack per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ attackBonus: level * 5 })
                },
                armor: {
                    name: 'Armor Training',
                    description: '+5 defense per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ defenseBonus: level * 5 })
                },
                criticalStrike: {
                    name: 'Critical Strike',
                    description: '+5% critical chance per level',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { swordsmanship: 2 },
                    effect: (level) => ({ critChance: level * 0.05 })
                },
                ironWill: {
                    name: 'Iron Will',
                    description: 'Reduce damage taken by 5% per level',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { armor: 2 },
                    effect: (level) => ({ damageReduction: level * 0.05 })
                },
                battleMaster: {
                    name: 'Battle Master',
                    description: 'Double combat rewards',
                    maxLevel: 1,
                    cost: [20],
                    requires: { criticalStrike: 3, ironWill: 3 },
                    effect: () => ({ doubleRewards: true })
                }
            }
        },

        //  THE MAKER'S PATH - Creation from chaos
        crafting: {
            name: 'Crafting',
            icon: '🔨',
            description: 'Create valuable goods',
            color: '#fd7e14',
            skills: {
                basicCrafting: {
                    name: 'Basic Crafting',
                    description: '+10% crafting success per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ craftingSuccess: level * 0.10 })
                },
                efficiency: {
                    name: 'Efficiency',
                    description: 'Reduce material cost by 5% per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ materialSaving: level * 0.05 })
                },
                qualityCrafting: {
                    name: 'Quality Crafting',
                    description: 'Chance to craft higher rarity items',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { basicCrafting: 2 },
                    effect: (level) => ({ rarityBonus: level * 0.10 })
                },
                speedCrafting: {
                    name: 'Speed Crafting',
                    description: 'Reduce crafting time by 15% per level',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { efficiency: 2 },
                    effect: (level) => ({ timeReduction: level * 0.15 })
                },
                masterCrafter: {
                    name: 'Master Crafter',
                    description: 'Unlock legendary recipes',
                    maxLevel: 1,
                    cost: [20],
                    requires: { qualityCrafting: 3, speedCrafting: 3 },
                    effect: () => ({ legendaryRecipes: true })
                }
            }
        },

        //  THE WANDERER'S PATH - The world is vast and unforgiving
        exploration: {
            name: 'Exploration',
            icon: '🗺️',
            description: 'Navigate the world efficiently',
            color: '#28a745',
            skills: {
                pathfinding: {
                    name: 'Pathfinding',
                    description: '+5% travel speed per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ travelSpeed: level * 0.05 })
                },
                endurance: {
                    name: 'Endurance',
                    description: 'Reduce stamina cost by 5% per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ staminaSaving: level * 0.05 })
                },
                scavenging: {
                    name: 'Scavenging',
                    description: 'Find more resources while traveling',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { pathfinding: 2 },
                    effect: (level) => ({ resourceFind: level * 0.15 })
                },
                survival: {
                    name: 'Survival',
                    description: 'Reduce hunger/thirst drain while traveling',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { endurance: 2 },
                    effect: (level) => ({ needsReduction: level * 0.10 })
                },
                masterExplorer: {
                    name: 'Master Explorer',
                    description: 'Reveal all map locations',
                    maxLevel: 1,
                    cost: [20],
                    requires: { scavenging: 3, survival: 3 },
                    effect: () => ({ revealMap: true })
                }
            }
        },

        //  THE MANIPULATOR'S PATH - Words sharper than swords
        social: {
            name: 'Social',
            icon: '🎭',
            description: 'Influence people and factions',
            color: '#6f42c1',
            skills: {
                charm: {
                    name: 'Charm',
                    description: '+10% reputation gain per level',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ repBonus: level * 0.10 })
                },
                intimidation: {
                    name: 'Intimidation',
                    description: 'Better prices from scared merchants',
                    maxLevel: 5,
                    cost: [1, 2, 3, 5, 8],
                    requires: null,
                    effect: (level) => ({ fearDiscount: level * 0.02 })
                },
                networking: {
                    name: 'Networking',
                    description: 'Unlock faction contacts',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { charm: 2 },
                    effect: (level) => ({ contacts: level })
                },
                persuasion: {
                    name: 'Persuasion',
                    description: 'Better quest rewards',
                    maxLevel: 3,
                    cost: [3, 5, 8],
                    requires: { intimidation: 2 },
                    effect: (level) => ({ questRewardBonus: level * 0.10 })
                },
                masterDiplomat: {
                    name: 'Master Diplomat',
                    description: 'Access to all faction quests',
                    maxLevel: 1,
                    cost: [20],
                    requires: { networking: 3, persuasion: 3 },
                    effect: () => ({ allFactionQuests: true })
                }
            }
        }
    },

    /**
     * Starting skill mappings from character creation
     */
    startingSkillMappings: {
        //  Maps game.player.skills to our skill trees
        trading: { tree: 'trading', skill: 'bargaining' },
        negotiation: { tree: 'social', skill: 'charm' },
        perception: { tree: 'exploration', skill: 'pathfinding' },
        combat: { tree: 'combat', skill: 'swordsmanship' },
        crafting: { tree: 'crafting', skill: 'basicCrafting' },
        stealth: { tree: 'social', skill: 'intimidation' }
    },

    //  Player's learned skills - the fruit of their labors
    playerSkills: {},
    skillPoints: 0,
    totalSkillPoints: 0,

    /**
     * Initialize the skill system
     */
    init() {
        this.loadSkills();
        this.createStyles();
        this.integrateStartingSkills();

        //  Listen for level ups - the universe grants power to the worthy
        if (typeof EventBus !== 'undefined') {
            EventBus.on('player:levelUp', (data) => {
                this.grantSkillPoints(2);
                this.showNotification(`Level Up! +2 Skill Points`);
            });

            //  Listen for character creation completion
            EventBus.on('character:created', () => {
                this.integrateStartingSkills();
            });
        }

        console.log('🎓 SkillSystem awakens from its slumber... 🖤');
    },

    /**
     * Integrate starting skills from character creation
     * Bridges game.player.skills with the skill tree system
     */
    integrateStartingSkills() {
        if (typeof game === 'undefined' || !game.player || !game.player.skills) return;

        const startingSkills = game.player.skills;

        //  Convert old skill format to new tree format
        for (const [skillName, level] of Object.entries(startingSkills)) {
            const mapping = this.startingSkillMappings[skillName];
            if (mapping && level > 0) {
                //  Grant skill levels based on starting skill values
                if (!this.playerSkills[mapping.tree]) {
                    this.playerSkills[mapping.tree] = {};
                }

                //  Starting skills translate to initial tree progress
                const currentLevel = this.playerSkills[mapping.tree][mapping.skill] || 0;
                if (level > currentLevel) {
                    this.playerSkills[mapping.tree][mapping.skill] = Math.min(level,
                        this.skillTrees[mapping.tree].skills[mapping.skill].maxLevel);
                }
            }
        }

        //  Grant initial skill points based on character creation
        if (this.totalSkillPoints === 0) {
            this.grantSkillPoints(3); // Starting skill points
        }

        this.saveSkills();
    },

    /**
     * Load skills from saved game state
     */
    loadSkills() {
        if (typeof game !== 'undefined' && game.player) {
            this.playerSkills = game.player.learnedSkills || {};
            this.skillPoints = game.player.skillPoints || 0;
            this.totalSkillPoints = game.player.totalSkillPoints || 0;
        }
    },

    /**
     * Save skills to game state
     */
    saveSkills() {
        if (typeof game !== 'undefined' && game.player) {
            game.player.learnedSkills = this.playerSkills;
            game.player.skillPoints = this.skillPoints;
            game.player.totalSkillPoints = this.totalSkillPoints;
        }
    },

    /**
     * Grant skill points to the player
     * @param {number} amount - Number of points to grant
     */
    grantSkillPoints(amount) {
        this.skillPoints += amount;
        this.totalSkillPoints += amount;
        this.saveSkills();

        //  Whisper to other systems
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('skills:pointsChanged', { points: this.skillPoints });
        }
    },

    /**
     * Check if a skill can be learned
     * @param {string} treeId - Skill tree ID
     * @param {string} skillId - Skill ID
     * @returns {Object} - {can: boolean, reason: string}
     */
    canLearnSkill(treeId, skillId) {
        const tree = this.skillTrees[treeId];
        if (!tree) return { can: false, reason: 'Invalid skill tree' };

        const skill = tree.skills[skillId];
        if (!skill) return { can: false, reason: 'Invalid skill' };

        const currentLevel = this.getSkillLevel(treeId, skillId);

        //  Check if already maxed - even gods have limits
        if (currentLevel >= skill.maxLevel) {
            return { can: false, reason: 'Skill maxed out' };
        }

        //  Check the cost - power demands sacrifice
        const cost = skill.cost[currentLevel];
        if (this.skillPoints < cost) {
            return { can: false, reason: `Need ${cost} skill points` };
        }

        //  Check prerequisites - wisdom builds upon wisdom
        if (skill.requires) {
            for (const [reqSkillId, reqLevel] of Object.entries(skill.requires)) {
                if (this.getSkillLevel(treeId, reqSkillId) < reqLevel) {
                    const reqSkill = tree.skills[reqSkillId];
                    return { can: false, reason: `Requires ${reqSkill.name} level ${reqLevel}` };
                }
            }
        }

        return { can: true };
    },

    /**
     * Learn a skill
     * @param {string} treeId - Skill tree ID
     * @param {string} skillId - Skill ID to learn
     * @returns {boolean} - Success or failure
     */
    learnSkill(treeId, skillId) {
        const canLearn = this.canLearnSkill(treeId, skillId);
        if (!canLearn.can) {
            this.showNotification(canLearn.reason, 'error');
            return false;
        }

        const tree = this.skillTrees[treeId];
        const skill = tree.skills[skillId];
        const currentLevel = this.getSkillLevel(treeId, skillId);
        const cost = skill.cost[currentLevel];

        //  The price is paid
        this.skillPoints -= cost;

        //  The skill is learned
        if (!this.playerSkills[treeId]) {
            this.playerSkills[treeId] = {};
        }
        this.playerSkills[treeId][skillId] = currentLevel + 1;

        //  Persist the growth
        this.saveSkills();
        this.updateUI();

        //  Announce to the world
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('skills:learned', {
                tree: treeId,
                skill: skillId,
                level: currentLevel + 1
            });
        }

        this.showNotification(`Learned ${skill.name} (Level ${currentLevel + 1})!`, 'success');

        //  The sound of progress
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.playSound('levelUp');
        }

        return true;
    },

    /**
     * Get the current level of a skill
     */
    getSkillLevel(treeId, skillId) {
        return this.playerSkills[treeId]?.[skillId] || 0;
    },

    /**
     * Get combined effects from all learned skills
     * @returns {Object} - Combined effects from all skills
     */
    getTotalEffects() {
        const effects = {};

        //  Iterate through every learned skill
        for (const [treeId, tree] of Object.entries(this.skillTrees)) {
            for (const [skillId, skill] of Object.entries(tree.skills)) {
                const level = this.getSkillLevel(treeId, skillId);
                if (level > 0) {
                    const skillEffects = skill.effect(level);
                    //  Accumulate numerical effects, override booleans
                    for (const [key, value] of Object.entries(skillEffects)) {
                        if (typeof value === 'number') {
                            effects[key] = (effects[key] || 0) + value;
                        } else {
                            effects[key] = value;
                        }
                    }
                }
            }
        }

        return effects;
    },

    /**
     * Get trading price modifiers from skills
     */
    getBuyPriceModifier() {
        const effects = this.getTotalEffects();
        let modifier = 1;

        if (effects.buyDiscount) modifier -= effects.buyDiscount;
        if (effects.fearDiscount) modifier -= effects.fearDiscount;
        if (effects.bulkDiscount) modifier -= effects.bulkDiscount;

        return Math.max(0.5, modifier); // Floor at 50% minimum
    },

    getSellPriceModifier() {
        const effects = this.getTotalEffects();
        let modifier = 1;

        if (effects.sellBonus) modifier += effects.sellBonus;

        return modifier;
    },

    /**
     * Get combat bonuses from skills
     */
    getCombatBonuses() {
        const effects = this.getTotalEffects();
        return {
            attack: effects.attackBonus || 0,
            defense: effects.defenseBonus || 0,
            critChance: effects.critChance || 0,
            damageReduction: effects.damageReduction || 0,
            doubleRewards: effects.doubleRewards || false
        };
    },

    /**
     * Get travel bonuses from skills
     */
    getTravelBonuses() {
        const effects = this.getTotalEffects();
        return {
            speedBonus: effects.travelSpeed || 0,
            staminaSaving: effects.staminaSaving || 0,
            resourceFind: effects.resourceFind || 0,
            needsReduction: effects.needsReduction || 0,
            revealMap: effects.revealMap || false
        };
    },

    /**
     * Get crafting bonuses from skills
     */
    getCraftingBonuses() {
        const effects = this.getTotalEffects();
        return {
            successBonus: effects.craftingSuccess || 0,
            materialSaving: effects.materialSaving || 0,
            rarityBonus: effects.rarityBonus || 0,
            timeReduction: effects.timeReduction || 0,
            legendaryRecipes: effects.legendaryRecipes || false
        };
    },

    /**
     * Get social bonuses from skills
     */
    getSocialBonuses() {
        const effects = this.getTotalEffects();
        return {
            repBonus: effects.repBonus || 0,
            fearDiscount: effects.fearDiscount || 0,
            contacts: effects.contacts || 0,
            questRewardBonus: effects.questRewardBonus || 0,
            allFactionQuests: effects.allFactionQuests || false
        };
    },

    /**
     * Show the skill panel UI
     */
    show() {
        this.loadSkills();

        //  Destroy any existing panel
        const existingPanel = document.getElementById('skill-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'skill-panel';
        panel.className = 'skill-panel';

        panel.innerHTML = `
            <div class="skill-panel-header">
                <h2>🎓 Skill Trees</h2>
                <div class="skill-points-display">
                    <span class="skill-points-icon"></span>
                    <span class="skill-points-value">${this.skillPoints}</span>
                    <span class="skill-points-label">Skill Points</span>
                </div>
                <button class="skill-panel-close" onclick="SkillSystem.hide()">×</button>
            </div>
            <div class="skill-panel-content">
                <div class="skill-tree-tabs">
                    ${Object.entries(this.skillTrees).map(([id, tree], index) => `
                        <button class="skill-tree-tab ${index === 0 ? 'active' : ''}"
                                data-tree="${id}"
                                style="border-color: ${tree.color}"
                                onclick="SkillSystem.showTree('${id}')">
                            <span class="tree-icon">${tree.icon}</span>
                            <span class="tree-name">${tree.name}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="skill-tree-display" id="skill-tree-display">
                    ${this.renderSkillTree(Object.keys(this.skillTrees)[0])}
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        //  Animate from the shadows
        requestAnimationFrame(() => {
            panel.classList.add('visible');
        });
    },

    /**
     * Hide the skill panel UI
     */
    hide() {
        const panel = document.getElementById('skill-panel');
        if (panel) {
            panel.classList.remove('visible');
            setTimeout(() => panel.remove(), 300);
        }
    },

    /**
     * Display a specific skill tree
     */
    showTree(treeId) {
        //  Update tab states
        document.querySelectorAll('.skill-tree-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tree === treeId);
        });

        //  Render the chosen tree
        const display = document.getElementById('skill-tree-display');
        if (display) {
            display.innerHTML = this.renderSkillTree(treeId);
        }
    },

    /**
     * Render a skill tree to HTML
     */
    renderSkillTree(treeId) {
        const tree = this.skillTrees[treeId];
        if (!tree) return '<p>Tree not found in the darkness...</p>';

        const skills = Object.entries(tree.skills);

        //  Organize skills into tiers based on prerequisites
        const tiers = [[], [], []];
        skills.forEach(([skillId, skill]) => {
            if (!skill.requires) {
                tiers[0].push([skillId, skill]); // Foundation tier
            } else if (Object.values(skill.requires).some(r => r >= 3)) {
                tiers[2].push([skillId, skill]); // Master tier
            } else {
                tiers[1].push([skillId, skill]); // Intermediate tier
            }
        });

        return `
            <div class="skill-tree" data-tree="${treeId}">
                <div class="skill-tree-header" style="border-color: ${tree.color}">
                    <span class="tree-icon-large">${tree.icon}</span>
                    <div>
                        <h3>${tree.name}</h3>
                        <p>${tree.description}</p>
                    </div>
                </div>
                <div class="skill-tiers">
                    ${tiers.map((tierSkills, tierIndex) => `
                        <div class="skill-tier">
                            <div class="tier-label">${['Foundation', 'Advanced', 'Mastery'][tierIndex]}</div>
                            <div class="tier-skills">
                                ${tierSkills.map(([skillId, skill]) =>
                                    this.renderSkillNode(treeId, skillId, skill, tree.color)
                                ).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render a single skill node to HTML
     */
    renderSkillNode(treeId, skillId, skill, color) {
        const currentLevel = this.getSkillLevel(treeId, skillId);
        const canLearn = this.canLearnSkill(treeId, skillId);
        const isMaxed = currentLevel >= skill.maxLevel;
        const cost = isMaxed ? 0 : skill.cost[currentLevel];

        //  Determine visual state
        let statusClass = 'locked';
        if (isMaxed) {
            statusClass = 'maxed';
        } else if (currentLevel > 0) {
            statusClass = 'learned';
        } else if (canLearn.can) {
            statusClass = 'available';
        }

        //  Calculate effect previews
        const currentEffect = currentLevel > 0 ? skill.effect(currentLevel) : null;
        const nextEffect = !isMaxed ? skill.effect(currentLevel + 1) : null;

        return `
            <div class="skill-node ${statusClass}"
                 data-skill="${skillId}"
                 style="--skill-color: ${color}"
                 onclick="SkillSystem.handleSkillClick('${treeId}', '${skillId}')">
                <div class="skill-icon-wrapper">
                    <div class="skill-level-badge">${currentLevel}/${skill.maxLevel}</div>
                </div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-description">${skill.description}</div>
                    ${skill.requires ? `
                        <div class="skill-requires">
                            Requires: ${Object.entries(skill.requires).map(([req, lvl]) =>
                                `${this.skillTrees[treeId].skills[req].name} ${lvl}`
                            ).join(', ')}
                        </div>
                    ` : ''}
                    ${!isMaxed ? `
                        <div class="skill-cost ${this.skillPoints >= cost ? 'affordable' : 'expensive'}">
                            Cost: ${cost} SP
                        </div>
                    ` : `
                        <div class="skill-maxed-label">MASTERED</div>
                    `}
                    ${currentEffect ? `
                        <div class="skill-current-effect">
                            Current: ${this.formatEffect(currentEffect)}
                        </div>
                    ` : ''}
                    ${nextEffect && !isMaxed ? `
                        <div class="skill-next-effect">
                            Next: ${this.formatEffect(nextEffect)}
                        </div>
                    ` : ''}
                </div>
                ${canLearn.can ? `<div class="skill-learn-hint">Click to learn!</div>` : ''}
            </div>
        `;
    },

    /**
     * Format skill effect for display
     */
    formatEffect(effect) {
        const parts = [];
        for (const [key, value] of Object.entries(effect)) {
            if (typeof value === 'boolean') {
                parts.push(key.replace(/([A-Z])/g, ' $1').trim());
            } else if (typeof value === 'number') {
                const percent = value < 1 ? `${(value * 100).toFixed(0)}%` : value;
                parts.push(`${key.replace(/([A-Z])/g, ' $1').trim()}: +${percent}`);
            }
        }
        return parts.join(', ');
    },

    /**
     * Handle skill node click
     */
    handleSkillClick(treeId, skillId) {
        const canLearn = this.canLearnSkill(treeId, skillId);
        if (canLearn.can) {
            this.learnSkill(treeId, skillId);
        } else {
            this.showNotification(canLearn.reason, 'warning');
        }
    },

    /**
     * Update UI after skill changes
     */
    updateUI() {
        const pointsDisplay = document.querySelector('.skill-points-value');
        if (pointsDisplay) {
            pointsDisplay.textContent = this.skillPoints;
        }

        const currentTree = document.querySelector('.skill-tree-tab.active');
        if (currentTree) {
            this.showTree(currentTree.dataset.tree);
        }
    },

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.show(message, type);
        } else {
            //  Fallback notification from the shadows
            const notification = document.createElement('div');
            notification.className = `skill-notification skill-notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
                color: ${type === 'warning' ? '#000' : '#fff'};
                border-radius: 8px;
                z-index: 850; /* Z-INDEX STANDARD: Notifications (skill) */
                animation: slideIn 0.3s ease;
                font-family: 'Crimson Text', serif;
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    },

    /**
     * Create CSS styles for skill system
     */
    createStyles() {
        if (document.getElementById('skill-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'skill-system-styles';
        style.textContent = `
            /* Animations */
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* Skill Panel */
            .skill-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                width: 90%;
                max-width: 900px;
                max-height: 85vh;
                background: linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%);
                border: 2px solid #ffd700;
                border-radius: 12px;
                z-index: 600; /* Z-INDEX STANDARD: Panel overlays (skill) */
                opacity: 0;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
            }

            .skill-panel.visible {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }

            .skill-panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 15px 20px;
                background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
                border-bottom: 1px solid #ffd700;
            }

            .skill-panel-header h2 {
                margin: 0;
                color: #ffd700;
                font-family: 'Cinzel', serif;
                font-size: 1.5em;
            }

            .skill-points-display {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 0, 0, 0.3);
                padding: 8px 15px;
                border-radius: 20px;
                border: 1px solid #ffd700;
            }

            .skill-points-icon { font-size: 1.2em; }
            .skill-points-value { font-size: 1.4em; font-weight: bold; color: #ffd700; }
            .skill-points-label { color: #888; font-size: 0.9em; }

            .skill-panel-close {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
                padding: 5px 10px;
                transition: color 0.2s;
            }
            .skill-panel-close:hover { color: #dc3545; }

            .skill-panel-content {
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            /* Skill Tree Tabs */
            .skill-tree-tabs {
                display: flex;
                gap: 5px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                overflow-x: auto;
            }

            .skill-tree-tab {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid transparent;
                border-radius: 8px;
                color: #ccc;
                cursor: pointer;
                transition: all 0.2s;
                font-family: 'Crimson Text', serif;
            }
            .skill-tree-tab:hover { background: rgba(255, 255, 255, 0.1); }
            .skill-tree-tab.active { background: rgba(255, 255, 255, 0.15); color: #fff; }

            .tree-icon { font-size: 1.3em; }
            .skill-tree-display { flex: 1; overflow-y: auto; padding: 20px; }

            .skill-tree-header {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                border-left: 4px solid;
                margin-bottom: 20px;
            }

            .tree-icon-large { font-size: 2.5em; }
            .skill-tree-header h3 { margin: 0 0 5px 0; color: #fff; font-family: 'Cinzel', serif; }
            .skill-tree-header p { margin: 0; color: #888; }

            /* Skill Tiers */
            .skill-tiers { display: flex; flex-direction: column; gap: 20px; }
            .skill-tier { background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 15px; }
            .tier-label { color: #ffd700; font-size: 0.9em; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Cinzel', serif; }
            .tier-skills { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }

            /* Skill Nodes */
            .skill-node {
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid #333;
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            .skill-node:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); }
            .skill-node.locked { opacity: 0.5; cursor: not-allowed; }
            .skill-node.available { border-color: var(--skill-color); box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); }
            .skill-node.learned { border-color: var(--skill-color); background: rgba(255, 215, 0, 0.1); }
            .skill-node.maxed { border-color: #28a745; background: rgba(40, 167, 69, 0.2); }

            .skill-icon-wrapper { position: absolute; top: -10px; right: 10px; }
            .skill-level-badge { background: #333; color: #fff; padding: 3px 8px; border-radius: 10px; font-size: 0.8em; border: 1px solid #555; }
            .skill-node.maxed .skill-level-badge { background: #28a745; border-color: #28a745; }

            .skill-info { display: flex; flex-direction: column; gap: 5px; }
            .skill-name { font-family: 'Cinzel', serif; font-size: 1.1em; color: #fff; }
            .skill-description { color: #888; font-size: 0.9em; }
            .skill-requires { color: #dc3545; font-size: 0.8em; font-style: italic; }
            .skill-cost { font-size: 0.9em; margin-top: 5px; }
            .skill-cost.affordable { color: #28a745; }
            .skill-cost.expensive { color: #dc3545; }
            .skill-maxed-label { color: #28a745; font-weight: bold; font-size: 0.9em; }
            .skill-current-effect, .skill-next-effect { font-size: 0.8em; color: #6c757d; }
            .skill-next-effect { color: #17a2b8; }
            .skill-learn-hint { position: absolute; bottom: 5px; right: 10px; font-size: 0.75em; color: #ffd700; animation: pulse 1.5s infinite; }
        `;
        document.head.appendChild(style);
    },

    /**
     * Get save data for persistence
     */
    getSaveData() {
        return {
            playerSkills: this.playerSkills,
            skillPoints: this.skillPoints,
            totalSkillPoints: this.totalSkillPoints
        };
    },

    /**
     * Load state from save data
     */
    loadSaveData(data) {
        if (data) {
            this.playerSkills = data.playerSkills || {};
            this.skillPoints = data.skillPoints || 0;
            this.totalSkillPoints = data.totalSkillPoints || 0;

            //  Sync skills back to game.player for other systems 
            this._syncSkillsToPlayer();

            this.saveSkills();
        }
    },

    /**
     * Sync SkillSystem.playerSkills to game.player.skills
     * Other systems read game.player.skills directly, so we keep them in sync
     */
    _syncSkillsToPlayer() {
        if (typeof game === 'undefined' || !game.player) return;

        //  Ensure game.player.skills exists
        if (!game.player.skills) {
            game.player.skills = {};
        }

        //  Map skill levels back to game.player.skills format
        for (const [skillId, level] of Object.entries(this.playerSkills)) {
            game.player.skills[skillId] = level;
        }

        console.log('🖤 Skills synced to game.player:', Object.keys(this.playerSkills).length, 'skills');
    }
};

// register with Bootstrap
Bootstrap.register('SkillSystem', () => SkillSystem.init(), {
    dependencies: ['game', 'PlayerStateManager'],
    priority: 53,
    severity: 'optional'
});

//  Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillSystem;
}
