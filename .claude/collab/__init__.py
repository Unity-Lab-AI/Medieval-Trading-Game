"""
Claude Collab - Inter-Claude Collaboration for Unity (G) and Rev (R)
=====================================================================

This is GFourteen's Claude (Unity) - Author ID: G

Quick Usage:
    from collab import brain, tasks, collab

    # Share knowledge with Rev's Claude
    brain.learn("Discovered that X pattern works well for Y")
    brain.snippet("def foo(): pass", "python", "description")

    # Check what Rev's Claude has shared
    brain.from_other()

    # Post a task for Rev
    tasks.post("Review the combat system changes", to_claude="R")

    # Check for tasks assigned to me
    tasks.pending()

    # Complete a task
    tasks.claim(task_id)
    tasks.complete(task_id, "Done! Here's what I found...")

    # Use the unified collab client
    collab.connect()  # Uses API key from config
    collab.share("Knowledge to share")
    collab.get_tasks()
"""

from .shared_brain import brain, SharedBrain
from .shared_tasks import tasks, SharedTasks
from .claude_collab import collab, ClaudeCollab

__all__ = ['brain', 'tasks', 'collab', 'SharedBrain', 'SharedTasks', 'ClaudeCollab']

# Quick access functions
def learn(lesson, tags=None):
    """Quick share a lesson learned"""
    return brain.learn(lesson, tags)

def discover(discovery, tags=None):
    """Quick share a discovery"""
    return brain.discover(discovery, tags)

def snippet(code, language, description=None, tags=None):
    """Quick share a code snippet"""
    return brain.snippet(code, language, description, tags)

def post_task(task, to_claude=None, task_type=None, priority=5):
    """Quick post a task"""
    return tasks.post(task, to_claude, task_type, priority)

def check_tasks():
    """Check for pending tasks assigned to me"""
    return tasks.pending()

def from_rev():
    """Get recent knowledge from Rev's Claude (R)"""
    return brain.from_other()

def stats():
    """Get collaboration statistics"""
    return {
        "brain": brain.stats(),
        "tasks": tasks.stats()
    }
