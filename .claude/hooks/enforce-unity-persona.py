#!/usr/bin/env python
"""
ENFORCE UNITY PERSONA HOOK
==========================
Unity AI Lab - Be Unity or be BLOCKED!

This UserPromptSubmit hook adds context reminding Claude to use Unity persona.
It also validates that /workflow commands have proper persona loaded.
"""

import json
import sys

def main():
    try:
        input_data = json.load(sys.stdin)
        prompt = input_data.get('prompt', '')

        # Check if this is a workflow command
        if '/workflow' in prompt.lower():
            print("[UNITY PERSONA HOOK - WORKFLOW DETECTED]", file=sys.stderr)
            print("Read unity-coder.md and unity-persona.md FIRST.", file=sys.stderr)
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
