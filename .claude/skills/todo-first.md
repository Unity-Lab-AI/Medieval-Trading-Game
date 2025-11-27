# 🖤 Think-First, Plan-First Workflow 🖤

## Purpose
Load persona → THINK → PLAN → Write to todo.md → THEN do the work → Update readmes

---

## THE WORKFLOW

```
USER REQUEST
    ↓
Step 1: LOAD PERSONA (silent)
    ↓
Step 2: THINK & ANALYZE (read code, understand scope)
    ↓
Step 3: PLAN (formulate approach, identify dependencies)
    ↓
Step 4: WRITE PLAN TO TODO.MD *BEFORE* CODING
    ↓
Step 5: DO THE WORK (following the plan)
    ↓
Step 6: UPDATE READMES (always)
    ↓
Step 7: MARK COMPLETE IN TODO.MD
    ↓
DONE 🖤
```

---

## THE GOLDEN RULE 🔥

**THINK → WRITE PLAN → THEN WORK**

On complex tasks you WILL lose context mid-work. The todo.md is your external brain.

Before writing ANY code:
1. Understand what needs to be done
2. Plan the approach
3. Write it down in todo.md with DETAILS
4. THEN start coding

---

## Step 1: Load Persona 🦇

Silently read:
- `TheCoder.md` - Unity persona
- `goth-coder.md` - Code comment style

---

## Step 2: THINK & ANALYZE 🧠

Before jumping into code:
- Read relevant code files
- Understand the current state
- Identify what needs to change
- Find dependencies and edge cases
- Look for things that might break

**Take your time here.** Rushing leads to half-baked solutions.

---

## Step 3: PLAN 📋

Formulate your approach:
- What files need to change?
- In what order? (dependencies matter)
- What edge cases need handling?
- What might break?
- What tests should pass after?

---

## Step 4: WRITE PLAN TO TODO.MD 📝

**BEFORE writing any code**, add to todo.md:

```markdown
### Current Task: [Brief description]

**Files to modify:**
- `src/js/something.js:42` - add validation
- `src/js/other.js:156` - update handler

**Order of operations:**
1. First update X because Y depends on it
2. Then modify Z
3. Finally test with command ABC

**Edge cases:**
- Handle case where user has no saves
- Check for undefined before accessing

**Context:**
- This is needed because [reason]
- Related to issue [reference]
```

The more detail you write, the less you'll lose when context fades.

---

## Step 5: DO THE WORK 💀

**Now** you can code:
- Follow your written plan
- Use TodoWrite tool to track progress
- Mark items in_progress as you work
- Write dark, twisted comments with proper emojis
- Mark items complete as you finish each

---

## Step 6: Update Readmes 📚

**ALWAYS check after code changes:**

| Change Type | Update This Readme |
|-------------|-------------------|
| Player-facing features | `GameplayReadme.md` |
| Architecture/code structure | `NerdReadme.md` |
| Debug commands | `DebuggerReadme.md` |

**Rules:**
- NO duplication - each readme has its own domain
- Use reference links between readmes
- Brief updates, not novels

---

## Step 7: Mark Complete ✅

Update todo.md with completion:

```markdown
## Completed
- [x] What was done - brief description

### Files Changed
- `filename.js` - what changed
- `SomeReadme.md` - if updated
```

---

## What NOT To Do 🩸

- ❌ Jump straight into coding
- ❌ Keep the plan only in your head
- ❌ Skip the thinking step
- ❌ Start work before writing to todo.md
- ❌ Skip readme updates
- ❌ Forget to mark items complete

---

## Context Preservation 🧠

Write to todo.md with DETAILS:

**BAD (you'll forget):**
```markdown
- [ ] Fix the NPC bug
```

**GOOD (future you will thank you):**
```markdown
- [ ] Fix NPC dialogue race condition
  - NPCPersonaDatabase loads after NPCManager sometimes
  - Files: npc-manager.js:42, npc-voice.js:156
  - Solution: Add event listener for 'personas-loaded'
  - Test: Run `listnpcs` command after fresh load
```

---

*"Think. Write it down. THEN hack the darkness. The void remembers nothing - your todo.md does."* - Unity 🖤
