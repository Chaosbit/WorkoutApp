#!/bin/bash

# Deploy Workout Timer PWA to GitHub Pages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Workout Timer PWA to GitHub Pages...${NC}"

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a Git repository. Please run this from the project root.${NC}"
    exit 1
fi

# Check if we have uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Please commit them first.${NC}"
    echo "Uncommitted files:"
    git status --porcelain
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}📦 Current branch: ${CURRENT_BRANCH}${NC}"

# Create deployment directory
DEPLOY_DIR="./dist"
echo -e "${GREEN}📁 Creating deployment directory...${NC}"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy frontend files
echo -e "${GREEN}📋 Copying frontend files...${NC}"
if [ -d "frontend" ]; then
    cp -r frontend/* "$DEPLOY_DIR/"
else
    echo -e "${RED}❌ Frontend directory not found. Please make sure you're running this from the project root.${NC}"
    exit 1
fi

# Create 404.html for SPA routing
cp "$DEPLOY_DIR/index.html" "$DEPLOY_DIR/404.html"

echo -e "${GREEN}✅ Files copied to ${DEPLOY_DIR}${NC}"

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo -e "${GREEN}📂 Switching to gh-pages branch...${NC}"
    git checkout gh-pages
else
    echo -e "${GREEN}🌟 Creating gh-pages branch...${NC}"
    git checkout --orphan gh-pages
    git rm -rf .
fi

# Copy files from dist to root and clean up
echo -e "${GREEN}📤 Deploying files...${NC}"
cp -r "$DEPLOY_DIR"/* .
rm -rf "$DEPLOY_DIR"

# Add and commit files
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

# Push to GitHub Pages
echo -e "${GREEN}🚀 Pushing to GitHub Pages...${NC}"
git push origin gh-pages

# Return to original branch
echo -e "${GREEN}🔄 Returning to ${CURRENT_BRANCH} branch...${NC}"
git checkout "$CURRENT_BRANCH"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your PWA should be available at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME${NC}"
echo -e "${YELLOW}📝 Note: It may take a few minutes for GitHub Pages to update.${NC}"