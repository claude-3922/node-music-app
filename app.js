const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const searchRoutes = require("./api/routes/search");
const historyRoutes = require("./api/routes/history");
const playRoutes = require("./api/routes/play");

mongoose.connect(process.env.mongo_url).then(() => {
  console.log("Connected to mongoDB!");
});

app.use(morgan("dev"));
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.get("/", (req, res, next) => {
  res.status(200).sendFile(__dirname + "/view/index.html");
});

app.use("/search", searchRoutes);
app.use("/history", historyRoutes);
app.use("/play", playRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  const error = new Error("Route doesn't exist.");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
module.exports = app;
