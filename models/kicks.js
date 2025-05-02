const mongoose = require("mongoose");

const KickSchema = mongoose.Schema({
  author: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
  message: String,
  sentAtTimestamp: Number,
  nbLikes: {
    type: Number,
    default: 0,
  },
});

const Kick = mongoose.model("kicks", KickSchema);

module.exports = Kick;
