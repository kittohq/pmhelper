#!/bin/bash

# PM Helper AI Agents Deployment Script

set -e  # Exit on any error

echo "🚀 Deploying PM Helper AI Agents..."

# Check if we're in the agents directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: Please run this script from the agents directory"
    exit 1
fi

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
echo "   Python version: $python_version"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check environment configuration
echo "⚙️  Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "   Please edit .env with your OpenAI API key and other settings"
fi

# Validate templates directory
echo "📋 Validating templates..."
if [ ! -d "../backend/templates" ]; then
    echo "❌ Error: Templates directory not found at ../backend/templates"
    echo "   Please ensure you're running this from the correct location"
    exit 1
fi

template_count=$(ls -1 ../backend/templates/*-prd.json 2>/dev/null | wc -l)
echo "   Found $template_count PRD templates"

if [ $template_count -eq 0 ]; then
    echo "❌ Error: No PRD templates found"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
python test_agents.py

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix issues before deploying."
    exit 1
fi

# Start the server
echo "🌟 Starting AI Agents server..."
echo "   Server will be available at: http://localhost:8000"
echo "   API documentation: http://localhost:8000/docs"
echo "   Health check: http://localhost:8000/health"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

# Run the server
python main.py
