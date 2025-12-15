// ═══════════════════════════════════════════════════════════════
// NPC MERCHANT SYSTEM - shopkeepers with trauma and pricing
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const NPCMerchantSystem = {
    // merchant personality types - emotional damage defines their prices
    personalityTypes: {
        GREEDY: {
            id: 'greedy',
            name: 'Greedy',
            description: 'Focuses on profit above all else',
            pricingModifier: 1.3, // Sells 30% higher
            buyingModifier: 0.7, // Buys 30% lower
            haggleSuccess: 0.2, // 20% chance to haggle successfully
            greetings: [
                "Looking to spend some coin? My prices are... fair.",
                "Everything has a price, and mine are firm!",
                "Gold talks, friend. Let's see yours.",
                "You look like someone with deep pockets!"
            ],
            hagglingResponses: {
                success: "Fine, fine! You drive a hard bargain.",
                failure: "My prices are already generous!",
                insult: "Don't waste my time with such pathetic offers!"
            }
        },
        FRIENDLY: {
            id: 'friendly',
            name: 'Friendly',
            description: 'Warm and welcoming, offers fair prices',
            pricingModifier: 1.05, // Sells 5% higher
            buyingModifier: 0.95, // Buys 5% lower
            haggleSuccess: 0.6, // 60% chance to haggle successfully
            greetings: [
                "Welcome, friend! How can I help you today?",
                "Always a pleasure to see a new face!",
                "Come in, come in! Let's make a deal we both love!",
                "Ah, another traveler! What brings you to my shop?"
            ],
            hagglingResponses: {
                success: "You know what? I like you. Deal!",
                failure: "Sorry friend, that's as low as I can go.",
                insult: "Ah, let's not ruin this friendship over a few coins!"
            }
        },
        SHREWD: {
            id: 'shrewd',
            name: 'Shrewd',
            description: 'Clever businessperson, knows value well',
            pricingModifier: 1.15, // Sells 15% higher
            buyingModifier: 0.85, // Buys 15% lower
            haggleSuccess: 0.35, // 35% chance to haggle successfully
            greetings: [
                "I know quality when I see it. Both in goods and customers.",
                "Let's talk business.",
                "I run a tight ship here. No nonsense, just good deals.",
                "You seem like someone who knows value."
            ],
            hagglingResponses: {
                success: "You make a compelling argument. Agreed.",
                failure: "I've calculated my margins carefully. This is my final price.",
                insult: "Please, I've been in this business for decades."
            }
        },
        ECCENTRIC: {
            id: 'eccentric',
            name: 'Eccentric',
            description: 'Quirky and unpredictable',
            pricingModifier: 0.9, // Sells 10% lower (doesn't care about profit)
            buyingModifier: 1.1, // Buys 10% higher (overpays)
            haggleSuccess: 0.8, // 80% chance to haggle (but might go either way!)
            greetings: [
                "The stars told me you'd come today!",
                "Ah! A customer! Or are you? Who can say?",
                "Welcome to my humble... or is it magnificent? ...establishment!",
                "Do you believe in fate? Because I have just the thing for you!"
            ],
            hagglingResponses: {
                success: "Yes! The cosmos align! Take it!",
                failure: "No, no, no! The price is perfect as it is!",
                insult: "Interesting energy you have... let's do this!"
            }
        },
        MYSTERIOUS: {
            id: 'mysterious',
            name: 'Mysterious',
            description: 'Cryptic and secretive',
            pricingModifier: 1.2, // Sells 20% higher
            buyingModifier: 0.8, // Buys 20% lower
            haggleSuccess: 0.4, // 40% chance
            greetings: [
                "...",
                "You seek what I offer.",
                "Few find this place. Fewer leave satisfied.",
                "Speak your desire."
            ],
            hagglingResponses: {
                success: "...Acceptable.",
                failure: "No.",
                insult: "..."
            }
        },
        DESPERATE: {
            id: 'desperate',
            name: 'Desperate',
            description: 'Struggling, willing to make bad deals',
            pricingModifier: 0.8, // Sells 20% lower (needs to move inventory)
            buyingModifier: 1.15, // Buys 15% higher (needs inventory)
            haggleSuccess: 0.9, // 90% chance (accepts almost anything)
            greetings: [
                "Please, take a look at my wares!",
                "I'm running a special today! Everything must go!",
                "Business has been slow... but I have great deals!",
                "I'll make you an offer you can't refuse!"
            ],
            hagglingResponses: {
                success: "Yes! Thank you! You won't regret this!",
                failure: "Please! I can go lower!",
                insult: "I'll take it! I need the sale!"
            }
        }
    },

    // Merchant database
    merchants: {},

    // Merchant reputation system
    reputation: {},

    // daily economy tracking - because even NPCs need income
    lastEconomyUpdate: null,
    economyUpdateInterval: 60, // minutes between NPC purchase simulations

    // awaken the merchant puppets - breathe digital life into the shopkeepers
    init() {
        this.generateMerchants();
        this.loadReputation();
        this.initializeMerchantEconomy();
        console.log('NPC Merchant System initialized - merchants now have actual wallets');
    },

    // give merchants their starting capital - every hollow soul needs gold to function
    initializeMerchantEconomy() {
        Object.values(this.merchants).forEach(merchant => {
            this.calculateMerchantWealth(merchant);
        });
        this.lastEconomyUpdate = TimeSystem ? TimeSystem.getTotalMinutes() : 0;
    },

    // tally this puppet's wealth by counting their inventory - gold equals stock value
    calculateMerchantWealth(merchant) {
        if (!merchant || !merchant.location) return 0;

        // Minimum starting gold so merchants can always trade
        const MIN_MERCHANT_GOLD = 500;

        const location = GameWorld?.locations?.[merchant.location];

        let totalInventoryValue = 0;
        let startingStock = {};

        // sum the value of every item this merchant hoards - their net worth
        if (location && location.marketPrices) {
            Object.entries(location.marketPrices).forEach(([itemId, marketData]) => {
                const item = ItemDatabase?.getItem?.(itemId);
                if (item && marketData.stock > 0) {
                    const itemValue = (marketData.price || item.basePrice || 10) * marketData.stock;
                    totalInventoryValue += itemValue;

                    // Track starting stock for day if not already tracked
                    if (!marketData.startingDayStock) {
                        marketData.startingDayStock = marketData.stock;
                    }
                    startingStock[itemId] = marketData.startingDayStock;
                }
            });
        }

        // Merchant gold = total inventory value, but minimum 500 gold so they can trade
        merchant.maxGold = Math.max(MIN_MERCHANT_GOLD, totalInventoryValue);
        merchant.currentGold = merchant.currentGold ?? merchant.maxGold;
        merchant.startingStock = startingStock;

        return merchant.maxGold;
    },

    // does this hollow merchant have enough gold? check their wallet before purchasing
    canMerchantAfford(merchantId, amount) {
        const merchant = this.merchants[merchantId] || this.getCurrentMerchant();
        if (!merchant) return false;

        // Ensure merchant has gold calculated
        if (typeof merchant.currentGold === 'undefined') {
            this.calculateMerchantWealth(merchant);
        }

        return merchant.currentGold >= amount;
    },

    // drain gold from merchant's purse when they buy from player - empty their wallet
    deductMerchantGold(merchantId, amount, reason = '') {
        const merchant = this.merchants[merchantId] || this.getCurrentMerchant();
        if (!merchant) return false;

        if (!this.canMerchantAfford(merchantId, amount)) {
            return false;
        }

        merchant.currentGold = Math.max(0, merchant.currentGold - amount);
        console.log(`${merchant.name} paid ${amount} gold${reason ? ` for ${reason}` : ''}. Remaining: ${merchant.currentGold}`);
        return true;
    },

    // fatten the merchant's wallet when they sell to the player - fill their purse
    addMerchantGold(merchantId, amount) {
        const merchant = this.merchants[merchantId] || this.getCurrentMerchant();
        if (!merchant) return;

        // Ensure merchant has gold calculated
        if (typeof merchant.maxGold === 'undefined') {
            this.calculateMerchantWealth(merchant);
        }

        // Gold is capped at max inventory value
        merchant.currentGold = Math.min(merchant.maxGold, (merchant.currentGold || 0) + amount);
    },

    // simulate NPC purchases throughout the day - the invisible customers
    simulateNPCPurchases() {
        if (!TimeSystem) return;

        const currentTime = TimeSystem.getTotalMinutes();
        const currentHour = TimeSystem.currentTime?.hour || 0;

        // Only simulate during business hours (6 AM to 10 PM)
        if (currentHour < 6 || currentHour > 22) return;

        // measure how much of the business day has elapsed - dawn to dusk progression
        const dayProgress = Math.min(1, Math.max(0, (currentHour - 6) / 16));

        // Target: items deplete to 25% by end of day
        const targetStockPercent = 1 - (dayProgress * 0.75); // Start at 100%, end at 25%

        Object.values(this.merchants).forEach(merchant => {
            if (!merchant.location) return;

            const location = GameWorld?.locations?.[merchant.location];
            if (!location || !location.marketPrices) return;

            Object.entries(location.marketPrices).forEach(([itemId, marketData]) => {
                if (!marketData.startingDayStock || marketData.startingDayStock <= 0) return;

                const targetStock = Math.ceil(marketData.startingDayStock * targetStockPercent);
                const currentStock = marketData.stock || 0;

                // If we have more than target, NPCs "buy" some
                if (currentStock > targetStock) {
                    // Random chance to not deplete (makes it feel organic)
                    if (Math.random() > 0.7) return;

                    // simulate invisible customer purchases - phantom buyers drain stock
                    const purchaseAmount = Math.min(
                        currentStock - targetStock,
                        Math.floor(Math.random() * 3) + 1
                    );

                    if (purchaseAmount > 0) {
                        const item = ItemDatabase?.getItem?.(itemId);
                        const salePrice = marketData.price || item?.basePrice || 10;
                        const totalSale = salePrice * purchaseAmount;

                        // Decrease stock
                        marketData.stock = Math.max(0, currentStock - purchaseAmount);

                        // Increase merchant gold (capped at max)
                        merchant.currentGold = Math.min(
                            merchant.maxGold || totalSale * 10,
                            (merchant.currentGold || 0) + totalSale
                        );
                    }
                }
            });
        });

        this.lastEconomyUpdate = currentTime;
    },

    // reset daily economy - new day, new hustle
    resetDailyEconomy() {
        Object.values(this.merchants).forEach(merchant => {
            if (!merchant.location) return;

            const location = GameWorld?.locations?.[merchant.location];
            if (!location || !location.marketPrices) return;

            // Reset starting stock for new day
            Object.entries(location.marketPrices).forEach(([itemId, marketData]) => {
                marketData.startingDayStock = marketData.stock;
            });

            // Recalculate max gold based on new inventory
            this.calculateMerchantWealth(merchant);

            // merchants regenerate 30% of missing gold each day - simulates overnight sales
            // broke bastards recover slowly, capitalism never sleeps
            const missingGold = merchant.maxGold - (merchant.currentGold || 0);
            if (missingGold > 0) {
                const regenerated = Math.floor(missingGold * 0.3);
                merchant.currentGold = Math.min(merchant.maxGold, (merchant.currentGold || 0) + regenerated);
                console.log(`💰 ${merchant.name} recovered ${regenerated} gold overnight. Now: ${merchant.currentGold}/${merchant.maxGold}`);
            }
        });

        console.log('Daily merchant economy reset - fresh wallets for all');
    },

    // assess this puppet's financial health - how full is their coin purse?
    getMerchantFinances(merchantId) {
        const merchant = this.merchants[merchantId] || this.getCurrentMerchant();
        if (!merchant) return null;

        // Ensure finances are calculated
        if (typeof merchant.currentGold === 'undefined') {
            this.calculateMerchantWealth(merchant);
        }

        const goldPercent = merchant.maxGold > 0
            ? Math.round((merchant.currentGold / merchant.maxGold) * 100)
            : 0;

        let wealthStatus = 'flush'; // Has lots of gold
        if (goldPercent < 25) wealthStatus = 'broke';
        else if (goldPercent < 50) wealthStatus = 'tight';
        else if (goldPercent < 75) wealthStatus = 'comfortable';

        return {
            currentGold: Math.floor(merchant.currentGold || 0),
            maxGold: Math.floor(merchant.maxGold || 0),
            goldPercent: goldPercent,
            wealthStatus: wealthStatus,
            canTrade: (merchant.currentGold || 0) > 0
        };
    },

    // let broke merchants whine about their empty wallets - poverty has a voice
    getWealthDialogue(merchant) {
        const finances = this.getMerchantFinances(merchant?.id);
        if (!finances) return '';

        const brokeDialogues = [
            "gold's tighter than a miser's fist today. might not be able to buy much.",
            "business has been... slow. my coin purse weeps.",
            "the other traders have bled me dry. hope you're selling cheap.",
            "i'm running on fumes here. don't expect top coin for your wares."
        ];

        const tightDialogues = [
            "coin's a bit short today. let's keep trades reasonable.",
            "not my richest day. might have to pass on expensive goods.",
            "the market's been rough. my buying power is... limited."
        ];

        const comfortableDialogues = [
            "business is decent. let's see what you've got.",
            "my purse is healthy enough. show me your wares.",
            "trade's been fair. i can make a deal or two."
        ];

        const flushDialogues = [
            "gold's flowing like ale at a festival! what are you selling?",
            "prosperous times! i'm buying quality goods at fair prices.",
            "my coffers overflow! well, almost. let's trade."
        ];

        let dialogues;
        switch (finances.wealthStatus) {
            case 'broke': dialogues = brokeDialogues; break;
            case 'tight': dialogues = tightDialogues; break;
            case 'comfortable': dialogues = comfortableDialogues; break;
            default: dialogues = flushDialogues;
        }

        return dialogues[Math.floor(Math.random() * dialogues.length)];
    },

    // tick the economic engine - simulate the invisible market every hour
    updateEconomy() {
        if (!TimeSystem) return;

        const currentTime = TimeSystem.getTotalMinutes();
        const timeSinceUpdate = currentTime - (this.lastEconomyUpdate || 0);

        // hourly tick - phantom customers drain stock, merchants gain gold
        if (timeSinceUpdate >= this.economyUpdateInterval) {
            this.simulateNPCPurchases();
        }

        // midnight passed? reset the economy for a new day
        const currentDay = TimeSystem.currentTime?.day || 1;
        if (this.lastEconomyDay !== currentDay) {
            this.resetDailyEconomy();
            this.lastEconomyDay = currentDay;
        }
    },

    // Generate merchants for each location
    generateMerchants() {
        // Get all locations from GameWorld if available, otherwise use fallback list
        let locations = [];
        if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
            locations = Object.keys(GameWorld.locations);
        } else {
            // Fallback list if GameWorld isn't loaded yet
            locations = [
                'greendale', 'riverwood', 'western_watch', 'royal_capital', 'northern_outpost',
                'jade_harbor', 'silverkeep', 'sunhaven', 'frostholm_village', 'vineyard_village',
                'darkwood_village', 'hillcrest', 'meadowbrook', 'coastal_village', 'mountain_pass',
                'desert_oasis', 'lakeside_town', 'forest_clearing', 'ancient_ruins', 'trading_post'
            ];
        }

        const merchantFirstNames = [
            'Aldric', 'Mira', 'Thorin', 'Elara', 'Garrett', 'Lysa', 'Marcus', 'Seraphina',
            'Boris', 'Celeste', 'Viktor', 'Helena', 'Orin', 'Freya', 'Magnus', 'Isolde',
            'Rowan', 'Gwendolyn', 'Bartholomew', 'Astrid', 'Edmund', 'Rosalind', 'Percival', 'Beatrix'
        ];

        const merchantLastNames = [
            'Goldweaver', 'Swifthand', 'Ironpurse', 'Moonwhisper', 'Coinsworth', 'Fairweather',
            'Blackmarket', 'Starlight', 'Grumblefoot', 'Dreamweaver', 'Shadowdealer', 'Brightcoin',
            'Stoutbelly', 'Silvertongue', 'Copperkettle', 'Ironbark', 'Meadowsweet', 'Thornwood',
            'Riverstone', 'Hillcrest', 'Nightingale', 'Whitecliff', 'Redforge', 'Greenleaf'
        ];

        locations.forEach((locationId, index) => {
            const firstName = merchantFirstNames[index % merchantFirstNames.length];
            const lastName = merchantLastNames[(index + 7) % merchantLastNames.length]; // offset for variety
            const personalityKeys = Object.keys(this.personalityTypes);
            const personalityId = personalityKeys[Math.floor(Math.random() * personalityKeys.length)];
            const personality = this.personalityTypes[personalityId];

            this.merchants[locationId] = {
                id: `merchant_${locationId}`,
                name: `${firstName} ${lastName}`,
                firstName: firstName,
                lastName: lastName,
                location: locationId,
                personality: personality,
                specialties: this.generateSpecialties(),
                inventory: {},
                timesTraded: 0,
                totalGoldTraded: 0,
                lastTrade: null,
                relationship: 0 // -100 to 100
            };
        });

        console.log(`🧙 NPCMerchantSystem: Generated ${Object.keys(this.merchants).length} merchants for all locations`);
    },

    // Generate merchant specialties (items they have unique or in bulk)
    generateSpecialties() {
        const specialtyCategories = ['FOOD', 'MATERIALS', 'LUXURY', 'EQUIPMENT'];
        const numSpecialties = Math.floor(Math.random() * 2) + 1; // 1-2 specialties

        const specialties = [];
        for (let i = 0; i < numSpecialties; i++) {
            const category = specialtyCategories[Math.floor(Math.random() * specialtyCategories.length)];
            if (!specialties.includes(category)) {
                specialties.push(category);
            }
        }

        return specialties;
    },

    // Get merchant for current location
    getCurrentMerchant() {
        if (!game.currentLocation) return null;
        return this.merchants[game.currentLocation.id];
    },

    // Get merchant greeting
    getGreeting(merchantId) {
        const merchant = this.merchants[merchantId] || this.getCurrentMerchant();
        if (!merchant) return "Welcome!";

        const greetings = merchant.personality.greetings;
        let greeting = greetings[Math.floor(Math.random() * greetings.length)];

        // Add relationship-based suffix
        if (merchant.relationship > 50) {
            greeting += " Always good to see a valued customer!";
        } else if (merchant.relationship < -50) {
            greeting += " ...What do you want?";
        }

        return greeting;
    },

    // Calculate price with merchant personality and relationship
    calculatePrice(basePrice, merchant, isSelling = true) {
        if (!merchant) return basePrice;

        let modifier = isSelling
            ? merchant.personality.pricingModifier
            : merchant.personality.buyingModifier;

        // Adjust based on relationship (-10% to +10% based on -100 to 100 relationship)
        const relationshipModifier = 1 - (merchant.relationship / 1000);
        modifier *= relationshipModifier;

        return Math.round(basePrice * modifier);
    },

    // Attempt to haggle
    haggle(merchant, originalPrice, playerOffer) {
        if (!merchant) return { success: false, message: 'No merchant found.' };

        const priceGap = Math.abs(originalPrice - playerOffer) / originalPrice;
        const baseChance = merchant.personality.haggleSuccess;

        // Adjust chance based on how reasonable the offer is
        let haggleChance = baseChance;
        if (priceGap < 0.1) {
            haggleChance += 0.3; // Offering within 10% of price
        } else if (priceGap < 0.2) {
            haggleChance += 0.1; // Offering within 20% of price
        } else if (priceGap > 0.5) {
            haggleChance -= 0.3; // Offering more than 50% different
        }

        // Relationship bonus
        haggleChance += (merchant.relationship / 200); // -0.5 to +0.5

        const success = Math.random() < haggleChance;
        let response;

        if (success) {
            // Calculate final price (compromise between original and offer)
            const finalPrice = Math.round((originalPrice + playerOffer) / 2);
            response = merchant.personality.hagglingResponses.success;
            merchant.relationship += 5; // Improve relationship
            return { success: true, finalPrice, message: response };
        } else {
            if (priceGap > 0.5) {
                response = merchant.personality.hagglingResponses.insult;
                merchant.relationship -= 5; // Worsen relationship
            } else {
                response = merchant.personality.hagglingResponses.failure;
            }
            return { success: false, message: response };
        }
    },

    // Complete trade with merchant
    completeTrade(merchant, goldAmount) {
        if (!merchant) return;

        merchant.timesTraded++;
        merchant.totalGoldTraded += goldAmount;
        merchant.lastTrade = Date.now();

        // Improve relationship based on trade size
        const relationshipGain = Math.min(Math.floor(goldAmount / 100), 10);
        merchant.relationship = Math.min(100, merchant.relationship + relationshipGain);

        this.saveReputation();
    },

    // Get merchant stock (modified based on specialties)
    getMerchantStock(merchant, baseMarketItems) {
        if (!merchant) return baseMarketItems;

        const modifiedStock = { ...baseMarketItems };

        // Increase quantity and variety for specialty items
        merchant.specialties.forEach(specialty => {
            Object.entries(modifiedStock).forEach(([itemId, itemData]) => {
                const item = ItemDatabase.getItem(itemId);
                if (item?.category === specialty) {
                    // Specialty items have 2x quantity
                    modifiedStock[itemId] = {
                        ...itemData,
                        quantity: (itemData.quantity || 0) * 2
                    };
                }
            });
        });

        return modifiedStock;
    },

    // Get merchant dialogue
    getDialogue(merchant, situation = 'idle') {
        if (!merchant) return '';

        const dialogues = {
            idle: [
                `${merchant.firstName} is organizing some goods on the shelves.`,
                `${merchant.firstName} nods at you as you browse.`,
                `${merchant.firstName} appears to be counting inventory.`,
                `${merchant.firstName} watches you with interest.`
            ],
            highReputation: [
                `${merchant.firstName} smiles warmly. "My favorite customer!"`,
                `"Ah, ${game.player?.name || 'friend'}! I saved something special for you!"`,
                `"Your business has been a blessing. Please, let me know if you need anything."`,
                `"I always look forward to our trades!"`
            ],
            lowReputation: [
                `${merchant.firstName} eyes you warily.`,
                `"I hope you're here to make amends..."`,
                `${merchant.firstName} doesn't seem pleased to see you.`,
                `"Let's keep this brief."`
            ],
            afterGoodDeal: [
                `"Pleasure doing business with you!"`,
                `"Come back anytime!"`,
                `${merchant.firstName} seems satisfied with the trade.`,
                `"A fair deal for both of us!"`
            ],
            afterBadDeal: [
                `${merchant.firstName} looks displeased.`,
                `"I won't forget this..."`,
                `${merchant.firstName} grumbles under their breath.`,
                `"Next time I won't be so generous."`
            ]
        };

        // Select appropriate dialogue set
        let dialogueSet = dialogues.idle;

        if (situation === 'idle') {
            if (merchant.relationship > 50) {
                dialogueSet = dialogues.highReputation;
            } else if (merchant.relationship < -30) {
                dialogueSet = dialogues.lowReputation;
            }
        } else if (dialogues[situation]) {
            dialogueSet = dialogues[situation];
        }

        return dialogueSet[Math.floor(Math.random() * dialogueSet.length)];
    },

    // Save merchant reputation
    saveReputation() {
        const reputationData = {};

        Object.entries(this.merchants).forEach(([locationId, merchant]) => {
            reputationData[locationId] = {
                relationship: merchant.relationship,
                timesTraded: merchant.timesTraded,
                totalGoldTraded: merchant.totalGoldTraded,
                lastTrade: merchant.lastTrade
            };
        });

        localStorage.setItem('merchantReputation', JSON.stringify(reputationData));
    },

    // Load merchant reputation
    loadReputation() {
        const saved = localStorage.getItem('merchantReputation');
        if (!saved) return;

        try {
            const reputationData = JSON.parse(saved);

            Object.entries(reputationData).forEach(([locationId, data]) => {
                if (this.merchants[locationId]) {
                    this.merchants[locationId].relationship = data.relationship;
                    this.merchants[locationId].timesTraded = data.timesTraded;
                    this.merchants[locationId].totalGoldTraded = data.totalGoldTraded;
                    this.merchants[locationId].lastTrade = data.lastTrade;
                }
            });

            console.log('Merchant reputation loaded');
        } catch (error) {
            // corrupt reputation data - start fresh
            console.warn('Merchant reputation reset - previous data corrupt');
        }
    },

    // Get merchant info display
    getMerchantInfo(merchant) {
        if (!merchant) return null;

        const relationshipText = this.getRelationshipText(merchant.relationship);
        const specialtiesText = merchant.specialties.join(', ');

        return {
            name: merchant.name,
            personality: merchant.personality.name,
            relationship: relationshipText,
            specialties: specialtiesText,
            tradesCompleted: merchant.timesTraded
        };
    },

    // Get relationship text
    getRelationshipText(relationship) {
        if (relationship >= 75) return '💚 Excellent';
        if (relationship >= 50) return '💙 Good';
        if (relationship >= 25) return '💛 Friendly';
        if (relationship >= 0) return '⚪ Neutral';
        if (relationship >= -25) return '🟡 Cautious';
        if (relationship >= -50) return '🟠 Unfriendly';
        return '🔴 Hostile';
    },

    // open merchant shop - what everyone's been crashing on
    openMerchantShop(npc) {
        if (!npc) {
            console.warn('💰 openMerchantShop called with no NPC');
            if (typeof addMessage === 'function') {
                addMessage('No merchant available to trade with.', 'warning');
            }
            return false;
        }

        console.log(`💰 Opening merchant shop for ${npc.name || npc.id}`);

        // Set as current merchant for the system
        this.setCurrentMerchant(npc.id || npc.locationId || game.currentLocation);

        // Open the NPC trade window - the actual trading UI
        if (typeof NPCTradeWindow !== 'undefined' && NPCTradeWindow.open) {
            NPCTradeWindow.open(npc, 'trade');
            return true;
        }

        // Fallback: try to open market panel if at market location
        if (typeof openMarket === 'function' && typeof locationHasMarket === 'function' && locationHasMarket()) {
            openMarket();
            return true;
        }

        // Last resort: message
        if (typeof addMessage === 'function') {
            addMessage(`${npc.name || 'Merchant'} gestures at their wares, but the shop interface is unavailable.`, 'info');
        }
        console.warn('💰 No trade interface available for merchant');
        return false;
    },

    // track current merchant for trade session
    _currentMerchant: null,

    // set current merchant for trade context
    setCurrentMerchant(merchantId) {
        this._currentMerchant = merchantId;
        console.log(`💰 Current merchant set to: ${merchantId}`);
    },

    // get current merchant id
    getCurrentMerchant() {
        return this._currentMerchant;
    },

    // get save data for per-slot persistence - no more global localStorage exploit!
    getSaveData() {
        const merchantData = {};

        Object.entries(this.merchants).forEach(([locationId, merchant]) => {
            merchantData[locationId] = {
                // Relationship and trade history
                relationship: merchant.relationship || 0,
                timesTraded: merchant.timesTraded || 0,
                totalGoldTraded: merchant.totalGoldTraded || 0,
                lastTrade: merchant.lastTrade || null,
                // Economy state - critical for preventing exploit!
                currentGold: merchant.currentGold || 0,
                maxGold: merchant.maxGold || 0,
                startingStock: merchant.startingStock || {}
            };
        });

        return {
            merchants: merchantData,
            lastEconomyUpdate: this.lastEconomyUpdate,
            lastEconomyDay: this.lastEconomyDay
        };
    },

    // load save data - restore merchant economy from save slot
    loadSaveData(saveData) {
        if (!saveData || !saveData.merchants) {
            console.warn('No merchant save data to load');
            return;
        }

        Object.entries(saveData.merchants).forEach(([locationId, data]) => {
            if (this.merchants[locationId]) {
                const merchant = this.merchants[locationId];
                // Restore relationship and trade history
                merchant.relationship = data.relationship ?? 0;
                merchant.timesTraded = data.timesTraded ?? 0;
                merchant.totalGoldTraded = data.totalGoldTraded ?? 0;
                merchant.lastTrade = data.lastTrade ?? null;
                // Restore economy state
                merchant.currentGold = data.currentGold ?? 0;
                merchant.maxGold = data.maxGold ?? 0;
                merchant.startingStock = data.startingStock ?? {};
            }
        });

        // Restore economy timing
        this.lastEconomyUpdate = saveData.lastEconomyUpdate ?? null;
        this.lastEconomyDay = saveData.lastEconomyDay ?? null;

        console.log('Merchant economy state restored from save');
    }
};

// register with Bootstrap
Bootstrap.register('NPCMerchantSystem', () => NPCMerchantSystem.init(), {
    dependencies: ['NPCManager', 'ItemDatabase', 'TradingSystem'],
    priority: 58,
    severity: 'optional'
});
