// 
// GAME OVER SYSTEM - every story ends in the void
// 
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

console.log('💀 Game Over System loading... preparing for inevitable failures...');

const GameOverSystem = {
    //  Debt deep enough to bury you alive - the law has no mercy
    BANKRUPTCY_THRESHOLD: -1000,

    //  Death is already knocking - don't let it knock twice
    isProcessingGameOver: false,

    //  Your corpse's stats - what you died with matters
    finalStats: null,

    //  Where you ranked among the fallen - legends and losers
    rankingResult: null,

    // boot up the reaper - we're all gonna need this eventually
    init() {
        console.log('💀 Game Over System ready to collect souls and document your failures');
        this.isProcessingGameOver = false;
        this.finalStats = null;
        this.rankingResult = null;
    },

    //  Count your debts - poverty is a slow death sentence
    checkBankruptcy() {
        if (this.isProcessingGameOver) return false;

        const gold = game?.player?.gold ?? 0;

        if (gold <= this.BANKRUPTCY_THRESHOLD) {
            this.triggerBankruptcy();
            return true;
        }
        return false;
    },

    //  The collectors have arrived - your poverty became your prison
    triggerBankruptcy() {
        if (this.isProcessingGameOver) return;

        const gold = game?.player?.gold ?? 0;

        // Carve "died broke" on your tombstone
        if (typeof DeathCauseSystem !== 'undefined') {
            DeathCauseSystem.recordBankruptcy(gold);
        }

        const causeOfDeath = `jailed for bankruptcy (${Math.abs(gold).toLocaleString()} gold debt)`;

        addMessage('💀 the debt collectors have come...');
        addMessage('🚔 you are being arrested for failure to pay your debts!');
        addMessage('sentenced to debtors prison... your trading days are over.');

        this.handleGameOver(causeOfDeath);
    },

    //  The end has come - process your demise
    async handleGameOver(causeOfDeath = 'unknown causes') {
        if (this.isProcessingGameOver) return;
        this.isProcessingGameOver = true;

        console.log('💀 Game Over triggered:', causeOfDeath);

        // Time stops when you die - no more ticking clocks
        if (typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed('PAUSED');
        }

        // Tally your life's worth - numbers don't lie
        this.finalStats = this.calculateFinalStats(causeOfDeath);

        // Etch your name in the hall of the dead
        await this.submitToLeaderboards();

        // Display your failure for all to see
        this.showGameOverScreen();
    },

    //  Count what you died with - every coin, every day survived
    calculateFinalStats(causeOfDeath) {
        const player = game?.player;
        if (!player) return this.getDefaultStats(causeOfDeath);

        // How long did you cling to life? Every sunrise was a victory
        const startDate = typeof GameConfig !== 'undefined' ? GameConfig.time.startingDate : { year: 1111, month: 4, day: 1 };
        const time = typeof TimeSystem !== 'undefined' ? TimeSystem.currentTime : { day: startDate.day, month: startDate.month, year: startDate.year };
        const startDays = startDate.day + (startDate.month - 1) * 30 + (startDate.year - 1) * 360;
        const currentDays = time.day + (time.month - 1) * 30 + (time.year - 1) * 360;
        const daysSurvived = Math.max(0, currentDays - startDays);

        // Price your corpse's pockets - dead merchants carry treasures
        let inventoryValue = 0;
        if (player.inventory && typeof ItemDatabase !== 'undefined') {
            for (const [itemId, quantity] of Object.entries(player.inventory)) {
                if (quantity > 0) {
                    const price = ItemDatabase.calculatePrice?.(itemId) || 0;
                    inventoryValue += price * quantity;
                }
            }
        }

        // Count your empire of dirt and stone - all meaningless now
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

        // How many legends did you become? Achievements are vanity
        const achievements = typeof AchievementSystem !== 'undefined' ?
            AchievementSystem.unlockedAchievements?.size || 0 : 0;

        // Business deals closed before the casket - commerce never sleeps
        const tradesCompleted = typeof TradingSystem !== 'undefined' ?
            TradingSystem.tradeHistory?.length || 0 : 0;

        // Workers you left behind - they'll find new masters
        const employees = typeof EmployeeSystem !== 'undefined' ?
            EmployeeSystem.getEmployees?.()?.length || 0 : 0;

        // Your total wealth - can't take it with you to the grave
        const netWorth = (player.gold || 0) + inventoryValue + propertyValue;

        // Calculate your legacy in cold numbers - death loves math
        let score = Math.max(0, player.gold || 0);
        score += daysSurvived * 10;
        score += propertyCount * 500;
        score += achievements * 100;
        score += Math.floor(inventoryValue * 0.5);
        score += tradesCompleted * 5;

        // Harder deaths earn more respect - suffering has value
        const difficultyMultipliers = {
            tutorial: 0.3,
            easy: 0.5,
            normal: 1.0,
            hard: 1.5,
            nightmare: 2.0
        };
        const difficulty = player.difficulty || 'normal';
        score = Math.floor(score * (difficultyMultipliers[difficulty] || 1));

        return {
            playerName: player.name || 'Anonymous Merchant',
            characterId: player.characterId || null, // CRITICAL: Unique ID for leaderboard deduplication
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

    //  Make your survival time readable - humans prefer words to numbers
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

    //  Fallback stats for unknown corpses - even ghosts get records
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

    //  Carve your name among legends - or losers, depends on your score
    async submitToLeaderboards() {
        if (!this.finalStats) return;

        // Immortalize your failure (or triumph) in the eternal records
        if (typeof GlobalLeaderboardSystem !== 'undefined') {
            try {
                const scoreData = {
                    playerName: this.finalStats.playerName,
                    characterId: this.finalStats.characterId, // CRITICAL: Prevents duplicate leaderboard entries
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
                    isAlive: false  // They died or retired
                };

                await GlobalLeaderboardSystem.submitScore(scoreData);

                // See where you rank among the dead - top 100 or forgotten
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
                //  The network died before you - your legend stays local
                console.warn('⚠️ Hall of Champions submit failed:', error.message);
            }
        }
    },

    // Craft your eulogy based on where you placed - glory or mediocrity
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

    // Display your ending - every story needs a final page
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

        // Different deaths deserve different titles - context matters
        const titleEl = document.getElementById('game-over-title');
        const causeEl = document.getElementById('game-over-cause');

        if (titleEl) {
            if (this.finalStats.causeOfDeath.includes('jail') || this.finalStats.causeOfDeath.includes('bankrupt')) {
                titleEl.textContent = 'IMPRISONED ';
            } else if (this.finalStats.causeOfDeath.includes('retired')) {
                titleEl.textContent = '🌅 RETIRED 🌅';
            } else {
                titleEl.textContent = '💀 GAME OVER 💀';
            }
        }

        if (causeEl) {
            causeEl.textContent = this.finalStats.causeOfDeath;
        }

        // Fill the screen with your life's numbers - cold and final
        this.populateStatsGrid();

        // Display your place among the champions (if you earned it)
        this.populateRanking();

        // Unveil your demise to the world
        overlay.classList.remove('hidden');
    },

    // Build your death statistics display - numbers tell the truth
    populateStatsGrid() {
        const statsGrid = document.getElementById('game-over-stats-grid');
        if (!statsGrid || !this.finalStats) return;

        const stats = [
            { icon: '', value: this.finalStats.survivalTime, label: 'Survived' },
            { icon: '💰', value: this.finalStats.gold.toLocaleString(), label: 'Final Gold' },
            { icon: '🏠', value: this.finalStats.propertyCount, label: 'Properties' },
            { icon: '📦', value: this.finalStats.inventoryValue.toLocaleString(), label: 'Inventory Value' },
            { icon: '💎', value: this.finalStats.netWorth.toLocaleString(), label: 'Net Worth' },
            { icon: '🏆', value: this.finalStats.achievements, label: 'Achievements' },
            { icon: '🤝', value: this.finalStats.tradesCompleted, label: 'Trades' },
            { icon: '', value: this.finalStats.score.toLocaleString(), label: 'Final Score' }
        ];

        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-item">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    },

    // Show where you placed - legends or forgotten dust
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

    // Death is just the beginning - rise again and try not to fail this time
    resetAndRestart() {
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        this.isProcessingGameOver = false;
        this.finalStats = null;
        this.rankingResult = null;

        // Resurrect into a new life - same world, different corpse
        if (typeof game !== 'undefined' && typeof game.startNewGame === 'function') {
            game.startNewGame();
        } else if (typeof startNewGame === 'function') {
            startNewGame();
        } else if (typeof changeState === 'function') {
            changeState(GameState.CHAR_CREATE);
        }
    },

    // Retreat to the menu - show credits for your suffering first
    returnToMenu() {
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        // Craft a poetic ending based on how you died - death deserves poetry
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

        // Roll the credits - honor those who built your demise
        if (typeof CreditsSystem !== 'undefined') {
            CreditsSystem.showCredits({
                endingMessage: endingMessage,
                returnToMenu: true,
                onFinish: () => {
                    // Reset game over state after credits
                    this.isProcessingGameOver = false;
                    this.finalStats = null;
                    this.rankingResult = null;
                }
            });
        } else {
            // Fallback if CreditsSystem not loaded - go straight to menu
            console.warn('CreditsSystem not loaded, going straight to menu');
            this.isProcessingGameOver = false;
            this.finalStats = null;
            this.rankingResult = null;
            if (typeof changeState === 'function') {
                changeState(GameState.MENU);
            }
        }
    }
};

// 
//  LEADERBOARD PANEL FUNCTIONS - view the hall of champions
// 

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
        // Network error - show user-friendly message instead
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

// 
//  GAME OVER SCREEN BUTTON HANDLERS
// 

function closeGameOverAndRestart() {
    GameOverSystem.resetAndRestart();
}

function closeGameOverToMenu() {
    GameOverSystem.returnToMenu();
}

function showLeaderboardFromGameOver() {
    showLeaderboardPanel();
}

// 
//  EXPOSE GLOBALLY
// 

window.GameOverSystem = GameOverSystem;
window.showLeaderboardPanel = showLeaderboardPanel;
window.closeLeaderboardPanel = closeLeaderboardPanel;
window.refreshLeaderboardPanel = refreshLeaderboardPanel;
window.closeGameOverAndRestart = closeGameOverAndRestart;
window.closeGameOverToMenu = closeGameOverToMenu;
window.showLeaderboardFromGameOver = showLeaderboardFromGameOver;

// register with Bootstrap
Bootstrap.register('GameOverSystem', () => GameOverSystem.init(), {
    dependencies: ['game', 'CombatSystem'],
    priority: 52,
    severity: 'optional'
});

console.log('Game Over System loaded!');
