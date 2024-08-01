const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const searchRoutes = require("./api/routes/search");
const playRoutes = require("./api/routes/play");
const songDataRoutes = require("./api/routes/songData");
const queueRoutes = require("./api/routes/queue");

const Player = require("./api/models/player");

mongoose.connect(process.env.mongo_url).then(() => {
  console.log("[INFO] Connected to mongoDB!");
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
app.use("/queue", queueRoutes);

app.use("/index", async (req, res, next) => {
  const user = `admin`; //implement something that fetches the current user

  let songId;
  let queue = [];

  try {
    const userDoc = await Player.findOne({ user: user });
    if (userDoc) {
      let currentQueue = userDoc.queue;
      let currentSong = userDoc.now_playing;

      if (Object.keys(currentSong).length !== 0) {
        songId = currentSong.videoId;
      } else {
        songId =
          currentQueue.length > 0 ? currentQueue.shift().videoId : undefined;
      }
      queue = currentQueue.length > 0 ? currentQueue : [];
      const update = await Player.updateOne({ user: user }, { queue: queue });
      if (!update.acknowledged) {
        console.log(
          `[INFO] Error while updating user ${user}'s document, see database to diagnose`
        );
      }

      const prevQueueUpdate = await Player.updateOne(
        { user: user },
        { previous_queue: [] }
      );
      if (!prevQueueUpdate.acknowledged) {
        console.log(
          `[INFO] Error while updating user ${user}'s document, see database to diagnose`
        );
      }
    }

    res.render("index", { songId: songId, queue: queue });
  } catch (err) {
    console.log(err);
  }
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
