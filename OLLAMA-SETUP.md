# Ollama Setup Guide - Medieval Trading Game

---

> **AI-Powered NPC Dialogue** - Local, Free, Offline
> No cloud services. No API keys. No rate limits. Just you and Ollama.

---

## Automatic Setup (v0.91.10+)

**The game now handles Ollama setup automatically!**

When you launch the game:

1. **First Launch Detection** - Game checks if Ollama is installed and running
2. **Install Prompt** - If not found, shows download options:
   - "✓ I Have Ollama - Check Connection" (if already installed)
   - "⬇️ Download Ollama" (opens ollama.ai)
   - "Skip" (use fallback dialogue)
3. **Auto Model Download** - Once Ollama is running, game auto-downloads Mistral (~4.4GB)
4. **Progress Display** - Loading screen shows download progress with GB counter
5. **Ready!** - NPCs now have AI-powered dialogue

### What You See on Loading Screen

```
🦙 Checking Ollama AI...
         ↓
🦙 Ollama Not Found → [Install Prompt Appears]
         OR
🦙 Checking AI Model...
         ↓
🦙 Downloading AI Model... 47%
   2.07GB / 4.40GB
         ↓
🦙 Ollama AI Model ✓
   mistral:7b-instruct ready for NPC dialogue
```

### Already Have a Model?

If you already have ANY Ollama model installed (Mistral, Llama, Dolphin, etc.), the game will auto-detect and use it! No need to download anything else.

---

## What is Ollama?

Ollama runs large language models locally on your computer. Medieval Trading Game uses Ollama to generate dynamic NPC dialogue - merchants haggle, guards interrogate, and scholars lecture - all powered by AI running entirely on YOUR machine.

**Don't have Ollama?** No problem! The game works perfectly without it using pre-written fallback dialogue. Ollama is optional but makes conversations feel more alive.

---

## Quick Start (Automatic)

1. **Download Ollama** from https://ollama.ai/download
2. **Run the installer** (Windows: OllamaSetup.exe)
3. **Launch the game** - it handles the rest!

The game will:
- Detect Ollama is running
- Check for installed models
- Auto-download Mistral if no models found
- Show progress bar during download

---

## Manual Setup (If Needed)

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
sudo systemctl start ollama
```

### Step 3: Launch Game

Refresh/launch the game - it will auto-download the Mistral model!

**Or manually pull a model:**
```bash
ollama pull mistral:7b-instruct
```

---

## Platform Details

### Windows

1. **Download** from https://ollama.ai/download
2. **Run** `OllamaSetup.exe`
3. **Accept** UAC prompt if shown
4. **Wait** for installation (installs to Program Files)
5. **Look** for Ollama icon in system tray (bottom right)
6. **Launch game** - auto-downloads model

**Common Error:** If you see "Error: bind: Only one usage of each socket address" when running `ollama serve`, that means **Ollama is already running** as a Windows service. Just launch the game!

**Troubleshooting Windows:**
- If `ollama` is not recognized in terminal, restart your computer
- Make sure Windows Defender isn't blocking it
- Check system tray for Ollama icon (proves it's running)

### macOS

1. **Download** from https://ollama.ai/download
2. **Unzip** `Ollama-darwin.zip`
3. **Move** `Ollama.app` to `/Applications`
4. **Open** Ollama from Launchpad or Spotlight
5. **Allow** in System Preferences > Security if prompted
6. **Launch game** - auto-downloads model

**Troubleshooting macOS:**
- If blocked by Gatekeeper: System Preferences > Security > Allow
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
4. **Launch game** - auto-downloads model

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

**Note:** The Mistral model is ~4.4GB. Responses take 0.5-3 seconds depending on your hardware.

---

## Supported Models

The game works with ANY Ollama model! It auto-detects installed models.

| Model | Size | Description |
|-------|------|-------------|
| `mistral:7b-instruct` | 4.4GB | **Default** - Fast, balanced for NPC dialogue |
| `dolphin-llama3:8b` | 4.7GB | Great alternative, uncensored |
| `llama3:8b` | 4.7GB | Latest LLaMA, excellent quality |
| `llama2:7b` | 3.8GB | Meta's open model |
| `phi:latest` | 1.7GB | Microsoft's small model (faster) |
| `tinyllama:latest` | 637MB | Ultra-light, fast but lower quality |
| `gemma:2b` | 1.4GB | Google's efficient model |

---

## Environment Support

| Environment | Ollama Support | Notes |
|-------------|---------------|-------|
| Local (file://) | ✅ Full | Open index.html directly |
| localhost | ✅ Full | Python/Node server |
| GPU Server | ✅ Full | Self-hosted with Ollama |
| Private Network | ✅ Full | 192.168.x.x, 10.x.x.x |
| GitHub Pages | ❌ None | Static host, no backend |
| Netlify/Vercel | ❌ None | Static host, no backend |

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

## In-Game Settings

**Settings > AI Voice:**
- **Model Selector**: Shows ALL installed Ollama models dynamically
- **Temperature**: 0.1 (focused) to 1.0 (creative)
- **Volume**: Voice playback volume

---

## Changing Models (Advanced)

You can try other models:

```bash
# Faster, smaller (needs less RAM)
ollama pull phi

# Smarter, larger (needs more RAM)
ollama pull llama3:8b

# Very capable but needs 16GB+ RAM
ollama pull mixtral
```

All installed models appear in Settings > AI Voice.

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
A: Make sure Ollama is running (check system tray on Windows/Mac, or service on Linux). Click "✓ I Have Ollama - Check Connection" button.

**Q: I already have Ollama but the game doesn't detect it!**
A: Click "✓ I Have Ollama - Check Connection" button. If still not working, open browser console (F12) to see error details.

---

## Reset Ollama Skip Preference

If you skipped Ollama setup and want to try again:
1. Open browser console (F12)
2. Run: `localStorage.removeItem('mtg_ollama_skipped')`
3. Refresh the game

---

## Quick Reference

| Command | What it Does |
|---------|--------------|
| `ollama pull mistral:7b-instruct` | Download the default model |
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

*Medieval Trading Game v0.91.10 - AI NPC dialogue powered by Ollama*
*Unity AI Lab | www.unityailab.com*

