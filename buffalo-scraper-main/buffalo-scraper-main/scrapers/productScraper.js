const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

const { BASE_URL, HEADERS, UNWANTED_PHRASES } = require("../config/constants");
const cleanProductInfo = require("../utils/cleaner");

// Category URLs (You can add more)
const CATEGORY_URLS = [
    "https://buffalodesignandprinting.com/product-category/business-cards/",
    "https://buffalodesignandprinting.com/product-category/flyers/",
    "https://buffalodesignandprinting.com/product-category/printing/"
  ];

async function getProductLinks() {
    const productLinks = new Set();

  for (const category of CATEGORY_URLS) {
        const { data } = await axios.get(category, { headers: HEADERS });
        const $ = cheerio.load(data);

                                                        $("a[href]").each((_, el) => {
                                                                const href = $(el).attr("href");

                                                                                if (href && href.includes("/product/")) {
                                                                                          const fullUrl = new URL(href, BASE_URL).href;
                                                                                          productLinks.add(fullUrl);
                                                                                }
                                                        });
  }

  return Array.from(productLinks);
}

async function scrapeProduct(url) {
    const { data } = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(data);

  const title =
        $("h1.product_title").first().text().trim() || "Not Found";

  const infoDiv = $(".woocommerce-product-details__short-description");

  const details = infoDiv.length
      ? cleanProductInfo($, infoDiv, UNWANTED_PHRASES)
        : "Not Found";

  return {
        url,
        title,
        details
  };
}

module.exports = {
    getProductLinks,
    scrapeProduct
};
