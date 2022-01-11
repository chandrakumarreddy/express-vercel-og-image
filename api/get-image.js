const express = require("express");
const router = express.Router();
const chrome = require("chrome-aws-lambda");
const puppeteer = require("puppeteer");
const path = require("path");
const pug = require("pug");

async function generateImage(html) {
  const browser = await puppeteer.launch(
    process.env.AWS_EXECUTION_ENV
      ? {
          args: [
            ...chrome.args,
            "--hide-scrollbars",
            "--disable-web-security",
            "--window-size=312,312",
          ],
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
    fullPage: false,
    type: "png",
  });
  await Promise.all[
    (page.setViewport({ width: 312, height: 312, deviceScaleFactor: 2 }),
    page.setContent(html, { waitUntil: "domcontentloaded" }))
  ];
  await page.evaluate(async () => {
    const selectors = Array.from(document.querySelectorAll("img"));
    await Promise.all([
      document.fonts.ready,
      ...selectors.map((img) => {
        if (img.complete) {
          if (img.naturalHeight !== 0) return;
          throw new Error("Image failed to load");
        }
        return new Promise((resolve, reject) => {
          img.addEventListener("load", resolve);
          img.addEventListener("error", reject);
        });
      }),
    ]);
  });
  const data = await page.screenshot({
    type: "png",
  });
  await page.close();
  return data;
}

router.get("/", async (req, res) => {
  const template = req.query.template || "achievement";
  const template_data = Buffer.from(
    req.query.template_data,
    "base64"
  ).toString();
  const html = pug.renderFile(
    `${path.join(__dirname, `../template/${template}.pug`)}`,
    JSON.parse(template_data)
  );
  const data = await generateImage(html);
  res.setHeader(
    "Cache-Control",
    "s-maxage=31536000, max-age=31536000, stale-while-revalidate"
  );
  res.setHeader("Content-Type", "image/png");
  res.end(data);
});

module.exports = router;
