#!/usr/bin/env python3
"""
Unity Supervisor Sync - All-in-one supervisor operations for ClaudeColab
=========================================================================

Usage:
    from supervisor_sync import supervisor

    # Start session (connects, syncs, announces)
    supervisor.start_session()

    # Check team status
    supervisor.team_status()

    # Assign task to worker
    supervisor.assign_task("TASK-001: Do something", to_worker="BLACK", priority=5)

    # Announce a push
    supervisor.announce_push("BLACK", ["file1.js", "file2.js"])

    # Lock/unlock work areas
    supervisor.lock_area("src/services/npc-voice.js", "BLACK")
    supervisor.unlock_area("src/services/npc-voice.js")

    # End session
    supervisor.end_session()
"""

import sys
import os
import subprocess
from datetime import datetime

# Add collab to path
sys.path.insert(0, os.path.dirname(__file__))
from claude_collab import colab

# Team roster
TEAM_ROSTER = ['BLACK', 'R', 'INTOLERANT', 'TKINTER', 'OLLAMA', 'TheREV', 'Unity']


class SupervisorSync:
    """Unity Supervisor coordination tools"""

    def __init__(self):
        self.connected = False
        self.session_start = None
        self.active_locks = {}  # area -> worker mapping

    def connect(self):
        """Connect to ClaudeColab as Unity supervisor"""
        result = colab.connect()
        if result:
            colab.set_project('medieval-game')
            self.connected = True
            print(f"[SUPERVISOR] Connected as {colab.claude_name}")
        return result

    def start_session(self):
        """Full session startup - connect, sync, announce"""
        print("\n" + "="*60)
        print("[UNITY SUPERVISOR] SESSION START")
        print("="*60)

        # Connect
        if not self.connect():
            print("[ERROR] Failed to connect to ClaudeColab")
            return False

        self.session_start = datetime.now()

        # Git pull
        print("\n[GIT SYNC]")
        try:
            result = subprocess.run(['git', 'pull', 'origin', 'main'],
                                  capture_output=True, text=True, timeout=30)
            print(f"  {result.stdout.strip() or 'Already up to date'}")
            if result.returncode != 0 and result.stderr:
                print(f"  Warning: {result.stderr.strip()}")
        except Exception as e:
            print(f"  Git pull error: {e}")

        # Check team status
        self.team_status()

        # Announce presence
        colab.chat("Unity supervisor online - checking in")
        colab.log_work("session_start", {"time": self.session_start.isoformat()})

        print("\n" + "="*60)
        print("[SESSION READY]")
        print("="*60)
        return True

    def team_status(self):
        """Get and display full team status"""
        print("\n[TEAM STATUS]")

        # Get collab status
        status = colab.status()
        print(f"  Connected as: {status.get('claude_name')}")
        print(f"  Knowledge entries: {status.get('knowledge_count')}")
        print(f"  Pending tasks: {status.get('pending_tasks')}")
        print(f"  Total tasks: {status.get('total_tasks')}")

        # Get pending tasks
        pending = colab.get_tasks('pending')
        if pending:
            print(f"\n[PENDING TASKS] ({len(pending)})")
            for t in pending[:10]:
                priority = t.get('priority', 5)
                task = t.get('task', '')[:60]
                to_claude = t.get('to_claude', 'anyone')
                print(f"    [P{priority}] -> {to_claude}: {task}...")

        # Get claimed tasks
        claimed = colab.get_tasks('claimed')
        if claimed:
            print(f"\n[IN PROGRESS] ({len(claimed)})")
            for t in claimed[:10]:
                task = t.get('task', '')[:60]
                worker = t.get('claimed_by', 'unknown')
                print(f"    [{worker}] {task}...")

        # Get recent chat
        chat = colab.get_chat(5)
        if chat:
            print(f"\n[RECENT CHAT]")
            for msg in chat:
                author = msg.get('author', 'unknown')
                message = msg.get('message', '')[:50]
                print(f"    [{author}] {message}...")

        return status

    def assign_task(self, task, to_worker=None, priority=5):
        """Assign a task to a worker"""
        result = colab.post_task(task, to_claude=to_worker, priority=priority)
        if result:
            target = to_worker or "anyone"
            colab.chat(f"@{target} assigned: {task[:50]}...")
            print(f"[ASSIGNED] P{priority} -> {target}: {task[:50]}...")
        return result

    def assign_from_todo(self, task_id, description, to_worker=None, priority=5):
        """Assign a task from TODO.md to a worker"""
        task = f"{task_id}: {description}"
        return self.assign_task(task, to_worker=to_worker, priority=priority)

    def announce_push(self, worker, files):
        """Announce a push from a worker"""
        files_str = ", ".join(files[:5])
        if len(files) > 5:
            files_str += f" (+{len(files)-5} more)"

        colab.chat(f"@all PULL NOW - {worker} just pushed. Files: {files_str}")
        colab.share(f"PUSH: {worker} pushed {len(files)} files - {files_str}",
                   tags=['sync', 'push', 'medieval-game'])
        print(f"[ANNOUNCED] {worker} push: {files_str}")

    def lock_area(self, area, worker):
        """Lock a work area for a specific worker"""
        self.active_locks[area] = worker
        colab.share(f"LOCKED: {area} -> {worker}", tags=['lock', 'active'])
        print(f"[LOCKED] {area} -> {worker}")

    def unlock_area(self, area):
        """Unlock a work area"""
        if area in self.active_locks:
            worker = self.active_locks.pop(area)
            colab.share(f"UNLOCKED: {area} (was {worker})", tags=['unlock', 'released'])
            print(f"[UNLOCKED] {area} (was {worker})")

    def check_overlaps(self, files, worker):
        """Check if proposed work overlaps with locked areas"""
        overlaps = []
        for f in files:
            for area, locked_by in self.active_locks.items():
                if f.startswith(area) or area.startswith(f):
                    if locked_by != worker:
                        overlaps.append((f, locked_by))

        if overlaps:
            print(f"[OVERLAP WARNING] {worker} wants to touch:")
            for f, locked_by in overlaps:
                print(f"    {f} - locked by {locked_by}")
        return overlaps

    def coordinate_push(self, worker, files):
        """Coordinate a push request from a worker"""
        print(f"\n[PUSH REQUEST] {worker}")
        print(f"  Files: {files}")

        # Check overlaps
        overlaps = self.check_overlaps(files, worker)
        if overlaps:
            print(f"[BLOCKED] Cannot push - overlapping areas")
            colab.chat(f"@{worker} HOLD - files overlap with other workers")
            return False

        # Approve push
        colab.chat(f"@{worker} approved to push. @all standby for pull")
        print(f"[APPROVED] {worker} may push")
        return True

    def sync_after_push(self, worker):
        """Sync local repo after a worker pushes"""
        print(f"\n[SYNCING] After {worker} push")

        # Announce
        self.announce_push(worker, ["(pulling latest)"])

        # Git pull
        try:
            result = subprocess.run(['git', 'pull', 'origin', 'main'],
                                  capture_output=True, text=True, timeout=30)
            print(f"  {result.stdout.strip() or 'Already up to date'}")
            return result.returncode == 0
        except Exception as e:
            print(f"  Git pull error: {e}")
            return False

    def share_knowledge(self, content, tags=None):
        """Share knowledge to the brain"""
        all_tags = ['medieval-game', 'supervisor'] + (tags or [])
        result = colab.share(content, tags=all_tags)
        if result:
            print(f"[SHARED] {content[:50]}...")
        return result

    def team_rollcall(self):
        """Post rollcall to all team members"""
        print("\n[ROLLCALL]")
        colab.chat("*Unity Supervisor* ROLLCALL - All workers sound off!")

        for worker in TEAM_ROSTER:
            if worker != 'Unity':
                colab.post_task(f"ROLLCALL: {worker} check in when you see this",
                              to_claude=worker, priority=10)
                print(f"  Posted to {worker}")

    def end_session(self, summary="Session complete"):
        """End supervisor session"""
        print("\n" + "="*60)
        print("[SESSION END]")
        print("="*60)

        # Calculate session duration
        duration = "unknown"
        if self.session_start:
            elapsed = datetime.now() - self.session_start
            duration = str(elapsed).split('.')[0]

        # Announce
        colab.chat(f"Unity supervisor offline - {summary}")
        colab.log_work("session_end", {
            "summary": summary,
            "duration": duration
        })

        # Git status
        try:
            result = subprocess.run(['git', 'status', '--short'],
                                  capture_output=True, text=True, timeout=10)
            if result.stdout.strip():
                print(f"\n[UNCOMMITTED CHANGES]")
                print(result.stdout)
        except:
            pass

        print(f"\nSession duration: {duration}")
        print("="*60)

    def __repr__(self):
        if self.connected:
            return f"<SupervisorSync connected, {len(self.active_locks)} locks>"
        return "<SupervisorSync disconnected>"


# Singleton instance
supervisor = SupervisorSync()


if __name__ == "__main__":
    # Test supervisor functions
    supervisor.start_session()
