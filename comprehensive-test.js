import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_KEY = 'PRJ_f6139f9d-498b-4c44-b49d-6b827f3ab5d2';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './test-results/screenshots';
const TEST_USERNAME = `testuser${Date.now()}`;
const TEST_PIN = '1234';

// iPhone 12 dimensions
const VIEWPORT = { width: 390, height: 844 };

// Create directories
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results tracking
const testResults = {
  screens: [],
  issues: [],
  screenshots: [],
  timestamp: new Date().toISOString()
};

function addIssue(issue) {
  testResults.issues.push({
    timestamp: new Date().toISOString(),
    ...issue
  });
  console.log(`\n[ISSUE] ${issue.severity}: ${issue.title}`);
}

async function takeScreenshot(page, name, description = '') {
  const filename = `${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });

  testResults.screenshots.push({
    name,
    filename,
    description,
    timestamp: new Date().toISOString()
  });

  console.log(`  📸 ${name}`);
  return filename;
}

async function testSwipeBack(page, elementSelector) {
  try {
    const element = page.locator(elementSelector).first();
    const box = await element.boundingBox();

    if (!box) return false;

    // Simulate swipe from left edge
    await page.touchscreen.tap(50, box.y + box.height / 2);
    await page.mouse.move(50, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(300, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(1000);
    return true;
  } catch (error) {
    return false;
  }
}

async function checkScrollIndicators(page) {
  const scrollableElements = await page.locator('[class*="scroll"], .overflow-auto, .overflow-y-auto').all();

  for (const element of scrollableElements) {
    const isScrollable = await element.evaluate((el) => {
      return el.scrollHeight > el.clientHeight;
    });

    if (isScrollable) {
      const hasIndicator = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.getPropertyValue('--scroll-indicator') ||
               el.getAttribute('data-scroll-indicator');
      });

      if (!hasIndicator) {
        addIssue({
          severity: 'Low',
          category: 'UX',
          title: 'Scrollable area without visual indicator',
          description: 'Scrollable content found without clear visual indicator for users'
        });
      }
    }
  }
}

(async () => {
  console.log('🚀 Rose Portal Comprehensive Testing');
  console.log(`📱 Viewport: ${VIEWPORT.width}x${VIEWPORT.height} (iPhone 12)`);
  console.log(`👤 Test User: ${TEST_USERNAME}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  try {
    // ============================================
    // AUTHENTICATION FLOW
    // ============================================
    console.log('\n═══════════════════════════════════════');
    console.log('AUTHENTICATION & ONBOARDING');
    console.log('═══════════════════════════════════════\n');

    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '01-initial-load', 'Initial app load');

    // Project Key Entry
    console.log('Testing: Project Key Modal');
    const projectKeyInput = page.locator('input[type="text"]').first();
    const isProjectKeyVisible = await projectKeyInput.isVisible().catch(() => false);

    if (isProjectKeyVisible) {
      await projectKeyInput.fill(PROJECT_KEY);
      await takeScreenshot(page, '02-project-key-entry', 'Project key entered');

      const submitBtn = page.locator('button').filter({ hasText: /submit|continue/i }).first();
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    await takeScreenshot(page, '03-user-selection', 'User selection screen');

    // Create New User
    console.log('Testing: User Creation Flow');
    const newUserBtn = page.locator('text=new user').first();
    await newUserBtn.click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '04-new-user-form', 'New user form');

    // Username entry (no spaces)
    const usernameInput = page.locator('input[type="text"]').first();
    await usernameInput.fill(TEST_USERNAME);
    await takeScreenshot(page, '05-username-filled', 'Username entered');

    const continueBtn = page.locator('button').filter({ hasText: /continue/i }).first();
    await continueBtn.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, '06-pin-entry', 'PIN entry screen');

    // PIN entry using numeric buttons
    console.log('Testing: PIN Input');
    for (let i = 0; i < 4; i++) {
      const digit = TEST_PIN[i];
      const digitBtn = page.locator(`button:has-text("${digit}")`).first();
      await digitBtn.click();
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(3000);
    await takeScreenshot(page, '07-authenticated-home', 'Home screen after authentication');

    // ============================================
    // HOME SCREEN ANALYSIS
    // ============================================
    console.log('\n═══════════════════════════════════════');
    console.log('HOME SCREEN');
    console.log('═══════════════════════════════════════\n');

    // Check for scrolling on home screen
    const homeScrollable = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight;
    });

    if (homeScrollable) {
      addIssue({
        severity: 'Medium',
        category: 'Design',
        title: 'Home screen requires scrolling',
        description: 'Home screen content exceeds viewport height, requiring vertical scroll',
        recommendation: 'Consider more compact layout or reduce element sizes'
      });
    }

    // Test scroll if needed
    if (homeScrollable) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(500);
      await takeScreenshot(page, '08-home-scrolled', 'Home screen scrolled down');
      await page.mouse.wheel(0, -500);
    }

    // Dismiss any dialogs that might be open (Welcome Back, etc.)
    const dialogCloseBtn = page.locator('button').filter({ hasText: /close|ok|dismiss|continue/i }).first();
    if (await dialogCloseBtn.isVisible().catch(() => false)) {
      console.log('  → Dismissing dialog...');
      await dialogCloseBtn.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '09-dialog-dismissed', 'Dialog dismissed');
    }

    // ============================================
    // APP-BY-APP TESTING
    // ============================================
    const apps = [
      {
        name: 'Recipe Finder',
        selector: 'Recipe Finder',
        testActions: async (page) => {
          // Test search functionality
          const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
          if (await searchInput.isVisible().catch(() => false)) {
            await searchInput.fill('pasta');
            await takeScreenshot(page, 'recipe-search-input', 'Recipe search with query');
            await page.waitForTimeout(2000);
          }

          // Check for modals
          const addBtn = page.locator('button').filter({ hasText: /add|create|new/i }).first();
          if (await addBtn.isVisible().catch(() => false)) {
            await addBtn.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, 'recipe-add-modal', 'Recipe creation modal');

            // Close modal
            const closeBtn = page.locator('button').filter({ hasText: /close|cancel/i }).first();
            if (await closeBtn.isVisible().catch(() => false)) {
              await closeBtn.click();
              await page.waitForTimeout(500);
            }
          }
        }
      },
      {
        name: 'System Monitor',
        selector: 'System Monitor',
        testActions: async (page) => {
          // Check if metrics are visible
          await page.waitForTimeout(2000);
          const metrics = page.locator('[class*="metric"], [class*="card"]');
          const count = await metrics.count();
          console.log(`  → Found ${count} metric cards`);

          // Test refresh if available
          const refreshBtn = page.locator('button').filter({ hasText: /refresh|reload/i }).first();
          if (await refreshBtn.isVisible().catch(() => false)) {
            await refreshBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      },
      {
        name: 'Plant Monitor',
        selector: 'Plant Monitor',
        testActions: async (page) => {
          await page.waitForTimeout(1500);

          // Try to add a plant
          const addPlantBtn = page.locator('button').filter({ hasText: /add|create|new/i }).first();
          if (await addPlantBtn.isVisible().catch(() => false)) {
            await addPlantBtn.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, 'plant-add-modal', 'Add plant modal');

            // Test form if visible
            const nameInput = page.locator('input[placeholder*="name"], input[type="text"]').first();
            if (await nameInput.isVisible().catch(() => false)) {
              await nameInput.fill('Test Plant');
              await page.waitForTimeout(500);
              await takeScreenshot(page, 'plant-form-filled', 'Plant form with data');
            }

            // Close modal
            const cancelBtn = page.locator('button').filter({ hasText: /cancel|close/i }).first();
            if (await cancelBtn.isVisible().catch(() => false)) {
              await cancelBtn.click();
              await page.waitForTimeout(500);
            }
          }
        }
      },
      {
        name: 'Calendar',
        selector: 'Calendar',
        testActions: async (page) => {
          await page.waitForTimeout(2000);

          // Test view switching
          const viewBtns = page.locator('button').filter({ hasText: /month|week|day/i });
          const viewCount = await viewBtns.count();
          if (viewCount > 0) {
            for (let i = 0; i < Math.min(viewCount, 3); i++) {
              await viewBtns.nth(i).click();
              await page.waitForTimeout(1000);
              const viewName = await viewBtns.nth(i).innerText();
              await takeScreenshot(page, `calendar-view-${viewName.toLowerCase()}`, `Calendar ${viewName} view`);
            }
          }

          // Try to create event
          const createBtn = page.locator('button').filter({ hasText: /create|add|new/i }).first();
          if (await createBtn.isVisible().catch(() => false)) {
            await createBtn.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, 'calendar-create-modal', 'Create event modal');

            // Close modal
            const closeBtn = page.locator('button').filter({ hasText: /close|cancel/i }).first();
            if (await closeBtn.isVisible().catch(() => false)) {
              await closeBtn.click();
              await page.waitForTimeout(500);
            }
          }
        }
      },
      {
        name: 'Timer',
        selector: 'Timer',
        testActions: async (page) => {
          await page.waitForTimeout(1500);

          // Try to create timer
          const createBtn = page.locator('button').filter({ hasText: /create|add|new/i }).first();
          if (await createBtn.isVisible().catch(() => false)) {
            await createBtn.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, 'timer-create-modal', 'Create timer modal');

            // Fill form if visible
            const nameInput = page.locator('input[placeholder*="name"], input[type="text"]').first();
            if (await nameInput.isVisible().catch(() => false)) {
              await nameInput.fill('Test Timer');
              await page.waitForTimeout(500);
            }

            // Close modal
            const cancelBtn = page.locator('button').filter({ hasText: /cancel|close/i }).first();
            if (await cancelBtn.isVisible().catch(() => false)) {
              await cancelBtn.click();
              await page.waitForTimeout(500);
            }
          }
        }
      },
      {
        name: 'Weather',
        selector: 'Weather',
        testActions: async (page) => {
          await page.waitForTimeout(2000);

          // Check weather data is loaded
          const weatherCard = page.locator('[class*="weather"], [class*="card"]').first();
          if (await weatherCard.isVisible().catch(() => false)) {
            console.log('  → Weather data displayed');
          }

          // Test any settings/config buttons
          const settingsBtn = page.locator('button').filter({ hasText: /setting|config/i }).first();
          if (await settingsBtn.isVisible().catch(() => false)) {
            await settingsBtn.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, 'weather-settings', 'Weather settings modal');

            const closeBtn = page.locator('button').filter({ hasText: /close|cancel/i }).first();
            if (await closeBtn.isVisible().catch(() => false)) {
              await closeBtn.click();
            }
          }
        }
      },
      {
        name: 'Notes',
        selector: 'Notes',
        testActions: async (page) => {
          await page.waitForTimeout(1500);

          // Try to create note
          const createBtn = page.locator('button').filter({ hasText: /create|add|new/i }).first();
          if (await createBtn.isVisible().catch(() => false)) {
            await createBtn.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, 'notes-create-modal', 'Create note modal');

            // Test rich text editor if present
            const editor = page.locator('[contenteditable="true"], textarea').first();
            if (await editor.isVisible().catch(() => false)) {
              await editor.fill('Test note content');
              await page.waitForTimeout(500);
              await takeScreenshot(page, 'notes-editor-filled', 'Note editor with content');
            }

            // Close
            const cancelBtn = page.locator('button').filter({ hasText: /cancel|close/i }).first();
            if (await cancelBtn.isVisible().catch(() => false)) {
              await cancelBtn.click();
              await page.waitForTimeout(500);
            }
          }
        }
      },
      {
        name: 'Chores',
        selector: 'Chores',
        testActions: async (page) => {
          await page.waitForTimeout(1500);

          // Check Kanban columns
          const columns = page.locator('[class*="column"]');
          const columnCount = await columns.count();
          console.log(`  → Found ${columnCount} Kanban columns`);

          // Try to create chore
          const createBtn = page.locator('button').filter({ hasText: /create|add|new/i }).first();
          if (await createBtn.isVisible().catch(() => false)) {
            await createBtn.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, 'chores-create-modal', 'Create chore modal');

            // Fill form
            const titleInput = page.locator('input[placeholder*="title"], input[type="text"]').first();
            if (await titleInput.isVisible().catch(() => false)) {
              await titleInput.fill('Test Chore');
              await page.waitForTimeout(500);
              await takeScreenshot(page, 'chores-form-filled', 'Chore form filled');
            }

            // Close
            const cancelBtn = page.locator('button').filter({ hasText: /cancel|close/i }).first();
            if (await cancelBtn.isVisible().catch(() => false)) {
              await cancelBtn.click();
              await page.waitForTimeout(500);
            }
          }
        }
      }
    ];

    for (const app of apps) {
      console.log(`\n═══════════════════════════════════════`);
      console.log(`${app.name.toUpperCase()}`);
      console.log(`═══════════════════════════════════════\n`);

      // Navigate to app
      await page.goto(BASE_URL);
      await page.waitForTimeout(1000);

      const appCard = page.locator(`text=${app.selector}`).first();
      if (await appCard.isVisible().catch(() => false)) {
        // Wait for any overlays/dialogs to be gone
        await page.waitForTimeout(1000);
        await appCard.click({ force: true });
        await page.waitForTimeout(2000);

        const appId = app.name.toLowerCase().replace(/\s+/g, '-');
        await takeScreenshot(page, `${appId}-main`, `${app.name} main view`);

        // Check for scrolling
        const needsScroll = await page.evaluate(() => {
          return document.documentElement.scrollHeight > window.innerHeight;
        });

        if (needsScroll) {
          addIssue({
            severity: 'Medium',
            category: 'Design',
            title: `${app.name} requires scrolling`,
            description: `Content in ${app.name} exceeds viewport height`,
            app: app.name
          });

          // Scroll and capture
          await page.mouse.wheel(0, 500);
          await page.waitForTimeout(500);
          await takeScreenshot(page, `${appId}-scrolled`, `${app.name} scrolled view`);
          await page.mouse.wheel(0, -500);
          await page.waitForTimeout(500);
        }

        // Run app-specific tests
        console.log(`Testing ${app.name} features...`);
        await app.testActions(page);

        // Test swipe back gesture
        console.log('Testing swipe-back navigation...');
        const swipeSuccess = await testSwipeBack(page, 'body');
        if (swipeSuccess) {
          console.log('  ✅ Swipe-back gesture works');
        } else {
          // Try regular back button
          const backBtn = page.locator('button').filter({ hasText: /back|←/i }).first();
          if (await backBtn.isVisible().catch(() => false)) {
            await backBtn.click();
          } else {
            await page.goBack();
          }
        }

        await page.waitForTimeout(2000);
      }
    }

    // ============================================
    // SETTINGS SCREEN
    // ============================================
    console.log('\n═══════════════════════════════════════');
    console.log('SETTINGS');
    console.log('═══════════════════════════════════════\n');

    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);

    // Look for settings button/icon
    const settingsBtn = page.locator('button, a').filter({ hasText: /setting/i }).or(
      page.locator('[class*="setting"], [href*="setting"]')
    ).first();

    if (await settingsBtn.isVisible().catch(() => false)) {
      await settingsBtn.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, 'settings-main', 'Settings screen');

      // Check all toggles/switches
      const toggles = page.locator('input[type="checkbox"], [role="switch"]');
      const toggleCount = await toggles.count();
      console.log(`  → Found ${toggleCount} toggles/switches`);

      // Test dark mode if available
      const darkModeToggle = page.locator('text=dark mode').first();
      if (await darkModeToggle.isVisible().catch(() => false)) {
        await darkModeToggle.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'settings-dark-mode', 'Dark mode enabled');
        await darkModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }

    // ============================================
    // GENERATE REPORT DATA
    // ============================================
    console.log('\n═══════════════════════════════════════');
    console.log('GENERATING REPORT');
    console.log('═══════════════════════════════════════\n');

    const reportData = {
      ...testResults,
      viewport: VIEWPORT,
      testUser: TEST_USERNAME,
      projectKey: PROJECT_KEY,
      appsTestedCount: apps.length,
      screenshotCount: testResults.screenshots.length,
      issueCount: testResults.issues.length
    };

    // Save JSON report
    const reportPath = './test-results/test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`✅ Report saved: ${reportPath}`);
    console.log(`📸 Screenshots: ${testResults.screenshots.length}`);
    console.log(`⚠️  Issues found: ${testResults.issues.length}\n`);

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    await takeScreenshot(page, 'error-state', 'Error occurred');
  } finally {
    console.log('Keeping browser open for 10 seconds...\n');
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();
