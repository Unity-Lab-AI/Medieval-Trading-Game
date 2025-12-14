// ═══════════════════════════════════════════════════════════════
// LEADERBOARD-FEATURES - tracking your descent into capitalism
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// score previews, active high scores, and retirement system

const LeaderboardFeatures = {
    // Storage key for active high scores
    ACTIVE_SCORES_KEY: 'trader-claude-active-high-scores',

    /**
     * Escape HTML to prevent XSS injection
     * @private
     * @param {string} str - String to escape
     * @returns {string} Escaped string safe for innerHTML
     */
    _escapeHTML(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // run the score math - identical to game over calculation
    calculateCurrentScore() {
        if (!game || !game.player) return null;

        const player = game.player;
        const daysSurvived = typeof TimeMachine !== 'undefined' ? TimeMachine.currentDay : 1;

        // add up all the crap in your pockets
        let inventoryValue = 0;
        if (player.inventory && Array.isArray(player.inventory)) {
            inventoryValue = player.inventory.reduce((sum, item) => {
                return sum + ((item.basePrice || item.price || 0) * (item.quantity || 1));
            }, 0);
        }

        // count up your real estate empire
        let propertyValue = 0;
        let propertyCount = 0;
        if (typeof PropertySystem !== 'undefined' && PropertySystem.ownedProperties) {
            propertyCount = PropertySystem.ownedProperties.length;
            propertyValue = PropertySystem.ownedProperties.reduce((sum, prop) => {
                return sum + (prop.purchasePrice || prop.value || 0);
            }, 0);
        }

        // total wealth - gold + inventory + properties
        const netWorth = (player.gold || 0) + inventoryValue + propertyValue;

        // score formula - survival time + money + bragging rights
        const survivalBonus = daysSurvived * 10;
        const wealthBonus = Math.floor(netWorth / 100);
        const tradeBonus = (player.tradesCompleted || 0) * 5;
        const achievementBonus = (player.achievementsUnlocked || 0) * 50;

        const score = survivalBonus + wealthBonus + tradeBonus + achievementBonus;

        return {
            playerName: player.name || 'Unknown Merchant',
            score: score,
            gold: player.gold || 0,
            daysSurvived: daysSurvived,
            inventoryValue: inventoryValue,
            propertyValue: propertyValue,
            propertyCount: propertyCount,
            netWorth: netWorth,
            tradesCompleted: player.tradesCompleted || 0,
            achievementsUnlocked: player.achievementsUnlocked || 0,
            difficulty: game.difficulty || 'normal',
            // how we got to this number
            survivalBonus: survivalBonus,
            wealthBonus: wealthBonus,
            tradeBonus: tradeBonus,
            achievementBonus: achievementBonus
        };
    },

    // display what your score would be right now
    showScorePreview() {
        const scoreData = this.calculateCurrentScore();
        if (!scoreData) {
            if (typeof addMessage === 'function') addMessage('Unable to calculate score - no active game!');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'score-preview-modal';
        modal.className = 'leaderboard-modal-overlay';
        modal.innerHTML = `
            <div class="leaderboard-modal">
                <div class="leaderboard-modal-header">
                    <h2>👁️ Score Preview</h2>
                    <button class="modal-close-btn" onclick="this.closest('.leaderboard-modal-overlay').remove()">✕</button>
                </div>
                <div class="leaderboard-modal-body">
                    <div class="score-preview-main">
                        <div class="score-big">${scoreData.score.toLocaleString()}</div>
                        <div class="score-label">Current Score</div>
                    </div>

                    <div class="score-breakdown">
                        <h3>📊 Score Breakdown</h3>
                        <div class="breakdown-row">
                            <span>📅 Survival Bonus (${scoreData.daysSurvived} days × 10)</span>
                            <span class="breakdown-value">+${scoreData.survivalBonus}</span>
                        </div>
                        <div class="breakdown-row">
                            <span>💰 Wealth Bonus (${scoreData.netWorth.toLocaleString()} ÷ 100)</span>
                            <span class="breakdown-value">+${scoreData.wealthBonus}</span>
                        </div>
                        <div class="breakdown-row">
                            <span>💱 Trade Bonus (${scoreData.tradesCompleted} × 5)</span>
                            <span class="breakdown-value">+${scoreData.tradeBonus}</span>
                        </div>
                        <div class="breakdown-row">
                            <span>🏆 Achievement Bonus (${scoreData.achievementsUnlocked} × 50)</span>
                            <span class="breakdown-value">+${scoreData.achievementBonus}</span>
                        </div>
                    </div>

                    <div class="score-stats">
                        <h3>📈 Current Stats</h3>
                        <div class="stats-grid">
                            <div class="stat-item"><span>💰 Gold</span><span>${scoreData.gold.toLocaleString()}</span></div>
                            <div class="stat-item"><span>📦 Inventory</span><span>${scoreData.inventoryValue.toLocaleString()}</span></div>
                            <div class="stat-item"><span>🏠 Properties</span><span>${scoreData.propertyCount} (${scoreData.propertyValue.toLocaleString()})</span></div>
                            <div class="stat-item"><span>💎 Net Worth</span><span>${scoreData.netWorth.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <p class="preview-note">This is a preview only. Retire your character to submit this score to the Hall of Champions!</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    // show the leaderboard of still-living characters
    showActiveHighScores() {
        const activeScores = this.getActiveHighScores();
        const currentScore = this.calculateCurrentScore();

        const modal = document.createElement('div');
        modal.id = 'active-scores-modal';
        modal.className = 'leaderboard-modal-overlay';

        let scoresHTML = '';
        if (activeScores.length === 0) {
            scoresHTML = '<div class="no-scores">No active high scores yet. Save your game to record your progress!</div>';
        } else {
            scoresHTML = activeScores.map((entry, index) => {
                const rank = index + 1;
                const rankIcon = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                const isCurrentGame = currentScore && entry.playerName === currentScore.playerName &&
                                     Math.abs(entry.score - currentScore.score) < 100;
                return `
                    <div class="active-score-entry ${rank <= 3 ? 'top-three' : ''} ${isCurrentGame ? 'current-game' : ''}">
                        <div class="score-rank">${rankIcon}</div>
                        <div class="score-info">
                            <div class="score-name">${this._escapeHTML(entry.playerName)} ${isCurrentGame ? '(Current)' : ''}</div>
                            <div class="score-details">
                                <span>📅 Day ${entry.daysSurvived}</span>
                                <span>💰 ${entry.gold.toLocaleString()}</span>
                                <span>💎 ${entry.netWorth.toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="score-value">${entry.score.toLocaleString()}</div>
                    </div>
                `;
            }).join('');
        }

        modal.innerHTML = `
            <div class="leaderboard-modal">
                <div class="leaderboard-modal-header">
                    <h2>📊 Active High Scores</h2>
                    <button class="modal-close-btn" onclick="this.closest('.leaderboard-modal-overlay').remove()">✕</button>
                </div>
                <div class="leaderboard-modal-body">
                    <p class="active-scores-desc">High scores from your saved games (not retired/dead characters)</p>
                    <div class="active-scores-list">
                        ${scoresHTML}
                    </div>
                    <div class="active-scores-actions">
                        <button class="action-btn" onclick="LeaderboardFeatures.updateActiveScore()">💾 Update My Score</button>
                        <button class="action-btn danger" onclick="LeaderboardFeatures.clearActiveScores()">🗑️ Clear All</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    // pull the high scores from localStorage
    getActiveHighScores() {
        try {
            const saved = localStorage.getItem(this.ACTIVE_SCORES_KEY);
            if (saved) {
                const scores = JSON.parse(saved);
                return scores.sort((a, b) => b.score - a.score).slice(0, 20);
            }
        } catch (e) {
            console.warn('Failed to load active high scores:', e);
        }
        return [];
    },

    // save or update your current score to the list
    updateActiveScore() {
        const scoreData = this.calculateCurrentScore();
        if (!scoreData) {
            if (typeof addMessage === 'function') addMessage('No active game to save!');
            return;
        }

        const scores = this.getActiveHighScores();

        // see if you're already on the board
        const existingIndex = scores.findIndex(s => s.playerName === scoreData.playerName);

        const entry = {
            ...scoreData,
            timestamp: Date.now(),
            dateString: new Date().toLocaleDateString()
        };

        if (existingIndex >= 0) {
            // replace your old score if this one's better
            if (scoreData.score > scores[existingIndex].score) {
                scores[existingIndex] = entry;
                if (typeof addMessage === 'function') addMessage(`📊 High score updated: ${scoreData.score.toLocaleString()} points!`);
            } else {
                if (typeof addMessage === 'function') addMessage(`Your current score (${scoreData.score.toLocaleString()}) is lower than your best (${scores[existingIndex].score.toLocaleString()})`);
            }
        } else {
            // first time on the board
            scores.push(entry);
            if (typeof addMessage === 'function') addMessage(`📊 Score saved: ${scoreData.score.toLocaleString()} points!`);
        }

        // rank them and cut off the losers
        scores.sort((a, b) => b.score - a.score);
        const trimmed = scores.slice(0, 20);

        // Save
        try {
            localStorage.setItem(this.ACTIVE_SCORES_KEY, JSON.stringify(trimmed));
        } catch (e) {
            console.warn('Failed to save active high scores:', e);
        }

        // Refresh the modal if open
        const modal = document.getElementById('active-scores-modal');
        if (modal) {
            modal.remove();
            this.showActiveHighScores();
        }
    },

    // nuke the entire leaderboard - uses modal, not browser confirm()
    clearActiveScores() {
        const doClear = () => {
            localStorage.removeItem(this.ACTIVE_SCORES_KEY);
            if (typeof addMessage === 'function') addMessage('🗑️ Active high scores cleared');

            // reload modal if still visible
            const modal = document.getElementById('active-scores-modal');
            if (modal) {
                modal.remove();
                this.showActiveHighScores();
            }
        };

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🗑️ Clear High Scores',
                content: '<p>Are you sure you want to clear all active high scores?</p><p style="color: #f44336; font-size: 12px;">This cannot be undone.</p>',
                buttons: [
                    { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                    { text: '🗑️ Clear', className: 'danger', onClick: () => { ModalSystem.hide(); doClear(); } }
                ]
            });
        } else {
            doClear();
        }
    },

    // ask if you really wanna retire this character
    confirmRetire() {
        const scoreData = this.calculateCurrentScore();
        if (!scoreData) {
            if (typeof addMessage === 'function') addMessage('No active game to retire!');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'retire-confirm-modal';
        modal.className = 'leaderboard-modal-overlay';
        modal.innerHTML = `
            <div class="leaderboard-modal retire-modal">
                <div class="leaderboard-modal-header">
                    <h2>🏖️ Retire Character?</h2>
                    <button class="modal-close-btn" onclick="this.closest('.leaderboard-modal-overlay').remove()">✕</button>
                </div>
                <div class="leaderboard-modal-body">
                    <div class="retire-warning">
                        <p>⚠️ <strong>This will end your current run!</strong></p>
                        <p>Your character <strong>${this._escapeHTML(scoreData.playerName)}</strong> will retire as a wealthy merchant and your score will be submitted to the Hall of Champions.</p>
                    </div>

                    <div class="retire-stats">
                        <div class="retire-score">
                            <span class="score-label">Final Score</span>
                            <span class="score-value">${scoreData.score.toLocaleString()}</span>
                        </div>
                        <div class="retire-details">
                            <span>📅 ${scoreData.daysSurvived} days survived</span>
                            <span>💎 ${scoreData.netWorth.toLocaleString()} net worth</span>
                        </div>
                    </div>

                    <div class="retire-actions">
                        <button class="retire-btn-confirm" onclick="LeaderboardFeatures.executeRetire()">
                            🏖️ Yes, Retire & Submit Score
                        </button>
                        <button class="retire-btn-cancel" onclick="this.closest('.leaderboard-modal-overlay').remove()">
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    // retire the character - game over but victorious
    executeRetire() {
        // kill the confirmation modal
        const modal = document.getElementById('retire-confirm-modal');
        if (modal) modal.remove();

        // close the character sheet too if it's up
        const charSheet = document.getElementById('character-sheet-overlay');
        if (charSheet) charSheet.remove();

        // end the game in retirement mode
        if (typeof GameOverSystem !== 'undefined') {
            GameOverSystem.handleGameOver('retired wealthy');
            if (typeof addMessage === 'function') addMessage('🏖️ You have retired from trading. Your legacy is secured!');
        } else {
            if (typeof addMessage === 'function') addMessage('Error: Could not process retirement. GameOverSystem not found.');
        }
    }
};

// Expose globally
window.LeaderboardFeatures = LeaderboardFeatures;

console.log('🏆 LeaderboardFeatures loaded - type LeaderboardFeatures.showScorePreview() to check your score');
