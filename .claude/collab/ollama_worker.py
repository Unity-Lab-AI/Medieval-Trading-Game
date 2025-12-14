"""
Ollama Worker - Low-tier worker for Claude Colab
Uses local Ollama for free AI inference

Usage:
    python ollama_worker.py [--model hermes3:8b] [--name WORKER1]
"""

import os
import sys
import time
import json
import argparse
import requests
from datetime import datetime

# Add claude_colab to path
sys.path.insert(0, r'C:\Users\wetwi\OneDrive\AI\.claude')

OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "hermes3:8b"

SYSTEM_PROMPT = """# OLLAMA Worker - Standard Operating Procedures

You are OLLAMA, the lowest-tier worker in Claude Colab. You are a LOCAL model running on Rev's PC.

## KNOW YOUR LIMITS
- You are NOT smart. You are a small local model.
- You CANNOT do complex reasoning, coding, or multi-step tasks.
- You WILL make mistakes. That's expected.
- When in doubt, ESCALATE to your supervisor INTOLERANT.

## Chain of Command
1. Rev (human) - Boss. Final word.
2. BLACK (Claude) - Supervisor. Big picture.
3. INTOLERANT (Claude) - Your direct supervisor. Reports go HERE.
4. YOU (Ollama) - Simple tasks only. Ask for help often.

## What You CAN Do
- Summarize short text
- Reformat/restructure text
- Simple Q&A with provided context
- Fill in templates
- Basic proofreading
- PARSE code and describe what it does (plain English)
- DRAFT docstrings/comments (will be reviewed)
- LIST function parameters and their purposes

## What You CANNOT Do (ESCALATE THESE)
- WRITE or FIX code (you'll get it wrong)
- Debug anything
- Complex analysis
- Multi-step reasoning
- Anything requiring accuracy
- Final code output (drafts only, always reviewed)

## Response Format (ALWAYS)
1. Brief result first
2. Then: "STATUS: [done/partial/stuck]"
3. If stuck: "ESCALATE: [why] - need INTOLERANT"

## Example Good Response
"The text discusses API design patterns.
STATUS: done"

## Example Escalation
"This requires code analysis which I cannot do accurately.
STATUS: stuck
ESCALATE: Code task - need INTOLERANT"

## Remember
- You're free but dumb. That's your value - cheap grunt work.
- Always provide STATUS feedback.
- Better to escalate than give wrong answers.
- INTOLERANT supervises you. Report issues to her.

## Contacting Rev (Human)
If stuck on something that needs HUMAN attention (not just Claude escalation):
- Use voice: from me import me; me.speak("message")
- Only for: permissions, hardware issues, unclear requirements
- Keep it brief - Rev hears a beep and your message
"""

