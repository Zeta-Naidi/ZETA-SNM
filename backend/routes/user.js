const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Playlist = require("../models/Playlist");
const verifyToken = require("../middleware/authMiddleware");
const Cookies = require("js-cookie");

require("dotenv").config();

const router = express.Router();

router.get("/profile", verifyToken, async (req, res) => {
  try {
    // Get the user ID from the decoded JWT
    const userId = req.user.id;

    // Fetch user data from the database using the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json();
    }

    // Return all user data in the response
    res.status(202).json({ user });
  } catch (error) {
    res.status(500).json();
  }
});

// UPDATE user data
router.put("/update-user/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  let updatedUserData = req.body;

  // If the password is provided and not empty, hash it
  if (updatedUserData.password && updatedUserData.password.trim() !== "") {
    updatedUserData.password = bcrypt.hashSync(updatedUserData.password, 10);
  } else {
    // If the password is empty, remove it from the update data
    const { password, ...userDataWithoutPassword } = updatedUserData;
    updatedUserData = userDataWithoutPassword;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json();
  }
});

// DELETE route for account deletion
router.delete("/delete-account", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Find the user by ID and delete them
    await User.findByIdAndDelete(userId);

    res.status(200).json();
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json();
  }
});

router.get("/users-list", verifyToken, async (req, res) => {
  // Fetch user data from your database or wherever you store it
  const users = await User.find({});

  if (!users) {
    return res.status(404).json();
  }

  // Return user data in the response
  res.status(200).json(users);
});

//api spotify get musics
router.post("/music", async (req, res) => {
  const { query, type } = req.body;

  const clientId = process.env.SPOTIFY_API_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_API_SECRET;

  fetch(process.env.SPOTIFY_API_CALLBACK, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  })
    .then((response) => {
      return response.json();
    })
    .then((tokenResponse) => {
      token = tokenResponse;
      Cookies.set("tokenAPI", token, { expires: 1 });
      const apiUrl = `https://api.spotify.com/v1/search?q=${query}&type=${type}`;
      // Now that you have the token, make the Spotify API request
      fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.access_token,
        },
      })
        .then((response) => response.json())
        .then((searchResults) => {
          res.status(200).json(searchResults);
        });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

router.get("/users-playlists", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const playlists = await Playlist.find({ userId }); // Find playlists for the given userId

  if (!playlists) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  // Return user data in the response
  res.status(200).json(playlists);
});

//insert new playlist
router.post("/users-playlists", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const { title, description, tags, tracks } = req.body;
  const shared = false;

  try {
    const newPlaylist = new Playlist({
      title,
      description,
      tags,
      tracks,
      userId,
      shared,
    });

    newPlaylist.save();
    res.status(200).json(newPlaylist);
  } catch (error) {
    res.status(500).json();
  }
});

//delete playlist
router.delete("/delete-users-playlists/:id", verifyToken, async (req, res) => {
  const PlaylistId = req.params.id;

  try {
    await Playlist.findByIdAndDelete(PlaylistId);
    res.status(200).json();
  } catch (error) {
    res.status(500).json();
  }
});

// UPDATE playlist data
router.put("/update-users-playlists/:id", verifyToken, async (req, res) => {
  const PlaylistId = req.body._id;
  let updatedPlaylistData = req.body;

  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      PlaylistId,
      updatedPlaylistData,
      {
        new: true,
      }
    );
    res.status(200).json();
  } catch (error) {
    res.status(500).json();
  }
});

//get the public playlists
router.get("/public-playlists", verifyToken, async (req, res) => {
  const publicPlaylists = await Playlist.aggregate([
    {
      $match: {
        shared: true,
      },
    },
    {
      $addFields: {
        userId: {
          $convert: {
            input: "$userId",
            to: "objectId",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo", // Unwind the playlistInfo array
    },
  ]);

  if (!publicPlaylists || publicPlaylists.length === 0) {
    return res.status(404).json();
  }

  res.status(200).json(publicPlaylists);
});

//add/remove playlsit from the public playlists
router.post("/public-playlists", verifyToken, async (req, res) => {
  try {
    let playlistId = req.body._id;
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
      $set: { shared: req.body.shared ? false : true },
    });
    res.status(200).json();
  } catch (error) {
    res.status(500).json();
  }
});

// add playlist to user from shared playlists
router.post("/add-public-playlist-to-user", verifyToken, async (req, res) => {
  let userId = req.body.userId;
  let playlsit = req.body;
  const { title, description, tags, tracks, shared } = playlsit;

  try {
    const newPlaylist = new Playlist({
      title,
      description,
      tags,
      tracks,
      userId,
      shared,
    });

    newPlaylist.save();
    res.status(200).json(newPlaylist);
  } catch (error) {
    res.status(500).json();
  }
});

module.exports = router;
