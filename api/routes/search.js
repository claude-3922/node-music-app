const YouTube = require("youtube-sr").default;
const express = require("express");
const router = express.Router();
const SearchHistory = require("../models/searchHistory");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
  res.status(400).json({
    message: "Use GET /search/query to search for songs.",
  });
  //show html page showing a search bar and shi
});

router.post("/", (req, res, next) => {
  YouTube.search(req.query.q, { limit: 5 })
    .then((videos) => {
      let videoData = [];

      videos.forEach((video) => {
        videoData.push({
          title: video.title,
          id: video.id,
          channel_id: video.channel.id,
        });
      });

      const history = new SearchHistory({
        _id: new mongoose.Types.ObjectId(),
        query: req.query.q,
        result: videoData,
        time: Date.now(),
        time_formatted: new Date().toLocaleString(),
      });

      history
        .save()
        .then((result) => {
          console.log(
            `Saved document to history database, document id: ${result._id}`
          );
          res.status(200).json({
            message: "Saved document to history database",
            data: result,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Error while fetching database",
            error: err,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error while searching youtube",
        error: err,
      });
    });
});

router.get("/:query", (req, res, next) => {
  res.redirect(301, `/search/${req.params.query}`);
  //get rid of this later idk
});

module.exports = router;
