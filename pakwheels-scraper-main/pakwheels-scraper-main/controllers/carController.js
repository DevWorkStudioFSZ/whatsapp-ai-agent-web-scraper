const Car = require("../models/Car");
const scrapeCars = require("../scrapers/pakwheels");
const ExcelJS = require("exceljs");
const { createObjectCsvWriter } = require("csv-writer");

exports.home = (req, res) => {
    res.render("index");
};

exports.dashboard = async (req, res) => {
    const cars = await Car.find().limit(50);
    res.render("dashboard", { cars });
};

exports.scrape = async (req, res) => {
    const pages = req.body.pages || 1;
    const cars = await scrapeCars(pages);

    await Car.deleteMany({});
    await Car.insertMany(cars);

    res.json({ success: true, count: cars.length });
};

exports.exportCSV = async (req, res) => {
    const cars = await Car.find();
    const csvWriter = createObjectCsvWriter({
          path: "exports/cars.csv",
          header: Object.keys(cars[0]._doc).map(k => ({ id: k, title: k }))
    });
    await csvWriter.writeRecords(cars.map(c => c._doc));
    res.download("exports/cars.csv");
};

exports.exportExcel = async (req, res) => {
    const cars = await Car.find();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Cars");
    ws.columns = Object.keys(cars[0]._doc).map(k => ({ header: k, key: k }));
    cars.forEach(c => ws.addRow(c._doc));
    await wb.xlsx.writeFile("exports/cars.xlsx");
    res.download("exports/cars.xlsx");
};
