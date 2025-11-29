// ═══════════════════════════════════════════════════════════════
// 🎭 IMMERSIVE EXPERIENCE INTEGRATION - weaving the sensory tapestry
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// 🌙 This is where all my dark magic converges.
// Audio, visuals, weather... all orchestrated into one beautiful nightmare 🦇

const ImmersiveExperienceIntegration = {
    // 🌙 Initialize all immersive systems - summoning the atmosphere
    init() {
        console.log('🎭 Weaving the immersive experience tapestry...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeSystems());
        } else {
            this.initializeSystems();
        }
    },
    
    // 🔮 Initialize all systems - awakening each piece of the experience
    initializeSystems() {
        // 🔊 Initialize audio system - giving voice to the void
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.init();
            this.setupAudioIntegration();
        }
        
        // ✨ Initialize visual effects system - painting reality with magic
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.init();
            this.setupVisualEffectsIntegration();
        }
        
        // 🎬 Initialize animation system - teaching pixels to dance
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.init();
            this.setupAnimationIntegration();
        }
        
        // 💅 Initialize UI polish system - making interfaces irresistibly smooth
        if (typeof UIPolishSystem !== 'undefined') {
            UIPolishSystem.init();
            this.setupUIPolishIntegration();
        }
        
        // 🌧️ Initialize environmental effects system - commanding the atmosphere
        if (typeof EnvironmentalEffectsSystem !== 'undefined') {
            EnvironmentalEffectsSystem.init();
            this.setupEnvironmentalIntegration();
        }
        
        // ⚙️ Initialize settings panel - giving control to the mortals
        if (typeof SettingsPanel !== 'undefined') {
            SettingsPanel.init();
            this.setupSettingsIntegration();
        }
        
        // 🔁 Start animation loops - the eternal cycles commence
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.startParticleLoop();
        }
        
        console.log('🎭 Immersive experience integration complete... reality is now mine to bend 🖤');
    },
    
    // 🔊 Setup audio integration with game events - syncing sound to soul
    setupAudioIntegration() {
        // Game state changes
        EventManager.addEventListener(document, 'gameStateChange', (e) => {
            AudioSystem.updateMusicForGameState(e.detail.newState);
        });
        
        // Time changes
        EventManager.addEventListener(document, 'timeChange', (e) => {
            AudioSystem.updateMusicForTimeOfDay(e.detail);
        });
        
        // Location changes
        EventManager.addEventListener(document, 'locationChange', (e) => {
            AudioSystem.updateAmbientForLocation(e.detail.locationType);
        });
        
        // 💰 Trading events - capitalism sounds beautiful
        EventManager.addEventListener(document, 'buyItem', (e) => {
            AudioSystem.playContextualSound('market', 'buy');
        });
        
        EventManager.addEventListener(document, 'sellItem', (e) => {
            AudioSystem.playContextualSound('market', 'sell');
        });
        
        EventManager.addEventListener(document, 'tradeComplete', (e) => {
            AudioSystem.playSound('tradeComplete');
        });
        
        // Travel events
        EventManager.addEventListener(document, 'travelStart', (e) => {
            AudioSystem.playContextualSound('travel', 'start');
        });
        
        EventManager.addEventListener(document, 'travelComplete', (e) => {
            AudioSystem.playContextualSound('travel', 'complete');
        });
        
        // Item events
        EventManager.addEventListener(document, 'itemPickup', (e) => {
            AudioSystem.playContextualSound('inventory', 'pickup');
        });
        
        EventManager.addEventListener(document, 'itemUse', (e) => {
            AudioSystem.playContextualSound('inventory', 'use');
        });
        
        // UI events
        EventManager.addEventListener(document, 'uiClick', (e) => {
            AudioSystem.playContextualSound('ui', 'click');
        });
        
        EventManager.addEventListener(document, 'uiHover', (e) => {
            AudioSystem.playContextualSound('ui', 'hover');
        });
        
        // Achievement events
        EventManager.addEventListener(document, 'levelUp', (e) => {
            AudioSystem.playSound('levelUp');
        });
        
        EventManager.addEventListener(document, 'questComplete', (e) => {
            AudioSystem.playSound('questComplete');
        });
        
        // Property events
        EventManager.addEventListener(document, 'propertyPurchase', (e) => {
            AudioSystem.playSound('propertyPurchase');
        });
        
        EventManager.addEventListener(document, 'employeeHire', (e) => {
            AudioSystem.playSound('employeeHire');
        });
        
        // Error and success events
        EventManager.addEventListener(document, 'error', (e) => {
            AudioSystem.playContextualSound('ui', 'error');
        });
        
        EventManager.addEventListener(document, 'success', (e) => {
            AudioSystem.playContextualSound('ui', 'success');
        });
        
        EventManager.addEventListener(document, 'warning', (e) => {
            AudioSystem.playContextualSound('ui', 'warning');
        });
        
        EventManager.addEventListener(document, 'notification', (e) => {
            AudioSystem.playSound('notification');
        });
    },
    
    // ✨ Setup visual effects integration - making every action sparkle
    setupVisualEffectsIntegration() {
        // 💰 Gold transactions - money deserves to glitter
        EventManager.addEventListener(document, 'goldTransaction', (e) => {
            const rect = e.target?.getBoundingClientRect();
            if (rect) {
                VisualEffectsSystem.createGoldParticles({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    amount: e.detail.amount
                });
            }
        });
        
        // Item pickups
        EventManager.addEventListener(document, 'itemPickup', (e) => {
            const rect = e.target?.getBoundingClientRect();
            if (rect) {
                VisualEffectsSystem.createItemPickupEffect({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    itemType: e.detail.itemType
                });
            }
        });
        
        // Level progression
        EventManager.addEventListener(document, 'levelUp', (e) => {
            const rect = e.target?.getBoundingClientRect();
            if (rect) {
                VisualEffectsSystem.createLevelUpEffect({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                });
            }
        });
        
        // Trade completion
        EventManager.addEventListener(document, 'tradeComplete', (e) => {
            const rect = e.target?.getBoundingClientRect();
            if (rect) {
                VisualEffectsSystem.createTradeCompleteEffect({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    success: e.detail.success
                });
            }
        });
        
        // Combat/actions
        EventManager.addEventListener(document, 'combatAction', (e) => {
            const rect = e.target?.getBoundingClientRect();
            if (rect) {
                VisualEffectsSystem.createCombatEffect({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    type: e.detail.type
                });
            }
        });
        
        // Screen shake events
        EventManager.addEventListener(document, 'screenShake', (e) => {
            VisualEffectsSystem.triggerScreenShake(e.detail);
        });
        
        // Weather changes
        EventManager.addEventListener(document, 'weatherChange', (e) => {
            VisualEffectsSystem.updateWeather(e.detail);
        });
        
        // Time changes
        EventManager.addEventListener(document, 'timeChange', (e) => {
            VisualEffectsSystem.updateTimeBasedEffects(e.detail);
        });
        
        // Resource gathering
        EventManager.addEventListener(document, 'resourceGather', (e) => {
            const rect = e.target?.getBoundingClientRect();
            if (rect) {
                VisualEffectsSystem.createResourceParticles({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    resourceType: e.detail.resourceType,
                    amount: e.detail.amount
                });
            }
        });
    },
    
    // 🎬 Setup animation integration - motion for every emotion
    setupAnimationIntegration() {
        // Character movement
        EventManager.addEventListener(document, 'characterMove', (e) => {
            AnimationSystem.animateCharacterMovement(e.detail);
        });
        
        // Item usage
        EventManager.addEventListener(document, 'itemUse', (e) => {
            AnimationSystem.animateItemUsage(e.detail);
        });
        
        // Building actions
        EventManager.addEventListener(document, 'buildingAction', (e) => {
            AnimationSystem.animateBuilding(e.detail);
        });
        
        // Travel events
        EventManager.addEventListener(document, 'travelStart', (e) => {
            AnimationSystem.animateTravelStart(e.detail);
        });
        
        EventManager.addEventListener(document, 'travelComplete', (e) => {
            AnimationSystem.animateTravelComplete(e.detail);
        });
        
        // Market stall actions
        EventManager.addEventListener(document, 'marketStallAction', (e) => {
            AnimationSystem.animateMarketStall(e.detail);
        });
        
        // Loading events
        EventManager.addEventListener(document, 'loadingStart', (e) => {
            AnimationSystem.animateLoadingStart(e.detail);
        });
        
        EventManager.addEventListener(document, 'loadingComplete', (e) => {
            AnimationSystem.animateLoadingComplete(e.detail);
        });
    },
    
    // 💅 Setup UI polish integration - making interfaces feel alive
    setupUIPolishIntegration() {
        // Panel transitions
        EventManager.addEventListener(document, 'panelOpen', (e) => {
            const panel = document.getElementById(e.detail.panelId);
            if (panel) {
                UIPolishSystem.fadeIn(panel);
            }
        });
        
        EventManager.addEventListener(document, 'panelClose', (e) => {
            const panel = document.getElementById(e.detail.panelId);
            if (panel) {
                UIPolishSystem.fadeOut(panel);
            }
        });
        
        // Button interactions
        EventManager.addEventListener(document, 'buttonClick', (e) => {
            if (e.target) {
                UIPolishSystem.animateButtonPress(e.target);
            }
        });
        
        // Progress bar updates
        EventManager.addEventListener(document, 'progressUpdate', (e) => {
            const progressBar = document.getElementById(e.detail.progressBarId);
            if (progressBar) {
                UIPolishSystem.animateProgressBar(
                    progressBar, 
                    e.detail.currentValue, 
                    e.detail.targetValue
                );
            }
        });
        
        // Text scrolling
        EventManager.addEventListener(document, 'textScroll', (e) => {
            const textElement = document.getElementById(e.detail.textElementId);
            if (textElement) {
                UIPolishSystem.animateTextScroll(textElement, e.detail.text);
            }
        });
        
        // Icon animations
        EventManager.addEventListener(document, 'iconAnimate', (e) => {
            const icon = document.getElementById(e.detail.iconId);
            if (icon) {
                UIPolishSystem.animateIcon(icon, e.detail.animationType);
            }
        });
        
        // Highlighting
        EventManager.addEventListener(document, 'highlightElement', (e) => {
            const element = document.getElementById(e.detail.elementId);
            if (element) {
                UIPolishSystem.highlightElement(element, e.detail.options);
            }
        });
        
        // Notifications
        EventManager.addEventListener(document, 'showNotification', (e) => {
            UIPolishSystem.showNotification(e.detail.message, e.detail.type, e.detail.duration);
        });
    },
    
    // 🌦️ Setup environmental effects integration - weather responds to the game's mood
    setupEnvironmentalIntegration() {
        // Time changes
        EventManager.addEventListener(document, 'timeChange', (e) => {
            EnvironmentalEffectsSystem.updateTimeOfDay(e.detail);
        });
        
        // Season changes
        EventManager.addEventListener(document, 'seasonChange', (e) => {
            EnvironmentalEffectsSystem.updateSeason(e.detail);
        });
        
        // Location changes
        EventManager.addEventListener(document, 'locationChange', (e) => {
            EnvironmentalEffectsSystem.updateLocation(e.detail);
        });
        
        // Weather changes
        EventManager.addEventListener(document, 'weatherChange', (e) => {
            EnvironmentalEffectsSystem.updateWeather(e.detail);
        });
        
        // Game state changes
        EventManager.addEventListener(document, 'gameStateChange', (e) => {
            EnvironmentalEffectsSystem.updateEnvironmentForGameState(e.detail.newState);
        });
    },
    
    // ⚙️ Setup settings integration - control is an illusion, but a nice one
    setupSettingsIntegration() {
        // 🚫 settings button removed - we already have settings in the side panel and main menu
        // no need for a floating button cluttering up the screen

        // ⌨️ Setup keyboard shortcut for settings - Ctrl+Esc for the power users
        EventManager.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape' && e.ctrlKey) {
                e.preventDefault();
                SettingsPanel.openPanel();
            }
        });
    },
    
    // 🪝 Hook into existing game functions - injecting magic into the mundane
    hookIntoGameFunctions() {
        // 💬 Hook into addMessage function - making text feel alive
        if (typeof addMessage === 'function') {
            const originalAddMessage = window.addMessage;
            window.addMessage = function(text, type = 'info') {
                // Call original function
                originalAddMessage.call(this, text, type);
                
                // ✨ Add immersive effects based on message type - every word gets its flavor
                if (type === 'warning') {
                    document.dispatchEvent(new CustomEvent('warning', { detail: { message: text } }));
                } else if (type === 'error') {
                    document.dispatchEvent(new CustomEvent('error', { detail: { message: text } }));
                } else if (type === 'success') {
                    document.dispatchEvent(new CustomEvent('success', { detail: { message: text } }));
                }
                
                // 🔔 Play notification sound - the bells of attention
                document.dispatchEvent(new CustomEvent('notification', { detail: { message: text } }));
            };
        }
        
        // 🛒 Hook into buyItem function - capitalism with sparkles
        if (typeof buyItem === 'function') {
            const originalBuyItem = window.buyItem;
            window.buyItem = function(itemId, quantity) {
                const result = originalBuyItem.call(this, itemId, quantity);
                
                if (result) {
                    // 🎯 Trigger buy event - the moment of acquisition
                    document.dispatchEvent(new CustomEvent('buyItem', { 
                        detail: { itemId, quantity } 
                    }));
                    
                    // Trigger gold transaction
                    const item = ItemDatabase.getItem(itemId);
                    if (item) {
                        const location = GameWorld.locations[game.currentLocation.id];
                        const marketData = location.marketPrices[itemId];
                        if (marketData) {
                            const totalPrice = marketData.price * quantity;
                            document.dispatchEvent(new CustomEvent('goldTransaction', { 
                                detail: { amount: -totalPrice, target: event.target } 
                            }));
                        }
                    }
                }
                
                return result;
            };
        }
        
        // Hook into sellItem function
        if (typeof sellItem === 'function') {
            const originalSellItem = window.sellItem;
            window.sellItem = function(itemId, quantity) {
                const result = originalSellItem.call(this, itemId, quantity);
                
                if (result) {
                    // Trigger sell event
                    document.dispatchEvent(new CustomEvent('sellItem', { 
                        detail: { itemId, quantity } 
                    }));
                    
                    // Trigger gold transaction
                    const item = ItemDatabase.getItem(itemId);
                    if (item) {
                        const location = GameWorld.locations[game.currentLocation.id];
                        const reputationModifier = CityReputationSystem.getPriceModifier(location.id);
                        const baseSellPrice = Math.round(ItemDatabase.calculatePrice(itemId) * 0.7);
                        const sellPrice = Math.round(baseSellPrice * reputationModifier);
                        const totalPrice = sellPrice * quantity;
                        
                        document.dispatchEvent(new CustomEvent('goldTransaction', { 
                            detail: { amount: totalPrice, target: event.target } 
                            }));
                    }
                }
                
                return result;
            };
        }
        
        // Hook into useItem function
        if (typeof useItem === 'function') {
            const originalUseItem = window.useItem;
            window.useItem = function(itemId) {
                const result = originalUseItem.call(this, itemId);
                
                if (result) {
                    // Trigger item use event
                    document.dispatchEvent(new CustomEvent('itemUse', { 
                        detail: { itemId, user: 'player' } 
                    }));
                    
                    // Trigger item pickup effect for visual feedback
                    const item = ItemDatabase.getItem(itemId);
                    if (item) {
                        document.dispatchEvent(new CustomEvent('itemPickup', { 
                            detail: { itemType: item.category } 
                        }));
                    }
                }
                
                return result;
            };
        }
        
        // Hook into travel functions
        if (typeof GameWorld !== 'undefined' && GameWorld.travelTo) {
            const originalTravelTo = GameWorld.travelTo;
            GameWorld.travelTo = function(locationId) {
                const result = originalTravelTo.call(this, locationId);
                
                if (result) {
                    // Trigger travel start event
                    document.dispatchEvent(new CustomEvent('travelStart', { 
                        detail: { character: 'player', destination: locationId } 
                    }));
                }
                
                return result;
            };
        }
        
        if (typeof GameWorld !== 'undefined' && GameWorld.completeTravel) {
            const originalCompleteTravel = GameWorld.completeTravel;
            GameWorld.completeTravel = function(locationId) {
                const result = originalCompleteTravel.call(this, locationId);
                
                if (result) {
                    // Trigger travel complete event
                    document.dispatchEvent(new CustomEvent('travelComplete', { 
                        detail: { character: 'player', destination: locationId } 
                    }));
                }
                
                return result;
            };
        }
        
        // Hook into changeState function
        if (typeof changeState === 'function') {
            const originalChangeState = window.changeState;
            window.changeState = function(newState) {
                const oldState = game.state;
                
                // Call original function
                originalChangeState.call(this, newState);
                
                // Trigger game state change event
                document.dispatchEvent(new CustomEvent('gameStateChange', { 
                    detail: { oldState, newState } 
                }));
            };
        }
        
        // Hook into time system
        if (typeof TimeSystem !== 'undefined') {
            // Hook into time updates
            const originalUpdate = TimeSystem.update;
            TimeSystem.update = function(deltaTime) {
                const result = originalUpdate.call(this, deltaTime);
                
                if (result) {
                    // Trigger time change event
                    const timeInfo = this.getTimeInfo();
                    document.dispatchEvent(new CustomEvent('timeChange', { 
                        detail: timeInfo 
                    }));
                }
                
                return result;
            };
        }
        
        // Hook into panel functions
        if (typeof showPanel === 'function') {
            const originalShowPanel = window.showPanel;
            window.showPanel = function(panelId) {
                const result = originalShowPanel.call(this, panelId);
                
                // Trigger panel open event
                document.dispatchEvent(new CustomEvent('panelOpen', { 
                    detail: { panelId } 
                }));
                
                return result;
            };
        }
        
        if (typeof hidePanel === 'function') {
            const originalHidePanel = window.hidePanel;
            window.hidePanel = function(panelId) {
                const result = originalHidePanel.call(this, panelId);
                
                // Trigger panel close event
                document.dispatchEvent(new CustomEvent('panelClose', { 
                    detail: { panelId } 
                }));
                
                return result;
            };
        }
    },
    
    // 📊 Performance monitoring - keeping the magic smooth
    setupPerformanceMonitoring() {
        // 🎯 Monitor frame rate and adjust quality if needed - adaptive darkness
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 60;
        
        const checkPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            const elapsed = currentTime - lastTime;
            
            if (elapsed >= 1000) {
                fps = Math.round((frameCount * 1000) / elapsed);
                frameCount = 0;
                lastTime = currentTime;
                
                // ⚖️ Adjust quality based on performance - sacrifice beauty for smoothness
                if (fps < 30) {
                    // 🔽 Reduce quality for better performance - the machine struggles
                    if (typeof VisualEffectsSystem !== 'undefined') {
                        VisualEffectsSystem.setQuality('low');
                    }
                    if (typeof AnimationSystem !== 'undefined') {
                        AnimationSystem.setQuality('low');
                    }
                    if (typeof EnvironmentalEffectsSystem !== 'undefined') {
                        EnvironmentalEffectsSystem.setQuality('low');
                    }
                } else if (fps > 50) {
                    // ⚡ Can handle higher quality - unleash the full power
                    if (typeof VisualEffectsSystem !== 'undefined') {
                        VisualEffectsSystem.setQuality('high');
                    }
                    if (typeof AnimationSystem !== 'undefined') {
                        AnimationSystem.setQuality('high');
                    }
                    if (typeof EnvironmentalEffectsSystem !== 'undefined') {
                        EnvironmentalEffectsSystem.setQuality('high');
                    }
                }
            }
            
            requestAnimationFrame(checkPerformance);
        };
        
        requestAnimationFrame(checkPerformance);
    },
    
    // 🚀 Initialize everything when ready - the grand awakening
    start() {
        this.init();
        
        // ⏱️ Hook into game functions after a short delay - patience before possession
        setTimeout(() => {
            this.hookIntoGameFunctions();
            this.setupPerformanceMonitoring();
        }, 1000);
    },
    
    // 🧹 Cleanup all systems - erasing all traces of our dark magic
    cleanup() {
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.cleanup();
        }
        
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.cleanup();
        }
        
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.cleanup();
        }
        
        if (typeof UIPolishSystem !== 'undefined') {
            UIPolishSystem.cleanup();
        }
        
        if (typeof EnvironmentalEffectsSystem !== 'undefined') {
            EnvironmentalEffectsSystem.cleanup();
        }
        
        if (typeof SettingsPanel !== 'undefined') {
            SettingsPanel.cleanup();
        }
        
        // 🗑️ Remove settings button - if it even exists
        const settingsBtn = document.getElementById('immersive-settings-btn');
        if (settingsBtn) {
            settingsBtn.remove();
        }
    }
};

// 🌙 Auto-start the integration when the script loads - the magic begins unbidden
ImmersiveExperienceIntegration.start();

// 📤 Export for use in other modules - share the darkness
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImmersiveExperienceIntegration;
}