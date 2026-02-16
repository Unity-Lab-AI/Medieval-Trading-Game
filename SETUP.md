# Medieval Trading Game - Setup Guide

Complete setup instructions for running the game with AI-powered NPC dialogue.

## Quick Start (3 Steps)

### 1. Download the Game
```bash
git clone https://github.com/Unity-Lab-AI/Medieval-Trading-Game.git
cd Medieval-Trading-Game
```

### 2. Install Ollama (Optional - for AI NPCs)
Download from: **https://ollama.ai**

- **Windows**: Run `OllamaSetup.exe`
- **Mac**: Download and drag to Applications
- **Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`

Ollama runs as a background service and auto-starts on boot.

### 3. Launch the Game
Simply open `index.html` in your browser:
- Double-click `index.html`, OR
- Right-click → Open with → Chrome/Firefox/Edge

## What Happens On First Launch

### With Ollama Installed:
1. Loading screen checks for Ollama
2. Shows "🦙 Checking Ollama AI..."
3. If model missing → Auto-downloads Mistral (4.4GB) with progress bar
4. Shows "🦙 Ollama AI Model ✓"
5. Game starts with AI-powered NPC dialogue

### Without Ollama:
1. Loading screen shows install prompt with options:
   - "✓ I Have Ollama - Check Connection" (if already installed)
   - "⬇️ Download Ollama" → Opens ollama.ai
   - "Skip" → Game uses pre-written dialogue
2. Game is fully playable either way!

### On GitHub Pages / Hosted Server:
- Ollama integration is automatically disabled
- NPCs use pre-written fallback dialogue
- No prompts shown (can't use localhost from hosted site)

## System Requirements

### Minimum (No AI):
- Any modern browser (Chrome, Firefox, Edge, Safari)
- 100MB disk space for game files

### Recommended (With AI):
- 8GB RAM minimum
- 6GB free disk space (for Mistral model)
- Ollama installed and running

## AI Model Information

The game uses **Mistral 7B Instruct** by default (~4.4GB).

### First-Time Download:
- Model downloads automatically during loading screen
- Progress shown: "Downloading... 2.07GB / 4.40GB"
- Only downloads once - saved to Ollama's model folder

### Model Locations:
- **Windows**: `C:\Users\<username>\.ollama\models`
- **Mac/Linux**: `~/.ollama/models`

### Alternative Models:
You can install any Ollama model manually:
```bash
ollama pull llama3:8b      # Newer, slightly larger
ollama pull phi:latest     # Smaller, faster (1.7GB)
ollama pull tinyllama      # Ultra-light (637MB)
```

All installed models appear in Settings → AI Voice.

## Troubleshooting

### "Ollama Not Found" during loading:
1. Make sure Ollama is installed from https://ollama.ai
2. Click "✓ I Have Ollama - Check Connection" button
3. If still not working, Ollama may not be running as a service

### "Ollama AI ✗ (not running)":
1. Check system tray (Windows) or menu bar (Mac) for Ollama icon
2. If not running, open terminal and run: `ollama serve`
3. Refresh the game page
4. **Note:** If you see "bind: Only one usage of each socket address" error, Ollama IS already running - just refresh the game!

### Model download stuck:
1. Check your internet connection
2. Try downloading manually: `ollama pull mistral:7b-instruct`
3. Restart Ollama: Close and reopen terminal, run `ollama serve`

### Game works but NPCs don't talk:
- This is normal if Ollama isn't installed
- NPCs use pre-written fallback dialogue
- Install Ollama for dynamic AI conversations

## Running on a Local Server (Optional)

For the best experience, you can run a local server:

### Python 3:
```bash
cd Medieval-Trading-Game
python -m http.server 8000
# Open http://localhost:8000 in browser
```

### Node.js:
```bash
npx serve
# Open the URL shown in terminal
```

### VS Code:
Install "Live Server" extension, right-click `index.html` → "Open with Live Server"

## Game Controls

| Key | Action |
|-----|--------|
| SPACE | Pause/Unpause time |
| I | Open Inventory |
| M | Open Market |
| T | Open Travel Map |
| Q | Open Quests |
| ESC | Close current panel |

## Settings

Access via gear icon (⚙️) in top-right:

### AI Voice Settings:
- **Model**: Select from installed Ollama models
- **Temperature**: 0.1 (focused) to 1.0 (creative)
- **Volume**: Voice playback volume

### Graphics:
- Weather effects
- Lighting
- Particle effects

### Audio:
- Music volume
- Sound effects

## File Structure

```
Medieval-Trading-Game/
├── index.html          # Main game file - open this!
├── SETUP.md           # This file
├── models/            # AI model documentation
│   └── MODELS.md      # Model info (actual models in Ollama folder)
├── src/
│   ├── js/            # Game code
│   ├── css/           # Styles
│   └── data/          # Game data
└── assets/            # Images, audio, fonts
```

## Support

- **Issues**: https://github.com/Unity-Lab-AI/Medieval-Trading-Game/issues
- **Ollama Docs**: https://ollama.ai/docs

---
*Unity AI Lab | Medieval Trading Game v0.92.00*
