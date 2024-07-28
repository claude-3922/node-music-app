const express = require("express");
const router = express.Router();
const ytdl = require("@distube/ytdl-core");

router.get("/thumbnail", (req, res, next) => {
  const songId = req.query.id;
  const defaultUrl = "http://localhost:6060/images/no_thumbnail.png";

  if (!songId) {
    return res.status(203).send(defaultUrl);
  }

  ytdl
    .getInfo(`https://youtube.com/watch?v=${songId}`)
    .then((info) => {
      const url =
        info.videoDetails.thumbnails[4]?.url ||
        info.videoDetails.thumbnails[3]?.url ||
        info.videoDetails.thumbnails[2]?.url ||
        info.videoDetails.thumbnails[1]?.url ||
        info.videoDetails.thumbnails[0]?.url ||
        defaultUrl;
      if (url === defaultUrl) {
        return res.status(404).send(url);
      } else {
        return res.status(200).send(url);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(defaultUrl);
    });
});

router.get("/", (req, res, next) => {
  const songId = req.query.id;

  if (!songId) {
    return res.status(203).json({
      message: "No song id query in request",
    });
  }

  ytdl
    .getInfo(`https://youtube.com/watch?v=${songId}`)
    .then((info) => {
      return res.status(200).json(info.videoDetails);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        message: "An error occured during fetching song data",
      });
    });
});

module.exports = router;
