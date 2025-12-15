# ROADMAP.md - Medieval Trading Game Development Path

---

> **Unity AI Lab** | Hackall360, Sponge, GFourteen
> *Where we've been, where we're going*

---

## VERSION HISTORY

| Version | Status | Focus |
|---------|--------|-------|
| v0.80.00 | Released | Core trading, travel, basic combat |
| v0.85.00 | Released | Property system, employees, quests |
| v0.90.00 | Released | Doom world, enhanced NPC dialogue |
| **v0.91.10** | **CURRENT** | Config centralization, NPC death, stability |
| v0.95.00 | Planned | Combat expansion, new content |
| v1.0.00 | Planned | Full release, polish, balance |

---

## CURRENT: v0.91.10 (Stability Release)

**Theme:** "Config Consolidation & Death Systems"

### Completed Features:
- Centralized GameConfig.js (all settings in one place)
- NPC death and 24-hour respawn system
- Trade lock when NPC is dead
- Player death in combat (can actually die now)
- Bootstrap system refactor (cleaner init)
- Loading screen improvements
- Debooger command system overhaul
- API command system for NPC actions
- Gatehouse zone progression
- Global leaderboard via JSONBin

### Known Issues:
- None critical (stability release achieved)

---

## PHASE 1: v0.95.00 (Content & Combat)

**Target Theme:** "Expanded Gameplay"

### Planned Features:

#### Combat Enhancement
- Party combat system (fight alongside companions)
- Weapon durability and repair
- Combat abilities tied to skills
- Boss special phases and mechanics

#### New Content
- 2-3 additional cities/locations
- Sea travel routes
- More quest content (main + side)
- New item categories

#### Trading Depth
- Rare item spawning rules
- Black market/smuggling intro
- Enhanced price history graphs

### Success Criteria:
- [ ] Party combat functional
- [ ] At least 2 new locations
- [ ] Weapon durability implemented
- [ ] 5+ new quests

---

## PHASE 2: v1.0.00 (Full Release)

**Target Theme:** "Polish & Balance"

### Planned Features:

#### Polish
- Full accessibility pass
- Mobile/responsive improvements
- Performance optimization
- All tooltips and help text

#### Balance
- Complete economy rebalance
- Combat difficulty tuning
- Progression curve smoothing
- Quest reward balancing

#### Content Completion
- Full main quest line
- All planned locations
- Achievement completion
- Doom world expansion

### Success Criteria:
- [ ] No P0/P1 bugs
- [ ] All systems documented
- [ ] Playthrough tested end-to-end
- [ ] Community feedback incorporated

---

## FUTURE PHASES (Post 1.0)

### v1.1.00 - Community Features
- Global chat integration
- Player trading (async)
- Leaderboard seasons
- Achievement sharing

### v1.2.00 - Modding Foundation
- JSON schema for items
- Custom NPC templates
- Location definition format
- Mod loading system

### v2.0.00 - Multiplayer (Maybe)
- Real-time market sync
- Competitive seasons
- Co-op dungeons
- PvP trading

---

## DEVELOPMENT PRINCIPLES

### Code Quality
- No frameworks, vanilla JS
- Event-driven architecture
- Single source of truth (GameConfig)
- Test before push

### Game Design
- Depth over breadth
- Meaningful choices
- Risk/reward balance
- Respect player time

### Release Philosophy
- Stable before feature-rich
- Fix bugs before adding features
- Document as you go
- Listen to feedback

---

## MILESTONE TARGETS

| Milestone | Target | Description |
|-----------|--------|-------------|
| Stability | v0.91.10 | No game-breaking bugs |
| Content | v0.95.00 | Rich gameplay variety |
| Release | v1.0.00 | Full game experience |
| Community | v1.1.00 | Social features |
| Expansion | v2.0.00 | Major new systems |

---

## METRICS TO TRACK

- **Playtime:** Average session length
- **Progression:** % reaching each zone
- **Economy:** Gold inflation/deflation
- **Engagement:** Return rate
- **Performance:** Load time, FPS

---

## TEAM FOCUS AREAS

| Team Member | Current Focus | Next Focus |
|-------------|---------------|------------|
| Hackall360 | Core systems | Combat expansion |
| Sponge | NPC/Dialogue | Quest content |
| GFourteen | UI/UX | Performance |

---

## RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API rate limits | Medium | High | Caching, fallbacks |
| Browser compat | Low | Medium | Safari fixes done |
| Save corruption | Low | High | Multiple save slots |
| Economy break | Medium | Medium | Config tuning |

---

## DECISION LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12 | No npm/build tools | Keep deployment simple |
| 2025-12 | Ollama local LLM | No cloud, no rate limits, runs offline |
| 2025-12 | JSONBin for leaderboard | Free, easy, no backend needed |
| 2025-12 | Vanilla JS only | Reduce complexity, improve learning |

---

*Unity AI Lab - The road is long but we're fucking committed.* 🖤
