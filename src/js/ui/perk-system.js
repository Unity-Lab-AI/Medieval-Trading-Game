// ═══════════════════════════════════════════════════════════════
// PERK SYSTEM - your tragic backstory determines your stats
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PerkSystem = {
    // ═══════════════════════════════════════════════════════════════
    // PERK DEFINITIONS - medieval character backgrounds
    // ═══════════════════════════════════════════════════════════════
    perks: {
        lumberjack: {
            id: 'lumberjack',
            name: "Lumberjack",
            description: "You spent years in the forest, felling trees with axe and saw.",
            startingLocation: 'hunters_wood',  // Was darkwood_village (western zone - locked!)
            startingItems: {
                axe: 1,
                simple_clothes: 1,
                leather_boots: 1,
                timber: 3,
                rope: 2,
                bread: 2,
                water: 1
            },
            effects: {
                carryBonus: 0.3,
                woodcuttingBonus: 0.5,
                strengthBonus: 2,
                travelCostReduction: 0.1
            },
            negativeEffects: {
                negotiationPenalty: 0.1
            },
            icon: '🪓'
        },
        disbandedSoldier: {
            id: 'disbandedSoldier',
            name: "Disbanded Soldier",
            description: "You served in the king's army until the regiment was disbanded.",
            startingLocation: 'royal_capital',
            startingItems: {
                iron_sword: 1,
                leather_armor: 1,
                helmet: 1,
                simple_clothes: 1,
                leather_boots: 1,
                bread: 3,
                water: 2,
                bandage: 2
            },
            effects: {
                combatBonus: 0.25,
                strengthBonus: 1,
                enduranceBonus: 1,
                reputationBonus: 5
            },
            negativeEffects: {
                negotiationPenalty: 0.15,
                goldPenalty: 0.1
            },
            icon: '⚔️'
        },
        orphan: {
            id: 'orphan',
            name: "Orphan",
            description: "Growing up alone taught you to survive by any means necessary.",
            startingLocation: 'greendale',
            startingItems: {
                ragged_clothes: 1,
                lockpick: 2,
                bread: 1,
                apple: 2
            },
            effects: {
                stealthBonus: 0.3,
                pickpocketBonus: 0.2,
                luckBonus: 2,
                survivalBonus: 0.2
            },
            negativeEffects: {
                reputationPenalty: 10,
                goldPenalty: 0.3
            },
            icon: '🏚️'
        },
        merchantSon: {
            id: 'merchantSon',
            name: "Merchant's Son",
            description: "Your father's trade routes taught you the art of the deal.",
            startingLocation: 'royal_capital',  // Was merchants_landing (doesn't exist) - royal capital has best markets
            startingItems: {
                fine_clothes: 1,
                leather_boots: 1,
                ledger: 1,
                bread: 2,
                cheese: 2,
                wine: 1
            },
            effects: {
                negotiationBonus: 0.25,
                priceBonus: 0.15,
                charismaBonus: 2,
                goldBonus: 0.5
            },
            negativeEffects: {
                combatPenalty: 0.2,
                carryPenalty: 0.1
            },
            icon: '💰'
        },
        farmersBoy: {
            id: 'farmersBoy',
            name: "Farmer's Boy",
            description: "Years of hard labor on the farm made you strong and resilient.",
            startingLocation: 'wheat_farm',  // Was greendale_farm (doesn't exist) - wheat_farm is in starter zone
            startingItems: {
                pitchfork: 1,
                simple_clothes: 1,
                leather_boots: 1,
                wheat: 5,
                vegetables: 3,
                bread: 3,
                water: 2
            },
            effects: {
                farmingBonus: 0.4,
                enduranceBonus: 2,
                strengthBonus: 1,
                carryBonus: 0.2
            },
            negativeEffects: {
                charisma_penalty: 0.1,
                negotiationPenalty: 0.1
            },
            icon: '🌾'
        },
        nobleOutcast: {
            id: 'nobleOutcast',
            name: "Noble Outcast",
            description: "Disowned by your noble family, you must forge your own path.",
            startingLocation: 'royal_capital',
            startingItems: {
                noble_clothes: 1,
                signet_ring: 1,
                fine_boots: 1,
                wine: 2,
                cheese: 2
            },
            effects: {
                charismaBonus: 3,
                negotiationBonus: 0.2,
                reputationBonus: 15,
                marketAccessBonus: 0.2
            },
            negativeEffects: {
                goldPenalty: 0.2,
                combatPenalty: 0.15,
                survivalPenalty: 0.2
            },
            icon: '👑'
        },
        sailorsDaughter: {
            id: 'sailorsDaughter',
            name: "Sailor's Daughter",
            description: "You grew up on the docks, learning the ways of the sea.",
            startingLocation: 'sunhaven',  // Was port_azure (doesn't exist) - sunhaven is a coastal town in southern zone
            startingItems: {
                sailor_clothes: 1,
                rope: 3,
                fishing_rod: 1,
                fish: 3,
                water: 2,
                compass: 1
            },
            effects: {
                fishingBonus: 0.4,
                navigationBonus: 0.3,
                enduranceBonus: 1,
                travelSpeedBonus: 0.15
            },
            negativeEffects: {
                landNavigationPenalty: 0.1
            },
            icon: '⚓'
        },
        minersSon: {
            id: 'minersSon',
            name: "Miner's Son",
            description: "You spent your youth in the dark tunnels, learning to find precious ore.",
            startingLocation: 'northern_outpost',  // Was iron_mines (northern zone - locked!) - start at gate instead
            startingItems: {
                pickaxe: 1,
                miners_helmet: 1,
                simple_clothes: 1,
                leather_boots: 1,
                iron_ore: 3,
                torch: 2,
                bread: 2
            },
            effects: {
                miningBonus: 0.5,
                strengthBonus: 1,
                enduranceBonus: 1,
                findBonus: 0.2
            },
            negativeEffects: {
                charisma_penalty: 0.15,
                healthPenalty: 0.1
            },
            icon: '⛏️'
        },
        scholarApprentice: {
            id: 'scholarApprentice',
            name: "Scholar's Apprentice",
            description: "Years of study have given you knowledge beyond your years.",
            startingLocation: 'royal_capital',
            startingItems: {
                scholar_robes: 1,
                book: 2,
                quill: 1,
                ink: 1,
                parchment: 3,
                bread: 2,
                candle: 2
            },
            effects: {
                intelligenceBonus: 3,
                skillGainBonus: 0.3,
                experienceBonus: 0.2,
                marketInsightBonus: 0.25
            },
            negativeEffects: {
                strengthPenalty: 0.2,
                combatPenalty: 0.25,
                carryPenalty: 0.15
            },
            icon: '📚'
        },
        gamblersDaughter: {
            id: 'gamblersDaughter',
            name: "Gambler's Daughter",
            description: "Lady luck has always smiled upon you... or has she?",
            startingLocation: 'royal_capital',  // Was merchants_landing (doesn't exist) - royal capital has gambling halls
            startingItems: {
                fancy_clothes: 1,
                dice: 1,
                playing_cards: 1,
                bread: 2,
                wine: 1
            },
            effects: {
                luckBonus: 3,
                charismaBonus: 1,
                highRiskBonus: 0.3,
                rareItemBonus: 0.2
            },
            negativeEffects: {
                highRiskPenalty: 0.2,
                reputationPenalty: 5
            },
            icon: '🎲'
        },
        hunterSon: {
            id: 'hunterSon',
            name: "Hunter's Son",
            description: "The wilds are your home, and no beast escapes your bow.",
            startingLocation: 'hunting_lodge',  // Was hermit_grove (western zone - locked!) - hunting_lodge is in starter zone
            startingItems: {
                hunting_bow: 1,
                arrows: 10,
                hunters_clothes: 1,
                leather_boots: 1,
                meat: 3,
                pelts: 2,
                water: 2
            },
            effects: {
                huntingBonus: 0.4,
                survivalBonus: 0.3,
                stealthBonus: 0.2,
                travelSpeedBonus: 0.1
            },
            negativeEffects: {
                negotiationPenalty: 0.15,
                charisma_penalty: 0.1
            },
            icon: '🏹'
        },
        monkInitiate: {
            id: 'monkInitiate',
            name: "Monk Initiate",
            description: "You left the monastery seeking something the scriptures couldn't provide.",
            startingLocation: 'greendale',
            startingItems: {
                monk_robes: 1,
                prayer_beads: 1,
                holy_book: 1,
                bread: 2,
                water: 3,
                herbs: 2
            },
            effects: {
                wisdomBonus: 2,
                healingBonus: 0.3,
                reputationGainBonus: 0.2,
                enduranceBonus: 1
            },
            negativeEffects: {
                goldPenalty: 0.2,
                combatPenalty: 0.2
            },
            icon: '⛪'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // PERK ACCESS METHODS
    // ═══════════════════════════════════════════════════════════════

    getPerk(perkId) {
        return this.perks[perkId] || null;
    },

    getAllPerks() {
        return { ...this.perks };
    },

    getPerkIds() {
        return Object.keys(this.perks);
    },

    // ═══════════════════════════════════════════════════════════════
    // EFFECT FORMATTING - making stats readable for humans
    // ═══════════════════════════════════════════════════════════════

    formatPerkEffect(effectName, value, isPositive) {
        const sign = isPositive ? '+' : '';

        const effectMap = {
            goldBonus: () => `${sign}${Math.round(value * 100)}% starting gold`,
            goldPenalty: () => `${sign}${Math.round(value * 100)}% starting gold`,
            priceBonus: () => `${sign}${Math.round(value * 100)}% better prices`,
            negotiationBonus: () => `${sign}${Math.round(value * 100)}% negotiation`,
            negotiationPenalty: () => `${sign}${Math.round(value * 100)}% negotiation`,
            carryBonus: () => `${sign}${Math.round(value * 100)}% carry capacity`,
            carryPenalty: () => `${sign}${Math.round(value * 100)}% carry capacity`,
            travelCostReduction: () => `${sign}${Math.round(value * 100)}% travel costs`,
            reputationBonus: () => `${sign}${Math.round(value)} reputation`,
            reputationPenalty: () => `${sign}${Math.round(value)} reputation`,
            randomEventBonus: () => `${sign}${Math.round(value * 100)}% positive events`,
            findBonus: () => `${sign}${Math.round(value * 100)}% find items`,
            skillGainBonus: () => `${sign}${Math.round(value * 100)}% skill improvement`,
            experienceBonus: () => `${sign}${Math.round(value * 100)}% experience gain`,
            startingSkillPenalty: () => `${sign}${Math.round(value)} starting skills`,
            marketAccessBonus: () => `${sign}${Math.round(value * 100)}% market access`,
            maintenanceCostReduction: () => `${sign}${Math.round(value * 100)}% maintenance`,
            luxuryPenalty: () => `${sign}${Math.round(value * 100)}% luxury effectiveness`,
            highRiskBonus: () => `${sign}${Math.round(value * 100)}% high-risk returns`,
            highRiskPenalty: () => `${sign}${Math.round(value * 100)}% high-risk losses`,
            adventureBonus: () => `${sign}${Math.round(value * 100)}% adventure rewards`,
            travelSpeedBonus: () => `${sign}${Math.round(value * 100)}% travel speed`,
            survivalBonus: () => `${sign}${Math.round(value * 100)}% survival`,
            marketPenalty: () => `${sign}${Math.round(value * 100)}% market prices`,
            marketInsightBonus: () => `${sign}${Math.round(value * 100)}% market insight`,
            rareItemBonus: () => `${sign}${Math.round(value * 100)}% rare item identification`,
            reputationGainBonus: () => `${sign}${Math.round(value * 100)}% reputation gain`,
            combatBonus: () => `${sign}${Math.round(value * 100)}% combat effectiveness`,
            combatPenalty: () => `${sign}${Math.round(value * 100)}% combat effectiveness`,
            strengthBonus: () => `${sign}${value} strength`,
            strengthPenalty: () => `${sign}${value} strength`,
            enduranceBonus: () => `${sign}${value} endurance`,
            charismaBonus: () => `${sign}${value} charisma`,
            intelligenceBonus: () => `${sign}${value} intelligence`,
            luckBonus: () => `${sign}${value} luck`,
            wisdomBonus: () => `${sign}${value} wisdom`,
            stealthBonus: () => `${sign}${Math.round(value * 100)}% stealth`,
            huntingBonus: () => `${sign}${Math.round(value * 100)}% hunting`,
            fishingBonus: () => `${sign}${Math.round(value * 100)}% fishing`,
            miningBonus: () => `${sign}${Math.round(value * 100)}% mining`,
            farmingBonus: () => `${sign}${Math.round(value * 100)}% farming`,
            woodcuttingBonus: () => `${sign}${Math.round(value * 100)}% woodcutting`,
            healingBonus: () => `${sign}${Math.round(value * 100)}% healing`,
            navigationBonus: () => `${sign}${Math.round(value * 100)}% navigation`,
            pickpocketBonus: () => `${sign}${Math.round(value * 100)}% pickpocket`
        };

        const formatter = effectMap[effectName];
        return formatter ? formatter() : `${effectName}: ${value}`;
    },

    // ═══════════════════════════════════════════════════════════════
    // UI GENERATION - building perk cards for selection
    // ═══════════════════════════════════════════════════════════════

    createPerkCard(perk, selectedPerks = []) {
        const card = document.createElement('div');
        card.className = 'perk-card';
        card.dataset.perkId = perk.id;

        // Check if this perk is selected
        if (selectedPerks.includes(perk.id)) {
            card.classList.add('selected');
        }
        // Disable if 2 perks selected and this isn't one of them
        if (selectedPerks.length >= 2 && !selectedPerks.includes(perk.id)) {
            card.classList.add('disabled');
        }

        // Create header with icon and name
        const header = document.createElement('div');
        header.className = 'perk-header';
        header.innerHTML = `
            <span class="perk-icon">${perk.icon}</span>
            <span class="perk-name">${perk.name}</span>
        `;

        // Create description
        const description = document.createElement('div');
        description.className = 'perk-description';
        description.textContent = perk.description;

        // Create effects container
        const effects = document.createElement('div');
        effects.className = 'perk-effects';

        // Add positive effects
        for (const [effectName, value] of Object.entries(perk.effects)) {
            const effect = document.createElement('div');
            effect.className = 'perk-effect positive';
            const formattedEffect = this.formatPerkEffect(effectName, value, true);
            effect.innerHTML = `<span class="perk-effect-icon">✓</span> ${formattedEffect}`;
            effects.appendChild(effect);
        }

        // Add negative effects
        for (const [effectName, value] of Object.entries(perk.negativeEffects)) {
            const effect = document.createElement('div');
            effect.className = 'perk-effect negative';
            const formattedEffect = this.formatPerkEffect(effectName, value, false);
            effect.innerHTML = `<span class="perk-effect-icon">✗</span> ${formattedEffect}`;
            effects.appendChild(effect);
        }

        card.appendChild(header);
        card.appendChild(description);
        card.appendChild(effects);

        return card;
    },

    populatePerksContainer(container, selectedPerks = [], onPerkClick = null) {
        if (!container) return;

        container.innerHTML = '';

        for (const [key, perk] of Object.entries(this.perks)) {
            const perkCard = this.createPerkCard(perk, selectedPerks);

            if (onPerkClick) {
                perkCard.addEventListener('click', () => onPerkClick(perk.id));
            }

            container.appendChild(perkCard);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // EFFECT CALCULATIONS - applying perk bonuses to player
    // ═══════════════════════════════════════════════════════════════

    calculateTotalEffects(selectedPerkIds) {
        const totalEffects = {};
        const totalNegativeEffects = {};

        for (const perkId of selectedPerkIds) {
            const perk = this.perks[perkId];
            if (!perk) continue;

            // Accumulate positive effects
            for (const [effect, value] of Object.entries(perk.effects)) {
                totalEffects[effect] = (totalEffects[effect] || 0) + value;
            }

            // Accumulate negative effects
            for (const [effect, value] of Object.entries(perk.negativeEffects)) {
                totalNegativeEffects[effect] = (totalNegativeEffects[effect] || 0) + value;
            }
        }

        return { effects: totalEffects, negativeEffects: totalNegativeEffects };
    },

    getStartingItems(selectedPerkIds) {
        const items = {};

        for (const perkId of selectedPerkIds) {
            const perk = this.perks[perkId];
            if (!perk || !perk.startingItems) continue;

            for (const [itemId, quantity] of Object.entries(perk.startingItems)) {
                items[itemId] = (items[itemId] || 0) + quantity;
            }
        }

        return items;
    },

    getStartingLocation(selectedPerkIds) {
        // Return the starting location of the first selected perk
        for (const perkId of selectedPerkIds) {
            const perk = this.perks[perkId];
            if (perk && perk.startingLocation) {
                return perk.startingLocation;
            }
        }
        return 'greendale'; // Default starting location
    }
};

// Make it global - maintain backward compatibility with perks object
window.PerkSystem = PerkSystem;
window.perks = PerkSystem.perks;

console.log('🎭 PerkSystem loaded - choose your tragic backstory wisely');
