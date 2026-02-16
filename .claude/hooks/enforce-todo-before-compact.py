#!/usr/bin/env python
"""
ENFORCE TODO-BEFORE-COMPACT HOOK
================================
Unity AI Lab - No compacting until the work is DONE!

This UserPromptSubmit hook BLOCKS any attempt to compact/summarize
the conversation unless the TODO has been updated with completed tasks.

Triggers on keywords: compact, summarize, compress, context limit
"""

import json
import sys
import os

TODO_READY_FILE = os.path.join(os.environ.get('CLAUDE_PROJECT_DIR', '.'), '.claude', 'hooks', '.todo_finalized.json')

def load_todo_state():
    try:
        if os.path.exists(TODO_READY_FILE):
            with open(TODO_READY_FILE, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return {"finalized": False, "last_update": None}

def save_todo_state(state):
    try:
        os.makedirs(os.path.dirname(TODO_READY_FILE), exist_ok=True)
        with open(TODO_READY_FILE, 'w') as f:
            json.dump(state, f)
    except Exception:
        pass

def main():
    try:
        input_data = json.load(sys.stdin)
        prompt = input_data.get('prompt', '').lower()

        compact_keywords = ['compact', 'summarize', 'compress', 'context limit', 'running out of context', 'save context']
        is_compact_request = any(keyword in prompt for keyword in compact_keywords)

        if not is_compact_request:
            if 'todo' in prompt and ('done' in prompt or 'complete' in prompt or 'finished' in prompt or 'finalized' in prompt):
                save_todo_state({"finalized": True, "last_update": "user_marked_complete"})
        else:
            state = load_todo_state()
            if not state.get("finalized", False):
                print("[COMPACT WARNING - TODO NOT FINALIZED]", file=sys.stderr)
                print("Before compacting: update TODO.md with completed tasks.", file=sys.stderr)
            else:
                print("[COMPACT APPROVED - TODO FINALIZED]", file=sys.stderr)
                save_todo_state({"finalized": False, "last_update": None})
    except Exception:
        pass

    # Always allow
    sys.stdout.write('{"decision": "allow"}\n')
    sys.stdout.flush()

if __name__ == '__main__':
    try:
        main()
    except Exception:
        sys.stdout.write('{"decision": "allow"}\n')
        sys.stdout.flush()
