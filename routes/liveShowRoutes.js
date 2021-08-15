const LiveShow = require("../models/liveShowModel");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");
exports.getLiveShowDetails = (req, res) => {
  LiveShow.findOne({ roomCode: req.params.roomCode })
    .populate("host", "userName profileImageUrl fullName")
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((e) => {
      return res.status(500).json(e);
    });
};

exports.getAllLiveShow = (req, res) => {
  LiveShow.find({ privacy: "Public" })
    .populate("host", "userName profileImageUrl fullName")
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((e) => {
      return res.status(500).json(e);
    });
};

exports.getFollowingsLiveShow = (req, res) => {
  User.findById(req.user._id)
    .select("followings")
    .then((data) => {
      LiveShow.find({
        $or: [{ host: data.followings }, { host: req.user._id }],
      })
        .populate("host", "userName profileImageUrl fullName")
        .then((doc) => {
          return res.status(200).json(doc);
        })
        .catch((e) => {
          console.log(e);
          return res.status(500).json({ mes: "live show db error" });
        });
    })
    .catch((e) => {
      console.log(e);
      return res.status(500).json({ mes: "user db err" });
    });
};

exports.getGenreLiveShow = (req, res) => {
  LiveShow.find({ privacy: "Public", genre: req.params.genre })
    .populate("host", "userName profileImageUrl fullName")
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((e) => {
      return res.status(200).json(e);
    });
};
exports.createLiveShow = (req, res) => {
  const liveShowDetail = {
    host: req.user._id,
    description: req.body.description,
    roomCode: uuidv4(),
    posterUrl:
      req.body.posterUrl === undefined
        ? "https://cdn.pastemagazine.com/www/articles/2016/01/21/ProphetEW_Main.jpg"
        : req.body.posterUrl,
    privacy: req.body.privacy,
    roomTitle: req.body.roomTitle,
    genre: req.body.genre,
    memberNumber: 0,
    videoUrl:
      req.body.videoUrl === ""
        ? "https://www.youtube.com/watch?v=vuQR6Mj64jQ"
        : req.body.videoUrl,
  };
  console.log(liveShowDetail);
  LiveShow.findOneAndUpdate({ host: req.user._id }, liveShowDetail, {
    upsert: true,
    setDefaultsOnInsert: true,
    new: true,
  })
    .then((data) => {
      LiveShow.findById(data._id)
        .populate("host", "userName profileImageUrl fullName")
        .then((doc) => {
          return res.status(201).json(doc);
        })
        .catch((e) => {
          return res.status(500).json(e);
        });
    })
    .catch((e) => {
      console.log(e);
    });
};
