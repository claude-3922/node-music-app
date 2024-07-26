const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const express = require("express");
const router = express.Router();

/*
router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "placeholder",
  });
});
*/

router.get("/", (req, res, next) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).json({
      message: "No range headers",
    });
  } else {
    const videoId = "-Wg8ySt9tO0";
    const CHUNK_SIZE = 10 ** 7;

    const url = `https://youtube.com/watch?v=${videoId}`;

    const readableStream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
      dlChunkSize: CHUNK_SIZE,
    });

    readableStream.on("progress", (chunk_n, down_bytes, total_bytes) => {
      //console.log(`Downloaded ${down_bytes} B/${total_bytes} B`);
    });

    readableStream.pipe(res);
  }
});

module.exports = router;
