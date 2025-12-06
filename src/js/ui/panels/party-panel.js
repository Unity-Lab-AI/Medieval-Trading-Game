// ═══════════════════════════════════════════════════════════════
// PARTY PANEL - manage your traveling companions
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PartyPanel = {
    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('🤝 PartyPanel: Initializing party management UI');
        this.createPartyPanel();
    },

    // ═══════════════════════════════════════════════════════════════
    // PANEL CREATION
    // ═══════════════════════════════════════════════════════════════
    createPartyPanel() {
        // Check if panel already exists
        let panel = document.getElementById('party-panel');
        if (panel) return;

        // Create panel
        panel = document.createElement('div');
        panel.id = 'party-panel';
        panel.className = 'game-panel';
        panel.style.display = 'none';

        panel.innerHTML = `
            <div class="panel-header">
                <h2>🤝 Party</h2>
                <button class="close-btn" onclick="PartyPanel.closePanel()">×</button>
            </div>
            <div class="panel-content" id="party-panel-content">
                <div class="party-summary" id="party-summary">
                    <!-- Summary info will go here -->
                </div>
                <div class="party-members-list" id="party-members-list">
                    <!-- Party members will go here -->
                </div>
                <div class="party-actions">
                    <button class="panel-btn" onclick="EmployeeSystem.showHiringInterface()">👥 Hire Companions</button>
                    <button class="panel-btn" onclick="PartyPanel.showAllCompanions()">📋 Manage All</button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Make draggable
        if (typeof DraggablePanels !== 'undefined') {
            DraggablePanels.makeDraggable(panel);
        }

        console.log('🤝 PartyPanel created');
    },

    // ═══════════════════════════════════════════════════════════════
    // PANEL CONTROL
    // ═══════════════════════════════════════════════════════════════
    openPanel() {
        const panel = document.getElementById('party-panel');
        if (!panel) {
            this.init();
            return this.openPanel();
        }

        panel.style.display = 'block';
        this.updatePanel();

        // Register with PanelManager if available
        if (typeof PanelManager !== 'undefined') {
            PanelManager.registerPanel('party-panel');
        }
    },

    closePanel() {
        const panel = document.getElementById('party-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    },

    togglePanel() {
        const panel = document.getElementById('party-panel');
        if (!panel || panel.style.display === 'none') {
            this.openPanel();
        } else {
            this.closePanel();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // PANEL UPDATE
    // ═══════════════════════════════════════════════════════════════
    updatePanel() {
        this.updatePartySummary();
        this.updatePartyMembersList();
    },

    updatePartySummary() {
        const summary = document.getElementById('party-summary');
        if (!summary) return;

        if (typeof CompanionSystem === 'undefined') {
            summary.innerHTML = '<p class="error">CompanionSystem not loaded!</p>';
            return;
        }

        const travelingCompanions = CompanionSystem.getTravelingCompanions();
        const allCompanions = CompanionSystem.getAllCompanions();
        const partySize = CompanionSystem.getPartySize();
        const maxCarry = CompanionSystem.getPartyCarryWeight();
        const currentCarry = CompanionSystem.getPartyCurrentWeight();
        const combatPower = CompanionSystem.getPartyCombatPower();

        summary.innerHTML = `
            <div class="party-stats-grid">
                <div class="party-stat">
                    <span class="stat-icon">👥</span>
                    <div class="stat-info">
                        <span class="stat-label">Party Size</span>
                        <span class="stat-value">${partySize} (You + ${travelingCompanions.length})</span>
                    </div>
                </div>
                <div class="party-stat">
                    <span class="stat-icon">⚔️</span>
                    <div class="stat-info">
                        <span class="stat-label">Combat Power</span>
                        <span class="stat-value">${combatPower}</span>
                    </div>
                </div>
                <div class="party-stat">
                    <span class="stat-icon">🎒</span>
                    <div class="stat-info">
                        <span class="stat-label">Carry Weight</span>
                        <span class="stat-value">${currentCarry} / ${maxCarry}</span>
                    </div>
                </div>
                <div class="party-stat">
                    <span class="stat-icon">🏠</span>
                    <div class="stat-info">
                        <span class="stat-label">Total Companions</span>
                        <span class="stat-value">${allCompanions.length} (${travelingCompanions.length} traveling)</span>
                    </div>
                </div>
            </div>
        `;
    },

    updatePartyMembersList() {
        const list = document.getElementById('party-members-list');
        if (!list) return;

        if (typeof CompanionSystem === 'undefined') {
            list.innerHTML = '<p class="error">CompanionSystem not loaded!</p>';
            return;
        }

        const companions = CompanionSystem.getTravelingCompanions();

        if (companions.length === 0) {
            list.innerHTML = `
                <div class="empty-party">
                    <p>🤷 No traveling companions</p>
                    <p class="hint">Hire companions and set them to Travel mode to join your party!</p>
                </div>
            `;
            return;
        }

        list.innerHTML = '<h3>Traveling Companions</h3>';

        companions.forEach(companion => {
            const card = this.createCompanionCard(companion);
            list.appendChild(card);
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPANION CARD CREATION
    // ═══════════════════════════════════════════════════════════════
    createCompanionCard(companion) {
        const companionType = typeof EmployeeSystem !== 'undefined' ?
            EmployeeSystem.employeeTypes[companion.type] : null;

        const card = document.createElement('div');
        card.className = 'companion-card';
        card.dataset.companionId = companion.id;

        const healthPercent = ((companion.health || 60) / (companion.maxHealth || 60)) * 100;
        const healthColor = healthPercent > 60 ? '#4caf50' : healthPercent > 30 ? '#ff9800' : '#f44336';

        const carryPercent = ((companion.carryWeight || 0) / (companion.maxCarryWeight || 50)) * 100;
        const carryColor = carryPercent > 80 ? '#f44336' : carryPercent > 60 ? '#ff9800' : '#4caf50';

        card.innerHTML = `
            <div class="companion-card-header">
                <span class="companion-icon">${companionType?.icon || '👤'}</span>
                <div class="companion-name-section">
                    <h4 class="companion-name">${this.escapeHtml(companion.name)}</h4>
                    <span class="companion-type">${companionType?.name || 'Unknown'} (Lv ${companion.level || 1})</span>
                </div>
                <div class="companion-status">
                    ${companion.health <= 0 ? '<span class="status-dead">💀 Dead</span>' : '<span class="status-alive">✅ Alive</span>'}
                </div>
            </div>

            <div class="companion-stats-grid">
                <div class="companion-stat">
                    <span class="stat-label">Health:</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${healthPercent}%; background: ${healthColor};"></div>
                        </div>
                        <span class="stat-text">${companion.health || 60} / ${companion.maxHealth || 60}</span>
                    </div>
                </div>

                <div class="companion-stat">
                    <span class="stat-label">Carry:</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${carryPercent}%; background: ${carryColor};"></div>
                        </div>
                        <span class="stat-text">${companion.carryWeight || 0} / ${companion.maxCarryWeight || 50}</span>
                    </div>
                </div>

                <div class="companion-stat-row">
                    <div class="stat-item">
                        <span class="stat-icon">⚔️</span>
                        <span class="stat-value">${companion.attack || 10}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🛡️</span>
                        <span class="stat-value">${companion.defense || 5}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">💰</span>
                        <span class="stat-value">${companion.gold || 0}g</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">😊</span>
                        <span class="stat-value">${companion.morale || 75}%</span>
                    </div>
                </div>
            </div>

            <div class="companion-actions">
                <button class="companion-btn" onclick="PartyPanel.viewCompanionInventory('${companion.id}')">
                    🎒 Inventory
                </button>
                <button class="companion-btn" onclick="PartyPanel.healCompanion('${companion.id}')">
                    💚 Heal
                </button>
                <button class="companion-btn" onclick="PartyPanel.sendToProperty('${companion.id}')">
                    🏠 Send to Property
                </button>
                <button class="companion-btn secondary" onclick="EmployeeSystem.showEmployeeDetails('${companion.id}')">
                    📋 Details
                </button>
            </div>
        `;

        return card;
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPANION ACTIONS
    // ═══════════════════════════════════════════════════════════════

    viewCompanionInventory(companionId) {
        const companion = typeof CompanionSystem !== 'undefined' ?
            CompanionSystem.getCompanion(companionId) : null;

        if (!companion) {
            addMessage('Companion not found!');
            return;
        }

        // Create inventory display
        let inventoryHtml = `
            <div class="companion-inventory-view">
                <h3>${companion.name}'s Inventory</h3>
                <div class="inventory-stats">
                    <p>Carry Weight: ${companion.carryWeight || 0} / ${companion.maxCarryWeight || 50}</p>
                    <p>Gold: ${companion.gold || 0}</p>
                </div>
                <div class="inventory-grid">
        `;

        const inventory = companion.inventory || {};
        if (Object.keys(inventory).length === 0) {
            inventoryHtml += '<p class="empty-message">Inventory is empty</p>';
        } else {
            for (const [itemId, quantity] of Object.entries(inventory)) {
                if (quantity <= 0) continue;

                const item = typeof ItemDatabase !== 'undefined' ?
                    ItemDatabase.getItem(itemId) : { name: itemId, icon: '📦', weight: 1 };

                inventoryHtml += `
                    <div class="inventory-item">
                        <span class="item-icon">${item.icon || '📦'}</span>
                        <span class="item-name">${this.escapeHtml(item.name || itemId)}</span>
                        <span class="item-quantity">x${quantity}</span>
                        <button class="item-transfer-btn" onclick="PartyPanel.transferToPlayer('${companionId}', '${itemId}', 1)">
                            ← Take
                        </button>
                    </div>
                `;
            }
        }

        inventoryHtml += `
                </div>
                <h4>Give Item to ${companion.name}</h4>
                <div class="player-inventory-grid">
        `;

        // Show player inventory
        const playerInventory = game?.player?.inventory || {};
        if (Object.keys(playerInventory).length === 0) {
            inventoryHtml += '<p class="empty-message">You have no items to give</p>';
        } else {
            for (const [itemId, quantity] of Object.entries(playerInventory)) {
                if (quantity <= 0) continue;

                const item = typeof ItemDatabase !== 'undefined' ?
                    ItemDatabase.getItem(itemId) : { name: itemId, icon: '📦', weight: 1 };

                inventoryHtml += `
                    <div class="inventory-item">
                        <span class="item-icon">${item.icon || '📦'}</span>
                        <span class="item-name">${this.escapeHtml(item.name || itemId)}</span>
                        <span class="item-quantity">x${quantity}</span>
                        <button class="item-transfer-btn" onclick="PartyPanel.transferToCompanion('${companionId}', '${itemId}', 1)">
                            → Give
                        </button>
                    </div>
                `;
            }
        }

        inventoryHtml += `
                </div>
            </div>
        `;

        // Show in modal
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🎒 Companion Inventory',
                content: inventoryHtml,
                buttons: [
                    { text: 'Close', className: 'secondary', onClick: () => ModalSystem.hide() }
                ]
            });
        } else {
            addMessage('Inventory system not available');
        }
    },

    transferToPlayer(companionId, itemId, quantity) {
        if (typeof CompanionSystem === 'undefined') return;

        const success = CompanionSystem.transferItem('companion', companionId, 'player', null, itemId, quantity);
        if (success) {
            addMessage(`Received ${quantity}x ${itemId} from companion`);
            this.viewCompanionInventory(companionId); // Refresh
            this.updatePanel();
        } else {
            addMessage('Failed to transfer item!');
        }
    },

    transferToCompanion(companionId, itemId, quantity) {
        if (typeof CompanionSystem === 'undefined') return;

        const success = CompanionSystem.transferItem('player', null, 'companion', companionId, itemId, quantity);
        if (success) {
            addMessage(`Gave ${quantity}x ${itemId} to companion`);
            this.viewCompanionInventory(companionId); // Refresh
            this.updatePanel();
        } else {
            addMessage('Companion cannot carry that much weight!');
        }
    },

    healCompanion(companionId) {
        const companion = typeof CompanionSystem !== 'undefined' ?
            CompanionSystem.getCompanion(companionId) : null;

        if (!companion) {
            addMessage('Companion not found!');
            return;
        }

        // Check for healing items in player inventory
        const healingItems = ['health_potion', 'bread', 'cheese', 'cooked_meat', 'apple'];
        const playerInventory = game?.player?.inventory || {};

        let healedWith = null;
        let healAmount = 0;

        for (const itemId of healingItems) {
            if (playerInventory[itemId] > 0) {
                const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
                healAmount = item?.effects?.health || 20;
                healedWith = itemId;
                break;
            }
        }

        if (!healedWith) {
            addMessage('No healing items in inventory!');
            return;
        }

        // Use item
        game.player.inventory[healedWith]--;
        if (game.player.inventory[healedWith] <= 0) {
            delete game.player.inventory[healedWith];
        }

        // Heal companion
        const actualHeal = Math.min(healAmount, companion.maxHealth - companion.health);
        companion.health = Math.min(companion.maxHealth, companion.health + healAmount);

        addMessage(`Used ${healedWith} to heal ${companion.name} for ${actualHeal} HP!`);

        this.updatePanel();
    },

    sendToProperty(companionId) {
        if (typeof EmployeeSystem === 'undefined') {
            addMessage('Property system not available!');
            return;
        }

        // Show assignment interface from EmployeeSystem
        EmployeeSystem.showAssignmentInterface(companionId);
    },

    showAllCompanions() {
        // Show all companions (traveling + property assigned) in EmployeeSystem UI
        if (typeof EmployeeSystem !== 'undefined') {
            EmployeeSystem.updateEmployeeDisplay();
            addMessage('Showing all companions in Employee panel');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════
    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL EXPOSURE
// ═══════════════════════════════════════════════════════════════
window.PartyPanel = PartyPanel;

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PartyPanel.init());
} else {
    PartyPanel.init();
}

console.log('🤝 PartyPanel loaded');
