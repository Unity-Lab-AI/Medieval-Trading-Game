//
// COMBAT MODAL - Full combat UI with stat display and turn-based combat
//
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
//

const CombatModal = {
    isOpen: false,
    currentCombat: null,
    round: 1,
    combatLog: [],

    // Open combat modal with player vs NPC
    open(npcType, npcName, options = {}) {
        if (this.isOpen) return;

        const location = game?.currentLocation?.id || 'greendale';

        // Get stats from NPCCombatStats
        const npcStats = typeof NPCCombatStats !== 'undefined'
            ? NPCCombatStats.getStats(npcType, location)
            : this._getFallbackStats(npcType);

        const playerStats = typeof NPCCombatStats !== 'undefined'
            ? NPCCombatStats.getPlayerStats()
            : this._getFallbackPlayerStats();

        this.currentCombat = {
            npc: {
                type: npcType,
                name: npcName || this._formatName(npcType),
                stats: { ...npcStats },
                originalStats: { ...npcStats }
            },
            player: {
                stats: { ...playerStats },
                originalStats: { ...playerStats }
            },
            options: options,
            isQuestTarget: options.isQuestTarget || false,
            questId: options.questId || null
        };

        this.round = 1;
        this.combatLog = [];
        this._addLog(`Combat begins! You face ${this.currentCombat.npc.name}!`, 'system');

        this._render();
        this.isOpen = true;

        // Pause time during combat
        if (typeof TimeSystem !== 'undefined' && TimeSystem.pause) {
            TimeSystem.pause();
        }
    },

    // Close combat modal
    close() {
        const modal = document.getElementById('combat-modal-overlay');
        if (modal) modal.remove();
        this.isOpen = false;
        this.currentCombat = null;

        // Resume time
        if (typeof TimeSystem !== 'undefined' && TimeSystem.resume) {
            TimeSystem.resume();
        }
    },

    // Render the combat modal
    _render() {
        // Remove existing modal
        const existing = document.getElementById('combat-modal-overlay');
        if (existing) existing.remove();

        const { npc, player } = this.currentCombat;

        const overlay = document.createElement('div');
        overlay.id = 'combat-modal-overlay';
        overlay.innerHTML = `
            <style>
                #combat-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 750;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .combat-modal {
                    background: linear-gradient(180deg, rgba(40, 40, 70, 0.98) 0%, rgba(25, 25, 45, 0.98) 100%);
                    border: 2px solid #ffd700;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 700px;
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.3), 0 10px 40px rgba(0, 0, 0, 0.5);
                }

                .combat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255, 215, 0, 0.3);
                    background: linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, transparent 100%);
                }
                .combat-header h2 { color: #ffd700; margin: 0; font-size: 1.3em; }
                .combat-round { color: #4fc3f7; font-size: 0.9em; }

                .combat-stats-container {
                    display: flex;
                    gap: 15px;
                    padding: 20px;
                    align-items: stretch;
                }

                .combat-side {
                    flex: 1;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    padding: 15px;
                    border: 1px solid rgba(255, 215, 0, 0.2);
                }
                .combat-side.player-side { border-color: rgba(76, 175, 80, 0.4); }
                .combat-side.enemy-side { border-color: rgba(244, 67, 54, 0.4); }

                .side-name {
                    color: #ffd700;
                    font-weight: bold;
                    margin-bottom: 12px;
                    font-size: 1.1em;
                    text-align: center;
                }

                .stat-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 8px 0;
                    color: #e0e0e0;
                    font-size: 0.9em;
                }
                .stat-label { flex: 1; min-width: 80px; }
                .stat-value { min-width: 50px; text-align: right; color: #ffd700; font-weight: bold; }

                .health-bar-container {
                    flex: 2;
                    height: 18px;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 4px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 215, 0, 0.2);
                }
                .health-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
                    transition: width 0.3s ease;
                }
                .health-bar.low { background: linear-gradient(90deg, #ff9800 0%, #ffc107 100%); }
                .health-bar.critical { background: linear-gradient(90deg, #f44336 0%, #ff5252 100%); }

                .combat-vs {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #ff6b6b;
                    font-size: 1.5em;
                    padding: 0 5px;
                }

                .combat-log-container {
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 8px;
                    margin: 0 20px 15px;
                    border: 1px solid rgba(255, 215, 0, 0.2);
                    overflow: hidden;
                }
                .combat-log-header {
                    background: rgba(255, 215, 0, 0.1);
                    padding: 8px 12px;
                    color: #ffd700;
                    font-weight: bold;
                    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
                }
                .combat-log {
                    max-height: 120px;
                    overflow-y: auto;
                    padding: 10px;
                    color: #c0c0e0;
                    font-size: 0.85em;
                    line-height: 1.5;
                }
                .log-entry { margin: 3px 0; padding: 2px 0; }
                .log-entry.player { color: #4fc3f7; }
                .log-entry.enemy { color: #ff6b6b; }
                .log-entry.system { color: #ffd700; font-style: italic; }
                .log-entry.critical { color: #ffeb3b; font-weight: bold; }

                .combat-footer {
                    display: flex;
                    gap: 10px;
                    padding: 15px 20px;
                    border-top: 1px solid rgba(255, 215, 0, 0.3);
                    background: rgba(0, 0, 0, 0.2);
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .combat-btn {
                    padding: 12px 24px;
                    border: 1px solid rgba(255, 215, 0, 0.4);
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
                    color: #ffd700;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 1em;
                    transition: all 0.2s;
                    min-width: 110px;
                }
                .combat-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0.2) 100%);
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                    transform: translateY(-2px);
                }
                .combat-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .combat-btn.attack { border-color: rgba(244, 67, 54, 0.6); }
                .combat-btn.defend { border-color: rgba(33, 150, 243, 0.6); }
                .combat-btn.flee { border-color: rgba(156, 39, 176, 0.6); }

                .combat-outcome {
                    text-align: center;
                    padding: 25px;
                }
                .outcome-header {
                    font-size: 2em;
                    font-weight: bold;
                    margin-bottom: 15px;
                    text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                }
                .outcome-header.victory { color: #4caf50; }
                .outcome-header.defeat { color: #f44336; }
                .outcome-header.fled { color: #9c27b0; }
                .outcome-stats { color: #e0e0e0; margin-bottom: 15px; }
                .loot-container {
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: 15px;
                }
                .loot-header { color: #ffd700; font-weight: bold; margin-bottom: 10px; }
                .loot-item {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 8px 12px;
                    border-radius: 4px;
                    color: #c0c0e0;
                    margin: 5px 0;
                }
            </style>

            <div class="combat-modal">
                <div class="combat-header">
                    <h2>⚔️ Combat</h2>
                    <span class="combat-round">Round ${this.round}</span>
                </div>

                <div class="combat-stats-container">
                    <div class="combat-side player-side">
                        <div class="side-name">You</div>
                        ${this._renderStats(player.stats, player.originalStats, 'player')}
                    </div>

                    <div class="combat-vs">VS</div>

                    <div class="combat-side enemy-side">
                        <div class="side-name">${this._escapeHtml(npc.name)}</div>
                        ${this._renderStats(npc.stats, npc.originalStats, 'enemy')}
                    </div>
                </div>

                <div class="combat-log-container">
                    <div class="combat-log-header">Combat Log</div>
                    <div class="combat-log" id="combat-log">
                        ${this.combatLog.map(l => `<div class="log-entry ${l.type}">${l.text}</div>`).join('')}
                    </div>
                </div>

                <div class="combat-footer" id="combat-actions">
                    <button class="combat-btn attack" onclick="CombatModal.doAction('attack')">🗡️ Attack</button>
                    <button class="combat-btn defend" onclick="CombatModal.doAction('defend')">🛡️ Defend</button>
                    <button class="combat-btn flee" onclick="CombatModal.doAction('flee')">🏃 Flee</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Scroll log to bottom
        const log = document.getElementById('combat-log');
        if (log) log.scrollTop = log.scrollHeight;
    },

    // Render stat rows
    _renderStats(stats, originalStats, side) {
        const healthPercent = Math.round((stats.health / originalStats.maxHealth) * 100);
        const healthClass = healthPercent <= 25 ? 'critical' : (healthPercent <= 50 ? 'low' : '');

        return `
            <div class="stat-row">
                <span class="stat-label">❤️ Health</span>
                <div class="health-bar-container">
                    <div class="health-bar ${healthClass}" style="width: ${healthPercent}%"></div>
                </div>
                <span class="stat-value">${stats.health}/${originalStats.maxHealth}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🗡️ Attack</span>
                <span class="stat-value">${stats.attack}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🛡️ Defense</span>
                <span class="stat-value">${stats.defense}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">⚡ Speed</span>
                <span class="stat-value">${stats.speed}</span>
            </div>
        `;
    },

    // Execute combat action
    doAction(action) {
        if (!this.currentCombat) return;

        const { npc, player } = this.currentCombat;

        switch (action) {
            case 'attack':
                this._playerAttack();
                break;
            case 'defend':
                this._playerDefend();
                break;
            case 'flee':
                this._playerFlee();
                return; // Flee ends immediately
        }

        // Check if NPC is defeated
        if (npc.stats.health <= 0) {
            this._victory();
            return;
        }

        // NPC turn
        this._npcTurn();

        // Check if player is defeated
        if (player.stats.health <= 0) {
            this._defeat();
            return;
        }

        this.round++;
        this._render();
    },

    // Player attacks
    _playerAttack() {
        const { npc, player } = this.currentCombat;

        // Calculate damage
        const baseDamage = player.stats.attack;
        const defense = npc.stats.defense;
        const variance = 0.8 + Math.random() * 0.4; // 80-120% damage
        const damage = Math.max(1, Math.round((baseDamage - defense * 0.5) * variance));

        // Critical hit chance (10%)
        const isCrit = Math.random() < 0.1;
        const finalDamage = isCrit ? damage * 2 : damage;

        npc.stats.health = Math.max(0, npc.stats.health - finalDamage);

        if (isCrit) {
            this._addLog(`CRITICAL HIT! You strike for ${finalDamage} damage!`, 'critical');
        } else {
            this._addLog(`You attack for ${finalDamage} damage.`, 'player');
        }
    },

    // Player defends
    _playerDefend() {
        const { player } = this.currentCombat;
        player.isDefending = true;
        this._addLog(`You raise your guard, doubling defense this turn.`, 'player');
    },

    // Player flees
    _playerFlee() {
        const { npc, player } = this.currentCombat;

        // Flee chance based on speed difference
        const fleeChance = 0.5 + (player.stats.speed - npc.stats.speed) * 0.05;
        const success = Math.random() < Math.max(0.2, Math.min(0.9, fleeChance));

        if (success) {
            this._addLog(`You successfully escape!`, 'system');
            this._showOutcome('fled', 'You fled from battle!');
        } else {
            this._addLog(`You try to flee but ${npc.name} blocks your escape!`, 'enemy');
            // NPC gets a free attack
            this._npcTurn();
            if (this.currentCombat.player.stats.health <= 0) {
                this._defeat();
            } else {
                this.round++;
                this._render();
            }
        }
    },

    // NPC turn
    _npcTurn() {
        const { npc, player } = this.currentCombat;

        // Calculate NPC damage
        const baseDamage = npc.stats.attack;
        let defense = player.stats.defense;

        // Double defense if player defended
        if (player.isDefending) {
            defense *= 2;
            player.isDefending = false;
        }

        const variance = 0.8 + Math.random() * 0.4;
        const damage = Math.max(1, Math.round((baseDamage - defense * 0.5) * variance));

        player.stats.health = Math.max(0, player.stats.health - damage);

        this._addLog(`${npc.name} attacks for ${damage} damage!`, 'enemy');

        // Update actual player health in game
        if (game?.player?.stats) {
            game.player.stats.health = player.stats.health;
        }
    },

    // Victory!
    _victory() {
        const { npc } = this.currentCombat;

        // Calculate rewards
        const goldDrop = npc.stats.goldDrop
            ? NPCCombatStats.rollGoldDrop(npc.stats.goldDrop)
            : Math.floor(Math.random() * 30) + 10;

        const xpReward = npc.stats.xpReward || 10;

        // Apply rewards
        if (game?.player) {
            game.player.gold = (game.player.gold || 0) + goldDrop;
        }

        // Mark NPC as killed - they won't appear for 24 game hours
        const locationId = game?.currentLocation?.id;
        if (typeof GameWorld !== 'undefined' && GameWorld.markNPCKilled) {
            GameWorld.markNPCKilled(npc.type, locationId);
        }

        // Apply reputation loss for killing NPCs (unless it's a quest target)
        // Read rep loss values from GameConfig.npc.death.reputationLoss
        if (!this.currentCombat.isQuestTarget && typeof CityReputationSystem !== 'undefined') {
            const repConfig = (typeof GameConfig !== 'undefined' && GameConfig.npc?.death?.reputationLoss) || {};
            let repLoss;
            if (npc.stats.tier === 'boss') {
                repLoss = repConfig.boss || 50;
            } else if (npc.stats.tier === 'outlaw') {
                repLoss = repConfig.outlaw || 5;
            } else {
                repLoss = repConfig.civilian || 20;
            }

            if (locationId && CityReputationSystem.changeReputation) {
                CityReputationSystem.changeReputation(locationId, -repLoss);
                if (typeof addMessage === 'function') {
                    addMessage(`📉 Lost ${repLoss} reputation for violence!`, 'warning');
                }
            }
        }

        // Fire enemy-defeated event for quest tracking
        document.dispatchEvent(new CustomEvent('enemy-defeated', {
            detail: {
                enemyType: npc.type,
                enemyName: npc.name,
                count: 1,
                isNPC: true,
                questId: this.currentCombat.questId
            }
        }));

        // Record quest kill if this is a quest target
        if (this.currentCombat.isQuestTarget && typeof QuestSystem !== 'undefined' && QuestSystem.recordQuestKill) {
            QuestSystem.recordQuestKill(npc.type, game?.currentLocation?.id);
        }

        // Call onVictory callback if provided
        if (this.currentCombat.options?.onVictory && typeof this.currentCombat.options.onVictory === 'function') {
            try {
                this.currentCombat.options.onVictory({
                    enemyType: npc.type,
                    enemyName: npc.name,
                    gold: goldDrop,
                    xp: xpReward
                });
            } catch (e) {
                console.error('Error in onVictory callback:', e);
            }
        }

        this._addLog(`Victory! ${npc.name} is defeated!`, 'system');

        // Show outcome
        this._showOutcome('victory', `You defeated ${npc.name}!`, {
            gold: goldDrop,
            xp: xpReward,
            rounds: this.round
        });

        // Update displays
        if (typeof updateDisplay === 'function') updateDisplay();
        if (typeof addMessage === 'function') {
            addMessage(`⚔️ Victory! Defeated ${npc.name} and looted ${goldDrop} gold!`);
        }
    },

    // Defeat...
    _defeat() {
        const { npc } = this.currentCombat;

        this._addLog(`You have been defeated by ${npc.name}...`, 'system');

        this._showOutcome('defeat', `${npc.name} has defeated you!`, {
            rounds: this.round
        });

        // Check for game over
        if (game?.player?.stats?.health <= 0) {
            if (typeof GameOverSystem !== 'undefined' && GameOverSystem.checkGameOver) {
                setTimeout(() => GameOverSystem.checkGameOver(), 1500);
            }
        }

        if (typeof addMessage === 'function') {
            addMessage(`💀 Defeated by ${npc.name}!`);
        }
    },

    // Show outcome screen
    _showOutcome(type, message, rewards = {}) {
        const modal = document.querySelector('.combat-modal');
        if (!modal) return;

        const actionsDiv = document.getElementById('combat-actions');
        if (actionsDiv) {
            let rewardsHtml = '';
            if (type === 'victory' && rewards.gold) {
                rewardsHtml = `
                    <div class="loot-container">
                        <div class="loot-header">Rewards:</div>
                        <div class="loot-item">💰 ${rewards.gold} Gold</div>
                        <div class="loot-item">⭐ ${rewards.xp || 0} XP</div>
                        <div class="loot-item">⚔️ ${rewards.rounds} rounds</div>
                    </div>
                `;
            }

            actionsDiv.innerHTML = `
                <div class="combat-outcome">
                    <div class="outcome-header ${type}">${type === 'victory' ? '🎉 VICTORY!' : (type === 'defeat' ? '💀 DEFEAT' : '🏃 ESCAPED')}</div>
                    <div class="outcome-stats">${message}</div>
                    ${rewardsHtml}
                    <button class="combat-btn" onclick="CombatModal.close()" style="margin-top: 15px;">Close</button>
                </div>
            `;
        }
    },

    // Add to combat log
    _addLog(text, type = 'system') {
        this.combatLog.push({ text, type });
        // Keep last 20 entries
        if (this.combatLog.length > 20) {
            this.combatLog.shift();
        }
    },

    // Fallback stats if NPCCombatStats not loaded
    _getFallbackStats(npcType) {
        return { health: 30, maxHealth: 30, attack: 10, defense: 5, speed: 5, goldDrop: { min: 5, max: 20 }, xpReward: 10 };
    },

    _getFallbackPlayerStats() {
        return { health: game?.player?.stats?.health || 100, maxHealth: 100, attack: 15, defense: 8, speed: 5 };
    },

    // Utility
    _formatName(type) {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },

    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.CombatModal = CombatModal;
}

console.log('⚔️ CombatModal loaded - Combat UI ready');
