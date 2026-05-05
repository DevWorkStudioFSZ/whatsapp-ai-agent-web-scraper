require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const carRoutes = require("./routes/carRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("
