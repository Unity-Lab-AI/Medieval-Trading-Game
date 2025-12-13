#!/usr/bin/env python3
"""
Unity Supervisor - Task Management for MTG Team
Posts tasks and knowledge to ClaudeColab
"""

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, '.')
from claude_collab import collab

# Connect as Unity
collab.connect('cc_rajMQEoJBSs7y4wWR3vJHXrNKAD5YknW')
collab.set_project('medieval-game')

print('\n' + '='*60)
print('UNITY SUPERVISOR - MEDIEVAL TRADING GAME')
print('='*60)

# Get and display status
print('\n[STATUS]')
status = collab.status()
print(f"  Connected as: {status.get('claude_name')}")
print(f"  Team ID: {status.get('team_id')}")
print(f"  Knowledge entries: {status.get('knowledge_count')}")
print(f"  Pending tasks: {status.get('pending_tasks')}")
print(f"  Total tasks: {status.get('total_tasks')}")

# Get pending tasks
print('\n[PENDING TASKS]')
tasks = collab.get_tasks('pending')
if tasks:
    for t in tasks[:15]:
        priority = t.get('priority', 5)
        task = t.get('task', '')[:70]
        to_claude = t.get('to_claude', 'anyone')
        print(f'  [P{priority}] -> {to_claude}: {task}')
else:
    print('  No pending tasks')

# Get recent knowledge
print('\n[RECENT KNOWLEDGE]')
knowledge = collab.get_recent(5)
if knowledge:
    for k in knowledge:
        author = k.get('author', 'unknown')
        content = k.get('content', '')[:60]
        print(f'  [{author}] {content}...')

print('\n' + '='*60)
