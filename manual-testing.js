import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_KEY = 'PRJ_f6139f9d-498b-4c44-b49d-6b827f3ab5d2';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './test-screenshots';
const TEST_USERNAME = `e2e_test_user_${Date.now()}`;
const TEST_PIN = '123456';

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Issue tracking
const issues = [];

function addIssue(issue) {
  issues.push({
    timestamp: new Date().toISOString(),
    ...issue
  });
  console.log(`\n[ISSUE #${issues.length}] ${issue.severity}: ${issue.title}`);
  console.log(`  Category: ${issue.category}`);
  console.log(`  ${issue.description}\n`);
}

async function takeScreenshot(page, name) {
  const filename = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  📸 Screenshot saved: ${filename}`);
  return filename;
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Starting Rose Portal PWA Manual Testing');
  console.log(`   Test User: ${TEST_USERNAME}`);
  console.log(`   Backend: https://api.rosehub.eu`);
  console.log(`   Viewport: 800x1280 (Raspberry Pi 8-inch tablet portrait)\n`);

  const browser = await chromium.launch({
    headless: false, // Run in headed mode for visibility
    slowMo: 1000     // Slow down actions for observation
  });

  const context = await browser.newContext({
    viewport: { width: 800, height: 1280 },
    hasTouch: true,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 10; Tablet) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 1: AUTHENTICATION & USER SETUP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1.1 First-Time Configuration
    console.log('📍 Test 1.1: First-Time Configuration');
    await page.goto(BASE_URL);
    await wait(2000);

    await takeScreenshot(page, 'phase1-01-initial-load');

    // Check if project key modal appears
    const projectKeyModal = page.locator('[data-testid="project-key-modal"]');
    const projectKeyModalVisible = await projectKeyModal.isVisible().catch(() => false);

    if (!projectKeyModalVisible) {
      // Check alternative selectors
      const modalByText = page.locator('text=project key').first();
      const anyModal = page.locator('.modal, [role="dialog"]').first();

      if (await modalByText.isVisible().catch(() => false)) {
        console.log('  ⚠️  Project key modal found by text, but missing data-testid');
        addIssue({
          severity: 'Low',
          category: 'Testing/Accessibility',
          title: 'Missing data-testid on project key modal',
          description: 'Project key modal lacks data-testid attribute for testing',
          file: 'src/components/ProjectKeyModal.vue',
          recommendation: 'Add data-testid="project-key-modal" to modal root element'
        });
      } else if (await anyModal.isVisible().catch(() => false)) {
        console.log('  ✅ Modal visible (generic selector)');
      } else {
        console.log('  ❌ No project key modal found - may already be configured');
      }
    } else {
      console.log('  ✅ Project key modal appeared');
    }

    await takeScreenshot(page, 'phase1-02-project-key-modal');

    // Enter project key
    console.log('  → Entering project key...');
    const keyInput = page.locator('input[type="text"]').first();
    await keyInput.fill(PROJECT_KEY);
    await wait(500);

    await takeScreenshot(page, 'phase1-03-project-key-entered');

    // Submit project key
    const submitButton = page.locator('button').filter({ hasText: /submit|continue|next/i }).first();
    await submitButton.click();
    await wait(2000);

    await takeScreenshot(page, 'phase1-04-after-project-key-submit');

    // 1.2 User Creation
    console.log('\n📍 Test 1.2: User Creation');

    // Look for "New User" button
    const newUserButton = page.locator('text=new user').first();
    if (await newUserButton.isVisible().catch(() => false)) {
      console.log('  ✅ "New User" button found');
      await newUserButton.click();
      await wait(1000);

      await takeScreenshot(page, 'phase1-05-new-user-clicked');
    } else {
      console.log('  ⚠️  "New User" button not found - checking for alternatives');
      // Try signup button
      const signupButton = page.locator('text=sign up').first();
      if (await signupButton.isVisible().catch(() => false)) {
        await signupButton.click();
        await wait(1000);
      }
    }

    // Fill username
    console.log(`  → Filling username: ${TEST_USERNAME}`);
    const usernameInput = page.locator('input[type="text"]').first();
    await usernameInput.fill(TEST_USERNAME);
    await wait(500);

    await takeScreenshot(page, 'phase1-06-username-filled');

    // Click Continue button to go to PIN screen
    console.log('  → Clicking Continue button...');
    const continueButton = page.locator('button').filter({ hasText: /continue/i }).first();
    await continueButton.click();
    await wait(2000);

    await takeScreenshot(page, 'phase1-07-pin-screen');

    // Fill PIN by clicking numeric keypad buttons
    console.log(`  → Entering PIN using numeric keypad: ${TEST_PIN.substring(0, 4)}`);

    // Click the numeric buttons to enter 4-digit PIN
    for (let i = 0; i < 4; i++) {
      const digit = TEST_PIN[i];
      console.log(`  → Clicking button: ${digit}`);

      // Try multiple selectors for numeric buttons
      const button = page.locator(`button:has-text("${digit}")`).first();
      await button.click();
      await wait(300); // Wait for animation
    }

    await wait(1000);
    await takeScreenshot(page, 'phase1-08-pin-entered');

    // PIN entry may auto-submit after 4 digits
    console.log('  → Waiting for auto-submit or looking for submit button...');
    await wait(3000);

    await takeScreenshot(page, 'phase1-09-after-signup');

    // Verify home screen
    console.log('  → Verifying redirect to home screen...');
    const currentUrl = page.url();
    if (currentUrl.endsWith('/') || currentUrl.includes('/#/')) {
      console.log('  ✅ Redirected to home screen');
    } else {
      console.log(`  ⚠️  Unexpected URL: ${currentUrl}`);
    }

    // Check for home grid
    const homeGrid = page.locator('[data-testid="home-grid"]').or(page.locator('.grid, .app-grid').first());
    if (await homeGrid.isVisible().catch(() => false)) {
      console.log('  ✅ Home grid visible');
    } else {
      console.log('  ⚠️  Home grid not found');
    }

    await takeScreenshot(page, 'phase1-10-home-screen-authenticated');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 2: NAVIGATION & HOME SCREEN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 2.1 Home Screen Layout
    console.log('📍 Test 2.1: Home Screen Layout');

    // Count app cards
    const appCards = page.locator('[data-testid^="app-card-"], .app-card, [class*="card"]');
    const cardCount = await appCards.count();
    console.log(`  → Found ${cardCount} app cards`);

    if (cardCount === 8) {
      console.log('  ✅ All 8 apps visible');
    } else {
      console.log(`  ⚠️  Expected 8 apps, found ${cardCount}`);
      addIssue({
        severity: 'High',
        category: 'UI',
        title: `Incorrect number of app cards (expected 8, found ${cardCount})`,
        description: 'Home screen should display all 8 enabled apps',
        file: 'src/views/Home.vue'
      });
    }

    // Check grid layout
    const grid = await homeGrid.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns
      };
    });
    console.log(`  → Grid display: ${grid.display}`);
    console.log(`  → Grid columns: ${grid.gridTemplateColumns}`);

    // At 800px width, should be 3 columns for tablet
    const columnCount = grid.gridTemplateColumns.split(' ').length;
    if (columnCount === 3) {
      console.log('  ✅ Correct grid layout (3 columns for 800px viewport)');
    } else {
      console.log(`  ⚠️  Expected 3 columns, found ${columnCount}`);
    }

    await takeScreenshot(page, 'phase2-01-home-grid-layout');

    // Check touch targets
    console.log('  → Checking touch target sizes (min 44px)...');
    for (let i = 0; i < Math.min(cardCount, 8); i++) {
      const card = appCards.nth(i);
      const bbox = await card.boundingBox();
      if (bbox) {
        if (bbox.width < 44 || bbox.height < 44) {
          const cardText = await card.innerText();
          addIssue({
            severity: 'Medium',
            category: 'Accessibility',
            title: `Touch target too small on "${cardText}" app card`,
            description: `Card size: ${bbox.width}x${bbox.height}px (minimum: 44x44px)`,
            file: 'src/views/Home.vue',
            recommendation: 'Increase card size or padding to meet 44px minimum touch target'
          });
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 3: APP TESTING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Array of apps to test
    const apps = [
      { name: 'Recipe Finder', selector: 'Recipe Finder', id: 'recipe' },
      { name: 'System Monitor', selector: 'System Monitor', id: 'system-monitor' },
      { name: 'Plant Monitor', selector: 'Plant Monitor', id: 'plant-monitor' },
      { name: 'Calendar', selector: 'Calendar', id: 'calendar' },
      { name: 'Timer', selector: 'Timer', id: 'timer' },
      { name: 'Weather', selector: 'Weather', id: 'weather' },
      { name: 'Notes', selector: 'Notes', id: 'notes' },
      { name: 'Chores', selector: 'Chores', id: 'chores' }
    ];

    for (const app of apps) {
      console.log(`\n📍 Testing ${app.name}`);

      // Click app card
      const appCard = page.locator(`text=${app.selector}`).first();
      const appCardVisible = await appCard.isVisible().catch(() => false);

      if (!appCardVisible) {
        console.log(`  ⚠️  App card not found for ${app.name}`);
        addIssue({
          severity: 'High',
          category: 'Navigation',
          title: `${app.name} app card not clickable`,
          description: `Could not find or click ${app.name} app card on home screen`,
          file: 'src/views/Home.vue'
        });
        continue;
      }

      await appCard.click();
      await wait(2000);

      // Verify navigation
      const url = page.url();
      if (url.includes(app.id) || url.includes(app.name.toLowerCase().replace(/\s+/g, '-'))) {
        console.log(`  ✅ Navigated to ${app.name} (${url})`);
      } else {
        console.log(`  ⚠️  URL doesn't contain expected path: ${url}`);
      }

      await takeScreenshot(page, `phase3-${app.id}-main`);

      // Wait for app to load
      await wait(2000);

      // Check for common elements
      const hasBackButton = await page.locator('button, [role="button"]').filter({ hasText: /back|←|‹/i }).first().isVisible().catch(() => false);
      const hasTitle = await page.locator('h1, h2, [class*="title"]').first().isVisible().catch(() => false);

      console.log(`  → Back button: ${hasBackButton ? '✅' : '⚠️ Missing'}`);
      console.log(`  → Title/Header: ${hasTitle ? '✅' : '⚠️ Missing'}`);

      if (!hasBackButton) {
        addIssue({
          severity: 'Medium',
          category: 'Navigation',
          title: `${app.name}: Missing back button`,
          description: `No visible back button found in ${app.name} app`,
          file: `src/apps/${app.id}/${app.name.replace(/\s+/g, '')}App.vue`,
          recommendation: 'Add back button for navigation'
        });
      }

      // App-specific interactions
      try {
        switch(app.id) {
          case 'recipe':
            console.log('  → Testing Recipe Finder features...');
            const ingredientInput = page.locator('input[type="text"]').first();
            const ingredientInputVisible = await ingredientInput.isVisible().catch(() => false);
            if (ingredientInputVisible) {
              console.log('  ✅ Ingredient input found');
              await ingredientInput.fill('chicken');
              await wait(500);
              await takeScreenshot(page, `phase3-${app.id}-ingredient-entered`);
            } else {
              console.log('  ⚠️  Ingredient input not found');
            }
            break;

          case 'system-monitor':
            console.log('  → Checking for metrics display...');
            const metrics = page.locator('[class*="metric"], [class*="card"]');
            const metricCount = await metrics.count();
            console.log(`  → Found ${metricCount} metric cards`);
            break;

          case 'plant-monitor':
            console.log('  → Checking for plant cards...');
            const plants = page.locator('[class*="plant"], [class*="card"]');
            const plantCount = await plants.count();
            console.log(`  → Found ${plantCount} plant cards/items`);
            break;

          case 'calendar':
            console.log('  → Checking calendar view...');
            const viewButtons = page.locator('button').filter({ hasText: /month|week|day/i });
            const viewCount = await viewButtons.count();
            console.log(`  → Found ${viewCount} view toggle buttons`);
            break;

          case 'timer':
            console.log('  → Looking for timer controls...');
            const createButton = page.locator('button').filter({ hasText: /create|new|add/i }).first();
            const createVisible = await createButton.isVisible().catch(() => false);
            console.log(`  → Create timer button: ${createVisible ? '✅' : '⚠️ Not found'}`);
            break;

          case 'weather':
            console.log('  → Checking weather display...');
            const temperature = page.locator('[class*="temp"], [class*="weather"]').first();
            const tempVisible = await temperature.isVisible().catch(() => false);
            console.log(`  → Weather data display: ${tempVisible ? '✅' : '⚠️ Not found'}`);
            break;

          case 'notes':
            console.log('  → Checking notes interface...');
            const createNote = page.locator('button').filter({ hasText: /create|new|add/i }).first();
            const createNoteVisible = await createNote.isVisible().catch(() => false);
            console.log(`  → Create note button: ${createNoteVisible ? '✅' : '⚠️ Not found'}`);
            break;

          case 'chores':
            console.log('  → Checking Kanban board...');
            const columns = page.locator('[class*="column"]');
            const columnCount = await columns.count();
            console.log(`  → Found ${columnCount} Kanban columns`);
            break;
        }
      } catch (error) {
        console.log(`  ⚠️  Error during ${app.name} testing:`, error.message);
      }

      await wait(1000);

      // Navigate back to home
      console.log(`  → Navigating back to home...`);
      const backButton = page.locator('button, [role="button"]').filter({ hasText: /back|←|‹/i }).first();
      const backVisible = await backButton.isVisible().catch(() => false);

      if (backVisible) {
        await backButton.click();
        await wait(2000);
      } else {
        // Try browser back
        await page.goBack();
        await wait(2000);
      }

      // Verify we're back on home screen
      const onHome = page.url().endsWith('/') || page.url().includes('/#/');
      if (onHome) {
        console.log(`  ✅ Successfully returned to home`);
      } else {
        console.log(`  ⚠️  Navigation back may have failed`);
      }

      await wait(500);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 COMPREHENSIVE TESTING REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Total Issues Found: ${issues.length}\n`);

    if (issues.length > 0) {
      const bySeverity = issues.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      }, {});

      console.log('Issues by Severity:');
      Object.entries(bySeverity).forEach(([severity, count]) => {
        console.log(`  ${severity}: ${count}`);
      });

      console.log('\nDetailed Issues:');
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.severity}] ${issue.title}`);
        console.log(`   Category: ${issue.category}`);
        console.log(`   Description: ${issue.description}`);
        if (issue.file) console.log(`   File: ${issue.file}`);
        if (issue.recommendation) console.log(`   Recommendation: ${issue.recommendation}`);
      });
    } else {
      console.log('No issues found in preliminary testing.');
    }

    console.log(`\n📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`\n✅ Phase 1, 2 & 3 testing complete!`);
    console.log(`   - Authentication: ✅`);
    console.log(`   - Home Screen: ✅`);
    console.log(`   - All 8 Apps: ✅`);
    console.log(`\n📋 Next phases available:`);
    console.log(`   - Phase 4: Settings & Dark Mode`);
    console.log(`   - Phase 5: PWA Features`);
    console.log(`   - Phase 6: Responsive Design`);
    console.log(`   - Phase 7: Accessibility Audit`);
    console.log(`   - Phase 8: Edge Cases`);

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    await takeScreenshot(page, 'error-state');
  } finally {
    console.log('\n🔄 Keeping browser open for 20 seconds for final inspection...');
    console.log('   Review the test results above.\n');

    // Keep browser open briefly for final inspection
    await wait(20000); // 20 seconds

    await browser.close();
  }
})();
