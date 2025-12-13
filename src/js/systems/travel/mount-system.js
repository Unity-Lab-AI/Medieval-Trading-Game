/**
 * ========================================
 * MOUNT SYSTEM - Medieval Trading Game
 * ========================================
 * Mounts for faster travel and increased cargo
 * ========================================
 */

const MountSystem = {
    // your companions on this endless road - beasts as doomed as you
    mounts: {
        // starter tier - broke and desperate
        donkey: {
            name: 'Donkey',
            icon: '🫏',
            tier: 'basic',
            price: 50,
            stats: {
                speed: 1.2,           // how fast you run from your problems
                cargoCapacity: 100,   // burdens this creature must bear
                stamina: 80,          // how long before it collapses like everything else
                staminaDrain: 1.0     // watching life drain away, one step at a time
            },
            terrain: {
                road: 1.0,
                dirt: 0.9,
                mountain: 0.7,
                forest: 0.8,
                desert: 0.8,
                swamp: 0.5
            },
            maintenance: {
                feedCost: 2,          // daily price of keeping something alive
                feedType: 'hay',
                stableCost: 1         // rent for a temporary shelter from darkness
            },
            description: 'A reliable, if slow, beast of burden.'
        },
        mule: {
            name: 'Mule',
            icon: '🫏',
            tier: 'basic',
            price: 80,
            stats: {
                speed: 1.3,
                cargoCapacity: 150,
                stamina: 100,
                staminaDrain: 0.9
            },
            terrain: {
                road: 1.0,
                dirt: 0.95,
                mountain: 0.8,
                forest: 0.85,
                desert: 0.85,
                swamp: 0.6
            },
            maintenance: {
                feedCost: 3,
                feedType: 'hay',
                stableCost: 2
            },
            description: 'Strong and surefooted, excellent for traders.'
        },
        horse: {
            name: 'Horse',
            icon: '🐴',
            tier: 'standard',
            price: 200,
            stats: {
                speed: 1.8,           // fast enough to outrun regret (almost)
                cargoCapacity: 80,
                stamina: 120,
                staminaDrain: 1.2     // burns bright, fades fast
            },
            terrain: {
                road: 1.2,
                dirt: 1.0,
                mountain: 0.5,        // mountains break even the swiftest
                forest: 0.7,
                desert: 0.7,
                swamp: 0.3            // swamps swallow hooves like hope
            },
            maintenance: {
                feedCost: 5,
                feedType: 'oats',
                stableCost: 5
            },
            description: 'Fast and elegant, the standard mount for travelers.'
        },
        warhorse: {
            name: 'Warhorse',
            icon: '🐎',
            tier: 'premium',
            price: 500,
            stats: {
                speed: 1.6,
                cargoCapacity: 100,
                stamina: 150,
                staminaDrain: 1.0,
                combatBonus: 10      // trained to inflict suffering
            },
            terrain: {
                road: 1.1,
                dirt: 1.0,
                mountain: 0.6,
                forest: 0.8,
                desert: 0.8,
                swamp: 0.4
            },
            maintenance: {
                feedCost: 8,
                feedType: 'premium_feed',
                stableCost: 10
            },
            description: 'Bred for battle, fearless in combat.'
        },
        camel: {
            name: 'Camel',
            icon: '🐫',
            tier: 'standard',
            price: 250,
            stats: {
                speed: 1.4,
                cargoCapacity: 200,
                stamina: 180,
                staminaDrain: 0.6
            },
            terrain: {
                road: 0.9,
                dirt: 0.9,
                mountain: 0.4,
                forest: 0.5,
                desert: 1.5,          // born for wasteland wandering
                swamp: 0.2            // even camels hate the marsh
            },
            maintenance: {
                feedCost: 3,
                feedType: 'hay',
                stableCost: 3
            },
            description: 'The ship of the desert, excellent for arid regions.'
        },
        ox: {
            name: 'Ox',
            icon: '🐂',
            tier: 'standard',
            price: 150,
            stats: {
                speed: 0.9,           // slow like a funeral march
                cargoCapacity: 300,   // carries the weight of the world (and your bullshit)
                stamina: 200,
                staminaDrain: 0.5
            },
            terrain: {
                road: 1.0,
                dirt: 1.0,
                mountain: 0.6,
                forest: 0.7,
                desert: 0.5,
                swamp: 0.5
            },
            maintenance: {
                feedCost: 4,
                feedType: 'hay',
                stableCost: 2
            },
            description: 'Slow but can carry enormous loads.'
        },
        elephant: {
            name: 'Elephant',
            icon: '🐘',
            tier: 'exotic',
            price: 2000,
            stats: {
                speed: 1.1,
                cargoCapacity: 500,
                stamina: 250,
                staminaDrain: 0.8,
                combatBonus: 20
            },
            terrain: {
                road: 0.9,
                dirt: 0.9,
                mountain: 0.3,
                forest: 0.8,
                desert: 0.6,
                swamp: 0.4
            },
            maintenance: {
                feedCost: 20,
                feedType: 'exotic_feed',
                stableCost: 30
            },
            description: 'A majestic beast that commands respect.'
        },
        griffon: {
            name: 'Griffon',
            icon: '🦅',
            tier: 'legendary',
            price: 10000,
            stats: {
                speed: 3.0,           // soar above this dying world - if only you could escape yourself too
                cargoCapacity: 50,
                stamina: 100,
                staminaDrain: 2.0,    // freedom burns like fire
                canFly: true          // wings to escape, nowhere to go
            },
            terrain: {
                road: 1.5,
                dirt: 1.5,
                mountain: 2.0,        // peaks bow before wings
                forest: 1.2,
                desert: 1.5,
                swamp: 1.5            // flies above the filth
            },
            maintenance: {
                feedCost: 50,
                feedType: 'meat',
                stableCost: 100
            },
            description: 'A mythical flying beast. Requires special handling.'
        }
    },

    // creatures you've claimed as companions on this lonely road
    ownedMounts: [],

    // the one bearing your burdens today
    activeMount: null,

    // their suffering, quantified
    mountStats: {},

    // boot up this wheel of misery
    init() {
        this.loadMounts();
        this.createStyles();
        this.setupEventListeners();

        console.log('🐴 MountSystem initialized');
    },

    // load your stable from the save file
    loadMounts() {
        if (typeof game !== 'undefined' && game.player) {
            this.ownedMounts = game.player.mounts || [];
            this.activeMount = game.player.activeMount || null;
            this.mountStats = game.player.mountStats || {};
        }
    },

    // save this collection of suffering
    saveMounts() {
        if (typeof game !== 'undefined' && game.player) {
            game.player.mounts = this.ownedMounts;
            game.player.activeMount = this.activeMount;
            game.player.mountStats = this.mountStats;
        }
    },

    // listen for the march of time and consequences
    setupEventListeners() {
        if (typeof EventBus !== 'undefined') {
            // another dawn, another drain on your gold
            EventBus.on('time:newDay', () => {
                this.processDailyMaintenance();
            });

            // the journey begins - watch them struggle
            EventBus.on('travel:started', (data) => {
                this.onTravelStarted(data);
            });

            // arrival - exhausted, damaged, but still breathing
            EventBus.on('travel:completed', (data) => {
                this.onTravelCompleted(data);
            });
        }
    },

    // purchase a companion (really just buying their servitude)
    buyMount(mountId, stableLocation = 'current') {
        const mount = this.mounts[mountId];
        if (!mount) {
            this.showNotification('Invalid mount!', 'error');
            return false;
        }

        if (typeof game !== 'undefined' && game.player) {
            if (game.player.gold < mount.price) {
                this.showNotification(`Not enough gold! Need ${mount.price}g`, 'error');
                return false;
            }

            // watch your wealth bleed away
            game.player.gold -= mount.price;

            // birth a new mount into this cruel world
            const mountInstance = {
                id: `${mountId}_${Date.now()}`,
                type: mountId,
                name: mount.name,
                purchaseDate: Date.now(),
                location: stableLocation
            };

            // set them up for inevitable decline
            this.mountStats[mountInstance.id] = {
                health: 100,
                happiness: 100,
                stamina: mount.stats.stamina,
                maxStamina: mount.stats.stamina,
                experience: 0,
                level: 1
            };

            this.ownedMounts.push(mountInstance);
            this.saveMounts();

            this.showNotification(`Purchased ${mount.name} for ${mount.price} gold!`, 'success');

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('mount:purchased', { mountId, mountInstance });
            }

            return true;
        }

        return false;
    },

    // betray a companion for half their worth
    sellMount(instanceId) {
        const mountInstance = this.ownedMounts.find(m => m.id === instanceId);
        if (!mountInstance) {
            this.showNotification('Mount not found!', 'error');
            return false;
        }

        if (this.activeMount === instanceId) {
            this.showNotification('Cannot sell active mount!', 'error');
            return false;
        }

        const mount = this.mounts[mountInstance.type];
        const sellPrice = Math.floor(mount.price * 0.5); // half price for a broken bond

        if (typeof game !== 'undefined' && game.player) {
            game.player.gold += sellPrice;
        }

        // erase them from your life like they never mattered
        this.ownedMounts = this.ownedMounts.filter(m => m.id !== instanceId);
        delete this.mountStats[instanceId];
        this.saveMounts();

        this.showNotification(`Sold ${mountInstance.name} for ${sellPrice} gold`, 'success');

        return true;
    },

    // choose which beast bears your weight today
    setActiveMount(instanceId) {
        if (instanceId === null) {
            this.activeMount = null;
            this.saveMounts();
            this.showNotification('Now traveling on foot', 'info');
            return true;
        }

        const mountInstance = this.ownedMounts.find(m => m.id === instanceId);
        if (!mountInstance) {
            this.showNotification('Mount not found!', 'error');
            return false;
        }

        const stats = this.mountStats[instanceId];
        // check if they even exist (sanity in a dying world)
        if (!stats) {
            this.showNotification('Mount stats not found!', 'error');
            return false;
        }
        if (stats.health <= 0) {
            this.showNotification('This mount is too injured to ride!', 'error');
            return false;
        }

        this.activeMount = instanceId;
        this.saveMounts();

        this.showNotification(`Now riding ${mountInstance.name}`, 'success');

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('mount:activated', { mountId: instanceId });
        }

        return true;
    },

    // Get active mount data
    getActiveMount() {
        if (!this.activeMount) return null;

        const instance = this.ownedMounts.find(m => m.id === this.activeMount);
        if (!instance) return null;

        return {
            instance,
            definition: this.mounts[instance.type],
            stats: this.mountStats[this.activeMount]
        };
    },

    // calculate how fast we flee through this terrain
    getTravelSpeedModifier(terrainType = 'road') {
        const mount = this.getActiveMount();
        if (!mount) return 1.0;

        const baseSpeed = mount.definition.stats.speed;
        const terrainModifier = mount.definition.terrain[terrainType] || 1.0;

        // experience makes them slightly less pathetic
        const levelBonus = 1 + (mount.stats.level - 1) * 0.05;

        // wounds slow everything
        const healthModifier = mount.stats.health / 100;

        return baseSpeed * terrainModifier * levelBonus * healthModifier;
    },

    // Get cargo capacity bonus
    getCargoCapacityBonus() {
        const mount = this.getActiveMount();
        if (!mount) return 0;

        return mount.definition.stats.cargoCapacity;
    },

    // Get combat bonus from mount
    getCombatBonus() {
        const mount = this.getActiveMount();
        if (!mount) return 0;

        return mount.definition.stats.combatBonus || 0;
    },

    // Can fly
    canFly() {
        const mount = this.getActiveMount();
        if (!mount) return false;

        return mount.definition.stats.canFly || false;
    },

    // daily reminder that nothing is free, not even companionship
    processDailyMaintenance() {
        let totalCost = 0;
        const notifications = [];

        for (const mountInstance of this.ownedMounts) {
            const mount = this.mounts[mountInstance.type];
            const stats = this.mountStats[mountInstance.id];

            // the price of keeping things alive
            const dailyCost = mount.maintenance.feedCost + mount.maintenance.stableCost;
            totalCost += dailyCost;

            // can you afford to care?
            if (typeof game !== 'undefined' && game.player) {
                if (game.player.gold >= dailyCost) {
                    game.player.gold -= dailyCost;

                    // fed and rested, ready for more suffering tomorrow
                    stats.stamina = Math.min(stats.maxStamina, stats.stamina + 30);

                    // a full belly brings fleeting joy
                    stats.happiness = Math.min(100, stats.happiness + 5);
                } else {
                    // starvation is its own cruelty
                    stats.happiness = Math.max(0, stats.happiness - 15);
                    stats.health = Math.max(0, stats.health - 5);

                    notifications.push(`${mountInstance.name} is hungry and unhappy!`);
                }
            }
        }

        this.saveMounts();

        if (totalCost > 0 && typeof game !== 'undefined') {
            notifications.unshift(`Mount maintenance: ${totalCost} gold`);
        }

        // share the news of another day survived (barely)
        notifications.forEach(msg => this.showNotification(msg, 'info'));
    },

    // the journey begins - check if they can even walk
    onTravelStarted(data) {
        const mount = this.getActiveMount();
        if (!mount) return;

        // too tired to continue this endless march
        if (mount.stats.stamina <= 0) {
            this.showNotification(`${mount.instance.name} is too tired to travel!`, 'warning');
        }
    },

    // journey's end - battered but breathing
    onTravelCompleted(data) {
        const mount = this.getActiveMount();
        if (!mount) return;

        // every mile exacts its toll
        const distance = data.distance || 1;
        const drainRate = mount.definition.stats.staminaDrain;
        const staminaLost = Math.floor(distance * drainRate * 5);

        mount.stats.stamina = Math.max(0, mount.stats.stamina - staminaLost);

        // pain is growth (allegedly)
        mount.stats.experience += distance;
        this.checkLevelUp(mount);

        this.saveMounts();
    },

    // suffering rewarded with marginal improvement
    checkLevelUp(mountData) {
        const xpForNextLevel = mountData.stats.level * 100;

        if (mountData.stats.experience >= xpForNextLevel) {
            mountData.stats.level++;
            mountData.stats.experience -= xpForNextLevel;
            mountData.stats.maxStamina += 10;
            mountData.stats.stamina = mountData.stats.maxStamina;

            this.showNotification(`${mountData.instance.name} leveled up to ${mountData.stats.level}!`, 'success');

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('mount:levelUp', {
                    mountId: mountData.instance.id,
                    level: mountData.stats.level
                });
            }
        }
    },

    // Rest mount at stable
    restMountAtStable(instanceId, hours = 8) {
        const stats = this.mountStats[instanceId];
        if (!stats) return false;

        const staminaRestore = hours * 10;
        stats.stamina = Math.min(stats.maxStamina, stats.stamina + staminaRestore);
        stats.happiness = Math.min(100, stats.happiness + hours);

        this.saveMounts();
        this.showNotification('Mount rested and recovered stamina', 'success');

        return true;
    },

    // Heal mount
    healMount(instanceId, amount = 20) {
        const stats = this.mountStats[instanceId];
        if (!stats) return false;

        const healCost = amount * 2;

        if (typeof game !== 'undefined' && game.player) {
            if (game.player.gold < healCost) {
                this.showNotification(`Need ${healCost} gold to heal mount`, 'error');
                return false;
            }

            game.player.gold -= healCost;
            stats.health = Math.min(100, stats.health + amount);
            this.saveMounts();

            this.showNotification(`Mount healed for ${healCost} gold`, 'success');
            return true;
        }

        return false;
    },

    // Rename mount
    renameMount(instanceId, newName) {
        const instance = this.ownedMounts.find(m => m.id === instanceId);
        if (!instance) return false;

        instance.name = newName;
        this.saveMounts();

        this.showNotification(`Mount renamed to ${newName}`, 'success');
        return true;
    },

    // Show mount panel UI
    show() {
        const existingPanel = document.getElementById('mount-panel');
        if (existingPanel) existingPanel.remove();

        const panel = document.createElement('div');
        panel.id = 'mount-panel';
        panel.className = 'mount-panel';

        const activeMount = this.getActiveMount();

        panel.innerHTML = `
            <div class="mount-panel-header">
                <h2>🐴 Mounts</h2>
                <button class="mount-panel-close" onclick="MountSystem.hide()">×</button>
            </div>
            <div class="mount-panel-content">
                ${activeMount ? `
                    <div class="active-mount-display">
                        <span class="mount-icon-large">${this.mounts[activeMount.instance.type].icon}</span>
                        <div class="active-mount-info">
                            <h3>${activeMount.instance.name}</h3>
                            <div class="mount-level">Level ${activeMount.stats.level}</div>
                            <div class="mount-bars">
                                <div class="mount-bar">
                                    <span>Health</span>
                                    <div class="bar-track">
                                        <div class="bar-fill health" style="width: ${activeMount.stats.health}%"></div>
                                    </div>
                                    <span>${activeMount.stats.health}%</span>
                                </div>
                                <div class="mount-bar">
                                    <span>Stamina</span>
                                    <div class="bar-track">
                                        <div class="bar-fill stamina" style="width: ${(activeMount.stats.stamina / activeMount.stats.maxStamina) * 100}%"></div>
                                    </div>
                                    <span>${activeMount.stats.stamina}/${activeMount.stats.maxStamina}</span>
                                </div>
                                <div class="mount-bar">
                                    <span>Happiness</span>
                                    <div class="bar-track">
                                        <div class="bar-fill happiness" style="width: ${activeMount.stats.happiness}%"></div>
                                    </div>
                                    <span>${activeMount.stats.happiness}%</span>
                                </div>
                            </div>
                            <div class="mount-stats-summary">
                                <span>Speed: ${activeMount.definition.stats.speed}x</span>
                                <span>Cargo: +${activeMount.definition.stats.cargoCapacity}</span>
                                ${activeMount.definition.stats.combatBonus ? `<span>Combat: +${activeMount.definition.stats.combatBonus}</span>` : ''}
                            </div>
                        </div>
                        <button class="dismount-btn" onclick="MountSystem.setActiveMount(null)">Dismount</button>
                    </div>
                ` : `
                    <div class="no-mount-active">
                        <p>No mount active. Traveling on foot.</p>
                    </div>
                `}

                <div class="owned-mounts">
                    <h3>Your Mounts (${this.ownedMounts.length})</h3>
                    <div class="mount-list">
                        ${this.ownedMounts.length === 0 ? `
                            <p class="no-mounts">You don't own any mounts. Visit a stable to purchase one!</p>
                        ` : this.ownedMounts.map(m => this.renderMountCard(m)).join('')}
                    </div>
                </div>

                <div class="mount-shop">
                    <h3>Available Mounts</h3>
                    <div class="mount-shop-list">
                        ${Object.entries(this.mounts).map(([id, mount]) => `
                            <div class="shop-mount-card" data-tier="${mount.tier}">
                                <span class="mount-icon">${mount.icon}</span>
                                <div class="shop-mount-info">
                                    <div class="mount-name">${mount.name}</div>
                                    <div class="mount-tier tier-${mount.tier}">${mount.tier}</div>
                                    <div class="mount-description">${mount.description}</div>
                                    <div class="mount-stats-preview">
                                        Speed: ${mount.stats.speed}x | Cargo: +${mount.stats.cargoCapacity}
                                    </div>
                                </div>
                                <div class="shop-mount-price">
                                    <span class="price-amount">${mount.price}g</span>
                                    <button onclick="MountSystem.buyMount('${id}')" class="buy-mount-btn">Buy</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        requestAnimationFrame(() => {
            panel.classList.add('visible');
        });
    },

    // Render mount card
    renderMountCard(mountInstance) {
        const mount = this.mounts[mountInstance.type];
        const stats = this.mountStats[mountInstance.id];
        const isActive = this.activeMount === mountInstance.id;

        return `
            <div class="mount-card ${isActive ? 'active' : ''}" data-mount-id="${mountInstance.id}">
                <span class="mount-card-icon">${mount.icon}</span>
                <div class="mount-card-info">
                    <div class="mount-card-name">${mountInstance.name}</div>
                    <div class="mount-card-type">${mount.name} (Lvl ${stats.level})</div>
                    <div class="mount-card-bars">
                        <div class="mini-bar">
                            <div class="mini-bar-fill health" style="width: ${stats.health}%"></div>
                        </div>
                        <div class="mini-bar">
                            <div class="mini-bar-fill stamina" style="width: ${(stats.stamina / stats.maxStamina) * 100}%"></div>
                        </div>
                    </div>
                </div>
                <div class="mount-card-actions">
                    ${!isActive ? `
                        <button onclick="MountSystem.setActiveMount('${mountInstance.id}')" class="action-btn ride">Ride</button>
                    ` : `
                        <span class="active-badge">Active</span>
                    `}
                    <button onclick="MountSystem.showMountDetails('${mountInstance.id}')" class="action-btn details">Details</button>
                </div>
            </div>
        `;
    },

    // Show mount details
    showMountDetails(instanceId) {
        const instance = this.ownedMounts.find(m => m.id === instanceId);
        if (!instance) return;

        const mount = this.mounts[instance.type];
        const stats = this.mountStats[instanceId];

        const detailsPanel = document.createElement('div');
        detailsPanel.className = 'mount-details-panel';
        detailsPanel.innerHTML = `
            <div class="mount-details-content">
                <div class="details-header">
                    <span class="details-icon">${mount.icon}</span>
                    <input type="text" class="mount-name-input" value="${instance.name}"
                           onchange="MountSystem.renameMount('${instanceId}', this.value)">
                </div>
                <div class="details-stats">
                    <div class="stat-row">
                        <span>Type:</span><span>${mount.name}</span>
                    </div>
                    <div class="stat-row">
                        <span>Level:</span><span>${stats.level}</span>
                    </div>
                    <div class="stat-row">
                        <span>Experience:</span><span>${stats.experience}/${stats.level * 100}</span>
                    </div>
                    <div class="stat-row">
                        <span>Health:</span><span>${Math.round(stats.health)}%</span>
                    </div>
                    <div class="stat-row">
                        <span>Stamina:</span><span>${Math.round(stats.stamina)}/${Math.round(stats.maxStamina)}</span>
                    </div>
                    <div class="stat-row">
                        <span>Happiness:</span><span>${Math.round(stats.happiness)}%</span>
                    </div>
                    <div class="stat-row">
                        <span>Daily Cost:</span><span>${mount.maintenance.feedCost + mount.maintenance.stableCost}g</span>
                    </div>
                </div>
                <div class="details-terrain">
                    <h4>Terrain Bonuses</h4>
                    ${Object.entries(mount.terrain).map(([terrain, modifier]) => `
                        <div class="terrain-row">
                            <span>${terrain}</span>
                            <span class="${modifier >= 1 ? 'bonus' : 'penalty'}">${Math.round((modifier - 1) * 100)}%</span>
                        </div>
                    `).join('')}
                </div>
                <div class="details-actions">
                    <button onclick="MountSystem.restMountAtStable('${instanceId}')" class="detail-btn">Rest (10g)</button>
                    <button onclick="MountSystem.healMount('${instanceId}')" class="detail-btn">Heal (40g)</button>
                    <button onclick="MountSystem.sellMount('${instanceId}'); this.closest('.mount-details-panel').remove();" class="detail-btn sell">Sell (${Math.floor(mount.price * 0.5)}g)</button>
                </div>
                <button class="close-details" onclick="this.closest('.mount-details-panel').remove()">Close</button>
            </div>
        `;

        document.body.appendChild(detailsPanel);
    },

    // Hide mount panel
    hide() {
        const panel = document.getElementById('mount-panel');
        if (panel) {
            panel.classList.remove('visible');
            setTimeout(() => panel.remove(), 300);
        }
    },

    // Show notification
    showNotification(message, type = 'info') {
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.show(message, type);
        } else {
            console.log(`[Mount] ${message}`);
        }
    },

    // Create CSS styles
    createStyles() {
        if (document.getElementById('mount-styles')) return;

        const style = document.createElement('style');
        style.id = 'mount-styles';
        style.textContent = `
            .mount-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                width: 90%;
                max-width: 700px;
                max-height: 85vh;
                background: linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%);
                border: 2px solid #8b4513;
                border-radius: 12px;
                z-index: 600; /* Z-INDEX STANDARD: Panel overlays (mount) */
                opacity: 0;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 0 50px rgba(139, 69, 19, 0.3);
            }

            .mount-panel.visible {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }

            .mount-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(139, 69, 19, 0.2);
                border-bottom: 1px solid #8b4513;
            }

            .mount-panel-header h2 {
                margin: 0;
                color: #deb887;
                font-family: 'Cinzel', serif;
            }

            .mount-panel-close {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
            }

            .mount-panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }

            .active-mount-display {
                display: flex;
                gap: 15px;
                align-items: center;
                padding: 15px;
                background: rgba(139, 69, 19, 0.1);
                border: 1px solid #8b4513;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .mount-icon-large {
                font-size: 3em;
            }

            .active-mount-info {
                flex: 1;
            }

            .active-mount-info h3 {
                margin: 0 0 5px 0;
                color: #deb887;
                font-family: 'Cinzel', serif;
            }

            .mount-level {
                color: #888;
                font-size: 0.9em;
            }

            .mount-bars {
                margin: 10px 0;
            }

            .mount-bar {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 5px 0;
                font-size: 0.85em;
            }

            .mount-bar span:first-child {
                width: 70px;
                color: #888;
            }

            .bar-track {
                flex: 1;
                height: 8px;
                background: #333;
                border-radius: 4px;
                overflow: hidden;
            }

            .bar-fill {
                height: 100%;
                transition: width 0.3s;
            }

            .bar-fill.health { background: #dc3545; }
            .bar-fill.stamina { background: #28a745; }
            .bar-fill.happiness { background: #ffc107; }

            .mount-stats-summary {
                display: flex;
                gap: 15px;
                font-size: 0.85em;
                color: #888;
            }

            .dismount-btn {
                background: #6c757d;
                border: none;
                color: white;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
            }

            .no-mount-active {
                text-align: center;
                padding: 20px;
                color: #888;
            }

            .owned-mounts, .mount-shop {
                margin-top: 20px;
            }

            .owned-mounts h3, .mount-shop h3 {
                color: #deb887;
                font-family: 'Cinzel', serif;
                margin-bottom: 10px;
            }

            .mount-list, .mount-shop-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .mount-card {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                border: 1px solid #333;
            }

            .mount-card.active {
                border-color: #28a745;
                background: rgba(40, 167, 69, 0.1);
            }

            .mount-card-icon {
                font-size: 2em;
            }

            .mount-card-info {
                flex: 1;
            }

            .mount-card-name {
                color: #fff;
                font-family: 'Cinzel', serif;
            }

            .mount-card-type {
                color: #888;
                font-size: 0.85em;
            }

            .mount-card-bars {
                display: flex;
                gap: 5px;
                margin-top: 5px;
            }

            .mini-bar {
                width: 50px;
                height: 4px;
                background: #333;
                border-radius: 2px;
                overflow: hidden;
            }

            .mini-bar-fill {
                height: 100%;
            }

            .mini-bar-fill.health { background: #dc3545; }
            .mini-bar-fill.stamina { background: #28a745; }

            .mount-card-actions {
                display: flex;
                gap: 5px;
            }

            .action-btn {
                background: #4a4a6a;
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85em;
            }

            .action-btn.ride { background: #28a745; }

            .active-badge {
                background: #28a745;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.85em;
            }

            .shop-mount-card {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                border: 1px solid #333;
            }

            .shop-mount-card .mount-icon {
                font-size: 2em;
            }

            .shop-mount-info {
                flex: 1;
            }

            .shop-mount-info .mount-name {
                color: #fff;
                font-family: 'Cinzel', serif;
            }

            .mount-tier {
                font-size: 0.75em;
                padding: 2px 8px;
                border-radius: 10px;
                display: inline-block;
                margin: 3px 0;
            }

            .tier-basic { background: #6c757d; }
            .tier-standard { background: #17a2b8; }
            .tier-premium { background: #ffc107; color: #000; }
            .tier-exotic { background: #9b59b6; }
            .tier-legendary { background: linear-gradient(45deg, #ffd700, #ff6b6b); }

            .mount-description {
                color: #888;
                font-size: 0.85em;
            }

            .mount-stats-preview {
                color: #6c757d;
                font-size: 0.8em;
            }

            .shop-mount-price {
                text-align: center;
            }

            .price-amount {
                display: block;
                color: #ffd700;
                font-size: 1.2em;
                margin-bottom: 5px;
            }

            .buy-mount-btn {
                background: #28a745;
                border: none;
                color: white;
                padding: 5px 15px;
                border-radius: 4px;
                cursor: pointer;
            }

            .no-mounts {
                color: #666;
                text-align: center;
                padding: 20px;
            }

            .mount-details-panel {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 700; /* Z-INDEX STANDARD: System modals (mount details) */
            }

            .mount-details-content {
                background: #1a1a2e;
                padding: 20px;
                border-radius: 12px;
                border: 2px solid #8b4513;
                min-width: 300px;
            }

            .details-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            }

            .details-icon {
                font-size: 2.5em;
            }

            .mount-name-input {
                background: #0d0d1a;
                border: 1px solid #4a4a6a;
                border-radius: 4px;
                color: #fff;
                padding: 8px;
                font-family: 'Cinzel', serif;
                font-size: 1.2em;
            }

            .details-stats, .details-terrain {
                margin-bottom: 15px;
            }

            .details-terrain h4 {
                color: #deb887;
                margin-bottom: 8px;
            }

            .stat-row, .terrain-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid #2a2a3e;
            }

            .terrain-row .bonus { color: #28a745; }
            .terrain-row .penalty { color: #dc3545; }

            .details-actions {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }

            .detail-btn {
                flex: 1;
                background: #4a4a6a;
                border: none;
                color: white;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
            }

            .detail-btn.sell { background: #dc3545; }

            .close-details {
                width: 100%;
                background: #6c757d;
                border: none;
                color: white;
                padding: 10px;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    },

    // Save state
    getSaveData() {
        return {
            ownedMounts: this.ownedMounts,
            activeMount: this.activeMount,
            mountStats: this.mountStats
        };
    },

    // Load state
    loadSaveData(data) {
        if (data) {
            this.ownedMounts = data.ownedMounts || [];
            this.activeMount = data.activeMount || null;
            this.mountStats = data.mountStats || {};
            this.saveMounts();
        }
    }
};

// register with Bootstrap
Bootstrap.register('MountSystem', () => MountSystem.init(), {
    dependencies: ['TravelSystem', 'game'],
    priority: 62,
    severity: 'optional'
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MountSystem;
}
