import mongoose from "mongoose";

const speakerSchema = new mongoose.Schema(
<<<<<<< HEAD
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			requred: true,
			unique: true,
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
		prices: {
			small: { type: Number, required: true },
			medium: { type: Number, required: true },
			large: { type: Number, required: true },
		},
		about: {
			type: String,
		},
	},
	{ timestamps: true }
=======
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
>>>>>>> 5d02e428926cbdf28b5e93dc2b22ca8b614fd956
);

const Speaker = mongoose.model("Speaker", speakerSchema);

export default Speaker;
