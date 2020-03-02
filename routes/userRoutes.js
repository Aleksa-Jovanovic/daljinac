const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Action = require("../models/actions");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

//Get users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Post user
router.post("/", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      const user = new User({
        username,
        password: hash
      });
      try {
        const newUser = await user.save();
        res.json(newUser).status(201);
      } catch (err) {
        res.json(err).status(400);
      }
    });
  });
});

//LOGIN USER
router.get("/login", async (req, res) => {
  const username = req.body.username;
  let password = req.body.password;

  try {
    const user = await User.findOne({ username });
    //console.log("KORISNIKOV PASS JE: " + user.password);
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        //dobar pass
        //console.log(user);
        jwt.sign(user.toJSON(), SECRET_KEY, (err, token) => {
          console.log("Pravim token");
          console.log(user.toJSON());
          res.json(token).status(200); //SIGNED IN
        });
      } else {
        //los pass
        res.status(404);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
