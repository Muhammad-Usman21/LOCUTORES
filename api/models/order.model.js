import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			requred: true,
			ref: "User",
		},
		speakerId: {
			type: mongoose.Schema.Types.ObjectId,
			requred: true,
			ref: "Speaker",
		},
		userPhone: {
			type: String,
			required: true,
		},
		userComapny: {
			type: String,
			required: true,
		},
		userContry: {
			type: String,
			required: true,
		},
		userCity: {
			type: String,
			required: true,
		},
		service: {
			type: String,
			required: true,
		},
		audioDuration: {
			type: String,
			required: true,
		},
		specs: {
			type: String,
		},
		amount: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			default: "Pending Payment",
		},
		audioFile: {
			type: String,
		},
		speakerMessage: {
			type: String,
			default: null,
		},
		rejectMessage: {
			type: String,
			default: null,
		},
		paymentIntentId: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
