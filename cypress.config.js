const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'cypress/reports/junit.xml',
      toConsole: true,
    },
    setupNodeEvents(on, config) {
      // Mobile viewport configurations
      const mobileViewports = {
        'iphone-se': { width: 375, height: 667 },
        'iphone-12': { width: 390, height: 844 },
        'iphone-12-pro': { width: 390, height: 844 },
        'samsung-s20': { width: 360, height: 800 },
        'ipad': { width: 768, height: 1024 },
        'ipad-pro': { width: 1024, height: 1366 },
      };

      // Set viewport based on environment variable
      const viewport = config.env.viewport;
      if (viewport && mobileViewports[viewport]) {
        config.viewportWidth = mobileViewports[viewport].width;
        config.viewportHeight = mobileViewports[viewport].height;
      }

      // Configure for mobile testing
      if (config.env.mobile) {
        config.viewportWidth = 375;
        config.viewportHeight = 667;
        config.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      }

      // Browser-specific launch configurations
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          // Chrome-specific optimizations
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
        }

        if (browser.name === 'firefox') {
          // Firefox-specific configurations
          launchOptions.preferences['dom.webnotifications.enabled'] = false;
        }

        if (browser.name === 'edge') {
          // Edge-specific configurations (similar to Chrome since it's Chromium-based)
          launchOptions.args.push('--disable-dev-shm-usage');
        }

        return launchOptions;
      });

      return config;
    },
  },
  component: {
    devServer: {
      framework: 'vanilla',
      bundler: 'webpack',
    },
  },
});