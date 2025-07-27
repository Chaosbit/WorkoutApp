#!/bin/bash

set -e

echo "Setting up Workout Timer PWA development environment..."

# Install additional packages
sudo apt-get update
sudo apt-get install -y sqlite3 python3 python3-pip

# Install global npm packages
sudo npm install -g serve http-server jest cypress

# Install Playwright dependencies
npx playwright install-deps

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Setup backend
if [ -d "backend" ]; then
    echo "Setting up .NET backend..."
    cd backend
    dotnet restore
    cd ..
fi

# Setup permissions
sudo chown -R vscode:vscode /workspaces/WorkoutApp

echo "Development environment setup complete!"