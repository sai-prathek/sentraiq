#!/bin/bash

# SentraIQ Demo Recording Helper Script
# This script helps you prepare for recording and optionally automates screenshots

set -e

echo "🎬 SentraIQ Demo Recording Helper"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if services are running
echo "📋 Pre-flight Checks:"
echo ""

# Check backend
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 8000${NC}"
else
    echo -e "${RED}❌ Backend is NOT running!${NC}"
    echo "   Start it with: cd /Users/msp.raja/SentraIQ && source venv/bin/activate && uvicorn backend.main:app --reload"
    exit 1
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend is NOT running!${NC}"
    echo "   Start it with: cd /Users/msp.raja/SentraIQ/frontend/sentraiq-dashboard && npm run dev"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All services are ready!${NC}"
echo ""

# Recording options
echo "🎥 Recording Options:"
echo ""
echo "1. Manual Recording (Recommended)"
echo "   - Press Cmd+Shift+5 to start macOS screen recording"
echo "   - Follow the script in DEMO_VIDEO_SCRIPT.md"
echo ""
echo "2. Take Screenshots"
echo "   - Automatically capture key screens"
echo ""
echo "3. Open Demo Script"
echo "   - View detailed scene-by-scene guide"
echo ""
echo "4. Open Browser for Recording"
echo "   - Opens Chrome in clean state"
echo ""

read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Starting Manual Recording Mode:${NC}"
        echo ""
        echo "1. Press Cmd+Shift+5 now"
        echo "2. Select 'Record Entire Screen' or 'Record Selected Portion'"
        echo "3. Click the 'Record' button"
        echo "4. Open http://localhost:3000 in your browser"
        echo "5. Follow the script in DEMO_VIDEO_SCRIPT.md"
        echo "6. Press Cmd+Control+Esc to stop recording when done"
        echo ""
        echo "Opening script guide..."
        sleep 2
        open DEMO_VIDEO_SCRIPT.md
        ;;

    2)
        echo ""
        echo -e "${YELLOW}📸 Taking Screenshots...${NC}"
        echo ""

        # Create screenshots directory
        mkdir -p demo_screenshots

        echo "Opening frontend..."
        open http://localhost:3000
        sleep 3

        echo "Taking screenshot 1: Landing Page"
        screencapture -x demo_screenshots/01_landing_page.png
        sleep 1

        echo ""
        echo -e "${GREEN}Screenshots saved to: demo_screenshots/${NC}"
        echo ""
        echo "To take more screenshots manually:"
        echo "  - Cmd+Shift+4: Select area"
        echo "  - Cmd+Shift+3: Full screen"
        ;;

    3)
        echo ""
        echo "Opening demo script..."
        open DEMO_VIDEO_SCRIPT.md
        ;;

    4)
        echo ""
        echo "Opening browser in clean state..."

        # Try Chrome first, then Safari
        if [ -d "/Applications/Google Chrome.app" ]; then
            open -na "Google Chrome" --args --new-window --incognito http://localhost:3000
        else
            open -a Safari http://localhost:3000
        fi

        echo ""
        echo -e "${GREEN}Browser opened!${NC}"
        echo ""
        echo "Tips for recording:"
        echo "  - Press F11 for fullscreen (remove browser bars)"
        echo "  - Zoom to 110% for better text visibility (Cmd + +)"
        echo "  - Enable Do Not Disturb mode"
        ;;

    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎬 Ready to record! Good luck!${NC}"
echo ""
echo "Useful keyboard shortcuts:"
echo "  - Cmd+Shift+5: Screen recording menu (macOS)"
echo "  - Cmd+Control+Esc: Stop recording"
echo "  - Cmd+Shift+4: Screenshot (select area)"
echo ""
