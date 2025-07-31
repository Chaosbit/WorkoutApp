const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 375,
    viewportHeight: 667,
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'cypress/reports/junit-mobile.xml',
      toConsole: true,
    },
    setupNodeEvents(on, config) {
      // Mobile-specific configurations
      config.defaultCommandTimeout = 8000; // Mobile devices might be slower
      config.pageLoadTimeout = 10000;
      
      // Touch events simulation
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Enable touch events and mobile emulation
          launchOptions.args.push('--touch-events=enabled');
          launchOptions.args.push('--enable-features=TouchpadAndWheelScrollLatching');
          launchOptions.args.push('--force-device-scale-factor=2');
        }
        
        if (browser.name === 'firefox') {
          // Firefox mobile simulation
          launchOptions.preferences['general.useragent.override'] = config.userAgent;
        }
        
        return launchOptions;
      });

      return config;
    },
  },
});