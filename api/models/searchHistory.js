const mongoose = require("mongoose");

const searchHistorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: String, default: "admin", required: true },
  query: { type: String, required: true },
  result: { type: [Object], required: true },
  time: { type: Number, required: true },
  time_formatted: String,
});

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
