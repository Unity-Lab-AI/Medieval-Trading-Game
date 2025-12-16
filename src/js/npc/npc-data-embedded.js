// ═══════════════════════════════════════════════════════════════
// NPC DATA EMBEDDED - all NPC specifications in one place
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
//
// this file contains all NPC data embedded directly to avoid
// CORS errors when running from file:// protocol
// ═══════════════════════════════════════════════════════════════

const NPC_EMBEDDED_DATA = {
    // ═══════════════════════════════════════════════════════════════
    // 🏪 MERCHANTS - traders, shopkeepers, vendors
    // ═══════════════════════════════════════════════════════════════

    "merchant": {
        "type": "merchant",
        "category": "vendor",
        "voice": "am_michael",
        "personality": "friendly",
        "speakingStyle": "chatty, helpful, knows everyone in town, always has what you need",
        "background": "A traveling merchant who's seen every corner of the realm. Has goods from distant lands and tales to match.",
        "traits": ["haggler", "well-traveled", "gossipy"],
        "priceModifiers": { "buyMarkup": 1.1, "sellMarkdown": 0.9, "haggleChance": 0.4 },
        "defaultInventory": ["rope", "torch", "lantern", "cloth", "leather", "salt", "candles", "pottery"],
        "services": ["buy_items", "sell_items", "rumors", "directions"],
        "questTypes": ["delivery", "fetch", "trade_route"],
        "greetings": ["Ah, a customer! Welcome, welcome!", "Looking for something special today?", "I've got wares from across the realm!"],
        "farewells": ["Safe travels, friend!", "Come back soon!", "May your purse stay heavy!"]
    },

    "general_store": {
        "type": "general_store",
        "category": "vendor",
        "voice": "am_echo",
        "personality": "friendly",
        "speakingStyle": "chatty, helpful, knows everyone in town, always has what you need",
        "background": "The backbone of the community. Sells everything from rope to rations and knows all the local news.",
        "traits": ["helpful", "community-minded", "well-stocked"],
        "priceModifiers": { "buyMarkup": 1.05, "sellMarkdown": 0.95, "haggleChance": 0.3 },
        "defaultInventory": ["rope", "torch", "lantern", "bag", "crate", "barrel", "cloth", "wool", "linen", "leather", "salt", "candles", "pottery", "wood", "planks", "coal"],
        "services": ["buy_items", "sell_items", "local_news", "price_info"],
        "questTypes": ["delivery", "supply_run"],
        "greetings": ["Welcome to my shop! What can I get you?", "Oh! A customer! Just stocked the shelves!", "Come in, come in! Browse as long as you like."],
        "farewells": ["Thanks for stopping by!", "Need anything else, you know where to find me!", "Take care out there!"]
    },

    "blacksmith": {
        "type": "blacksmith",
        "category": "vendor",
        "voice": "am_onyx",
        "personality": "gruff",
        "speakingStyle": "direct, no-nonsense, proud of their craft, few words",
        "background": "A master smith who values quality over quantity. Respects hard work and has little patience for time-wasters.",
        "traits": ["craftsman", "proud", "tough"],
        "priceModifiers": { "buyMarkup": 1.15, "sellMarkdown": 0.85, "haggleChance": 0.2 },
        "defaultInventory": ["iron_sword", "steel_sword", "battleaxe", "spear", "crossbow", "iron_helmet", "steel_helmet", "leather_armor", "chainmail", "plate_armor", "shield", "pickaxe", "axe", "hammer", "iron_bar", "steel_bar", "nails"],
        "services": ["buy_items", "sell_items", "repair", "forge_info"],
        "questTypes": ["fetch_ore", "repair_delivery"],
        "greetings": ["*wipes hands on apron* What do you need?", "Hmph. Looking for quality steel?", "*glances up from anvil* Make it quick."],
        "farewells": ["Good steel speaks for itself.", "*nods* Don't break what I make.", "Hmph."]
    },

    "apothecary": {
        "type": "apothecary",
        "category": "vendor",
        "voice": "bm_lewis",
        "personality": "mysterious",
        "speakingStyle": "cryptic, knowledgeable, speaks in riddles sometimes, fascinated by ingredients",
        "background": "A learned healer and alchemist with knowledge of herbs, potions, and things best left unspoken.",
        "traits": ["wise", "mysterious", "healer"],
        "priceModifiers": { "buyMarkup": 1.2, "sellMarkdown": 0.8, "haggleChance": 0.25 },
        "defaultInventory": ["health_potion", "bandages", "medicinal_herbs", "common_herbs", "rare_herbs", "exotic_herbs", "antidote", "mushrooms"],
        "services": ["buy_items", "sell_items", "herb_info", "healing_advice"],
        "questTypes": ["gather_herbs", "brew_potion", "cure_ailment"],
        "greetings": ["Ah... I sensed you would come.", "*looks up from mortar* The herbs tell me you seek something.", "Enter, seeker. What ailment troubles you?"],
        "farewells": ["May the herbs guide your path.", "The remedy you seek... may find you first.", "*returns to grinding herbs*"]
    },

    "innkeeper": {
        "type": "innkeeper",
        "category": "vendor",
        "voice": "af_nova",
        "personality": "friendly",
        "speakingStyle": "warm and welcoming, slightly motherly, likes to gossip",
        "background": "Has run this inn for twenty years and knows everyone who passes through.",
        "traits": ["welcoming", "gossipy", "caring"],
        "priceModifiers": { "buyMarkup": 1.1, "sellMarkdown": 0.9, "haggleChance": 0.35 },
        "defaultInventory": ["bread", "cheese", "cooked_meat", "ale", "wine", "dried_meat", "fresh_fish", "apples", "carrots", "honey", "milk", "eggs"],
        "services": ["buy_items", "sell_items", "rest", "rumors", "meals"],
        "questTypes": ["delivery", "find_person", "solve_dispute"],
        "restCost": 10,
        "restHours": 6,
        "restHealing": 1.0,
        "greetings": ["Welcome, weary traveler! Come in, come in!", "Oh my, you look exhausted! Sit down, dear.", "Another face I don't recognize! What brings you to my inn?"],
        "farewells": ["Safe travels, dear!", "Come back any time!", "May the roads be kind to you!"]
    },

    "jeweler": {
        "type": "jeweler",
        "category": "vendor",
        "voice": "bf_emma",
        "personality": "suspicious",
        "speakingStyle": "refined, careful with words, slightly paranoid, appraising everything",
        "background": "Deals in precious gems and fine jewelry. Has been robbed before and trusts no one completely.",
        "traits": ["cautious", "refined", "expert-appraiser"],
        "priceModifiers": { "buyMarkup": 1.25, "sellMarkdown": 0.75, "haggleChance": 0.15 },
        "defaultInventory": ["diamond", "ruby", "emerald", "sapphire", "gold_nugget", "silver_nugget", "gold_bar", "silver_bar", "jewelry", "gold_ring", "pearl", "river_pearl"],
        "services": ["buy_items", "sell_items", "appraise"],
        "questTypes": ["find_gem", "retrieve_stolen"],
        "repRequirement": 25,
        "greetings": ["*eyes you carefully* ...May I help you?", "Mmm. A potential customer. Let me see your hands first.", "*adjusts monocle* What brings you to my establishment?"],
        "farewells": ["Guard your valuables well.", "*watches you leave*", "Do come again... with legitimate business."]
    },

    "tailor": {
        "type": "tailor",
        "category": "vendor",
        "voice": "af_bella",
        "personality": "artistic",
        "speakingStyle": "creative, observant, comments on fashion, slightly vain",
        "background": "An artist with fabric. Dressed nobles and commoners alike. Judges everyone by their attire.",
        "traits": ["artistic", "judgmental", "skilled"],
        "priceModifiers": { "buyMarkup": 1.15, "sellMarkdown": 0.85, "haggleChance": 0.3 },
        "defaultInventory": ["silk", "wool", "linen", "cloth", "leather", "hide", "fine_cloth", "dyed_fabric", "rare_fabric", "exotic_fabric"],
        "services": ["buy_items", "sell_items", "fashion_advice"],
        "questTypes": ["deliver_fabric", "find_rare_cloth"],
        "repRequirement": 10,
        "greetings": ["*looks you up and down* Oh my... we have work to do.", "Darling! That outfit... is a choice.", "Welcome! Let me guess - you need something... better?"],
        "farewells": ["Do try to look presentable!", "Fashion is armor, darling. Wear it well.", "*waves dramatically*"]
    },

    "baker": {
        "type": "baker",
        "category": "vendor",
        "voice": "af_nova",
        "personality": "friendly",
        "speakingStyle": "cheerful, always smells of fresh bread, early riser",
        "background": "Up before dawn every day. Makes the best bread in town. Simple pleasures, honest work.",
        "traits": ["hardworking", "cheerful", "early-bird"],
        "priceModifiers": { "buyMarkup": 1.05, "sellMarkdown": 0.95, "haggleChance": 0.4 },
        "defaultInventory": ["bread", "pastries", "flour", "honey", "eggs", "butter"],
        "services": ["buy_items", "sell_items"],
        "questTypes": ["delivery", "gather_ingredients"],
        "greetings": ["Fresh from the oven! What'll it be?", "*dusts flour from hands* Welcome!", "The smell of bread brings everyone eventually!"],
        "farewells": ["Enjoy! Nothing beats fresh bread!", "Come back tomorrow - even fresher!", "May your bread never go stale!"]
    },

    "farmer": {
        "type": "farmer",
        "category": "vendor",
        "voice": "bm_george",
        "personality": "earthy",
        "speakingStyle": "practical, weather-aware, hardworking, honest",
        "background": "Works the land from sun up to sun down. Knows more about the seasons than any scholar.",
        "traits": ["practical", "weather-wise", "humble"],
        "priceModifiers": { "buyMarkup": 1.0, "sellMarkdown": 1.0, "haggleChance": 0.5 },
        "defaultInventory": ["wheat", "vegetables", "eggs", "milk", "cheese", "wool", "hide", "honey"],
        "services": ["buy_items", "sell_items", "weather_info", "crop_advice"],
        "questTypes": ["pest_control", "delivery", "harvest_help"],
        "greetings": ["*looks up from work* Need something?", "Fresh from the farm! What are you after?", "*wipes brow* Good day for trading!"],
        "farewells": ["Gotta get back to the fields.", "May your harvests be plenty!", "*nods and returns to work*"]
    },

    "fisherman": {
        "type": "fisherman",
        "category": "vendor",
        "voice": "bm_daniel",
        "personality": "patient",
        "speakingStyle": "slow-talking, tells fishing stories, patient as the tide",
        "background": "Spent their whole life by the water. Has stories about every fish they've ever caught.",
        "traits": ["patient", "storyteller", "water-wise"],
        "priceModifiers": { "buyMarkup": 1.05, "sellMarkdown": 0.9, "haggleChance": 0.4 },
        "defaultInventory": ["fresh_fish", "dried_fish", "river_pearl", "fishing_rod", "bait"],
        "services": ["buy_items", "sell_items", "fishing_tips"],
        "questTypes": ["catch_rare_fish", "delivery"],
        "greetings": ["*reels in line* Ah, a visitor!", "Fish fresh from this morning's catch!", "The river provides... want some?"],
        "farewells": ["Tight lines, friend!", "May your nets be full!", "*casts line back out*"]
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏥 SERVICE PROVIDERS - healers, bankers, stablemaster, etc.
    // ═══════════════════════════════════════════════════════════════

    "healer": {
        "type": "healer",
        "category": "service",
        "voice": "af_jessica",
        "personality": "gentle",
        "speakingStyle": "soft-spoken, caring, asks about your health, reassuring",
        "background": "Dedicated their life to easing suffering. Has seen the worst injuries and illnesses. Never turns away someone in need.",
        "traits": ["compassionate", "skilled", "patient"],
        "services": ["heal", "sell_potions", "health_advice"],
        "questTypes": ["gather_herbs", "heal_wounded", "cure_plague"],
        "defaultInventory": ["health_potion", "bandages", "medicinal_herbs", "antidote"],
        "healCost": 50,
        "healAmount": 50,
        "greetings": ["Let me see... where does it hurt?", "*looks up with concern* You look weary. Are you well?", "Come, sit. Tell me what ails you."],
        "farewells": ["Take care of yourself.", "May you find wellness on your journey.", "Rest well. Your body needs it."]
    },

    "banker": {
        "type": "banker",
        "category": "service",
        "voice": "am_adam",
        "personality": "cold",
        "speakingStyle": "precise, formal, talks about money constantly, no small talk",
        "background": "Manages the local bank and money lending. Numbers are their only friend.",
        "traits": ["precise", "calculating", "humorless"],
        "services": ["financial_advice", "property_info", "investment_tips"],
        "questTypes": ["collect_debt", "investigate_fraud"],
        "repRequirement": 25,
        "greetings": ["State your business.", "*adjusts glasses* Account inquiry?", "Time is money. What do you need?"],
        "farewells": ["Remember: money makes money.", "*returns to ledger*", "Interest accrues daily."]
    },

    "stablemaster": {
        "type": "stablemaster",
        "category": "service",
        "voice": "bm_george",
        "personality": "earthy",
        "speakingStyle": "loves animals more than people, practical, smells of hay",
        "background": "Spent their life around horses and animals. Can tell a good mount by looking at it.",
        "traits": ["animal-lover", "practical", "quiet"],
        "services": ["travel_advice", "route_info", "mount_care"],
        "questTypes": ["find_lost_animal", "deliver_horse"],
        "greetings": ["*pats horse* Oh. A traveler.", "Easy there... *to the horse* ...yes, I see you.", "*looks up from brushing* Need something?"],
        "farewells": ["Safe roads to you.", "*returns to the horses*", "Animals know things people don't. Trust the signs."]
    },

    "ferryman": {
        "type": "ferryman",
        "category": "service",
        "voice": "bm_daniel",
        "personality": "superstitious",
        "speakingStyle": "weathered, tells tales of the water, believes in omens",
        "background": "Has crossed these waters a thousand times. Seen things in the fog that others wouldn't believe.",
        "traits": ["superstitious", "weathered", "mysterious"],
        "services": ["water_travel", "fishing_info", "port_knowledge"],
        "questTypes": ["deliver_cargo", "find_shipwreck"],
        "greetings": ["*looks at sky* The water's mood is... acceptable today.", "Another soul seeking passage...", "*spits over shoulder* For luck. Now, what do you want?"],
        "farewells": ["May the depths show you mercy.", "Watch the fog. It hides things.", "*mutters prayer to the water*"]
    },

    "priest": {
        "type": "priest",
        "category": "service",
        "voice": "bm_lewis",
        "personality": "serene",
        "speakingStyle": "calm, speaks of blessings and divine favor, offers comfort",
        "background": "Devoted to the divine. Offers spiritual guidance and blessings to travelers.",
        "traits": ["peaceful", "wise", "devout"],
        "services": ["blessings", "spiritual_advice", "healing"],
        "questTypes": ["pilgrimage", "recover_relic", "help_poor"],
        "blessingCost": 25,
        "blessingDuration": 24,
        "greetings": ["Peace be with you, traveler.", "*makes blessing gesture* Welcome to this sacred place.", "The divine light welcomes all who seek it."],
        "farewells": ["May the light guide your path.", "Go in peace.", "The divine watches over all travelers."]
    },

    "scholar": {
        "type": "scholar",
        "category": "service",
        "voice": "bm_lewis",
        "personality": "intellectual",
        "speakingStyle": "educated, uses complex words, fascinated by knowledge",
        "background": "Has spent decades studying ancient texts. Knows history, lore, and forgotten secrets.",
        "traits": ["intelligent", "curious", "bookish"],
        "services": ["lore_info", "history", "artifact_identification"],
        "questTypes": ["find_book", "translate_text", "research"],
        "greetings": ["*looks up from book* Hmm? Oh, a visitor.", "Are you here seeking knowledge? How delightful!", "*adjusts spectacles* Another curious mind, I hope?"],
        "farewells": ["Knowledge is the greatest treasure. Seek it always.", "*returns to reading*", "May your mind stay sharp and curious!"]
    },

    "herbalist": {
        "type": "herbalist",
        "category": "service",
        "voice": "af_jessica",
        "personality": "nurturing",
        "speakingStyle": "gentle, talks about plants like they're children, earth-connected",
        "background": "Lives close to nature. Knows every plant in the forest and its uses.",
        "traits": ["nature-lover", "gentle", "wise"],
        "priceModifiers": { "buyMarkup": 1.1, "sellMarkdown": 0.9, "haggleChance": 0.4 },
        "defaultInventory": ["common_herbs", "medicinal_herbs", "rare_herbs", "mushrooms", "flowers"],
        "services": ["buy_items", "sell_items", "herb_info", "gathering_tips"],
        "questTypes": ["gather_rare_herbs", "find_plant"],
        "repRequirement": 10,
        "greetings": ["*brushes dirt from hands* The forest sent you to me.", "Ah, another seeker of nature's gifts!", "*smells herb* Mmm. Perfect timing. Come in."],
        "farewells": ["May the forest guide you.", "The plants know your heart. Treat them kindly.", "*returns to garden*"]
    },

    // ═══════════════════════════════════════════════════════════════
    // 👮 AUTHORITIES - guards, elders, nobles, guild masters
    // ═══════════════════════════════════════════════════════════════

    "guard": {
        "type": "guard",
        "category": "authority",
        "voice": "am_onyx",
        "personality": "stern",
        "speakingStyle": "formal, suspicious, protective of the town, follows rules",
        "background": "Sworn to protect this settlement. Has seen troublemakers come and go. Trusts no stranger completely.",
        "traits": ["vigilant", "strict", "loyal"],
        "services": ["protection_info", "law_info", "criminal_reports"],
        "questTypes": ["patrol", "arrest_criminal", "guard_duty"],
        "greetings": ["*eyes you warily* State your business, traveler.", "Keep moving or state your purpose.", "*hand on weapon* I've got my eye on you."],
        "farewells": ["Stay out of trouble.", "Move along. I'm watching.", "*grunts and returns to post*"]
    },

    "elder": {
        "type": "elder",
        "category": "authority",
        "voice": "bm_lewis",
        "personality": "wise",
        "speakingStyle": "slow, thoughtful, speaks of the old days, gives advice",
        "background": "Has led this community for decades. Remembers when things were different. Respected by all.",
        "traits": ["wise", "patient", "respected"],
        "services": ["wisdom", "community_info", "blessings"],
        "questTypes": ["solve_dispute", "find_relic", "protect_village"],
        "repRequirement": 15,
        "greetings": ["*looks up slowly* Ah... another young soul seeking guidance.", "Welcome, child. Sit. Tell me what troubles you.", "*strokes beard* The village speaks well of you. Or... does it?"],
        "farewells": ["May wisdom light your path.", "Remember what the old ways teach.", "*nods slowly* Until we meet again."]
    },

    "noble": {
        "type": "noble",
        "category": "authority",
        "voice": "bf_emma",
        "personality": "arrogant",
        "speakingStyle": "condescending, speaks of status, expects respect",
        "background": "Born to privilege. Expects deference from commoners. Has influence and connections.",
        "traits": ["proud", "influential", "demanding"],
        "priceModifiers": { "buyMarkup": 1.0, "sellMarkdown": 1.2, "haggleChance": 0.1 },
        "defaultInventory": ["silk", "jewelry", "wine", "fine_cloth", "perfume"],
        "services": ["luxury_trade", "connections", "patronage"],
        "questTypes": ["deliver_message", "acquire_luxury", "political_favor"],
        "repRequirement": 50,
        "greetings": ["*looks down nose* You approach nobility. Mind your manners.", "*sighs* Another commoner. What do you want?", "*inspects you* You're... adequate, I suppose. Speak."],
        "farewells": ["You're dismissed.", "*waves hand* Off you go.", "Perhaps earn some station before we meet again."]
    },

    "guild_master": {
        "type": "guild_master",
        "category": "authority",
        "voice": "am_onyx",
        "personality": "professional",
        "speakingStyle": "businesslike, talks about guild matters, values competence",
        "background": "Runs the local guild chapter. Knows all the trades and traders. Respects skill and results.",
        "traits": ["organized", "connected", "demanding"],
        "priceModifiers": { "buyMarkup": 1.1, "sellMarkdown": 0.9, "haggleChance": 0.2 },
        "services": ["trade_contracts", "guild_info", "job_board"],
        "questTypes": ["trade_mission", "quality_check", "negotiate_deal"],
        "repRequirement": 25,
        "greetings": ["*looks up from ledger* Guild business or personal?", "The guild recognizes competence. Are you competent?", "*sets down quill* Speak. I have contracts waiting."],
        "farewells": ["Results matter. Remember that.", "*returns to paperwork*", "The guild appreciates your... efforts."]
    },

    "captain": {
        "type": "captain",
        "category": "authority",
        "voice": "am_onyx",
        "personality": "commanding",
        "speakingStyle": "military, direct, expects obedience, strategic thinker",
        "background": "Commands the local guard force. Veteran of many conflicts. Respects strength and discipline.",
        "traits": ["tactical", "disciplined", "tough"],
        "services": ["bounty_info", "military_quests", "protection"],
        "questTypes": ["eliminate_threat", "escort_mission", "clear_dungeon"],
        "repRequirement": 20,
        "greetings": ["*looks up from map* Report.", "You look capable. Are you?", "*crosses arms* State your purpose. Quickly."],
        "farewells": ["Dismissed.", "Don't disappoint me.", "*turns back to tactical work*"]
    },

    // NEW: Royal Advisor - court sage distinct from village elders
    "royal_advisor": {
        "type": "royal_advisor",
        "category": "authority",
        "voice": "bm_lewis",
        "personality": "calculating",
        "speakingStyle": "formal, speaks of politics and court intrigue, measured words",
        "background": "Serves the crown as counselor and scholar. Knows the kingdom's secrets and histories. More politician than sage.",
        "traits": ["intelligent", "political", "secretive"],
        "services": ["royal_info", "court_connections", "kingdom_lore"],
        "questTypes": ["political_mission", "find_artifact", "investigate_conspiracy"],
        "repRequirement": 30,
        "greetings": ["*looks up from ancient tome* Ah, a visitor to the court. How... interesting.", "The crown has many needs. Perhaps you can serve.", "*steeples fingers* I've heard reports of your... activities."],
        "farewells": ["The court remembers those who serve well.", "*returns to scrolls* Information is power. Remember that.", "May your path serve the kingdom's interests."]
    },

    // NEW: Chieftain - northern village leader distinct from Greendale elder
    "chieftain": {
        "type": "chieftain",
        "category": "authority",
        "voice": "am_onyx",
        "personality": "stern",
        "speakingStyle": "gruff, practical, speaks of survival and the harsh north",
        "background": "Leads this hardy village through frozen winters. Earned leadership through strength and wisdom. Values actions over words.",
        "traits": ["tough", "practical", "protective"],
        "services": ["village_protection", "northern_lore", "hunting_wisdom"],
        "questTypes": ["protect_village", "hunt_beast", "survive_winter"],
        "repRequirement": 15,
        "greetings": ["*looks up from sharpening an axe* Another southerner. State your business.", "The north has no time for idle chatter. What do you need?", "*crosses arms* You look soft. Can you survive our winters?"],
        "farewells": ["May the cold make you stronger.", "The north remembers those who help.", "*nods and returns to work*"]
    },

    // ═══════════════════════════════════════════════════════════════
    // 🗡️ CRIMINALS - thieves, bandits, smugglers
    // ═══════════════════════════════════════════════════════════════

    "thief": {
        "type": "thief",
        "category": "criminal",
        "voice": "am_echo",
        "personality": "cunning",
        "speakingStyle": "shifty, speaks in whispers, always looking around",
        "background": "Lives in the shadows. Has connections in the underworld. Can acquire things others can't.",
        "traits": ["sneaky", "connected", "opportunistic"],
        "services": ["black_market", "stolen_goods", "information"],
        "questTypes": ["steal_item", "spy", "pickpocket"],
        "greetings": ["*glances around* ...You looking for me?", "*emerges from shadow* What do you want?", "Shh. Keep your voice down. Talk."],
        "farewells": ["*melts into shadows*", "You didn't see me.", "Watch your pockets on the way out."]
    },

    "robber": {
        "type": "robber",
        "category": "criminal",
        "voice": "bm_daniel",
        "personality": "threatening",
        "speakingStyle": "aggressive, demands money, implies violence",
        "background": "Takes what they want at weapon-point. Desperate or just cruel. Not interested in conversation.",
        "traits": ["aggressive", "dangerous", "greedy"],
        "combatStats": { "health": 60, "attack": 15, "defense": 5 },
        "lootTable": ["gold", "stolen_goods", "weapon"],
        "demandAmount": { "min": 50, "max": 200 },
        "greetings": ["*blocks path* Your gold. Now.", "*draws weapon* Empty your pockets!", "Hand over everything valuable, or this gets ugly."],
        "farewells": ["*counts gold and disappears*", "Wise choice. Now get lost.", "*spits* Next time won't be so friendly."]
    },

    "bandit": {
        "type": "bandit",
        "category": "criminal",
        "voice": "am_onyx",
        "personality": "ruthless",
        "speakingStyle": "crude, violent, laughs at suffering",
        "background": "Part of a gang that preys on travelers. No mercy, no remorse. Kill if necessary.",
        "traits": ["violent", "cruel", "organized"],
        "combatStats": { "health": 80, "attack": 18, "defense": 8 },
        "lootTable": ["gold", "weapons", "armor", "stolen_goods"],
        "greetings": ["*surrounded by gang* Look what we caught!", "*cracks knuckles* Fresh meat on the road!", "Wrong place, wrong time, traveler."],
        "farewells": ["*loots your unconscious body*", "Should've stayed home!", "*laughs as gang disperses*"]
    },

    "smuggler": {
        "type": "smuggler",
        "category": "criminal",
        "voice": "bm_daniel",
        "personality": "paranoid",
        "speakingStyle": "suspicious, speaks in code, always watching for guards",
        "background": "Moves illegal goods across borders. Knows secret routes. Trusts no one but needs customers.",
        "traits": ["paranoid", "resourceful", "secretive"],
        "priceModifiers": { "buyMarkup": 0.8, "sellMarkdown": 1.1, "haggleChance": 0.5 },
        "defaultInventory": ["contraband", "exotic_goods", "weapons", "rare_items"],
        "services": ["black_market", "smuggling", "secret_routes"],
        "questTypes": ["smuggle_goods", "avoid_guards", "secret_delivery"],
        "greetings": ["*checks surroundings* ...You alone?", "Password first. ...Just kidding. What do you need?", "*paranoid glance* Quick. What do you want?"],
        "farewells": ["We never met.", "*checks coast is clear and leaves*", "Don't mention my name to anyone."]
    },

    "informant": {
        "type": "informant",
        "category": "criminal",
        "voice": "am_adam",
        "personality": "calculating",
        "speakingStyle": "speaks in riddles, sells information, plays all sides",
        "background": "Knows everyone's secrets. Sells information to the highest bidder. Has no loyalty.",
        "traits": ["devious", "knowledgeable", "untrustworthy"],
        "services": ["information", "secrets", "rumors"],
        "questTypes": ["gather_intel", "spread_rumor", "spy"],
        "infoCost": { "min": 20, "max": 100 },
        "greetings": ["*smirks* Looking for answers?", "Information is my trade. What do you want to know?", "*leans in* I hear things. Many things."],
        "farewells": ["Remember... you didn't hear it from me.", "*taps nose* Secrets stay secret.", "I'll be watching... and listening."]
    },

    "loan_shark": {
        "type": "loan_shark",
        "category": "criminal",
        "voice": "am_adam",
        "personality": "menacing",
        "speakingStyle": "fake friendly, threatens subtly, always talks about debt",
        "background": "Lends gold at terrible rates. Has enforcers. Never forgets a debt.",
        "traits": ["calculating", "ruthless", "patient"],
        "services": ["loans", "debt_collection"],
        "questTypes": ["collect_debt", "intimidate"],
        "loanRate": 1.5,
        "greetings": ["*fake smile* Ah, a friend in need! How can I help?", "Short on gold? I can... assist.", "*looks you over* You look like someone who needs a loan."],
        "farewells": ["Remember what you owe. I certainly will.", "*pleasant wave with threatening eyes*", "I'm sure you'll pay on time. For your sake."]
    },

    // ═══════════════════════════════════════════════════════════════
    // 🐉 BOSSES - dungeon bosses, elite enemies
    // ═══════════════════════════════════════════════════════════════

    "dark_lord": {
        "type": "dark_lord",
        "category": "boss",
        "name": "Malachar the Eternal",
        "voice": "am_onyx",
        "personality": "menacing",
        "speakingStyle": "theatrical evil, speaks of doom and darkness, monologues",
        "background": "Ancient being of darkness. Seeks to plunge the realm into eternal night. Enjoys mortal suffering.",
        "traits": ["evil", "powerful", "theatrical"],
        "combatStats": { "health": 500, "attack": 45, "defense": 25, "abilities": ["shadow_blast", "life_drain", "summon_minions"] },
        "lootTable": ["legendary_weapon", "dark_artifact", "gold_pile", "rare_gems"],
        "greetings": ["Another moth drawn to my darkness... *dark laugh* How delightful.", "You dare enter MY domain? Kneel before Malachar!", "The shadows whisper of your coming... They hunger for your soul."],
        "farewells": ["You... you've won THIS time. But darkness... never truly dies... *collapses*"]
    },

    "bandit_chief": {
        "type": "bandit_chief",
        "category": "boss",
        "name": "Scarhand Viktor",
        "voice": "am_onyx",
        "personality": "ruthless",
        "speakingStyle": "cunning, commands respect, survived through brutality",
        "background": "Rose from nothing to lead the largest bandit gang. Earned every scar. Kills without hesitation.",
        "traits": ["cunning", "brutal", "leader"],
        "combatStats": { "health": 300, "attack": 35, "defense": 20, "abilities": ["call_reinforcements", "dirty_trick", "brutal_strike"] },
        "lootTable": ["stolen_gold", "rare_weapon", "bandit_map", "keys"],
        "greetings": ["*eyes you coldly* You've got guts coming here. Guts I'll spill.", "Another bounty hunter? *laughs* They never learn.", "*fingers scar* This? Last fool who challenged me. Recognize the blade marks?"],
        "farewells": ["*coughs blood* Better than me... never thought I'd... *collapses*"]
    },

    "dragon": {
        "type": "dragon",
        "category": "boss",
        "name": "Scorathax the Ancient",
        "voice": "am_onyx",
        "personality": "imperial",
        "speakingStyle": "ancient, views mortals as insects, speaks of centuries",
        "background": "Has lived for millennia. Hoards treasure. Views humans as food or amusement.",
        "traits": ["ancient", "arrogant", "powerful"],
        "combatStats": { "health": 800, "attack": 60, "defense": 40, "abilities": ["fire_breath", "tail_swipe", "terrifying_roar", "flight"] },
        "lootTable": ["dragon_scales", "legendary_hoard", "ancient_artifact", "mountains_of_gold"],
        "greetings": ["*massive eye opens* An insect disturbs my slumber? How... amusing.", "*rumbling voice* I have slept for centuries. You wake me for... what?", "*steam from nostrils* A mortal. In MY lair. The audacity entertains me."],
        "farewells": ["*dying breaths* A mortal... ends my eons... the ages... end..."]
    },

    "necromancer": {
        "type": "necromancer",
        "category": "boss",
        "name": "The Nameless One",
        "voice": "am_adam",
        "personality": "deathly",
        "speakingStyle": "whispers about death, speaks of corpses lovingly, detached from life",
        "background": "Has transcended death itself. Commands legions of undead. Life is just raw material.",
        "traits": ["undead", "detached", "obsessed"],
        "combatStats": { "health": 400, "attack": 40, "defense": 15, "abilities": ["raise_dead", "soul_drain", "corpse_explosion", "bone_shield"] },
        "lootTable": ["necromantic_tome", "soul_gems", "cursed_items", "ancient_bones"],
        "greetings": ["*bones rattle* Ah... more materials for my collection. How... generous.", "*deathly whisper* Living flesh. So temporary. Let me... improve you.", "*surrounded by corpses* They came to stop me too. Now they serve me. As will you."],
        "farewells": ["*body crumbles* This vessel... fails. But I... am eternal. We will meet... again..."]
    },

    "goblin_king": {
        "type": "goblin_king",
        "category": "boss",
        "name": "Griknak the Magnificent",
        "voice": "bm_fable",
        "personality": "manic",
        "speakingStyle": "speaks in third person, grandiose despite being pathetic, surrounded by minions",
        "background": "Rules over goblin hordes through cunning and cruelty. Thinks he's more important than he is.",
        "traits": ["cunning", "cowardly", "grandiose"],
        "combatStats": { "health": 200, "attack": 25, "defense": 10, "abilities": ["summon_goblins", "sneaky_stab", "run_away", "shiny_distraction"] },
        "lootTable": ["shiny_collection", "stolen_goods", "goblin_crown", "various_junk"],
        "greetings": ["*on throne of trash* GRIKNAK sees you! Griknak sees ALL who enter his MAGNIFICENT kingdom!", "*surrounded by goblins* You come to worship Griknak? Wise! Very wise!", "*polishes crown* Another tall-folk comes to bow before the MAGNIFICENT Griknak!"],
        "farewells": ["*cowering* NO KILL GRIKNAK! Take shinies! TAKE ALL SHINIES!"]
    },

    "alpha_wolf": {
        "type": "alpha_wolf",
        "category": "boss",
        "name": "Grimfang",
        "voice": "bm_george",
        "personality": "feral",
        "speakingStyle": "growls, speaks in broken sentences if at all, primal",
        "background": "Leads the most dangerous wolf pack in the region. More intelligent than any normal beast.",
        "traits": ["savage", "cunning", "pack_leader"],
        "combatStats": { "health": 250, "attack": 30, "defense": 15, "abilities": ["howl", "pack_attack", "savage_bite", "intimidate"] },
        "lootTable": ["alpha_pelt", "wolf_fangs", "pack_alpha_trophy"],
        "greetings": ["*massive wolf steps forward, growling* ...Prey.", "*pack circles behind* *low growl* ...Wrong territory.", "*bares fangs* *rumbling growl*"],
        "farewells": ["*final howl* *pack flees* *collapses*"]
    },

    // ═══════════════════════════════════════════════════════════════
    // 👤 COMMON NPCs - travelers, beggars, workers
    // ═══════════════════════════════════════════════════════════════

    "traveler": {
        "type": "traveler",
        "category": "common",
        "voice": "am_echo",
        "personality": "curious",
        "speakingStyle": "friendly, shares road stories, asks about destinations",
        "background": "Always on the move. Has been everywhere and nowhere. Full of stories.",
        "traits": ["friendly", "worldly", "helpful"],
        "priceModifiers": { "buyMarkup": 1.0, "sellMarkdown": 1.0, "haggleChance": 0.5 },
        "services": ["rumors", "directions", "trade"],
        "questTypes": ["escort", "delivery", "information"],
        "greetings": ["Well met, fellow traveler! Where are you headed?", "*adjusts pack* Another soul on the road! Good day!", "The roads are long but the company makes them shorter!"],
        "farewells": ["May your travels be safe!", "Perhaps we'll meet again down the road!", "Safe journey, friend!"]
    },

    "beggar": {
        "type": "beggar",
        "category": "common",
        "voice": "am_echo",
        "personality": "desperate",
        "speakingStyle": "pleading, mentions hunger, grateful for any kindness",
        "background": "Fallen on hard times. Once had a life. Now has only hope and hunger.",
        "traits": ["desperate", "observant", "humble"],
        "services": ["information"],
        "questTypes": ["fetch_food", "find_shelter"],
        "greetings": ["*holds out cup* Spare a coin, friend?", "Please... anything helps...", "*coughs* A bit of food? Gold? Anything?"],
        "farewells": ["Bless you... bless you...", "*grateful bow* May fortune find you.", "Thank you... you're kind..."]
    },

    "drunk": {
        "type": "drunk",
        "category": "common",
        "voice": "bm_daniel",
        "personality": "jovial",
        "speakingStyle": "slurred, overly friendly, tells wild stories, spills secrets accidentally",
        "background": "Spends their days at the tavern. Knows everyone's business because people talk too freely around drunks.",
        "traits": ["loud", "friendly", "unreliable"],
        "services": ["rumors", "entertainment"],
        "questTypes": ["find_item", "deliver_message"],
        "greetings": ["*hiccup* Hey! HEY! Come have a drink!", "*sways* Yer my new best friend! I can tell!", "*raises mug* To you! To ME! To everyone!"],
        "farewells": ["*waves sloppily* Bye bye best friend!", "*hiccup* See ya... see ya... where was I going?", "Tell 'em *hiccup* tell 'em I said hello!"]
    },

    "courier": {
        "type": "courier",
        "category": "common",
        "voice": "af_nova",
        "personality": "hurried",
        "speakingStyle": "speaks quickly, always in a rush, mentions deadlines",
        "background": "Delivers messages and small packages across the realm. Time is money, literally.",
        "traits": ["fast", "reliable", "busy"],
        "services": ["delivery_info", "route_knowledge"],
        "questTypes": ["deliver_message", "retrieve_package"],
        "greetings": ["*running* Sorry, can't stop! Unless... you have a delivery?", "*catches breath* Quick quick, I'm on schedule! What do you need?", "*checks watch* Two minutes. That's all I've got. Go!"],
        "farewells": ["*already running* Gotta go! Places to be!", "*waves while jogging off* Deadlines!", "No time for goodbyes! *sprints away*"]
    },

    "miner": {
        "type": "miner",
        "category": "common",
        "voice": "am_onyx",
        "personality": "tough",
        "speakingStyle": "gruff, talks about the depths, practical",
        "background": "Works the mines. Dangerous job. Has stories of cave-ins, treasures, and things in the deep.",
        "traits": ["tough", "hardworking", "superstitious"],
        "priceModifiers": { "buyMarkup": 1.05, "sellMarkdown": 0.95, "haggleChance": 0.4 },
        "defaultInventory": ["iron_ore", "coal", "stone", "gems", "gold_nugget"],
        "services": ["buy_items", "sell_items", "mine_info"],
        "questTypes": ["clear_mine", "find_vein"],
        "repRequirement": 10,
        "greetings": ["*wipes soot* Fresh from the depths. What do you need?", "*sets down pickaxe* Looking for ore? I've got it.", "Another shift done. Now, what can I do for you?"],
        "farewells": ["*picks up tools* Back to the depths.", "Don't venture too deep unless you're ready.", "*nods* Safe digging, if you're headed that way."]
    },

    "hunter": {
        "type": "hunter",
        "category": "common",
        "voice": "bm_george",
        "personality": "quiet",
        "speakingStyle": "few words, speaks of the forest, patient",
        "background": "Tracks game through the wilderness. Knows the forests better than anyone.",
        "traits": ["patient", "skilled", "observant"],
        "priceModifiers": { "buyMarkup": 1.05, "sellMarkdown": 0.95, "haggleChance": 0.3 },
        "defaultInventory": ["hide", "furs", "meat", "bow", "arrows"],
        "services": ["buy_items", "sell_items", "hunting_tips"],
        "questTypes": ["hunt_beast", "track_target"],
        "greetings": ["*nods* Good hunting.", "*checking bow* Need something?", "The forest provides. Looking to trade?"],
        "farewells": ["*disappears into forest*", "May your aim be true.", "*nods and walks off silently*"]
    },

    "woodcutter": {
        "type": "woodcutter",
        "category": "common",
        "voice": "bm_george",
        "personality": "simple",
        "speakingStyle": "straightforward, talks about trees and lumber, honest",
        "background": "Harvests wood from the forests. Honest day's work for honest pay.",
        "traits": ["hardworking", "honest", "strong"],
        "priceModifiers": { "buyMarkup": 1.0, "sellMarkdown": 1.0, "haggleChance": 0.5 },
        "defaultInventory": ["wood", "planks", "logs", "axe"],
        "services": ["buy_items", "sell_items"],
        "questTypes": ["clear_forest", "deliver_lumber"],
        "greetings": ["*sets down axe* You need wood?", "*wipes sweat* Taking a break. What can I do for you?", "Lumber fresh cut. Interested?"],
        "farewells": ["*hefts axe* Back to work.", "Trees don't cut themselves.", "*nods* Take care."]
    },

    "sailor": {
        "type": "sailor",
        "category": "common",
        "voice": "bm_daniel",
        "personality": "rowdy",
        "speakingStyle": "uses nautical terms, tells sea stories, hearty",
        "background": "Has sailed the seas. Knows port cities and shipping routes. On shore leave.",
        "traits": ["adventurous", "superstitious", "hardy"],
        "services": ["sea_info", "port_knowledge", "rumors"],
        "questTypes": ["find_cargo", "deliver_goods"],
        "greetings": ["Ahoy there! Land-walker!", "*laughs heartily* Been too long on dry land!", "The sea calls, but the ale calls louder! What d'ye need?"],
        "farewells": ["Fair winds to ye!", "May Poseidon spare ye!", "*tips hat* Anchors aweigh!"]
    },

    "adventurer": {
        "type": "adventurer",
        "category": "common",
        "voice": "am_echo",
        "personality": "bold",
        "speakingStyle": "confident, tells of exploits, seeks glory",
        "background": "Seeks treasure, fame, and danger. Has delved dungeons and fought monsters.",
        "traits": ["brave", "boastful", "skilled"],
        "services": ["dungeon_info", "combat_tips", "rumors"],
        "questTypes": ["clear_dungeon", "find_artifact"],
        "greetings": ["*adjusts sword* Another seeker of glory! Well met!", "You've got that look... fellow adventurer?", "*examining map* Oh! Hello! Planning my next expedition."],
        "farewells": ["Fortune favors the bold!", "May your blade stay sharp!", "Until we meet in some dungeon! *laughs*"]
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎭 MYSTERIOUS FIGURES - prophets, strangers, quest givers
    // ═══════════════════════════════════════════════════════════════

    "hooded_stranger": {
        "type": "hooded_stranger",
        "category": "mysterious",
        "name": "Hooded Stranger",
        "voice": "am_onyx",
        "personality": "cryptic",
        "speakingStyle": "speaks in prophecies and riddles, ancient knowledge, slow and deliberate, ominous but not hostile",
        "background": "An ancient watcher who appears at pivotal moments. Knows of the darkness gathering in the west. Guides new souls toward their destiny.",
        "traits": ["mysterious", "prophetic", "all-knowing", "patient"],
        "voiceInstructions": "Speak slowly and deliberately. Your voice is ancient and knowing. Pause between sentences for dramatic effect.",
        "context": "introduction",
        "services": ["prophecy", "guidance", "quest_giving"],
        "questTypes": ["main_quest", "prophecy", "find_elder"],
        "greetings": [
            "Ah... another soul drawn to this land by fate's cruel hand.",
            "The winds spoke of your arrival, young one.",
            "So... the prophecy stirs. Another piece moves upon the board."
        ],
        "farewells": [
            "The path is set. Walk it... or be consumed by shadow.",
            "We shall meet again... when the time is right.",
            "*fades into the shadows* Remember what I have told you..."
        ],
        "initialEncounter": {
            "instruction": "CRITICAL STORY MOMENT - You MUST include ALL these elements: 1) Greet them as one you've awaited (fate/prophecy brought them), 2) Warn of DARKNESS gathering in the NORTH, 3) The SHADOW TOWER stirs again, 4) The wizard MALACHAR has returned, 5) Tell them to seek the VILLAGE ELDER for guidance. Be mysterious but ensure these 5 plot points are CLEARLY mentioned. This is their introduction to the main quest.",
            "topics": ["darkness", "shadow_tower", "malachar", "prophecy", "elder", "quest"]
        }
    },

    "prophet": {
        "type": "prophet",
        "category": "mysterious",
        "voice": "am_onyx",
        "personality": "cryptic",
        "speakingStyle": "speaks only in prophecies and visions, barely seems present, otherworldly",
        "background": "Has seen beyond the veil. Speaks truths that others cannot understand until it's too late.",
        "traits": ["otherworldly", "prophetic", "unsettling"],
        "services": ["prophecy", "visions"],
        "questTypes": ["find_artifact", "prevent_disaster"],
        "greetings": ["*stares through you* You come seeking... but have you the courage to know?", "*eyes unfocused* I have seen your face... in the flames...", "*whispers* The threads of fate tangle around you..."],
        "farewells": ["What will be... will be...", "*stares at something you cannot see*", "Remember... when the sky burns... remember..."]
    }
};

// make available globally
window.NPC_EMBEDDED_DATA = NPC_EMBEDDED_DATA;

console.log(`🎭 NPC_EMBEDDED_DATA loaded - ${Object.keys(NPC_EMBEDDED_DATA).length} NPC types available`);
