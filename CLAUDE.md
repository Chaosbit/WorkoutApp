# Claude Context for Workout Timer PWA

## Project Overview
A Progressive Web App (PWA) for running markdown-based workouts with timers, designed for offline use on Android devices. The app parses workout files written in markdown format and provides timer functionality with play/pause/skip controls.

## Architecture
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **PWA Features**: Service Worker, Web App Manifest, offline caching
- **Hosting**: Azure Storage Static Website
- **Infrastructure**: Terraform for Azure deployment
- **File Format**: Markdown (.md) for workout definitions

## Key Files
- `index.html` - Main application interface with PWA meta tags
- `script.js` - Core application logic, workout parser, and timer functionality
- `styles.css` - Responsive CSS with mobile-first design
- `sw.js` - Service worker for offline caching
- `manifest.json` - PWA manifest for Android installation
- `deploy.sh` - Azure deployment automation script
- `terraform/` - Infrastructure as Code for Azure hosting

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
# Local development server
python -m http.server 8000

# Deploy to Azure (requires Azure CLI + Terraform)
./deploy.sh

# Manual Terraform deployment
cd terraform
terraform init
terraform apply

# Clean up Azure resources
terraform destroy
```

## Testing
- Test PWA installation on Android Chrome
- Verify offline functionality after first visit
- Test workout file parsing with various markdown formats
- Ensure timer accuracy and controls work properly

## Dependencies
- No npm dependencies - uses vanilla JavaScript
- Runtime: Modern browsers with PWA support
- Deployment: Azure CLI, Terraform

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
- Azure cloud hosting with Terraform

## Common Tasks
- **Add new exercise types**: Modify parsing logic in `script.js:WorkoutParser.parseMarkdown()`
- **Update UI styling**: Edit `styles.css` with mobile-first approach
- **Modify timer behavior**: Update `script.js:WorkoutTimer` class methods
- **Change deployment region**: Update `terraform/variables.tf` location variable
- **Add new file types**: Update service worker cache list in `sw.js`