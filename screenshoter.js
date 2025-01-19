const puppeteer = require('puppeteer');
const fs = require('fs');

const { SCREENSHOTS_OUTPUT_DIRECTORY } = require('./config');

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Load HTML page
    const contentHtml = fs.readFileSync('./comments.html', 'utf8');
    await page.setContent(contentHtml);

    // Select all comments
    const comments = await page.$$('.comment__wrapper');

    ensureDirectoryExists(SCREENSHOTS_OUTPUT_DIRECTORY);

    // Screenshot each comment
    for (let i = 0; i < comments.length; i++) {
        await comments[i].screenshot({ path: `./${SCREENSHOTS_OUTPUT_DIRECTORY}/comment-${i}.png` });
    }

    await browser.close();
})();
