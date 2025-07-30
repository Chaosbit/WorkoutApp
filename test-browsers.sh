#!/bin/bash

# Browser Testing Validation Script
# This script checks what browsers are available and tests them

echo "=== Multi-Browser Testing Validation ==="
echo

# Check available browsers
echo "Checking available browsers:"
echo "Chrome: $(which google-chrome || which chromium-browser || which chrome || echo 'Not found')"
echo "Firefox: $(which firefox || echo 'Not found')"
echo "Edge: $(which microsoft-edge || which edge || echo 'Not found')"
echo

# Test Chrome (desktop)
echo "Testing Chrome Desktop..."
npm run test:e2e:chrome -- --spec "cypress/e2e/mobile-browser.cy.js" || echo "Chrome desktop test failed"
echo

# Test Chrome Mobile
echo "Testing Chrome Mobile..."
npm run test:e2e:mobile -- --spec "cypress/e2e/mobile-browser.cy.js" || echo "Chrome mobile test failed"
echo

# Test Firefox if available
if command -v firefox &> /dev/null; then
    echo "Testing Firefox..."
    npm run test:e2e:firefox -- --spec "cypress/e2e/mobile-browser.cy.js" || echo "Firefox test failed"
else
    echo "Firefox not available, skipping..."
fi
echo

# Test Edge if available
if command -v microsoft-edge &> /dev/null || command -v edge &> /dev/null; then
    echo "Testing Edge..."
    npm run test:e2e:edge -- --spec "cypress/e2e/mobile-browser.cy.js" || echo "Edge test failed"
else
    echo "Edge not available, skipping..."
fi
echo

echo "=== Validation Complete ==="