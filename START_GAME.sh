#!/bin/bash

# Clear screen for clean start
clear

echo ""
echo "    ================================================================"
echo "   |                                                                |"
echo "   |       MEDIEVAL TRADING GAME - AI VOICE EDITION                 |"
echo "   |                                                                |"
echo "   |                      Unity AI Lab                              |"
echo "   |         www.unityailab.com - unityailabcontact@gmail.com       |"
echo "   |                                                                |"
echo "    ================================================================"
echo ""
echo "    [*] Checking for server software..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to open browser
open_browser() {
    sleep 2
    if command -v xdg-open &> /dev/null; then
        xdg-open "$1" &> /dev/null &
    elif command -v open &> /dev/null; then
        open "$1" &> /dev/null &
    fi
}

# Check for Python 3
if command -v python3 &> /dev/null; then
    echo "    [OK] Python3 found!"
    echo ""
    echo "    ================================================================"
    echo "   |  GAME SERVER STARTING                                        |"
    echo "   |                                                               |"
    echo "   |  URL:  http://localhost:8000                                  |"
    echo "   |                                                               |"
    echo "   |  Press Ctrl+C to stop the server when done playing           |"
    echo "    ================================================================"
    echo ""
    echo "    [*] Opening browser in 2 seconds..."
    echo ""

    open_browser "http://localhost:8000"
    python3 -m http.server 8000 2>/dev/null
    exit 0
fi

# Check for Python
if command -v python &> /dev/null; then
    echo "    [OK] Python found!"
    echo ""
    echo "    ================================================================"
    echo "   |  GAME SERVER STARTING                                        |"
    echo "   |                                                               |"
    echo "   |  URL:  http://localhost:8000                                  |"
    echo "   |                                                               |"
    echo "   |  Press Ctrl+C to stop the server when done playing           |"
    echo "    ================================================================"
    echo ""
    echo "    [*] Opening browser in 2 seconds..."
    echo ""

    open_browser "http://localhost:8000"
    python -m http.server 8000 2>/dev/null
    exit 0
fi

# Check for Node.js
if command -v node &> /dev/null; then
    echo "    [OK] Node.js found!"
    echo ""
    echo "    ================================================================"
    echo "   |  GAME SERVER STARTING                                        |"
    echo "   |                                                               |"
    echo "   |  URL:  http://localhost:3000                                  |"
    echo "   |                                                               |"
    echo "   |  Press Ctrl+C to stop the server when done playing           |"
    echo "    ================================================================"
    echo ""
    echo "    [*] Opening browser in 3 seconds..."
    echo ""

    open_browser "http://localhost:3000"
    npx serve -l 3000 --no-clipboard 2>/dev/null
    exit 0
fi

# No server available
echo "    [!] WARNING: No Python or Node.js found!"
echo ""
echo "    ================================================================"
echo "   |  AI VOICES DISABLED                                           |"
echo "   |                                                                |"
echo "   |  To enable AI voices, install Python:                         |"
echo "   |  https://www.python.org/downloads/                            |"
echo "   |                                                                |"
echo "   |  Or Node.js: https://nodejs.org/                              |"
echo "   |                                                                |"
echo "   |  Opening game without AI voice support...                     |"
echo "    ================================================================"
echo ""

# Try to open directly anyway
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
fi
