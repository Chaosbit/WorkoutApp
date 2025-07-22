# Workout Timer PWA

A Progressive Web App for running markdown-based workouts with timers, designed to work offline on Android devices.

## Features

- 📱 **PWA Support**: Install as a native app on Android
- 🔥 **Offline Mode**: Works without internet connection
- ⏱️ **Timer System**: Countdown timers for exercises and rest periods
- 📝 **Markdown Parser**: Load workouts from .md files
- 🎮 **Full Controls**: Play, pause, skip, and reset functionality
- 📊 **Progress Tracking**: Visual progress bars and exercise lists
- 📱 **Mobile Optimized**: Responsive design for phones

## Installation on Android

### Method 1: Direct Installation
1. Open Chrome on your Android device
2. Navigate to the app URL (when hosted)
3. Tap the menu (⋮) → "Add to Home screen"
4. The app will install as a native app

### Method 2: Local Development
1. Start a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```
2. Open `http://localhost:8000` on your Android device
3. Follow Method 1 steps above

## Workout Format

Create `.md` files with this format:

```markdown
# Workout Title

## Exercise Name - 1:30
Rest - 0:15

## Another Exercise - 0:45
Rest - 0:30
```

Time format: `MM:SS` (e.g., `1:30` = 1 minute 30 seconds)

## Usage

1. Tap "Choose File" to load a workout
2. Use the timer controls:
   - ▶️ **Start**: Begin the workout
   - ⏸️ **Pause**: Pause the current timer
   - ⏭️ **Skip**: Skip to next exercise
   - 🔄 **Reset**: Reset to beginning

## Offline Features

- All app files cached for offline use
- Works without internet after first visit
- Workout files can be loaded from device storage
- Timer functionality works completely offline

## Deployment Options

### GitHub Pages (Recommended)

The app automatically deploys to GitHub Pages on every push to main/master branch.

**Automatic Deployment:**
1. Push changes to main/master branch
2. GitHub Actions runs tests and deploys automatically
3. App available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

**Manual Deployment:**
```bash
./deploy-github-pages.sh
```

**Setup GitHub Pages:**
1. Go to repository Settings → Pages
2. Source: "Deploy from a branch" 
3. Branch: "gh-pages" 
4. Folder: "/ (root)"

### Azure Deployment

Deploy to Azure Storage for private hosting:

**Prerequisites:**
- Azure CLI installed and logged in
- Terraform installed
- Azure subscription

**Deploy:**
```bash
./deploy.sh
```

This will:
1. Create Azure Storage Account with static website hosting
2. Upload all PWA files
3. Provide the website URL for installation

**Manual Steps:**
1. **Infrastructure**: 
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

2. **Upload Files**:
   ```bash
   # Get storage account name from Terraform output
   STORAGE_ACCOUNT=$(terraform output -raw storage_account_name)
   
   # Upload files
   az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'index.html' --file 'index.html' --content-type 'text/html'
   # ... repeat for other files
   ```

**Clean Up:**
```bash
cd terraform
terraform destroy
```

## Files

- `index.html` - Main app interface
- `styles.css` - Responsive styling
- `script.js` - App logic and timer functionality
- `sw.js` - Service worker for offline support
- `manifest.json` - PWA configuration
- `sample-workout.md` - Example workout file
- `deploy.sh` - Azure deployment script
- `terraform/` - Infrastructure as Code