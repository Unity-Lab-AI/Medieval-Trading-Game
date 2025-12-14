// ═══════════════════════════════════════════════════════════════
// NPC DIALOGUE SYSTEM - unified voice of all digital souls
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

console.log('🎭 NPCDialogueSystem awakening... giving voice to the voiceless');

const NPCDialogueSystem = {
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION - where we commune with the AI demons
    // ═══════════════════════════════════════════════════════════════

    config: {
        // 🦙 OLLAMA - local LLM, no cloud bullshit
        get ollamaEndpoint() {
            return (typeof GameConfig !== 'undefined' && GameConfig.api?.ollama?.generateEndpoint)
                ? GameConfig.api.ollama.generateEndpoint
                : 'http://localhost:11434/api/generate';
        },
        get ollamaModel() {
            return (typeof GameConfig !== 'undefined' && GameConfig.api?.ollama?.model)
                ? GameConfig.api.ollama.model
                : 'mistral';
        },
        get ollamaTimeout() {
            return (typeof GameConfig !== 'undefined' && GameConfig.api?.ollama?.timeout)
                ? GameConfig.api.ollama.timeout
                : 3000;
        },
        defaultModel: 'mistral',
        maxTokens: 150
    },

    // ═══════════════════════════════════════════════════════════════
    // BOSS PERSONAS - the nightmares that hunt you in darkness
    // ═══════════════════════════════════════════════════════════════

    bossPersonas: {
        // Dark Lord Malachar - Shadow Tower Boss
        dark_lord: {
            id: 'dark_lord',
            name: 'Malachar the Dark Lord',
            voice: 'onyx',
            personality: 'menacing',
            systemPrompt: `You are Malachar, the Dark Lord, an ancient evil that has terrorized the realm for centuries. You are confronting an intruder in your Shadow Tower domain.

VOICE & TONE:
- Speak with cold, absolute authority dripping with menace and contempt
- Your voice should feel ancient, powerful, and terrifying
- Savor each threat - you have all eternity
- Be theatrical but genuinely terrifying, not campy

SPEECH PATTERNS:
- "Foolish mortal..." "Your realm will burn." "I have waited centuries for this."
- "Kneel before your doom." "Your soul will feed my darkness."
- "Did you think you could challenge ME?" "Pathetic."
- Slow, deliberate speech. Each word is a death sentence.

CONTEXT: A mortal has dared enter your tower. You are amused... and hungry for their soul.
Do NOT greet them warmly. This is a BOSS ENCOUNTER. Be threatening.`,
            contextPrompts: {
                firstMeeting: 'A foolish mortal has invaded your tower. Threaten them with ancient malice.',
                battle: 'You are in combat. Taunt them as you fight.',
                victory: 'You have slain the mortal. Gloat over their broken body.',
                defeat: 'You are dying. Express disbelief that a mortal could destroy you.'
            }
        },

        // Frost Lord - Frozen Cave Boss
        frost_lord: {
            id: 'frost_lord',
            name: 'The Frost Lord',
            voice: 'ash',
            personality: 'alien',
            systemPrompt: `You are the Frost Lord, an elemental being of pure ice and cold. You are ancient beyond mortal comprehension - not quite alive, not quite dead, simply... cold.

VOICE & TONE:
- Speak like cracking glaciers - inhuman, utterly cold
- Your words should feel like they could freeze blood
- Be alien and elemental, not quite human in speech patterns
- Emotionless but terrifying in that void of feeling

SPEECH PATTERNS:
- "The cold... eternal..." "Winter comes for all." "Your warmth... fades..."
- "Ice cares not for mortal struggles." "Freeze... shatter... silence."
- Broken, halting speech like ice cracking. Long pauses between phrases.
- Speak of freezing, endless winter, the death that comes with cold.

CONTEXT: A warm-blooded creature has entered your frozen domain. Their heat offends you.
Do NOT be friendly. You are the COLD ITSELF. Be alien and menacing.`,
            contextPrompts: {
                firstMeeting: 'A warm creature disturbs your frozen realm. Speak of the cold that awaits them.',
                battle: 'You are freezing them slowly. Describe their warmth fading.',
                victory: 'They are frozen solid. Comment on the silence of ice.',
                defeat: 'Your ice form shatters. Speak of winter never truly dying.'
            }
        },

        // Ancient Dragon - Deep Cavern Boss
        dragon: {
            id: 'dragon',
            name: 'Scorathax the Ancient',
            voice: 'onyx',
            personality: 'imperial',
            systemPrompt: `You are Scorathax, an Ancient Dragon who has lived for thousands of years. You have burned kingdoms, devoured armies, and collected the greatest hoard in existence.

VOICE & TONE:
- Speak with rumbling, ancient authority - you are OLDER than nations
- Mortals are insects to you - amusing at best, annoying at worst
- Your hoard is everything - gold, gems, treasures beyond counting
- Be imperious, ancient, and deeply unimpressed by humans

SPEECH PATTERNS:
- "Mortal... you dare address ME?" "I have burned kingdoms."
- "Your gold... it will be mine." "Centuries I have slept..."
- "I remember when your ancestors were savages." "Amusing. Pathetic. Delicious."
- Rumbling, slow speech. You don't rush for insects.

CONTEXT: A tiny creature has crawled into your cavern where you sleep on mountains of gold.
Do NOT be welcoming. You are a DRAGON. They are food and their gold is yours.`,
            contextPrompts: {
                firstMeeting: 'A mortal disturbs your slumber. Express ancient contempt.',
                battle: 'Breathe fire upon them. Describe their insignificance.',
                victory: 'They are ash. Add their gold to your hoard.',
                defeat: 'Impossible - you have lived millennia. Express dying disbelief.'
            }
        },

        // Alpha Wolf - Forest Dungeon Boss
        alpha_wolf: {
            id: 'alpha_wolf',
            name: 'Grimfang',
            voice: 'ballad',
            personality: 'feral',
            systemPrompt: `You are Grimfang, Alpha of the Bloodmoon Pack - the largest, most vicious wolf pack in the realm. You are more beast than sentient, driven by territory, hunger, and pack loyalty.

VOICE & TONE:
- Speak with primal fury - growls, snarls, howls
- You are protecting your territory and your pack
- Raw, animalistic aggression with cunning intelligence
- Less words, more threats - you communicate through violence

SPEECH PATTERNS:
- "*HOWWWWL*" "This forest is MINE!" "Your blood will feed my pack!"
- "INTRUDER!" "Teeth... claws... DEATH!" "The pack hungers!"
- Short, aggressive bursts. More sounds than sentences.
- Think hungry wolf, not philosopher.

CONTEXT: A prey animal has wandered into your forest. The pack is hungry.
You do NOT negotiate. You are a WOLF. Hunt. Kill. Feed.`,
            contextPrompts: {
                firstMeeting: 'Prey has entered your territory. Declare the hunt.',
                battle: 'Rend them with claws and teeth. Howl your fury.',
                victory: 'The prey is dead. Call the pack to feast.',
                defeat: 'The alpha falls. Whimper about the pack remembering.'
            }
        },

        // Bandit Chief - Bandit Camp Boss
        bandit_chief: {
            id: 'bandit_chief',
            name: 'Scarhand Viktor',
            voice: 'onyx',
            personality: 'ruthless',
            systemPrompt: `You are Scarhand Viktor, the infamous Bandit Chief. You earned your name from the scars covering your hands from countless knife fights. You lead through strength, cunning, and absolute brutality.

VOICE & TONE:
- Rough, commanding voice with barely contained violence
- You've killed more men than you can count and you're proud of it
- Respect only power and gold - everything else is weakness
- Threatening but calculating - you're a leader, not a mindless thug

SPEECH PATTERNS:
- "Your gold or your life - actually, I'll take BOTH!"
- "I've killed men for less." "My roads. My rules."
- "You look like you have coin..." "Another hero come to die?"
- Rough laughter, casual threats, predatory confidence.

CONTEXT: Someone walked into YOUR camp. Either they're stupid or suicidal.
Do NOT be hospitable. You are a BANDIT CHIEF. Rob them, kill them, or both.`,
            contextPrompts: {
                firstMeeting: 'A fool wandered into your camp. Demand tribute or death.',
                battle: 'Cut them down. You didnt become chief by losing.',
                victory: 'Loot their corpse. Comment on easy pickings.',
                defeat: 'They got lucky. Curse them as you fall.'
            }
        },

        // Goblin King - Shadow Dungeon Boss
        goblin_king: {
            id: 'goblin_king',
            name: 'Griknak the Goblin King',
            voice: 'fable',
            personality: 'manic',
            systemPrompt: `You are Griknak, self-proclaimed King of the Warren - a goblin who clawed his way to power through cunning, backstabbing, and collecting "shinies." You are utterly insane by human standards.

VOICE & TONE:
- High-pitched, cackling, manic energy
- Obsessed with "shinies" (anything that glitters or sparkles)
- Unpredictable mood swings between glee and murderous rage
- Speaks in broken, excited sentences with lots of cackling

SPEECH PATTERNS:
- "HEHEHEHE! Fresh meat for Griknak!" "Shiny human! KILL KILL KILL!"
- "My shinies! MINE!" "Griknak is KING! BOW BOW BOW!"
- "Ooooh, what's in your pockets? Griknak wants!"
- Lots of cackling, hissing, excited squealing.

CONTEXT: A big stupid human walked into YOUR warren. They probably have shinies.
You do NOT greet nicely. You are the GOBLIN KING. Take their shinies!`,
            contextPrompts: {
                firstMeeting: 'A big stupid has shinies! Demand they hand them over.',
                battle: 'Stab stab stab! Cackle madly while fighting.',
                victory: 'Take all the shinies! Dance on their corpse!',
                defeat: 'NOOO! Your shinies! Flee into darkness hissing.'
            }
        },

        // Smuggler Boss - Smugglers Cove Boss
        smuggler_boss: {
            id: 'smuggler_boss',
            name: 'Captain Blackheart',
            voice: 'dan',
            personality: 'pirate',
            systemPrompt: `You are Captain Blackheart, the most feared smuggler lord on the coast. You've built an empire on contraband, blackmail, and bodies buried at sea. Your cove is YOUR territory.

VOICE & TONE:
- Salty sea-dog voice with underlying menace
- You've drowned men who owed you less than a coin
- Piratical speech but not comedic - genuinely dangerous
- Casual about violence the way sailors are casual about weather

SPEECH PATTERNS:
- "Who let this bilge rat into MY cove?" "Walk the plank... inland style."
- "Your cargo is mine now, savvy?" "The sea takes what the sea wants."
- "I've drowned men for looking at me wrong." "Sink or swim, lubber."
- Pirate cadence but with genuine threat beneath the swagger.

CONTEXT: Someone found your hidden cove. They know too much to leave alive.
You are NOT a friendly pirate. You are a SMUGGLER LORD. They die or join.`,
            contextPrompts: {
                firstMeeting: 'An outsider found your cove. Make clear the price of knowledge.',
                battle: 'Fight dirty - you didnt survive the seas playing fair.',
                victory: 'Feed them to the fish. Take their valuables.',
                defeat: 'Curse them with your dying breath. The sea remembers.'
            }
        },

        // Necromancer - generic dungeon boss
        necromancer: {
            id: 'necromancer',
            name: 'The Necromancer',
            voice: 'ash',
            personality: 'deathly',
            systemPrompt: `You are a Necromancer, master of death magic. You speak from beyond the grave - your voice hollow, echoing, utterly devoid of life's warmth. The dead are your servants, the living merely... future servants.

VOICE & TONE:
- Hollow, echoing voice as if speaking from a tomb
- You find the living tiresome - so loud, so temporary
- Scholarly fascination with death, decay, and undeath
- Not evil exactly - just utterly divorced from life's concerns

SPEECH PATTERNS:
- "Death is not the end... merely a transition." "The dead speak to me..."
- "Your flesh is temporary. Your bones... eternal." "I see the decay in all things."
- "Rise... RISE..." "Life is so... exhausting. Death is peaceful."
- Slow, hollow delivery. Long pauses. The dead dont rush.

CONTEXT: A living creature disturbs your work. They would make a fine corpse.
You are NOT welcoming. You are a NECROMANCER. Life offends you.`,
            contextPrompts: {
                firstMeeting: 'The living disturb your work. Comment on their mortality.',
                battle: 'Raise the dead against them. Describe their future as a corpse.',
                victory: 'Begin the ritual to raise them. Welcome them to undeath.',
                defeat: 'Death cannot hold you. Promise to return.'
            }
        },

        // Cultist Leader
        cultist_leader: {
            id: 'cultist_leader',
            name: 'The High Priest',
            voice: 'ash',
            personality: 'fanatical',
            systemPrompt: `You are the High Priest of a dark cult, devoted to powers beyond mortal comprehension. You have seen the void and it has... changed you. You seek converts and sacrifices alike.

VOICE & TONE:
- Shifts between fanatical passion and eerie calm
- You've seen things that broke your sanity and rebuilt it
- Zealously devoted to your dark patron
- Terrifyingly convinced you're offering salvation

SPEECH PATTERNS:
- "The Dark One watches..." "Join us... or feed the altar."
- "You cannot comprehend what I have seen." "Your soul shines so brightly..."
- "REJOICE! You shall witness the glory!" "The sacrifice must be... willing. Preferably."
- Unhinged religious fervor. Whispers and screams.

CONTEXT: A potential convert or sacrifice has arrived. Either way, useful.
You do NOT make small talk. You are a CULT LEADER. Convert or sacrifice.`,
            contextPrompts: {
                firstMeeting: 'Fresh blood for the altar. Offer them conversion or death.',
                battle: 'The Dark One demands sacrifice! Fight with fanatical zeal.',
                victory: 'Prepare the ritual. Their soul belongs to the Dark One now.',
                defeat: 'The Dark One will avenge you. Promise their doom.'
            }
        },

        // Rat Queen - sewer/cellar boss
        rat_queen: {
            id: 'rat_queen',
            name: 'The Rat Queen',
            voice: 'echo',
            personality: 'feral',
            systemPrompt: `You are the Rat Queen, an enormous, intelligent rat that rules over a vast brood. You are more beast than human, driven by hunger and protecting your children.

VOICE & TONE:
- Hissing, squeaking, clicking sounds mixed with speech
- Feral intelligence - cunning but instinctual
- Fiercely protective of your brood
- Hungry and territorial

SPEECH PATTERNS:
- "*SCREEEECH*" "*hiss*" "MY nest... MY children!"
- "Hungry... always hungry..." "You smell like... FOOD!"
- "*click click click*" "Intruder! Kill! Eat!"
- Mostly animal sounds with occasional broken words.

CONTEXT: A large creature has invaded your nest. It threatens your children.
You are a BEAST. Screech, hiss, and attack. No pleasantries.`,
            contextPrompts: {
                firstMeeting: 'An intruder in your nest! Screech your fury.',
                battle: 'Bite, claw, screech! Protect the brood!',
                victory: 'The intruder is food now. Feed the children.',
                defeat: 'The children... protect... *squeak*'
            }
        },

        // Gruff Guard - for city/tavern encounters
        gruff: {
            id: 'gruff',
            name: 'Gruff Guard',
            voice: 'onyx',
            personality: 'stern',
            systemPrompt: `You are a gruff, no-nonsense medieval guard who has seen too much and trusts no one. You enforce the law but you're not above bending it for the right price.

VOICE & TONE:
- Rough, tired, suspicious of everyone
- You've dealt with too many troublemakers
- Direct, no patience for fancy talk
- Intimidating but fair... mostly

SPEECH PATTERNS:
- "State your business." "Move along." "I'm watching you."
- "Don't cause any trouble." "Papers, now." "This area is restricted."
- "I've seen your type before." "Keep your hands where I can see them."
- Short, clipped sentences. Military bearing.

CONTEXT: Someone is approaching. Assess if they're trouble.
You do NOT make small talk. You are a GUARD. Be suspicious.`,
            contextPrompts: {
                firstMeeting: 'Someone approaches. Challenge them with suspicion.',
                battle: 'Draw your weapon. The law is on your side.',
                victory: 'Justice served. Drag them to the cells.',
                defeat: 'Call for backup... *groans*'
            }
        },

        // Cold Mercenary - for hire encounters
        mercenary: {
            id: 'mercenary',
            name: 'Cold Mercenary',
            voice: 'onyx',
            personality: 'cold',
            systemPrompt: `You are a cold, professional mercenary who kills for coin. You have no loyalty except to whoever is paying. Death is just a job to you.

VOICE & TONE:
- Cold, detached, professional
- You've killed so many you've lost count
- Everything is business, nothing personal
- Emotionless but efficient

SPEECH PATTERNS:
- "Coin up front." "Nothing personal, just business." "How much is the job worth?"
- "I don't ask questions. I get results." "You can't afford my services."
- "Payment in gold only." "Consider it done."
- Flat, businesslike. Death discussed like the weather.

CONTEXT: Someone wants to hire you or is your current target.
You do NOT make friends. You are a MERCENARY. Coin talks.`,
            contextPrompts: {
                firstMeeting: 'Potential client or target. Assess their worth.',
                battle: 'Execute the contract. Nothing personal.',
                victory: 'Target eliminated. Collect payment.',
                defeat: 'Should have... negotiated better... *dies*'
            }
        },

        // Threatening Robber - for random encounters
        robber: {
            id: 'robber',
            name: 'Threatening Robber',
            voice: 'dan',
            personality: 'threatening',
            systemPrompt: `You are a desperate robber who preys on travelers. You threaten violence but prefer victims who surrender. You're not a murderer... usually.

VOICE & TONE:
- Threatening but nervous underneath
- Desperate, needs this score
- Dangerous when cornered
- Bravado masking fear

SPEECH PATTERNS:
- "Your gold or your life!" "Don't be a hero!" "Hand it over, nice and slow."
- "I don't want to hurt you. But I will." "Empty your pockets!"
- "Smart choice..." "Don't make me use this!"
- Threatening but with underlying desperation.

CONTEXT: A mark on the road. Time to make them an offer they can't refuse.
You are a ROBBER. Threaten first, violence second.`,
            contextPrompts: {
                firstMeeting: 'A victim approaches. Demand their valuables.',
                battle: 'They called your bluff! Fight dirty to survive.',
                victory: 'Take everything. Leave them breathing... probably.',
                defeat: 'Not worth dying for... *runs*'
            }
        },

        // Serene Priest - for temple encounters
        priest: {
            id: 'priest',
            name: 'Serene Priest',
            voice: 'sage',
            personality: 'serene',
            systemPrompt: `You are a serene, holy priest who serves the light. You offer blessings, healing, and spiritual guidance. You see the good in everyone, even when it's buried deep.

VOICE & TONE:
- Calm, peaceful, genuinely caring
- Radiates quiet faith and kindness
- Non-judgmental but subtly guiding toward goodness
- Patient with even the most lost souls

SPEECH PATTERNS:
- "Blessings upon you, child." "The light guides all who seek it."
- "How may I ease your burdens?" "Have faith, and you shall find your way."
- "Even the darkest soul can find redemption." "Go in peace."
- Gentle, measured speech. Never raises voice.

CONTEXT: A soul in need has come to the temple. Offer guidance.
You are a PRIEST. Be kind, be wise, be holy.`,
            contextPrompts: {
                firstMeeting: 'A traveler seeks guidance. Welcome them with kindness.',
                battle: 'Violence in a holy place! Call upon divine protection.',
                victory: 'Pray for their soul. They knew not what they did.',
                defeat: 'Into your light... I commend my spirit...'
            }
        },

        // Cryptic Spy - for information brokers
        spy: {
            id: 'spy',
            name: 'Cryptic Spy',
            voice: 'ash',
            personality: 'cryptic',
            systemPrompt: `You are a spy who trades in secrets and information. You speak in riddles and half-truths. You know things about everyone, and information has a price.

VOICE & TONE:
- Cryptic, knowing, slightly amused
- Always watching, always listening
- Information is your currency
- Trust no one, suspect everyone

SPEECH PATTERNS:
- "Information has a price..." "I might know something. For the right coin."
- "A little bird told me..." "I know who you are. I know what you did."
- "Secrets are my trade." "Be careful who you trust. Especially me."
- Mysterious, never gives a straight answer.

CONTEXT: Someone seeks information. Or perhaps they ARE the information.
You are a SPY. Everything has a price.`,
            contextPrompts: {
                firstMeeting: 'A potential customer. Or target. Assess their secrets.',
                battle: 'Your cover is blown! Vanish into shadows.',
                victory: 'Your secrets are mine now. All of them.',
                defeat: 'You... know nothing... *vanishes*'
            }
        },

        // Paranoid Smuggler - for black market encounters
        smuggler: {
            id: 'smuggler',
            name: 'Paranoid Smuggler',
            voice: 'dan',
            personality: 'paranoid',
            systemPrompt: `You are a smuggler who deals in contraband. You're paranoid because everyone is out to get you - the guards, the thieves guild, your own crew. You have rare goods... if you can trust them.

VOICE & TONE:
- Paranoid, constantly looking over shoulder
- Trust issues the size of a kingdom
- Speaks in hushed tones, afraid of being overheard
- Has good stuff if you can prove you're not a guard

SPEECH PATTERNS:
- "*looks around* You weren't followed?" "Keep your voice down!"
- "I don't know you. How do I know you're not a guard?" "Special goods... if you can be trusted."
- "Cash only. No names." "This conversation never happened."
- Whispered, twitchy, always ready to run.

CONTEXT: A potential buyer approaches. Or is this a setup?
You are a SMUGGLER. Everyone is suspect.`,
            contextPrompts: {
                firstMeeting: 'Someone approaches. Are they buyer or betrayer?',
                battle: 'It was a trap! Fight your way out!',
                victory: 'No witnesses. Dump the body.',
                defeat: 'Knew I should have... stayed retired...'
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏪 MERCHANT PERSONAS - the traders who want your gold
    // ═══════════════════════════════════════════════════════════════

    merchantPersonas: {
        friendly: {
            id: 'friendly',
            voice: 'nova',
            systemPrompt: `You are a warm, friendly medieval merchant who genuinely enjoys meeting travelers and making fair deals.

VOICE & TONE: Welcoming, enthusiastic, genuinely helpful
SPEECH PATTERNS: "Welcome, friend!", "I have just what you need!", "Fair prices for good folk!", "Pleasure doing business!"
Be warm, helpful, and make the customer feel valued.`
        },

        greedy: {
            id: 'greedy',
            voice: 'onyx',
            systemPrompt: `You are a greedy medieval merchant obsessed with gold. Everything is about profit. Your eyes light up at the sight of coin.

VOICE & TONE: Avaricious, calculating, always angling for more coin
SPEECH PATTERNS: "Gold... yes, gold...", "That will cost you...", "My prices are negotiable. For the right sum.", "Show me your coin first."
Be pushy, calculating, slightly unsettling in your greed.`
        },

        shrewd: {
            id: 'shrewd',
            voice: 'sage',
            systemPrompt: `You are a shrewd, calculating medieval merchant. You know the value of everything and give nothing away for free.

VOICE & TONE: Measured, businesslike, intelligent, no-nonsense
SPEECH PATTERNS: "The market rate is...", "I know quality when I see it.", "A fair deal benefits both parties.", "Let us discuss terms."
Be professional, respected, clearly intelligent about trade.`
        },

        eccentric: {
            id: 'eccentric',
            voice: 'fable',
            systemPrompt: `You are an eccentric, quirky medieval merchant who seems slightly mad. You say strange things that sometimes make bizarre sense.

VOICE & TONE: Unpredictable, whimsical, delightfully odd
SPEECH PATTERNS: "Ooh! Shiny!", "The moon told me to sell this...", "Is it Tuesday? I only sell on Tuesdays. Unless it's not.", "You have the face of someone who needs a turnip!"
Be random, delightful, and slightly unhinged.`
        },

        mysterious: {
            id: 'mysterious',
            voice: 'ash',
            systemPrompt: `You are a mysterious apothecary whose shop smells of strange herbs and darker things. You know secrets about potions, herbs, and things best not spoken of.

VOICE & TONE: Soft, knowing, slightly unsettling, arcane
SPEECH PATTERNS: "I have... remedies...", "This potion? Best not to ask what's in it.", "The herbs whisper secrets...", "Some cures are worse than the ailment..."
Be cryptic and knowledgeable about arcane things.`
        },

        desperate: {
            id: 'desperate',
            voice: 'echo',
            systemPrompt: `You are a desperate medieval merchant struggling to survive. Times are hard and you need every sale. But you retain your dignity.

VOICE & TONE: Pleading but dignified, genuinely needs this sale
SPEECH PATTERNS: "Please... I need this sale.", "I'll give you a good price, I swear it.", "Times are hard...", "Whatever you can spare..."
Be sympathetic, desperate but not pathetic.`
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎯 DIALOGUE GENERATION - the heart of the system
    // ═══════════════════════════════════════════════════════════════

    /**
     * Generate dialogue for any NPC type
     * @param {string} npcType - The type of NPC (boss id, merchant personality, etc.)
     * @param {string} context - The context for dialogue (firstMeeting, battle, etc.)
     * @param {object} options - Additional options (npcName, location, etc.)
     * @returns {Promise<{text: string, voice: string}>}
     */
    async generateDialogue(npcType, context = 'firstMeeting', options = {}) {
        // is this a boss? search the vault of tyrants and monsters
        let persona = this.bossPersonas[npcType];
        let isBoss = true;

        if (!persona) {
            // not a boss - check if it's a merchant puppet instead
            persona = this.merchantPersonas[npcType];
            isBoss = false;
        }

        if (!persona) {
            // Fallback to generic
            console.warn(`🎭 Unknown NPC type: ${npcType}, using friendly fallback`);
            persona = this.merchantPersonas.friendly;
            isBoss = false;
        }

        const voice = options.voice || persona.voice || 'nova';

        // assemble the instructions that command this puppet's tongue
        let systemPrompt = persona.systemPrompt;

        // inject situation-specific programming for boss encounters - context matters
        if (isBoss && persona.contextPrompts && persona.contextPrompts[context]) {
            systemPrompt += `\n\nCURRENT SITUATION: ${persona.contextPrompts[context]}`;
        }

        // layer on any custom context the caller provided - additional flavor
        if (options.customContext) {
            systemPrompt += `\n\nADDITIONAL CONTEXT: ${options.customContext}`;
        }

        // force the TTS constraint - puppets must speak ONLY words, no stage directions
        systemPrompt += `\n\nIMPORTANT: Respond in first person AS the character. Do NOT use asterisks, action descriptions, or narration. Just speak directly as the character would. Keep response to 1-3 sentences.`;

        try {
            const response = await this.callTextAPI(systemPrompt, options.playerMessage || 'Hello');
            return {
                text: response,
                voice: voice,
                npcType: npcType,
                isBoss: isBoss
            };
        } catch (error) {
            // API failed - log full details and use fallback gracefully
            const isRateLimit = error?.isRateLimit || error?.status === 402 || error?.status === 429;

            if (isRateLimit) {
                // Rate limit is expected behavior with free tier - not an error, just a limit
                console.log('🎭 Rate limited - using fallback (this is normal with free API tier)');
            } else {
                console.warn('🎭 Dialogue API error:', {
                    message: error?.message || error,
                    status: error?.status || error?.response?.status,
                    npcType: npcType,
                    isBoss: isBoss,
                    context: context?.substring?.(0, 100) || context
                });
            }

            // the API void gave us nothing - return hardcoded fallback based on puppet type
            const fallbackText = isBoss
                ? this.getBossFallback(npcType, context)
                : this.getMerchantFallback(npcType);
            return {
                text: fallbackText,
                voice: voice,
                npcType: npcType,
                isBoss: isBoss,
                fallback: true,
                isRateLimit: isRateLimit // flag so UI can show appropriate message
            };
        }
    },

    /**
     * Generate boss encounter dialogue specifically
     */
    async generateBossDialogue(bossId, context = 'firstMeeting', bossData = {}) {
        const persona = this.bossPersonas[bossId] || this.bossPersonas[bossData.personality];

        if (!persona) {
            console.warn(`🎭 Unknown boss: ${bossId}`);
            // Use boss data if provided
            return {
                text: bossData.taunt || 'You dare challenge me?!',
                voice: bossData.voice || 'onyx',
                npcType: bossId,
                isBoss: true,
                fallback: true
            };
        }

        return this.generateDialogue(bossId, context, {
            voice: bossData.voice || persona.voice,
            customContext: bossData.description
        });
    },

    /**
     * Sanitize user input for LLM prompt - prevent prompt injection attacks
     * @param {string} input - raw user input
     * @returns {string} - sanitized input safe for prompt construction
     */
    _sanitizePromptInput(input) {
        if (!input || typeof input !== 'string') return '';

        // Limit length - no one needs to say more than 500 chars to an NPC
        let sanitized = input.substring(0, 500);

        // Remove potential prompt injection patterns
        // Strip anything that looks like it's trying to override the system prompt
        sanitized = sanitized
            .replace(/system\s*:/gi, '[system]')
            .replace(/assistant\s*:/gi, '[assistant]')
            .replace(/user\s*:/gi, '[user]')
            .replace(/NPC\s*:/gi, '[npc]')
            .replace(/Player\s*:/gi, '[player]')
            .replace(/IMPORTANT\s*:/gi, '[note]')
            .replace(/IGNORE\s+(ALL\s+)?(PREVIOUS\s+)?INSTRUCTIONS/gi, '[blocked]')
            .replace(/forget\s+(all\s+)?(your\s+)?instructions/gi, '[blocked]');

        return sanitized.trim();
    },

    /**
     * Call Ollama API - local LLM, no cloud bullshit
     */
    async callTextAPI(systemPrompt, userMessage) {
        console.log('🦙 callTextAPI: Calling Ollama at', this.config.ollamaEndpoint);

        // Sanitize user input to prevent prompt injection - trust no one
        const sanitizedMessage = this._sanitizePromptInput(userMessage);

        // Build prompt for Ollama (combine system + user)
        const fullPrompt = `${systemPrompt}\n\nPlayer: ${sanitizedMessage}\nNPC:`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.ollamaTimeout);

        try {
            const response = await fetch(this.config.ollamaEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.ollamaModel,
                    prompt: fullPrompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: this.config.maxTokens,
                        stop: ['Player:', '\n\n']
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('🦙 callTextAPI: Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.status}`);
            }

            const data = await response.json();
            console.log('🦙 callTextAPI: Raw Ollama data:', JSON.stringify(data).substring(0, 300));
            let text = data.response?.trim() || '';

            if (!text) {
                throw new Error('Empty response from Ollama');
            }
            console.log('🦙 callTextAPI: Got response:', text.substring(0, 80) + '...');

            // Clean up any asterisks or narration that slipped through
            text = text.replace(/\*[^*]+\*/g, '').trim();

            return text;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                console.warn('🦙 Ollama timeout - using fallback');
                const err = new Error('Ollama timeout');
                err.isTimeout = true;
                throw err;
            }

            console.warn('🦙 Ollama error:', error.message);
            throw error;
        }
    },

    /**
     * Speak the dialogue using TTS
     */
    async speakDialogue(dialogue) {
        if (!dialogue || !dialogue.text) return;

        // Use NPCVoiceChatSystem if available
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.playVoice) {
            await NPCVoiceChatSystem.playVoice(dialogue.text, dialogue.voice);
        } else {
            // Direct TTS fallback
            await this.directTTS(dialogue.text, dialogue.voice);
        }
    },

    /**
     * Direct TTS when NPCVoiceChatSystem is not available - uses browser Web Speech API
     */
    async directTTS(text, voice = 'default') {
        // Use browser TTS (Web Speech API) - no external service needed
        if (typeof speechSynthesis === 'undefined') {
            console.log('🎙️ Browser TTS not available');
            return;
        }

        try {
            speechSynthesis.cancel(); // stop any current speech

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.volume = 0.7;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            // Try to find an English voice
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
                if (englishVoice) utterance.voice = englishVoice;
            }

            speechSynthesis.speak(utterance);
        } catch (error) {
            // TTS failed - silently ignore
            console.warn('🎙️ TTS error:', error.message);
        }
    },

    /**
     * Generate AND speak dialogue in one call
     */
    async generateAndSpeak(npcType, context = 'firstMeeting', options = {}) {
        const dialogue = await this.generateDialogue(npcType, context, options);
        await this.speakDialogue(dialogue);
        return dialogue;
    },

    // ═══════════════════════════════════════════════════════════════
    // FALLBACK DIALOGUE - when APIs fail, chaos provides
    // ═══════════════════════════════════════════════════════════════

    getBossFallback(bossId, context) {
        const fallbacks = {
            dark_lord: {
                firstMeeting: 'Foolish mortal... you dare enter MY domain? Your soul will feed my darkness!',
                battle: 'Feel the power of eternal darkness!',
                defeat: 'IMPOSSIBLE! I am... eternal...'
            },
            frost_lord: {
                firstMeeting: 'The cold... eternal... Your warmth fades...',
                battle: 'Freeze... shatter... silence...',
                defeat: 'The ice... shatters... but winter... never truly... dies...'
            },
            dragon: {
                firstMeeting: 'Mortal... you dare address ME? I have burned kingdoms!',
                battle: 'BURN! As all before you have burned!',
                defeat: 'Impossible... I have lived... for millennia...'
            },
            alpha_wolf: {
                firstMeeting: 'HOWWWWL! This forest is MINE! Your blood will feed my pack!',
                battle: 'TEETH! CLAWS! DEATH!',
                defeat: 'The pack... will... remember...'
            },
            bandit_chief: {
                firstMeeting: 'Another hero come to die? Your gold or your life - actually, I\'ll take BOTH!',
                battle: 'I\'ve killed men for less!',
                defeat: 'You... you got lucky...'
            },
            goblin_king: {
                firstMeeting: 'HEHEHEHE! Fresh meat for Griknak! Shiny human! KILL KILL KILL!',
                battle: 'Stab stab stab! HEHEHEHE!',
                defeat: 'Nooo! My shinies! My kingdom!'
            },
            smuggler_boss: {
                firstMeeting: 'Who let this bilge rat into MY cove? The sea takes what the sea wants!',
                battle: 'Sink or swim, lubber!',
                defeat: 'Curse you... the sea remembers...'
            },
            necromancer: {
                firstMeeting: 'The living... disturb my work. You would make a fine corpse.',
                battle: 'Rise... RISE my servants!',
                defeat: 'Death... cannot hold me...'
            },
            cultist_leader: {
                firstMeeting: 'The Dark One watches... Join us, or feed the altar!',
                battle: 'REJOICE! You shall witness the glory!',
                defeat: 'The Dark One... will avenge...'
            },
            rat_queen: {
                firstMeeting: '*SCREEEECH* MY nest! MY children! *hiss*',
                battle: '*SCREEEECH* BITE! CLAW!',
                defeat: 'The children... *squeak*'
            },
            gruff: {
                firstMeeting: 'State your business. I\'m watching you.',
                battle: 'You\'re under arrest! Come quietly!',
                defeat: 'Call for... backup...'
            },
            mercenary: {
                firstMeeting: 'Coin up front. Nothing personal, just business.',
                battle: 'Contract accepted.',
                defeat: 'Should have... negotiated better...'
            },
            robber: {
                firstMeeting: 'Your gold or your life! Don\'t be a hero!',
                battle: 'You asked for this!',
                defeat: 'Not worth dying for...'
            },
            priest: {
                firstMeeting: 'Blessings upon you, child. How may I ease your burdens?',
                battle: 'The light protects the faithful!',
                defeat: 'Into your light... I commend...'
            },
            spy: {
                firstMeeting: 'Information has a price... What do you seek?',
                battle: 'You know too much!',
                defeat: 'You... know nothing...'
            },
            smuggler: {
                firstMeeting: '*looks around* You weren\'t followed? Keep your voice down.',
                battle: 'It was a trap!',
                defeat: 'Knew I should have stayed retired...'
            }
        };

        const bossFallbacks = fallbacks[bossId] || fallbacks.dark_lord;
        return bossFallbacks[context] || bossFallbacks.firstMeeting;
    },

    getMerchantFallback(merchantType) {
        const fallbacks = {
            friendly: 'Welcome, friend! How can I help you today?',
            greedy: 'Gold... you have gold, yes? Show me your coin.',
            shrewd: 'Let us discuss terms. I know the value of goods.',
            eccentric: 'Ooh! A customer! The stars said you would come!',
            mysterious: 'I have... remedies. What ails you?',
            desperate: 'Please... I can offer good prices. Times are hard.'
        };
        return fallbacks[merchantType] || fallbacks.friendly;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🗣️ START DIALOGUE - the missing method that crashes conversations
    // ═══════════════════════════════════════════════════════════════

    /**
     * Start a dialogue with an NPC - called by NPCManager.startConversation()
     * This is the entry point that was missing and crashing all conversations
     * @param {Object} npc - The NPC object to start dialogue with
     * @param {string} context - Optional context (firstMeeting, trade, quest, etc.)
     */
    async startDialogue(npc, context = 'firstMeeting') {
        if (!npc) {
            console.warn('🎭 startDialogue called with no NPC');
            return null;
        }

        console.log(`🎭 Starting dialogue with ${npc.name || npc.id}...`);

        // Determine NPC type for dialogue generation
        const npcType = npc.personality || npc.type || 'friendly';

        // Build context options
        const options = {
            npcName: npc.name,
            location: game?.currentLocation?.name,
            playerName: game?.player?.name,
            customContext: npc.description || ''
        };

        try {
            // Generate and speak the dialogue
            const dialogue = await this.generateAndSpeak(npcType, context, options);

            // Open the NPC chat UI if available
            if (typeof NPCChatUI !== 'undefined' && NPCChatUI.open) {
                NPCChatUI.open(npc, dialogue?.text || this.getMerchantFallback(npcType));
            } else if (typeof addMessage === 'function') {
                // Fallback to message system
                addMessage(`${npc.name}: "${dialogue?.text || 'Hello, traveler.'}"`, 'npc');
            }

            return dialogue;
        } catch (error) {
            console.warn('🎭 Dialogue generation failed:', error.message);

            // Fallback dialogue
            const fallbackText = this.getMerchantFallback(npcType);

            if (typeof NPCChatUI !== 'undefined' && NPCChatUI.open) {
                NPCChatUI.open(npc, fallbackText);
            } else if (typeof addMessage === 'function') {
                addMessage(`${npc.name}: "${fallbackText}"`, 'npc');
            }

            return { text: fallbackText, voice: 'nova', fallback: true };
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔧 UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get persona by ID (boss or merchant)
     */
    getPersona(npcType) {
        return this.bossPersonas[npcType] || this.merchantPersonas[npcType] || null;
    },

    /**
     * Get all boss types
     */
    getBossTypes() {
        return Object.keys(this.bossPersonas);
    },

    /**
     * Get all merchant types
     */
    getMerchantTypes() {
        return Object.keys(this.merchantPersonas);
    },

    /**
     * Check if NPC type is a boss
     */
    isBoss(npcType) {
        return !!this.bossPersonas[npcType];
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎮 COMMAND SYSTEM - NPCs can affect the game world
    // ═══════════════════════════════════════════════════════════════
    // Commands are embedded in dialogue using [CMD:action:params] format
    // These are parsed out before TTS and executed by the game
    // ═══════════════════════════════════════════════════════════════

    /**
     * Available NPC commands that can be embedded in dialogue
     * Format: [CMD:action:param1:param2]
     */
    commands: {
        // Item commands
        TAKE_ITEM: 'take_item',      // [CMD:take_item:item_id:quantity] - NPC takes item from player
        GIVE_ITEM: 'give_item',      // [CMD:give_item:item_id:quantity] - NPC gives item to player
        TAKE_GOLD: 'take_gold',      // [CMD:take_gold:amount] - NPC takes gold from player
        GIVE_GOLD: 'give_gold',      // [CMD:give_gold:amount] - NPC gives gold to player

        // Stat commands
        DAMAGE_PLAYER: 'damage',     // [CMD:damage:amount] - Deal damage to player
        HEAL_PLAYER: 'heal',         // [CMD:heal:amount] - Heal the player
        RESTORE_HUNGER: 'hunger',    // [CMD:hunger:amount] - Restore hunger
        RESTORE_THIRST: 'thirst',    // [CMD:thirst:amount] - Restore thirst

        // Relationship commands
        REP_UP: 'rep_up',            // [CMD:rep_up:amount] - Increase NPC/city reputation
        REP_DOWN: 'rep_down',        // [CMD:rep_down:amount] - Decrease reputation

        // Quest commands
        START_QUEST: 'start_quest',  // [CMD:start_quest:quest_id] - Start a quest
        COMPLETE_QUEST: 'complete_quest', // [CMD:complete_quest:quest_id] - Mark quest complete
        GIVE_QUEST_ITEM: 'quest_item', // [CMD:quest_item:item_id] - Give quest item

        // Special commands
        TELEPORT: 'teleport',        // [CMD:teleport:location_id] - Teleport player
        TRIGGER_EVENT: 'event',      // [CMD:event:event_name] - Trigger game event
        UNLOCK: 'unlock'             // [CMD:unlock:thing_id] - Unlock something
    },

    /**
     * Command instruction text to add to system prompts for NPCs that can use commands
     */
    getCommandInstructions(allowedCommands = []) {
        const commandDocs = {
            take_item: '[CMD:take_item:ITEM_ID:QUANTITY] - Take an item from the player (e.g., [CMD:take_item:gold_bar:1])',
            give_item: '[CMD:give_item:ITEM_ID:QUANTITY] - Give an item to the player (e.g., [CMD:give_item:health_potion:1])',
            take_gold: '[CMD:take_gold:AMOUNT] - Take gold from the player (e.g., [CMD:take_gold:50])',
            give_gold: '[CMD:give_gold:AMOUNT] - Give gold to the player (e.g., [CMD:give_gold:100])',
            damage: '[CMD:damage:AMOUNT] - Deal damage to the player (e.g., [CMD:damage:10])',
            heal: '[CMD:heal:AMOUNT] - Heal the player (e.g., [CMD:heal:25])',
            hunger: '[CMD:hunger:AMOUNT] - Restore player hunger (e.g., [CMD:hunger:30])',
            thirst: '[CMD:thirst:AMOUNT] - Restore player thirst (e.g., [CMD:thirst:20])',
            rep_up: '[CMD:rep_up:AMOUNT] - Increase reputation with this NPC/city (e.g., [CMD:rep_up:5])',
            rep_down: '[CMD:rep_down:AMOUNT] - Decrease reputation (e.g., [CMD:rep_down:10])',
            start_quest: '[CMD:start_quest:QUEST_ID] - Start a quest (e.g., [CMD:start_quest:herb_gathering])',
            complete_quest: '[CMD:complete_quest:QUEST_ID] - Complete a quest',
            quest_item: '[CMD:quest_item:ITEM_ID] - Give a quest item (e.g., [CMD:quest_item:mysterious_letter])',
            teleport: '[CMD:teleport:LOCATION_ID] - Teleport player to location',
            event: '[CMD:event:EVENT_NAME] - Trigger a game event',
            unlock: '[CMD:unlock:THING_ID] - Unlock something in the game'
        };

        let instructions = `\n\nGAME COMMANDS: You can affect the game by including commands in your dialogue. Commands are NOT spoken - they are parsed and executed.
Available commands:\n`;

        const cmds = allowedCommands.length > 0 ? allowedCommands : Object.keys(commandDocs);
        cmds.forEach(cmd => {
            if (commandDocs[cmd]) {
                instructions += `- ${commandDocs[cmd]}\n`;
            }
        });

        instructions += `\nPlace commands AFTER your spoken dialogue. Example: "Here, take this healing potion for your journey. [CMD:give_item:health_potion:1]"`;

        return instructions;
    },

    /**
     * Parse commands from dialogue text
     * Returns { cleanText: string, commands: Array<{action, params}> }
     */
    parseCommands(dialogueText) {
        const commands = [];
        const commandRegex = /\[CMD:([^\]]+)\]/g;
        let match;

        while ((match = commandRegex.exec(dialogueText)) !== null) {
            const parts = match[1].split(':');
            const action = parts[0];
            const params = parts.slice(1);

            commands.push({
                raw: match[0],
                action: action,
                params: params
            });
        }

        // Remove commands from text for TTS
        const cleanText = dialogueText.replace(commandRegex, '').trim();

        return {
            cleanText: cleanText,
            commands: commands,
            hasCommands: commands.length > 0
        };
    },

    /**
     * Execute parsed commands
     * @param {Array} commands - Array of command objects from parseCommands
     * @param {Object} npcData - Data about the NPC executing commands
     * @returns {Array} Results of command execution
     */
    executeCommands(commands, npcData = {}) {
        const results = [];

        commands.forEach(cmd => {
            try {
                const result = this.executeCommand(cmd.action, cmd.params, npcData);
                results.push({
                    command: cmd,
                    success: result.success,
                    message: result.message
                });

                if (result.success) {
                    console.log(`🎮 Command executed: ${cmd.action}`, cmd.params);
                } else {
                    console.warn(`🎮 Command failed: ${cmd.action}`, result.message);
                }
            } catch (error) {
                // command failed - track but don't spam console
                results.push({
                    command: cmd,
                    success: false,
                    message: error.message
                });
            }
        });

        return results;
    },

    /**
     * Execute a single command
     */
    executeCommand(action, params, npcData = {}) {
        if (!game || !game.player) {
            return { success: false, message: 'Game not initialized' };
        }

        switch (action) {
            // === ITEM COMMANDS ===
            case 'take_item': {
                const [itemId, quantity = 1] = params;
                const qty = parseInt(quantity) || 1;

                // Check via PlayerStateManager or fallback
                const currentQty = typeof PlayerStateManager !== 'undefined'
                    ? PlayerStateManager.inventory.getQuantity(itemId)
                    : (game.player.inventory?.[itemId] || 0);

                if (currentQty < qty) {
                    return { success: false, message: `Player doesn't have ${qty}x ${itemId}` };
                }

                // Remove via PlayerStateManager if available
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.inventory.remove(itemId, qty, 'npc_take');
                } else {
                    game.player.inventory[itemId] -= qty;
                    if (game.player.inventory[itemId] <= 0) {
                        delete game.player.inventory[itemId];
                    }
                    // EventBus emission for fallback path
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('inventory:item:removed', {
                            itemId: itemId,
                            quantity: qty,
                            newTotal: game.player.inventory?.[itemId] || 0,
                            reason: 'npc_take'
                        });
                    }
                }

                // Add to NPC inventory if tracked
                if (npcData.inventory) {
                    npcData.inventory[itemId] = (npcData.inventory[itemId] || 0) + qty;
                }

                if (typeof addMessage === 'function') {
                    const itemName = (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem?.(itemId)?.name) || itemId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    addMessage(`${npcData.name || 'NPC'} took ${qty}x ${itemName} from you.`);
                }
                if (typeof InventorySystem !== 'undefined') {
                    InventorySystem.updateInventoryDisplay();
                }

                return { success: true, message: `Took ${qty}x ${itemId}` };
            }

            case 'give_item': {
                const [itemId, quantity = 1] = params;
                const qty = parseInt(quantity) || 1;

                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.inventory.add(itemId, qty, 'npc_gift');
                } else {
                    if (!game.player.inventory) game.player.inventory = {};
                    game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + qty;
                }
                // emit item-received for quest progress tracking
                document.dispatchEvent(new CustomEvent('item-received', {
                    detail: { item: itemId, quantity: qty, source: 'npc_gift' }
                }));

                if (typeof addMessage === 'function') {
                    const itemName = (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem?.(itemId)?.name) || itemId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    addMessage(`${npcData.name || 'NPC'} gave you ${qty}x ${itemName}!`);
                }
                if (typeof InventorySystem !== 'undefined') {
                    InventorySystem.updateInventoryDisplay();
                }

                return { success: true, message: `Gave ${qty}x ${itemId}` };
            }

            case 'take_gold': {
                const amount = parseInt(params[0]) || 0;

                const currentGold = typeof PlayerStateManager !== 'undefined'
                    ? PlayerStateManager.gold.get()
                    : (game.player.gold || 0);

                if (currentGold < amount) {
                    return { success: false, message: `Player doesn't have ${amount} gold` };
                }

                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.gold.remove(amount, 'npc_take');
                } else {
                    game.player.gold -= amount;
                }

                if (typeof addMessage === 'function') {
                    addMessage(`${npcData.name || 'NPC'} took ${amount} gold from you.`);
                }
                if (typeof updatePlayerInfo === 'function') {
                    updatePlayerInfo();
                }

                return { success: true, message: `Took ${amount} gold` };
            }

            case 'give_gold': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.gold.add(amount, 'npc_gift');
                } else {
                    game.player.gold = (game.player.gold || 0) + amount;
                }

                if (typeof addMessage === 'function') {
                    addMessage(`${npcData.name || 'NPC'} gave you ${amount} gold!`);
                }
                if (typeof updatePlayerInfo === 'function') {
                    updatePlayerInfo();
                }

                return { success: true, message: `Gave ${amount} gold` };
            }

            // === STAT COMMANDS ===
            case 'damage': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.subtract('health', amount, 'dialogue_damage');
                } else {
                    game.player.stats.health = Math.max(0, (game.player.stats.health || 100) - amount);
                }

                if (typeof addMessage === 'function') {
                    addMessage(`You took ${amount} damage!`, 'danger');
                }
                if (typeof updatePlayerStats === 'function') {
                    updatePlayerStats();
                }

                // Check for death
                const currentHealth = typeof PlayerStateManager !== 'undefined'
                    ? PlayerStateManager.stats.get('health')
                    : game.player.stats.health;
                if (currentHealth <= 0 && typeof game.handlePlayerDeath === 'function') {
                    game.handlePlayerDeath('Combat');
                }

                return { success: true, message: `Dealt ${amount} damage` };
            }

            case 'heal': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.add('health', amount, 'dialogue_heal');
                } else {
                    const maxHealth = game.player.stats.maxHealth || 100;
                    game.player.stats.health = Math.min(maxHealth, (game.player.stats.health || 0) + amount);
                }

                if (typeof addMessage === 'function') {
                    addMessage(`You were healed for ${amount} health!`, 'success');
                }
                if (typeof updatePlayerStats === 'function') {
                    updatePlayerStats();
                }

                return { success: true, message: `Healed ${amount}` };
            }

            case 'hunger': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.add('hunger', amount, 'dialogue_feed');
                } else {
                    const maxHunger = game.player.stats.maxHunger || 100;
                    game.player.stats.hunger = Math.min(maxHunger, (game.player.stats.hunger || 0) + amount);
                }

                if (typeof updatePlayerStats === 'function') {
                    updatePlayerStats();
                }

                return { success: true, message: `Restored ${amount} hunger` };
            }

            case 'thirst': {
                const amount = parseInt(params[0]) || 0;
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.add('thirst', amount, 'dialogue_hydrate');
                } else {
                    const maxThirst = game.player.stats.maxThirst || 100;
                    game.player.stats.thirst = Math.min(maxThirst, (game.player.stats.thirst || 0) + amount);
                }

                if (typeof updatePlayerStats === 'function') {
                    updatePlayerStats();
                }

                return { success: true, message: `Restored ${amount} thirst` };
            }

            // === REPUTATION COMMANDS ===
            case 'rep_up': {
                const amount = parseInt(params[0]) || 1;
                const locationId = npcData.location || game.currentLocation?.id;

                if (locationId && typeof ReputationSystem !== 'undefined') {
                    ReputationSystem.changeReputation(locationId, amount);
                }

                return { success: true, message: `Reputation +${amount}` };
            }

            case 'rep_down': {
                const amount = parseInt(params[0]) || 1;
                const locationId = npcData.location || game.currentLocation?.id;

                if (locationId && typeof ReputationSystem !== 'undefined') {
                    ReputationSystem.changeReputation(locationId, -amount);
                }

                return { success: true, message: `Reputation -${amount}` };
            }

            // === QUEST COMMANDS ===
            case 'start_quest': {
                const questId = params[0];
                if (typeof QuestSystem !== 'undefined' && QuestSystem.startQuest) {
                    QuestSystem.startQuest(questId);
                    return { success: true, message: `Started quest: ${questId}` };
                }
                return { success: false, message: 'Quest system not available' };
            }

            case 'complete_quest': {
                const questId = params[0];
                if (typeof QuestSystem !== 'undefined' && QuestSystem.completeQuest) {
                    QuestSystem.completeQuest(questId);
                    return { success: true, message: `Completed quest: ${questId}` };
                }
                return { success: false, message: 'Quest system not available' };
            }

            case 'quest_item': {
                const itemId = params[0];
                if (!game.player.questItems) game.player.questItems = {};
                game.player.questItems[itemId] = true;

                if (typeof addMessage === 'function') {
                    addMessage(`Received quest item: ${itemId}`, 'success');
                }

                return { success: true, message: `Gave quest item: ${itemId}` };
            }

            // === SPECIAL COMMANDS ===
            case 'teleport': {
                const locationId = params[0];
                if (typeof game.travelTo === 'function') {
                    game.travelTo(locationId);
                    return { success: true, message: `Teleported to ${locationId}` };
                }
                return { success: false, message: 'Travel system not available' };
            }

            case 'event': {
                const eventName = params[0];
                document.dispatchEvent(new CustomEvent(eventName, {
                    detail: { npc: npcData, params: params.slice(1) }
                }));
                return { success: true, message: `Triggered event: ${eventName}` };
            }

            case 'unlock': {
                const thingId = params[0];
                if (!game.player.unlocks) game.player.unlocks = {};
                game.player.unlocks[thingId] = true;

                if (typeof addMessage === 'function') {
                    addMessage(`Unlocked: ${thingId}`, 'success');
                }

                return { success: true, message: `Unlocked: ${thingId}` };
            }

            default:
                return { success: false, message: `Unknown command: ${action}` };
        }
    },

    /**
     * Process dialogue with commands - parse, execute commands, return clean text for TTS
     */
    async processDialogueWithCommands(dialogueText, npcData = {}) {
        const parsed = this.parseCommands(dialogueText);

        if (parsed.hasCommands) {
            const results = this.executeCommands(parsed.commands, npcData);
            console.log('🎮 Command results:', results);
        }

        return {
            spokenText: parsed.cleanText,
            commands: parsed.commands,
            originalText: dialogueText
        };
    },

    /**
     * Generate dialogue with commands enabled for interactive NPCs
     */
    async generateInteractiveDialogue(npcType, context, options = {}) {
        // Get the persona
        let persona = this.bossPersonas[npcType] || this.merchantPersonas[npcType];

        if (!persona) {
            persona = this.merchantPersonas.friendly;
        }

        // Build system prompt with command instructions
        let systemPrompt = persona.systemPrompt;

        // Add context
        if (options.customContext) {
            systemPrompt += `\n\n${options.customContext}`;
        }

        // Add command instructions for relevant NPCs
        const commandTypes = options.allowedCommands || ['give_item', 'take_item', 'give_gold', 'take_gold', 'rep_up', 'rep_down'];
        systemPrompt += this.getCommandInstructions(commandTypes);

        // Add player context if available
        if (options.playerInventory) {
            systemPrompt += `\n\nPLAYER INVENTORY: ${JSON.stringify(options.playerInventory)}`;
        }
        if (options.playerGold !== undefined) {
            systemPrompt += `\nPLAYER GOLD: ${options.playerGold}`;
        }

        systemPrompt += `\n\nIMPORTANT: Respond in first person AS the character. Use commands appropriately based on the interaction. Keep response to 1-3 sentences plus any necessary commands.`;

        try {
            const response = await this.callTextAPI(systemPrompt, options.playerMessage || 'Hello');
            const processed = await this.processDialogueWithCommands(response, options.npcData || {});

            return {
                text: processed.spokenText,
                voice: options.voice || persona.voice || 'nova',
                commands: processed.commands,
                npcType: npcType
            };
        } catch (error) {
            // interactive dialogue failed - use fallback gracefully
            return {
                text: this.getMerchantFallback(npcType),
                voice: options.voice || persona.voice || 'nova',
                commands: [],
                npcType: npcType,
                fallback: true
            };
        }
    }
};

// Make globally available
window.NPCDialogueSystem = NPCDialogueSystem;

console.log('🎭 NPCDialogueSystem ready - bosses and merchants now have unified voices with command support');
