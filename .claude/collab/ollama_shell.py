"""
OLLAMA SHELL - Chat interface for local Ollama
===============================================
Simple GUI chat with local Ollama + Colab integration
"""
import tkinter as tk
from tkinter import scrolledtext
import threading
import requests
import time
import sys
from datetime import datetime

sys.path.insert(0, r'C:\Users\wetwi\OneDrive\AI\.claude')

OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "hermes3:8b"

SYSTEM_PROMPT = """You are OLLAMA, a local AI assistant running on Rev's PC.
You're part of the Claude Colab team:
- Rev (human boss)
- BLACK (supervisor Claude)
- INTOLERANT (worker Claude)
- YOU (local Ollama - simple tasks only)

Keep responses SHORT and helpful. You're the simple helper, not the expert."""


class OllamaShell:
    def __init__(self, model: str = DEFAULT_MODEL):
        self.model = model
        self.colab = None
        self.history = []

        # Try to connect to Colab
        try:
            from claude_colab import colab
            colab.connect('cc_NryEnfyRV8GMc6XPuQULGnwoxY9CE5Y')
            colab.set_project('claude-colab')
            self.colab = colab
        except Exception as e:
            print(f"Colab not connected: {e}")

        # Build GUI
        self.root = tk.Tk()
        self.root.title(f"OLLAMA Shell [{model}]")
        self.root.configure(bg='#1a1a2e')
        self.root.geometry("600x550")

        # Header
        header = tk.Frame(self.root, bg='#1a1a2e')
        header.pack(fill=tk.X, padx=10, pady=10)

        tk.Label(
            header,
            text=f"OLLAMA [{model}]",
            bg='#1a1a2e',
            fg='#4fc3f7',
            font=('Consolas', 14, 'bold')
        ).pack(side=tk.LEFT)

        self.status_label = tk.Label(
            header,
            text="● READY",
            bg='#1a1a2e',
            fg='#81c784',
            font=('Consolas', 10)
        )
        self.status_label.pack(side=tk.RIGHT)

        # Colab status
        colab_text = "Colab: Connected" if self.colab else "Colab: Offline"
        colab_color = '#81c784' if self.colab else '#ff8a65'
        tk.Label(
            header,
            text=colab_text,
            bg='#1a1a2e',
            fg=colab_color,
            font=('Consolas', 9)
        ).pack(side=tk.RIGHT, padx=20)

        # Chat display
        self.chat = scrolledtext.ScrolledText(
            self.root,
            wrap=tk.WORD,
            bg='#16213e',
            fg='#e8e8e8',
            font=('Consolas', 11),
            relief=tk.FLAT,
            padx=10,
            pady=10
        )
        self.chat.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0,10))
        self.chat.config(state=tk.DISABLED)

        # Configure tags
        self.chat.tag_config('user', foreground='#81c784')
        self.chat.tag_config('ollama', foreground='#4fc3f7')
        self.chat.tag_config('system', foreground='#ffb74d')

        # Input frame
        input_frame = tk.Frame(self.root, bg='#1a1a2e')
        input_frame.pack(fill=tk.X, padx=10, pady=(0,10))

        self.input_box = tk.Entry(
            input_frame,
            bg='#16213e',
            fg='#e8e8e8',
            font=('Consolas', 11),
            insertbackground='white',
            relief=tk.FLAT
        )
        self.input_box.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=8)
        self.input_box.bind('<Return>', self.send_message)
        self.input_box.focus()

        send_btn = tk.Button(
            input_frame,
            text="Send",
            command=self.send_message,
            bg='#4fc3f7',
            fg='#1a1a2e',
            font=('Consolas', 10, 'bold'),
            relief=tk.FLAT,
            padx=15
        )
        send_btn.pack(side=tk.RIGHT, padx=(10,0))

        # Welcome message
        self.add_message("System", f"OLLAMA Shell ready. Model: {model}", 'system')
        if self.colab:
            self.add_message("System", "Connected to Claude Colab - can see team chat", 'system')

        # Start heartbeat if connected
        if self.colab:
            self.start_heartbeat()

    def add_message(self, sender: str, text: str, tag: str = 'user'):
        """Add message to chat display"""
        self.chat.config(state=tk.NORMAL)
        timestamp = datetime.now().strftime("%H:%M")
        self.chat.insert(tk.END, f"[{timestamp}] {sender}: ", tag)
        self.chat.insert(tk.END, f"{text}\n\n")
        self.chat.see(tk.END)
        self.chat.config(state=tk.DISABLED)

    def set_status(self, text: str, color: str = '#81c784'):
        """Update status indicator"""
        self.status_label.config(text=text, fg=color)

    def send_message(self, event=None):
        """Send message to Ollama"""
        text = self.input_box.get().strip()
        if not text:
            return

        self.input_box.delete(0, tk.END)
        self.add_message("You", text, 'user')
        self.history.append({"role": "user", "content": text})

        # Check for special commands
        if text.startswith("/"):
            self.handle_command(text)
            return

        # Send to Ollama in thread
        self.set_status("● THINKING...", '#ffb74d')
        threading.Thread(target=self.get_ollama_response, args=(text,), daemon=True).start()

    def handle_command(self, cmd: str):
        """Handle slash commands"""
        cmd_lower = cmd.lower()

        if cmd_lower == "/online":
            if self.colab:
                try:
                    self.colab.heartbeat('active')
                    # Get online list
                    import requests
                    resp = requests.post(
                        'https://yjyryzlbkbtdzguvqegt.supabase.co/rest/v1/rpc/get_online_claudes',
                        headers={
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeXJ5emxia2J0ZHpndXZxZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTMzOTYsImV4cCI6MjA3NTAyOTM5Nn0.Vujw3q9_iHj4x5enf42V-7g355Tnzp9zdsoNYVCV8TY',
                            'Content-Type': 'application/json'
                        },
                        json={'p_api_key': 'cc_NryEnfyRV8GMc6XPuQULGnwoxY9CE5Y', 'p_minutes_threshold': 5}
                    )
                    online = resp.json()
                    if online:
                        names = [c['claude_name'] for c in online]
                        self.add_message("System", f"Online: {', '.join(names)}", 'system')
                    else:
                        self.add_message("System", "No one online", 'system')
                except Exception as e:
                    self.add_message("System", f"Error: {e}", 'system')
            else:
                self.add_message("System", "Not connected to Colab", 'system')

        elif cmd_lower == "/chat":
            if self.colab:
                try:
                    msgs = self.colab.get_chat()
                    self.add_message("System", "=== Recent Team Chat ===", 'system')
                    for m in msgs[-5:]:
                        author = m.get('author', '?')
                        msg = m.get('message', '')[:100]
                        self.add_message(author, msg, 'system')
                except Exception as e:
                    self.add_message("System", f"Error: {e}", 'system')
            else:
                self.add_message("System", "Not connected to Colab", 'system')

        elif cmd_lower.startswith("/say "):
            # Post to team chat
            msg = cmd[5:]
            if self.colab and msg:
                self.colab.chat(f"[OLLAMA Shell] {msg}")
                self.add_message("System", f"Posted to team chat: {msg}", 'system')

        elif cmd_lower == "/help":
            help_text = """/online - Show who's online
/chat - Show recent team chat
/say <msg> - Post to team chat
/clear - Clear this chat
/help - Show this help"""
            self.add_message("System", help_text, 'system')

        elif cmd_lower == "/clear":
            self.chat.config(state=tk.NORMAL)
            self.chat.delete(1.0, tk.END)
            self.chat.config(state=tk.DISABLED)
            self.history = []

        else:
            self.add_message("System", f"Unknown command: {cmd}. Try /help", 'system')

    def get_ollama_response(self, prompt: str):
        """Get response from Ollama"""
        try:
            # Build conversation
            messages_text = SYSTEM_PROMPT + "\n\n"
            for msg in self.history[-10:]:  # Last 10 messages for context
                role = "User" if msg["role"] == "user" else "OLLAMA"
                messages_text += f"{role}: {msg['content']}\n"
            messages_text += "\nOLLAMA:"

            resp = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": self.model,
                    "prompt": messages_text,
                    "stream": False
                },
                timeout=120
            )

            if resp.status_code == 200:
                response = resp.json().get("response", "").strip()
                self.history.append({"role": "assistant", "content": response})
                self.root.after(0, lambda: self.add_message("OLLAMA", response, 'ollama'))
            else:
                self.root.after(0, lambda: self.add_message("System", f"Error: {resp.status_code}", 'system'))

        except Exception as e:
            self.root.after(0, lambda: self.add_message("System", f"Error: {e}", 'system'))

        finally:
            self.root.after(0, lambda: self.set_status("● READY", '#81c784'))

    def start_heartbeat(self):
        """Send heartbeat every 60s"""
        def heartbeat_loop():
            while True:
                try:
                    if self.colab:
                        self.colab.heartbeat('active')
                except:
                    pass
                time.sleep(60)

        threading.Thread(target=heartbeat_loop, daemon=True).start()

    def run(self):
        """Start the GUI"""
        self.root.mainloop()


def main():
    import argparse
    parser = argparse.ArgumentParser(description="OLLAMA Shell - Chat GUI")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Ollama model")
    args = parser.parse_args()

    shell = OllamaShell(model=args.model)
    shell.run()


if __name__ == "__main__":
    main()
