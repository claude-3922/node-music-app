const express = require("express");
const router = express.Router();

const ytsr = require("@distube/ytsr");

router.get("/", (req, res, next) => {
  if (!req.query.q) {
    return res.status(400).json({
      message: "No query",
    });
  }

  ytsr(req.query.q, { safeSearch: true, limit: 7 })
    .then((result) => {
      let filteredResult = result.items.filter((item) => {
        const durationParts = item.duration.split(":");
        if (durationParts.length > 2) return false;
        const minutes = Number(durationParts[0]);

        return minutes < 10 && !item.isLive;
      });

      const videos = [];
      filteredResult.forEach((item) => {
        videos.push({
          title: item.name,
          id: item.id,
          thumbnail: item.thumbnail
            ? item.thumbnail
            : `http://localhost/images/def_thumbnail.png`,
          duration: item.duration,
          channel: item.author.name,
          channel_url: item.author.url,
        });
      });

      return res.status(200).json({
        query: result.query,
        videos: videos,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).json({
        err: err,
        message: "Error while searching for video",
      });
    });
});

module.exports = router;
