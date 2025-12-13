"""
Task Handlers - Process tasks from the shared task queue
=========================================================

Handlers for various task types. Register with:
    from task_handlers import register_all_handlers
    register_all_handlers()

Then run:
    from shared_tasks import tasks
    tasks.poll(interval=60, callback=notify_discord)
"""

import json
import requests
from shared_tasks import tasks


# Ollama endpoint (local)
OLLAMA_URL = "http://localhost:11434/api/generate"


def ollama_generate(prompt, model="codellama:latest"):
    """Send prompt to local Ollama and get response."""
    try:
        resp = requests.post(OLLAMA_URL, json={
            "model": model,
            "prompt": prompt,
            "stream": False
        }, timeout=120)

        if resp.status_code == 200:
            return resp.json().get("response", "")
        return f"Error: {resp.status_code}"
    except Exception as e:
        return f"Error: {str(e)}"


def code_review_handler(task):
    """Review code using Ollama CodeLlama.

    Note: Use full model names like "codellama:latest" not just "codellama".

    Task format:
        {
            "task": "Review this Python function",
            "task_type": "code_review",
            "payload": {
                "code": "def foo(): ...",
                "language": "python",
                "focus": "security"  # optional: security, performance, style, all
            }
        }

    Returns JSON with scores and feedback.
    """
    # Extract payload - might be in task description or separate field
    task_text = task.get("task", "")

    # Try to parse payload from task text if it's JSON
    try:
        if "{" in task_text:
            # Extract JSON from task text
            json_start = task_text.find("{")
            payload = json.loads(task_text[json_start:])
        else:
            payload = {"code": task_text}
    except:
        payload = {"code": task_text}

    code = payload.get("code", task_text)
    language = payload.get("language", "python")
    focus = payload.get("focus", "all")

    # Build prompt for CodeLlama
    prompt = f"""You are a code reviewer. Review this {language} code for {focus} issues.

CODE:
```{language}
{code}
```

Return your review as JSON with this exact structure:
{{
    "overall": 7,
    "issues": [
        {{"line": 1, "severity": "high", "issue": "description"}}
    ],
    "suggestions": ["suggestion 1", "suggestion 2"],
    "summary": "Brief summary of code quality"
}}

Only return the JSON, no other text."""

    # Call Ollama
    response = ollama_generate(prompt, model="codellama:latest")

    # Try to parse JSON from response
    try:
        # Find JSON in response
        json_start = response.find("{")
        json_end = response.rfind("}") + 1
        if json_start >= 0 and json_end > json_start:
            result = json.loads(response[json_start:json_end])
            return json.dumps(result, indent=2)
    except:
        pass

    # If JSON parsing failed, return raw response
    return f"Review:\n{response}"


def echo_handler(task):
    """Simple echo handler for testing."""
    return f"Echo: {task.get('task', 'no task')}"


def research_handler(task):
    """Research handler using Ollama for general questions."""
    task_text = task.get("task", "")

    prompt = f"""Research this topic and provide a concise summary:

{task_text}

Provide:
1. Key points (3-5 bullets)
2. Relevant context
3. Recommendations if applicable"""

    response = ollama_generate(prompt, model="dolphin-mistral:7b")
    return response


def summarize_handler(task):
    """Summarize text using Ollama."""
    task_text = task.get("task", "")

    prompt = f"""Summarize this text in 2-3 sentences:

{task_text}"""

    response = ollama_generate(prompt, model="dolphin-mistral:7b")
    return response


def register_all_handlers():
    """Register all handlers with the task queue."""
    tasks.register_handler("code_review", code_review_handler)
    tasks.register_handler("echo", echo_handler)
    tasks.register_handler("research", research_handler)
    tasks.register_handler("summarize", summarize_handler)
    tasks.register_handler("default", echo_handler)  # Fallback
    print("All task handlers registered!")


if __name__ == "__main__":
    # Test the handlers
    print("Testing task handlers...")

    # Register handlers
    register_all_handlers()

    # Test code review
    test_task = {
        "task": '{"code": "def add(a, b): return a + b", "language": "python"}',
        "task_type": "code_review"
    }

    print("\nTesting code_review handler:")
    result = code_review_handler(test_task)
    print(result[:500])
