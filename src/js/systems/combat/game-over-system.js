// ═══════════════════════════════════════════════════════════════
// GAME OVER SYSTEM - every story ends in the void
// ═══════════════════════════════════════════════════════════════
// Version: 0.88 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

console.log('💀 Game Over System loading... preparing for inevitable failures...');

const GameOverSystem = {
    // 💰 Bankruptcy threshold - below this and you're jailed
    BANKRUPTCY_THRESHOLD: -1000,

    // 📊 Track if game over is already being processed
    isProcessingGameOver: false,

    // 🎮 Last known game stats for display
    finalStats: null,

    // 🏆 Player's ranking result
    rankingResult: null,

    // 💀 boot up the reaper - we're all gonna need this eventually
    init() {
        console.log('💀 Game Over System ready to collect souls and document your failures 🖤');
        this.isProcessingGameOver = false;
        this.finalStats = null;
        this.rankingResult = null;
    },

    // 💸 Check for bankruptcy - called after any gold transaction
    checkBankruptcy() {
        if (this.isProcessingGameOver) return false;

        const gold = game?.player?.gold ?? 0;

        if (gold <= this.BANKRUPTCY_THRESHOLD) {
            this.triggerBankruptcy();
            return true;
        }
        return false;
    },

    // 🚔 Trigger bankruptcy game over
    triggerBankruptcy() {
        if (this.isProcessingGameOver) return;

        const gold = game?.player?.gold ?? 0;

        // Track bankruptcy in DeathCauseSystem
        if (typeof DeathCauseSystem !== 'undefined') {
            DeathCauseSystem.recordBankruptcy(gold);
        }

        const causeOfDeath = `jailed for bankruptcy (${Math.abs(gold).toLocaleString()} gold debt)`;

        addMessage('💀 the debt collectors have come...');
        addMessage('🚔 you are being arrested for failure to pay your debts!');
        addMessage('⛓️ sentenced to debtors prison... your trading days are over.');

        this.handleGameOver(causeOfDeath);
    },

    // 💀 Main game over handler
    async handleGameOver(causeOfDeath = 'unknown causes') {
        if (this.isProcessingGameOver) return;
        this.isProcessingGameOver = true;

        console.log('💀 Game Over triggered:', causeOfDeath);

        // Pause the game
        if (typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed('PAUSED');
        }

        // Calculate final stats
        this.finalStats = this.calculateFinalStats(causeOfDeath);

        // Submit to leaderboards
        await this.submitToLeaderboards();

        // Show the game over screen
        this.showGameOverScreen();
    },

    // 📊 Calculate comprehensive final stats
    calculateFinalStats(causeOfDeath) {
        const player = game?.player;
        if (!player) return this.getDefaultStats(causeOfDeath);

        // Calculate days survived - get starting date from config (single source of truth)
        const startDate = typeof GameConfig !== 'undefined' ? GameConfig.time.startingDate : { year: 1111, month: 4, day: 1 };
        const time = typeof TimeSystem !== 'undefined' ? TimeSystem.currentTime : { day: startDate.day, month: startDate.month, year: startDate.year };
        const startDays = startDate.day + (startDate.month - 1) * 30 + (startDate.year - 1) * 360;
        const currentDays = time.day + (time.month - 1) * 30 + (time.year - 1) * 360;
        const daysSurvived = Math.max(0, currentDays - startDays);

        // Calculate inventory value
        let inventoryValue = 0;
        if (player.inventory && typeof ItemDatabase !== 'undefined') {
            for (const [itemId, quantity] of Object.entries(player.inventory)) {
                if (quantity > 0) {
                    const price = ItemDatabase.calculatePrice?.(itemId) || 0;
                    inventoryValue += price * quantity;
                }
            }
        }

        // Get property stats
        const properties = typeof PropertySystem !== 'undefined' ?
            PropertySystem.getOwnedProperties?.() || [] : [];
        const propertyCount = properties.length;
        let propertyValue = 0;
        properties.forEach(p => {
            const type = PropertySystem.propertyTypes?.[p.type];
            if (type) {
                propertyValue += type.basePrice || 0;
            }
        });

        // Get achievement count
        const achievements = typeof AchievementSystem !== 'undefined' ?
            AchievementSystem.unlockedAchievements?.size || 0 : 0;

        // Get trade history
        const tradesCompleted = typeof TradingSystem !== 'undefined' ?
            TradingSystem.tradeHistory?.length || 0 : 0;

        // Get employee count
        const employees = typeof EmployeeSystem !== 'undefined' ?
            EmployeeSystem.getEmployees?.()?.length || 0 : 0;

        // Calculate total net worth
        const netWorth = (player.gold || 0) + inventoryValue + propertyValue;

        // Calculate final score
        let score = Math.max(0, player.gold || 0);
        score += daysSurvived * 10;
        score += propertyCount * 500;
        score += achievements * 100;
        score += Math.floor(inventoryValue * 0.5);
        score += tradesCompleted * 5;

        // Apply difficulty multiplier
        const difficultyMultipliers = {
            easy: 0.5,
            normal: 1.0,
            hard: 1.5,
            nightmare: 2.0
        };
        const difficulty = player.difficulty || 'normal';
        score = Math.floor(score * (difficultyMultipliers[difficulty] || 1));

        return {
            playerName: player.name || 'Anonymous Merchant',
            causeOfDeath,
            gold: player.gold || 0,
            daysSurvived,
            survivalTime: this.formatSurvivalTime(daysSurvived),
            inventoryValue,
            propertyCount,
            propertyValue,
            netWorth,
            achievements,
            tradesCompleted,
            employees,
            difficulty,
            score,
            timestamp: Date.now()
        };
    },

    // 📅 Format survival time nicely
    formatSurvivalTime(days) {
        if (days < 7) {
            return `${days} day${days !== 1 ? 's' : ''}`;
        } else if (days < 30) {
            const weeks = Math.floor(days / 7);
            const remainingDays = days % 7;
            return `${weeks} week${weeks !== 1 ? 's' : ''}${remainingDays > 0 ? `, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}` : ''}`;
        } else if (days < 360) {
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            return `${months} month${months !== 1 ? 's' : ''}${remainingDays > 0 ? `, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}` : ''}`;
        } else {
            const years = Math.floor(days / 360);
            const remainingMonths = Math.floor((days % 360) / 30);
            return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
        }
    },

    // 🎯 Get default stats when player data unavailable
    getDefaultStats(causeOfDeath) {
        return {
            playerName: 'Unknown Soul',
            causeOfDeath,
            gold: 0,
            daysSurvived: 1,
            survivalTime: '1 day',
            inventoryValue: 0,
            propertyCount: 0,
            propertyValue: 0,
            netWorth: 0,
            achievements: 0,
            tradesCompleted: 0,
            employees: 0,
            difficulty: 'normal',
            score: 0,
            timestamp: Date.now()
        };
    },

    // 🏆 Submit to Hall of Champions (unified leaderboard)
    async submitToLeaderboards() {
        if (!this.finalStats) return;

        // Submit to Hall of Champions (GlobalLeaderboardSystem is the single source of truth)
        if (typeof GlobalLeaderboardSystem !== 'undefined') {
            try {
                const scoreData = {
                    playerName: this.finalStats.playerName,
                    score: this.finalStats.score,
                    gold: this.finalStats.gold,
                    daysSurvived: this.finalStats.daysSurvived,
                    causeOfDeath: this.finalStats.causeOfDeath,
                    difficulty: this.finalStats.difficulty,
                    tradesCompleted: this.finalStats.tradesCompleted,
                    propertyCount: this.finalStats.propertyCount,
                    inventoryValue: this.finalStats.inventoryValue,
                    netWorth: this.finalStats.netWorth,
                    achievements: this.finalStats.achievements,
                    isAlive: false  // 💀 They died or retired
                };

                await GlobalLeaderboardSystem.submitScore(scoreData);

                // Check ranking position in the Hall of Champions (top 100)
                const leaderboard = await GlobalLeaderboardSystem.fetchLeaderboard();
                const playerRank = leaderboard.findIndex(e =>
                    e.score === this.finalStats.score &&
                    e.playerName === this.finalStats.playerName
                ) + 1;

                if (playerRank > 0 && playerRank <= 100) {
                    this.rankingResult = {
                        rank: playerRank,
                        message: this.getRankingMessage(playerRank)
                    };
                    if (playerRank <= 10) {
                        addMessage(`🏆 Hall of Champions ranking: #${playerRank}!`);
                    } else {
                        addMessage(`🏆 You made the Hall of Champions at #${playerRank}!`);
                    }
                } else {
                    this.rankingResult = null;
                    addMessage('Your score didn\'t make the top 100 champions...');
                }
            } catch (error) {
                // 🖤 Network error - silent fail, not critical for game over flow
                console.warn('⚠️ Hall of Champions submit failed:', error.message);
            }
        }
    },

    // 🎖️ Get ranking message based on position in Hall of Champions (top 100)
    getRankingMessage(rank) {
        const messages = {
            1: '👑 SUPREME CHAMPION! The realm shall remember your name forever!',
            2: '🥈 Second place! So close to glory... yet so far.',
            3: '🥉 Third place! A podium finish, but bronze tastes bitter.',
            4: 'Fourth place - just missed the podium...',
            5: 'Top 5! Your legacy will be whispered in taverns.',
            6: 'Top 6 - not bad, not legendary.',
            7: 'Lucky number 7? More like lukewarm.',
            8: 'Eighth place - firmly in the middle of mediocrity.',
            9: 'Ninth - hanging on by a thread.',
            10: 'Tenth place - the last of the elite!'
        };
        if (messages[rank]) return messages[rank];
        if (rank <= 25) return `#${rank} - A worthy champion among the elite!`;
        if (rank <= 50) return `#${rank} - Your name echoes in the Hall of Champions.`;
        if (rank <= 75) return `#${rank} - You've earned your place among legends.`;
        if (rank <= 100) return `#${rank} - Barely made the cut, but you're in!`;
        return `Rank #${rank} - a footnote in history.`;
    },

    // 💀 Show the game over screen
    showGameOverScreen() {
        const overlay = document.getElementById('game-over-overlay');
        if (!overlay) {
            console.error('Game over overlay not found!');
            // Fallback to old behavior
            if (typeof changeState === 'function') {
                changeState(GameState.MENU);
            }
            return;
        }

        // Set title based on cause
        const titleEl = document.getElementById('game-over-title');
        const causeEl = document.getElementById('game-over-cause');

        if (titleEl) {
            if (this.finalStats.causeOfDeath.includes('jail') || this.finalStats.causeOfDeath.includes('bankrupt')) {
                titleEl.textContent = '⛓️ IMPRISONED ⛓️';
            } else if (this.finalStats.causeOfDeath.includes('retired')) {
                titleEl.textContent = '🌅 RETIRED 🌅';
            } else {
                titleEl.textContent = '💀 GAME OVER 💀';
            }
        }

        if (causeEl) {
            causeEl.textContent = this.finalStats.causeOfDeath;
        }

        // Populate stats grid
        this.populateStatsGrid();

        // Show ranking if applicable
        this.populateRanking();

        // Show the overlay
        overlay.classList.remove('hidden');
    },

    // 📊 Populate the stats grid
    populateStatsGrid() {
        const statsGrid = document.getElementById('game-over-stats-grid');
        if (!statsGrid || !this.finalStats) return;

        const stats = [
            { icon: '⏰', value: this.finalStats.survivalTime, label: 'Survived' },
            { icon: '💰', value: this.finalStats.gold.toLocaleString(), label: 'Final Gold' },
            { icon: '🏠', value: this.finalStats.propertyCount, label: 'Properties' },
            { icon: '📦', value: this.finalStats.inventoryValue.toLocaleString(), label: 'Inventory Value' },
            { icon: '💎', value: this.finalStats.netWorth.toLocaleString(), label: 'Net Worth' },
            { icon: '🏆', value: this.finalStats.achievements, label: 'Achievements' },
            { icon: '🤝', value: this.finalStats.tradesCompleted, label: 'Trades' },
            { icon: '⭐', value: this.finalStats.score.toLocaleString(), label: 'Final Score' }
        ];

        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-item">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    },

    // 🏆 Populate ranking section
    populateRanking() {
        const rankingEl = document.getElementById('game-over-ranking');
        if (!rankingEl) return;

        if (this.rankingResult) {
            rankingEl.innerHTML = `
                <div class="ranking-title">🏆 Leaderboard Position</div>
                <div class="ranking-position">#${this.rankingResult.rank}</div>
                <div class="ranking-message">${this.rankingResult.message}</div>
            `;
            rankingEl.style.display = 'block';
        } else {
            rankingEl.innerHTML = `
                <div class="ranking-not-qualified">
                    your score didn't make the leaderboard this time...
                    <br>but hey, at least you tried.
                </div>
            `;
        }
    },

    // 🔄 Reset and restart - skip credits, go straight to character creation
    resetAndRestart() {
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        this.isProcessingGameOver = false;
        this.finalStats = null;
        this.rankingResult = null;

        // Restart game
        if (typeof game !== 'undefined' && typeof game.startNewGame === 'function') {
            game.startNewGame();
        } else if (typeof startNewGame === 'function') {
            startNewGame();
        } else if (typeof changeState === 'function') {
            changeState(GameState.CHAR_CREATE);
        }
    },

    // 🏠 Return to menu - show credits first, then main menu
    returnToMenu() {
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        // Show credits before returning to menu
        this.showCreditsSequence();
    },

    // 🎬 Show credits sequence
    showCreditsSequence() {
        // Create credits overlay
        const creditsOverlay = document.createElement('div');
        creditsOverlay.id = 'credits-sequence-overlay';
        creditsOverlay.className = 'credits-sequence-overlay';

        // Get config data
        const config = typeof GameConfig !== 'undefined' ? GameConfig : null;
        const gameName = config?.game?.name || 'Medieval Trading Game';
        const tagline = config?.game?.tagline || 'where capitalism meets the dark ages';
        const studio = config?.credits?.studio || 'Unity AI Lab';
        const developers = config?.credits?.developers || [
            { name: 'Hackall360', role: 'Lead Code Necromancer' },
            { name: 'Sponge', role: 'Chaos Engineer' },
            { name: 'GFourteen', role: 'Digital Alchemist' }
        ];
        const copyright = config?.credits?.copyright || '© 2025 Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com';
        const version = config?.version?.game || '0.81';

        // Get social links
        const links = config?.links || {};

        // Build social links HTML
        let socialLinksHTML = '';
        if (links.website || links.github || links.discord || links.support) {
            socialLinksHTML = `
                <div class="credits-social-links">
                    ${links.website ? `<a href="${links.website}" target="_blank" class="social-link website" title="Website"><span class="social-icon">🌐</span><span class="social-label">Website</span></a>` : ''}
                    ${links.github ? `<a href="${links.github}" target="_blank" class="social-link github" title="GitHub"><span class="social-icon">💻</span><span class="social-label">GitHub</span></a>` : ''}
                    ${links.discord ? `<a href="${links.discord}" target="_blank" class="social-link discord" title="Discord"><span class="social-icon">💬</span><span class="social-label">Discord</span></a>` : ''}
                    ${links.support ? `<a href="mailto:${links.support}" class="social-link support" title="Contact Us"><span class="social-icon">✉️</span><span class="social-label">Contact Us</span></a>` : ''}
                </div>
            `;
        }

        // Build developers HTML
        const devsHTML = developers.map(dev => `
            <div class="credits-dev">
                <span class="dev-name">${dev.name}</span>
                <span class="dev-role">${dev.role}</span>
            </div>
        `).join('');

        // Special ending message based on cause of death
        let endingMessage = 'Your journey has ended...';
        if (this.finalStats) {
            if (this.finalStats.causeOfDeath.includes('retired')) {
                endingMessage = 'You lived a full life as a merchant...';
            } else if (this.finalStats.causeOfDeath.includes('jail') || this.finalStats.causeOfDeath.includes('bankrupt')) {
                endingMessage = 'Debt claimed another soul...';
            } else if (this.finalStats.causeOfDeath.includes('starv')) {
                endingMessage = 'The hunger was too great...';
            } else if (this.finalStats.causeOfDeath.includes('thirst') || this.finalStats.causeOfDeath.includes('dehydr')) {
                endingMessage = 'Water... if only there had been water...';
            }
        }

        creditsOverlay.innerHTML = `
            <div class="credits-content">
                <div class="credits-scroll">
                    <div class="credits-ending-message">${endingMessage}</div>

                    <div class="credits-spacer"></div>

                    <div class="credits-title">${gameName}</div>
                    <div class="credits-tagline">${tagline}</div>
                    <div class="credits-version">Version ${version}</div>

                    <div class="credits-spacer"></div>

                    <div class="credits-section">
                        <div class="credits-section-title">Conjured By</div>
                        <div class="credits-studio">${studio}</div>
                    </div>

                    <div class="credits-spacer"></div>

                    <div class="credits-section">
                        <div class="credits-section-title">The Coven</div>
                        <div class="credits-developers">
                            ${devsHTML}
                        </div>
                    </div>

                    <div class="credits-spacer"></div>

                    ${socialLinksHTML}

                    <div class="credits-spacer"></div>

                    <div class="credits-section">
                        <div class="credits-thanks">Thank you for playing</div>
                        <div class="credits-copyright">${copyright}</div>
                    </div>

                    <div class="credits-spacer-large"></div>
                </div>
            </div>
            <div class="credits-skip">
                <button class="skip-credits-btn" onclick="GameOverSystem.skipCredits()">Skip Credits ▶</button>
            </div>
        `;

        document.body.appendChild(creditsOverlay);

        // Start the credits scroll animation
        requestAnimationFrame(() => {
            creditsOverlay.classList.add('active');
            const scrollContent = creditsOverlay.querySelector('.credits-scroll');
            if (scrollContent) {
                scrollContent.classList.add('scrolling');
            }
        });

        // Auto-transition to menu after credits (about 20 seconds)
        this.creditsTimeout = setTimeout(() => {
            this.finishCredits();
        }, 22000);
    },

    // ⏭️ Skip credits
    skipCredits() {
        if (this.creditsTimeout) {
            clearTimeout(this.creditsTimeout);
            this.creditsTimeout = null;
        }
        this.finishCredits();
    },

    // ✅ Finish credits and go to menu
    finishCredits() {
        const creditsOverlay = document.getElementById('credits-sequence-overlay');
        if (creditsOverlay) {
            creditsOverlay.classList.add('fading');

            setTimeout(() => {
                creditsOverlay.remove();

                // Reset game state
                this.isProcessingGameOver = false;
                this.finalStats = null;
                this.rankingResult = null;

                // Go to main menu
                if (typeof changeState === 'function') {
                    changeState(GameState.MENU);
                }
            }, 1000);
        } else {
            // Fallback if no credits overlay
            this.isProcessingGameOver = false;
            this.finalStats = null;
            this.rankingResult = null;

            if (typeof changeState === 'function') {
                changeState(GameState.MENU);
            }
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// 🏆 LEADERBOARD PANEL FUNCTIONS - view the hall of champions
// ═══════════════════════════════════════════════════════════════

// Show the leaderboard panel
function showLeaderboardPanel() {
    const overlay = document.getElementById('leaderboard-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        refreshLeaderboardPanel();
    }
}

// Close the leaderboard panel
function closeLeaderboardPanel() {
    const overlay = document.getElementById('leaderboard-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Refresh leaderboard data - uses GlobalLeaderboardSystem as single source of truth
async function refreshLeaderboardPanel() {
    const content = document.getElementById('leaderboard-panel-content');
    if (!content) return;

    content.innerHTML = '<div class="leaderboard-loading">Loading Hall of Champions...</div>';

    try {
        // Use GlobalLeaderboardSystem as the SINGLE SOURCE OF TRUTH
        if (typeof GlobalLeaderboardSystem !== 'undefined') {
            GlobalLeaderboardSystem.lastFetch = null; // Force refresh
            await GlobalLeaderboardSystem.fetchLeaderboard();

            // Use the new renderFullHallOfChampions method to show all 100 entries
            GlobalLeaderboardSystem.renderFullHallOfChampions('leaderboard-panel-content');
        } else {
            content.innerHTML = `
                <div class="leaderboard-empty">
                    <div class="leaderboard-empty-icon">🏆</div>
                    <p>no champions yet...</p>
                    <p>be the first to leave your mark on this cursed realm.</p>
                </div>
            `;
        }

    } catch (error) {
        // 🖤 Network error - show user-friendly message instead
        console.warn('⚠️ Hall of Champions load failed:', error.message);
        content.innerHTML = `
            <div class="leaderboard-empty">
                <div class="leaderboard-empty-icon">⚠️</div>
                <p>failed to load Hall of Champions...</p>
                <p>the void consumed the data.</p>
            </div>
        `;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════
// 🎮 GAME OVER SCREEN BUTTON HANDLERS
// ═══════════════════════════════════════════════════════════════

function closeGameOverAndRestart() {
    GameOverSystem.resetAndRestart();
}

function closeGameOverToMenu() {
    GameOverSystem.returnToMenu();
}

function showLeaderboardFromGameOver() {
    showLeaderboardPanel();
}

// ═══════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY
// ═══════════════════════════════════════════════════════════════

window.GameOverSystem = GameOverSystem;
window.showLeaderboardPanel = showLeaderboardPanel;
window.closeLeaderboardPanel = closeLeaderboardPanel;
window.refreshLeaderboardPanel = refreshLeaderboardPanel;
window.closeGameOverAndRestart = closeGameOverAndRestart;
window.closeGameOverToMenu = closeGameOverToMenu;
window.showLeaderboardFromGameOver = showLeaderboardFromGameOver;

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GameOverSystem.init());
} else {
    GameOverSystem.init();
}

console.log('✅ Game Over System loaded!');
