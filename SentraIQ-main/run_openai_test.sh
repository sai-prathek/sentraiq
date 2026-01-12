#!/bin/bash
# Load .env and run OpenAI test

if [ -f .env ]; then
    # Export environment variables from .env file
    set -a
    source .env
    set +a
    echo "✅ Loaded environment variables from .env"
else
    echo "⚠️  No .env file found - test will use fallback parser"
fi

# Run the test
python3 test_openai_integration.py
