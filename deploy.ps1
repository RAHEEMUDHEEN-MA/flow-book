# Flow Book Deployment Script (PowerShell)
# This script builds the app and pushes the dist folder to the production branch

$ErrorActionPreference = "Stop"

Write-Host "Starting deployment process..." -ForegroundColor Cyan

# Configuration
$DEPLOY_BRANCH = "production"
$BUILD_DIR = "dist"

# Check if we're in a git repository
try {
    git rev-parse --git-dir | Out-Null
} catch {
    Write-Host "Error: Not a git repository" -ForegroundColor Red
    exit 1
}

# Save current branch
$CURRENT_BRANCH = git branch --show-current
Write-Host "Current branch: $CURRENT_BRANCH" -ForegroundColor Yellow

# Check for uncommitted changes
$status = git status -s
if ($status) {
    Write-Host "Warning: You have uncommitted changes" -ForegroundColor Yellow
    $response = Read-Host "Do you want to continue? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Build the application
Write-Host "Building application..." -ForegroundColor Cyan
npm run build

if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "Error: Build directory '$BUILD_DIR' not found" -ForegroundColor Red
    exit 1
}

Write-Host "Build completed successfully" -ForegroundColor Green

# Preview the build
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PREVIEW MODE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting preview server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C in the preview window when done reviewing" -ForegroundColor Yellow
Write-Host ""

# Start preview server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx serve -s $BUILD_DIR"

# Wait for user confirmation
Write-Host ""
$response = Read-Host "Preview the build in your browser. Continue with deployment? (y/n)"
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "Deployment cancelled by user" -ForegroundColor Red
    # Kill the preview server
    Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.CommandLine -like "*serve*"} | Stop-Process -Force 2>$null
    exit 1
}

Write-Host "Proceeding with deployment..." -ForegroundColor Green

# Create or switch to deployment branch
Write-Host "Switching to $DEPLOY_BRANCH branch..." -ForegroundColor Cyan

# CRITICAL: Backup .env file before switching branches
$envBackup = $null
if (Test-Path ".env") {
    $envBackup = Get-Content ".env" -Raw
    Write-Host "Backed up .env file" -ForegroundColor Yellow
}

# Check if production branch exists
$branchExists = git show-ref --verify --quiet "refs/heads/$DEPLOY_BRANCH"
if ($LASTEXITCODE -eq 0) {
    # Branch exists, switch to it
    git checkout $DEPLOY_BRANCH
} else {
    # Create orphan branch (no history)
    git checkout --orphan $DEPLOY_BRANCH
    git rm -rf . 2>$null
}

# Copy ONLY dist files to root (exclude .env and source files)
Write-Host "Copying build files..." -ForegroundColor Cyan
Copy-Item -Path "$BUILD_DIR\*" -Destination "." -Recurse -Force

# IMPORTANT: Remove the dist folder to avoid duplication
if (Test-Path $BUILD_DIR) {
    Remove-Item -Path $BUILD_DIR -Recurse -Force
    Write-Host "Removed dist folder to prevent duplication" -ForegroundColor Yellow
}

# Create .gitignore for production branch (CRITICAL: exclude .env)
Set-Content -Path ".gitignore" -Value "# Production branch - only built files`nnode_modules`n*.log`n.env`n.env.*`nsrc/`npackage.json`npackage-lock.json`ntsconfig.json`nvite.config.ts" -Encoding UTF8

# Remove .env if it exists (safety check)
if (Test-Path ".env") {
    Remove-Item ".env" -Force
    Write-Host "Removed .env file from production branch" -ForegroundColor Yellow
}

# Add and commit
Write-Host "Committing changes..." -ForegroundColor Cyan
git add -A
$COMMIT_MSG = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
try {
    git commit -m $COMMIT_MSG
} catch {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}

# Push to remote
Write-Host "Pushing to remote..." -ForegroundColor Cyan
git push origin $DEPLOY_BRANCH --force

Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host "Deployed from: $CURRENT_BRANCH" -ForegroundColor Yellow
Write-Host "Deploy branch: $DEPLOY_BRANCH" -ForegroundColor Yellow

# Return to original branch
Write-Host "Returning to $CURRENT_BRANCH..." -ForegroundColor Cyan
git checkout $CURRENT_BRANCH

# CRITICAL: Restore .env file
if ($envBackup) {
    Set-Content -Path ".env" -Value $envBackup -NoNewline
    Write-Host "Restored .env file" -ForegroundColor Green
}

Write-Host "Done! Your VPS should now pull from the '$DEPLOY_BRANCH' branch." -ForegroundColor Green
