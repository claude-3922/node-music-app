const express = require("express");
const router = express.Router();

const ytdl = require("@distube/ytdl-core");
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
          let userDocument = await Player.findOne({ user: user });
          if (!userDocument) {
            console.log(
              `[INFO] Player for current user ${user} doesn't exist, creating a new document`
            );
            const playerState = new Player({
              _id: new mongoose.Types.ObjectId(),
              user: user,
              now_playing: info.videoDetails,
              queue: [],
            });
            await playerState.save();
          } else {
            let update = await Player.updateOne(
              { user: user },
              { now_playing: info.videoDetails }
            );
            if (!update.acknowledged) {
              console.log(
                `[INFO] Error while updating user ${user}'s document, see database to diagnose`
              );
            }
          }
          let end = new Date().getTime();
          console.log(
            `[INFO] Updated document for user ${user}, took ${end - start}ms`
          );

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
