const express = require("express");
const router = express.Router();

const SearchHistory = require("../models/searchHistory");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
  const user = "admin"; //implement something that would fetch a user's username

  SearchHistory.find({ user: user })
    .exec()
    .then((data) => {
      if (!data?.length) {
        res.status(400).json({
          message: "No history for given user",
        });
      } else {
        res.status(200).json({
          message: "Found history for current user",
          data: data,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Internal error",
        data: err,
      });
    });
});

module.exports = router;
