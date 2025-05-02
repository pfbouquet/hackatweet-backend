const mongoose = require("mongoose");

const TweetSchema = mongoose.Schema({
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

const Tweet = mongoose.model("users", TweetSchema);

module.exports = Tweet;
