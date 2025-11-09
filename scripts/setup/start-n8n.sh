#!/bin/bash

# Serenity Care AI - n8n Quick Start Script

echo "🚀 Starting n8n for Serenity Care AI..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    echo ""
    echo "Steps:"
    echo "1. Open Docker Desktop application"
    echo "2. Wait for it to fully start (green icon in menu bar)"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start n8n
echo "📦 Starting n8n container..."
docker compose up -d

# Wait a moment for container to start
sleep 3

# Check if n8n is running
if docker compose ps | grep -q "Up"; then
    echo "✅ n8n is running!"
    echo ""
    echo "🌐 Access n8n at: http://localhost:5678"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:5678 in your browser"
    echo "2. Create an n8n account (first time only)"
    echo "3. Follow the guide in ENABLE_N8N_AUTOMATION.md"
    echo ""
    echo "📖 Full guide: ENABLE_N8N_AUTOMATION.md"
else
    echo "❌ Failed to start n8n"
    echo ""
    echo "View logs:"
    docker compose logs n8n
fi
