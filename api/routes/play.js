const fs = require("fs");
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

    //implement something which remembers user's last queued song and play it
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
        if (info.videoDetails.isLive || info.videoDetails.lengthSeconds > 600) {
          return res.status(203).json({
            message:
              "Video is either a livestream or is longer than 10 minutes. Can't play.",
          });
        }

        const format = ytdl.chooseFormat(info.formats, {
          filter: "audioonly",
          quality: "highestaudio",
        });

        try {
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

          const readableStream = ytdl.downloadFromInfo(info, {
            format: format,
          });

          //const path = __dirname + `/temp/${user}_${req.body.id}.mp3`;
          readableStream.pipe(res);

          readableStream.on("finish", () => {
            //return res.sendFile(path);
          });
        } catch (err) {
          return console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.get("/get_thumbnail", async (req, res, next) => {
  if (!req.query.id) {
    res.status(404).send("http://localhost:6060/images/larva.png");
  }

  const url = `https://youtube.com/watch?v=${req.query.id}`;

  ytdl
    .getInfo(url)
    .then((info) => {
      return res.status(200).send(`${info.thumbnail_url}`);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send("http://localhost:6060/images/larva.png");
    });
});

module.exports = router;
