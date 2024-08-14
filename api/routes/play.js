const express = require("express");
const router = express.Router();

const ytdl = require("@distube/ytdl-core");

exports.getInfoAndDownload = async (req, res, next, url) => {
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
        ).toPrecision(4)} MB`
      );

      res.setHeader("Accept-Ranges", "bytes");
      res.statusCode = 206;

      readableStream.pipe(res);
      readableStream.on("error", async (err) => {
        console.log(err);
        res.status(500).json({
          message: "Error while piping back audio",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Error while piping back audio",
      });
    });
};

router.get("/", async (req, res, next) => {
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

    await this.getInfoAndDownload(req, res, next, url);
  }
});

module.exports = router;
