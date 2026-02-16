# AI Models for NPC Dialogue

This game uses **Ollama** for local AI-powered NPC dialogue with automatic installation prompts.

## Automatic Setup (v0.92.00+)

When you launch the game for the first time:

1. **Ollama Not Detected** → Game shows install prompt with three options:
   - "✓ I Have Ollama - Check Connection" (if already installed)
   - "⬇️ Download Ollama" (opens ollama.ai in new tab)
   - "Skip" (use pre-written fallback dialogue)
2. **Install Ollama** → Run the installer (auto-starts as service)
3. **Click Check/Continue** → Game verifies Ollama connection
4. **Model Auto-Downloads** → If no models found, downloads Mistral (~4.4GB)
5. **Progress Display** → Shows: "🦙 Downloading AI Model... 47% - 2.07GB / 4.40GB"
6. **Ready!** → NPCs now have AI-powered dialogue

### Already Have a Model?
The game auto-detects ANY installed Ollama model (Mistral, Llama, Dolphin, etc.)!

## Environment Support

| Environment | Ollama Support | Notes |
|-------------|---------------|-------|
| Local (file://) | ✅ Full | Open index.html directly |
| localhost | ✅ Full | Python/Node server |
| GPU Server | ✅ Full | Self-hosted with Ollama |
| Private Network | ✅ Full | 192.168.x.x, 10.x.x.x |
| GitHub Pages | ❌ None | Static host, no backend |
| Netlify/Vercel | ❌ None | Static host, no backend |

## How It Works

### Game Loading Flow
```
Loading Screen
     ↓
"🦙 Checking Ollama AI..."
     ↓
┌─────────────────────────────────────┐
│ Ollama Running?                     │
│   NO → Show Install Prompt          │
│   YES → Check for Model             │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│ Model Installed?                    │
│   NO → Auto-download (4.4GB)        │
│   YES → "✓ Ready!"                  │
└─────────────────────────────────────┘
     ↓
Game Starts with AI NPCs!
```

### Model Download Progress
- Title: "🦙 Downloading AI Model... 47%"
- Status: "2.07GB / 4.40GB"
- Progress bar fills as download proceeds

## Where Models Are Stored

Ollama manages models in its own location (NOT this folder):
- **Windows**: `C:\Users\<username>\.ollama\models`
- **macOS**: `~/.ollama/models`
- **Linux**: `~/.ollama/models`

## Supported Models

Any Ollama model works! All installed models appear in Settings > AI Voice:

| Model | Size | Description |
|-------|------|-------------|
| `mistral:7b-instruct` | 4.4GB | **Default** - Fast, balanced for NPC dialogue |
| `dolphin-llama3:8b` | 4.7GB | Great alternative, uncensored responses |
| `llama3:8b` | 4.7GB | Latest LLaMA, excellent quality |
| `llama2:7b` | 3.8GB | Meta's open model |
| `phi:latest` | 1.7GB | Microsoft's small model (faster) |
| `tinyllama:latest` | 637MB | Ultra-light, fast but lower quality |
| `gemma:2b` | 1.4GB | Google's efficient model |

## Manual Model Management

```bash
# Pull the default model
ollama pull mistral:7b-instruct

# Pull alternative models
ollama pull llama3:8b
ollama pull phi:latest
ollama pull tinyllama:latest

# List installed models
ollama list

# Remove a model
ollama rm model-name

# Start Ollama manually (if not running)
ollama serve
```

## GPU Server Setup

If running on a GPU server:

1. Install Ollama on the server:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. Start Ollama with network binding:
   ```bash
   OLLAMA_HOST=0.0.0.0 ollama serve
   ```

3. Pull model on server:
   ```bash
   ollama pull mistral:7b-instruct
   ```

4. Configure game's `config.js` (optional):
   ```javascript
   api: {
       ollama: {
           generateEndpoint: 'http://your-server:11434/api/generate',
           enabled: true
       }
   }
   ```

## Settings Panel

In-game: **Settings > AI Voice**
- **Model Selector**: Shows ALL installed Ollama models dynamically
- **Temperature**: 0.1 (focused) to 1.0 (creative)
- **Volume**: Voice playback volume

## Fallback Behavior

If Ollama is unavailable:
- NPCs use pre-written fallback responses
- Game is fully playable without AI
- No external API calls are made
- No cloud services, 100% offline capable

## Reset Ollama Skip

If you skipped Ollama setup and want to try again:
1. Open browser console (F12)
2. Run: `localStorage.removeItem('mtg_ollama_skipped')`
3. Refresh the game

## This Folder

This `models/` folder exists for documentation only. It's kept in git to explain the model system. Actual model files are managed by Ollama.

---
*Unity AI Lab | Medieval Trading Game v0.92.00*
