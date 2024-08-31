import mongoose from "mongoose";

const storageSchema = new mongoose.Schema(
	{
		youtubeLink: {
			type: String,
		},
		recommended: {
			type: Array,
			default: [],
		},
		pdfs: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true }
);

const Storage = mongoose.model("Storage", storageSchema);

export default Storage;
