import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			requred: true,
			unique: true,
		},
		email: {
			type: String,
			requred: true,
			unique: true,
		},
		password: {
			type: String,
			requred: true,
		},
		profilePicture: {
			type: String,
			default:
				"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
		},
		about: {
			type: String,
		},
		isSeller: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
