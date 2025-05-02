const mongoose = require("mongoose");

const TweetSchema = mongoose.Schema({
  author: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
  sentAtTimestamp: Number,
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
