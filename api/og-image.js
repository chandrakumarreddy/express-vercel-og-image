const express = require("express");
const router = express.Router();
const chrome = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

router.get("/", async (req, res) => {
  const browser = await puppeteer.launch(
    process.env.AWS_EXECUTION_ENV
      ? {
          args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
          executablePath: await chrome.executablePath,
          headless: true,
        }
      : {
          args: [],
          executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        }
  );

  const page = await browser.newPage({
    viewport: {
      width: 1200,
      height: 720,
    },
  });
  const url = req.query.path;
  const selector = req.query.selector;
  await page.goto(url);
  let data;
  if (selector) {
    data = await page.locator(selector).screenshot({
      type: "png",
    });
  } else {
    data = await page.screenshot({
      type: "png",
    });
  }
  await browser.close();
  res.setHeader(
    "Cache-Control",
    "s-maxage=31536000, max-age=31536000, stale-while-revalidate"
  );
  res.setHeader("Content-Type", "image/png");
  res.end(data);
});

module.exports = router;
