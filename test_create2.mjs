import { chromium } from 'playwright';
const S = process.env.SCRATCHPAD;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 860 });
await page.goto('http://localhost:5173');
await page.waitForTimeout(2000);

// Navigate to Create tab
await page.click('button:has-text("Create")');
await page.waitForTimeout(1000);
await page.screenshot({ path: `${S}/c1_empty.png` });

const stageBox = await page.locator('[style*="repeating-linear-gradient"]').first().boundingBox();

// Helper: drag item from catalog to stage position
async function dragToStage(text, tx, ty) {
  const el = page.locator(`text=${text}`).first();
  const box = await el.boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await page.mouse.down();
  await page.mouse.move(stageBox.x + tx, stageBox.y + ty, { steps: 20 });
  await page.waitForTimeout(200);
  await page.mouse.up();
  await page.waitForTimeout(400);
}

// Place DJ Booth center
await dragToStage('DJ Booth', stageBox.width/2 - 80, stageBox.height/2 - 50);
await page.screenshot({ path: `${S}/c2_dj.png` });

// Place LED Wall top left
await dragToStage('LED Wall', 80, 60);

// Place Moving Heads
await dragToStage('Moving Head', 300, 60);
await dragToStage('Moving Head', 370, 60);

// Place Subwoofers  
await dragToStage('Subwoofer', 40, stageBox.height - 120);
await dragToStage('Subwoofer', stageBox.width - 80, stageBox.height - 120);

// Place a DJ person
await dragToStage('DJ / Artist', stageBox.width/2 + 40, stageBox.height/2 - 50);

// Place Security
await dragToStage('Security', 60, stageBox.height - 80);
await dragToStage('Security', stageBox.width - 80, stageBox.height - 80);

await page.waitForTimeout(500);
await page.screenshot({ path: `${S}/c3_populated.png` });

// Click the DJ Booth to open edit panel
await page.mouse.click(stageBox.x + stageBox.width/2 - 60, stageBox.y + stageBox.height/2 - 20);
await page.waitForTimeout(500);
await page.screenshot({ path: `${S}/c4_edit_panel.png` });

// Switch to Full Venue view
await page.click('button:has-text("Full Venue")');
await page.waitForTimeout(600);
await page.screenshot({ path: `${S}/c5_venue_view.png` });

await browser.close();
console.log('Done');
