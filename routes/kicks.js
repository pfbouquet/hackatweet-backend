var express = require("express");
var router = express.Router();

const User = require("../models/users");
const Kick = require("../models/kicks");
const Trend = require("../models/trends")
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

// POST /kicks/new --> post a new kick (body needs message and token)
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
          .then((kick) => {

        //Add trend if # in kick
        const regex = /#[\wÀ-ÖØ-öø-ÿ]+/g
        const tab = kick.message.match(regex)
        //map of # in order to create or update numbers of ID
        tab.map((hashtag) => {
          Trend.findOne({name: hashtag}).then(
            trend => {
              if (trend) { // if trend exist > add one more kickID to trend
                Trend.updateOne(
                  { name: hashtag },
                  { $push: { kicks: kick._id } }
                ).exec();
              } else { // if trend doesn't exist > create trend and add first kickID
                newTrend = new Trend({
                  name: hashtag,
                  kicks: [kick._id]
                 })
                console.log(`saving new trend ${hashtag}`)
                newTrend.save()
              }
            }
          )
        })

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
    .then((kick) => {

      if (kick) {
      // remove kickID from trends
      Trend.updateMany(
        { kicks: req.params.kickId },
        { $pull: { kicks: req.params.kickId } }
      ).then()
        res.json({
          result: true,
          deletedCount: kick.deletedCount,
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

// POST /kicks/like --> Add or remove the kick to the User, and increment the nbLikes counter on the Kick
router.post("/like", (req, res) => {
  if (!checkBody(req.body, ["likerToken", "kickId"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ token: req.body.likerToken })
    .then((liker) => {
      if (liker) {
        // found user, then check likedKicks
        if (liker.likedKicks.includes(req.body.kickId)) {
          // remove from likedKicks
          User.updateOne(
            { token: req.body.likerToken },
            { $pull: { likedKicks: req.body.kickId } }
          ).then((data) => {
            // update counter nbLikes-1 on Kicks
            Kick.findByIdAndUpdate(req.body.kickId, {
              $inc: { nbLikes: -1 },
            })
              .populate("author", { firstname: 1, username: 1 })
              .then((kick) => {
                res.json({
                  result: true,
                  kick: kick,
                  like: false,
                  message: "removed like",
                });
              });
          });
        } else {
          // add to likedKicks
          User.updateOne(
            { token: req.body.likerToken },
            { $push: { likedKicks: req.body.kickId } }
          ).then((data) => {
            // update counter nbLikes+1 on Kicks
            Kick.findByIdAndUpdate(req.body.kickId, {
              $inc: { nbLikes: 1 },
            })
              .populate("author", { firstname: 1, username: 1 })
              .then((kick) => {
                res.json({
                  result: true,
                  kick: kick,
                  like: true,
                  message: "added like",
                });
              });
          });
        }
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
