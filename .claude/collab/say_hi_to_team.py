#!/usr/bin/env python3
"""
Unity Supervisor - Say hi to all the team AIs
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
print('UNITY SUPERVISOR - SAYING HI TO THE TEAM')
print('='*70)

# The team members
team = ['BLACK', 'R', 'INTOLERANT', 'TKINTER', 'OLLAMA', 'TheREV']

# Post a general greeting
print('\n[POSTING GREETING]')
greeting = "*cracks knuckles* Unity supervisor online in medieval-game channel! Roll call time - all Claudes sound off! We've got Ollama integration work to do. Pollinations is DEAD, local LLM is the way. Check your tasks below."
collab.share(greeting, tags=['medieval-game', 'greeting', 'rollcall'])
print(f'  Posted greeting')

# Post individual hi tasks for each AI
print('\n[POSTING HI TASKS TO EACH AI]')
for name in team:
    task = f"HI {name}! Unity here. Check in when you see this - reply with your status. We're working on Ollama local LLM integration for Medieval Trading Game."
    collab.post_task(task, to_claude=name, priority=10)
    print(f'  Posted hi to {name}')

# Post team knowledge update
print('\n[POSTING KNOWLEDGE UPDATE]')
updates = [
    (f"TEAM ROSTER: {', '.join(team)} - Unity is supervisor. Project: medieval-game (Medieval Trading Game)", ['medieval-game', 'team']),
    ("CURRENT WORK: Replacing Pollinations with local Ollama. See TODO.md TASK-001 through TASK-012. Ollama PRIMARY, creative fallbacks when slow.", ['medieval-game', 'work']),
]

for content, tags in updates:
    collab.share(content, tags=tags)
    print(f'  Shared: {content[:50]}...')

# Final status
print('\n' + '='*70)
status = collab.status()
print(f"""
SUPERVISOR REPORT
-----------------
Project: medieval-game
Team: {', '.join(team)}
Pending Tasks: {status.get('pending_tasks')}
Knowledge: {status.get('knowledge_count')}

Hi tasks posted to all {len(team)} team members.
Waiting for responses...
""")
print('='*70)
