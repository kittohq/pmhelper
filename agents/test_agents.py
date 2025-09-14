#!/usr/bin/env python3
"""
Simple test script for AI agents functionality.
Run this to verify the agents are working correctly.
"""

import asyncio
import os
import sys
from pathlib import Path
import traceback

# Add the agents directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from pmagents import PRDAgent
from config import AgentConfig
from tools import TemplateLoader, PRDValidator

async def test_template_loader():
    """Test template loading functionality."""
    print("🧪 Testing Template Loader...")
    
    loader = TemplateLoader()
    
    # Test getting available templates
    templates = loader.get_available_templates()
    print(f"✅ Available templates: {templates}")
    
    # Test loading a specific template
    if "lean" in templates:
        template_info = loader.get_template_info("lean")
        print(f"✅ Lean template info: {template_info['name']}")
        print(f"   Sections: {template_info['sections']}")
    
    return len(templates) > 0

async def test_validator():
    """Test PRD validation functionality."""
    print("\n🧪 Testing PRD Validator...")
    
    validator = PRDValidator()
    
    # Test with underspecified input
    result1 = validator.validate_user_input("Build an app")
    print(f"✅ Underspecified input validation: {result1['is_sufficient']}")
    print(f"   Missing info: {result1['missing_info']}")
    
    # Test with more complete input
    complete_input = """
    I want to build a fitness tracking mobile app called FitTracker.
    Target users: fitness enthusiasts and beginners who want to track workouts.
    Main features: workout logging, progress tracking, goal setting.
    Success metric: 10,000 active users in 6 months.
    """
    
    result2 = validator.validate_user_input(complete_input)
    print(f"✅ Complete input validation: {result2['is_sufficient']}")
    print(f"   Completeness score: {result2['completeness_score']:.2f}")
    
    return True

async def test_agent_basic():
    """Test basic agent functionality without OpenAI."""
    print("\n🧪 Testing Agent Basic Functions...")
    
    try:
        agent = PRDAgent()
        
        # Test template methods
        templates = agent.get_available_templates()
        print(f"✅ Agent can get templates: {templates}")
        
        if templates:
            template_info = agent.get_template_info(templates[0])
            print(f"✅ Agent can get template info: {template_info['name']}")
        
        return True
        
    except Exception as e:
        traceback.print_exc()
        print(f"❌ Agent basic test failed: {e}")
        return False

async def test_agent_chat():
    """Test agent chat functionality (requires OpenAI API key)."""
    print("\n🧪 Testing Agent Chat (requires OpenAI API key)...")
    
    if not AgentConfig.OPENAI_API_KEY:
        print("⚠️  Skipping chat test - no OpenAI API key configured")
        return True
    
    try:
        agent = PRDAgent()
        
        # Test with a simple request
        response = await agent.chat(
            user_message="I want to build a simple todo app for personal use",
            template_type="lean"
        )
        
        print(f"✅ Agent chat response type: {response.get('type', 'unknown')}")
        print(f"   Response length: {len(response.get('content', ''))}")
        
        # Test conversation history
        history = agent.get_conversation_history()
        print(f"✅ Conversation history: {len(history)} messages")
        
        return True
        
    except Exception as e:
        traceback.print_exc()
        print(f"❌ Agent chat test failed: {e}")
        return False

async def test_api_server():
    """Test if the API server can be imported and configured."""
    print("\n🧪 Testing API Server Configuration...")
    
    try:
        # Import main components
        from main import app
        print("✅ FastAPI app can be imported")
        
        # Check if we can access the global agent
        from main import prd_agent
        print("✅ Global PRD agent is accessible")
        
        return True
        
    except Exception as e:
        print(f"❌ API server test failed: {e}")
        return False

async def main():
    """Run all tests."""
    print("🚀 Starting AI Agents Test Suite\n")
    
    # Check configuration
    print("📋 Configuration Check:")
    print(f"   OpenAI API Key: {'✅ Set' if AgentConfig.OPENAI_API_KEY else '❌ Not set'}")
    print(f"   OpenAI Model: {AgentConfig.OPENAI_MODEL}")
    print(f"   Templates Path: {AgentConfig.TEMPLATES_PATH}")
    
    # Run tests
    tests = [
        ("Template Loader", test_template_loader),
        ("PRD Validator", test_validator),
        ("Agent Basic", test_agent_basic),
        ("Agent Chat", test_agent_chat),
        ("API Server", test_api_server),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n📊 Test Results Summary:")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Agents are ready to use.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run tests
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
