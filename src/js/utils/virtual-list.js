// ═══════════════════════════════════════════════════════════════════════════
// 🖤 VIRTUAL LIST - Rendering Only What the Eye Can See
// ═══════════════════════════════════════════════════════════════════════════
// File Version: 0.81
// Made by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════════════════
// When you have 1000 items but only 10 fit on screen, why render all 1000?
// This is virtual scrolling - the art of being lazy efficiently
// Performance matters when your inventory is overflowing with loot
// ═══════════════════════════════════════════════════════════════════════════

class VirtualList {
    // ═══════════════════════════════════════════════════════════════════════
    // 💀 CONSTRUCTOR - Birth of an efficient list
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Create a virtual list for rendering large datasets efficiently
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.container - The scrollable container element
     * @param {number} options.itemHeight - Height of each item in pixels (fixed)
     * @param {Function} options.renderItem - Function(item, index) => HTML string
     * @param {number} [options.overscan=3] - Extra items to render above/below viewport
     * @param {string} [options.itemClass='virtual-item'] - CSS class for items
     */
    constructor(options) {
        // 🗡️ Required params
        this.container = options.container;
        this.itemHeight = options.itemHeight || 50;
        this.renderItem = options.renderItem;

        // 🦇 Optional params with dark defaults
        this.overscan = options.overscan || 3;
        this.itemClass = options.itemClass || 'virtual-item';

        // ⚰️ Internal state - the beating heart of the void
        this.items = [];
        this.scrollTop = 0;
        this.viewportHeight = 0;
        this.isInitialized = false;

        // 🌙 DOM elements we'll create
        this.scrollContainer = null;
        this.contentWrapper = null;
        this.spacerTop = null;
        this.spacerBottom = null;
        this.itemsContainer = null;

        // 💀 Bind methods to preserve context in the abyss
        this._onScroll = this._onScroll.bind(this);
        this._onResize = this._onResize.bind(this);

        // 🔮 Throttle scroll handler for performance
        this._scrollThrottleId = null;
        this._scrollThrottleDelay = 16; // ~60fps

        // 🖤 Initialize if container exists
        if (this.container) {
            this._init();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🦇 INITIALIZATION - Setting up the dark machinery
    // ═══════════════════════════════════════════════════════════════════════

    _init() {
        // 🖤 Store original container styles
        this.container.style.overflow = 'auto';
        this.container.style.position = 'relative';

        // 🗡️ Create the scroll structure
        this._createScrollStructure();

        // ⚰️ Calculate viewport
        this.viewportHeight = this.container.clientHeight;

        // 🌙 Attach event listeners from the shadows
        this.container.addEventListener('scroll', this._onScroll, { passive: true });
        window.addEventListener('resize', this._onResize, { passive: true });

        this.isInitialized = true;
        console.log('🖤 VirtualList awakens - efficient scrolling enabled');
    }

    _createScrollStructure() {
        // 💀 Clear existing content
        this.container.innerHTML = '';

        // 🖤 Create content wrapper (holds everything)
        this.contentWrapper = document.createElement('div');
        this.contentWrapper.className = 'virtual-list-content';
        this.contentWrapper.style.cssText = 'position: relative; width: 100%;';

        // 🗡️ Top spacer - creates scroll height above visible items
        this.spacerTop = document.createElement('div');
        this.spacerTop.className = 'virtual-list-spacer-top';
        this.spacerTop.style.cssText = 'width: 100%; pointer-events: none;';

        // 🦇 Items container - where the visible items live
        this.itemsContainer = document.createElement('div');
        this.itemsContainer.className = 'virtual-list-items';
        this.itemsContainer.style.cssText = 'width: 100%;';

        // ⚰️ Bottom spacer - creates scroll height below visible items
        this.spacerBottom = document.createElement('div');
        this.spacerBottom.className = 'virtual-list-spacer-bottom';
        this.spacerBottom.style.cssText = 'width: 100%; pointer-events: none;';

        // 🌙 Assemble the dark structure
        this.contentWrapper.appendChild(this.spacerTop);
        this.contentWrapper.appendChild(this.itemsContainer);
        this.contentWrapper.appendChild(this.spacerBottom);
        this.container.appendChild(this.contentWrapper);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🗡️ PUBLIC METHODS - The interface to the darkness
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Set items and re-render the list
     * @param {Array} items - Array of items to render
     */
    setItems(items) {
        this.items = items || [];
        this.render();
    }

    /**
     * 🦇 Update a single item without full re-render
     * @param {number} index - Index of item to update
     * @param {*} newItem - New item data
     */
    updateItem(index, newItem) {
        if (index >= 0 && index < this.items.length) {
            this.items[index] = newItem;
            this.render(); // 💀 For now, full re-render. Could optimize later
        }
    }

    /**
     * ⚰️ Scroll to a specific item index
     * @param {number} index - Index to scroll to
     * @param {string} [align='start'] - 'start', 'center', or 'end'
     */
    scrollToIndex(index, align = 'start') {
        const clampedIndex = Math.max(0, Math.min(index, this.items.length - 1));
        let targetScroll;

        switch (align) {
            case 'center':
                targetScroll = (clampedIndex * this.itemHeight) - (this.viewportHeight / 2) + (this.itemHeight / 2);
                break;
            case 'end':
                targetScroll = ((clampedIndex + 1) * this.itemHeight) - this.viewportHeight;
                break;
            default: // 'start'
                targetScroll = clampedIndex * this.itemHeight;
        }

        this.container.scrollTop = Math.max(0, targetScroll);
    }

    /**
     * 🌙 Scroll to top of list
     */
    scrollToTop() {
        this.container.scrollTop = 0;
    }

    /**
     * 💀 Scroll to bottom of list
     */
    scrollToBottom() {
        this.container.scrollTop = this.items.length * this.itemHeight;
    }

    /**
     * 🖤 Get currently visible item indices
     * @returns {Object} { start: number, end: number }
     */
    getVisibleRange() {
        const { startIndex, endIndex } = this._calculateVisibleRange();
        return { start: startIndex, end: endIndex };
    }

    /**
     * 🗡️ Refresh the list (recalculate and re-render)
     */
    refresh() {
        this.viewportHeight = this.container.clientHeight;
        this.render();
    }

    /**
     * 🦇 Destroy the virtual list and clean up
     */
    destroy() {
        // ⚰️ Remove event listeners
        this.container.removeEventListener('scroll', this._onScroll);
        window.removeEventListener('resize', this._onResize);

        // 🌙 Clear throttle
        if (this._scrollThrottleId) {
            cancelAnimationFrame(this._scrollThrottleId);
        }

        // 💀 Clear DOM
        this.container.innerHTML = '';

        // 🖤 Reset state
        this.items = [];
        this.isInitialized = false;

        console.log('⚰️ VirtualList destroyed - returning to the void');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ⚰️ RENDERING - The art of showing only what matters
    // ═══════════════════════════════════════════════════════════════════════

    render() {
        if (!this.isInitialized || !this.items.length) {
            if (this.itemsContainer) {
                this.itemsContainer.innerHTML = '';
            }
            if (this.spacerTop) {
                this.spacerTop.style.height = '0px';
            }
            if (this.spacerBottom) {
                this.spacerBottom.style.height = '0px';
            }
            return;
        }

        const { startIndex, endIndex, topSpace, bottomSpace } = this._calculateVisibleRange();

        // 🖤 Update spacers
        this.spacerTop.style.height = `${topSpace}px`;
        this.spacerBottom.style.height = `${bottomSpace}px`;

        // 🗡️ Render only visible items
        const visibleItems = this.items.slice(startIndex, endIndex);
        const html = visibleItems.map((item, i) => {
            const actualIndex = startIndex + i;
            const itemHtml = this.renderItem(item, actualIndex);
            return `<div class="${this.itemClass}" data-index="${actualIndex}" style="height: ${this.itemHeight}px;">${itemHtml}</div>`;
        }).join('');

        this.itemsContainer.innerHTML = html;
    }

    _calculateVisibleRange() {
        this.scrollTop = this.container.scrollTop;
        const totalHeight = this.items.length * this.itemHeight;

        // 🦇 Calculate visible range with overscan
        let startIndex = Math.floor(this.scrollTop / this.itemHeight) - this.overscan;
        startIndex = Math.max(0, startIndex);

        let endIndex = Math.ceil((this.scrollTop + this.viewportHeight) / this.itemHeight) + this.overscan;
        endIndex = Math.min(this.items.length, endIndex);

        // ⚰️ Calculate spacer heights
        const topSpace = startIndex * this.itemHeight;
        const bottomSpace = Math.max(0, totalHeight - (endIndex * this.itemHeight));

        return { startIndex, endIndex, topSpace, bottomSpace, totalHeight };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🌙 EVENT HANDLERS - Responding to the user's dark whims
    // ═══════════════════════════════════════════════════════════════════════

    _onScroll() {
        // 💀 Throttle scroll events for performance
        if (this._scrollThrottleId) {
            return;
        }

        this._scrollThrottleId = requestAnimationFrame(() => {
            this._scrollThrottleId = null;
            this.render();
        });
    }

    _onResize() {
        // 🖤 Recalculate viewport on resize
        this.viewportHeight = this.container.clientHeight;
        this.render();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔮 VIRTUAL LIST FACTORY - Easy creation helpers
// ═══════════════════════════════════════════════════════════════════════════

const VirtualListFactory = {
    /**
     * 🖤 Create a virtual list for inventory items
     * @param {HTMLElement} container - Container element
     * @param {Array} items - Inventory items array
     * @param {Function} [customRenderer] - Optional custom render function
     */
    createInventoryList(container, items, customRenderer) {
        return new VirtualList({
            container,
            itemHeight: 60,
            overscan: 5,
            itemClass: 'virtual-inventory-item',
            renderItem: customRenderer || ((item, index) => {
                // 🗡️ Default inventory item renderer
                const emoji = item.emoji || '📦';
                const name = item.name || 'Unknown Item';
                const quantity = item.quantity || 1;
                return `
                    <div class="inventory-item-content">
                        <span class="item-icon">${emoji}</span>
                        <span class="item-name">${name}</span>
                        <span class="item-quantity">x${quantity}</span>
                    </div>
                `;
            }),
            items
        });
    },

    /**
     * 🦇 Create a virtual list for leaderboard entries
     * @param {HTMLElement} container - Container element
     * @param {Array} entries - Leaderboard entries
     */
    createLeaderboardList(container, entries) {
        return new VirtualList({
            container,
            itemHeight: 80,
            overscan: 3,
            itemClass: 'virtual-leaderboard-entry',
            renderItem: (entry, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                return `
                    <div class="leaderboard-entry-content">
                        <span class="entry-rank">${medal}</span>
                        <span class="entry-name">${entry.name || 'Unknown'}</span>
                        <span class="entry-score">${entry.score || 0} gold</span>
                    </div>
                `;
            },
            items: entries
        });
    },

    /**
     * ⚰️ Create a virtual list for NPC dialogue history
     * @param {HTMLElement} container - Container element
     * @param {Array} messages - Chat messages
     */
    createChatList(container, messages) {
        return new VirtualList({
            container,
            itemHeight: 40, // 🌙 Variable height is trickier, using fixed for now
            overscan: 10,
            itemClass: 'virtual-chat-message',
            renderItem: (msg, index) => {
                const isPlayer = msg.sender === 'player';
                const senderClass = isPlayer ? 'chat-player' : 'chat-npc';
                return `
                    <div class="chat-message ${senderClass}">
                        <span class="chat-sender">${msg.sender}:</span>
                        <span class="chat-text">${msg.text}</span>
                    </div>
                `;
            },
            items: messages
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY - Let the efficiency spread
// ═══════════════════════════════════════════════════════════════════════════

window.VirtualList = VirtualList;
window.VirtualListFactory = VirtualListFactory;

console.log('🖤 VirtualList loaded - large lists shall now scroll efficiently');
