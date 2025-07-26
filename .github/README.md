# GitHub Copilot Environment Setup

This directory contains setup files for configuring the GitHub Copilot coding agent environment with all required software and dependencies for the WorkoutApp project.

## Files

### `copilot-setup.yml`
YAML configuration file that defines all software requirements, external dependencies, and setup commands needed for the GitHub Copilot environment. This file serves as documentation and can be used to configure automated setup steps.

### `copilot-setup.sh`
Executable bash script that performs the actual installation of all required software. This script should be run before the firewall is enabled in the GitHub Copilot environment.

## Quick Setup

To set up the environment, run:

```bash
./.github/copilot-setup.sh
```

## Software Requirements

The WorkoutApp project requires:

- **Node.js 20**: For running the development server and npm packages
- **Python 3.9+**: For the local HTTP server (`python3 -m http.server`)  
- **Chrome browser**: For Cypress end-to-end testing
- **npm packages**: Jest, Cypress, Babel, and other dev dependencies

## External Dependencies

The following external resources may be blocked by firewall and should be allowlisted:

- `fonts.googleapis.com` - Google Fonts CSS
- `fonts.gstatic.com` - Google Fonts assets  
- `redirector.gvt1.com` - Chrome/Chromium resources

## Usage in GitHub Copilot

1. Add the domains above to the [Copilot coding agent allowlist](https://github.com/Chaosbit/WorkoutApp/settings/copilot/coding_agent)
2. Run the setup script before firewall activation
3. Or configure GitHub Actions setup steps to install requirements

## Testing Verification

After setup, verify the installation:

```bash
# Unit tests (106 tests)
npm run test:unit

# E2E tests (119 tests) 
npm start &           # Start server
npm run test:e2e      # Run Cypress tests
```

## Troubleshooting

If tests fail due to blocked domains:
1. Check the Copilot agent settings to ensure domains are allowlisted
2. Verify all software is properly installed with `--version` commands
3. Ensure the local server is running on port 8000 for E2E tests

## Support

This setup configuration ensures the WorkoutApp development environment works correctly within GitHub Copilot's sandboxed environment while respecting firewall restrictions.