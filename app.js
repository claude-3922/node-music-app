const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const searchRoutes = require("./api/routes/search");

app.use(morgan("dev"));
app.use(cors())

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/search", searchRoutes);

app.use((req, res, next) => {
  const error = new Error("Route doesn\'t exist.");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
module.exports = app;
