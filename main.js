const puppeteer = require('puppeteer');
require('dotenv').config();

function randomWait(min, max) {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

async function simulateMouseMovement(page) {
  const x = Math.floor(Math.random() * 1920); 
  const y = Math.floor(Math.random() * 1080); 
  await page.mouse.move(x, y);
  await randomWait(500, 1500);
}

async function randomScroll(page) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const scrollPosition = Math.floor(Math.random() * scrollHeight);
  await page.evaluate(scrollPos => window.scrollTo(0, scrollPos), scrollPosition);
  await randomWait(1000, 2000);
}

async function searchInGoogle(page, query) {
  await page.goto('https://www.google.com');
  await page.waitForSelector('textarea[name=q]', { timeout: 10000 }); // Wait for the search input
  await page.type('textarea[name=q]', query, { delay: 100 });
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
}

async function searchInBing(page, query) {
  await page.goto('https://www.bing.com');
  await page.waitForSelector('textarea[name=q]', { timeout: 10000 }); // Wait for the search input
  await page.type('textarea[name=q]', query, { delay: 100 });
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
}

function getRandomSearchEngine() {
  return Math.random() < 0.5 ? 'google' : 'bing';
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false, 
    defaultViewport: null, 
    args: [    
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars'] 
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const searchEngine = getRandomSearchEngine();
  const query = process.env.QUERY;

  if (!query) {
    console.error('QUERY must be set in the .env file.');
    await browser.close();
    return;
  }

  console.log(`Using search engine: ${searchEngine}`);

  if (searchEngine === 'google') {
    await searchInGoogle(page, query);
  } else {
    await searchInBing(page, query);
  }

  // Go to the first search result
  const firstResultSelector = searchEngine === 'google' ? 'h3' : 'li.b_algo h2';
  const firstResultUrl = await page.evaluate(selector => {
    const element = document.querySelector(selector);
    return element ? element.parentElement.href : null;
  }, firstResultSelector);

  if (firstResultUrl) {
    await page.goto(firstResultUrl);
    for (let i = 0; i < 40; i++) {
      await randomScroll(page);
      await simulateMouseMovement(page);
      await randomWait(45000, 60000);
      const randomH2Selector = await page.evaluate(() => {
        const h2s = Array.from(document.querySelectorAll('h2'));
        const h2WithHref = h2s.filter(h2 => h2.querySelector('a[href]'));
        if (h2WithHref.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * h2WithHref.length);
        return h2WithHref[randomIndex].querySelector('a[href]').href;
      });

      if (randomH2Selector) {
        await page.goto(randomH2Selector);
      }
      await randomWait(45000, 60000);
    }
  }

  await browser.close();
})();
