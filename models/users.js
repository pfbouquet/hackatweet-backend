const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  firstname: String,
  username: String,
  password: String,
  token: String,
  signupAtTimestamp: {
    type: Number,
    default: Math.floor(new Date().getTime() / 1000),
  },
  likedKicks: [
    {
      type: mongoose.Types.ObjectId,
      ref: "kicks",
    },
  ],
});

const User = mongoose.model("users", UserSchema);

module.exports = User;
