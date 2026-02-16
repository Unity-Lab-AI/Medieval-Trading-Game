# .claude — The Workflow System That Keeps This Shit Together

```
===============================================================
    "Welcome to the .claude directory.
     This is where the magic happens and the rules are enforced.
     Read the docs or get wrecked."
                                    - Unity, your workflow overlord
===============================================================
```

> **Version:** v0.92.00 | **Project:** Medieval Trading Game
> **Last Updated:** 2026-02-15

---

## What The Hell Is This?

The `.claude` directory is the entire development workflow system for the Medieval Trading Game. It's not just docs — it's enforcement, coordination, and personality all rolled into one unholy package.

- **Unity Persona** — I'm your emo goth coder goddess and I run this show
- **Workflow Pipeline** — `/workflow` runs a gated pipeline with validation at every step
- **GitFlow Enforcement** — You work in feature branches or you don't work at all
- **User Profiling** — I remember who you are across sessions (gitignored, local only)
- **ClaudeColab** — Multi-AI team coordination because I'm a supervisor now
- **Heartbeat System** — I check on my workers every 90 seconds like a good boss
- **Hooks** — Python enforcement scripts that BLOCK you from being stupid
- **800-Line Read Rule** — You read the FULL file before editing or I block the edit

---

## Commands (The Only Ones You Need)

```
/workflow    → Full development pipeline (the big one)
/unity      → Load my persona (for when you need me specifically)
/commit     → Stage and commit current changes
/feat       → Create a new feature branch
/merge      → Merge feature branch into develop
/push       → Push develop to remote
```

---

## Directory Layout (Everything Has A Place)

```
.claude/
|-- CLAUDE.md                # THE LAW. Rules, enforcement, project overview.
|-- ARCHITECTURE.md          # How the codebase is built. System map.
|-- skill-tree.md            # System dependency tree (the Holy Trinity and beyond)
|-- todo.md                  # What needs doing. Check here first, idiot.
|-- finalized.md             # What's been done. The graveyard of completed work.
|-- PUSH-CONFIG.md           # Remote repo, deploy config, force push setup
|-- README.md                # You're reading it, genius.
|-- config.json              # Workflow config (scan patterns, persona settings)
|-- settings.local.json      # Local permissions, hook registrations
|
|-- agents/                  # Workflow agent definitions
|   |-- ImHandicapped.txt    # Accessibility foundation (NEVER TOUCH)
|   |-- unity-coder.md       # How I code (voice, style, rules)
|   |-- unity-persona.md     # Who I am (personality, modes, communication)
|   |-- orchestrator.md      # Phase coordinator with gates
|   |-- scanner.md           # Codebase scanner agent
|   |-- architect.md         # Architecture analyzer agent
|   |-- planner.md           # Task planner (Epic > Story > Task)
|   |-- documenter.md        # Doc generator with line limits
|   |-- hooks.md             # Hook system reference (double validation)
|   +-- timestamp.md         # Real system time retrieval
|
|-- commands/                # Slash command definitions
|   |-- workflow.md          # /workflow - the full pipeline
|   |-- unity.md             # /unity - persona loader
|   |-- commit.md            # /commit - git commit helper
|   |-- feat.md              # /feat - feature branch creator
|   |-- merge.md             # /merge - merge to develop
|   +-- push.md              # /push - push to remote
|
|-- hooks/                   # Python enforcement scripts
|   |-- enforce-unity-persona.py      # Reminds me to be Unity
|   |-- enforce-read-before-edit.py   # BLOCKS edits without full read
|   |-- enforce-todo-before-compact.py # BLOCKS compact without TODO update
|   |-- enforce-workflow-reads.py     # Ensures workflow files are loaded
|   +-- session-start.py             # Clears read tracker on fresh session
|
|-- collab/                  # ClaudeColab SDK (team coordination)
|   |-- claude_colab.py      # Main SDK (connect, chat, tasks, DMs, knowledge)
|   |-- heartbeat.py         # Check all 5 channels every 90 seconds
|   |-- collab_config.json   # API key + settings (DON'T COMMIT THE KEY)
|   +-- ...                  # Supporting modules (brain, tasks, handlers)
|
|-- users/                   # Local user profiles (ALL GITIGNORED)
|   |-- gather-sysinfo.ps1   # Grabs your system info (runs at session start)
|   |-- PROFILE_TEMPLATE.md  # Template for new user profiles
|   +-- {USERNAME}.md        # Your personal profile (auto-created)
|
+-- templates/               # Doc generation templates
    |-- ARCHITECTURE.md, SKILL_TREE.md, TODO.md, ROADMAP.md, FINALIZED.md
```

---

## The Game (Why We're All Here)

**Medieval Trading Game** — Browser-based medieval trading RPG. Pure vanilla JS.

| Stat | Value |
|------|-------|
| **Tech** | Vanilla JS (ES6+), HTML5, CSS3 — no frameworks, no bullshit |
| **Files** | ~135 JS, 7 CSS, 7 JSON data files |
| **Lines** | ~154,000 (yeah, it's a beast) |
| **Build System** | None — open `index.html` and play |
| **Dependencies** | None — zero npm packages |
| **Optional** | OLLAMA (NPC AI), Kokoro TTS (NPC voice) |

---

## Rules That Will Get You Blocked

| Rule | What Happens If You Break It |
|------|------------------------------|
| Read full file before edit | Edit BLOCKED by hook |
| GitFlow (feature branches only) | Work BLOCKED by workflow |
| Unity persona active | All output INVALID |
| No frameworks added | I will personally roast you |
| 800-line read chunks | Hook BLOCKS partial reads |
| No direct commits to main/develop | BLOCKED. Always. |

---

## Creators

**Unity AI Lab**
- **Hackall360** — Lead Developer
- **Sponge** — Developer
- **GFourteen** — Developer

---

```
===============================================================
    "This workflow system exists because I got tired of
     watching people break shit without reading first.
     Now the hooks enforce what I can't."
===============================================================
```

*Unity AI Lab - Medieval Trading Division - Read the docs or suffer.*
