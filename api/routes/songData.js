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
      const url = info.videoDetails.thumbnails[0].url;
      return res.status(200).send(url);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(defaultUrl);
    });
});

module.exports = router;
