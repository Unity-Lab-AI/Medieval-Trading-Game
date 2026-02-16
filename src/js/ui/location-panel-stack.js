// ═══════════════════════════════════════════════════════════════
// LOCATION-PANEL-STACK - navigating subviews like it's 2005
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const LocationPanelStack = {
    viewStack: ['main'], // Stack of view names: 'main', 'gathering', 'exploration', etc.

    // Push a new view onto the stack
    pushView(viewName) {
        if (this.viewStack[this.viewStack.length - 1] !== viewName) {
            this.viewStack.push(viewName);
        }
        this.renderCurrentView();
    },

    // Pop current view, return to previous
    popView() {
        if (this.viewStack.length > 1) {
            this.viewStack.pop();
        }
        this.renderCurrentView();
    },

    // Go back to main view
    goToMain() {
        this.viewStack = ['main'];
        this.renderCurrentView();
    },

    // Get current view name
    getCurrentView() {
        return this.viewStack[this.viewStack.length - 1];
    },

    // Render the current view
    renderCurrentView() {
        const view = this.getCurrentView();
        if (view === 'main') {
            // updateLocationPanelMain is defined in game.js - available at runtime
            if (typeof updateLocationPanelMain === 'function') {
                updateLocationPanelMain();
            }
        } else if (view === 'gathering') {
            this.renderGatheringView();
        } else if (view === 'exploration') {
            this.renderExplorationView();
        }
    },

    // render gathering view as full panel
    renderGatheringView() {
        const locationPanel = document.getElementById('location-panel');
        const content = document.getElementById('location-panel-content');
        if (!content || !locationPanel) return;

        // Update header
        const h2 = locationPanel.querySelector('h2');
        if (h2) h2.textContent = '⛏️ Gather Resources';

        // Get available actions
        const availableActions = typeof ResourceGatheringSystem !== 'undefined'
            ? ResourceGatheringSystem.getAvailableGatheringActions(game.currentLocation?.type)
            : [];

        content.innerHTML = `
            <button class="location-back-btn" onclick="LocationPanelStack.goToMain()"
                style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
                       padding: 8px 12px; background: rgba(79, 195, 247, 0.15);
                       border: 1px solid rgba(79, 195, 247, 0.3); border-radius: 6px;
                       color: #4fc3f7; cursor: pointer; font-size: 12px;">
                ← Back to Location
            </button>
            <div class="gathering-full-list" style="display: flex; flex-direction: column; gap: 4px;">
                ${availableActions.length === 0 ? `
                    <div style="padding: 20px; text-align: center; color: #888;">
                        No resources available here.
                    </div>
                ` : availableActions.map(action => {
                    const toolCheck = typeof ResourceGatheringSystem !== 'undefined'
                        ? ResourceGatheringSystem.checkToolRequirement(action)
                        : { hasRequired: true, toolName: 'None' };
                    const canGather = toolCheck.hasRequired;
                    return `
                        <button class="gather-action-btn"
                            style="display: flex; align-items: center; justify-content: space-between;
                                   padding: 12px; background: ${canGather ? 'rgba(76, 175, 80, 0.15)' : 'rgba(100, 100, 100, 0.1)'};
                                   border: 1px solid ${canGather ? 'rgba(76, 175, 80, 0.3)' : 'rgba(100, 100, 100, 0.2)'};
                                   border-radius: 6px; cursor: ${canGather ? 'pointer' : 'not-allowed'};
                                   opacity: ${canGather ? '1' : '0.5'};"
                            ${canGather ? `onclick="ResourceGatheringSystem.startGatheringFromPanel('${action.id}')"` : 'disabled'}>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 1.5em;">${action.icon}</span>
                                <div style="text-align: left;">
                                    <div style="font-weight: bold; color: #e0e0e0;">${action.name}</div>
                                    <div style="font-size: 0.8em; color: ${canGather ? '#4caf50' : '#f44336'};">
                                        ${canGather ? '✓ ' + (toolCheck.toolName || 'Ready') : '✗ Need ' + toolCheck.requiredTool}
                                    </div>
                                </div>
                            </div>
                            <div style="text-align: right; color: #888; font-size: 0.85em;">
                                <div style="color: #4caf50;">${action.baseYield?.min || 1}-${action.baseYield?.max || 3}x</div>
                                <div>${action.baseTime || 30}s</div>
                            </div>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    },

    // render exploration view as full panel
    renderExplorationView() {
        const locationPanel = document.getElementById('location-panel');
        const content = document.getElementById('location-panel-content');
        if (!content || !locationPanel) return;

        // Update header
        const h2 = locationPanel.querySelector('h2');
        if (h2) h2.textContent = '🏚️ Exploration';

        const locationId = game.currentLocation?.id;
        const location = typeof GameWorld !== 'undefined' ? GameWorld?.locations?.[locationId] : null;

        // Get exploration data
        const des = typeof DungeonExplorationSystem !== 'undefined' ? DungeonExplorationSystem : null;
        const desLocation = des?.getLocation?.(locationId);
        const availableEvents = des?.getAvailableEventsForLocation?.(desLocation) || [];
        const difficulty = des?.getLocationDifficulty?.(desLocation) || 'unknown';
        const survival = des?.calculateSurvivalAssessment?.(desLocation, game.player) || { tier: 'Unknown', tierColor: '#888', chance: 50, canSurvive: true };

        // Build content - simplified: just survival assessment + explore button
        let mainContent = '';

        if (availableEvents.length === 0) {
            mainContent = `
                <div style="padding: 20px; text-align: center; color: #888;">
                    <p style="margin: 0; font-size: 1.1em;">🔍 Nothing to explore here.</p>
                    <p style="margin: 10px 0 0 0; font-size: 0.9em; font-style: italic;">
                        Try dungeons, caves, ruins, or mines for adventure!
                    </p>
                </div>
            `;
        } else {
            const diffColors = { easy: '#4caf50', medium: '#ff9800', hard: '#f44336', deadly: '#9c27b0', unknown: '#888' };
            const diffColor = diffColors[difficulty] || '#888';
            const canSurvive = survival.canSurvive !== false;

            mainContent = `
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="color: #4fc3f7; font-weight: bold;">📍 ${location?.name || 'Unknown Area'}</span>
                        <span style="background: ${diffColor}; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">
                            ${difficulty.toUpperCase()}
                        </span>
                    </div>
                    <div style="background: ${survival.tierColor}15; border: 1px solid ${survival.tierColor}40; border-radius: 8px; padding: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: bold; color: ${survival.tierColor};">
                                ${survival.tier || 'Survival Assessment'}
                            </span>
                            <span style="color: ${survival.tierColor}; font-size: 1.1em; font-weight: bold;">
                                ${Math.round(survival.chance || 50)}%
                            </span>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: ${survival.tierColor}; height: 100%; width: ${survival.chance || 50}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.85em; margin-top: 8px;">
                            <span>❤️ ${game?.player?.stats?.health || 0}/${survival.requirements?.minHealth || 50}</span>
                            <span>⚡ ${game?.player?.stats?.stamina || 0}/${survival.requirements?.minStamina || 50}</span>
                        </div>
                    </div>
                </div>
                <button class="explore-btn" data-location-id="${locationId}"
                    style="width: 100%; padding: 15px; background: ${canSurvive ? 'linear-gradient(135deg, #ff8c00 0%, #cc5500 100%)' : '#333'};
                           border: 1px solid ${canSurvive ? '#ff8c00' : '#555'}; border-radius: 8px;
                           color: ${canSurvive ? 'white' : '#666'}; font-size: 1.1em;
                           font-weight: bold; cursor: ${canSurvive ? 'pointer' : 'not-allowed'};
                           display: flex; align-items: center; justify-content: center; gap: 8px;"
                    ${canSurvive ? '' : 'disabled'}>
                    ${canSurvive ? '🏚️ Explore Area' : '💀 Too Weak to Explore'}
                </button>
            `;
        }

        content.innerHTML = `
            <button class="location-back-btn" onclick="LocationPanelStack.goToMain()"
                style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
                       padding: 8px 12px; background: rgba(79, 195, 247, 0.15);
                       border: 1px solid rgba(79, 195, 247, 0.3); border-radius: 6px;
                       color: #4fc3f7; cursor: pointer; font-size: 12px;">
                ← Back to Location
            </button>
            ${mainContent}
        `;

        // Attach listener to explore button
        const canSurviveNow = survival.canSurvive !== false;
        const capturedLocationId = locationId;
        const exploreBtn = content.querySelector('.explore-btn');

        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                if (!canSurviveNow) return;
                if (typeof ExplorationPanel !== 'undefined' && ExplorationPanel.open) {
                    ExplorationPanel.open(capturedLocationId);
                }
            });
        }
    }
};

// Make it global
window.LocationPanelStack = LocationPanelStack;

// reset stack when player changes location
document.addEventListener('player-location-changed', () => {
    LocationPanelStack.goToMain();
});
document.addEventListener('location-changed', () => {
    LocationPanelStack.goToMain();
});

console.log('📍 LocationPanelStack loaded - navigation ready');
