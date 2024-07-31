const express = require("express");
const router = express.Router();

const ytdl = require("@distube/ytdl-core");

router.get("/", (req, res, next) => {
  const songId = req.query.id;

  if (!songId) {
    return res.status(400).json({
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
