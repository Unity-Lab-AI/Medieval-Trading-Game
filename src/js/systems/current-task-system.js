// 
// CURRENT TASK SYSTEM - tracking your existential crisis
// 
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const CurrentTaskSystem = {
    //  Current task state
    currentTask: null,
    lastUpdate: 0,

    //  Idle messages - because doing nothing deserves variety 
    idleMessages: [
        { action: "Contemplating existence", icon: "🤔" },
        { action: "Staring into the void", icon: "👁️" },
        { action: "Pondering your next move", icon: "💭" },
        { action: "Taking a breather", icon: "😮‍💨" },
        { action: "Enjoying the scenery", icon: "🏞️" },
        { action: "Lost in thought", icon: "🌀" },
        { action: "Appreciating the moment", icon: "✨" },
        { action: "Waiting for inspiration", icon: "💡" },
        { action: "Daydreaming about riches", icon: "💰" },
        { action: "Counting sheep... er, gold", icon: "🐑" },
        { action: "Practicing idle stance", icon: "🧘" },
        { action: "Doing absolutely nothing", icon: "😶" },
        { action: "Existing peacefully", icon: "🌿" },
        { action: "Observing local wildlife", icon: "🦜" },
        { action: "Whistling a tune", icon: "🎵" },
        { action: "Checking inventory... mentally", icon: "📦" },
        { action: "Looking mysterious", icon: "🎭" },
        { action: "Standing dramatically", icon: "🗡️" },
    ],

    //  Set current task 
    setTask(type, action, detail = null, icon = null) {
        this.currentTask = {
            type: type,
            action: action,
            detail: detail,
            icon: icon || this.getIconForType(type),
            startTime: Date.now()
        };
        this.lastUpdate = Date.now();
        this.updateTaskDisplays();
    },

    //  Get icon based on task type 
    getIconForType(type) {
        const icons = {
            'traveling': '🚶',
            'eating': '🍖',
            'drinking': '🍺',
            'crafting': '🔨',
            'farming': '🌾',
            'mining': '',
            'trading': '💱',
            'resting': '😴',
            'fighting': '',
            'exploring': '🧭',
            'gathering': '🧺',
            'fishing': '🎣',
            'cooking': '🍳',
            'shopping': '🛒',
            'idle': '😐'
        };
        return icons[type] || '❓';
    },

    //  Clear current task (revert to idle) 
    clearTask() {
        this.currentTask = null;
        this.updateTaskDisplays();
    },

    //  Get current task (determines what player is doing) 
    getCurrentTask() {
        //  Check if traveling 
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            const dest = TravelSystem.playerPosition.destination;
            const progress = Math.round((TravelSystem.playerPosition.travelProgress || 0) * 100);
            return {
                type: 'traveling',
                action: 'Traveling',
                detail: `to ${dest?.name || 'destination'} (${progress}%)`,
                icon: '🚶'
            };
        }

        //  Check for active crafting
        if (typeof CraftingSystem !== 'undefined' && CraftingSystem.currentCrafting) {
            const craft = CraftingSystem.currentCrafting;
            return {
                type: 'crafting',
                action: 'Crafting',
                detail: craft.itemName || 'something',
                icon: '🔨'
            };
        }

        //  Check for active gathering 
        if (typeof ResourceGatheringSystem !== 'undefined' && ResourceGatheringSystem.isGathering) {
            const resource = ResourceGatheringSystem.currentResource;
            return {
                type: 'gathering',
                action: 'Gathering',
                detail: resource?.name || 'resources',
                icon: this.getGatheringIcon(resource?.type)
            };
        }

        //  Check for active trading 
        if (typeof TradingSystem !== 'undefined' && TradingSystem.isTrading) {
            return {
                type: 'trading',
                action: 'Trading',
                detail: 'at the market',
                icon: '💱'
            };
        }

        //  Check if there's a manually set task 
        if (this.currentTask && (Date.now() - this.currentTask.startTime < 30000)) {
            return this.currentTask;
        }

        //  Default to idle 
        return this.getIdleTask();
    },

    //  Get gathering icon based on resource type 
    getGatheringIcon(resourceType) {
        const icons = {
            'wood': '🪓',
            'ore': '',
            'herb': '🌿',
            'fish': '🎣',
            'stone': '🪨',
            'food': '🌾',
            'water': '💧'
        };
        return icons[resourceType] || '🧺';
    },

    //  Get a random idle task 
    getIdleTask() {
        const seed = Math.floor(Date.now() / 30000);
        const index = seed % this.idleMessages.length;
        const idle = this.idleMessages[index];
        return {
            type: 'idle',
            action: idle.action,
            detail: null,
            icon: idle.icon
        };
    },

    //  Update all task displays on the page
    updateTaskDisplays() {
        const charTaskDisplay = document.getElementById('current-task-display');
        if (charTaskDisplay && typeof game !== 'undefined' && game.getCurrentTaskHTML) {
            charTaskDisplay.innerHTML = game.getCurrentTaskHTML();
        }

        const statusTaskDisplay = document.getElementById('status-current-task');
        if (statusTaskDisplay) {
            const task = this.getCurrentTask();
            statusTaskDisplay.innerHTML = `${task.icon} ${task.action}${task.detail ? ': ' + task.detail : ''}`;
        }
    },

    //  Convenience methods for common actions 

    startEating(itemName) {
        this.setTask('eating', 'Eating', itemName, '🍖');
        setTimeout(() => this.clearTask(), 3000);
    },

    startDrinking(itemName) {
        this.setTask('drinking', 'Drinking', itemName, '🍺');
        setTimeout(() => this.clearTask(), 2000);
    },

    startCrafting(itemName) {
        this.setTask('crafting', 'Crafting', itemName, '🔨');
    },

    startMining(resourceName) {
        this.setTask('mining', 'Mining', resourceName, '');
    },

    startFarming(cropName) {
        this.setTask('farming', 'Farming', cropName, '🌾');
    },

    startFishing() {
        this.setTask('fishing', 'Fishing', 'patiently waiting...', '🎣');
    },

    startResting() {
        this.setTask('resting', 'Resting', null, '😴');
    },

    startFighting(enemyName) {
        this.setTask('fighting', 'Fighting', enemyName, '');
    },

    // FIX: Store interval ID for cleanup - prevents memory leak
    _updateIntervalId: null,

    //  Initialize - start periodic updates
    init() {
        // Clear existing interval if any - prevents duplicate loops
        if (this._updateIntervalId) {
            clearInterval(this._updateIntervalId);
        }
        this._updateIntervalId = setInterval(() => {
            this.updateTaskDisplays();
        }, 1000);

        console.log('🎯 CurrentTaskSystem initialized - tracking your procrastination in real time 💀');
    },

    // Cleanup method for proper shutdown
    cleanup() {
        if (this._updateIntervalId) {
            clearInterval(this._updateIntervalId);
            this._updateIntervalId = null;
        }
    }
};

//  expose to global scope
window.CurrentTaskSystem = CurrentTaskSystem;

// register with Bootstrap
Bootstrap.register('CurrentTaskSystem', () => CurrentTaskSystem.init(), {
    dependencies: ['game', 'QuestSystem'],
    priority: 130,
    severity: 'optional'
});
