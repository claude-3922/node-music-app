const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const Player = require("./api/models/player");

const searchRoutes = require("./api/routes/search");
const playRoutes = require("./api/routes/play");
const songDataRoutes = require("./api/routes/songData");

mongoose.connect(process.env.mongo_url).then(() => {
  console.log("INFO Connected to mongoDB!");
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

app.set("view engine", "ejs");

app.use("/search", searchRoutes);
app.use("/play", playRoutes);
app.use("/songData", songDataRoutes);

app.use("/index", async (req, res, next) => {
  const user = `admin`; //implement something that fetches the current user 

  let songId;
  const data = await Player.findOne({ user: user });

  if(data) {
    songId = data.now_playing.videoId;
  }

  res.render("index", { songId: songId });
});

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  const error = new Error("Route doesn't exist.");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.log(`ERROR ${error.message}`);
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
module.exports = app;
