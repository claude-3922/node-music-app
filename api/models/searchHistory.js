const mongoose = require("mongoose");

const searchHistorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: String, default: "admin" },
  query: String,
  result: [ Object ],
  time: Number,
  time_formatted: String,
});

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
