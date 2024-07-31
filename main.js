require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

function randomWait(min, max) {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

async function simulateMouseMovement(page) {
  const x = Math.floor(Math.random() * 1920); // Sesuaikan dengan lebar viewport
  const y = Math.floor(Math.random() * 1080); // Sesuaikan dengan tinggi viewport
  await page.mouse.move(x, y);
  await randomWait(500, 1500);
}

// Fungsi untuk scroll secara acak
async function randomScroll(page) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const scrollPosition = Math.floor(Math.random() * scrollHeight);
  await page.evaluate(scrollPos => window.scrollTo(0, scrollPos), scrollPosition);
  await randomWait(1000, 2000);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars'
    ]
  });

  const page = await browser.newPage();

  // Manipulasi fingerprint dan properti browser
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    window.navigator.chrome = { runtime: {} };
  });

  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/fingerprintjs@3/dist/fp.min.js' });

  const fingerprint = await page.evaluate(async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    
    // Menambahkan elemen <div> ke halaman untuk menampilkan fingerprint
    const div = document.createElement('div');
    div.id = 'fingerprint-info';
    div.style.position = 'fixed';
    div.style.top = '10px';
    div.style.right = '10px';
    div.style.backgroundColor = 'rgba(0,0,0,0.7)';
    div.style.color = 'white';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.textContent = `Fingerprint: ${result.visitorId}`;
    
    document.body.appendChild(div);

    return result.visitorId;
  });

  console.log(`Fingerprint di server: ${fingerprint}`); // Menampilkan fingerprint di konsol server

  await page.setViewport({ width: 1920, height: 1080 });

  const url = process.env.URL || 'https://www.acehglobalnews.com';
  await page.goto(url);

  for (let i = 0; i < 40; i++) {
    await randomScroll(page);
    await simulateMouseMovement(page);
    const delay1 = await randomWait(45000, 60000);
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

  await browser.close();
})();
