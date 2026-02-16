// 
// CRAFTING ENGINE - turning failure into profit
// 
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const CraftingEngine = {
    // Active crafting jobs
    craftingQueue: [],
    maxQueueSize: 5,

    // Track crafting statistics
    stats: {
        totalCrafted: 0,
        totalFailed: 0,
        itemsCrafted: {} // { itemId: count }
    },

    // 
    //  INITIALIZATION
    // 

    init() {
        console.log('🔨 CraftingEngine: Firing up the forge...');

        // Register with game loop if available
        if (typeof EventBus !== 'undefined') {
            EventBus.on(EventBus.EVENTS?.TIME_TICK || 'time:tick', () => this.update());
        }

        // Load any in-progress crafts from save
        this.loadState();

        console.log('🔨 CraftingEngine: Ready to craft');
    },

    // 
    //  CAN CRAFT CHECK
    // 

    /**
     * Check if player can craft a recipe
     * @param {string} recipeId - Recipe ID from UnifiedItemSystem.recipes
     * @param {number} quantity - How many to craft (default 1)
     * @returns {{ can: boolean, reason: string, missing?: object }}
     */
    canCraft(recipeId, quantity = 1) {
        // Get recipe
        const recipe = this.getRecipe(recipeId);
        if (!recipe) {
            return { can: false, reason: `Recipe '${recipeId}' not found` };
        }

        // Check queue capacity
        if (this.craftingQueue.length >= this.maxQueueSize) {
            return { can: false, reason: 'Crafting queue is full' };
        }

        // Check materials
        const materialCheck = this.checkMaterials(recipe, quantity);
        if (!materialCheck.hasAll) {
            return {
                can: false,
                reason: 'Missing materials',
                missing: materialCheck.missing
            };
        }

        // Check facility access
        if (recipe.facility && recipe.facility !== 'none') {
            if (!this.hasFacilityAccess(recipe.facility)) {
                return {
                    can: false,
                    reason: `Requires access to ${this.formatFacilityName(recipe.facility)}`
                };
            }
        }

        // Check skill requirements
        if (recipe.skillRequired && recipe.skillRequired > 0) {
            const playerSkill = this.getPlayerSkillLevel(recipe.skillType);
            if (playerSkill < recipe.skillRequired) {
                return {
                    can: false,
                    reason: `Requires ${recipe.skillType} level ${recipe.skillRequired} (you have ${playerSkill})`
                };
            }
        }

        return { can: true };
    },

    /**
     * Check if player has all required materials
     */
    checkMaterials(recipe, quantity) {
        const missing = {};
        let hasAll = true;

        for (const input of recipe.inputs) {
            const required = input.quantity * quantity;
            const playerHas = this.getPlayerItemCount(input.item);

            if (playerHas < required) {
                hasAll = false;
                missing[input.item] = {
                    required,
                    have: playerHas,
                    need: required - playerHas
                };
            }
        }

        return { hasAll, missing };
    },

    // 
    //  START CRAFTING
    // 

    /**
     * Start crafting an item
     * @param {string} recipeId - Recipe to craft
     * @param {number} quantity - How many to craft
     * @returns {{ success: boolean, job?: object, reason?: string }}
     */
    startCraft(recipeId, quantity = 1) {
        // Validate
        const canCraft = this.canCraft(recipeId, quantity);
        if (!canCraft.can) {
            this.showMessage(`Cannot craft: ${canCraft.reason}`, 'warning');
            return { success: false, reason: canCraft.reason };
        }

        const recipe = this.getRecipe(recipeId);

        // Remove materials from inventory
        for (const input of recipe.inputs) {
            const removeAmount = input.quantity * quantity;
            this.removePlayerItem(input.item, removeAmount);
        }

        // Calculate craft time (in game minutes)
        const craftTime = recipe.time * quantity;
        const currentTime = this.getCurrentGameTime();

        // Create crafting job
        const job = {
            id: `craft_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
            recipeId,
            quantity,
            startTime: currentTime,
            endTime: currentTime + craftTime,
            progress: 0,
            recipe: {
                outputItem: recipe.output.item,
                outputQuantity: recipe.output.quantity,
                skillType: recipe.skillType,
                skillGain: recipe.skillGain || 0
            }
        };

        // Add to queue
        this.craftingQueue.push(job);

        // Emit event
        this.emitEvent('crafting:started', job);

        // Show message
        const itemName = this.getItemName(recipe.output.item);
        this.showMessage(`Started crafting ${quantity > 1 ? quantity + 'x ' : ''}${itemName}...`);

        console.log('🔨 CraftingEngine: Started job', job);

        return { success: true, job };
    },

    /**
     * Cancel a crafting job (refunds 50% materials)
     */
    cancelCraft(jobId) {
        const jobIndex = this.craftingQueue.findIndex(j => j.id === jobId);
        if (jobIndex === -1) {
            return { success: false, reason: 'Job not found' };
        }

        const job = this.craftingQueue[jobIndex];
        const recipe = this.getRecipe(job.recipeId);

        // Refund 50% of materials
        for (const input of recipe.inputs) {
            const refundAmount = Math.floor((input.quantity * job.quantity) * 0.5);
            if (refundAmount > 0) {
                this.addPlayerItem(input.item, refundAmount);
            }
        }

        // Remove from queue
        this.craftingQueue.splice(jobIndex, 1);

        // Emit event
        this.emitEvent('crafting:cancelled', job);

        const itemName = this.getItemName(recipe.output.item);
        this.showMessage(`Cancelled crafting ${itemName}. 50% materials refunded.`, 'warning');

        return { success: true };
    },

    // 
    // UPDATE / PROGRESS
    // 

    /**
     * Update crafting progress (called each game tick)
     */
    update() {
        if (this.craftingQueue.length === 0) return;

        const currentTime = this.getCurrentGameTime();

        // Process queue from end to start (so we can remove completed jobs)
        for (let i = this.craftingQueue.length - 1; i >= 0; i--) {
            const job = this.craftingQueue[i];

            // Calculate progress (0 to 1)
            const totalTime = job.endTime - job.startTime;
            const elapsed = currentTime - job.startTime;
            job.progress = Math.min(1, elapsed / totalTime);

            // Check if complete
            if (currentTime >= job.endTime) {
                this.completeCraft(job);
                this.craftingQueue.splice(i, 1);
            }
        }
    },

    /**
     * Complete a crafting job
     */
    completeCraft(job) {
        const recipe = this.getRecipe(job.recipeId);

        // Calculate output with potential quality bonus
        const baseOutput = recipe.output.quantity * job.quantity;
        const bonusOutput = this.calculateQualityBonus(recipe, job.quantity);
        const totalOutput = baseOutput + bonusOutput;

        // Add crafted items to inventory
        this.addPlayerItem(recipe.output.item, totalOutput);

        // Grant skill XP
        if (job.recipe.skillType && job.recipe.skillGain) {
            this.grantSkillXP(job.recipe.skillType, job.recipe.skillGain * job.quantity);
        }

        // Update statistics
        this.stats.totalCrafted += totalOutput;
        this.stats.itemsCrafted[recipe.output.item] = (this.stats.itemsCrafted[recipe.output.item] || 0) + totalOutput;

        // Emit event
        this.emitEvent('crafting:completed', {
            job,
            output: { item: recipe.output.item, quantity: totalOutput },
            bonus: bonusOutput
        });

        // Achievement tracking
        this.trackAchievement('craft', recipe.output.item, totalOutput);

        // Show success message
        const itemName = this.getItemName(recipe.output.item);
        let message = `Crafted ${totalOutput}x ${itemName}!`;
        if (bonusOutput > 0) {
            message += ` (+${bonusOutput} bonus)`;
        }
        this.showMessage(message, 'success');

        console.log('🔨 CraftingEngine: Completed', job.recipeId, totalOutput);
    },

    /**
     * Calculate bonus output based on skill level
     * 🖤 FIXED: Capped at 50% chance max + diminishing returns 💀
     */
    calculateQualityBonus(recipe, quantity) {
        if (!recipe.skillType) return 0;

        const skillLevel = this.getPlayerSkillLevel(recipe.skillType);
        //  Diminishing returns: 3% per level, capped at 30% max chance (not 50% at lvl 10)
        const baseChance = Math.min(0.03 * skillLevel, 0.30);

        let bonus = 0;
        for (let i = 0; i < quantity; i++) {
            if (Math.random() < baseChance) {
                bonus++;
            }
        }

        //  Cap total bonus to 25% of original quantity - no infinite duplication 
        const maxBonus = Math.floor(quantity * 0.25);
        return Math.min(bonus, maxBonus);
    },

    // 
    //  RECIPE & ITEM HELPERS
    // 

    /**
     * Get a recipe by ID
     */
    getRecipe(recipeId) {
        // Try UnifiedItemSystem first
        if (typeof UnifiedItemSystem !== 'undefined' && UnifiedItemSystem.recipes) {
            return UnifiedItemSystem.recipes[recipeId];
        }
        // Fallback to CraftingEconomySystem
        if (typeof CraftingEconomySystem !== 'undefined' && CraftingEconomySystem.recipes) {
            return CraftingEconomySystem.recipes[recipeId];
        }
        return null;
    },

    /**
     * Get all available recipes
     */
    getAllRecipes() {
        const recipes = {};

        // Get from UnifiedItemSystem
        if (typeof UnifiedItemSystem !== 'undefined' && UnifiedItemSystem.recipes) {
            Object.assign(recipes, UnifiedItemSystem.recipes);
        }

        // Get from CraftingEconomySystem
        if (typeof CraftingEconomySystem !== 'undefined' && CraftingEconomySystem.recipes) {
            Object.assign(recipes, CraftingEconomySystem.recipes);
        }

        return recipes;
    },

    /**
     * Get recipes the player can currently craft
     */
    getAvailableRecipes() {
        const all = this.getAllRecipes();
        const available = {};

        for (const [id, recipe] of Object.entries(all)) {
            const canCraft = this.canCraft(id, 1);
            if (canCraft.can) {
                available[id] = recipe;
            }
        }

        return available;
    },

    /**
     * Get recipes filtered by category or skill
     */
    getRecipesByCategory(category) {
        const all = this.getAllRecipes();
        const filtered = {};

        for (const [id, recipe] of Object.entries(all)) {
            if (recipe.skillType === category || recipe.category === category) {
                filtered[id] = recipe;
            }
        }

        return filtered;
    },

    /**
     * Get item name from ID
     */
    getItemName(itemId) {
        if (typeof ItemDatabase !== 'undefined' && ItemDatabase.items) {
            const item = ItemDatabase.items[itemId];
            if (item) return item.name;
        }
        if (typeof UnifiedItemSystem !== 'undefined') {
            const item = UnifiedItemSystem.items?.[itemId];
            if (item) return item.name;
        }
        // Fallback: format the ID
        return itemId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

    formatFacilityName(facility) {
        return facility.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

    // 
    //  FACILITY ACCESS
    // 

    /**
     * Check if player has access to a facility
     */
    hasFacilityAccess(facility) {
        // No facility required
        if (!facility || facility === 'none') return true;

        // Check player location for public facilities
        const currentLocation = this.getCurrentLocation();
        if (currentLocation?.facilities?.includes(facility)) {
            return true;
        }

        // Check owned properties
        if (typeof PropertySystem !== 'undefined') {
            const properties = PropertySystem.getOwnedProperties?.() || [];
            for (const prop of properties) {
                if (prop.facilities?.includes(facility)) {
                    return true;
                }
                // Check property type for default facilities
                if (this.getDefaultFacilities(prop.type)?.includes(facility)) {
                    return true;
                }
            }
        }

        // Check via game.player.properties
        if (typeof game !== 'undefined' && game.player?.properties) {
            for (const prop of Object.values(game.player.properties)) {
                if (prop.facilities?.includes(facility)) {
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * Get default facilities for a property type
     */
    getDefaultFacilities(propertyType) {
        const defaults = {
            house: ['campfire'],
            shop: [],
            warehouse: [],
            farm: ['campfire'],
            mine: ['smelter'],
            tavern: ['kitchen', 'brewery'],
            market_stall: [],
            craftshop: ['forge', 'workshop', 'loom', 'tannery']
        };
        return defaults[propertyType] || [];
    },

    // 
    //  INVENTORY INTERFACE
    // 

    getPlayerItemCount(itemId) {
        // Try PlayerStateManager (preferred)
        if (typeof PlayerStateManager !== 'undefined') {
            return PlayerStateManager.inventory.getQuantity(itemId);
        }
        // Try InventorySystem
        if (typeof InventorySystem !== 'undefined' && InventorySystem.getItemCount) {
            return InventorySystem.getItemCount(itemId);
        }
        // Fallback to game.player.inventory
        if (typeof game !== 'undefined' && game.player?.inventory) {
            return game.player.inventory[itemId] || 0;
        }
        return 0;
    },

    addPlayerItem(itemId, quantity) {
        // Try PlayerStateManager (preferred)
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.add(itemId, quantity, 'crafting');
            document.dispatchEvent(new CustomEvent('item-received', {
                detail: { item: itemId, quantity: quantity, source: 'crafting' }
            }));
            document.dispatchEvent(new CustomEvent('item-crafted', {
                detail: { item: itemId, itemId: itemId, quantity: quantity }
            }));
            return;
        }
        // Try InventorySystem
        if (typeof InventorySystem !== 'undefined' && InventorySystem.addItem) {
            InventorySystem.addItem(itemId, quantity);
            document.dispatchEvent(new CustomEvent('item-crafted', {
                detail: { item: itemId, itemId: itemId, quantity: quantity }
            }));
            return;
        }
        // Fallback to game.player.inventory
        if (typeof game !== 'undefined' && game.player?.inventory) {
            game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + quantity;
            document.dispatchEvent(new CustomEvent('item-received', {
                detail: { item: itemId, quantity: quantity, source: 'crafting' }
            }));
            document.dispatchEvent(new CustomEvent('item-crafted', {
                detail: { item: itemId, itemId: itemId, quantity: quantity }
            }));
            return;
        }
        console.warn('🔨 CraftingEngine: No inventory system found to add item');
    },

    removePlayerItem(itemId, quantity) {
        // Try PlayerStateManager (preferred)
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.remove(itemId, quantity, 'crafting');
            return;
        }
        // Try InventorySystem
        if (typeof InventorySystem !== 'undefined' && InventorySystem.removeItem) {
            InventorySystem.removeItem(itemId, quantity);
            return;
        }
        // Fallback to game.player.inventory
        if (typeof game !== 'undefined' && game.player?.inventory) {
            game.player.inventory[itemId] = Math.max(0, (game.player.inventory[itemId] || 0) - quantity);
            return;
        }
        console.warn('🔨 CraftingEngine: No inventory system found to remove item');
    },

    // 
    //  SKILL INTERFACE
    // 

    getPlayerSkillLevel(skillType) {
        // Try SkillSystem
        if (typeof SkillSystem !== 'undefined' && SkillSystem.getLevel) {
            return SkillSystem.getLevel(skillType);
        }
        // Try game.player.skills
        if (typeof game !== 'undefined' && game.player?.skills) {
            return game.player.skills[skillType] || 0;
        }
        return 0;
    },

    grantSkillXP(skillType, amount) {
        // Try SkillSystem
        if (typeof SkillSystem !== 'undefined' && SkillSystem.addExperience) {
            SkillSystem.addExperience(skillType, amount);
            return;
        }
        // Try game.player.skills (basic implementation)
        if (typeof game !== 'undefined' && game.player?.skills) {
            // Store XP in a separate object if needed
            if (!game.player.skillXP) game.player.skillXP = {};
            game.player.skillXP[skillType] = (game.player.skillXP[skillType] || 0) + amount;

            // Check for level up (100 XP per level)
            const totalXP = game.player.skillXP[skillType];
            const newLevel = Math.floor(totalXP / 100);
            if (newLevel > (game.player.skills[skillType] || 0)) {
                game.player.skills[skillType] = newLevel;
                this.showMessage(`${skillType} leveled up to ${newLevel}!`, 'success');
            }
            return;
        }
    },

    // 
    //  GAME STATE INTERFACE
    // 

    getCurrentGameTime() {
        // Try TimeSystem
        if (typeof TimeSystem !== 'undefined' && TimeSystem.getTotalMinutes) {
            return TimeSystem.getTotalMinutes();
        }
        // Try game.totalMinutes
        if (typeof game !== 'undefined') {
            return game.totalMinutes || Date.now() / 60000;
        }
        return Date.now() / 60000;
    },

    getCurrentLocation() {
        if (typeof game !== 'undefined') {
            return game.currentLocation;
        }
        if (typeof GameWorld !== 'undefined') {
            return GameWorld.getCurrentLocation?.();
        }
        return null;
    },

    // 
    //  UI INTERFACE
    // 

    showMessage(message, type = 'info') {
        // Try addMessage
        if (typeof addMessage === 'function') {
            addMessage(message, type);
            return;
        }
        // Try NotificationSystem
        if (typeof NotificationSystem !== 'undefined' && NotificationSystem.show) {
            NotificationSystem.show(message, type);
            return;
        }
        // Fallback to console
        console.log(`🔨 [${type}] ${message}`);
    },

    emitEvent(eventName, data) {
        if (typeof EventBus !== 'undefined') {
            EventBus.emit(eventName, data);
        }
    },

    trackAchievement(action, item, quantity) {
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.track) {
            AchievementSystem.track(action, { item, quantity });
        }
    },

    // 
    //  SAVE / LOAD
    // 

    getState() {
        return {
            craftingQueue: this.craftingQueue,
            stats: this.stats
        };
    },

    loadState(state) {
        if (!state) {
            // Try loading from game.player
            if (typeof game !== 'undefined' && game.player?.craftingState) {
                state = game.player.craftingState;
            }
        }
        if (state) {
            this.craftingQueue = state.craftingQueue || [];
            this.stats = state.stats || { totalCrafted: 0, totalFailed: 0, itemsCrafted: {} };
        }
    },

    // 
    //  QUEUE INFO
    // 

    /**
     * Get current crafting queue
     */
    getQueue() {
        return this.craftingQueue.map(job => ({
            ...job,
            itemName: this.getItemName(job.recipe.outputItem),
            timeRemaining: Math.max(0, job.endTime - this.getCurrentGameTime())
        }));
    },

    /**
     * Check if anything is being crafted
     */
    isCrafting() {
        return this.craftingQueue.length > 0;
    },

    /**
     * Get queue capacity info
     */
    getQueueCapacity() {
        return {
            current: this.craftingQueue.length,
            max: this.maxQueueSize,
            available: this.maxQueueSize - this.craftingQueue.length
        };
    }
};

// 
//  EXPOSE GLOBALLY
// 

window.CraftingEngine = CraftingEngine;

// Also expose as CraftingSystem for compatibility
window.CraftingSystem = CraftingEngine;

console.log('🔨 CraftingEngine loaded');
