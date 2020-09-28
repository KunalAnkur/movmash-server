const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    rating: Number,
    type: String,
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    likes: [{ type: ObjectId, ref: "User" }],
    comments: [{ text: String, postedBy: { type: ObjectId, ref: "User" } }],
    movieId: Number,
    review: String,
    description: String,
    showTime: String,
    genre: String,
    language: String,
    duration: String,
  },
  { timestamps: true }
);

mongoose.set("useFindAndModify", false);
module.exports = Post = mongoose.model("Post", postSchema);
// profileImageUrl: String,D
//   createdAt: String,D
//   userName: String,D
//   likeCount: Number,D
//   commentCount: Number,D
//   rating: Number,D
//   type: String,D
//   description: String,D
//   movieId: Number,D
//   review: String,D
//   showTime: String,D
//   genre: String,D
//   language: String,D
//   duration: String,D
