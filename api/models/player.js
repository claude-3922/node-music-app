const mongoose = require("mongoose");

const playerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: String, default: "admin", required: true, unique: true },
  now_playing: { type: Object, default: {} },
  queue: { type: [Object], default: [] },
});

module.exports = mongoose.model("player", playerSchema);
