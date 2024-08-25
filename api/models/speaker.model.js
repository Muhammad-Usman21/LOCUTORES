import mongoose from "mongoose";

const speakerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      requred: true,
      unique: true,
      ref: "User",
    },
    video: {
      type: String,
    },
    image: {
      type: String,
      requred: true,
    },
    gender: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    demos: {
      type: Array,
      default: [],
    },
    about: {
      type: String,
    },
  },
  { timestamps: true }
);

const Speaker = mongoose.model("Speaker", speakerSchema);

export default Speaker;
