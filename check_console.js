import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warning' || msg.type() === 'log') {
                console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
            }
        });

        page.on('pageerror', err => {
            console.error(`[BROWSER UNCAUGHT ERROR] ${err.toString()}`);
        });

        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

        console.log('Clicking login...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => { }),
            page.click('button[type="submit"]')
        ]);

        // Wait another 2 seconds to make sure dashboard tries to load
        await new Promise(r => setTimeout(r, 2000));

        const rootHtml = await page.$eval('#root', el => el.innerHTML).catch(() => 'NO #root element');
        console.log('Root HTML after login:', rootHtml.substring(0, 500));

        await browser.close();
        console.log('Check complete.');
    } catch (err) {
        console.error('Puppeteer Error:', err);
    }
})();
