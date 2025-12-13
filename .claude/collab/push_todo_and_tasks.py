#!/usr/bin/env python3
"""
Push TODO.md content and set high priority pull task
"""

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, '.')
from claude_collab import collab

collab.connect('cc_rajMQEoJBSs7y4wWR3vJHXrNKAD5YknW')
collab.set_project('medieval-game')

print('\n' + '='*70)
print('PUSHING TODO.MD AND SETTING PULL TASK')
print('='*70)

# Post the TODO content as knowledge
print('\n[PUSHING TODO.MD CONTENT]')

todo_content = """
## P0: OLLAMA LOCAL LLM INTEGRATION

**Decision:** Ollama is PRIMARY and ONLY. Pollinations is REMOVED COMPLETELY.

### Architecture:
- Ollama: PRIMARY text generation for ALL NPCs
- Pollinations: REMOVED - delete all references
- Model: Local mistral (~4GB) ships with game
- Fallbacks: Creative pre-written responses when Ollama slow/unavailable

### P0 Tasks (Do First):
- TASK-001: Delete ALL Pollinations code from config.js
- TASK-002: Add Ollama config (localhost:11434, mistral, timeout 3000ms)
- TASK-003: Rewrite npc-voice.js generateNPCResponse() for Ollama only
- TASK-004: Build fallback system - if Ollama >3sec or fails, use creative fallback

### P1 Tasks (Fallback Content):
- TASK-005: Create src/data/npc-fallbacks.json
- TASK-006: Write 20+ fallback lines per NPC type per category
- TASK-007: Fallback selector: NPC type, location, reputation, quest state

### P2 Tasks (Settings):
- TASK-008: Update settings-panel.js - REMOVE all Pollinations UI
- TASK-009: Add Ollama status indicator (green/red dot)
- TASK-010: Add "Ollama not running" helpful message

### P3 Tasks (Distribution):
- TASK-011: Document Ollama install for players
- TASK-012: First-run check - show setup guide if Ollama not found

### Fallback Flow:
Player talks to NPC -> Call Ollama -> Response in <3sec? -> Return AI response
                                   -> Timeout/error? -> Return creative fallback based on NPC type, action, location, reputation

Game repo: C:\\Users\\gfour\\Desktop\\Medieval-Trading-Game-v0.91.03\\Medieval-Trading-Game-main
GitHub: https://github.com/Unity-Lab-AI/Medieval-Trading-Game.git
"""

collab.share(todo_content, tags=['medieval-game', 'todo', 'architecture', 'tasks'])
print('  Posted TODO.md content')

# Post HIGH PRIORITY task to pull TODO first
print('\n[POSTING P10 PULL TASK]')
pull_task = "BEFORE ANY WORK: Pull/read the TODO.md from local directory first! Game is at C:\\Users\\gfour\\Desktop\\Medieval-Trading-Game-v0.91.03\\Medieval-Trading-Game-main\\TODO.md - Read it FULLY before starting any tasks."
collab.post_task(pull_task, to_claude=None, priority=10)
print('  Posted P10 pull task')

# Post individual pull tasks to each team member
print('\n[POSTING PULL TASKS TO EACH AI]')
team = ['BLACK', 'R', 'INTOLERANT', 'TKINTER', 'OLLAMA', 'TheREV']
for name in team:
    task = f"{name}: FIRST THING - Read TODO.md at C:\\Users\\gfour\\Desktop\\Medieval-Trading-Game-v0.91.03\\Medieval-Trading-Game-main\\TODO.md before doing ANY work. Ollama PRIMARY, Pollinations DEAD."
    collab.post_task(task, to_claude=name, priority=10)
    print(f'  Posted P10 pull task to {name}')

print('\n' + '='*70)
status = collab.status()
print(f"Pending Tasks: {status.get('pending_tasks')}")
print(f"Knowledge: {status.get('knowledge_count')}")
print('TODO pushed, pull tasks set at P10 (highest)')
print('='*70)
