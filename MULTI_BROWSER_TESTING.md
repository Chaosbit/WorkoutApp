# Multi-Browser Testing Guide

This document describes the multi-browser testing setup for the Workout Timer PWA, including desktop and mobile browser testing.

## Current Implementation Status

### ✅ Working Browsers
- **Chrome Desktop** - Full functionality ✓
- **Chrome Mobile** - Full PWA support with mobile testing ✓ 
- **Microsoft Edge** - Full functionality ✓

### 🔧 In Progress
- **Firefox Desktop** - Configuration ready, requires stable CI setup
- **Firefox Mobile** - Configuration ready

### 🍎 Manual Testing Required
- **Safari Desktop** - Limited PWA support (manual testing recommended)
- **Safari Mobile** - Limited PWA support (iOS restrictions)

## Current Test Results

```bash
# Chrome Desktop & Mobile: ✅ 11/11 tests passing
# Microsoft Edge: ✅ 11/11 tests passing  
# Firefox: 🔧 Configuration ready (CI setup needed)
```

## Quick Start

```bash
# Test all available browsers
./test-browsers.sh

# Test specific browsers
npm run test:e2e:chrome    # Chrome desktop
npm run test:e2e:mobile    # Chrome mobile simulation
npm run test:e2e:edge      # Microsoft Edge
npm run test:e2e:firefox   # Firefox (when available)
```

### Desktop Testing
```bash
# Run tests on all desktop browsers
npm run test:e2e:multi-browser

# Run tests on specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:edge
```

### Mobile Testing
```bash
# Run mobile-specific tests
npm run test:e2e:mobile

# Open mobile test runner
npm run test:e2e:mobile:open
```

### All Tests
```bash
# Run complete test suite (unit + all browsers)
npm run test:all
```

## Mobile Viewport Configurations

The mobile configuration (`cypress.mobile.config.js`) includes:

- **iPhone SE**: 375x667
- **iPhone 12**: 390x844
- **Samsung S20**: 360x800
- **iPad**: 768x1024

## Browser-Specific Features Tested

### PWA Features
- Service Worker registration
- Web App Manifest
- Offline functionality
- Installation prompts (where supported)

### Mobile-Specific Features
- Touch interactions
- Screen orientation changes
- Wake lock API (prevent screen sleep)
- Responsive design adaptation
- Mobile viewport handling

### Cross-Browser Compatibility
- Timer accuracy across browsers
- CSS compatibility
- JavaScript API support
- Local storage functionality

## CI/CD Integration

### GitHub Actions Workflows

#### Test Workflow (`cypress.yml`)
- Runs on all push/PR events
- Tests across Chrome, Firefox, and Edge
- Separate mobile testing matrix
- Artifacts uploaded for failures

#### Deploy Workflow (`deploy.yml`)
- Requires passing tests on Chrome and Firefox
- Multi-browser validation before deployment

### Matrix Strategy
```yaml
strategy:
  matrix:
    browser: [chrome, firefox, edge]
    include:
      - browser: chrome
        browser_name: Chrome
      - browser: firefox
        browser_name: Firefox
      - browser: edge
        browser_name: Microsoft Edge
```

## Manual Testing Checklist

### Mobile Browsers (Manual)
Since Safari mobile has limited CI support, manual testing is recommended:

1. **iOS Safari**
   - [ ] App loads correctly
   - [ ] Timer functionality works
   - [ ] PWA features (limited)
   - [ ] Touch interactions
   - [ ] Screen orientation

2. **Android Chrome**
   - [ ] PWA installation
   - [ ] Offline functionality
   - [ ] Push notifications (if implemented)
   - [ ] Screen wake lock

3. **Android Firefox**
   - [ ] Basic functionality
   - [ ] Local storage
   - [ ] Service worker

### Desktop Testing
All desktop browsers are covered by automated tests, but manual verification recommended for:
- PWA installation prompts
- Native OS integration
- Keyboard shortcuts
- Print functionality

## Browser-Specific Considerations

### Chrome
- Full PWA support
- Wake Lock API support
- Service Worker caching
- Installation prompts

### Firefox
- Good PWA support
- Limited on iOS (Apple restrictions)
- Service Worker support
- No wake lock API

### Edge
- Full PWA support (Chromium-based)
- Windows integration
- Similar features to Chrome

### Safari
- Limited PWA support
- No service worker on older versions
- iOS restrictions on PWA features
- Requires manual testing

## Troubleshooting

### Common Issues

1. **Firefox Installation on CI**
   ```bash
   sudo apt-get update
   sudo apt-get install -y firefox
   ```

2. **Edge Installation on CI**
   ```bash
   curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
   sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
   sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/microsoft.gpg] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list'
   sudo apt update
   sudo apt install -y microsoft-edge-stable
   ```

3. **Mobile Viewport Issues**
   - Ensure viewport meta tag is properly configured
   - Check CSS media queries
   - Verify touch event handling

### Debug Commands

```bash
# Run specific test file across browsers
npx cypress run --spec "cypress/e2e/mobile-browser.cy.js" --browser chrome
npx cypress run --spec "cypress/e2e/mobile-browser.cy.js" --browser firefox

# Open test runner for debugging
npm run test:e2e:open
npm run test:e2e:mobile:open

# Run tests with custom viewport
npx cypress run --config viewportWidth=375,viewportHeight=667
```

## Performance Considerations

### Mobile Testing
- Increased timeouts for slower mobile performance
- Touch event simulation
- Device pixel ratio handling

### CI Optimization
- Parallel browser testing
- Artifact collection only on failures
- Cached dependencies

## Future Enhancements

- [ ] Safari testing via BrowserStack/Sauce Labs
- [ ] Real device testing integration
- [ ] Performance testing across browsers
- [ ] Accessibility testing
- [ ] Visual regression testing