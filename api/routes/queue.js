const ytdl = require("@distube/ytdl-core");

const mongoose = require("mongoose");
const Player = require("../models/player");

const express = require("express");
const router = express.Router();


router.get("/", async (req, res, next) => {
  const user = req.query.user;

  if (!user) {
    return res.status(400).json({
      message: "No username given in url",
    });
  }

  const userDocument = await Player.findOne({ user: user });
  if (!userDocument) {
    return res.status(204).json({
      message: "No document found for given user",
    });
  }

  res.status(200).json({
    queue: userDocument.queue,
  });
});

router.get("/now_playing", async (req, res, next) => {
  const user = req.query.user;

  if (!user) {
    return res.status(400).json({
      message: "No username given in url",
    });
  }

  const userDocument = await Player.findOne({ user: user });
  if (!userDocument) {
    return res.status(204).json({
      message: "No document found for given user",
    });
  }

  res.status(200).json({
    now_playing: userDocument.now_playing,
  });
});

router.post("/add", async (req, res, next) => {
  const user = req.body.user;
  const songId = req.body.id;

  if (!user || !songId) {
    return res.status(400).json({
      message: "Insufficient information in request body",
    });
  }

  if (!ytdl.validateID(songId)) {
    return res.status(400).json({
      message: "Song ID invalid",
    });
  }

  const songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${songId}`);
  if (!songInfo) {
    return res.status(404).json({
      message: "Error while fetching data for song",
    });
  }

  let queue = [];

  const userDocument = await Player.findOne({ user: user });
  if (!userDocument) {
    console.log(
      `[INFO] Player for current user ${user} doesn't exist, creating a new document`
    );
    queue.push(songInfo.videoDetails);
    const playerState = new Player({
      _id: new mongoose.Types.ObjectId(),
      user: user,
      now_playing: {},
      queue: queue,
    });
    await playerState.save();
  } else {
    queue = userDocument.queue;
    queue.push(songInfo.videoDetails);
    let update = await Player.updateOne({ user: user }, { queue: queue });
    if (!update.acknowledged) {
      console.log(
        `[INFO] Error while updating user ${user}'s document, see database to diagnose`
      );
    }
  }

  return res.status(200).json({ queue: queue });
});

router.post("/remove", async (req, res, next) => {
  const user = req.body.user;

  if (!user) {
    return res.status(400).json({
      message: "Insufficient information in request body",
    });
  }

  let queue = [];

  const userDocument = await Player.findOne({ user: user });
  if (!userDocument) {
    console.log(
      `[INFO] Player for current user ${user} doesn't exist, can't remove from queue`
    );
    return res.status(204).json({
      message: "User doesn't have a queue",
    });
  } else {
    queue = userDocument.queue;

    if (queue.length === 0) {
      console.log(`[INFO] User queue already empty, redundant request`);
    } else {
      queue.shift();
      console.log(`[INFO] User queue found, shifting it`);
    }
    let update = await Player.updateOne({ user: user }, { queue: queue });
    if (!update.acknowledged) {
      console.log(
        `[INFO] Error while updating user ${user}'s document, see database to diagnose`
      );
    }
  }

  return res.status(200).json({ queue: queue });
});

module.exports = router;
