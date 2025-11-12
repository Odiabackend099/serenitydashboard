#!/usr/bin/env python3
"""
Test Groq API key validity and list available models
"""
import requests
import json
import os
import sys

# Get API key from environment variable or command line argument
API_KEY = os.getenv('GROQ_API_KEY')
if not API_KEY and len(sys.argv) > 1:
    API_KEY = sys.argv[1]

if not API_KEY:
    print("ERROR: GROQ_API_KEY environment variable not set")
    print("Usage: GROQ_API_KEY='your-key' python3 test-groq-api.py")
    print("   or: python3 test-groq-api.py 'your-key'")
    sys.exit(1)

BASE_URL = "https://api.groq.com/openai/v1"

print("=" * 60)
print("GROQ API KEY VALIDATION TEST")
print("=" * 60)
print()

# Test 1: List available models
print("Test 1: Listing available models...")
print("-" * 60)
response = requests.get(
    f"{BASE_URL}/models",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
)

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print("✅ API key is VALID")
    print("\nAvailable models:")
    models = response.json()
    for model in models.get('data', []):
        print(f"  - {model.get('id')}")
else:
    print("❌ API key test FAILED")
    print(f"Error: {response.text}")

print()
print("=" * 60)

# Test 2: Simple chat completion
print("Test 2: Testing chat completion with llama-3.1-70b-versatile...")
print("-" * 60)

response = requests.post(
    f"{BASE_URL}/chat/completions",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "llama-3.1-70b-versatile",
        "messages": [
            {"role": "user", "content": "Say 'test successful' if you can read this"}
        ],
        "temperature": 0.7,
        "max_tokens": 50
    }
)

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print("✅ Chat completion SUCCESSFUL")
    result = response.json()
    print(f"\nResponse: {result['choices'][0]['message']['content']}")
else:
    print("❌ Chat completion FAILED")
    print(f"Error: {response.text}")

print()
print("=" * 60)

# Test 3: Chat completion with tools (appointment booking scenario)
print("Test 3: Testing chat completion with tools...")
print("-" * 60)

response = requests.post(
    f"{BASE_URL}/chat/completions",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "llama-3.1-70b-versatile",
        "messages": [
            {"role": "user", "content": "I need to book an appointment for tomorrow at 2pm"}
        ],
        "tools": [
            {
                "type": "function",
                "function": {
                    "name": "trigger_automation",
                    "description": "Trigger an n8n automation workflow",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "action": {"type": "string"},
                            "payload": {"type": "object"}
                        },
                        "required": ["action", "payload"]
                    }
                }
            }
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }
)

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print("✅ Chat completion with tools SUCCESSFUL")
    result = response.json()
    print(f"\nResponse: {json.dumps(result, indent=2)}")
else:
    print("❌ Chat completion with tools FAILED")
    print(f"Error: {response.text}")

print()
print("=" * 60)
print("TEST COMPLETE")
print("=" * 60)
