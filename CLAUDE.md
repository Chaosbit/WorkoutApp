# Claude Context for Workout Timer PWA

## Project Overview
A Progressive Web App (PWA) for running markdown-based workouts with timers, designed for offline use on Android devices. The app parses workout files written in markdown format and provides timer functionality with play/pause/skip controls.

## Architecture
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (located in `frontend/` directory)
- **Backend**: .NET Core API (located in `backend/` directory)
- **PWA Features**: Service Worker, Web App Manifest, offline caching
- **Hosting**: GitHub Pages (frontend), Azure (backend)
- **File Format**: Markdown (.md) for workout definitions

## Directory Structure
```
├── frontend/              # Frontend PWA application (self-contained)
│   ├── index.html        # Main application interface
│   ├── js/               # JavaScript modules and components
│   │   ├── components/   # Web components (navigation, header, etc.)
│   │   └── *.js         # Application logic, parsers, managers
│   ├── material-design-enhanced.css
│   ├── sw.js            # Service worker
│   ├── manifest.json    # PWA manifest
│   ├── *.html           # Application pages
│   ├── package.json     # Frontend dependencies and scripts
│   ├── node_modules/    # Frontend dependencies (including @material/web)
│   ├── cypress/         # E2E tests
│   ├── tests/           # Unit tests
│   ├── jest.config.js   # Jest configuration
│   ├── babel.config.json # Babel configuration
│   └── cypress.*.js     # Cypress configurations
├── backend/              # .NET Core API
├── docs/                 # Documentation
└── deploy-github-pages.sh # Deployment script
```

## Key Files
- `frontend/index.html` - Main application interface with PWA meta tags
- `frontend/js/components/` - Web components for navigation and UI
- `frontend/material-design-enhanced.css` - Material Design 3 styling
- `frontend/sw.js` - Service worker for offline caching
- `frontend/manifest.json` - PWA manifest for Android installation
- `deploy-github-pages.sh` - GitHub Pages deployment automation script

## Workout File Format
Workouts are defined in markdown with this structure:
```markdown
# Workout Title

## Exercise Name - 1:30
Rest - 0:15

## Another Exercise - 0:45
Rest - 0:30
```
Time format: `MM:SS` (minutes:seconds)

## Development Commands
```bash
# Local development (from frontend directory)
cd frontend
npm start             # Serves frontend on port 8000
npm run dev           # Same as start

# Run tests (from frontend directory)
cd frontend
npm test              # Run unit tests
npm run test:e2e      # Run Cypress E2E tests
npm run test:e2e:open # Open Cypress test runner

# Deploy to GitHub Pages (from project root)
./deploy-github-pages.sh

# Backend development (from frontend directory)
npm run backend:api   # Start .NET API server
```

## Deployment

### GitHub Pages (Automatic)
- Push to main/master branch triggers automatic deployment
- GitHub Actions runs tests then deploys if they pass
- Available at: https://USERNAME.github.io/REPO_NAME

### GitHub Pages (Manual)
- Run `./deploy-github-pages.sh` to deploy manually
- Creates/updates gh-pages branch with built files

## Testing
- Test PWA installation on Android Chrome
- Verify offline functionality after first visit
- Test workout file parsing with various markdown formats
- Ensure timer accuracy and controls work properly

## Dependencies
- No npm dependencies - uses vanilla JavaScript
- Runtime: Modern browsers with PWA support

## Browser Support
- Chrome/Chromium (primary target for PWA features)
- Safari (limited PWA support)
- Firefox (basic functionality)

## Key Features
- Markdown workout parsing
- Timer with visual progress bars
- Offline functionality via Service Worker
- Android PWA installation
- Responsive mobile design
- GitHub Pages hosting

## Common Tasks
- **Add new exercise types**: Modify parsing logic in `frontend/js/workout-parser.js`
- **Update UI styling**: Edit `frontend/material-design-enhanced.css` with mobile-first approach
- **Modify timer behavior**: Update `frontend/js/timer-manager.js` class methods
- **Add new file types**: Update service worker cache list in `frontend/sw.js`
- **Create new web components**: Add to `frontend/js/components/` directory
- **Update navigation**: Modify `frontend/js/components/navigation-menu.js`