const express = require("express");
const router = express.Router();

const ytdl = require("@distube/ytdl-core");

router.get("/", (req, res, next) => {
  if (!req.query.id) {
    res.status(400).json({
      message: "No id given",
    });
  } else {
    const videoId = req.query.id;
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

        const readableStream = ytdl.downloadFromInfo(info, {
          format: format,
          dlChunkSize: Number(format.contentLength),
        });

        console.log(
          `[INFO] Downloading ${info.videoDetails.videoId}, size ${(
            Number(format.contentLength) /
            1024 /
            1024
          ).toPrecision(3)} MB`
        );

        readableStream.pipe(res);
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
