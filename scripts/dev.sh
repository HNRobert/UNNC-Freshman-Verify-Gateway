#!/bin/bash

# Development environment setup
set -e

echo "🔧 Setting up development environment..."

echo "📦 Starting development environment with docker-compose..."
docker-compose -f docker-compose.dev.yml up -d

echo "🔍 Checking application health..."
sleep 10

# Wait for the application to be healthy
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Development environment is ready!"
        break
    else
        echo "⏳ Waiting for application to start... ($i/30)"
        sleep 2
    fi
done

echo "🎉 Development server is running at http://localhost:3000"
echo "📊 View logs with: docker-compose -f docker-compose.dev.yml logs -f"
echo "🛑 Stop with: docker-compose -f docker-compose.dev.yml down"
