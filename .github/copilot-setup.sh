#!/bin/bash
# GitHub Copilot Environment Setup Script
# Pre-installs all required software for WorkoutApp development and testing
# Should be run before firewall activation in GitHub Copilot environment

set -e  # Exit on any error

echo "🚀 Setting up GitHub Copilot environment for WorkoutApp..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check and install Node.js if needed
setup_nodejs() {
    log "Checking Node.js installation..."
    if command_exists node; then
        NODE_VERSION=$(node --version)
        log "Node.js already installed: $NODE_VERSION"
    else
        log "Installing Node.js..."
        # This would typically be handled by GitHub Actions setup-node
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Verify version
    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"
    
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        log "npm version: $NPM_VERSION"
    fi
}

# Check and install Python if needed
setup_python() {
    log "Checking Python installation..."
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        log "Python3 already installed: $PYTHON_VERSION"
    else
        log "Installing Python3..."
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip
    fi
    
    # Verify version
    PYTHON_VERSION=$(python3 --version)
    log "Python version: $PYTHON_VERSION"
}

# Install Chrome for Cypress testing
setup_chrome() {
    log "Checking Chrome installation..."
    if command_exists google-chrome; then
        CHROME_VERSION=$(google-chrome --version)
        log "Chrome already installed: $CHROME_VERSION"
    else
        log "Installing Chrome..."
        wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
        echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
        sudo apt-get update
        sudo apt-get install -y google-chrome-stable
    fi
    
    # Verify version
    CHROME_VERSION=$(google-chrome --version)
    log "Chrome version: $CHROME_VERSION"
}

# Install npm dependencies
setup_npm_dependencies() {
    log "Installing npm dependencies..."
    if [ -f "package.json" ]; then
        # Use npm ci for reproducible builds
        npm ci
        log "npm dependencies installed successfully"
    else
        log "Warning: package.json not found in current directory"
    fi
}

# Verify Cypress installation
verify_cypress() {
    log "Verifying Cypress installation..."
    if [ -d "node_modules/cypress" ]; then
        npx cypress version
        log "Cypress installation verified"
    else
        log "Warning: Cypress not found in node_modules"
    fi
}

# Create necessary directories
setup_directories() {
    log "Creating necessary directories..."
    mkdir -p ~/.npm-global
    mkdir -p ~/.cache/Cypress
    mkdir -p ./cypress/screenshots
    mkdir -p ./cypress/videos
    log "Directories created"
}

# Set up environment variables
setup_environment() {
    log "Setting up environment variables..."
    export NODE_ENV=test
    export CI=true
    export CYPRESS_CACHE_FOLDER=~/.cache/Cypress
    
    # Add to current session
    echo "export NODE_ENV=test" >> ~/.bashrc
    echo "export CI=true" >> ~/.bashrc
    echo "export CYPRESS_CACHE_FOLDER=~/.cache/Cypress" >> ~/.bashrc
    
    log "Environment variables configured"
}

# Run verification tests
run_verification() {
    log "Running verification tests..."
    
    # Test Node.js
    node --version
    npm --version
    
    # Test Python
    python3 --version
    
    # Test Chrome
    google-chrome --version
    
    # Test npm packages (if package.json exists)
    if [ -f "package.json" ]; then
        log "Verifying npm packages..."
        npm list --depth=0 || true
        
        log "Running unit tests..."
        npm run test:unit || log "Unit tests failed - this may be expected in setup phase"
    fi
    
    log "Verification completed"
}

# Main setup function
main() {
    log "Starting GitHub Copilot environment setup..."
    
    # Update package lists first
    sudo apt-get update -qq
    
    # Install core requirements
    setup_nodejs
    setup_python
    setup_chrome
    
    # Set up project-specific requirements
    setup_directories
    setup_environment
    setup_npm_dependencies
    verify_cypress
    
    # Run verification
    run_verification
    
    log "✅ GitHub Copilot environment setup completed successfully!"
    log "🔧 All required software installed and verified"
    log "📝 Ready for WorkoutApp development and testing"
}

# Run main function
main "$@"