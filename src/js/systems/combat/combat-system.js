// ═══════════════════════════════════════════════════════════════
// ⚔️ COMBAT SYSTEM - When trading isn't an option
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com
// ═══════════════════════════════════════════════════════════════
// A complete combat resolution system for encounters, robberies,
// dungeon fights, and random events. Calculates damage, applies
// equipment bonuses, and determines outcomes.
// ═══════════════════════════════════════════════════════════════

const CombatSystem = {
    // ═══════════════════════════════════════════════════════════════
    // UTILITIES - Security first, bitches 🖤💀
    // ═══════════════════════════════════════════════════════════════

    // 🛡️ Escape HTML to prevent XSS - Unity says "sanitize or die" 🦇
    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    config: {
        baseDamage: 10,
        baseDefense: 5,
        critChance: 0.1,
        critMultiplier: 2.0,
        fleeChance: 0.6,
        minDamage: 1,
        maxRounds: 20
    },

    // Combat state
    activeCombat: null,
    combatLog: [],

    // ═══════════════════════════════════════════════════════════════
    // ENEMY DEFINITIONS
    // ═══════════════════════════════════════════════════════════════
    enemies: {
        // Common enemies
        bandit: {
            id: 'bandit',
            name: 'Bandit',
            icon: '🗡️',
            health: 30,
            attack: 8,
            defense: 3,
            speed: 5,
            goldDrop: { min: 5, max: 25 },
            loot: ['rusty_sword', 'leather_scraps', 'bandage'],
            xpReward: 15
        },
        wolf: {
            id: 'wolf',
            name: 'Wild Wolf',
            icon: '🐺',
            health: 25,
            attack: 10,
            defense: 2,
            speed: 8,
            goldDrop: { min: 0, max: 5 },
            loot: ['wolf_pelt', 'bone_fragment', 'raw_meat'],
            xpReward: 10
        },
        thief: {
            id: 'thief',
            name: 'Thief',
            icon: '🥷',
            health: 20,
            attack: 6,
            defense: 4,
            speed: 10,
            goldDrop: { min: 10, max: 50 },
            loot: ['lockpick', 'dagger', 'stolen_goods'],
            xpReward: 12
        },
        skeleton: {
            id: 'skeleton',
            name: 'Skeleton Warrior',
            icon: '💀',
            health: 35,
            attack: 12,
            defense: 5,
            speed: 4,
            goldDrop: { min: 0, max: 15 },
            loot: ['bone_fragment', 'rusted_medallion', 'ancient_coin'],
            xpReward: 20
        },
        goblin: {
            id: 'goblin',
            name: 'Goblin',
            icon: '👺',
            health: 15,
            attack: 5,
            defense: 2,
            speed: 7,
            goldDrop: { min: 3, max: 12 },
            loot: ['goblin_ear', 'crude_dagger', 'shiny_rock'],
            xpReward: 8
        },
        // Stronger enemies
        orc: {
            id: 'orc',
            name: 'Orc Warrior',
            icon: '👹',
            health: 60,
            attack: 18,
            defense: 8,
            speed: 4,
            goldDrop: { min: 20, max: 60 },
            loot: ['orc_tooth', 'crude_axe', 'iron_ore'],
            xpReward: 35
        },
        ghost: {
            id: 'ghost',
            name: 'Vengeful Spirit',
            icon: '👻',
            health: 40,
            attack: 15,
            defense: 0, // Can't be defended against
            speed: 12,
            goldDrop: { min: 0, max: 0 },
            loot: ['ectoplasm', 'spirit_essence', 'cursed_mirror'],
            xpReward: 30,
            special: 'phasing' // Ignores some defense
        },
        troll: {
            id: 'troll',
            name: 'Cave Troll',
            icon: '🧌',
            health: 100,
            attack: 25,
            defense: 15,
            speed: 2,
            goldDrop: { min: 30, max: 100 },
            loot: ['troll_hide', 'giant_club', 'troll_blood'],
            xpReward: 60,
            special: 'regeneration' // Heals each turn
        },
        dragon_wyrmling: {
            id: 'dragon_wyrmling',
            name: 'Dragon Wyrmling',
            icon: '🐉',
            health: 80,
            attack: 30,
            defense: 12,
            speed: 6,
            goldDrop: { min: 100, max: 300 },
            loot: ['dragon_scale', 'dragon_tooth', 'fire_essence'],
            xpReward: 100,
            special: 'firebreath' // AOE damage
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('⚔️ CombatSystem: Ready for battle!');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Listen for combat-related events
        if (typeof EventBus !== 'undefined') {
            EventBus.on('encounter-combat', (data) => this.startCombat(data));
            EventBus.on('robbery-resist', (data) => this.startRobberyDefense(data));
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // PLAYER STATS CALCULATION
    // ═══════════════════════════════════════════════════════════════
    getPlayerCombatStats() {
        const player = game?.player;
        if (!player) return { attack: 10, defense: 5, health: 100, speed: 5 };

        let attack = this.config.baseDamage;
        let defense = this.config.baseDefense;
        let speed = 5;

        // Add attribute bonuses
        if (player.attributes) {
            attack += (player.attributes.strength || 0) * 2;
            defense += (player.attributes.endurance || 0);
            speed += (player.attributes.agility || 0);
        }

        // Add equipment bonuses
        if (player.equipment && typeof EquipmentSystem !== 'undefined') {
            const bonuses = EquipmentSystem.getTotalBonuses?.() || {};
            attack += bonuses.attack || 0;
            defense += bonuses.defense || 0;
            speed += bonuses.speed || 0;
        }

        // Add skill bonuses
        if (player.skills?.combat) {
            attack += Math.floor(player.skills.combat / 10);
            defense += Math.floor(player.skills.combat / 20);
        }

        return {
            attack: Math.max(1, attack),
            defense: Math.max(0, defense),
            health: player.stats?.health || 100,
            maxHealth: player.stats?.maxHealth || 100,
            speed: Math.max(1, speed)
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // COMBAT INITIATION
    // ═══════════════════════════════════════════════════════════════
    startCombat(options) {
        const enemyId = options.enemyId || 'bandit';
        const enemy = this.enemies[enemyId];

        if (!enemy) {
            console.error(`⚔️ Unknown enemy: ${enemyId}`);
            return null;
        }

        // Scale enemy based on options
        const scaledEnemy = this.scaleEnemy(enemy, options.level || 1);

        this.activeCombat = {
            enemy: { ...scaledEnemy, currentHealth: scaledEnemy.health },
            player: this.getPlayerCombatStats(),
            round: 0,
            state: 'active',
            options: options
        };

        this.combatLog = [];
        this.addCombatLog(`⚔️ Combat begins! You face a ${scaledEnemy.name}!`);

        // Show combat UI
        this.showCombatUI();

        return this.activeCombat;
    },

    scaleEnemy(enemy, level) {
        const scaleFactor = 1 + (level - 1) * 0.15;
        return {
            ...enemy,
            health: Math.round(enemy.health * scaleFactor),
            attack: Math.round(enemy.attack * scaleFactor),
            defense: Math.round(enemy.defense * scaleFactor),
            goldDrop: {
                min: Math.round(enemy.goldDrop.min * scaleFactor),
                max: Math.round(enemy.goldDrop.max * scaleFactor)
            },
            xpReward: Math.round(enemy.xpReward * scaleFactor)
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // COMBAT ACTIONS
    // ═══════════════════════════════════════════════════════════════
    playerAttack() {
        if (!this.activeCombat || this.activeCombat.state !== 'active') return;

        const combat = this.activeCombat;
        combat.round++;

        // Player attacks
        const playerDamage = this.calculateDamage(
            combat.player.attack,
            combat.enemy.defense,
            combat.enemy.special === 'phasing'
        );

        combat.enemy.currentHealth -= playerDamage.damage;

        if (playerDamage.crit) {
            this.addCombatLog(`💥 CRITICAL HIT! You deal ${playerDamage.damage} damage!`);
        } else {
            this.addCombatLog(`⚔️ You attack for ${playerDamage.damage} damage.`);
        }

        // Check if enemy is dead
        if (combat.enemy.currentHealth <= 0) {
            this.victory();
            return;
        }

        // Enemy attacks back
        this.enemyTurn();
    },

    playerDefend() {
        if (!this.activeCombat || this.activeCombat.state !== 'active') return;

        const combat = this.activeCombat;
        combat.round++;

        // Defending doubles defense for this turn
        const originalDefense = combat.player.defense;
        combat.player.defense *= 2;

        this.addCombatLog(`🛡️ You raise your guard, doubling your defense!`);

        // Enemy attacks
        this.enemyTurn();

        // Reset defense
        combat.player.defense = originalDefense;
    },

    playerFlee() {
        if (!this.activeCombat || this.activeCombat.state !== 'active') return;

        const combat = this.activeCombat;

        // Calculate flee chance based on speed difference
        let fleeChance = this.config.fleeChance;
        const speedDiff = combat.player.speed - combat.enemy.speed;
        fleeChance += speedDiff * 0.05;
        fleeChance = Math.max(0.2, Math.min(0.9, fleeChance));

        if (Math.random() < fleeChance) {
            this.addCombatLog(`🏃 You successfully flee from combat!`);
            this.endCombat('fled');
        } else {
            this.addCombatLog(`❌ You failed to escape!`);
            // Enemy gets a free attack
            this.enemyTurn();
        }
    },

    useItem(itemId) {
        if (!this.activeCombat || this.activeCombat.state !== 'active') return;

        const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
        if (!item || !item.consumable) return;

        // Use the item
        if (game.player.inventory[itemId] > 0) {
            const effects = item.effects || {};

            if (effects.health) {
                const healed = Math.min(effects.health,
                    this.activeCombat.player.maxHealth - game.player.stats.health);
                game.player.stats.health += healed;
                this.activeCombat.player.health = game.player.stats.health;
                this.addCombatLog(`🧪 You use ${item.name} and heal ${healed} HP!`);
            }

            // Remove item from inventory
            game.player.inventory[itemId]--;
            if (game.player.inventory[itemId] <= 0) {
                delete game.player.inventory[itemId];
            }

            this.updateCombatUI();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ENEMY AI
    // ═══════════════════════════════════════════════════════════════
    enemyTurn() {
        const combat = this.activeCombat;
        if (!combat || combat.state !== 'active') return;

        // Apply special abilities
        if (combat.enemy.special === 'regeneration') {
            const heal = Math.round(combat.enemy.health * 0.05);
            combat.enemy.currentHealth = Math.min(
                combat.enemy.health,
                combat.enemy.currentHealth + heal
            );
            this.addCombatLog(`🩹 The ${combat.enemy.name} regenerates ${heal} HP!`);
        }

        // Enemy attacks
        const enemyDamage = this.calculateDamage(
            combat.enemy.attack,
            combat.player.defense,
            false
        );

        // Apply damage to player
        game.player.stats.health -= enemyDamage.damage;
        combat.player.health = game.player.stats.health;

        if (enemyDamage.crit) {
            this.addCombatLog(`💀 ${combat.enemy.name} lands a CRITICAL HIT for ${enemyDamage.damage} damage!`);
        } else {
            this.addCombatLog(`🔪 ${combat.enemy.name} attacks for ${enemyDamage.damage} damage.`);
        }

        // Check if player is dead
        if (game.player.stats.health <= 0) {
            game.player.stats.health = 0;
            this.defeat();
            return;
        }

        // Update UI
        this.updateCombatUI();

        // Check max rounds
        if (combat.round >= this.config.maxRounds) {
            this.addCombatLog(`⏰ The battle drags on... both combatants retreat.`);
            this.endCombat('draw');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // DAMAGE CALCULATION
    // ═══════════════════════════════════════════════════════════════
    calculateDamage(attack, defense, ignoreDefense = false) {
        // Base damage with some randomness
        let damage = attack * (0.8 + Math.random() * 0.4);

        // Apply defense (unless ignored)
        if (!ignoreDefense) {
            const reduction = defense / (defense + 20); // Diminishing returns
            damage *= (1 - reduction);
        }

        // Check for critical hit
        const crit = Math.random() < this.config.critChance;
        if (crit) {
            damage *= this.config.critMultiplier;
        }

        damage = Math.max(this.config.minDamage, Math.round(damage));

        return { damage, crit };
    },

    // ═══════════════════════════════════════════════════════════════
    // COMBAT RESOLUTION
    // ═══════════════════════════════════════════════════════════════
    victory() {
        const combat = this.activeCombat;
        combat.state = 'victory';

        this.addCombatLog(`🏆 Victory! You defeated the ${combat.enemy.name}!`);

        // Calculate rewards
        const goldReward = Math.floor(
            combat.enemy.goldDrop.min +
            Math.random() * (combat.enemy.goldDrop.max - combat.enemy.goldDrop.min)
        );

        if (goldReward > 0) {
            game.player.gold += goldReward;
            this.addCombatLog(`💰 You found ${goldReward} gold!`);
        }

        // XP reward
        if (combat.enemy.xpReward && game.player.experience !== undefined) {
            game.player.experience += combat.enemy.xpReward;
            this.addCombatLog(`✨ Gained ${combat.enemy.xpReward} XP!`);

            // Check level up
            if (typeof checkLevelUp === 'function') {
                checkLevelUp();
            }
        }

        // Combat skill increase
        if (game.player.skills) {
            game.player.skills.combat = (game.player.skills.combat || 0) + 1;
        }

        // Loot drops
        if (combat.enemy.loot && combat.enemy.loot.length > 0) {
            // 50% chance for each loot item
            combat.enemy.loot.forEach(itemId => {
                if (Math.random() < 0.5) {
                    if (!game.player.inventory[itemId]) {
                        game.player.inventory[itemId] = 0;
                    }
                    game.player.inventory[itemId]++;
                    const item = typeof ItemDatabase !== 'undefined' ?
                        ItemDatabase.getItem(itemId) : { name: itemId };
                    this.addCombatLog(`📦 Looted: ${item?.name || itemId}`);
                }
            });
        }

        // Fire event for quest tracking
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('enemy-defeated', {
                enemyType: combat.enemy.id,
                enemyName: combat.enemy.name,
                count: 1
            });
        }

        // Also fire DOM event for compatibility
        document.dispatchEvent(new CustomEvent('enemy-defeated', {
            detail: { enemyType: combat.enemy.id, count: 1 }
        }));

        // Achievement check
        if (typeof AchievementSystem !== 'undefined') {
            AchievementSystem.checkAchievement?.('first_blood');
            AchievementSystem.incrementStat?.('enemies_defeated', 1);
        }

        this.updateCombatUI();
        this.showVictoryUI();
    },

    defeat() {
        const combat = this.activeCombat;
        combat.state = 'defeat';

        this.addCombatLog(`💀 Defeat! The ${combat.enemy.name} has bested you!`);

        // Lose some gold
        const goldLost = Math.min(game.player.gold, Math.floor(game.player.gold * 0.1));
        if (goldLost > 0) {
            game.player.gold -= goldLost;
            this.addCombatLog(`💸 You lost ${goldLost} gold...`);
        }

        // Player doesn't die - they're left at 1 HP
        game.player.stats.health = 1;

        // Fire event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('combat-defeat', { enemy: combat.enemy.id });
        }

        this.updateCombatUI();
        this.showDefeatUI();
    },

    endCombat(result) {
        if (this.activeCombat) {
            this.activeCombat.state = result;
        }

        // Update player stats display
        if (typeof updatePlayerStats === 'function') {
            updatePlayerStats();
        }

        // Close combat UI after delay
        setTimeout(() => {
            this.closeCombatUI();
            this.activeCombat = null;

            // Resume game if it was paused
            if (typeof TimeSystem !== 'undefined' && TimeSystem.isPaused) {
                TimeSystem.resume();
            }
        }, 2000);
    },

    // ═══════════════════════════════════════════════════════════════
    // COMBAT UI
    // ═══════════════════════════════════════════════════════════════
    showCombatUI() {
        // Remove existing
        const existing = document.getElementById('combat-overlay');
        if (existing) existing.remove();

        const combat = this.activeCombat;

        const overlay = document.createElement('div');
        overlay.id = 'combat-overlay';
        overlay.innerHTML = `
            <div class="combat-container">
                <div class="combat-header">
                    <h2>⚔️ Combat!</h2>
                    <span class="combat-round">Round ${combat.round}</span>
                </div>

                <div class="combat-arena">
                    <div class="combatant player-side">
                        <div class="combatant-icon">🧑‍🦱</div>
                        <div class="combatant-name">${game.player?.name || 'You'}</div>
                        <div class="health-bar">
                            <div class="health-fill player-health" style="width: ${(combat.player.health / combat.player.maxHealth) * 100}%"></div>
                        </div>
                        <div class="health-text">${combat.player.health} / ${combat.player.maxHealth} HP</div>
                        <div class="combatant-stats">
                            <span>⚔️ ${combat.player.attack}</span>
                            <span>🛡️ ${combat.player.defense}</span>
                        </div>
                    </div>

                    <div class="combat-vs">VS</div>

                    <div class="combatant enemy-side">
                        <div class="combatant-icon">${combat.enemy.icon}</div>
                        <div class="combatant-name">${combat.enemy.name}</div>
                        <div class="health-bar">
                            <div class="health-fill enemy-health" style="width: ${(combat.enemy.currentHealth / combat.enemy.health) * 100}%"></div>
                        </div>
                        <div class="health-text">${combat.enemy.currentHealth} / ${combat.enemy.health} HP</div>
                        <div class="combatant-stats">
                            <span>⚔️ ${combat.enemy.attack}</span>
                            <span>🛡️ ${combat.enemy.defense}</span>
                        </div>
                    </div>
                </div>

                <div class="combat-log" id="combat-log-display">
                    ${this.combatLog.map(msg => `<div class="log-entry">${this.escapeHtml(msg)}</div>`).join('')}
                </div>

                <div class="combat-actions" id="combat-actions">
                    <button class="combat-btn attack-btn" onclick="CombatSystem.playerAttack()">⚔️ Attack</button>
                    <button class="combat-btn defend-btn" onclick="CombatSystem.playerDefend()">🛡️ Defend</button>
                    <button class="combat-btn flee-btn" onclick="CombatSystem.playerFlee()">🏃 Flee</button>
                    <button class="combat-btn item-btn" onclick="CombatSystem.showItemMenu()">🧪 Items</button>
                </div>
            </div>
        `;

        // Add styles
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 900; /* Z-INDEX STANDARD: Critical overlays (combat) */
        `;

        // Inject component styles
        this.injectCombatStyles();

        document.body.appendChild(overlay);

        // Pause game
        if (typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed('PAUSED');
        }
    },

    updateCombatUI() {
        const combat = this.activeCombat;
        if (!combat) return;

        // Update health bars
        const playerHealth = document.querySelector('.player-health');
        const enemyHealth = document.querySelector('.enemy-health');
        const playerText = document.querySelector('.player-side .health-text');
        const enemyText = document.querySelector('.enemy-side .health-text');
        const roundText = document.querySelector('.combat-round');

        if (playerHealth) {
            playerHealth.style.width = `${(combat.player.health / combat.player.maxHealth) * 100}%`;
        }
        if (enemyHealth) {
            enemyHealth.style.width = `${(combat.enemy.currentHealth / combat.enemy.health) * 100}%`;
        }
        if (playerText) {
            playerText.textContent = `${combat.player.health} / ${combat.player.maxHealth} HP`;
        }
        if (enemyText) {
            enemyText.textContent = `${combat.enemy.currentHealth} / ${combat.enemy.health} HP`;
        }
        if (roundText) {
            roundText.textContent = `Round ${combat.round}`;
        }

        // Update combat log - 🛡️ Sanitized against XSS 🦇
        const logDisplay = document.getElementById('combat-log-display');
        if (logDisplay) {
            logDisplay.innerHTML = this.combatLog.map(msg =>
                `<div class="log-entry">${this.escapeHtml(msg)}</div>`
            ).join('');
            logDisplay.scrollTop = logDisplay.scrollHeight;
        }
    },

    showVictoryUI() {
        const actions = document.getElementById('combat-actions');
        if (actions) {
            actions.innerHTML = `
                <div class="victory-message">🏆 VICTORY!</div>
                <button class="combat-btn" onclick="CombatSystem.endCombat('victory')">Continue</button>
            `;
        }
    },

    showDefeatUI() {
        const actions = document.getElementById('combat-actions');
        if (actions) {
            actions.innerHTML = `
                <div class="defeat-message">💀 DEFEAT</div>
                <button class="combat-btn" onclick="CombatSystem.endCombat('defeat')">Continue</button>
            `;
        }
    },

    showItemMenu() {
        // Show consumable items that can be used in combat
        const consumables = [];
        if (game.player?.inventory) {
            for (const [itemId, qty] of Object.entries(game.player.inventory)) {
                if (qty <= 0) continue;
                const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
                if (item?.consumable && item.effects?.health) {
                    consumables.push({ itemId, item, qty });
                }
            }
        }

        if (consumables.length === 0) {
            this.addCombatLog('❌ No usable items!');
            this.updateCombatUI();
            return;
        }

        const actions = document.getElementById('combat-actions');
        if (actions) {
            let html = '<div class="item-menu">';
            consumables.forEach(({ itemId, item, qty }) => {
                html += `<button class="combat-btn item-use-btn" onclick="CombatSystem.useItem('${itemId}')">${item.icon || '🧪'} ${item.name} (${qty})</button>`;
            });
            html += `<button class="combat-btn back-btn" onclick="CombatSystem.updateCombatUI(); CombatSystem.restoreActions()">Back</button>`;
            html += '</div>';
            actions.innerHTML = html;
        }
    },

    restoreActions() {
        const actions = document.getElementById('combat-actions');
        if (actions && this.activeCombat?.state === 'active') {
            actions.innerHTML = `
                <button class="combat-btn attack-btn" onclick="CombatSystem.playerAttack()">⚔️ Attack</button>
                <button class="combat-btn defend-btn" onclick="CombatSystem.playerDefend()">🛡️ Defend</button>
                <button class="combat-btn flee-btn" onclick="CombatSystem.playerFlee()">🏃 Flee</button>
                <button class="combat-btn item-btn" onclick="CombatSystem.showItemMenu()">🧪 Items</button>
            `;
        }
    },

    closeCombatUI() {
        const overlay = document.getElementById('combat-overlay');
        if (overlay) overlay.remove();
    },

    addCombatLog(message) {
        this.combatLog.push(message);
        // Keep last 10 messages
        if (this.combatLog.length > 10) {
            this.combatLog.shift();
        }
    },

    injectCombatStyles() {
        if (document.getElementById('combat-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'combat-system-styles';
        style.textContent = `
            .combat-container {
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid rgba(79, 195, 247, 0.5);
                border-radius: 12px;
                padding: 20px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 0 50px rgba(79, 195, 247, 0.3);
            }
            .combat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(79, 195, 247, 0.3);
            }
            .combat-header h2 {
                margin: 0;
                color: #ff6b6b;
            }
            .combat-round {
                color: #4fc3f7;
                font-size: 14px;
            }
            .combat-arena {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
            }
            .combatant {
                flex: 1;
                text-align: center;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }
            .combatant-icon {
                font-size: 48px;
                margin-bottom: 10px;
            }
            .combatant-name {
                color: #fff;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .health-bar {
                height: 12px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 5px;
            }
            .health-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
            .player-health {
                background: linear-gradient(90deg, #4caf50, #8bc34a);
            }
            .enemy-health {
                background: linear-gradient(90deg, #f44336, #ff5722);
            }
            .health-text {
                color: #888;
                font-size: 12px;
            }
            .combatant-stats {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 10px;
                color: #aaa;
                font-size: 13px;
            }
            .combat-vs {
                font-size: 24px;
                font-weight: bold;
                color: #ff6b6b;
            }
            .combat-log {
                background: rgba(0, 0, 0, 0.4);
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 20px;
                max-height: 120px;
                overflow-y: auto;
            }
            .log-entry {
                color: #ddd;
                font-size: 13px;
                padding: 3px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .log-entry:last-child {
                border-bottom: none;
            }
            .combat-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .combat-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.2s;
            }
            .attack-btn {
                background: linear-gradient(180deg, #f44336, #c62828);
                color: white;
            }
            .defend-btn {
                background: linear-gradient(180deg, #2196f3, #1565c0);
                color: white;
            }
            .flee-btn {
                background: linear-gradient(180deg, #ff9800, #e65100);
                color: white;
            }
            .item-btn {
                background: linear-gradient(180deg, #4caf50, #2e7d32);
                color: white;
            }
            .combat-btn:hover {
                transform: translateY(-2px);
                filter: brightness(1.1);
            }
            .victory-message {
                color: #4caf50;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            .defeat-message {
                color: #f44336;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            .item-menu {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
            }
            .item-use-btn {
                background: linear-gradient(180deg, #9c27b0, #6a1b9a);
                color: white;
            }
            .back-btn {
                background: linear-gradient(180deg, #607d8b, #455a64);
                color: white;
            }
        `;
        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════
    // QUICK COMBAT (Auto-resolve without UI)
    // ═══════════════════════════════════════════════════════════════
    quickCombat(enemyId, playerAdvantage = 0) {
        const enemy = this.enemies[enemyId];
        if (!enemy) return { result: 'error', message: 'Unknown enemy' };

        const player = this.getPlayerCombatStats();
        const playerPower = player.attack + player.defense + (playerAdvantage * 10);
        const enemyPower = enemy.attack + enemy.defense;

        // Calculate win chance
        const winChance = playerPower / (playerPower + enemyPower);
        const roll = Math.random();

        if (roll < winChance) {
            // Victory
            const goldReward = Math.floor(
                enemy.goldDrop.min + Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min)
            );
            const damage = Math.floor(enemy.attack * (0.2 + Math.random() * 0.3));

            game.player.gold += goldReward;
            game.player.stats.health = Math.max(1, game.player.stats.health - damage);

            // Fire event
            document.dispatchEvent(new CustomEvent('enemy-defeated', {
                detail: { enemyType: enemyId, count: 1 }
            }));

            return {
                result: 'victory',
                gold: goldReward,
                damage: damage,
                message: `You defeated the ${enemy.name}! Gained ${goldReward} gold, took ${damage} damage.`
            };
        } else {
            // Defeat
            const damage = Math.floor(enemy.attack * (0.3 + Math.random() * 0.4));
            const goldLost = Math.min(game.player.gold, Math.floor(game.player.gold * 0.1));

            game.player.stats.health = Math.max(1, game.player.stats.health - damage);
            game.player.gold -= goldLost;

            return {
                result: 'defeat',
                goldLost: goldLost,
                damage: damage,
                message: `The ${enemy.name} overpowered you! Lost ${goldLost} gold, took ${damage} damage.`
            };
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ROBBERY DEFENSE (Special combat for robbery events)
    // ═══════════════════════════════════════════════════════════════
    startRobberyDefense(options) {
        const numBandits = options.bandits || 1;

        // Scale difficulty based on number of bandits
        const scaledBandit = {
            ...this.enemies.bandit,
            name: numBandits > 1 ? `${numBandits} Bandits` : 'Bandit',
            health: this.enemies.bandit.health * numBandits,
            attack: this.enemies.bandit.attack + (numBandits - 1) * 3,
            goldDrop: {
                min: this.enemies.bandit.goldDrop.min * numBandits,
                max: this.enemies.bandit.goldDrop.max * numBandits
            }
        };

        return this.startCombat({
            enemyId: 'bandit',
            customEnemy: scaledBandit,
            context: 'robbery'
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL EXPOSURE
// ═══════════════════════════════════════════════════════════════
window.CombatSystem = CombatSystem;

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CombatSystem.init());
} else {
    CombatSystem.init();
}

console.log('⚔️ CombatSystem loaded');
