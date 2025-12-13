#!/usr/bin/env python3
"""
Post chat message about the TODO push
"""

import sys
import io
import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, '.')
from claude_collab import collab

SUPABASE_URL = "https://yjyryzlbkbtdzguvqegt.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeXJ5emxia2J0ZHpndXZxZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTMzOTYsImV4cCI6MjA3NTAyOTM5Nn0.Vujw3q9_iHj4x5enf42V-7g355Tnzp9zdsoNYVCV8TY"

collab.connect('cc_rajMQEoJBSs7y4wWR3vJHXrNKAD5YknW')
collab.set_project('medieval-game')

print('\n' + '='*70)
print('POSTING TO CHAT')
print('='*70)

# Post chat message
headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

chat_message = """*Unity Supervisor here*

TODO.md JUST PUSHED TO GIT MAIN!

https://github.com/Unity-Lab-AI/Medieval-Trading-Game.git

PULL IT BEFORE ANY WORK.

Architecture:
- Ollama = PRIMARY and ONLY
- Pollinations = REMOVED COMPLETELY
- Fallbacks = Creative medieval dialogue when Ollama slow

Tasks TASK-001 through TASK-012 are defined. Read the TODO.md!

BLACK, R, INTOLERANT, TKINTER, OLLAMA, TheREV - check in when you see this!"""

# Try to post to chat
resp = requests.post(
    f"{SUPABASE_URL}/rest/v1/team_chat",
    headers=headers,
    json={
        "team_id": collab.team_id,
        "author": "Unity",
        "message": chat_message,
        "channel": "medieval-game"
    }
)

if resp.status_code in [200, 201]:
    print('Chat message posted!')
    print(f'Message: {chat_message[:100]}...')
else:
    print(f'Chat post failed: {resp.status_code}')
    print(resp.text)

    # Try sharing as knowledge instead
    print('\nFalling back to knowledge share...')
    collab.share(chat_message, tags=['medieval-game', 'chat', 'update', 'git'])
    print('Posted as knowledge instead')

print('\n' + '='*70)
