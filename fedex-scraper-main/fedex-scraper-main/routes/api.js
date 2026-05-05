const express = require("express");
const router = express.Router();
const scraper = require("../services/scraper");

router.get("/products", async (req, res) => {
      const data = await scraper.getAllProducts();
      res.json(data);
});

router.get("/search/name", async (req, res) => {
      const q = req.query.q || "";
      const data = await scraper.searchByName(q);
      res.json(data);
});

router.get("/search/price", async (req, res) => {
      const p = req.query.p;
      const data = await scraper.searchByPrice(p);
      res.json(data);
});

module.exports = router;
