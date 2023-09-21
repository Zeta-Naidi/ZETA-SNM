const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: Array, required: false },
  tracks: { type: Array, required: true },
  userId: { type: String, required: true },
  shared: { type: Boolean, required: true },
});

module.exports = mongoose.model("Playlist", playlistSchema);
