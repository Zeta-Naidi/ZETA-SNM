const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

require("dotenv").config();

const router = express.Router();

// User Registration
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please fill out all fields." });
  }

  const newUser = new User({
    username,
    email,
    password: bcrypt.hashSync(password, 10),
  });

  newUser
    .save()
    .then(async () => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        if (!bcrypt.compareSync(password, user.password)) {
          return res.status(401).json({ message: "Authentication failed." });
        }

        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.SECRET_KEY,
          {
            expiresIn: 86400, // 24 hours
          }
        );

        res.status(200).json({ auth: true, token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
      }
      //res.status(201).json({ message: "Registration successful." });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "Registration failed." });
    });
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      {
        expiresIn: 86400, // 24 hours
      }
    );

    res.status(200).json({ auth: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
