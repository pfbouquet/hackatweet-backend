var express = require("express");
var router = express.Router();

const User = require("../models/users");
const Kick = require("../models/kicks");
const { checkBody } = require("../modules/checkBody");

// GET /kicks/all --> retrieve all kicks
router.get("/all", (req, res) => {
  Kick.find()
    .populate("author", { firstname: 1, username: 1 })
    .then((data) => {
      if (data) {
        res.json({
          result: true,
          kicks: data,
        });
      } else {
        res.json({ result: false, error: "Failed getting kicks" });
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.json({
        result: false,
        message: error.message,
      });
    });
});

// GET /kicks/new --> post a new kick (body needs message and token)
router.post("/new", (req, res) => {
  if (!checkBody(req.body, ["message", "token"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // get user who posted
  User.findOne({ token: req.body.token })
    .then((data) => {
      if (data) {
        // found user, then post kick
        newKick = new Kick({
          author: data._id,
          message: req.body.message,
        });

        newKick
          .save()
          .then((data) => {
            res.json({
              result: true,
              message: "Posted a kick !",
              kick: data,
            });
          })
          .catch((error) => {
            console.log(error.message);
            res.json({
              result: false,
              message: error.message,
            });
          });
      } else {
        res.json({
          result: false,
          error: "Failed to find kick author from token",
        });
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.json({
        result: false,
        message: error.message,
      });
    });
});

// DELETE /kicks/delete/:kickId --> delete a kick (needs a parm containing kickId)
router.delete("/delete/:kickId", (req, res) => {
  if (!checkBody(req.params, ["kickId"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // Delete
  Kick.deleteOne({ _id: req.params.kickId })
    .then((data) => {
      if (data) {
        res.json({
          result: true,
          deletedCount: data.deletedCount,
        });
      } else {
        res.json({ result: false, error: "Failed to delete" });
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.json({
        result: false,
        message: error.message,
      });
    });
});

// POST /kicks/like --> Add user to a kick, or remove if already there
router.post("/like", (req, res) => {
  if (!checkBody(req.body, ["likerToken", "kickId"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ token: req.body.likerToken })
    .then((liker) => {
      if (liker) {
        // found user, then find kick
        Kick.findById(req.body.kickId)
          .then((kick) => {
            if (kick) {
              if (kick.likes.includes(liker._id)) {
                // remove liker._id from kick.likes
                Kick.updateOne(
                  { _id: req.body.kickId },
                  {
                    $pull: { likes: liker._id },
                  }
                ).then((data) => {
                  res.json({
                    result: true,
                    kickId: req.body.kickId,
                    likerToken: req.body.likerToken,
                    like: false,
                    message: "removed like",
                  });
                });
              } else {
                // add liker._id from kick.likes
                Kick.updateOne(
                  { _id: req.body.kickId },
                  {
                    $push: { likes: liker._id },
                  }
                ).then((data) => {
                  res.json({
                    result: true,
                    kickId: req.body.kickId,
                    likerToken: req.body.likerToken,
                    like: true,
                    message: "added like",
                  });
                });
              }
            } else {
              res.json({
                result: false,
                error: "Failed to find kick from kickId",
              });
            }
          })
          .catch((error) => {
            console.log(error.message);
            res.json({
              result: false,
              message: error.message,
            });
          });
      } else {
        res.json({
          result: false,
          error: "Failed to find user from token",
        });
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.json({
        result: false,
        message: error.message,
      });
    });
});

module.exports = router;
