#!/bin/bash

# SentralQ Setup Script

echo "🚀 Setting up SentralQ Hybrid Evidence Lakehouse..."

# Check Python version (macOS compatible)
python_version=$(python3 --version 2>&1 | sed 's/Python //' | cut -d. -f1,2)
required_version="3.9"

# Simple version comparison for macOS
version_check=$(echo "$python_version $required_version" | awk '{if ($1 >= $2) print "ok"}')

if [ "$version_check" != "ok" ]; then
    echo "❌ Python 3.9 or higher is required. Found: $python_version"
    exit 1
fi

echo "✅ Python version check passed: $python_version"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration (especially OPENAI_API_KEY if using AI features)"
fi

# Create necessary directories
echo "📁 Creating storage directories..."
mkdir -p storage/raw_logs
mkdir -p storage/raw_documents
mkdir -p storage/assurance_packs
mkdir -p data/sample_logs
mkdir -p data/sample_policies
mkdir -p frontend/static/css
mkdir -p frontend/static/js
mkdir -p frontend/templates

# Initialize database
echo "🗄️  Initializing database..."
python -m backend.database

# Generate sample data
echo "📊 Generating sample data..."
python scripts/generate_sample_data.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Review and update .env file if needed"
echo "2. Start the application: ./scripts/run.sh"
echo "3. Open browser: http://localhost:8000"
echo ""
