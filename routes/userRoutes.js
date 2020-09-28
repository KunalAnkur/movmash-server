const User = require("../models/userModel");
const Post = require("../models/postModel");
const jwt = require("jsonwebtoken");
const {
  validateSignupData,
  validateLoginData,
  reduceUserDetail,
} = require("../util/validator");
const bcrypt = require("bcrypt");
exports.signup = (req, res) => {
  const username = req.body.email.split("@")[0];

  const user = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    userName: username,
  };

  const { valid, errors } = validateSignupData(user);
  if (!valid) return res.status(400).json(errors);

  User.findOne({ email: user.email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "email already exist" });
      }
      bcrypt
        .hash(user.password, 12)
        .then((hashedpassword) => {
          const newUser = new User({
            email: user.email,
            password: hashedpassword,
            userName: user.userName,
          });
          newUser
            .save()
            .then((user) => {
              let secret = Buffer.from("myClientSecret", "base64");
              jwt.sign(
                { _id: user._id },
                secret,
                { expiresIn: "1h" },
                (err, idToken) => {
                  if (!err) {
                    const {
                      _id,
                      email,
                      userName,
                      followers,
                      followings,
                      profileImageUrl,
                      coverImageUrl,
                      followersCount,
                      followingsCount,
                      watchHour,
                      postNumber,
                    } = user;
                    return res.status(201).json({
                      idToken,
                      user: {
                        _id,
                        email,
                        userName,
                        followers,
                        followings,
                        profileImageUrl,
                        coverImageUrl,
                        followersCount,
                        followingsCount,
                        watchHour,
                        postNumber,
                      },
                    });
                  } else {
                    return res
                      .status(500)
                      .json({ general: "Something Went Wrong" });
                  }
                }
              );
            })
            .catch((e) => {
              console.log(e, "saving error");
            });
        })
        .catch((e) => {
          console.log(e, "hashing error");
        });
    })
    .catch((e) => {
      return res.status(422).json({ e });
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  User.findOne({ email: user.email })
    .then((savedUser) => {
      if (!savedUser) return res.status(422).json({ error: "User not found" });

      bcrypt
        .compare(user.password, savedUser.password)
        .then((doMatch) => {
          if (doMatch) {
            let secret = Buffer.from("myClientSecret", "base64");
            jwt.sign(
              { _id: savedUser._id },
              secret,
              { expiresIn: "1h" },
              (err, idToken) => {
                if (!err) {
                  const {
                    _id,
                    email,
                    userName,
                    followers,
                    followings,
                    profileImageUrl,
                    coverImageUrl,
                    followersCount,
                    followingsCount,
                    watchHour,
                    postNumber,
                  } = savedUser;
                  return res.status(200).json({
                    idToken,
                    user: {
                      _id,
                      email,
                      userName,
                      followers,
                      followings,
                      profileImageUrl,
                      coverImageUrl,
                      followersCount,
                      followingsCount,
                      watchHour,
                      postNumber,
                    },
                  });
                } else {
                  return res.status(500).json({ err });
                }
              }
            );
          } else {
            return res.status(422).json({ error: "Wrong credentials" });
          }
        })
        .catch((e) => {
          console.log(e);
        });
    })
    .catch((e) => {
      return res.status(422).json({ error: e });
    });
};
exports.getUserDetails = (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id userName email profileImageUrl")

        .exec((err, posts) => {
          if (err) return res.status(422).json({ error: err });
          return res.status(200).json({ user, posts });
        });
    })
    .catch((e) => {
      return res.status(503).json(e);
    });
};

// exports.followUser = (req, res) => {
//   // const id = JSON.parse(req.body.followId);
//   // console.log(req.user._id);
//   // User.findByIdAndUpdate(
//   //   req.body.followId,
//   //   { $push: { followers: req.user._id }, $inc: { followers: 1 } },
//   //   { new: true }
//   // )

//   //   .then((doc) => {
//   //     // console.log(doc);
//   //     // User.findByIdAndUpdate(
//   //     //   req.user._id,
//   //     //   {
//   //     //     $push: { followings: req.body.followId },
//   //     //     $inc: { followingsCount: -1 },
//   //     //   },
//   //     //   { new: true }
//   //     // )
//   //     //   .select("-password")
//   //     //   .then((result) => {
//   //     //     return res.status(201).json(result);
//   //     //   });
//   //     // console.log(doc);
//   //   })
//   //   .catch((err) => {
//   //     console.log(err);
//   //   });

//   User.findById()
// };

exports.followUser = (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    { $push: { followers: req.user._id }, $inc: { followersCount: 1 } },
    { new: true }
  ).exec((err, result) => {
    if (err) return res.status(422).json(err);
    User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: { followings: req.body.followId },
        $inc: { followingsCount: 1 },
      },
      { new: true }
    )
      .select("-password")
      .exec((err, doc) => {
        if (err) {
          console.log(err);
          return res.status(503).json(err);
        }
        return res.status(201).json(doc);
      });
  });
};

exports.unfollowUser = (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    { $pull: { followers: req.user._id }, $inc: { followersCount: -1 } },
    { new: true },
    (err, doc) => {
      if (err) return res.status(422).json(err);
      User.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $pull: { followings: req.body.unfollowId },
          $inc: { followingsCount: -1 },
        },
        { new: true }
      )
        .select("-password")
        .then((result) => {
          return res.status(201).json(result);
        })
        .catch((e) => {
          return res.status(422).json({ error: err });
        });
    }
  );
};