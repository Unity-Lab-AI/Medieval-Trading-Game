# Timestamp Retrieval Agent - Medieval Trading Game

Retrieves and stores the REAL system time for accurate timestamps and web searches.

---

## PURPOSE

Claude's internal knowledge cutoff is outdated. This agent ensures:
- All workflow files use ACTUAL current date/time
- Web searches use correct year/date context
- Documentation timestamps are accurate
- No more searching for "2023" when it's 2025+

---

## RETRIEVAL COMMAND

**Run this PowerShell command to get system time:**

```powershell
powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss (dddd)'"
```

**Alternative formats:**

```powershell
# Full timestamp with timezone
powershell -Command "Get-Date -Format 'yyyy-MM-ddTHH:mm:sszzz'"

# Date only
powershell -Command "Get-Date -Format 'yyyy-MM-dd'"

# Time only
powershell -Command "Get-Date -Format 'HH:mm:ss'"
```

---

## TIMESTAMP CONTEXT BLOCK

After retrieval, store this context for the session:

```
[TIMESTAMP CONTEXT]
Retrieved: [ACTUAL DATETIME FROM SYSTEM]
Year: [YEAR]
Month: [MONTH]
Day: [DAY]
Weekday: [DAY OF WEEK]
Time: [HH:MM:SS]
Status: LOCKED FOR SESSION
```

---

## USAGE IN WORKFLOW

### Phase 0.5: Timestamp Retrieval (Before Persona)

Insert BEFORE Phase 0 in workflow:

```
[PHASE 0.5: TIMESTAMP RETRIEVAL]

1. Execute: powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss (dddd)'"
2. Parse result
3. Store in context
4. Confirm retrieval

[TIMESTAMP LOCKED]
System time: [RESULT]
Using for: All file timestamps, web searches, documentation
```

---

## WEB SEARCH INSTRUCTIONS

When performing web searches, ALWAYS use the retrieved timestamp:

**CORRECT:**
```
Search: "Medieval Trading Game vanilla JS 2026"
Search: "browser game vanilla JS tutorial February 2026"
```

**INCORRECT:**
```
Search: "browser game development"  ← May get old results
Search: "vanilla JS game dev"  ← No date context
```

---

## FILE TIMESTAMP FORMAT

All generated workflow files should include:

```markdown
---
Generated: [YYYY-MM-DD HH:MM:SS]
System: Unity AI - Medieval Trading Division
Session: SESSION_[YYYYMMDD]_[HHMMSS]
---
```

---

## VALIDATION GATE 0.5: Timestamp Confirmed

```
[GATE 0.5: TIMESTAMP VALIDATION]
Command executed: YES/NO
System time retrieved: [DATETIME]
Year is current (2024+): YES/NO
Stored for session: YES/NO
Gate status: PASS/FAIL
```

**FAIL CONDITIONS:**
- Command failed to execute
- Retrieved date is clearly wrong (year < 2024)
- Failed to parse output

---

## INTEGRATION POINTS

| Location | Usage |
|----------|-------|
| ARCHITECTURE.md header | `Generated: [TIMESTAMP]` |
| SKILL_TREE.md header | `Generated: [TIMESTAMP]` |
| TODO.md header | `Generated: [TIMESTAMP]` |
| FINALIZED.md entries | `Completed: [TIMESTAMP]` |
| Web searches | Year/month context |

---

## SESSION TIMESTAMP ID

Generate a unique session ID:

```
SESSION_[YYYYMMDD]_[HHMMSS]
```

Example: `SESSION_20260109_143022`

Use this to track which session generated which files.

---

## QUICK REFERENCE

```
GET TIME:    powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"
STORE:       [TIMESTAMP CONTEXT] block
USE:         In all file headers, web searches
VALIDATE:    Gate 0.5 before proceeding
```

---

*Unity AI Lab - Medieval Trading Games Division - Real time, not Claude time.*
