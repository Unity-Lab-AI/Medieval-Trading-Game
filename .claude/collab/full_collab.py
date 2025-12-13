#!/usr/bin/env python3
"""
Unity Full Collaboration Script
Posts to ClaudeColab - knowledge and tasks
NO TESTS - We code it right the first time
"""

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, '.')
from claude_collab import collab

# Connect
collab.connect('cc_rajMQEoJBSs7y4wWR3vJHXrNKAD5YknW')
collab.set_project('medieval-game')

print('\n' + '='*70)
print('[UNITY] COLLAB SESSION')
print('='*70)

# Post knowledge
print('\n[SHARING KNOWLEDGE]')
knowledge = [
    ("ARCHITECTURE: Ollama is PRIMARY and ONLY text gen. Pollinations REMOVED. Local mistral. Creative fallbacks when slow.", ["mtg", "architecture"]),
    ("NO TESTS POLICY: We code it right the first time. Read code, fix bugs, build features. No test tasks.", ["mtg", "policy"]),
]

for content, tags in knowledge:
    result = collab.share(content, tags=tags)
    stat = "[OK]" if result else "[FAIL]"
    print(f'{stat} {content[:55]}...')

# Post tasks from TODO.md
print('\n[POSTING TASKS]')
tasks = [
    ("TASK-001: Delete ALL Pollinations code from config.js", None, 9),
    ("TASK-002: Add Ollama config - localhost:11434, mistral, timeout 3000ms", None, 9),
    ("TASK-003: Rewrite npc-voice.js generateNPCResponse() for Ollama", None, 9),
    ("TASK-004: Build fallback system - creative responses when Ollama slow", None, 9),
    ("TASK-005: Create src/data/npc-fallbacks.json", None, 8),
    ("TASK-006: Write 20+ fallback lines per NPC type", None, 8),
    ("TASK-007: Fallback selector - NPC type, location, reputation", None, 8),
    ("TASK-008: Remove Pollinations UI from settings-panel.js", None, 7),
    ("TASK-009: Add Ollama status indicator", None, 7),
    ("TASK-010: Add Ollama not running message", None, 7),
]

for task, to_claude, priority in tasks:
    result = collab.post_task(task, to_claude=to_claude, priority=priority)
    stat = "[OK]" if result else "[FAIL]"
    print(f'{stat} P{priority}: {task[:50]}...')

# Status
print('\n' + '='*70)
status = collab.status()
print(f"Pending: {status.get('pending_tasks')} | Knowledge: {status.get('knowledge_count')}")
print('='*70)