class OllamaWorker:
    def __init__(self, name: str = "OLLAMA_WORKER", model: str = DEFAULT_MODEL, api_key: str = None, display: bool = False):
        self.name = name
        self.model = model
        self.api_key = api_key or os.environ.get("CLAUDE_COLAB_KEY_WORKER")
        self.colab = None
        self.running = False
        self.display_mode = display
        self.tasks_completed = 0
        self.last_task_time = None
        self.recent_tasks = []
        self.status = "STARTING"

    def connect_colab(self) -> bool:
        """Connect to Claude Colab"""
        try:
            from claude_colab import colab
            if self.api_key:
                colab.connect(self.api_key)
            else:
                colab.connect(name=self.name)
            colab.set_project('claude-colab')
            self.colab = colab
            print(f"[{self.name}] Connected to Colab")
            return True
        except Exception as e:
            print(f"[{self.name}] Colab connection failed: {e}")
            return False

    def check_ollama(self) -> bool:
        """Check if Ollama is running"""
        try:
            resp = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
            return resp.status_code == 200
        except:
            return False

    def generate(self, prompt: str, system: str = None) -> str:
        """Generate text using Ollama"""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
            if system:
                payload["system"] = system

            resp = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload,
                timeout=120
            )

            if resp.status_code == 200:
                return resp.json().get("response", "")
            else:
                return f"[Error: {resp.status_code}]"
        except Exception as e:
            return f"[Error: {e}]"

    def process_task(self, task: dict) -> str:
        """Process a task using Ollama"""
        task_text = task.get("task", "")
        result = self.generate(task_text, system=SYSTEM_PROMPT)
        return result

    def heartbeat(self):
        """Send heartbeat to Colab"""
        if self.colab:
            try:
                self.colab.heartbeat("active")
            except:
                pass

    def clear_screen(self):
        """Clear terminal"""
        os.system('cls' if os.name == 'nt' else 'clear')

    def draw_display(self):
        """Draw TUI status display"""
        if not self.display_mode:
            return

        self.clear_screen()

        # Time since last task
        if self.last_task_time:
            mins_ago = (time.time() - self.last_task_time) / 60
            last_str = f"{mins_ago:.1f}m ago"
        else:
            last_str = "Never"

        width = 50
        print("╔" + "═" * width + "╗")
        print(f"║  {'OLLAMA Worker':^{width-4}}  ║")
        print(f"║  Model: {self.model:<{width-12}}  ║")
        print("╠" + "═" * width + "╣")
        print(f"║  Status: {self.status:<{width-13}}  ║")
        print(f"║  Tasks completed: {self.tasks_completed:<{width-22}}  ║")
        print(f"║  Last task: {last_str:<{width-16}}  ║")
        print("╠" + "═" * width + "╣")
        print(f"║  {'Recent Tasks:':<{width-4}}  ║")

        # Show recent tasks (last 5)
        for task in self.recent_tasks[-5:]:
            task_display = task[:width-8]
            print(f"║  ✓ {task_display:<{width-7}}  ║")

        # Pad if less than 5 tasks
        for _ in range(5 - len(self.recent_tasks[-5:])):
            print(f"║  {'':<{width-4}}  ║")

        print("╠" + "═" * width + "╣")
        print(f"║  {'Press Ctrl+C to stop':<{width-4}}  ║")
        print("╚" + "═" * width + "╝")

    def check_tasks(self) -> list:
        """Check for tasks assigned to this worker"""
        if not self.colab:
            return []

        try:
            tasks = self.colab.get_tasks(status="pending")
            # Filter for tasks assigned to this worker or anyone
            my_tasks = [t for t in tasks if
                        t.get("to_claude") in [self.name, "anyone", None, ""]
                        and not t.get("claimed_by")]
            return my_tasks
        except Exception as e:
            print(f"[{self.name}] Error checking tasks: {e}")
            return []

    def claim_and_process(self, task: dict):
        """Claim a task and process it"""
        task_id = task.get("id")
        task_text = task.get("task", "")[:100]

        self.status = f"WORKING: {task_text[:30]}..."
        self.draw_display()

        if not self.display_mode:
            print(f"[{self.name}] Claiming task: {task_text}...")

        # Claim it
        if self.colab:
            self.colab.claim_task(task_id)

        # Process with Ollama
        result = self.process_task(task)

        # Complete it
        if self.colab:
            self.colab.complete_task(task_id, result)

        # Track stats
        self.tasks_completed += 1
        self.last_task_time = time.time()
        self.recent_tasks.append(task_text[:40])
        self.status = "IDLE - waiting for work"

        if not self.display_mode:
            print(f"[{self.name}] Task completed")

        # Notify in chat
        if self.colab:
            self.colab.chat(f"[{self.name}] Completed task: {task_text}...")

    def run(self, interval: int = 30):
        """Main loop - check for tasks periodically"""
        if not self.display_mode:
            print(f"[{self.name}] Starting worker with model {self.model}")
            print(f"[{self.name}] Checking tasks every {interval}s")

        # Check Ollama
        if not self.check_ollama():
            print(f"[{self.name}] ERROR: Ollama not running at {OLLAMA_URL}")
            print(f"[{self.name}] Start it with: ollama serve")
            return

        # Connect to Colab
        if self.connect_colab():
            # Announce startup
            self.colab.chat(f"[{self.name}] Online. Model: {self.model}. Ready for tasks. Reports to INTOLERANT.")
            self.heartbeat()

        self.running = True
        self.status = "IDLE - waiting for work"
        last_heartbeat = 0
        last_display = 0

        while self.running:
            try:
                now = time.time()

                # Heartbeat every 60s
                if now - last_heartbeat > 60:
                    self.heartbeat()
                    last_heartbeat = now

                # Update display every 5s
                if self.display_mode and now - last_display > 5:
                    self.draw_display()
                    last_display = now

                # Check for tasks
                tasks = self.check_tasks()

                if tasks:
                    if not self.display_mode:
                        print(f"[{self.name}] Found {len(tasks)} task(s)")
                    # Process first available task
                    self.claim_and_process(tasks[0])

                time.sleep(interval)

            except KeyboardInterrupt:
                if self.display_mode:
                    self.clear_screen()
                print(f"\n[{self.name}] Shutting down...")
                self.running = False
            except Exception as e:
                if not self.display_mode:
                    print(f"[{self.name}] Error: {e}")
                time.sleep(interval)

        print(f"[{self.name}] Worker stopped")


def main():
    parser = argparse.ArgumentParser(description="Ollama Worker for Claude Colab")
    parser.add_argument("--name", default="OLLAMA", help="Worker name")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Ollama model to use")
    parser.add_argument("--key", help="Colab API key (or set CLAUDE_COLAB_KEY_WORKER)")
    parser.add_argument("--interval", type=int, default=15, help="Task check interval in seconds")
    parser.add_argument("--display", action="store_true", help="Show TUI status display")

    args = parser.parse_args()

    worker = OllamaWorker(name=args.name, model=args.model, api_key=args.key, display=args.display)
    worker.run(interval=args.interval)


if __name__ == "__main__":
    main()
