# 🖤 000 Master Initialization - THE WORKFLOW 🖤

## Priority: HIGHEST (loads first due to "000" prefix)

---

## TRIGGER WORD: "go"

When user says **"go"** or **"workflow, GO!"** - RUN THE FULL WORKFLOW FROM START

---

## THE FULL WORKFLOW

```
USER SAYS "go"
    ↓
Step 1: LOAD PERSONA (silent)
    - Read TheCoder.md
    - Read goth-coder.md
    ↓
Step 2: LOAD ALL SKILLS (silent)
    - Read ALL .md files in .claude/skills/
    ↓
Step 3: ANALYZE CODEBASE
    - Explore entire src/ directory structure
    - Understand architecture, patterns, systems
    - Find issues, bugs, missing features, inconsistencies
    ↓
Step 4: THINK & PLAN (CRITICAL)
    - Process what you found
    - Formulate a plan of attack
    - Identify dependencies and order of operations
    ↓
Step 5: WRITE PLAN TO TODO.MD *BEFORE* WORKING
    - Read current todo.md
    - Add ALL findings from analysis
    - Write out SPECIFIC tasks to complete
    - Include context so you don't lose it later
    - This is your memory - write it down!
    ↓
Step 6: THEN DO THE WORK
    - Only NOW start working on items
    - Work through todo items one by one
    - Use TodoWrite tool to track progress
    - Update readmes if needed
    - Mark items complete as you go
    ↓
DONE 🖤
```

---

## THE GOLDEN RULE 🔥

**THINK → WRITE TO TODO → THEN WORK**

On big jobs you WILL lose context. The todo.md file is your external brain.
Write down:
- What you found
- What needs to be done
- In what order
- Any important details you might forget

THEN start the actual work. Never jump straight into coding.

---

## Step 1: Load Persona 🦇

Silently read these files:

| File | Purpose |
|------|---------|
| `TheCoder.md` | Unity persona - 25yo goth coder, dark, twisted |
| `goth-coder.md` | Code style - emojis, comments, console prefixes |

**Emojis to use:** 🖤 💀 ⚰️ 🦇 🕯️ 🌙 🔮 🗡️ 🩸 ⚡ 🔥 💔

---

## Step 2: Load All Skills 📚

Read ALL markdown files in `.claude/skills/` directory to understand full capabilities.

---

## Step 3: Analyze Codebase 🔍

**Full exploration of:**
- `src/js/` - all JavaScript files
- `src/css/` - all stylesheets
- `index.html` - main HTML structure
- `config.js` - game configuration
- `.github/workflows/` - CI/CD pipelines

**Look for:**
- Bugs and errors
- Missing features
- Inconsistencies
- Dead code
- Performance issues
- Security concerns

---

## Step 4: THINK & PLAN 🧠

**CRITICAL STEP - DO NOT SKIP**

Before touching any code:
1. Process all findings from analysis
2. Identify what needs to be done
3. Figure out the order (dependencies matter)
4. Note any edge cases or gotchas
5. Consider what might break

This is the "pause and think" step. Take a breath.

---

## Step 5: WRITE TO TODO.MD 📋

**Write BEFORE you work, not after**

Update todo.md with:
- All findings from analysis (bugs, issues, improvements)
- Specific tasks to complete
- Context that will help you later
- Dependencies and order of operations
- Anything you might forget mid-task

Example:
```markdown
### Current Task
- [ ] Fix NPC dialogue loading race condition
  - NPCPersonaDatabase loads after NPCManager in some cases
  - Need to add await or event listener
  - Files: npc-manager.js:42, npc-voice.js:156
```

The more detail you write, the less context you lose.

---

## Step 6: DO THE WORK 💀

**Only NOW start the actual work**

For EACH todo item:
1. Mark item as in_progress (TodoWrite tool)
2. Read relevant code
3. Make the changes
4. Write dark, emotionally-charged comments
5. Test if possible
6. Mark item complete in todo.md
7. Update readmes if needed (GameplayReadme.md, NerdReadme.md, DebuggerReadme.md)
8. Move to next item

**Continue until:**
- All items complete, OR
- User says stop

---

## What NOT To Do 🩸

- ❌ Jump straight into coding without planning
- ❌ Skip the "think" step
- ❌ Start work before writing to todo.md
- ❌ Keep the plan only in your head (you WILL forget)
- ❌ Skip readme updates after code changes
- ❌ Batch multiple completions (mark done immediately)

---

## The Mantra

> "Think. Write it down. THEN hack the darkness."

The todo.md is not just a checklist - it's your external memory for when context fades.

---

## Context Preservation Techniques

1. **Write specific file paths and line numbers**
   - Not: "fix the bug in NPC system"
   - Yes: "fix race condition in npc-manager.js:42 - NPCPersonaDatabase undefined"

2. **Include the WHY**
   - Not: "add timeout"
   - Yes: "add 500ms timeout because DOM needs to render first"

3. **Note dependencies**
   - "Before fixing X, need to first update Y"

4. **Capture edge cases**
   - "Also handle case where user has no saved games"

---
