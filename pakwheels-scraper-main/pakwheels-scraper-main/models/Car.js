const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    title: String,
    price: String,
    price_value: Number,
    year: String,
    mileage_km: String,
    fuel: String,
    engine_cc: String,
    transmission: String,
    location: String,
    image_url: String
}, { timestamps: true });

module.exports = mongoose.model("Car", carSchema);
