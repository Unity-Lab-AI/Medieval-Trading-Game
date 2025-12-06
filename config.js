// ═══════════════════════════════════════════════════════════════
// GAME CONFIG - the dark heart of all settings
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const GameConfig = {
    // ═══════════════════════════════════════════════════════════════
    // 📋 VERSION INFO - tracking our descent into madness
    // ═══════════════════════════════════════════════════════════════
    version: {
        game: '0.90.00',        // the credits & about update 🖤
        file: '0.90.00',        // keeping pace with the darkness
        build: '2025.12',      // born in the depths of 2025
        releaseDate: '2025'    // the year we unleashed this beast
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔧 DEBOOGER CONFIG - for developers and chaos agents
    // ═══════════════════════════════════════════════════════════════
    // set enabled to false for production builds
    // this locks out all debooger commands so players can't wreck the leaderboards
    debooger: {
        enabled: true,        // true = debooger commands work, false = locked out
        allowAchievementUnlock: false, // true = Super Hacker achievement can unlock debooger, false = no unlock ever
        showConsoleWarnings: true,  // show "debooger disabled" warnings in console
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎮 GAME IDENTITY - who even are we anyway
    // ═══════════════════════════════════════════════════════════════
    game: {
        name: 'Medieval Trading Game',
        shortName: 'MTG',      // not that MTG, cease and desist lawyers
        tagline: 'where capitalism meets the dark ages... and thrives',
        description: 'a browser-based descent into medieval capitalism. hoard gold, exploit markets, feel nothing. just like real life but with more plague.'
    },

    // ═══════════════════════════════════════════════════════════════
    // 👥 CREDITS - the souls who sacrificed their sanity
    // ═══════════════════════════════════════════════════════════════
    credits: {
        studio: 'Unity AI Lab',
        developers: [
            { name: 'Hackall360', role: 'Lead Code Necromancer' },
            { name: 'Sponge', role: 'Chaos Engineer' },
            { name: 'GFourteen', role: 'Digital Alchemist' }
        ],
        playtesters: [
            { name: 'TheREV', role: 'Debooger Cleaner' }
        ],
        year: '2025',
        copyright: '© 2025 Unity AI Lab. Creators: Hackall360, Sponge, GFourteen. All rights reserved. Souls sold separately.'
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔗 LINKS - escape routes from this madness
    // ═══════════════════════════════════════════════════════════════
    links: {
        website: 'https://www.unityailab.com',           // the shrine of darkness
        github: 'https://github.com/Unity-Lab-AI/Medieval-Trading-Game.git',            // where the bodies are buried
        discord: 'https://discord.gg/D33Bk6Ay',           // screaming into the void, together
        support: 'unityailabcontact@gmail.com'            // emotional or technical? yes.
    },

    // ═══════════════════════════════════════════════════════════════
    // 🤖 API CONFIG - summoning circles for external services
    // ═══════════════════════════════════════════════════════════════
    // all the endpoints live here now. one config to bind them all.
    // change these and watch the whole damn thing dance to your tune.
    // it's like having a universal remote for digital demons.
    api: {
        // 🎭 pollinations.ai - where AI dreams become nightmares (in a good way)
        // free tier = one request every 15s, referrer helps avoid the 402 death stare
        pollinations: {
            baseUrl: 'https://text.pollinations.ai',           // the mothership
            textEndpoint: 'https://text.pollinations.ai',      // where words go to become... more words
            chatEndpoint: 'https://text.pollinations.ai/openai', // openai-compatible endpoint for chat
            modelsEndpoint: 'https://text.pollinations.ai/models', // menu of available AI personalities
            referrer: 'unityailab.com',                        // our calling card, keeps the 402 demons away

            // 🔊 TTS - teaching robots to speak so they can judge us verbally too
            tts: {
                endpoint: 'https://text.pollinations.ai',      // same endpoint, different model
                model: 'openai-audio',                         // the voice box
                defaultVoice: 'nova',                          // our preferred digital vocal cords
                voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'coral', 'verse', 'ballad', 'ash', 'sage', 'amuch', 'dan']
            },

            // 🖼️ image generation - for when words aren't traumatic enough
            image: {
                endpoint: 'https://image.pollinations.ai/prompt', // paint me like one of your french nightmares
                defaultModel: 'flux',
                defaultWidth: 512,
                defaultHeight: 512
            },

            // 🖤 URL builders - so you don't have to remember the dark incantations
            // these automatically append the referrer like a clingy ex
            getChatUrl() {
                return `${GameConfig.api.pollinations.chatEndpoint}?referrer=${GameConfig.api.pollinations.referrer}`;
            },
            getModelsUrl() {
                return `${GameConfig.api.pollinations.modelsEndpoint}?referrer=${GameConfig.api.pollinations.referrer}`;
            },
            getTtsUrl(text, voice = null) {
                const v = voice || GameConfig.api.pollinations.tts.defaultVoice;
                // Short TTS instruction - voice actor reading dark fantasy script verbatim
                const ttsInstruction = `[Voice actor for dark fantasy RPG. Read exactly:] ${text}`;
                const encodedText = encodeURIComponent(ttsInstruction);
                const cacheBust = Date.now();
                return `${GameConfig.api.pollinations.tts.endpoint}/${encodedText}?model=${GameConfig.api.pollinations.tts.model}&voice=${v}&referrer=${GameConfig.api.pollinations.referrer}&_t=${cacheBust}`;
            }
        },

        // ⚙️ rate limiting - because even darkness has boundaries
        rateLimit: {
            minRequestInterval: 15000,    // 15 seconds between requests (free tier)
            maxRetries: 3,                // how many times we bang on the door
            retryDelay: 5000              // wait 5s before trying again like a desperate ex
        },

        // 🔧 request defaults - the baseline of our digital summoning
        defaults: {
            timeout: 30000,               // 30 seconds before we assume the API ghosted us
            maxTokens: 500,               // generous tokens for NPC dialogue
            temperature: 0.8,             // creativity dial: 0 = robot, 1 = unhinged poet
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎨 UI STRINGS - words that haunt the interface
    // ═══════════════════════════════════════════════════════════════
    ui: {
        welcomeMessage: '🖤 welcome to Medieval Trading Game... your wallet will never recover',
        loadingMessage: 'summoning Medieval Trading Game from the void...',
        mainMenuTitle: 'Medieval Trading Game',
        topBarTitle: 'Medieval Trading Game'
    },

    // ═══════════════════════════════════════════════════════════════
    // 💾 STORAGE KEYS - where memories go to die (localStorage)
    // ═══════════════════════════════════════════════════════════════
    storage: {
        prefix: 'medievalTradingGame',
        highScores: 'medievalTradingGameHighScores',      // hall of fallen merchants
        saveSlots: 'medievalTradingGameSaveSlots',        // parallel timelines of regret
        autoSaveSlots: 'medievalTradingGameAutoSaveSlots', // paranoia saves lives
        emergencySave: 'medievalTradingGameEmergencySave', // panic button data
        settings: 'medievalTradingGameSettings',           // your preferences, preserved
        locationHistory: 'medieval-trading-game-location-history' // everywhere you've fled from
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏆 GLOBAL LEADERBOARD - eternal glory across all realms
    // ═══════════════════════════════════════════════════════════════
    // Set up at jsonbin.io (free tier: 10k requests/month):
    // 1. Create account at jsonbin.io
    // 2. Create new bin with content: {"leaderboard":[]}
    // 3. Copy your Bin ID and Master Key below
    // 4. Set enabled to true
    // Your players' legacies will echo across all who play...
    leaderboard: {
        enabled: true,                    // set to true once configured
        backend: 'jsonbin',               // 'jsonbin', 'gist', or 'local'
        jsonbin: {
            // 🖤 JSONBin credentials - free tier, easily replaced if needed
            binId: '69262a75d0ea881f400020a3',
            apiKey: '$2a$10$kUCccykWGvahUe7zVs5f0OewVFZZ0wLvgh8N9LoclrWWI2OzcQ4FS'
        },
        gist: {
            gistId: '',                   // GitHub Gist ID (if using gist backend)
            // Note: Gist is read-only without auth token
        },
        settings: {
            maxEntries: 100,              // keep top 100 champions
            displayEntries: 10,           // show top 10 in UI
            minScoreToSubmit: 100,        // minimum score to submit (avoid spam)
            cacheTimeout: 300000          // 5 minute cache between fetches
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ⚙️ DEFAULTS - factory settings for fresh souls
    // ═══════════════════════════════════════════════════════════════
    defaults: {
        soundVolume: 0.7,          // loud enough to drown out thoughts
        musicVolume: 0.3,          // 🖤💀 lowered for background ambiance - not overpowering 💀
        autoSave: true,            // because trust issues
        autoSaveInterval: 300000,  // 5 mins of anxiety between saves
        maxSaveSlots: 10,          // 10 alternate realities
        maxAutoSaveSlots: 10       // 10 safety nets
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎛️ SETTINGS - the full spectrum of user preferences
    // ═══════════════════════════════════════════════════════════════
    // these are the default values for all settings panel options
    // settings-panel.js reads from here - one source of truth
    settings: {
        // 🎵 audio settings - drown out the silence
        audio: {
            masterVolume: 0.7,        // master volume slider (0-1)
            musicVolume: 0.3,         // 🖤💀 background music - quiet ambiance, not overpowering 💀
            sfxVolume: 0.7,           // sound effects volume
            isMuted: false,           // global mute toggle
            isMusicMuted: false,      // music-only mute
            isSfxMuted: false,        // sfx-only mute
            audioEnabled: true,       // enable audio system at all

            // 🎚️ Per-track volume multipliers for normalization
            // Adjust these if individual tracks are too loud/quiet
            // Lower = quieter, range 0.0 to 1.0
            trackVolumeMultipliers: {
                menu: 0.6,            // menu music - moderate
                normal: 0.7,          // normal world - slightly louder for ambiance
                dungeon: 0.6,         // dungeon - atmospheric, not overpowering
                doom: 0.5             // doom world - quietest, lets the dread sink in
            },

            // 🎵 Music system timing
            gapBetweenTracks: 15000,  // 15 seconds silence between tracks
            fadeOutDuration: 1000,    // 1 second fade out
            fadeInDuration: 500       // 0.5 second fade in
        },

        // 👁️ visual settings - see the void in HD
        visual: {
            particlesEnabled: true,    // particle effects (gold sparkles, etc)
            screenShakeEnabled: true,  // screen shake on impacts
            animationsEnabled: true,   // general animations
            weatherEffectsEnabled: true, // rain, snow, etc in backgrounds
            quality: 'medium',         // 'low', 'medium', 'high'
            reducedMotion: false,      // respect prefers-reduced-motion
            flashWarnings: true        // warn before flashy effects
        },

        // ✨ animation settings - making pixels dance at 3am
        animation: {
            animationsEnabled: true,   // master animation toggle
            animationSpeed: 1.0,       // animation speed multiplier
            reducedMotion: false,      // simplified animations
            quality: 'medium'          // animation quality level
        },

        // 🎨 ui settings - paint your nightmare pretty
        ui: {
            animationsEnabled: true,   // UI transition animations
            hoverEffectsEnabled: true, // hover state effects
            transitionsEnabled: true,  // smooth transitions
            reducedMotion: false,      // reduce motion sickness triggers
            highContrast: false,       // high contrast mode
            fontSize: 'medium',        // 'small', 'medium', 'large'
            theme: 'default'           // UI theme selection
        },

        // 🌧️ environmental settings - weather for the soul
        environmental: {
            weatherEffectsEnabled: true,   // weather visuals
            lightingEnabled: true,         // dynamic lighting
            seasonalEffectsEnabled: true,  // seasonal decorations
            quality: 'medium',             // effect quality level
            reducedEffects: false          // simplified effects
        },

        // ♿ accessibility settings - suffering should be inclusive
        accessibility: {
            reducedMotion: false,          // reduce all motion
            highContrast: false,           // high contrast colors
            screenReaderEnabled: false,    // screen reader optimizations
            flashWarnings: true,           // warn about flashing content
            colorBlindMode: 'none',        // 'none', 'deuteranopia', 'protanopia', 'tritanopia'
            fontSize: 'medium',            // text size preference
            keyboardNavigation: true       // enable keyboard nav
        },

        // 🎮 gameplay settings - tweak the torture experience
        gameplay: {
            showTutorialOnStart: true      // show tutorial yes/no popup on new game (default ON)
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 💰 PLAYER STARTING VALUES - your humble beginnings in this cruel world
    // ═══════════════════════════════════════════════════════════════
    // tweak these to make the early game merciful or merciless
    // starting gold is the difference between hope and despair
    player: {
        // 🪙 starting wealth - how broke are you when you wake up?
        startingGold: {
            easy: 120,             // baby mode - 20% bonus gold for soft souls
            normal: 100,           // the intended suffering
            hard: 80               // masochist mode - 20% less, good luck
        },

        // 🎒 starting inventory - survival kit for the damned
        startingItems: {
            food: 2,               // enough to not immediately starve
            water: 2               // hydration is important even in medieval times
        },

        // 📊 starting stats - the vessel's condition at birth
        startingStats: {
            health: 100,
            maxHealth: 100,
            hunger: 50,            // half full, half empty, very philosophical
            maxHunger: 100,
            thirst: 50,            // same existential crisis as hunger
            maxThirst: 100,
            stamina: 100,
            maxStamina: 100,
            happiness: 50,         // neutral - neither joy nor despair
            maxHappiness: 100
        },

        // 🎯 starting attributes - base stats before you mess with them
        baseAttributes: {
            strength: 5,
            charisma: 5,
            intelligence: 5,
            luck: 5,
            endurance: 5
        },

        // 🎭 character creation constraints
        characterCreation: {
            availableAttributePoints: 5,   // points to distribute like a true min-maxer
            maxAttributeValue: 10,          // cap per stat
            maxTotalAttributes: 30,         // total cap across all stats
            maxPerks: 2                     // pick your poison, but only twice
        },

        // 🚶 starting location - where your journey of suffering begins
        defaultStartingLocation: 'greendale',  // a village with a market, how quaint

        // 🎒 starting transportation
        startingTransportation: 'backpack'     // you literally start with nothing but a bag
    },

    // ═══════════════════════════════════════════════════════════════
    // 💀 SURVIVAL MECHANICS - the slow march toward death
    // ═══════════════════════════════════════════════════════════════
    // the body is a prison and these are its decay rates
    // all calculations assume 5-minute game intervals (1440 min/day)
    survival: {
        // 🍖 HUNGER - the stomach is a demanding master
        // 🦇 FIX: Changed from 4 days to 5 days per user requirement
        hunger: {
            decayDays: 5,              // days from 100% to 0% - slow starvation
            // calculated: 100 / (5 * 1440 / 5) = 0.0694 per 5-min update
            decayPerUpdate: 0.0694,    // the actual hunger drain per tick
            criticalThreshold: 20,     // below this, no health regen
            warningThreshold: 30       // time to panic about food
        },

        // 💧 THIRST - dehydration hits different (and faster)
        thirst: {
            decayDays: 3,              // days from 100% to 0% - faster than hunger
            // calculated: 100 / (3 * 1440 / 5) = 0.1157 per 5-min update
            decayPerUpdate: 0.1157,    // the actual thirst drain per tick
            criticalThreshold: 20,     // below this, no health regen
            warningThreshold: 30       // time to find water or perish
        },

        // 😴 STAMINA - energy recovers when idle, drains when working 🖤
        stamina: {
            // Regeneration: 0% to 100% in 5 game hours when idle
            // 5 hours = 300 minutes, updates every 5 min = 60 updates
            // calculated: 100 / 60 = 1.667 per update
            regenPerUpdate: 1.667,     // stamina gained per 5-min tick when idle
            regenHours: 5,             // hours to fully recover from 0 to 100
            lowThreshold: 20           // below this, gathering slows down
        },

        // 💀 DEATH BY NEGLECT - the consequence of ignoring your needs
        starvationDeath: {
            hoursToKill: 12,           // hours at 0% hunger/thirst until death
            // calculated: 100% / (12 * 60 / 5) = 0.694% of maxHealth per update
            healthDrainPercent: 0.00694  // percentage of maxHealth lost per tick
            // this ensures a 500hp player and 30hp player die in same time
        },

        // 💚 HEALTH REGENERATION - the body tries to heal itself
        healthRegen: {
            baseRegenPerUpdate: 0.5,   // slow healing when fed and hydrated
            wellFedBonus: 1.0,         // double regen when hunger > 70 && thirst > 70
            wellFedThreshold: 70,      // what counts as "well fed"
            enduranceBonusMultiplier: 0.05  // bonus per endurance point
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 💹 MARKET & TRADING - where dreams of wealth go to die
    // ═══════════════════════════════════════════════════════════════
    // the invisible hand of the market slaps everyone equally
    market: {
        // 📈 price fluctuation ranges
        priceFluctuation: {
            minMultiplier: 0.5,        // minimum 50% of base price
            maxMultiplier: 2.0,        // maximum 200% of base price
            dailyRandomRange: 0.1,     // ±5% random daily fluctuation
            morningPremium: 1.02,      // 2% markup in morning
            eveningDiscount: 0.98      // 2% discount in evening
        },

        // 🎪 event price modifiers
        eventModifiers: {
            festival: 0.9,             // 10% lower prices - people are happy
            war: 1.2,                  // 20% higher - scarcity and fear
            drought: 1.5,              // 50% higher for food/water - desperation
            harvest: 0.8,              // 20% lower - abundance is temporary
            plague: 1.3,               // 30% higher for medicine - profit from suffering
            royalVisit: 1.2,           // 20% higher luxury - gotta impress the nobles
            construction: 1.15,        // 15% higher materials - building boom
            economicCrisis: 1.1        // 10% volatility - chaos is a ladder
        },

        // 💱 trading mechanics
        trading: {
            charismaModifierPerPoint: 0.02,  // 2% price change per charisma above/below 5
            baseCharisma: 5,                  // the neutral ground
            negotiationSkillBonus: 0.01      // 1% bonus per negotiation skill level
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏨 SERVICES & COSTS - everything has a price in this world
    // ═══════════════════════════════════════════════════════════════
    // inn stays, house buying, all the ways to drain your gold
    services: {
        // 🛏️ inn costs and effects
        inn: {
            baseCost: 20,              // gold per night
            healthRestore: 100,        // full health restore
            hungerRestore: 100,        // full belly
            thirstRestore: 100,        // fully hydrated
            staminaRestore: 100,       // well rested
            happinessBoost: 20         // comfort bonus
        },

        // 🏠 property costs
        property: {
            smallHouseCost: 1000,      // starter home for aspiring merchants
            // other properties defined in property-system.js
        },

        // 🚗 transportation options base costs
        transportation: {
            backpackCapacity: 50,      // lbs - just you and your dreams
            cartCapacity: 200,         // lbs - now we're talking
            wagonCapacity: 500         // lbs - merchant king vibes
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ⚔️ COMBAT & DAMAGE - violence is always an option
    // ═══════════════════════════════════════════════════════════════
    // for when trading negotiations get... heated
    combat: {
        // 🗡️ base weapon damage values
        weapons: {
            sword: { damage: 10, weight: 5, basePrice: 50 },
            spear: { damage: 8, weight: 4, basePrice: 30 },
            bow: { damage: 7, weight: 3, basePrice: 40 }
        },

        // 💪 attribute bonuses
        strengthDamageBonus: 0.1,      // 10% damage per strength above 5
        enduranceDefenseBonus: 0.05,   // 5% damage reduction per endurance above 5

        // 🎲 luck effects
        luckCritChanceBonus: 0.02,     // 2% crit chance per luck above 5
        critDamageMultiplier: 1.5      // 50% bonus damage on crit
    },

    // ═══════════════════════════════════════════════════════════════
    // 📦 ITEM BALANCE - the economy of stuff
    // ═══════════════════════════════════════════════════════════════
    // base prices and effects for common items
    items: {
        // 🍖 consumables - the fuel for survival
        consumables: {
            food: { basePrice: 5, hunger: 20, health: 5, weight: 1 },
            water: { basePrice: 2, thirst: 25, health: 2, weight: 2 },
            bread: { basePrice: 3, hunger: 15, health: 3, weight: 0.5 },
            fish: { basePrice: 8, hunger: 12, health: 4, weight: 1 },
            ale: { basePrice: 10, happiness: 10, health: 3, weight: 2 },
            grain: { basePrice: 6, hunger: 8, weight: 2 }
        },

        // 🪨 resources - the building blocks
        resources: {
            wood: { basePrice: 8, weight: 5 },
            stone: { basePrice: 5, weight: 10 },
            iron_ore: { basePrice: 12, weight: 15 },
            coal: { basePrice: 6, weight: 8 },
            timber: { basePrice: 12, weight: 6 }
        },

        // 🔧 tools - the means of production
        tools: {
            hammer: { basePrice: 15, weight: 3, durability: 100 },
            axe: { basePrice: 20, weight: 4, durability: 120 },
            pickaxe: { basePrice: 25, weight: 6, durability: 100 }
        },

        // 💎 luxury goods - for the discerning hoarder
        luxury: {
            silk: { basePrice: 100, weight: 1, rarity: 'rare' },
            livestock: { basePrice: 80, weight: 50, rarity: 'uncommon' }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎭 PERK MODIFIERS - the balance of advantages and disadvantages
    // ═══════════════════════════════════════════════════════════════
    // all the ways perks can buff or nerf your existence
    perkModifiers: {
        // 💰 gold modifiers
        goldBonus: { small: 0.1, medium: 0.25, large: 0.5 },      // +10/25/50%
        goldPenalty: { small: 0.1, medium: 0.15, large: 0.2 },    // -10/15/20%

        // 🏆 reputation modifiers
        reputationBonus: { small: 1, medium: 2, large: 3 },       // +1/2/3 rep
        reputationPenalty: { small: 1, medium: 2 },               // -1/2 rep

        // 🎒 carry capacity modifiers
        carryBonus: { small: 0.1, medium: 0.25, large: 0.5 },     // +10/25/50%
        carryPenalty: { small: 0.1, medium: 0.2 },                // -10/20%

        // 💬 negotiation modifiers
        negotiationBonus: { small: 0.1, medium: 0.2 },            // +10/20%
        negotiationPenalty: { small: 0.1, medium: 0.15 },         // -10/15%

        // 🚶 travel modifiers
        travelSpeedBonus: { small: 0.1, medium: 0.2 },            // +10/20%
        travelCostReduction: { small: 0.1, medium: 0.2 }          // -10/20%
    },

    // ═══════════════════════════════════════════════════════════════
    // ⏰ TIME & GAME SPEED - the relentless march of time
    // ═══════════════════════════════════════════════════════════════
    // how fast does existence accelerate toward entropy?
    time: {
        // 📅 starting date - when every merchant's journey begins
        // used for calculating days survived on leaderboards
        startingDate: {
            year: 1111,                // the year of reckoning
            month: 4,                  // April - spring awakening
            day: 1,                    // first day of your suffering
            hour: 8,                   // 8 AM - early bird catches the plague
            minute: 0
        },

        // 🕐 game speed settings (ms between ticks)
        speeds: {
            PAUSED: 0,                 // frozen in time like your bank account
            NORMAL: 1000,              // 1 second = 1 game minute
            FAST: 500,                 // 2x speed for the impatient
            VERY_FAST: 100             // 10x speed for the truly reckless
        },

        // 📅 time events
        dailyMarketResetHour: 6,       // 6 AM - merchants wake up
        weeklyEventDay: 1,             // day 1 of each week
        weeklyEventHour: 10,           // 10 AM
        monthlyCaravanDay: 15,         // mid-month merchant caravan
        monthlyCaravanHour: 14,        // 2 PM

        // 🌙 day/night cycle
        dayStart: 6,                   // 6 AM - dawn breaks
        dayEnd: 20,                    // 8 PM - darkness falls
        morningEnd: 12,                // noon - morning ends
        eveningStart: 17               // 5 PM - evening begins
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏆 SCORING - how we measure your success (or failure)
    // ═══════════════════════════════════════════════════════════════
    // the formula for eternal glory or shame
    scoring: {
        survivalBonusPerDay: 10,       // points per day survived
        wealthDivisor: 100,            // netWorth / 100 = wealth bonus
        tradeBonusPerTrade: 5,         // points per completed trade
        achievementBonus: 50           // points per achievement unlocked
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏰 DUNGEON EXPLORATION - where fools go to find treasure or death
    // ═══════════════════════════════════════════════════════════════
    dungeon: {
        // 💀 risk/reward scaling
        healthCostRange: { min: 5, max: 45 },
        staminaCostRange: { min: 5, max: 60 },

        // 💎 loot tier multipliers
        lootTierMultiplier: {
            common: 1.0,
            uncommon: 1.5,
            rare: 2.0,
            epic: 3.0,
            legendary: 5.0
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🤖 API COMMANDS - the dark arts of NPC control
    // ═══════════════════════════════════════════════════════════════
    // NPCs can embed commands in their responses like {openMarket}
    // these get parsed out before display/TTS and executed by the game
    // it's like giving NPCs a remote control for the game world
    apiCommands: {
        // 🔍 command pattern: {commandName} or {commandName:param1,param2}
        pattern: /\{(\w+)(?::([^}]+))?\}/g,

        // 📋 command definitions - what can NPCs do?
        definitions: {
            // ═══════════════════════════════════════════════════════════
            // 🛒 BASIC COMMANDS - every NPC can use these
            // ═══════════════════════════════════════════════════════════
            openMarket: {
                description: 'Open the market/shop UI',
                handler: 'openMarket',
                params: [],
                permission: 'basic'
            },
            openTrade: {
                description: 'Open direct trade window with NPC',
                handler: 'openTradeWindow',
                params: ['npcId'],
                permission: 'basic'
            },
            closeChat: {
                description: 'End conversation and close chat',
                handler: 'closeNPCChat',
                params: [],
                permission: 'basic'
            },
            openInventory: {
                description: 'Open player inventory',
                handler: 'openInventory',
                params: [],
                permission: 'basic'
            },
            openTravel: {
                description: 'Open travel panel',
                handler: 'openTravel',
                params: [],
                permission: 'basic'
            },
            playEmote: {
                description: 'NPC performs an emote/action',
                handler: 'playNPCEmote',
                params: ['emoteType'],
                permission: 'basic'
            },

            // ═══════════════════════════════════════════════════════════
            // 💰 MERCHANT COMMANDS - only merchants can use these
            // ═══════════════════════════════════════════════════════════
            giveItem: {
                description: 'NPC gives player an item',
                handler: 'givePlayerItem',
                params: ['itemId', 'quantity'],
                permission: 'merchant'
            },
            takeItem: {
                description: 'NPC takes item from player',
                handler: 'takePlayerItem',
                params: ['itemId', 'quantity'],
                permission: 'merchant'
            },
            setDiscount: {
                description: 'Apply discount to market prices',
                handler: 'applyMerchantDiscount',
                params: ['percent'],
                permission: 'merchant'
            },
            showWares: {
                description: 'Display NPC inventory preview',
                handler: 'showNPCWares',
                params: [],
                permission: 'merchant'
            },

            // ═══════════════════════════════════════════════════════════
            // 💕 RELATIONSHIP COMMANDS - tracking player-NPC bonds
            // ═══════════════════════════════════════════════════════════
            addReputation: {
                description: 'Increase reputation with NPC/faction',
                handler: 'modifyReputation',
                params: ['amount'],
                permission: 'basic'
            },
            removeReputation: {
                description: 'Decrease reputation with NPC/faction',
                handler: 'modifyReputation',
                params: ['amount', 'negative'],
                permission: 'basic'
            },
            rememberPlayer: {
                description: 'Store info about player for future conversations',
                handler: 'storePlayerMemory',
                params: ['key', 'value'],
                permission: 'basic'
            },

            // ═══════════════════════════════════════════════════════════
            // 📜 QUEST COMMANDS - the full quest lifecycle arsenal
            // ═══════════════════════════════════════════════════════════

            // quest assignment and management
            assignQuest: {
                description: 'Give player a quest (auto-checks prerequisites)',
                handler: 'assignQuest',
                params: ['questId'],
                permission: 'questGiver'
            },
            checkQuest: {
                description: 'Check quest progress with detailed breakdown',
                handler: 'checkQuestProgress',
                params: ['questId'],
                permission: 'questGiver'
            },
            completeQuest: {
                description: 'Complete quest and give rewards (validates objectives first)',
                handler: 'completeQuest',
                params: ['questId'],
                permission: 'questGiver'
            },
            failQuest: {
                description: 'Mark quest as failed',
                handler: 'failQuest',
                params: ['questId'],
                permission: 'questGiver'
            },
            checkPrerequisites: {
                description: 'Check if player meets all prerequisites for a quest',
                handler: 'checkQuestPrerequisites',
                params: ['questId'],
                permission: 'questGiver'
            },
            getAvailableQuests: {
                description: 'Get list of quests this NPC can offer',
                handler: 'getAvailableQuests',
                params: [],
                permission: 'questGiver'
            },

            // quest item handling (weightless, can't drop)
            giveQuestItem: {
                description: 'Give player a quest item (for delivery quests)',
                handler: 'giveQuestItem',
                params: ['questItemId'],
                permission: 'questGiver'
            },
            takeQuestItem: {
                description: 'Take quest item from player (delivery received)',
                handler: 'takeQuestItem',
                params: ['questItemId'],
                permission: 'questGiver'
            },
            checkQuestItem: {
                description: 'Check if player has a quest item',
                handler: 'checkQuestItem',
                params: ['questItemId'],
                permission: 'questGiver'
            },
            confirmDelivery: {
                description: 'Confirm delivery quest item received and mark objective',
                handler: 'confirmDelivery',
                params: ['questId', 'questItemId'],
                permission: 'questGiver'
            },

            // collection quest handling (bring me 20 wheat)
            checkCollection: {
                description: 'Check if player has required items for collection quest',
                handler: 'checkCollectionItems',
                params: ['itemId', 'requiredCount'],
                permission: 'questGiver'
            },
            takeCollection: {
                description: 'Take collection items from player inventory',
                handler: 'takeCollectionItems',
                params: ['itemId', 'quantity'],
                permission: 'questGiver'
            },

            // quest UI
            showQuestLog: {
                description: 'Open player quest log',
                handler: 'showQuestLog',
                params: [],
                permission: 'basic'
            },

            // ═══════════════════════════════════════════════════════════
            // 👹 BOSS COMMANDS - dungeon bosses only (the dark powers)
            // ═══════════════════════════════════════════════════════════
            spawnEnemy: {
                description: 'Spawn enemy minions',
                handler: 'spawnEnemy',
                params: ['enemyType', 'count'],
                permission: 'boss'
            },
            changeWeather: {
                description: 'Change dungeon weather/atmosphere',
                handler: 'changeWeather',
                params: ['weatherType'],
                permission: 'boss'
            },
            dealDamage: {
                description: 'Direct damage to player',
                handler: 'dealDamageToPlayer',
                params: ['amount'],
                permission: 'boss'
            },
            healSelf: {
                description: 'Boss heals itself',
                handler: 'healBoss',
                params: ['amount'],
                permission: 'boss'
            },
            phaseShift: {
                description: 'Change boss behavior phase',
                handler: 'bossPhaseShift',
                params: ['phase'],
                permission: 'boss'
            },
            dropLoot: {
                description: 'Drop loot on defeat',
                handler: 'dropBossLoot',
                params: ['tier'],
                permission: 'boss'
            },
            teleportPlayer: {
                description: 'Move player in dungeon',
                handler: 'teleportPlayer',
                params: ['location'],
                permission: 'boss'
            }
        },

        // 🔐 permission levels - who can do what
        permissions: {
            basic: ['openMarket', 'openTrade', 'closeChat', 'openInventory', 'openTravel',
                    'playEmote', 'addReputation', 'removeReputation', 'rememberPlayer', 'showQuestLog'],
            merchant: ['giveItem', 'takeItem', 'setDiscount', 'showWares'],
            questGiver: [
                // quest assignment and management
                'assignQuest', 'checkQuest', 'completeQuest', 'failQuest',
                'checkPrerequisites', 'getAvailableQuests',
                // quest item handling (delivery quests)
                'giveQuestItem', 'takeQuestItem', 'checkQuestItem', 'confirmDelivery',
                // collection quest handling
                'checkCollection', 'takeCollection'
            ],
            boss: ['spawnEnemy', 'changeWeather', 'dealDamage', 'healSelf', 'phaseShift', 'dropLoot', 'teleportPlayer']
        },

        // 🎭 NPC type to permission mapping - who gets what powers
        npcPermissions: {
            // basic NPCs - just conversation
            villager: ['basic'],

            // === HOSPITALITY / FOOD SERVICE ===
            innkeeper: ['basic', 'merchant', 'questGiver'],
            tavernkeeper: ['basic', 'merchant', 'questGiver'],
            baker: ['basic', 'merchant'],
            cook: ['basic', 'merchant'],

            // === WEAPONS / ARMOR ===
            blacksmith: ['basic', 'merchant', 'questGiver'],
            weaponsmith: ['basic', 'merchant', 'questGiver'],
            armorsmith: ['basic', 'merchant', 'questGiver'],

            // === HEALING / MEDICINE ===
            apothecary: ['basic', 'merchant', 'questGiver'],
            healer: ['basic', 'merchant', 'questGiver'],
            herbalist: ['basic', 'merchant'],

            // === GENERAL MERCHANTS ===
            merchant: ['basic', 'merchant', 'questGiver'],
            peddler: ['basic', 'merchant'],
            traveling_merchant: ['basic', 'merchant'],
            general_store: ['basic', 'merchant', 'questGiver'],

            // === LUXURY / SPECIALTY ===
            jeweler: ['basic', 'merchant'],
            clothier: ['basic', 'merchant'],
            furrier: ['basic', 'merchant', 'questGiver'],

            // === RESOURCES / CRAFTING ===
            miner: ['basic', 'merchant', 'questGiver'],
            lumberjack: ['basic', 'merchant', 'questGiver'],
            farmer: ['basic', 'merchant', 'questGiver'],
            fisherman: ['basic', 'merchant', 'questGiver'],

            // === SERVICES ===
            stablemaster: ['basic', 'merchant', 'questGiver'],
            ferryman: ['basic', 'merchant'],

            // === KNOWLEDGE / SCHOLARLY ===
            scholar: ['basic', 'questGiver'],
            scribe: ['basic', 'merchant'],

            // === RELIGIOUS ===
            priest: ['basic', 'merchant', 'questGiver'],

            // === AUTHORITY / GUARDS ===
            guard: ['basic', 'questGiver'],
            captain: ['basic', 'questGiver'],
            sergeant: ['basic', 'questGiver'],

            // === SHADY / UNDERGROUND ===
            smuggler: ['basic', 'merchant'],
            thief: ['basic'],

            // === QUEST GIVERS ===
            questGiver: ['basic', 'questGiver'],
            elder: ['basic', 'questGiver'],
            huntmaster: ['basic', 'questGiver'],
            sage: ['basic', 'questGiver'],
            herald: ['basic', 'questGiver'],
            steward: ['basic', 'questGiver'],
            vintner: ['basic', 'merchant', 'questGiver'],
            mason: ['basic', 'merchant', 'questGiver'],
            harbormaster: ['basic', 'questGiver'],
            miller: ['basic', 'merchant', 'questGiver'],

            // 🏰 GRAND MARKET MERCHANT - Royal Capital only 👑
            grand_market_merchant: ['basic', 'merchant', 'questGiver'],

            // bosses - combat and loot powers
            boss: ['basic', 'boss', 'questGiver'],
            dungeonBoss: ['basic', 'boss', 'questGiver']
        },

        // 🎨 emote types available
        emotes: ['wave', 'bow', 'laugh', 'angry', 'sad', 'surprised', 'think', 'nod', 'shake_head', 'point']
    },

    // ═══════════════════════════════════════════════════════════════
    // ⌨️ KEYBOARD SHORTCUTS - because clicking is for casuals
    // ═══════════════════════════════════════════════════════════════
    // rebind these to your heart's content in the settings panel
    // or just change the defaults here if you're feeling powerful
    keybindings: {
        // 🎮 Default keybindings - the sacred scripture of shortcuts
        defaults: {
            pause: ' ',           // Space bar - freeze time like my emotions
            inventory: 'i',       // I for inventory - duh
            character: 'c',       // C for character sheet
            financial: 'f',       // F for financial/money stuff
            market: 'm',          // M for market
            travel: 't',          // T for travel
            map: 'n',             // N opens world map overlay (WASD reserved for panning)
            escape: 'Escape',     // Escape closes things
            quickSave: 'F5',      // Quick save - freeze your current disaster
            quickLoad: 'F9',      // Quick load - undo your mistakes
            mapUp: 'w',           // WASD for map panning
            mapDown: 's',
            mapLeft: 'a',
            mapRight: 'd',
            zoomIn: '=',          // + for zoom in
            zoomOut: '-',         // - for zoom out
            properties: 'p',      // P for properties
            achievements: 'h',    // H for... honors? achievements
            settings: ',',        // Comma for settings (like many games)
            quests: 'q',          // Q for quests - your endless suffering awaits
        },

        // 📝 Action descriptions for the settings UI
        descriptions: {
            pause: 'Pause/Resume Time',
            inventory: 'Open Inventory',
            character: 'Open Character Sheet',
            financial: 'Open Financial Sheet',
            market: 'Open Market',
            travel: 'Open Travel Panel',
            map: 'Open World Map',
            escape: 'Close/Exit',
            quickSave: 'Quick Save',
            quickLoad: 'Quick Load',
            mapUp: 'Pan Map Up',
            mapDown: 'Pan Map Down',
            mapLeft: 'Pan Map Left',
            mapRight: 'Pan Map Right',
            zoomIn: 'Zoom In',
            zoomOut: 'Zoom Out',
            properties: 'Open Properties',
            achievements: 'Open Achievements',
            settings: 'Open Settings',
            quests: 'Open Quest Log',
        },

        // 💾 localStorage key for saving custom bindings
        storageKey: 'tradingGame_keyBindings'
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧪 CI/CD TEST CONFIGURATION - the puppet master of deployments
    // ═══════════════════════════════════════════════════════════════
    // GitHub Actions reads this to determine which tests to run
    // set runAllTests to true to override individual settings
    // toggle individual suites to skip tests that are already passing
    // the workflow is your servant - config.js is your dark lord
    cicd: {
        // 🔥 MASTER OVERRIDE - set true to run ALL tests regardless of individual settings
        runAllTests: true,

        // 🧪 Individual test suite toggles
        // true = run this test suite on deploy
        // false = skip this test suite (it passed locally, save CI minutes)
        testSuites: {
            newGame: true,           // 🎮 new-game.spec.js - New Game Flow
            deboogerCommands: true,     // 🐛 debooger-commands.spec.js - Debooger Commands
            debooger: true,             // 🔍 debooger.spec.js - Console Error Check
            panels: true,            // 📋 panels.spec.js - Panel Tests
            features: true,          // 🎯 features.spec.js - Feature Tests
            settings: true,          // ⚙️ settings.spec.js - Settings Tests
            uiElements: true,        // 🖥️ ui-elements.spec.js - UI Element Tests
            comprehensiveUi: true    // 🎨 comprehensive-ui.spec.js - Comprehensive UI
        },

        // 📊 Test suite metadata (for workflow generation)
        suiteInfo: {
            newGame: { file: 'new-game.spec.js', emoji: '🎮', name: 'New Game Flow' },
            deboogerCommands: { file: 'debooger-commands.spec.js', emoji: '🐛', name: 'Debooger Commands' },
            debooger: { file: 'debooger.spec.js', emoji: '🔍', name: 'Console Errors' },
            panels: { file: 'panels.spec.js', emoji: '📋', name: 'Panel Tests' },
            features: { file: 'features.spec.js', emoji: '🎯', name: 'Feature Tests' },
            settings: { file: 'settings.spec.js', emoji: '⚙️', name: 'Settings Tests' },
            uiElements: { file: 'ui-elements.spec.js', emoji: '🖥️', name: 'UI Elements' },
            comprehensiveUi: { file: 'comprehensive-ui.spec.js', emoji: '🎨', name: 'Comprehensive UI' }
        },

        // 🖤 Last local test results - updated by Unity when tests pass
        // GitHub can use this to show what passed locally before deploy
        lastLocalRun: {
            date: '2025-11-27',
            passed: 127,
            failed: 0,
            skipped: 31,
            duration: '1.1m'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🛠️ HELPER METHODS - dark utilities for darker purposes
    // ═══════════════════════════════════════════════════════════════

    // summon the version string from the abyss
    getVersionString() {
        return `v${this.version.game}`;
    },

    // the full title, in all its glory
    getFullTitle() {
        return `${this.game.name} ${this.getVersionString()}`;
    },

    // credits formatted for the mortals
    getCreditsText() {
        const devNames = this.credits.developers.map(d => d.name).join(', ');
        return `forged by ${this.credits.studio}\ncode necromancers: ${devNames}`;
    },

    // developer list as HTML (for the about page shrine)
    getDevelopersHTML() {
        return this.credits.developers.map(dev =>
            `<div class="credit-entry"><span class="dev-name">${dev.name}</span><span class="dev-role">${dev.role}</span></div>`
        ).join('');
    },

    // playtester list as HTML (for the about page shrine)
    getPlaytestersHTML() {
        if (!this.credits.playtesters || this.credits.playtesters.length === 0) return '';
        return this.credits.playtesters.map(tester =>
            `<div class="credit-entry"><span class="dev-name">${tester.name}</span><span class="dev-role">${tester.role}</span></div>`
        ).join('');
    },

    // get social links HTML - escape routes from the void (styled as buttons)
    // 🖤 includeAbout parameter controls whether About button is shown (default true for main menu)
    getSocialLinksHTML(includeAbout = true) {
        const links = this.links;

        let linksHTML = '<div class="about-social-links">';

        // 🖤 About button - triggers rolling credits 💀
        if (includeAbout) {
            linksHTML += `<button class="about-link-btn" onclick="if(typeof CreditsSystem !== 'undefined') CreditsSystem.showCredits(); else console.error('CreditsSystem not loaded');" title="View credits and about info">ℹ️ About</button>`;
        }

        if (links.website) {
            linksHTML += `<a href="${links.website}" target="_blank" class="about-link-btn" title="Visit our website">🌐 Website</a>`;
        }
        if (links.github) {
            linksHTML += `<a href="${links.github}" target="_blank" class="about-link-btn" title="View source code">💻 GitHub</a>`;
        }
        if (links.discord) {
            linksHTML += `<a href="${links.discord}" target="_blank" class="about-link-btn" title="Join our Discord">💬 Discord</a>`;
        }
        if (links.support) {
            linksHTML += `<a href="mailto:${links.support}" class="about-link-btn" title="Send us an email">✉️ Contact Us</a>`;
        }

        linksHTML += '</div>';
        return linksHTML;
    },

    // 🖤 the about section - our digital tombstone (for settings panel About tab) 💀
    getAboutHTML() {
        const testersHTML = this.getPlaytestersHTML();
        return `
            <div class="about-section">
                <div class="about-logo">🏰</div>
                <h2>${this.game.name}</h2>
                <p class="about-tagline">${this.game.tagline}</p>
                <div class="about-version">version ${this.version.game}</div>
                <div class="about-studio">
                    <span class="studio-label">conjured by</span>
                    <span class="studio-name">${this.credits.studio}</span>
                </div>
                <div class="about-developers">
                    <h4>the fucking legends</h4>
                    ${this.getDevelopersHTML()}
                </div>
                ${testersHTML ? `
                <div class="about-developers">
                    <h4>bug slayers</h4>
                    ${testersHTML}
                </div>
                ` : ''}
                ${this.getSocialLinksHTML(false)}
                <div class="about-copyright">${this.credits.copyright}</div>
            </div>
        `;
    },

    // bend the browser tab to our will
    updateDocumentTitle(suffix = '') {
        document.title = suffix ? `${this.game.name} - ${suffix}` : this.game.name;
    },

    // awaken the config from its slumber
    init() {
        console.log(`🖤 ${this.game.name} v${this.version.game} rises from the void`);
        console.log(`⚰️ forged by ${this.credits.studio}`);
        this.updateDocumentTitle();
        return this;
    }
};

// bind to the window like a curse
if (typeof window !== 'undefined') {
    window.GameConfig = GameConfig;
}

console.log('🖤 GameConfig awakened... the darkness spreads');
