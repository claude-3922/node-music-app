const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "GET /search initiated",
  });
});

router.post("/", (req, res, next) => {
  console.log(req.body)
  return;
  /*
  const queryResult = {
    name: req.body.name,
    id: req.body.id,
  };
  */

  res.status(201).json({
    message: "POST /search initiated",
    name: req.body.name,
    id: req.body.id
    //queryResult: queryResult,
  });
});

router.get("/:query", (req, res, next) => {
  const query = req.params.query;
  if (query === "skibidi") {
    res.status(200).json({
      message: "you discovered skibidi",
      query: query,
    });
  } else {
    res.status(200).json({
      message: "GET /search/query initiated",
      query: query,
    });
  }
});

module.exports = router;
