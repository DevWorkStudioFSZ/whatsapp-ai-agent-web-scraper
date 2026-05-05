const router = require("express").Router();
const ctrl = require("../controllers/carController");

router.get("/", ctrl.home);
router.get("/dashboard", ctrl.dashboard);
router.post("/scrape", ctrl.scrape);
router.get("/export/csv", ctrl.exportCSV);
router.get("/export/excel", ctrl.exportExcel);

module.exports = router;
