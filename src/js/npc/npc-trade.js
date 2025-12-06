// ═══════════════════════════════════════════════════════════════
// NPC TRADE WINDOW - portable capitalism in a popup storefront
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
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

    // 🖤💀 PERSISTENT NPC INVENTORY CACHE - Each NPC has their own inventory! 💰
    // Key: NPC ID (e.g., "riverdale_innkeeper")
    // Value: { gold: number, items: { itemId: quantity } }
    _npcInventoryCache: {},

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
            // 🖤 Null checks because DOM elements are fickle bitches 💀
            const moodIcon = moodEl.querySelector('.mood-icon');
            const moodText = moodEl.querySelector('.mood-text');
            if (moodIcon) moodIcon.textContent = mood.icon;
            if (moodText) moodText.textContent = mood.text;
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
            // 🖤💀 Get gold from GoldManager if available for consistency 💰
            const gold = (typeof GoldManager !== 'undefined' && GoldManager.getGold)
                ? GoldManager.getGold()
                : (game.player?.gold || 0);
            goldDisplay.textContent = gold;
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

        // 🖤 Filter out sell-only items from NPC side - trash loot ain't for sale 💀
        const filteredEntries = Object.entries(inventory).filter(([itemId, data]) => {
            if (side !== 'npc') return true; // Player can sell anything
            const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
            return !item?.sellOnly; // Skip items marked as sell-only
        });

        if (filteredEntries.length === 0) {
            return '<div class="empty-inventory">No items</div>';
        }

        // 🖤💀 SORT INVENTORY: Gold → Weather → Food → Water → Everything else 💰
        const sortedEntries = this._sortInventoryByPriority(filteredEntries);

        return sortedEntries.map(([itemId, data]) => {
            const qty = typeof data === 'number' ? data : data.quantity || 1;
            const price = this.getItemPrice(itemId);
            const displayPrice = side === 'npc' ?
                Math.ceil(price * (1 - this.currentDiscount / 100)) :
                Math.floor(price * 0.5); // Sell at half price

            // 🛒 Get item data for cart
            const itemData = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;

            // 🖤 Click on the item box to add to cart - no separate buttons needed!
            return `
                <div class="inventory-item clickable-item"
                     data-item="${this.escapeHtml(itemId)}"
                     data-side="${this.escapeHtml(side)}"
                     data-action="${side === 'npc' ? 'buy' : 'sell'}"
                     data-price="${displayPrice}"
                     data-stock="${qty}"
                     data-item-name="${this.escapeHtml(itemData?.name || this.formatItemName(itemId))}"
                     data-item-icon="${this.escapeHtml(itemData?.icon || this.getItemIcon(itemId))}"
                     data-item-weight="${itemData?.weight || 1}">
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
        // 🖤 Fixed: was getQuestsFromNPC, correct method is getQuestsForNPC 💀
        const availableQuests = typeof QuestSystem !== 'undefined' ?
            QuestSystem.getQuestsForNPC(npcData.type, npcData.location) : [];

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
                        <div class="quest-offer" data-quest="${this.escapeHtml(quest.id)}">
                            <div class="quest-offer-header">
                                <span class="quest-name">${this.escapeHtml(quest.name)}</span>
                                <span class="quest-difficulty ${this.escapeHtml(quest.difficulty)}">${this.escapeHtml(quest.difficulty)}</span>
                            </div>
                            <p class="quest-desc">${this.escapeHtml(quest.description)}</p>
                            <div class="quest-rewards-preview">
                                ${quest.rewards.gold ? `<span>💰 ${quest.rewards.gold}g</span>` : ''}
                                ${quest.rewards.experience ? `<span>⭐ ${quest.rewards.experience} XP</span>` : ''}
                            </div>
                            <button class="accept-quest-btn" data-quest-id="${this.escapeHtml(quest.id)}">
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

        // 🖤 Data attributes only - no onclick string injection in my domain
        return options.map(opt => `
            <button class="event-option-btn" data-event-option="${this.escapeHtml(opt.id)}">
                <span class="option-icon">${this.escapeHtml(opt.icon || '')}</span>
                <span class="option-label">${this.escapeHtml(opt.label || '')}</span>
            </button>
        `).join('');
    },

    renderRobberyContent(npcData) {
        const demandedGold = npcData.demandedGold || Math.floor((game?.player?.gold || 100) * 0.3);
        // 🖤 Escaping all the things - robbery doesn't mean we tolerate XSS
        return `
            <div class="robbery-content">
                <div class="robbery-warning">
                    <span class="warning-icon">⚠️</span>
                    <h3>You're Being Robbed!</h3>
                </div>
                <p class="robbery-demand">
                    "${this.escapeHtml(npcData.name || 'A stranger')}" demands <strong>${demandedGold} gold</strong>!
                </p>
                <div class="robbery-options">
                    <button class="robbery-btn fight" data-robbery-action="fight">
                        ⚔️ Fight Back
                    </button>
                    <button class="robbery-btn pay" data-robbery-action="pay" data-robbery-amount="${demandedGold}">
                        💰 Pay Up (${demandedGold}g)
                    </button>
                    <button class="robbery-btn negotiate" data-robbery-action="negotiate">
                        🗣️ Negotiate
                    </button>
                    <button class="robbery-btn flee" data-robbery-action="flee">
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
        // 🖤 Using data attributes instead of inline onclick to prevent XSS
        const playerOfferEl = document.getElementById('player-offer-items');
        if (playerOfferEl) {
            playerOfferEl.innerHTML = Object.entries(this.playerOffer.items).map(([itemId, qty]) => `
                <div class="offer-item" data-item-id="${this.escapeHtml(itemId)}" data-offer-type="player">
                    ${this.getItemIcon(itemId)} ${this.formatItemName(itemId)} x${qty}
                </div>
            `).join('') || '<span class="empty">Nothing</span>';
            // 💀 Attach event listeners safely
            playerOfferEl.querySelectorAll('.offer-item[data-item-id]').forEach(el => {
                el.onclick = () => this.removeFromOffer(el.dataset.itemId, el.dataset.offerType);
            });
        }

        // 🧑‍💼 What are they willing to give? Display their counter-offer 💼
        const npcOfferEl = document.getElementById('npc-offer-items');
        if (npcOfferEl) {
            npcOfferEl.innerHTML = Object.entries(this.npcOffer.items).map(([itemId, qty]) => `
                <div class="offer-item" data-item-id="${this.escapeHtml(itemId)}" data-offer-type="npc">
                    ${this.getItemIcon(itemId)} ${this.formatItemName(itemId)} x${qty}
                </div>
            `).join('') || '<span class="empty">Nothing</span>';
            // 🦇 Attach event listeners safely
            npcOfferEl.querySelectorAll('.offer-item[data-item-id]').forEach(el => {
                el.onclick = () => this.removeFromOffer(el.dataset.itemId, el.dataset.offerType);
            });
        }
    },

    // 🖤 HTML escape Map - cached for performance instead of creating object each call 💀
    _escapeMap: new Map([['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'], ["'", '&#39;']]),

    // 🖤 Escape HTML to prevent XSS attacks - dark magic for security
    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, char => this._escapeMap.get(char));
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

        // 🐟 QUEST BYPASS: Harbor Dealings quest - accept fair trades in Greendale
        const isHarborDealingsQuest = typeof QuestSystem !== 'undefined' &&
                                      QuestSystem.activeQuests?.act1_quest4 &&
                                      typeof game !== 'undefined' &&
                                      game.currentLocation?.id === 'greendale';

        if (isHarborDealingsQuest) {
            acceptanceThreshold = 0; // Accept fair trades during quest
        } else {
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
            addMessage?.('Trade failed - please try again');
            return;
        }

        // ═══════════════════════════════════════════════════════════════
        // 🔒 ATOMIC TRANSACTION SYSTEM - VERIFY BEFORE COMMIT 🔒
        // ═══════════════════════════════════════════════════════════════

        const transactionLog = {
            timestamp: new Date().toISOString(),
            npc: this.currentNPC?.firstName || 'Unknown',
            playerGave: { ...this.playerOffer },
            playerReceived: { ...this.npcOffer },
            preState: {},
            postState: {},
            success: false,
            errors: []
        };

        // 📸 SNAPSHOT PRE-STATE for rollback verification
        transactionLog.preState = {
            playerGold: game.player.gold || 0,
            playerInventory: { ...game.player.inventory },
            npcGold: this.getNPCGold(this.currentNPC) || 0
        };

        console.log('🔄 TRADE TRANSACTION STARTING ═══════════════════');
        console.log('📦 Player offering:', this.playerOffer);
        console.log('🎁 NPC offering:', this.npcOffer);
        console.log('💰 Pre-trade player gold:', transactionLog.preState.playerGold);

        // ═══════════════════════════════════════════════════════════════
        // ✅ PHASE 1: VALIDATION - Check everything BEFORE any changes
        // ═══════════════════════════════════════════════════════════════

        // Verify player has items they're offering
        for (const [itemId, qty] of Object.entries(this.playerOffer.items)) {
            const playerHas = game.player.inventory[itemId] || 0;
            if (playerHas < qty) {
                transactionLog.errors.push(`Player missing item: ${itemId} (has ${playerHas}, needs ${qty})`);
                console.error(`❌ TRADE FAILED: Player doesn't have ${qty}x ${itemId} (only has ${playerHas})`);
                addMessage?.(`Trade failed - you don't have enough ${itemId}!`, 'error');
                this._logTransaction(transactionLog);
                return;
            }
        }

        // Verify player has gold they're offering
        if (this.playerOffer.gold > 0 && (game.player.gold || 0) < this.playerOffer.gold) {
            transactionLog.errors.push(`Player missing gold: has ${game.player.gold}, needs ${this.playerOffer.gold}`);
            console.error(`❌ TRADE FAILED: Player doesn't have ${this.playerOffer.gold} gold`);
            addMessage?.(`Trade failed - you don't have enough gold!`, 'error');
            this._logTransaction(transactionLog);
            return;
        }

        // Verify NPC has items they're offering (if we track NPC inventory)
        for (const [itemId, qty] of Object.entries(this.npcOffer.items)) {
            const npcHas = this.getNPCItemCount(this.currentNPC, itemId);
            if (npcHas !== null && npcHas < qty) {
                transactionLog.errors.push(`NPC missing item: ${itemId} (has ${npcHas}, needs ${qty})`);
                console.error(`❌ TRADE FAILED: NPC doesn't have ${qty}x ${itemId}`);
                addMessage?.(`Trade failed - merchant doesn't have that item!`, 'error');
                this._logTransaction(transactionLog);
                return;
            }
        }

        // Verify NPC has gold they're offering
        if (this.npcOffer.gold > 0) {
            const npcGold = this.getNPCGold(this.currentNPC);
            if (npcGold !== null && npcGold < this.npcOffer.gold) {
                transactionLog.errors.push(`NPC missing gold: has ${npcGold}, needs ${this.npcOffer.gold}`);
                console.error(`❌ TRADE FAILED: NPC doesn't have ${this.npcOffer.gold} gold`);
                addMessage?.(`Trade failed - merchant can't afford that!`, 'error');
                this._logTransaction(transactionLog);
                return;
            }
        }

        console.log('✅ Validation passed - executing trade...');

        // ═══════════════════════════════════════════════════════════════
        // 💫 PHASE 2: EXECUTION - All changes happen here
        // ═══════════════════════════════════════════════════════════════

        try {
            // 📦 Remove items from player inventory
            for (const [itemId, qty] of Object.entries(this.playerOffer.items)) {
                game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) - qty;
                if (game.player.inventory[itemId] <= 0) {
                    delete game.player.inventory[itemId];
                }
                console.log(`  📤 Player gave: ${qty}x ${itemId}`);
            }

            // 🎁 Add items to player inventory from NPC
            for (const [itemId, qty] of Object.entries(this.npcOffer.items)) {
                game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + qty;
                console.log(`  📥 Player received: ${qty}x ${itemId}`);

                // Emit item-received for quest tracking
                document.dispatchEvent(new CustomEvent('item-received', {
                    detail: { item: itemId, quantity: qty, source: 'trade' }
                }));

                // Remove from NPC inventory
                this.removeNPCItem(this.currentNPC, itemId, qty);
            }

            // 📦 Add items player sold TO NPC inventory
            for (const [itemId, qty] of Object.entries(this.playerOffer.items)) {
                this.addNPCItem(this.currentNPC, itemId, qty);
            }

            // 💰 Calculate and apply gold exchange
            const playerGoldChange = this.npcOffer.gold - this.playerOffer.gold;
            const newPlayerGold = (game.player.gold || 0) + playerGoldChange;

            if (typeof GoldManager !== 'undefined' && GoldManager.setGold) {
                GoldManager.setGold(newPlayerGold, `Trade with ${this.currentNPC?.firstName || 'NPC'}`);
            } else {
                game.player.gold = newPlayerGold;
            }
            console.log(`  💰 Player gold: ${transactionLog.preState.playerGold} → ${newPlayerGold} (${playerGoldChange >= 0 ? '+' : ''}${playerGoldChange})`);

            // Update NPC gold
            const npcGoldChange = this.playerOffer.gold - this.npcOffer.gold;
            if (npcGoldChange !== 0) {
                this.modifyNPCGold(this.currentNPC, npcGoldChange);
            }

            // ═══════════════════════════════════════════════════════════════
            // 🔍 PHASE 3: VERIFICATION - Confirm trade was successful
            // ═══════════════════════════════════════════════════════════════

            transactionLog.postState = {
                playerGold: game.player.gold || 0,
                playerInventory: { ...game.player.inventory },
                npcGold: this.getNPCGold(this.currentNPC) || 0
            };

            // Verify player received items
            for (const [itemId, qty] of Object.entries(this.npcOffer.items)) {
                const playerNowHas = game.player.inventory[itemId] || 0;
                const playerHadBefore = transactionLog.preState.playerInventory[itemId] || 0;
                if (playerNowHas < playerHadBefore + qty) {
                    transactionLog.errors.push(`VERIFICATION FAILED: Player didn't receive ${itemId}`);
                    console.error(`⚠️ VERIFICATION WARNING: Player may not have received ${itemId}`);
                }
            }

            // Verify gold changed correctly
            const expectedGold = transactionLog.preState.playerGold + playerGoldChange;
            if (Math.abs(transactionLog.postState.playerGold - expectedGold) > 0.01) {
                transactionLog.errors.push(`Gold mismatch: expected ${expectedGold}, got ${transactionLog.postState.playerGold}`);
                console.warn(`⚠️ Gold verification: expected ${expectedGold}, got ${transactionLog.postState.playerGold}`);
            }

            transactionLog.success = transactionLog.errors.length === 0;
            console.log(`✅ TRADE COMPLETE - Success: ${transactionLog.success}`);
            console.log('═══════════════════════════════════════════════════');

        } catch (error) {
            transactionLog.errors.push(`Exception: ${error.message}`);
            console.error('❌ TRADE EXCEPTION:', error);
            addMessage?.('Trade failed due to an error!', 'error');
            this._logTransaction(transactionLog);
            return;
        }

        // Log the transaction for debooger
        this._logTransaction(transactionLog);

        // ✅ Success feedback
        this.showNPCResponse("Pleasure doing business with you!");
        if (typeof addMessage === 'function') {
            addMessage('Trade completed successfully!', 'success');
        }

        // 📡 Dispatch events for quest system
        document.dispatchEvent(new CustomEvent('trade-completed', {
            detail: {
                npc: this.currentNPC,
                playerGave: this.playerOffer,
                playerReceived: this.npcOffer,
                transaction: transactionLog
            }
        }));

        for (const itemId of Object.keys(this.npcOffer.items)) {
            document.dispatchEvent(new CustomEvent('item-purchased', {
                detail: { itemId, npc: this.currentNPC }
            }));
        }

        // 🧹 Clean up and refresh UI
        this.clearOffer();
        this.updatePlayerGold();
        this.renderContent(this.interactionType, this.currentNPC);
    },

    // 🔍 Get NPC's item count (returns null if not tracked)
    // 🖤💀 FIXED: Use same key format as getNPCInventory() 💀
    getNPCItemCount(npc, itemId) {
        if (!this._npcInventoryCache) return null;
        // 🦇 Use same key format as getNPCInventory - not just npc.id!
        const npcId = npc?.id || `${npc?.location || 'unknown'}_${npc?.type}`;
        const cacheEntry = this._npcInventoryCache[npcId];
        if (!cacheEntry?.items) return null;
        return cacheEntry.items[itemId] || 0;
    },

    // 🖤💀 DELETED: Duplicate getNPCGold was here - using the proper one at line ~1431 instead 💀

    // 📝 Log transaction to debooger history
    _transactionHistory: [],
    _logTransaction(log) {
        this._transactionHistory.push(log);
        // Keep last 50 transactions
        if (this._transactionHistory.length > 50) {
            this._transactionHistory.shift();
        }
        // Expose for debooger
        window._tradeTransactions = this._transactionHistory;

        if (log.errors.length > 0) {
            console.warn('🔴 Transaction had errors:', log.errors);
        }
    },

    // 🔍 DEBOOGER: Get transaction history
    getTransactionHistory() {
        return this._transactionHistory;
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

            // 🖤💀 Use GoldManager to sync ALL gold displays! 💰
            const newGold = game.player.gold - totalCost;
            if (typeof GoldManager !== 'undefined' && GoldManager.setGold) {
                GoldManager.setGold(newGold, `Hired ${this.currentNPC.name}`);
            } else {
                game.player.gold = newGold;
            }

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
        // 🖤💀 Build NPC key consistently 💀
        const npcId = npcData.id || `${npcData.location || 'unknown'}_${npcData.type}`;

        // 🎒 Do they have a custom inventory? Cache it and return! 📦
        // 🖤💀 FIX: Always add to cache so getNPCItemCount() works! 💀
        if (npcData.inventory && !this._npcInventoryCache[npcId]) {
            this._npcInventoryCache[npcId] = {
                gold: npcData.gold || 0,
                items: { ...npcData.inventory },
                type: npcData.type,
                location: npcData.location
            };
            console.log(`🏪 NPCTrade: Cached custom inventory for ${npcId}`);
        }

        // 🖤💀 Check cache for persistent NPC inventory 💰

        if (!this._npcInventoryCache[npcId]) {
            // 🏪 First time seeing this NPC - initialize their inventory
            const baseInventory = this.generateNPCInventory(npcData.type);
            const baseGold = this._getNPCGoldAmount(npcData.type);

            // 🖤💀 Add gold AS AN ITEM in the inventory so it displays! 💰
            const inventoryWithGold = { ...baseInventory };
            if (baseGold > 0) {
                inventoryWithGold.gold = baseGold;
            }

            // 🖤 Store as persistent inventory
            this._npcInventoryCache[npcId] = {
                gold: baseGold,
                items: inventoryWithGold,
                type: npcData.type,
                location: npcData.location
            };

            console.log(`🏪 NPCTrade: Initialized inventory for ${npcId} with ${baseGold}g`);
        }

        // 🦇 Return items (includes gold as an item for display)
        return this._npcInventoryCache[npcId].items;
    },

    // 🪙 Get NPC's current gold amount 💰
    getNPCGold(npcData) {
        const npcId = npcData?.id || `${npcData?.location || 'unknown'}_${npcData?.type}`;
        if (this._npcInventoryCache[npcId]) {
            return this._npcInventoryCache[npcId].gold;
        }
        // Initialize inventory if not exists
        this.getNPCInventory(npcData);
        return this._npcInventoryCache[npcId]?.gold || 0;
    },

    // 🖤 Modify NPC's gold (for trades) 💀
    modifyNPCGold(npcData, amount) {
        const npcId = npcData?.id || `${npcData?.location || 'unknown'}_${npcData?.type}`;
        if (!this._npcInventoryCache[npcId]) {
            this.getNPCInventory(npcData); // Initialize if needed
        }
        if (this._npcInventoryCache[npcId]) {
            const newGold = Math.max(0, this._npcInventoryCache[npcId].gold + amount);
            this._npcInventoryCache[npcId].gold = newGold;
            // 🖤💀 Also update gold in the items object so inventory display updates! 💰
            if (newGold > 0) {
                this._npcInventoryCache[npcId].items.gold = newGold;
            } else {
                delete this._npcInventoryCache[npcId].items.gold;
            }
            return newGold;
        }
        return 0;
    },

    // 🦇 Add item to NPC's inventory 📦
    addNPCItem(npcData, itemId, quantity = 1) {
        const npcId = npcData?.id || `${npcData?.location || 'unknown'}_${npcData?.type}`;
        if (!this._npcInventoryCache[npcId]) {
            this.getNPCInventory(npcData);
        }
        if (this._npcInventoryCache[npcId]) {
            const items = this._npcInventoryCache[npcId].items;
            items[itemId] = (items[itemId] || 0) + quantity;
            if (items[itemId] <= 0) delete items[itemId];
        }
    },

    // 💀 Remove item from NPC's inventory 📦
    removeNPCItem(npcData, itemId, quantity = 1) {
        const npcId = npcData?.id || `${npcData?.location || 'unknown'}_${npcData?.type}`;
        if (!this._npcInventoryCache[npcId]) {
            this.getNPCInventory(npcData);
        }
        if (this._npcInventoryCache[npcId]) {
            const items = this._npcInventoryCache[npcId].items;
            if (items[itemId]) {
                items[itemId] = Math.max(0, items[itemId] - quantity);
                if (items[itemId] <= 0) delete items[itemId];
                return true;
            }
        }
        return false;
    },

    // 🪙 Get base gold amount for NPC type 💰
    // 🖤💀 1000x GOLD BOOST - NPCs need real money to trade properly! 💰
    _getNPCGoldAmount(npcType) {
        const npcGoldAmounts = {
            // === WEALTHY NPCs (100k-500k gold) ===
            noble: 500000, banker: 400000, grand_market_merchant: 350000, jeweler: 300000,
            traveling_merchant: 250000, merchant: 200000, captain: 150000, harbormaster: 150000,

            // === MIDDLE CLASS (50k-100k gold) ===
            blacksmith: 100000, weaponsmith: 100000, armorsmith: 100000, apothecary: 80000,
            innkeeper: 80000, tavernkeeper: 70000, clothier: 80000, furrier: 75000,
            healer: 60000, alchemist: 70000, vintner: 60000, caravan_master: 90000,
            dockmaster: 80000, treasure_hunter: 60000, gem_collector: 80000,

            // === WORKING CLASS (20k-50k gold) ===
            farmer: 30000, fisherman: 35000, miner: 40000, lumberjack: 35000,
            baker: 40000, cook: 35000, herbalist: 30000, hunter: 35000, trapper: 30000,
            sailor: 25000, stablemaster: 40000, ferryman: 30000, miller: 35000,
            shepherd: 25000, beekeeper: 30000, orchardist: 25000,

            // === POOR/SCHOLARLY (10k-20k gold) ===
            villager: 15000, farmhand: 10000, guard: 20000, sergeant: 30000, scout: 25000,
            traveler: 15000, wanderer: 10000, hermit: 5000, elder: 20000, priest: 25000,
            scholar: 20000, scribe: 25000, acolyte: 15000, druid: 15000, forager: 10000,
            peddler: 25000, bartender: 35000, bard: 20000, adventurer: 40000, explorer: 35000,

            // === SHADY (varies - they hide their wealth) ===
            smuggler: 100000, thief: 50000, fence: 150000,

            // === DOOM WORLD - Still have SOME gold even in apocalypse 💀 ===
            fallen_noble: 10000, deposed_noble: 5000, ruined_banker: 1000,
            desperate_guard: 5000, hollow_guard: 3000, paranoid_guard: 8000,
            crazed_blacksmith: 15000, one_armed_blacksmith: 10000,
            plague_apothecary: 5000, hoarding_apothecary: 50000,
            desperate_merchant: 10000, scavenger_merchant: 20000, stranded_merchant: 5000, hoarding_merchant: 100000,
            traumatized_innkeeper: 10000, desperate_innkeeper: 15000, surviving_innkeeper: 20000,
            poisoned_herbalist: 5000, corrupted_druid: 5000, mad_forager: 2000,
            starving_farmer: 2000, burned_farmer: 1000, refugee_farmer: 5000,
            trapped_miner: 5000, buried_miner: 3000, dying_miner: 1000,
            hunted_hunter: 8000, last_hunter: 15000, desperate_trapper: 5000,
            shell_shocked_traveler: 5000, stranded_traveler: 10000, lost_wanderer: 1000,
            drowned_sailor: 1000, ghost_sailor: 1000, mad_ferryman: 30000,
            haunted_elder: 10000, grief_stricken_elder: 5000,
            doomsayer: 5000, mad_captain: 10000, insane_hermit: 1000,
            broken_captain: 5000, starving_jeweler: 15000, ragged_tailor: 5000, mutinous_sailor: 20000
        };
        return npcGoldAmounts[npcType] ?? 25000; // Default 25k gold
    },

    getNPCItemQty(itemId) {
        const inv = this.getNPCInventory(this.currentNPC);
        const data = inv[itemId];
        return typeof data === 'number' ? data : (data?.quantity || 0);
    },

    // 🏪 PROFESSION-BASED INVENTORY SYSTEM 💀
    // Each NPC type has inventory based on who they are and what they do
    // Innkeepers sell food/drinks, blacksmiths sell weapons, etc.
    // Everyone has a SMALL amount of personal food/water based on their location
    // 🖤 Note: Gold is now handled by _getNPCGoldAmount() and stored in _npcInventoryCache 💀
    generateNPCInventory(npcType) {
        // 🖤💀 DOOM WORLD SPECIFIC INVENTORIES - Dark/corrupted versions 💀🖤
        // Check if this is a doom world NPC type
        const doomInventories = {
            // === DOOM WORLD - DESPERATE NOBILITY ===
            fallen_noble: {
                // Former luxury, now survival goods
                stale_bread: 5, dirty_water: 8, rat_meat: 3,
                tarnished_jewelry: 2, torn_silk: 4, broken_chalice: 1,
                desperate_letter: 2, family_heirloom: 1,
                rusty_dagger: 2, moldy_cheese: 2
            },
            deposed_noble: {
                stale_bread: 4, dirty_water: 6, rat_meat: 2,
                worthless_gold: 5, tarnished_crown: 1, royal_rags: 3,
                bitter_wine: 2, moldy_bread: 3
            },
            ruined_banker: {
                useless_ledger: 5, worthless_coin: 20, ash_paper: 10,
                broken_lock: 3, empty_chest: 2,
                stale_bread: 3, dirty_water: 5, despair: 1
            },

            // === DOOM WORLD - BROKEN GUARDS ===
            desperate_guard: {
                chipped_sword: 2, dented_shield: 1, cracked_helmet: 2,
                bloodstained_bandage: 8, dirty_water: 10, hardtack: 6,
                broken_arrows: 15, torn_cloak: 2, rusty_chainmail: 1
            },
            hollow_guard: {
                rusted_sword: 2, broken_spear: 3, damaged_shield: 1,
                blood_soaked_cloth: 5, dirty_water: 8, moldy_bread: 4,
                cracked_torch: 3, frayed_rope: 4
            },
            paranoid_guard: {
                poisoned_blade: 2, spiked_shield: 1, barbed_wire: 5,
                suspicious_vial: 3, trapped_box: 2,
                dirty_water: 8, hardtack: 5, paranoia_notes: 4
            },

            // === DOOM WORLD - MAD CRAFTERS ===
            crazed_blacksmith: {
                cursed_blade: 2, blood_iron_bar: 8, bone_hammer: 1,
                hellfire_coal: 6, corrupted_steel: 4, screaming_metal: 3,
                ash_water: 5, burned_meat: 3, madness_notes: 2
            },
            one_armed_blacksmith: {
                crude_weapon: 3, improvised_tool: 4, broken_hammer: 2,
                bent_nails: 15, warped_iron: 6,
                dirty_water: 6, stale_bread: 4, pain_tonic: 2
            },

            // === DOOM WORLD - PLAGUE HEALERS ===
            plague_apothecary: {
                contaminated_potion: 5, plague_cure_attempt: 3, dirty_bandage: 12,
                poisonous_herbs: 8, death_tonic: 4, corpse_flower: 6,
                black_water: 4, moldy_bread: 2, medical_notes: 3
            },
            hoarding_apothecary: {
                hidden_antidote: 1, rare_medicine: 2, hoarded_bandage: 20,
                precious_herbs: 10, survival_salve: 6,
                rationed_water: 15, emergency_food: 8, lockbox_key: 1
            },

            // === DOOM WORLD - SURVIVAL MERCHANTS ===
            desperate_merchant: {
                scavenged_food: 8, questionable_meat: 6, ash_water: 10,
                salvaged_weapon: 2, torn_cloth: 12, frayed_rope: 8,
                broken_tool: 4, rusty_blade: 3, survivor_tale: 2
            },
            scavenger_merchant: {
                corpse_loot: 10, salvaged_armor: 2, scavenged_weapon: 3,
                grave_goods: 6, blood_stained_cloth: 8, bone_fragments: 15,
                dirty_water: 12, rat_meat: 8, survival_knife: 2
            },
            stranded_merchant: {
                last_rations: 6, emergency_water: 10, desperate_goods: 5,
                worthless_silk: 4, unsellable_luxury: 3,
                broken_wagon_parts: 8, travel_bread: 5, hopeless_map: 2
            },
            hoarding_merchant: {
                hidden_food: 15, secret_water: 20, precious_medicine: 5,
                rare_survival_gear: 3, fortified_shelter_key: 1,
                armed_guards_contract: 2, paranoid_traps: 4
            },

            // === DOOM WORLD - TRAUMATIZED INNKEEPERS ===
            traumatized_innkeeper: {
                nightmare_ale: 8, tears_and_water: 15, grief_bread: 10,
                haunted_meat: 4, sorrow_soup: 6, memory_wine: 3,
                broken_dreams: 5, shattered_hope: 2
            },
            desperate_innkeeper: {
                last_ale_barrel: 12, rationed_water: 20, precious_bread: 15,
                hidden_cheese: 6, emergency_meat: 8, survival_stew: 5,
                barricade_wood: 10, desperate_plea: 2
            },
            surviving_innkeeper: {
                refugee_food: 15, shared_water: 25, community_bread: 20,
                donated_soup: 12, hope_stew: 8, solidarity_ale: 10,
                shelter_supplies: 8, human_kindness: 1
            },

            // === DOOM WORLD - CORRUPTED NATURE ===
            poisoned_herbalist: {
                toxic_herbs: 12, corrupted_roots: 10, death_cap_mushroom: 8,
                plague_flower: 6, poison_extract: 5, black_moss: 8,
                tainted_water: 6, bitter_berries: 4
            },
            corrupted_druid: {
                dark_ritual_herbs: 10, blood_oak_bark: 6, curse_moss: 8,
                void_mushrooms: 5, shadow_vine: 7, corrupt_essence: 3,
                black_water: 5, cursed_berries: 4
            },
            mad_forager: {
                questionable_mushrooms: 15, mystery_berries: 12, weird_roots: 10,
                probably_safe_herbs: 8, definitely_not_poison: 6,
                dirty_water: 8, foraged_meat: 4
            },

            // === DOOM WORLD - STARVING FARMERS ===
            starving_farmer: {
                ash_wheat: 8, blighted_vegetables: 6, dead_soil: 10,
                withered_seeds: 15, failed_crop: 12, dust_grain: 5,
                dirty_water: 10, rat_meat: 4, desperation: 1
            },
            burned_farmer: {
                charred_crops: 6, fire_damaged_grain: 4, scorched_earth: 8,
                burned_seeds: 10, ash_water: 8,
                survivors_guilt: 1, hopeless_future: 1
            },
            refugee_farmer: {
                salvaged_seeds: 8, last_vegetables: 4, emergency_grain: 6,
                travel_rations: 10, dirty_water: 12, tent_cloth: 3,
                family_heirlooms: 2, memories_of_home: 1
            },

            // === DOOM WORLD - BROKEN MINERS ===
            trapped_miner: {
                cave_moss: 15, underground_water: 20, stone_soup: 8,
                desperation_pickaxe: 2, broken_lantern: 3, dark_ore: 6,
                raw_crystal: 4, sanity_fragments: 1
            },
            buried_miner: {
                rubble_ore: 10, collapse_stone: 15, crushed_gems: 4,
                broken_tools: 6, tomb_water: 12, dust_bread: 5,
                final_letter: 1, last_will: 1
            },
            dying_miner: {
                blood_ore: 8, pain_crystals: 6, cough_water: 15,
                black_lung_tonic: 3, last_rations: 8, farewell_note: 1
            },

            // === DOOM WORLD - HAUNTED HUNTERS ===
            hunted_hunter: {
                predator_meat: 6, fear_jerky: 8, panic_water: 12,
                broken_bow: 2, snapped_arrows: 15, torn_hide: 6,
                pursued_map: 2, running_shoes: 1
            },
            last_hunter: {
                final_kill_meat: 10, precious_hide: 5, survivor_water: 15,
                last_arrow: 8, worn_bow: 1, blood_knife: 2,
                hunters_pride: 1, extinction_notes: 1
            },
            desperate_trapper: {
                thin_fur: 8, scrawny_hide: 6, bone_traps: 10,
                starvation_bait: 5, dirty_water: 12, rat_jerky: 8,
                broken_snare: 6, desperation_knife: 2
            },

            // === DOOM WORLD - LOST TRAVELERS ===
            shell_shocked_traveler: {
                trauma_rations: 6, tears_water: 10, horror_memories: 5,
                blood_map: 2, broken_compass: 1, nightmare_journal: 3,
                survivors_guilt: 1, shattered_mind: 1
            },
            stranded_traveler: {
                last_supplies: 8, emergency_water: 12, survival_food: 6,
                useless_map: 2, broken_cart: 1, abandoned_goods: 4,
                hopeless_letter: 1
            },
            lost_wanderer: {
                confusion_bread: 5, madness_water: 8, delirium_berries: 6,
                wrong_map: 3, backwards_compass: 1, circular_path: 1,
                insanity: 1
            },

            // === DOOM WORLD - MARITIME DESPAIR ===
            drowned_sailor: {
                sea_corpse_meat: 6, salt_tears: 10, drowned_memories: 4,
                waterlogged_goods: 8, rusted_anchor: 2, broken_oar: 3,
                ocean_madness: 1
            },
            ghost_sailor: {
                phantom_rum: 8, spectral_fish: 10, ethereal_rope: 6,
                cursed_compass: 1, haunted_sail: 2, undead_tales: 3,
                eternal_regret: 1
            },
            mad_ferryman: {
                styx_water: 15, death_toll: 10, soul_ferry_ticket: 5,
                cursed_oar: 2, doom_boat_plank: 6,
                passage_coin: 20, final_crossing: 1
            },

            // === DOOM WORLD - VILLAGE ELDERS ===
            haunted_elder: {
                memory_bread: 8, wisdom_water: 12, prophecy_scroll: 4,
                doom_warnings: 6, ignored_advice: 5, told_you_so: 3,
                survivor_knowledge: 2, elder_regret: 1
            },
            grief_stricken_elder: {
                mourning_bread: 6, tears_water: 10, memorial_candles: 8,
                death_records: 15, farewell_letters: 10, lost_generation: 1
            },

            // === DOOM WORLD - SPECIAL CASES ===
            doomsayer: {
                prophecy_scrolls: 10, warning_signs: 15, apocalypse_proof: 8,
                end_times_guide: 5, survival_advice: 6,
                told_you_so_badge: 3, smug_satisfaction: 1
            },
            mad_captain: {
                command_hallucinations: 5, authority_delusions: 4, rank_insignia: 6,
                broken_orders: 8, dead_soldiers_list: 10,
                failure_report: 3, lost_honor: 1
            },
            insane_hermit: {
                madness_mushrooms: 15, delusion_water: 12, paranoia_herbs: 10,
                prophecy_ravings: 8, apocalypse_drawings: 6,
                truth_nobody_believed: 4, crazy_wisdom: 2
            },

            // === ADDITIONAL DOOM NPCs FROM doom-world-npcs.js ===
            broken_captain: {
                broken_command_scroll: 5, shattered_insignia: 3, defeat_orders: 6,
                deserters_list: 8, failure_medal: 2, last_rations: 10,
                dirty_water: 12, hardtack: 8, torn_banner: 3,
                rusty_sword: 2, dented_shield: 1
            },
            starving_jeweler: {
                worthless_gems: 10, tarnished_gold: 8, broken_necklace: 5,
                cracked_ring: 6, unsold_jewelry: 4,
                stale_bread: 3, dirty_water: 5, desperation: 1,
                last_heirloom: 1
            },
            ragged_tailor: {
                torn_cloth: 20, frayed_thread: 15, broken_needle: 8,
                patched_rags: 12, unfinished_garment: 6,
                dirty_water: 5, stale_bread: 3, shame: 1
            },
            mutinous_sailor: {
                stolen_rum: 6, betrayal_knife: 2, mutiny_map: 3,
                cursed_compass: 1, blood_soaked_sail: 2,
                rat_meat: 5, dirty_water: 8, guilt: 1,
                deserter_coin: 10
            }
        };

        // 🖤 Check if this is a doom NPC type - return dark inventory 💀
        if (doomInventories[npcType]) {
            return doomInventories[npcType];
        }

        // 🖤 Regular world inventories for normal NPCs 🛒
        const inventories = {
            // === HOSPITALITY / FOOD SERVICE ===
            innkeeper: {
                // Primary: food and drinks
                bread: 15, ale: 20, wine: 8, water: 25,
                cooked_meat: 10, cheese: 12, soup: 8,
                dried_meat: 6, fruit: 8, vegetables: 10,
                // Small personal items
                candle: 3, lantern_oil: 2
            },
            tavernkeeper: {
                ale: 25, wine: 15, water: 20, bread: 10,
                cooked_meat: 8, cheese: 8, dried_fish: 5,
                candle: 2
            },
            baker: {
                bread: 30, pastry: 15, flour: 20,
                cake: 5, biscuits: 12, pie: 8,
                water: 5, dried_fruit: 6
            },
            cook: {
                cooked_meat: 20, soup: 15, stew: 12,
                bread: 10, vegetables: 15, spices: 5,
                water: 8
            },

            // === WEAPONS / ARMOR ===
            blacksmith: {
                // Primary: weapons, armor, metal goods
                iron_sword: 3, steel_sword: 2, dagger: 5, axe: 4,
                iron_armor: 2, chainmail: 2, helmet: 4, shield: 3,
                iron_bar: 10, steel_bar: 5, nails: 20,
                hammer: 3, tongs: 2,
                // Small personal supplies
                water: 3, bread: 2
            },
            weaponsmith: {
                iron_sword: 5, steel_sword: 3, longsword: 2,
                dagger: 8, battle_axe: 2, mace: 3, spear: 4,
                whetstone: 10, sword_oil: 5,
                water: 2, bread: 1
            },
            armorsmith: {
                iron_armor: 4, chainmail: 3, plate_armor: 1,
                helmet: 6, shield: 5, gauntlets: 4, boots: 5,
                leather_strips: 10, iron_bar: 8,
                water: 2, bread: 1
            },

            // === HEALING / MEDICINE ===
            apothecary: {
                health_potion: 10, stamina_potion: 8, antidote: 6,
                poison_cure: 4, medicinal_herbs: 20, bandage: 15,
                salve: 8, tonic: 5, healing_salve: 6,
                water: 5, dried_herbs: 10
            },
            healer: {
                health_potion: 15, bandage: 20, medicinal_herbs: 25,
                antidote: 8, healing_salve: 10, blessed_water: 5,
                clean_water: 15, herbs: 12
            },
            herbalist: {
                medicinal_herbs: 30, herbs: 25, dried_herbs: 20,
                roots: 15, flowers: 12, moss: 10,
                healing_salve: 5, tonic: 3,
                water: 5, bread: 2
            },

            // === GENERAL MERCHANTS ===
            merchant: {
                // Varied stock - a bit of everything
                bread: 8, water: 10, dried_meat: 5, ale: 5,
                cloth: 8, rope: 5, candle: 10, lantern: 3,
                soap: 5, salt: 8, spices: 3,
                dagger: 2, leather_armor: 1
            },
            peddler: {
                trinket: 8, cloth: 5, ribbon: 10,
                candle: 6, soap: 4, comb: 5, mirror: 2,
                dried_fruit: 4, candy: 6, herbs: 3,
                bread: 2, water: 3
            },
            traveling_merchant: {
                silk: 3, spices: 5, exotic_goods: 2,
                perfume: 3, jewelry: 2, rare_herbs: 4,
                fine_wine: 3, tea: 5, incense: 4,
                dried_meat: 3, water: 3
            },
            general_store: {
                bread: 12, water: 15, dried_meat: 8, ale: 8,
                rope: 10, torch: 15, lantern: 5, lantern_oil: 10,
                candle: 20, soap: 8, cloth: 10, leather: 5,
                dagger: 3, hammer: 2, axe: 2
            },

            // === LUXURY / SPECIALTY ===
            jeweler: {
                gold_ring: 5, silver_ring: 8, necklace: 4,
                bracelet: 6, gems: 3, diamond: 1, ruby: 2,
                gold_chain: 3, pearl: 4, amulet: 2,
                water: 2, bread: 1
            },
            clothier: {
                cloth: 20, silk: 5, wool: 15, linen: 12,
                fine_clothes: 3, noble_attire: 1, cloak: 5,
                hat: 6, gloves: 8, boots: 4,
                thread: 15, needle: 10,
                water: 2, bread: 2
            },
            furrier: {
                fur: 15, wolf_pelt: 10, bear_pelt: 3,
                rabbit_fur: 20, fox_pelt: 5,
                fur_cloak: 3, fur_hat: 5, fur_gloves: 8,
                leather: 8, water: 3, dried_meat: 4
            },

            // === RESOURCES / CRAFTING ===
            miner: {
                iron_ore: 20, coal: 15, copper_ore: 12,
                gold_ore: 3, silver_ore: 5, stone: 25,
                pickaxe: 2, lantern: 3, rope: 5,
                water: 8, bread: 5, dried_meat: 3
            },
            lumberjack: {
                wood: 30, timber: 20, firewood: 25,
                planks: 15, oak_wood: 10, pine_wood: 12,
                axe: 3, saw: 2, rope: 5,
                water: 8, bread: 5, dried_meat: 4
            },
            farmer: {
                wheat: 25, vegetables: 20, fruit: 15,
                eggs: 12, milk: 8, cheese: 5,
                hay: 20, seeds: 15, chicken: 3,
                bread: 10, water: 12
            },
            fisherman: {
                fish: 25, dried_fish: 15, salted_fish: 10,
                crab: 5, oyster: 8, seaweed: 6,
                fishing_rod: 2, net: 3, rope: 5, bait: 15,
                water: 10, bread: 5
            },

            // === SERVICES ===
            stablemaster: {
                hay: 30, oats: 20, apple: 15, carrot: 12,
                horseshoe: 10, saddle: 3, bridle: 4, reins: 5,
                rope: 8, brush: 5,
                water: 10, bread: 3, dried_meat: 2
            },
            ferryman: {
                rope: 10, oar: 3, sail_cloth: 2, tar: 5,
                fish: 8, dried_fish: 5, water: 15,
                lantern: 3, oil: 5, bread: 4
            },

            // === KNOWLEDGE / SCHOLARLY ===
            scholar: {
                book: 5, scroll: 10, ink: 8, quill: 12,
                parchment: 15, map: 3, compass: 2,
                candle: 10, lantern: 2,
                water: 3, bread: 2
            },
            scribe: {
                parchment: 25, ink: 15, quill: 20,
                scroll: 12, wax_seal: 8, ribbon: 6,
                candle: 8, water: 3, bread: 2
            },

            // === RELIGIOUS ===
            priest: {
                holy_water: 10, incense: 8, candle: 15,
                prayer_beads: 5, holy_symbol: 3, scripture: 2,
                blessed_bandage: 5, healing_salve: 3,
                bread: 5, wine: 3, water: 5
            },

            // === AUTHORITY / GUARDS ===
            guard: {
                // Guards don't sell much, but might have some spare gear
                dagger: 1, torch: 3, rope: 2, bandage: 3,
                water: 5, bread: 3, ale: 2
            },

            // === SHADY / UNDERGROUND ===
            smuggler: {
                lockpick: 10, poison: 5, smoke_bomb: 4,
                dark_cloak: 3, rope: 8, grappling_hook: 2,
                contraband: 3, stolen_goods: 5,
                dried_meat: 4, water: 5, ale: 3
            },
            thief: {
                lockpick: 8, dagger: 3, dark_cloak: 2,
                rope: 5, smoke_bomb: 2, stolen_jewelry: 3,
                bread: 2, water: 3
            },
            fence: {
                stolen_goods: 12, stolen_jewelry: 5, contraband: 8,
                lockpick: 6, dark_cloak: 2, dagger: 3,
                gold_bar: 2, gems: 3,
                water: 3, dried_meat: 2
            },

            // === NOBILITY / OFFICIALS ===
            noble: {
                fine_wine: 8, perfume: 5, silk: 3, jewelry: 4,
                fine_clothes: 5, noble_attire: 2, gold_ring: 3,
                water: 5, bread: 3, cheese: 5
            },
            banker: {
                gold_bar: 5, silver_bar: 8, gems: 3,
                parchment: 10, ink: 5, wax_seal: 8,
                fine_clothes: 2, water: 3, bread: 2
            },
            tailor: {
                cloth: 25, silk: 8, fine_clothes: 6, noble_attire: 2,
                thread: 20, needle: 15, ribbon: 12,
                cloak: 5, hat: 8, gloves: 10,
                water: 3, bread: 2
            },
            herald: {
                scroll: 8, parchment: 12, ink: 6, quill: 10,
                horn: 2, banner: 3, wax_seal: 5,
                bread: 3, water: 5
            },

            // === MILITARY / SECURITY ===
            captain: {
                iron_sword: 3, steel_sword: 1, shield: 2, helmet: 3,
                chainmail: 1, dagger: 4, torch: 5, rope: 4,
                bandage: 8, water: 8, bread: 5, dried_meat: 4
            },
            sergeant: {
                iron_sword: 2, shield: 2, helmet: 2, dagger: 3,
                torch: 4, rope: 3, bandage: 6,
                water: 6, bread: 4, ale: 3
            },
            scout: {
                bow: 2, arrows: 30, dagger: 3, rope: 8,
                torch: 6, rations: 10, map: 2, compass: 1,
                water: 10, dried_meat: 8
            },

            // === MARITIME / WATER ===
            dockmaster: {
                rope: 25, canvas: 15, tar: 10, nails: 20,
                oar: 5, anchor: 2, sail_cloth: 8,
                fish: 12, salt: 10, water: 15, bread: 8
            },
            sailor: {
                rope: 15, canvas: 8, tar: 5, rum: 10,
                fish: 15, dried_fish: 10, salt: 8,
                dagger: 2, water: 12, bread: 6
            },
            harbormaster: {
                rope: 20, canvas: 12, tar: 8, map: 5,
                compass: 3, lantern: 6, lantern_oil: 10,
                fish: 10, water: 15, bread: 5, ale: 8
            },

            // === AGRICULTURE ===
            vintner: {
                wine: 25, grapes: 20, fine_wine: 8,
                barrel: 10, cork: 15, glass_bottle: 12,
                bread: 5, cheese: 8, water: 10
            },
            miller: {
                flour: 30, wheat: 25, grain: 20,
                bread: 15, oats: 12, hay: 10,
                water: 10, ale: 5
            },
            farmhand: {
                vegetables: 15, wheat: 12, hay: 10,
                eggs: 8, milk: 5, water: 8, bread: 6
            },
            shepherd: {
                wool: 25, cheese: 15, milk: 12,
                mutton: 10, leather: 8, sheepskin: 6,
                bread: 5, water: 8
            },
            beekeeper: {
                honey: 25, wax: 20, honeycomb: 15,
                mead: 8, candle: 12, water: 5, bread: 3
            },
            orchardist: {
                fruit: 25, apples: 20, pears: 15,
                cider: 12, dried_fruit: 10, jam: 8,
                water: 5, bread: 3
            },
            olive_presser: {
                oil: 25, olives: 20, soap: 15,
                lamp_oil: 12, vegetables: 8,
                water: 8, bread: 5
            },
            silkweaver: {
                silk: 20, fine_cloth: 15, thread: 25,
                ribbon: 18, fine_clothes: 5, noble_attire: 2,
                water: 3, bread: 2
            },

            // === HUNTING / TRAPPING ===
            hunter: {
                meat: 20, fur: 15, leather: 12, hide: 10,
                bow: 2, arrows: 25, dagger: 3, trap: 5,
                dried_meat: 8, water: 10, bread: 5
            },
            trapper: {
                fur: 20, leather: 15, hide: 12, rabbit_fur: 18,
                fox_pelt: 6, wolf_pelt: 4, trap: 8, rope: 10,
                dried_meat: 6, water: 8, bread: 4
            },

            // === MINING / QUARRY ===
            foreman: {
                pickaxe: 5, shovel: 4, rope: 15, lantern: 8,
                bandage: 10, iron_ore: 10, coal: 8,
                water: 12, bread: 8, ale: 6
            },
            gem_collector: {
                gems: 8, rare_gems: 3, crystals: 10,
                diamond: 1, ruby: 2, emerald: 2, sapphire: 2,
                pickaxe: 1, lantern: 2, water: 3, bread: 2
            },

            // === EXPLORATION / ADVENTURE ===
            adventurer: {
                iron_sword: 1, dagger: 2, shield: 1, helmet: 1,
                rope: 10, torch: 12, lantern: 3, bandage: 15,
                health_potion: 3, antidote: 2, rations: 8,
                water: 12, dried_meat: 8
            },
            explorer: {
                rope: 15, torch: 15, lantern: 4, compass: 2,
                map: 3, pickaxe: 2, bandage: 12,
                rations: 10, water: 15, dried_meat: 10
            },
            treasure_hunter: {
                lockpick: 8, rope: 12, torch: 10, lantern: 4,
                shovel: 3, pickaxe: 2, map: 5,
                bandage: 8, health_potion: 2,
                water: 10, dried_meat: 6
            },
            archaeologist: {
                pickaxe: 3, shovel: 4, brush: 8, trowel: 5,
                parchment: 12, ink: 6, scroll: 8, map: 4,
                torch: 8, lantern: 3, water: 10, bread: 5
            },
            diver: {
                rope: 10, knife: 3, net: 5, pearls: 8,
                oyster: 12, coral: 6, seaweed: 10,
                fish: 15, water: 8, bread: 4
            },
            pearl_hunter: {
                pearls: 15, oyster: 20, coral: 10,
                rope: 8, net: 4, knife: 2,
                fish: 10, water: 8, dried_fish: 5
            },
            ice_harvester: {
                ice: 25, salt: 15, fish: 10, dried_fish: 8,
                furs: 5, warm_clothing: 3,
                water: 10, bread: 5, dried_meat: 4
            },

            // === FOREST / NATURE ===
            alchemist: {
                health_potion: 8, mana_potion: 6, poison: 5,
                antidote: 8, elixir: 4, tonic: 6,
                herbs: 15, rare_herbs: 8, vials: 20,
                water: 5, bread: 3
            },
            forager: {
                herbs: 20, mushrooms: 25, berries: 18,
                roots: 12, flowers: 10, medicinal_herbs: 8,
                bread: 3, water: 5
            },
            druid: {
                medicinal_herbs: 20, rare_herbs: 10, healing_salve: 8,
                blessed_water: 6, incense: 5, herbs: 25,
                berries: 15, mushrooms: 12,
                bread: 4, water: 8
            },
            acolyte: {
                incense: 8, candle: 12, holy_water: 5,
                prayer_beads: 4, scripture: 2, healing_salve: 3,
                bread: 5, water: 8
            },
            hermit: {
                herbs: 15, medicinal_herbs: 10, mushrooms: 12,
                berries: 8, honey: 5, healing_salve: 4,
                bread: 2, water: 5
            },
            sage: {
                scroll: 8, book: 5, parchment: 12, ink: 6,
                herbs: 10, rare_herbs: 5, incense: 4,
                candle: 8, water: 5, bread: 3
            },
            wanderer: {
                rope: 5, torch: 6, rations: 8, map: 1,
                dagger: 1, herbs: 5, bandage: 4,
                water: 10, dried_meat: 6, bread: 4
            },

            // === HOSPITALITY / TRAVEL ===
            bartender: {
                ale: 25, wine: 12, rum: 8, mead: 6,
                bread: 8, cheese: 6, dried_meat: 5,
                water: 15
            },
            traveler: {
                rope: 4, torch: 5, rations: 6,
                map: 1, bandage: 3,
                water: 8, dried_meat: 4, bread: 3
            },
            bard: {
                lute: 1, instrument: 2, scroll: 5, book: 3,
                ale: 5, wine: 3, perfume: 2,
                bread: 4, water: 5, cheese: 3
            },
            caravan_master: {
                rope: 15, canvas: 10, lantern: 6, lantern_oil: 8,
                dried_meat: 15, dried_fruit: 12, salt: 10,
                cloth: 8, spices: 5, water: 20, bread: 10
            },
            mountain_guide: {
                rope: 20, torch: 15, lantern: 5, pickaxe: 3,
                warm_clothing: 4, furs: 3, bandage: 10,
                rations: 15, water: 15, dried_meat: 10
            },
            lighthouse_keeper: {
                lantern_oil: 25, lantern: 5, candle: 20,
                rope: 12, canvas: 8, fish: 15,
                water: 12, bread: 8, dried_fish: 10
            },

            // === VILLAGE ELDERS / LEADERS ===
            elder: {
                bread: 10, cheese: 8, wine: 5, honey: 6,
                herbs: 8, medicinal_herbs: 5, scroll: 4,
                candle: 10, water: 12
            },
            // 🖤💀 NEW: Royal Advisor - court sage for Royal Capital (distinct from village elders) 💀
            royal_advisor: {
                scroll: 15, ink: 10, quill: 8, parchment: 12,
                fine_wine: 5, wine: 8, bread: 5, cheese: 3,
                candle: 12, lantern_oil: 6, book: 4, map: 3,
                seal_wax: 6, royal_decree: 2
            },
            // 🖤💀 NEW: Chieftain - northern village leader for Frostholm 💀
            chieftain: {
                furs: 15, leather: 10, hide: 8, meat: 12,
                dried_meat: 8, warm_clothing: 5, wolf_pelt: 3,
                bread: 5, ale: 8, water: 10,
                axe: 3, rope: 6, torch: 10
            },
            villager: {
                bread: 8, vegetables: 10, eggs: 6, milk: 5,
                cheese: 4, water: 10, ale: 3
            },
            boatwright: {
                planks: 20, timber: 15, rope: 18, tar: 12,
                nails: 25, canvas: 10, oar: 6,
                water: 8, bread: 5
            },
            mason: {
                stone: 30, bricks: 25, mortar: 20,
                chisel: 8, hammer: 5, trowel: 6,
                water: 8, bread: 5
            },

            // 🏰 GRAND MARKET MERCHANT - Royal Capital only 👑
            // Has access to ALL goods from across the realm
            grand_market_merchant: {
                // Food & Drink
                bread: 20, cooked_meat: 15, dried_meat: 10, cheese: 12,
                ale: 15, wine: 10, fine_wine: 5, water: 25,
                // Weapons & Armor
                iron_sword: 5, steel_sword: 3, dagger: 8,
                iron_armor: 3, chainmail: 2, shield: 4, helmet: 5,
                // Medicine
                health_potion: 12, antidote: 8, bandage: 20, healing_salve: 10,
                // Resources
                iron_bar: 15, wood: 20, cloth: 15, leather: 10,
                // Luxury
                silk: 5, spices: 8, jewelry: 3, perfume: 4,
                // Tools & Supplies
                rope: 15, torch: 20, lantern: 8, candle: 25
            }
        };

        return inventories[npcType] || { bread: 3, water: 5 };
    },

    getItemPrice(itemId) {
        // 🐟💰 SPECIAL CASE: Harbor Dealings quest - small premium for fish in Greendale
        if (itemId === 'fish' &&
            typeof QuestSystem !== 'undefined' &&
            QuestSystem.activeQuests?.act1_quest4 &&
            typeof game !== 'undefined' &&
            game.currentLocation?.id === 'greendale') {
            // Return 19g base price for fish (normally 8g)
            // Player will get 50% = 9.5g per fish in trade value
            // With 10 fish at 9.5g each = 95g total value (vs 84g cost = 11g profit)
            console.log('🐟 QUEST PRICING: Fish valued at 19g base (quest active, Greendale)');
            return 19;
        }

        // 🖤💀 PRIORITY 1: Check ItemDatabase - the authoritative source 💀
        if (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem) {
            const item = ItemDatabase.getItem(itemId);
            if (item?.basePrice !== undefined) {
                return item.basePrice;
            }
        }

        // 💎 PRIORITY 2: Check GameConfig price list 📋
        const categories = ['consumables', 'resources', 'tools', 'luxury'];
        for (const category of categories) {
            const items = GameConfig?.items?.[category];
            if (items && items[itemId]) {
                return items[itemId].basePrice || 10;
            }
        }

        // 💰 PRIORITY 3: Fallback values for common items 🪙
        const fallbackPrices = {
            gold: 1, // 🖤💀 1 gold = 1 gold (not 5!) 💀
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

    // 🖤💀 INVENTORY PRIORITY SORTING - Gold → Weather → Food → Water → Everything else 💰
    _sortInventoryByPriority(items) {
        const getPriority = (itemId) => {
            const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
            const id = itemId.toLowerCase();
            const category = (item?.category || '').toLowerCase();
            const name = (item?.name || '').toLowerCase();

            // 0: Gold/Currency - ALWAYS first
            if (id === 'gold' || id.includes('coin') || category === 'currency') return 0;

            // 1: Weather gear - Protection from elements
            const weatherKeywords = ['cloak', 'coat', 'umbrella', 'hat', 'warm', 'hood', 'scarf', 'boots', 'gloves', 'rain', 'snow', 'weather'];
            if (weatherKeywords.some(k => id.includes(k) || name.includes(k))) return 1;

            // 2: Food - Sustenance items
            const foodKeywords = ['bread', 'meat', 'fish', 'cheese', 'fruit', 'vegetable', 'apple', 'berry', 'cake', 'pie', 'stew', 'soup', 'cooked', 'ration', 'jerky', 'pastry', 'honey'];
            if (foodKeywords.some(k => id.includes(k) || name.includes(k)) || category === 'food' || category === 'consumables') return 2;

            // 3: Water/Drinks - Hydration
            const drinkKeywords = ['water', 'ale', 'wine', 'mead', 'drink', 'potion', 'flask', 'bottle'];
            if (drinkKeywords.some(k => id.includes(k) || name.includes(k)) || category === 'drinks') return 3;

            // 4: Tools - Gathering/Crafting
            if (category === 'tools' || category === 'tool') return 4;

            // 5: Weapons - Combat
            if (category === 'weapons' || category === 'weapon') return 5;

            // 6: Armor - Protection
            if (category === 'armor' || category === 'equipment') return 6;

            // 7: Resources/Materials
            if (category === 'resources' || category === 'materials') return 7;

            // 8: Everything else
            return 8;
        };

        return items.sort((a, b) => {
            const priorityA = getPriority(a[0]);
            const priorityB = getPriority(b[0]);

            if (priorityA !== priorityB) return priorityA - priorityB;

            // Same priority - sort by name alphabetically
            const itemA = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(a[0]) : null;
            const itemB = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(b[0]) : null;
            return (itemA?.name || a[0]).localeCompare(itemB?.name || b[0]);
        });
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

        // 🖤 Event delegation for all trade window interactions
        // No inline onclick handlers = no XSS vulnerabilities = happy Unity 💀
        const tradeWindow = document.getElementById('npc-trade-window');
        if (tradeWindow) {
            tradeWindow.addEventListener('click', (e) => {
                const target = e.target;

                // 📦 Inventory item click - add to offer
                const inventoryItem = target.closest('.inventory-item');
                if (inventoryItem) {
                    const itemId = inventoryItem.dataset.item;
                    const side = inventoryItem.dataset.side;
                    if (itemId && side) this.addToOffer(itemId, side);
                    return;
                }

                // 📜 Quest accept button
                const questBtn = target.closest('.accept-quest-btn');
                if (questBtn && questBtn.dataset.questId) {
                    this.acceptQuest(questBtn.dataset.questId);
                    return;
                }

                // ⚡ Event option button
                const eventBtn = target.closest('.event-option-btn');
                if (eventBtn && eventBtn.dataset.eventOption) {
                    this.handleEventOption(eventBtn.dataset.eventOption);
                    return;
                }

                // 🗡️ Robbery action button
                const robberyBtn = target.closest('.robbery-btn');
                if (robberyBtn && robberyBtn.dataset.robberyAction) {
                    const action = robberyBtn.dataset.robberyAction;
                    const amount = robberyBtn.dataset.robberyAmount ?
                        parseInt(robberyBtn.dataset.robberyAmount, 10) : undefined;
                    this.handleRobbery(action, amount);
                    return;
                }

                // 🛒 Click on inventory item - opens TradeCartPanel
                // 🖤 BULK SHORTCUTS: Shift+Click = 5, Ctrl+Click = 25 💀
                const clickableItem = target.closest('.clickable-item');
                if (clickableItem) {
                    const action = clickableItem.dataset.action;
                    const itemId = clickableItem.dataset.item;
                    const price = parseInt(clickableItem.dataset.price, 10) || 0;
                    const stock = parseInt(clickableItem.dataset.stock, 10) || 1;
                    const itemName = clickableItem.dataset.itemName || itemId;
                    const itemIcon = clickableItem.dataset.itemIcon || '📦';
                    const itemWeight = parseFloat(clickableItem.dataset.itemWeight) || 1;

                    // 🖤 Bulk quantity from modifier keys: Ctrl = 25, Shift = 5, Normal = 1 💀
                    let bulkQty = 1;
                    if (e.ctrlKey || e.metaKey) bulkQty = 25;
                    else if (e.shiftKey) bulkQty = 5;

                    // 🛒 Open TradeCartPanel and add item
                    if (typeof TradeCartPanel !== 'undefined') {
                        // Ensure cart is open with current merchant
                        if (!TradeCartPanel.isOpen) {
                            TradeCartPanel.open(this.currentNPC, action);
                        }
                        // Add item to cart (with bulk quantity support)
                        TradeCartPanel.addItem(itemId, price, stock, {
                            name: itemName,
                            icon: itemIcon,
                            weight: itemWeight,
                            quantity: bulkQty // 🖤 Bulk add support 💀
                        });
                        // Visual feedback
                        clickableItem.classList.add('added-to-cart');
                        setTimeout(() => clickableItem.classList.remove('added-to-cart'), 300);
                    } else {
                        // Fallback to old behavior
                        this.addToOffer(itemId, clickableItem.dataset.side);
                    }
                    return;
                }
            });
        }
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
