#!/bin/bash

# Flow Book Deployment Script
# This script builds the app and pushes the dist folder to the production branch

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Configuration
DEPLOY_BRANCH="production"
BUILD_DIR="dist"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Error: Build directory '$BUILD_DIR' not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Create or switch to deployment branch
echo "🌿 Switching to $DEPLOY_BRANCH branch..."

# Check if production branch exists
if git show-ref --verify --quiet refs/heads/$DEPLOY_BRANCH; then
    # Branch exists, switch to it
    git checkout $DEPLOY_BRANCH
else
    # Create orphan branch (no history)
    git checkout --orphan $DEPLOY_BRANCH
    git rm -rf . 2>/dev/null || true
fi

# Copy ONLY dist files to root (exclude .env and source files)
echo "📦 Copying build files..."
cp -r $BUILD_DIR/* .
cp $BUILD_DIR/.* . 2>/dev/null || true

# Create .gitignore for production branch (CRITICAL: exclude .env)
cat > .gitignore << EOF
# Production branch - only built files
node_modules
*.log
.env
.env.*
src/
package.json
package-lock.json
tsconfig.json
vite.config.ts
EOF

# Remove .env if it exists (safety check)
if [ -f ".env" ]; then
    rm -f .env
    echo "⚠️  Removed .env file from production branch"
fi

# Add and commit
echo "💾 Committing changes..."
git add -A
COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

# Push to remote
echo "⬆️  Pushing to remote..."
git push origin $DEPLOY_BRANCH --force

echo "✅ Deployment successful!"
echo "📌 Deployed from: $CURRENT_BRANCH"
echo "📌 Deploy branch: $DEPLOY_BRANCH"

# Return to original branch
echo "🔄 Returning to $CURRENT_BRANCH..."
git checkout $CURRENT_BRANCH

echo "🎉 Done! Your VPS should now pull from the '$DEPLOY_BRANCH' branch."
