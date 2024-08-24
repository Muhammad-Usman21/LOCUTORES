import mongoose from "mongoose";
import { type } from "os";

const sellerSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
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
	},
	{ timestamps: true }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
