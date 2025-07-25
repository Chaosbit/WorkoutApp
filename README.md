# Workout Timer PWA

A Progressive Web App for running markdown-based workouts with timers, designed to work offline on Android devices.

## Features

- 📱 **PWA Support**: Install as a native app on Android
- 🔥 **Offline Mode**: Works without internet connection
- ⏱️ **Timer System**: Countdown timers for exercises and rest periods
- 📝 **Markdown Parser**: Load workouts from .md files
- 🏋️ **Sets Support**: Define multiple sets with automatic rest periods
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

Create `.md` files using the supported markdown syntax. For the complete format specification, see **[WORKOUT_FORMAT_SPEC.md](WORKOUT_FORMAT_SPEC.md)**.

### Quick Reference

```markdown
# Workout Title

## Exercise Name - 1:30
Optional exercise description

Rest - 0:15

## Another Exercise - 0:45
Rest - 0:30

## Exercise with Sets - 3 sets x 0:45 / 0:15
Exercise description here (optional)

## Rep-based Exercise - 15 reps
Complete at your own pace
```

**Supported formats**:
- **Timed exercises**: `Exercise Name - MM:SS`
- **Rep-based exercises**: `Exercise Name - N reps`
- **Sets notation**: `Exercise Name - N sets x MM:SS / MM:SS`
- **Rest periods**: `Rest - MM:SS`

For detailed syntax rules, validation requirements, examples, and best practices, see the full **[Workout Format Specification](WORKOUT_FORMAT_SPEC.md)**.

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



## Development & Roadmap

- **[ROADMAP.md](ROADMAP.md)** - Comprehensive development roadmap with prioritized features
- **[FEATURE_IDEAS.md](FEATURE_IDEAS.md)** - Categorized list of potential features and improvements
- **Contributing**: See roadmap documents for feature requests and contribution opportunities

## Files

- `index.html` - Main app interface
- `styles.css` - Responsive styling
- `script.js` - App logic and timer functionality
- `sw.js` - Service worker for offline support
- `manifest.json` - PWA configuration
- `sample-workout.md` - Example workout file
- `deploy-github-pages.sh` - GitHub Pages deployment script