const puppeteer = require("puppeteer");

const BASE = "https://www.pakwheels.com/used-cars/search/-/featured_1/?nf=true&page=";

async function autoScroll(page) {
    await page.evaluate(async () => {
          await new Promise(resolve => {
                  let total = 0;
                  const timer = setInterval(() => {
                            window.scrollBy(0, 400);
                            total += 400;
                            if (total >= document.body.scrollHeight) {
                                        clearInterval(timer);
                                        resolve();
                            }
                  }, 400);
          });
    });
}

module.exports = async function scrapeCars(pages = 1) {
    const browser = await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-features=site-per-process"]
    });

    const page = await browser.newPage();
    const data = [];

    for (let i = 1; i <= pages; i++) {
          await page.goto(`${BASE}${i}`, { waitUntil: "domcontentloaded" });
          await page.waitForSelector("li.classified-listing");
          await autoScroll(page);

      const cars = await page.$$eval(
              "li.classified-listing.featured-listing",
              els => els.map(car => {
                        const t = car.querySelector("a.car-name");
                        const d = car.querySelector(".search-vehicle-info-2")?.innerText || "";
                        const p = d.split("|").map(x => x.trim());

                                     return {
                                                 title: t?.title || "",
                                                 price: car.querySelector(".price-details")?.innerText || "",
                                                 year: p[0] || "",
                                                 mileage_km: p[1] || "",
                                                 fuel: p[2] || "",
                                                 engine_cc: p[3] || "",
                                                 transmission: p[4] || "",
                                                 location: car.querySelector(".search-vehicle-info")?.innerText || "",
                                                 image_url:
                                                               car.querySelector("img")?.getAttribute("data-src") ||
                                                               car.querySelector("img")?.src
                                     };
              })
            );

      data.push(...cars);
    }

    await browser.close();
    return data;
};
