var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/kickup", (req, res) => {
  if (!checkBody(req.body, ["firstname", "username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then((newDoc) => {
        res.json({
          result: true,
          user: {
            firstname: newDoc.firstname,
            username: newDoc.username,
            token: newDoc.token,
          },
        });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists" });
    }
  });
});

router.post("/kickin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        user: {
          firstname: data.firstname,
          username: data.username,
          token: data.token,
          likedKicks: data.likedKicks,
        },
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

router.get("/:token", (req, res) => {
  if (!checkBody(req.params, ["token"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ token: req.params.token }).then((data) => {
    if (data) {
      res.json({
        result: true,
        user: {
          firstname: data.firstname,
          username: data.username,
          token: data.token,
          likedKicks: data.likedKicks,
        },
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User not found" });
    }
  });
});

module.exports = router;
