// ═══════════════════════════════════════════════════════════════
// 💱 NPC TRADE WINDOW - the universal interface for all NPC dealings
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// Every NPC interaction flows through here - trading, hiring, quests,
// random events, robberies, you name it. It's like a popup storefront
// that follows you everywhere you go. Capitalism has never been more
// portable or more intrusive.
// ═══════════════════════════════════════════════════════════════

const NPCTradeWindow = {
    // ═══════════════════════════════════════════════════════════════
    // 📋 STATE
    // ═══════════════════════════════════════════════════════════════
    initialized: false,
    isOpen: false,
    currentNPC: null,
    interactionType: null,  // 'trade', 'hire', 'quest', 'event', 'robbery'
    playerOffer: { items: {}, gold: 0 },
    npcOffer: { items: {}, gold: 0 },
    currentDiscount: 0,

    // ═══════════════════════════════════════════════════════════════
    // 🎭 INTERACTION TYPES
    // ═══════════════════════════════════════════════════════════════
    interactionTypes: {
        trade: {
            title: 'Trading',
            icon: '💱',
            description: 'Exchange goods and gold with this merchant'
        },
        hire: {
            title: 'Hiring',
            icon: '👥',
            description: 'Recruit this NPC to work for you'
        },
        quest: {
            title: 'Quest',
            icon: '📜',
            description: 'Accept a task from this NPC'
        },
        event: {
            title: 'Encounter',
            icon: '⚡',
            description: 'A chance meeting'
        },
        robbery: {
            title: 'Robbery!',
            icon: '🗡️',
            description: 'You\'re being robbed!'
        },
        talk: {
            title: 'Conversation',
            icon: '💬',
            description: 'Chat with this NPC'
        },
        shop: {
            title: 'Shopping',
            icon: '🛒',
            description: 'Browse and buy from this merchant'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎲 RANDOM EVENT POOL - events that can happen anywhere
    // ═══════════════════════════════════════════════════════════════
    randomEvents: {
        robbery: {
            weight: 5,
            minGold: 50,  // Only triggers if player has at least this much
            npcTypes: ['bandit', 'thief', 'desperate_peasant'],
            outcomes: ['fight', 'pay', 'negotiate', 'flee']
        },
        wandering_merchant: {
            weight: 15,
            npcTypes: ['traveling_merchant', 'peddler'],
            specialItems: true
        },
        lost_traveler: {
            weight: 10,
            npcTypes: ['traveler', 'pilgrim'],
            questChance: 0.5
        },
        injured_npc: {
            weight: 8,
            npcTypes: ['injured_soldier', 'wounded_traveler'],
            requiresItem: 'potion',
            rewardReputation: 20
        },
        job_opportunity: {
            weight: 12,
            npcTypes: ['recruiter', 'guild_agent'],
            offersHire: true
        },
        information_broker: {
            weight: 7,
            npcTypes: ['informant', 'spy'],
            sellsInfo: true
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this.initialized) {
            console.log('💱 NPCTradeWindow already initialized');
            return this;
        }

        console.log('💱 NPCTradeWindow awakening...');
        this.createWindowUI();
        this.setupEventListeners();
        this.initialized = true;
        console.log('💱 NPCTradeWindow ready for business');
        return this;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎨 UI CREATION
    // ═══════════════════════════════════════════════════════════════
    createWindowUI() {
        if (document.getElementById('npc-trade-window')) return;

        const windowHTML = `
            <div id="npc-trade-window" class="npc-trade-window hidden">
                <div class="trade-window-backdrop" onclick="NPCTradeWindow.close()"></div>
                <div class="trade-window-container">
                    <!-- Header -->
                    <div class="trade-window-header">
                        <div class="trade-header-left">
                            <span class="trade-type-icon" id="trade-type-icon">💱</span>
                            <div class="trade-header-info">
                                <h2 id="trade-npc-name">Merchant</h2>
                                <span id="trade-interaction-type" class="trade-type-badge">Trading</span>
                            </div>
                        </div>
                        <div class="trade-header-right">
                            <div class="npc-mood" id="npc-mood">
                                <span class="mood-icon">😊</span>
                                <span class="mood-text">Friendly</span>
                            </div>
                            <button class="trade-close-btn" onclick="NPCTradeWindow.close()">×</button>
                        </div>
                    </div>

                    <!-- NPC Portrait and Chat -->
                    <div class="trade-npc-section">
                        <div class="npc-portrait" id="npc-portrait">
                            <div class="npc-avatar">👤</div>
                        </div>
                        <div class="npc-chat-bubble" id="npc-chat-bubble">
                            <p id="npc-dialogue">Welcome, traveler! What can I do for you?</p>
                        </div>
                    </div>

                    <!-- Main Content Area - changes based on interaction type -->
                    <div class="trade-main-content" id="trade-main-content">
                        <!-- Will be populated based on interaction type -->
                    </div>

                    <!-- Action Buttons -->
                    <div class="trade-actions" id="trade-actions">
                        <!-- Dynamic buttons based on interaction -->
                    </div>

                    <!-- Status Bar -->
                    <div class="trade-status-bar">
                        <div class="player-gold">
                            <span class="gold-icon">💰</span>
                            <span id="player-gold-display">0</span> gold
                        </div>
                        <div class="trade-status" id="trade-status"></div>
                    </div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = windowHTML;
        document.body.appendChild(container.firstElementChild);
    },

    // ═══════════════════════════════════════════════════════════════
    // 🚪 OPEN / CLOSE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Open the trade window with an NPC
     * @param {object} npcData - NPC information
     * @param {string} type - Interaction type (trade, hire, quest, event, robbery)
     */
    open(npcData, type = 'trade') {
        if (!npcData) {
            console.warn('💱 Cannot open trade window: no NPC data');
            return;
        }

        this.currentNPC = npcData;
        this.interactionType = type;
        this.playerOffer = { items: {}, gold: 0 };
        this.npcOffer = { items: {}, gold: 0 };
        this.currentDiscount = npcData.currentDiscount || 0;

        // 🏷️ Did we earn a discount earlier? Check the session's memory 💾
        if (typeof sessionStorage !== 'undefined') {
            const storedDiscount = parseInt(sessionStorage.getItem('merchant_discount')) || 0;
            if (storedDiscount > this.currentDiscount) {
                this.currentDiscount = storedDiscount;
            }
        }

        this.updateHeader(npcData, type);
        this.updateNPCSection(npcData);
        this.renderContent(type, npcData);
        this.updateActions(type);
        this.updatePlayerGold();

        const window = document.getElementById('npc-trade-window');
        if (window) {
            window.classList.remove('hidden');
            this.isOpen = true;
        }

        // 📡 Broadcast to the void - the trade window has awakened 🔔
        const event = new CustomEvent('trade-window-opened', {
            detail: { npc: npcData, type }
        });
        document.dispatchEvent(event);
    },

    /**
     * Close the trade window
     */
    close() {
        const window = document.getElementById('npc-trade-window');
        if (window) {
            window.classList.add('hidden');
            this.isOpen = false;
        }

        // 🗑️ Erase the discount from memory - this deal is done 💸
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('merchant_discount');
            sessionStorage.removeItem('merchant_discount_npc');
        }

        this.currentNPC = null;
        this.interactionType = null;
        this.playerOffer = { items: {}, gold: 0 };
        this.npcOffer = { items: {}, gold: 0 };

        // 📡 Signal to the world - the merchant has closed their shop 🚪
        const event = new CustomEvent('trade-window-closed', {});
        document.dispatchEvent(event);
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎨 UI UPDATES
    // ═══════════════════════════════════════════════════════════════

    updateHeader(npcData, type) {
        const interactionInfo = this.interactionTypes[type] || this.interactionTypes.trade;

        const iconEl = document.getElementById('trade-type-icon');
        const nameEl = document.getElementById('trade-npc-name');
        const typeEl = document.getElementById('trade-interaction-type');

        if (iconEl) iconEl.textContent = interactionInfo.icon;
        if (nameEl) nameEl.textContent = npcData.name || 'Unknown NPC';
        if (typeEl) {
            typeEl.textContent = interactionInfo.title;
            typeEl.className = `trade-type-badge type-${type}`;
        }
    },

    async updateNPCSection(npcData) {
        // 🎭 Draw their face in pixels - every NPC gets an avatar 👤
        const portrait = document.getElementById('npc-portrait');
        if (portrait) {
            const avatar = portrait.querySelector('.npc-avatar');
            if (avatar) {
                avatar.textContent = this.getNPCEmoji(npcData.type);
            }
        }

        // 😊 How do they feel about you today? Update their emotional state 💭
        const moodEl = document.getElementById('npc-mood');
        if (moodEl) {
            const mood = this.getNPCMood(npcData);
            moodEl.querySelector('.mood-icon').textContent = mood.icon;
            moodEl.querySelector('.mood-text').textContent = mood.text;
            moodEl.className = `npc-mood mood-${mood.level}`;
        }

        // Update initial dialogue - now async for API greetings 🖤
        const dialogueEl = document.getElementById('npc-dialogue');
        if (dialogueEl) {
            dialogueEl.textContent = '...'; // Show loading
            const greeting = await this.getGreeting(npcData);
            dialogueEl.textContent = greeting;
        }
    },

    getNPCEmoji(npcType) {
        const emojis = {
            merchant: '🧑‍💼',
            blacksmith: '⚒️',
            apothecary: '🧪',
            innkeeper: '🍺',
            guard: '⚔️',
            villager: '👤',
            elder: '👴',
            bandit: '🗡️',
            thief: '🦹',
            traveler: '🚶',
            peddler: '🎒',
            recruiter: '📋',
            boss: '👹'
        };
        return emojis[npcType] || '👤';
    },

    getNPCMood(npcData) {
        const personality = npcData.personality || 'friendly';
        const reputation = npcData.playerReputation || 50;

        if (reputation < 20) {
            return { icon: '😠', text: 'Hostile', level: 'hostile' };
        } else if (reputation < 40) {
            return { icon: '😒', text: 'Unfriendly', level: 'unfriendly' };
        } else if (reputation < 60) {
            return { icon: '😐', text: 'Neutral', level: 'neutral' };
        } else if (reputation < 80) {
            return { icon: '😊', text: 'Friendly', level: 'friendly' };
        } else {
            return { icon: '😄', text: 'Beloved', level: 'beloved' };
        }
    },

    // 🎭 Get NPC greeting - ALL greetings from API, no hardcoded fallbacks 🖤
    async getGreeting(npcData) {
        // 🔮 Try to get greeting from NPC voice/dialogue system 💀
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.generateGreeting) {
            try {
                const greeting = await NPCVoiceChatSystem.generateGreeting(npcData);
                if (greeting) return greeting;
            } catch (e) {
                console.warn('🎭 Failed to get API greeting:', e);
            }
        }

        // 🎤 Try NPCDialogueSystem as backup ⚰️
        if (typeof NPCDialogueSystem !== 'undefined' && NPCDialogueSystem.getGreeting) {
            try {
                const greeting = await NPCDialogueSystem.getGreeting(npcData);
                if (greeting) return greeting;
            } catch (e) {
                console.warn('🎭 Failed to get dialogue greeting:', e);
            }
        }

        // 💀 No fallback - return loading indicator, API will provide real greeting 🦇
        return '...';
    },

    updatePlayerGold() {
        const goldDisplay = document.getElementById('player-gold-display');
        if (goldDisplay && typeof game !== 'undefined') {
            goldDisplay.textContent = game.player?.gold || 0;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📦 CONTENT RENDERING - based on interaction type
    // ═══════════════════════════════════════════════════════════════

    renderContent(type, npcData) {
        const contentArea = document.getElementById('trade-main-content');
        if (!contentArea) return;

        switch (type) {
            case 'trade':
            case 'shop':
                contentArea.innerHTML = this.renderTradeContent(npcData);
                this.setupTradeListeners();
                break;
            case 'hire':
                contentArea.innerHTML = this.renderHireContent(npcData);
                break;
            case 'quest':
                contentArea.innerHTML = this.renderQuestContent(npcData);
                break;
            case 'event':
                contentArea.innerHTML = this.renderEventContent(npcData);
                break;
            case 'robbery':
                contentArea.innerHTML = this.renderRobberyContent(npcData);
                break;
            case 'talk':
                contentArea.innerHTML = this.renderTalkContent(npcData);
                break;
            default:
                contentArea.innerHTML = this.renderTradeContent(npcData);
        }
    },

    renderTradeContent(npcData) {
        const playerInventory = this.getPlayerInventory();
        const npcInventory = this.getNPCInventory(npcData);

        return `
            <div class="trade-columns">
                <!-- Player Side -->
                <div class="trade-column player-side">
                    <h3>Your Items</h3>
                    <div class="trade-inventory scrollable" id="player-inventory">
                        ${this.renderInventoryItems(playerInventory, 'player')}
                    </div>
                    <div class="gold-input-row">
                        <label>Offer Gold:</label>
                        <input type="number" id="player-gold-offer" min="0" value="0"
                               onchange="NPCTradeWindow.updateTradeValue()">
                    </div>
                </div>

                <!-- Trade Area -->
                <div class="trade-column trade-area">
                    <div class="offer-section">
                        <h4>Your Offer</h4>
                        <div class="offer-items" id="player-offer-items"></div>
                        <div class="offer-gold" id="player-offer-gold">0g</div>
                    </div>
                    <div class="trade-arrow">⇄</div>
                    <div class="offer-section">
                        <h4>Their Offer</h4>
                        <div class="offer-items" id="npc-offer-items"></div>
                        <div class="offer-gold" id="npc-offer-gold">0g</div>
                    </div>
                    <div class="trade-summary">
                        <div class="value-comparison">
                            <span>Your value: <strong id="player-offer-value">0</strong>g</span>
                            <span>Their value: <strong id="npc-offer-value">0</strong>g</span>
                        </div>
                        ${this.currentDiscount > 0 ? `<div class="discount-badge">🏷️ ${this.currentDiscount}% discount active!</div>` : ''}
                    </div>
                </div>

                <!-- NPC Side -->
                <div class="trade-column npc-side">
                    <h3>${npcData.name}'s Items</h3>
                    <div class="trade-inventory scrollable" id="npc-inventory">
                        ${this.renderInventoryItems(npcInventory, 'npc')}
                    </div>
                    <div class="gold-input-row">
                        <label>Request Gold:</label>
                        <input type="number" id="npc-gold-request" min="0" value="0"
                               onchange="NPCTradeWindow.updateTradeValue()">
                    </div>
                </div>
            </div>
        `;
    },

    renderInventoryItems(inventory, side) {
        if (!inventory || Object.keys(inventory).length === 0) {
            return '<div class="empty-inventory">No items</div>';
        }

        return Object.entries(inventory).map(([itemId, data]) => {
            const qty = typeof data === 'number' ? data : data.quantity || 1;
            const price = this.getItemPrice(itemId);
            const displayPrice = side === 'npc' ?
                Math.ceil(price * (1 - this.currentDiscount / 100)) :
                Math.floor(price * 0.5); // Sell at half price

            return `
                <div class="inventory-item" data-item="${itemId}" data-side="${side}"
                     onclick="NPCTradeWindow.addToOffer('${itemId}', '${side}')">
                    <span class="item-icon">${this.getItemIcon(itemId)}</span>
                    <span class="item-name">${this.formatItemName(itemId)}</span>
                    <span class="item-qty">x${qty}</span>
                    <span class="item-price">${displayPrice}g</span>
                </div>
            `;
        }).join('');
    },

    renderHireContent(npcData) {
        const hireCost = npcData.hireCost || 100;
        const skills = npcData.skills || ['general labor'];

        return `
            <div class="hire-content">
                <div class="hire-info">
                    <h3>Hire ${npcData.name}?</h3>
                    <p>${npcData.description || 'This person is looking for work.'}</p>
                    <div class="hire-stats">
                        <div class="stat-row">
                            <span class="stat-label">Daily Wage:</span>
                            <span class="stat-value">${hireCost}g/day</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Skills:</span>
                            <span class="stat-value">${skills.join(', ')}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Loyalty:</span>
                            <span class="stat-value">${npcData.loyalty || 'Neutral'}</span>
                        </div>
                    </div>
                </div>
                <div class="hire-terms">
                    <label>Contract Length:</label>
                    <select id="hire-duration">
                        <option value="1">1 day (${hireCost}g)</option>
                        <option value="7">1 week (${hireCost * 6}g)</option>
                        <option value="30">1 month (${hireCost * 25}g)</option>
                    </select>
                </div>
            </div>
        `;
    },

    renderQuestContent(npcData) {
        const availableQuests = typeof QuestSystem !== 'undefined' ?
            QuestSystem.getQuestsFromNPC(npcData.type, npcData.location) : [];

        if (availableQuests.length === 0) {
            return `
                <div class="quest-content">
                    <p class="no-quests">${npcData.name} has no tasks for you right now.</p>
                </div>
            `;
        }

        return `
            <div class="quest-content">
                <h3>Available Tasks</h3>
                <div class="quest-list">
                    ${availableQuests.map(quest => `
                        <div class="quest-offer" data-quest="${quest.id}">
                            <div class="quest-offer-header">
                                <span class="quest-name">${quest.name}</span>
                                <span class="quest-difficulty ${quest.difficulty}">${quest.difficulty}</span>
                            </div>
                            <p class="quest-desc">${quest.description}</p>
                            <div class="quest-rewards-preview">
                                ${quest.rewards.gold ? `<span>💰 ${quest.rewards.gold}g</span>` : ''}
                                ${quest.rewards.experience ? `<span>⭐ ${quest.rewards.experience} XP</span>` : ''}
                            </div>
                            <button class="accept-quest-btn"
                                    onclick="NPCTradeWindow.acceptQuest('${quest.id}')">
                                Accept Quest
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderEventContent(npcData) {
        const eventType = npcData.eventType || 'encounter';
        const eventData = npcData.eventData || {};

        return `
            <div class="event-content">
                <div class="event-description">
                    <p>${npcData.eventDescription || 'You encounter a stranger on the road.'}</p>
                </div>
                <div class="event-options" id="event-options">
                    ${this.renderEventOptions(eventType, eventData)}
                </div>
            </div>
        `;
    },

    renderEventOptions(eventType, eventData) {
        const options = eventData.options || [
            { id: 'talk', label: 'Talk', icon: '💬' },
            { id: 'trade', label: 'Trade', icon: '💱' },
            { id: 'leave', label: 'Leave', icon: '🚶' }
        ];

        return options.map(opt => `
            <button class="event-option-btn" onclick="NPCTradeWindow.handleEventOption('${opt.id}')">
                <span class="option-icon">${opt.icon}</span>
                <span class="option-label">${opt.label}</span>
            </button>
        `).join('');
    },

    renderRobberyContent(npcData) {
        const demandedGold = npcData.demandedGold || Math.floor((game?.player?.gold || 100) * 0.3);

        return `
            <div class="robbery-content">
                <div class="robbery-warning">
                    <span class="warning-icon">⚠️</span>
                    <h3>You're Being Robbed!</h3>
                </div>
                <p class="robbery-demand">
                    "${npcData.name}" demands <strong>${demandedGold} gold</strong>!
                </p>
                <div class="robbery-options">
                    <button class="robbery-btn fight" onclick="NPCTradeWindow.handleRobbery('fight')">
                        ⚔️ Fight Back
                    </button>
                    <button class="robbery-btn pay" onclick="NPCTradeWindow.handleRobbery('pay', ${demandedGold})">
                        💰 Pay Up (${demandedGold}g)
                    </button>
                    <button class="robbery-btn negotiate" onclick="NPCTradeWindow.handleRobbery('negotiate')">
                        🗣️ Negotiate
                    </button>
                    <button class="robbery-btn flee" onclick="NPCTradeWindow.handleRobbery('flee')">
                        🏃 Try to Flee
                    </button>
                </div>
            </div>
        `;
    },

    renderTalkContent(npcData) {
        return `
            <div class="talk-content">
                <div class="chat-options">
                    <button class="chat-option" onclick="NPCTradeWindow.startChat('greeting')">
                        👋 Greet
                    </button>
                    <button class="chat-option" onclick="NPCTradeWindow.startChat('trade')">
                        💱 Ask about trading
                    </button>
                    <button class="chat-option" onclick="NPCTradeWindow.startChat('quest')">
                        📜 Ask about work
                    </button>
                    <button class="chat-option" onclick="NPCTradeWindow.startChat('rumors')">
                        👂 Ask for rumors
                    </button>
                    <button class="chat-option" onclick="NPCTradeWindow.startChat('location')">
                        🗺️ Ask for directions
                    </button>
                </div>
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎮 ACTION BUTTONS
    // ═══════════════════════════════════════════════════════════════

    updateActions(type) {
        const actionsArea = document.getElementById('trade-actions');
        if (!actionsArea) return;

        switch (type) {
            case 'trade':
            case 'shop':
                actionsArea.innerHTML = `
                    <button class="trade-action-btn secondary" onclick="NPCTradeWindow.clearOffer()">
                        Clear Offer
                    </button>
                    <button class="trade-action-btn primary" onclick="NPCTradeWindow.proposeTrade()">
                        Propose Trade
                    </button>
                    <button class="trade-action-btn" onclick="NPCTradeWindow.close()">
                        Leave
                    </button>
                `;
                break;
            case 'hire':
                actionsArea.innerHTML = `
                    <button class="trade-action-btn primary" onclick="NPCTradeWindow.confirmHire()">
                        Hire
                    </button>
                    <button class="trade-action-btn" onclick="NPCTradeWindow.close()">
                        Decline
                    </button>
                `;
                break;
            case 'quest':
            case 'event':
            case 'talk':
                actionsArea.innerHTML = `
                    <button class="trade-action-btn" onclick="NPCTradeWindow.close()">
                        Leave
                    </button>
                `;
                break;
            case 'robbery':
                actionsArea.innerHTML = ''; // Actions are in the content
                break;
            default:
                actionsArea.innerHTML = `
                    <button class="trade-action-btn" onclick="NPCTradeWindow.close()">
                        Close
                    </button>
                `;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 💱 TRADING LOGIC
    // ═══════════════════════════════════════════════════════════════

    addToOffer(itemId, side) {
        if (side === 'player') {
            const currentQty = this.playerOffer.items[itemId] || 0;
            const availableQty = this.getPlayerItemQty(itemId);
            if (currentQty < availableQty) {
                this.playerOffer.items[itemId] = currentQty + 1;
            }
        } else {
            const currentQty = this.npcOffer.items[itemId] || 0;
            const availableQty = this.getNPCItemQty(itemId);
            if (currentQty < availableQty) {
                this.npcOffer.items[itemId] = currentQty + 1;
            }
        }
        this.updateOfferDisplay();
        this.updateTradeValue();
    },

    removeFromOffer(itemId, side) {
        if (side === 'player') {
            if (this.playerOffer.items[itemId]) {
                this.playerOffer.items[itemId]--;
                if (this.playerOffer.items[itemId] <= 0) {
                    delete this.playerOffer.items[itemId];
                }
            }
        } else {
            if (this.npcOffer.items[itemId]) {
                this.npcOffer.items[itemId]--;
                if (this.npcOffer.items[itemId] <= 0) {
                    delete this.npcOffer.items[itemId];
                }
            }
        }
        this.updateOfferDisplay();
        this.updateTradeValue();
    },

    updateOfferDisplay() {
        // 👤 What are you putting on the table? Show your offer 🎁
        const playerOfferEl = document.getElementById('player-offer-items');
        if (playerOfferEl) {
            playerOfferEl.innerHTML = Object.entries(this.playerOffer.items).map(([itemId, qty]) => `
                <div class="offer-item" onclick="NPCTradeWindow.removeFromOffer('${itemId}', 'player')">
                    ${this.getItemIcon(itemId)} ${this.formatItemName(itemId)} x${qty}
                </div>
            `).join('') || '<span class="empty">Nothing</span>';
        }

        // 🧑‍💼 What are they willing to give? Display their counter-offer 💼
        const npcOfferEl = document.getElementById('npc-offer-items');
        if (npcOfferEl) {
            npcOfferEl.innerHTML = Object.entries(this.npcOffer.items).map(([itemId, qty]) => `
                <div class="offer-item" onclick="NPCTradeWindow.removeFromOffer('${itemId}', 'npc')">
                    ${this.getItemIcon(itemId)} ${this.formatItemName(itemId)} x${qty}
                </div>
            `).join('') || '<span class="empty">Nothing</span>';
        }
    },

    updateTradeValue() {
        // 💰 How much gold are you throwing into the deal? Extract the numbers 🪙
        const playerGoldOffer = parseInt(document.getElementById('player-gold-offer')?.value) || 0;
        const npcGoldRequest = parseInt(document.getElementById('npc-gold-request')?.value) || 0;

        this.playerOffer.gold = playerGoldOffer;
        this.npcOffer.gold = npcGoldRequest;

        // 📊 Add up the value of your offerings - every item has a price ⚖️
        let playerItemValue = 0;
        for (const [itemId, qty] of Object.entries(this.playerOffer.items)) {
            playerItemValue += Math.floor(this.getItemPrice(itemId) * 0.5) * qty; // Sell at half
        }

        let npcItemValue = 0;
        for (const [itemId, qty] of Object.entries(this.npcOffer.items)) {
            const price = this.getItemPrice(itemId);
            const discountedPrice = Math.ceil(price * (1 - this.currentDiscount / 100));
            npcItemValue += discountedPrice * qty;
        }

        const playerTotalValue = playerItemValue + playerGoldOffer;
        const npcTotalValue = npcItemValue + npcGoldRequest;

        // 🖥️ Refresh the UI with the new values - let them see the deal 👁️
        document.getElementById('player-offer-gold').textContent = `${playerGoldOffer}g`;
        document.getElementById('npc-offer-gold').textContent = `${npcGoldRequest}g`;
        document.getElementById('player-offer-value').textContent = playerTotalValue;
        document.getElementById('npc-offer-value').textContent = npcTotalValue;

        // ⚖️ Is it fair? Favorable? Calculate the balance of the trade 📉
        const statusEl = document.getElementById('trade-status');
        if (statusEl) {
            const diff = playerTotalValue - npcTotalValue;
            if (diff > 0) {
                statusEl.textContent = `You're offering ${diff}g more`;
                statusEl.className = 'trade-status favorable';
            } else if (diff < 0) {
                statusEl.textContent = `They want ${Math.abs(diff)}g more`;
                statusEl.className = 'trade-status unfavorable';
            } else {
                statusEl.textContent = 'Fair trade';
                statusEl.className = 'trade-status fair';
            }
        }
    },

    clearOffer() {
        this.playerOffer = { items: {}, gold: 0 };
        this.npcOffer = { items: {}, gold: 0 };

        const playerGoldInput = document.getElementById('player-gold-offer');
        const npcGoldInput = document.getElementById('npc-gold-request');
        if (playerGoldInput) playerGoldInput.value = 0;
        if (npcGoldInput) npcGoldInput.value = 0;

        this.updateOfferDisplay();
        this.updateTradeValue();
    },

    proposeTrade() {
        if (!this.currentNPC) return;

        // 🧮 Crunch the numbers - is this trade worthy of acceptance? 💎
        let playerTotalValue = this.playerOffer.gold;
        for (const [itemId, qty] of Object.entries(this.playerOffer.items)) {
            playerTotalValue += Math.floor(this.getItemPrice(itemId) * 0.5) * qty;
        }

        let npcTotalValue = this.npcOffer.gold;
        for (const [itemId, qty] of Object.entries(this.npcOffer.items)) {
            const price = this.getItemPrice(itemId);
            const discountedPrice = Math.ceil(price * (1 - this.currentDiscount / 100));
            npcTotalValue += discountedPrice * qty;
        }

        // 💸 Can you even afford this? Check your pockets before promising gold 🪙
        if (typeof game !== 'undefined' && game.player) {
            if (this.playerOffer.gold > game.player.gold) {
                this.showNPCResponse("You don't have enough gold for that offer.");
                return;
            }
        }

        // 🎭 Will they accept? Their personality determines the threshold 🎲
        const personality = this.currentNPC.personality || 'friendly';
        let acceptanceThreshold = 0; // How much extra value NPC requires

        switch (personality) {
            case 'greedy':
                acceptanceThreshold = npcTotalValue * 0.2; // Wants 20% more
                break;
            case 'shrewd':
                acceptanceThreshold = npcTotalValue * 0.1; // Wants 10% more
                break;
            case 'desperate':
                acceptanceThreshold = -npcTotalValue * 0.2; // Accepts 20% less
                break;
            case 'friendly':
                acceptanceThreshold = 0; // Fair trades
                break;
            default:
                acceptanceThreshold = npcTotalValue * 0.05; // Slight advantage
        }

        if (playerTotalValue >= npcTotalValue + acceptanceThreshold) {
            this.executeTrade();
        } else {
            const needed = Math.ceil(npcTotalValue + acceptanceThreshold - playerTotalValue);
            this.showNPCResponse(`That's not quite enough. I'd need about ${needed} more gold worth.`);
        }
    },

    executeTrade() {
        if (typeof game === 'undefined' || !game.player) {
            // 🦇 No game state - can't trade, silently return
            addMessage?.('Trade failed - please try again');
            return;
        }

        // 📦 Transfer the goods - take from player, give to merchant 🔄
        for (const [itemId, qty] of Object.entries(this.playerOffer.items)) {
            game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) - qty;
            if (game.player.inventory[itemId] <= 0) {
                delete game.player.inventory[itemId];
            }
        }

        // 🎁 Claim your prizes - merchant's wares become yours 💰
        for (const [itemId, qty] of Object.entries(this.npcOffer.items)) {
            game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + qty;
            // 💭 Merchant inventory would update here if it was persistent 🗃️
        }

        // 💰 Exchange the coin - subtract what you gave, add what you got 🪙
        game.player.gold = (game.player.gold || 0) - this.playerOffer.gold + this.npcOffer.gold;

        // ✅ Deal sealed - merchant smiles (or doesn't) 😊
        this.showNPCResponse("Pleasure doing business with you!");

        if (typeof addMessage === 'function') {
            addMessage('Trade completed successfully!', 'success');
        }

        // 📡 Tell the quest system - this trade might matter 📜
        const event = new CustomEvent('trade-completed', {
            detail: {
                npc: this.currentNPC,
                playerGave: this.playerOffer,
                playerReceived: this.npcOffer
            }
        });
        document.dispatchEvent(event);

        // 🎯 Track each item purchased - quests might be listening 👂
        for (const itemId of Object.keys(this.npcOffer.items)) {
            const purchaseEvent = new CustomEvent('item-purchased', {
                detail: { itemId, npc: this.currentNPC }
            });
            document.dispatchEvent(purchaseEvent);
        }

        // 🧹 Clean the slate - reset for the next deal 🔄
        this.clearOffer();
        this.updatePlayerGold();
        this.renderContent(this.interactionType, this.currentNPC);
    },

    showNPCResponse(text) {
        const dialogueEl = document.getElementById('npc-dialogue');
        if (dialogueEl) {
            dialogueEl.textContent = text;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 👥 HIRING LOGIC
    // ═══════════════════════════════════════════════════════════════

    confirmHire() {
        if (!this.currentNPC) return;

        const durationSelect = document.getElementById('hire-duration');
        const duration = parseInt(durationSelect?.value) || 1;
        const dailyWage = this.currentNPC.hireCost || 100;

        let totalCost = dailyWage * duration;
        if (duration === 7) totalCost = dailyWage * 6; // Weekly discount
        if (duration === 30) totalCost = dailyWage * 25; // Monthly discount

        if (typeof game !== 'undefined' && game.player) {
            if (game.player.gold < totalCost) {
                this.showNPCResponse("You can't afford my services.");
                return;
            }

            game.player.gold -= totalCost;

            // 👥 Add them to your crew - they work for you now 🤝
            game.player.employees = game.player.employees || [];
            game.player.employees.push({
                ...this.currentNPC,
                hiredAt: Date.now(),
                contractEnds: Date.now() + (duration * 24 * 60 * 60 * 1000)
            });

            if (typeof addMessage === 'function') {
                addMessage(`Hired ${this.currentNPC.name} for ${duration} day(s)!`, 'success');
            }

            this.showNPCResponse("I look forward to working with you!");
            this.updatePlayerGold();

            setTimeout(() => this.close(), 1500);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📜 QUEST LOGIC
    // ═══════════════════════════════════════════════════════════════

    acceptQuest(questId) {
        if (typeof QuestSystem !== 'undefined') {
            const result = QuestSystem.assignQuest(questId, this.currentNPC);
            if (result.success) {
                const quest = QuestSystem.quests[questId];
                this.showNPCResponse(quest?.dialogue?.start || "Good luck with that task!");
                this.renderContent('quest', this.currentNPC);
            } else {
                this.showNPCResponse(result.error || "I can't give you that task right now.");
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🗡️ ROBBERY LOGIC
    // ═══════════════════════════════════════════════════════════════

    handleRobbery(action, amount = 0) {
        if (typeof game === 'undefined' || !game.player) return;

        switch (action) {
            case 'fight':
                // ⚔️ Roll the dice of combat - strength vs strength 🎲
                const playerStrength = game.player.attributes?.strength || 5;
                const banditStrength = this.currentNPC.strength || 5;
                const playerLuck = game.player.attributes?.luck || 5;

                const winChance = 0.3 + (playerStrength - banditStrength) * 0.05 + playerLuck * 0.02;

                if (Math.random() < winChance) {
                    // 🏆 Victory! Strip the corpse of its coin 💀
                    const loot = Math.floor(Math.random() * 50) + 20;
                    game.player.gold += loot;
                    this.showNPCResponse("Argh! You win this time!");
                    if (typeof addMessage === 'function') {
                        addMessage(`You defeated the bandit and found ${loot} gold!`, 'success');
                    }

                    // 📡 Broadcast your triumph - the quest system cares 🎯
                    const event = new CustomEvent('enemy-defeated', {
                        detail: { enemyType: 'bandit' }
                    });
                    document.dispatchEvent(event);
                } else {
                    // 💔 Defeat tastes bitter - they take your health and gold 🩸
                    const damage = Math.floor(Math.random() * 30) + 10;
                    game.player.health = Math.max(1, (game.player.health || 100) - damage);
                    const stolenGold = Math.floor(game.player.gold * 0.5);
                    game.player.gold -= stolenGold;
                    this.showNPCResponse("Ha! Not so tough now!");
                    if (typeof addMessage === 'function') {
                        addMessage(`You were beaten! Lost ${stolenGold} gold and took ${damage} damage.`, 'danger');
                    }
                }
                setTimeout(() => this.close(), 2000);
                break;

            case 'pay':
                game.player.gold = Math.max(0, game.player.gold - amount);
                this.showNPCResponse("Smart choice. Now get lost!");
                if (typeof addMessage === 'function') {
                    addMessage(`You paid ${amount} gold to the robber.`, 'warning');
                }
                setTimeout(() => this.close(), 1500);
                break;

            case 'negotiate':
                const charisma = game.player.attributes?.charisma || 5;
                const negotiateChance = 0.2 + charisma * 0.05;

                if (Math.random() < negotiateChance) {
                    const reducedAmount = Math.floor(amount * 0.5);
                    this.showNPCResponse(`Fine, fine... ${reducedAmount} gold and we're done.`);
                    this.currentNPC.demandedGold = reducedAmount;
                    this.renderContent('robbery', this.currentNPC);
                } else {
                    this.showNPCResponse("Don't waste my time! Pay up or fight!");
                }
                break;

            case 'flee':
                const fleeChance = 0.3 + (game.player.attributes?.luck || 5) * 0.03;
                if (Math.random() < fleeChance) {
                    this.showNPCResponse("Hey! Get back here!");
                    if (typeof addMessage === 'function') {
                        addMessage('You managed to escape!', 'success');
                    }
                    this.close();
                } else {
                    const damage = Math.floor(Math.random() * 20) + 5;
                    game.player.health = Math.max(1, (game.player.health || 100) - damage);
                    this.showNPCResponse("Where do you think you're going?!");
                    if (typeof addMessage === 'function') {
                        addMessage(`Failed to escape! Took ${damage} damage.`, 'danger');
                    }
                }
                break;
        }

        this.updatePlayerGold();
    },

    // ═══════════════════════════════════════════════════════════════
    // 💬 CHAT LOGIC
    // ═══════════════════════════════════════════════════════════════

    async startChat(topic) {
        // 🎭 ALL dialogue from API systems - no hardcoded fallbacks 🖤
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.startConversation(this.currentNPC, topic);
            this.close();
        } else if (typeof NPCDialogueSystem !== 'undefined' && NPCDialogueSystem.getResponse) {
            // 🎤 Use dialogue system for API responses ⚰️
            try {
                this.showNPCResponse('...'); // Loading
                const response = await NPCDialogueSystem.getResponse(this.currentNPC, topic);
                this.showNPCResponse(response || '...');
            } catch (e) {
                console.warn('🎭 Failed to get dialogue response:', e);
                this.showNPCResponse('...');
            }
        } else {
            // 💀 No fallback - show loading, API will populate 🦇
            this.showNPCResponse('...');
        }
    },

    handleEventOption(optionId) {
        switch (optionId) {
            case 'talk':
                this.interactionType = 'talk';
                this.renderContent('talk', this.currentNPC);
                this.updateActions('talk');
                break;
            case 'trade':
                this.interactionType = 'trade';
                this.renderContent('trade', this.currentNPC);
                this.updateActions('trade');
                break;
            case 'leave':
                this.close();
                break;
            default:
                console.log('Event option:', optionId);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔧 UTILITIES
    // ═══════════════════════════════════════════════════════════════

    getPlayerInventory() {
        if (typeof game !== 'undefined' && game.player?.inventory) {
            return game.player.inventory;
        }
        return {};
    },

    getPlayerItemQty(itemId) {
        return this.getPlayerInventory()[itemId] || 0;
    },

    getNPCInventory(npcData) {
        // 🎒 Do they have a custom inventory? Use it, otherwise generate 📦
        if (npcData.inventory) return npcData.inventory;

        // 🏪 Generic merchant stock - generated by their profession 🛒
        return this.generateNPCInventory(npcData.type);
    },

    getNPCItemQty(itemId) {
        const inv = this.getNPCInventory(this.currentNPC);
        const data = inv[itemId];
        return typeof data === 'number' ? data : (data?.quantity || 0);
    },

    generateNPCInventory(npcType) {
        const inventories = {
            merchant: { food: 10, water: 10, bread: 5, ale: 3, cloth: 5 },
            blacksmith: { sword: 2, iron_ore: 5, hammer: 1, axe: 2 },
            apothecary: { potion: 5, herb: 10, antidote: 3 },
            innkeeper: { food: 15, water: 20, ale: 10, bread: 8 },
            peddler: { trinket: 5, cloth: 3, herb: 3 },
            traveling_merchant: { silk: 2, spice: 3, exotic_goods: 1 }
        };
        return inventories[npcType] || { food: 3, water: 3 };
    },

    getItemPrice(itemId) {
        // 💎 Check the official price list first - what's this item worth? 📋
        const categories = ['consumables', 'resources', 'tools', 'luxury'];
        for (const category of categories) {
            const items = GameConfig?.items?.[category];
            if (items && items[itemId]) {
                return items[itemId].basePrice || 10;
            }
        }

        // 💰 No official price? Use these backup values 🪙
        const fallbackPrices = {
            food: 5, water: 2, bread: 3, fish: 8, ale: 10,
            wood: 8, stone: 5, iron_ore: 12, coal: 6,
            sword: 50, hammer: 15, axe: 20,
            potion: 25, herb: 5, antidote: 30,
            silk: 100, cloth: 15, trinket: 20
        };
        return fallbackPrices[itemId] || 10;
    },

    getItemIcon(itemId) {
        const icons = {
            food: '🍖', water: '💧', bread: '🍞', fish: '🐟', ale: '🍺',
            wood: '🪵', stone: '🪨', iron_ore: '�ite', coal: '�ite',
            sword: '⚔️', hammer: '🔨', axe: '🪓', pickaxe: '⛏️',
            potion: '🧪', herb: '🌿', antidote: '💊',
            silk: '🧵', cloth: '🧶', trinket: '💎',
            gold: '💰'
        };
        return icons[itemId] || '📦';
    },

    formatItemName(itemId) {
        return itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    setupTradeListeners() {
        // 🎧 Hook up additional UI listeners if we need them later 🔌
    },

    setupEventListeners() {
        // 📡 Listen for external commands to open the trade window 🎮
        document.addEventListener('open-trade-window', (e) => {
            if (e.detail?.npc) {
                this.open(e.detail.npc, e.detail.type || 'trade');
            }
        });

        // ⌨️ Escape key closes the window - quick exit from capitalism ❌
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎲 RANDOM ENCOUNTER GENERATOR
    // ═══════════════════════════════════════════════════════════════

    /**
     * Trigger a random encounter
     * @param {string} location - Current location
     * @returns {object|null} Generated encounter or null
     */
    triggerRandomEncounter(location) {
        const playerGold = (typeof game !== 'undefined' && game.player?.gold) || 0;

        // 🎲 Create a lottery of possible encounters - weighted by chance 🎰
        const possibleEvents = [];
        for (const [eventId, event] of Object.entries(this.randomEvents)) {
            // 💰 Can this event trigger? Check if you have enough gold 🪙
            if (event.minGold && playerGold < event.minGold) continue;

            for (let i = 0; i < event.weight; i++) {
                possibleEvents.push({ eventId, event });
            }
        }

        if (possibleEvents.length === 0) return null;

        // 🎰 Spin the wheel of fate - which encounter wins? 🔮
        const selected = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        const { eventId, event } = selected;

        // 👤 Summon a soul for this encounter - who appears? 🎭
        const npcType = event.npcTypes[Math.floor(Math.random() * event.npcTypes.length)];
        const npc = this.generateEventNPC(npcType, eventId, event);

        return { eventId, event, npc };
    },

    generateEventNPC(npcType, eventId, eventData) {
        const names = {
            bandit: ['Grimnok', 'Scarface', 'The Shadow', 'Blade'],
            thief: ['Quickfingers', 'The Rat', 'Slick', 'Whisper'],
            traveling_merchant: ['Jorvan the Trader', 'Silk Road Sam', 'Merchant Marco'],
            peddler: ['Old Pete', 'Trinket Tom', 'Wandering Wally'],
            traveler: ['A weary traveler', 'A lost pilgrim', 'A wandering soul'],
            recruiter: ['Captain Barnes', 'Guild Master Vera', 'Sergeant Mills']
        };

        const typeNames = names[npcType] || ['Stranger'];
        const name = typeNames[Math.floor(Math.random() * typeNames.length)];

        const npc = {
            id: `event_${Date.now()}`,
            name: name,
            type: npcType,
            eventType: eventId,
            eventData: eventData,
            personality: this.getPersonalityForType(npcType)
        };

        // 🗡️ Customize them based on what's happening - robbers want gold 💰
        if (eventId === 'robbery') {
            npc.demandedGold = Math.floor((game?.player?.gold || 100) * (0.2 + Math.random() * 0.2));
            npc.strength = 4 + Math.floor(Math.random() * 4);
        }

        if (eventId === 'job_opportunity') {
            npc.hireCost = 50 + Math.floor(Math.random() * 100);
            npc.skills = ['guard', 'porter', 'scout'][Math.floor(Math.random() * 3)];
        }

        return npc;
    },

    getPersonalityForType(npcType) {
        const personalities = {
            bandit: 'aggressive',
            thief: 'shrewd',
            traveling_merchant: 'friendly',
            peddler: 'eccentric',
            traveler: 'nervous',
            recruiter: 'professional'
        };
        return personalities[npcType] || 'neutral';
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL BINDING
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.NPCTradeWindow = NPCTradeWindow;
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => NPCTradeWindow.init());
    } else {
        NPCTradeWindow.init();
    }
}

console.log('💱 NPCTradeWindow loaded... awaiting initialization');
