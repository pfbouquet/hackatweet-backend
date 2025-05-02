const mongoose = require("mongoose");

const KickSchema = mongoose.Schema({
  author: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
  sentAtTimestamp: {
    type: Number,
    default: Math.floor(new Date().getTime() / 1000),
  },
  message: String,
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
  ],
});

const Kick = mongoose.model("kicks", KickSchema);

module.exports = Kick;
