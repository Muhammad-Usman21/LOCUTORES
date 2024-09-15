import mongoose from "mongoose";

const speakerSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			unique: true,
			ref: "User",
		},
		videos: {
			type: Array,
			default: [],
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
			type: Map,
			of: String,
			default: {},
		},
		keywords: [String],
		prices: {
			small: { type: Number, required: true },
			medium: { type: Number, required: true },
			large: { type: Number, required: true },
		},
		about: {
			type: String,
		},
		stripeAccountId: {
			type: String,
		},
		socialMedia: {
			instagram: { type: String },
			twitter: { type: String },
			facebook: { type: String },
			whatsapp: { type: String },
		},
	},
	{ timestamps: true }
);

const Speaker = mongoose.model("Speaker", speakerSchema);

export default Speaker;
