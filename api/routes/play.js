const ytdl = require("@distube/ytdl-core");
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Player = require("../models/player");

router.get("/", (req, res, next) => {
  if (!req.query.id) {
    res.status(400).json({
      message: "No id given",
    });

  } else {
    const videoId = req.query.id;
    const user = "admin";
    const url = `https://youtube.com/watch?v=${videoId}`;

    if (!ytdl.validateID(videoId)) {
      return res.status(400).json({
        message: "No valid id given",
      });
    }

    ytdl
      .getInfo(url)
      .then(async (info) => {
        if (
          info.videoDetails.isLive ||
          info.videoDetails.lengthSeconds > 60 * 10
        ) {
          return res.status(413).json({
            message:
              "Video is either a livestream or is longer than 10 minutes. Can't play.",
          });
        }

        const format = ytdl.chooseFormat(info.formats, {
          filter: "audioonly",
          quality: "highestaudio",
        });

        try {
          let start = new Date().getTime();
          
          if ((await Player.countDocuments({ user: user })) > 0) {
            await Player.deleteMany({ user: user });
          }
          const playerState = new Player({
            _id: new mongoose.Types.ObjectId(),
            user: user,
            now_playing: info.videoDetails,
            queue: [],
          });

          await playerState.save();

          let end = new Date().getTime();
          console.log(`INFO Saved document to database, took ${end-start}ms`);

          const readableStream = ytdl.downloadFromInfo(info, {
            format: format,
          });

          readableStream.pipe(res);
        } catch (err) {
          return console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: "Error while piping back audio",
        });
      });
  }
});

module.exports = router;
