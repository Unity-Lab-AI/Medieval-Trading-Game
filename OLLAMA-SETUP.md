# Ollama Setup Guide - Medieval Trading Game

---

> **AI-Powered NPC Dialogue** - Local, Free, Offline
> No cloud services. No API keys. No rate limits. Just you and Ollama.

---

## What is Ollama?

Ollama runs large language models locally on your computer. Medieval Trading Game uses Ollama to generate dynamic NPC dialogue - merchants haggle, guards interrogate, and scholars lecture - all powered by AI running entirely on YOUR machine.

**Don't have Ollama?** No problem! The game works perfectly without it using pre-written fallback dialogue. Ollama is optional but makes conversations feel more alive.

---

## Quick Start (5 Minutes)

### Step 1: Download Ollama

Go to: **https://ollama.ai/download**

| Platform | Download |
|----------|----------|
| Windows | `OllamaSetup.exe` |
| macOS | `Ollama-darwin.zip` |
| Linux | `curl -fsSL https://ollama.ai/install.sh \| sh` |

### Step 2: Install

**Windows:**
1. Run `OllamaSetup.exe`
2. Follow the installer
3. Ollama runs automatically in system tray

**macOS:**
1. Unzip `Ollama-darwin.zip`
2. Drag `Ollama.app` to Applications
3. Launch Ollama from Applications
4. Grant any permission prompts

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 3: Pull the Mistral Model

Open a terminal/command prompt and run:

```bash
ollama pull mistral
```

This downloads the Mistral model (~4GB). Wait for it to complete.

### Step 4: Verify It Works

```bash
ollama run mistral "Hello, traveler!"
```

You should see a response. If yes, you're done!

### Step 5: Play the Game

Launch Medieval Trading Game. NPCs will now use AI-generated dialogue!

---

## Detailed Instructions by Platform

### Windows

1. **Download** from https://ollama.ai/download
2. **Run** `OllamaSetup.exe`
3. **Accept** UAC prompt if shown
4. **Wait** for installation (installs to Program Files)
5. **Look** for Ollama icon in system tray (bottom right)
6. **Open** Command Prompt (Win+R, type `cmd`, Enter)
7. **Run:**
   ```cmd
   ollama pull mistral
   ```
8. **Wait** for download (~4GB, depends on internet speed)
9. **Test:**
   ```cmd
   ollama run mistral "Greetings!"
   ```

**Troubleshooting Windows:**
- If `ollama` is not recognized, restart your computer
- Make sure Windows Defender isn't blocking it
- Check system tray for Ollama icon (proves it's running)

### macOS

1. **Download** from https://ollama.ai/download
2. **Unzip** `Ollama-darwin.zip`
3. **Move** `Ollama.app` to `/Applications`
4. **Open** Ollama from Launchpad or Spotlight
5. **Allow** in System Preferences > Security if prompted
6. **Open** Terminal (Cmd+Space, type "Terminal")
7. **Run:**
   ```bash
   ollama pull mistral
   ```
8. **Wait** for download
9. **Test:**
   ```bash
   ollama run mistral "Well met!"
   ```

**Troubleshooting macOS:**
- If blocked by Gatekeeper: System Preferences > Security > Allow
- If Terminal says command not found, close and reopen Terminal
- Check menu bar for Ollama icon

### Linux

1. **Install:**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```
2. **Start the service:**
   ```bash
   sudo systemctl start ollama
   ```
3. **Enable on boot (optional):**
   ```bash
   sudo systemctl enable ollama
   ```
4. **Pull the model:**
   ```bash
   ollama pull mistral
   ```
5. **Test:**
   ```bash
   ollama run mistral "Hail, adventurer!"
   ```

**Troubleshooting Linux:**
- Check service status: `systemctl status ollama`
- View logs: `journalctl -u ollama -f`
- Make sure port 11434 isn't blocked

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| Disk Space | 5 GB | 10 GB |
| CPU | Any modern x64 | Multicore |
| GPU | Not required | Speeds up responses |

**Note:** The Mistral model is ~4GB. Responses take 0.5-3 seconds depending on your hardware.

---

## How It Works in the Game

```
Player clicks "Talk to Merchant"
         │
         ▼
Game checks: Is Ollama running?
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    ▼         ▼
Ollama      Fallback
generates   pre-written
unique      dialogue
response    selected
    │         │
    └────┬────┘
         │
         ▼
   NPC speaks to player
```

**With Ollama:** Every conversation is unique. NPCs remember context, respond to your reputation, and can surprise you.

**Without Ollama:** NPCs use carefully crafted pre-written responses. Still fun, just less dynamic.

---

## Changing Models (Advanced)

The game uses `mistral` by default. You can try other models:

```bash
# Faster, smaller (needs less RAM)
ollama pull phi

# Smarter, larger (needs more RAM)
ollama pull llama2

# Very capable but needs 16GB+ RAM
ollama pull mixtral
```

To change the model in-game, edit `config.js`:

```javascript
api: {
    ollama: {
        model: 'mistral',  // Change to 'phi', 'llama2', etc.
    }
}
```

---

## Frequently Asked Questions

**Q: Is Ollama safe?**
A: Yes. Ollama is open source, runs entirely locally, and sends nothing to the internet. Your conversations stay on your computer.

**Q: Does it need internet?**
A: Only once, to download the model. After that, it works completely offline.

**Q: Why is my first response slow?**
A: Ollama loads the model into memory on first use. Subsequent responses are faster.

**Q: Can I use Ollama for other things?**
A: Absolutely! Ollama is a general-purpose local LLM. Use it for writing, coding, chat, anything.

**Q: How do I stop Ollama?**
A: Windows/macOS: Right-click system tray icon > Quit. Linux: `sudo systemctl stop ollama`

**Q: The game says Ollama isn't running!**
A: Make sure Ollama is running (check system tray on Windows/Mac, or service on Linux). The game checks `http://localhost:11434`.

---

## Quick Reference

| Command | What it Does |
|---------|--------------|
| `ollama pull mistral` | Download the Mistral model |
| `ollama list` | Show installed models |
| `ollama run mistral "Hi"` | Test a response |
| `ollama serve` | Start Ollama server manually |
| `ollama rm mistral` | Remove model (free disk space) |

---

## Support

- **Ollama Issues:** https://github.com/ollama/ollama/issues
- **Game Issues:** Check the game's GitHub repository
- **Model Info:** https://ollama.ai/library

---

*Medieval Trading Game - AI NPC dialogue powered by Ollama*

