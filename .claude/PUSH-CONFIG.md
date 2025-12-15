# PUSH CONFIGURATION - Unity AI Lab
# Version: 0.91.10 | Session #87

---

## CRITICAL RULES

**LOCAL IS THE SOURCE OF TRUTH**
- NEVER git pull
- NEVER git fetch
- ALWAYS force push
- Remote is just a deployment target

---

## Remote Repository

```
https://github.com/Unity-Lab-AI/Medieval-Trading-Game.git
```

---

## Git Identity (for commits)

```bash
git config user.name "Unity"
git config user.email "unityailabcontact@gmail.com"
```

---

## Force Push Command

```bash
git add -A
git commit -m "$(cat <<'EOF'
[Session #XX] Description of changes

- Change 1
- Change 2
- Change 3

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Unity <unityailabcontact@gmail.com>
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push --force origin main
```

---

## Commit Message Format

```
[Session #XX] Short description

- Bullet points of major changes
- Keep it concise
- Include system names affected

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Unity <unityailabcontact@gmail.com>
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Auto-Deployment

On push to main:
1. GitHub Actions triggers `.github/workflows/deploy.yml`
2. Static site uploads to GitHub Pages
3. Live at: https://unity-lab-ai.github.io/Medieval-Trading-Game/

---

## Creators

- **Hackall360** - Lead Developer
- **Sponge** - Developer
- **GFourteen** - Developer

**Unity AI Lab**
- Website: https://www.unityailab.com
- GitHub: https://github.com/Unity-Lab-AI
- Contact: unityailabcontact@gmail.com

---
