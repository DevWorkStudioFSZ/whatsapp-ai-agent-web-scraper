const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3000;

const BASE_URL = "https://www.office.fedex.com";
// const BASE_URL = "https://www.allegramarketingprint.com/locations/cheektowaga-ny";
// const BASE_URL = "https://buffalodesignandprinting.com/";
const UNWANTED_PHRASES = [
    "Currently Unavailable", "We're sorry", "Shipping Estimates",
    "SHIP TO", "SHIP TO REGION", "SHIP TO ZIP CODE",
    "USE MY LOCATION", "Please Note",
    "Actual cost is subject to change",
    "The estimates provided are based on",
    "Location icon", "Vector graphics"
  ];

async function autoScroll(page) {
    await page.evaluate(async () => {
          await new Promise(resolve => {
                  let totalHeight = 0;
                  const distance = 200;
                  const timer = setInterval(() => {
                            const scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;
                            if (totalHeight >= scrollHeight) {
                                        clearInterval(timer);
                                        resolve();
                            }
                  }, 200);
          });
    });
}


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));


app.get('/scrape', async (req, res) => {
    try {
          const browser = await puppeteer.launch({
                  headless: true,
                  args: ["--no-sandbox", "--disable-setuid-sandbox"]
          });

      const page = await browser.newPage();


      await page.setRequestInterception(true);
          page.on('request', req => {
                  if(['image','stylesheet','font'].includes(req.resourceType())) req.abort();
                  else req.continue();
          });

      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36");
          await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 180000 });


      let productLinks = await page.evaluate(() => {
              const links = new Set();
              document.querySelectorAll("a[href]").forEach(a => {
                        const href = a.getAttribute("href");
                        if (href && href.startsWith("/default/") && href.endsWith(".html")) {
                                    links.add(new URL(href, location.origin).href);
                        }
              });
              return Array.from(links);
      });

      console.log(`Found ${productLinks.length} products.`);


      productLinks = productLinks.slice(0, 10);


      const results = await Promise.all(productLinks.map(async (url) => {
              const p = await browser.newPage();
              try {
                        await p.goto(url, { waitUntil: 'networkidle2', timeout: 180000 });


                const data = await p.evaluate((UNWANTED_PHRASES) => {
                            const title = document.querySelector("span[data-ui-id='page-title-wrapper']")?.innerText.trim() || "Not Found";
                            const image = document.querySelector("img.product-image-photo")?.src || "Not Found";
                            const infoDiv = document.querySelector("div.product-info-main.mt-95-lg");
                            let details = "Not Found";

                                                        if (infoDiv) {
                                                                      infoDiv.querySelectorAll("input, select, option, form, button, svg, path").forEach(el => el.remove());
                                                                      const lines = infoDiv.innerText.split("\n").map(l => l.trim()).filter(l => 
                                                                                                                                                          l && !UNWANTED_PHRASES.some(bad => l.toLowerCase().includes(bad.toLowerCase()))
                                                                                                                                                        );
                                                                      details = lines.join("\n");
                                                        }

                                                        return { url: location.href, title, image, details };
                }, UNWANTED_PHRASES);

                await p.close();
                        return data;

              } catch (err) {
                        await p.close();
                        return { url, title: "Failed", image: "N/A", details: err.message };
              }
      }));

      await browser.close();
          res.json(results);

    } catch (err) {
          res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
