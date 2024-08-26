import Speaker from "../models/speaker.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

const dummySpeakers = [
	{
		userId: "64b82e8e458f4c5d9a0d6b77",
		video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		image: "https://via.placeholder.com/150?text=Speaker+1",
		gender: "female",
		country: "United States",
		demos: [
			"https://www.example.com/demo1.mp3",
			"https://www.example.com/demo2.mp3",
		],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b78",
		video: "https://www.youtube.com/watch?v=3tmd-ClpJxA",
		image: "https://via.placeholder.com/150?text=Speaker+2",
		gender: "male",
		country: "Canada",
		demos: [
			"https://www.example.com/demo3.mp3",
			"https://www.example.com/demo4.mp3",
			"https://www.example.com/demo5.mp3",
		],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b79",
		video: "https://www.youtube.com/watch?v=2L3fpx-2wH4",
		image: "https://via.placeholder.com/150?text=Speaker+3",
		gender: "female",
		country: "United Kingdom",
		demos: ["https://www.example.com/demo6.mp3"],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b80",
		video: "https://www.youtube.com/watch?v=9bZkp7q19f0",
		image: "https://via.placeholder.com/150?text=Speaker+4",
		gender: "male",
		country: "Australia",
		demos: [
			"https://www.example.com/demo7.mp3",
			"https://www.example.com/demo8.mp3",
		],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b81",
		video: "https://www.youtube.com/watch?v=5Nv0J6aM_Rs",
		image: "https://via.placeholder.com/150?text=Speaker+5",
		gender: "female",
		country: "Germany",
		demos: ["https://www.example.com/demo9.mp3"],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b82",
		video: "https://www.youtube.com/watch?v=7t7LkOrV3_4",
		image: "https://via.placeholder.com/150?text=Speaker+6",
		gender: "male",
		country: "France",
		demos: [
			"https://www.example.com/demo10.mp3",
			"https://www.example.com/demo11.mp3",
		],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b83",
		video: "https://www.youtube.com/watch?v=9tQ2MfPSr3Q",
		image: "https://via.placeholder.com/150?text=Speaker+7",
		gender: "female",
		country: "Italy",
		demos: ["https://www.example.com/demo12.mp3"],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b84",
		video: "https://www.youtube.com/watch?v=9mMnbc4Edj4",
		image: "https://via.placeholder.com/150?text=Speaker+8",
		gender: "male",
		country: "Spain",
		demos: [
			"https://www.example.com/demo13.mp3",
			"https://www.example.com/demo14.mp3",
		],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b85",
		video: "https://www.youtube.com/watch?v=mb3VeUWAHjI",
		image: "https://via.placeholder.com/150?text=Speaker+9",
		gender: "female",
		country: "Netherlands",
		demos: ["https://www.example.com/demo15.mp3"],
	},
	{
		userId: "64b82e8e458f4c5d9a0d6b86",
		video: "https://www.youtube.com/watch?v=9BDSJ08UM10",
		image: "https://via.placeholder.com/150?text=Speaker+10",
		gender: "male",
		country: "Sweden",
		demos: [
			"https://www.example.com/demo16.mp3",
			"https://www.example.com/demo17.mp3",
		],
	},
];

export const getSpeakers = async (req, res) => {
	try {
		var { voiceType, country, startIndex, limit, sort } = req.query;
		if (voiceType === "all") {
			voiceType = null;
		}
		if (country === "all") {
			country = null;
		}

		const query = {};

		if (voiceType) {
			query.gender = voiceType === "womenVoice" ? "female" : "male";
		}
		if (country) {
			query.country = country;
		}

		const speakers = await Speaker.find(query)
			.sort({ createdAt: sort || "desc" })
			.skip(startIndex || 0)
			.limit(limit || 9);

		res.json(speakers);
	} catch (error) {
		console.error("Failed to fetch speakers", error);
		res.status(500).json({ error: "Failed to fetch speakers" });
	}
};

export const createSpeaker = async (req, res, next) => {
	try {
		if (req.user.id !== req.params.userId) {
			return next(
				errorHandler(
					403,
					"You are not allowed to create speaker from this account"
				)
			);
		}
		const validUser = await User.findById(req.user.id);
		if (!validUser) {
			return next(errorHandler(404, "Oops! User not found."));
		}

		const { video, image, gender, country, demos, prices, about } = req.body;

		if (!image) {
			return next(errorHandler(400, "Image is required."));
		}
		if (!gender) {
			return next(errorHandler(400, "Gender is required."));
		}
		if (!country) {
			return next(errorHandler(400, "Country is required."));
		}
		if (
			!prices ||
			typeof prices !== "object" ||
			!prices.small ||
			!prices.medium ||
			!prices.large
		) {
			return next(errorHandler(400, "All prices are required."));
		}
		if (!Array.isArray(demos) || demos.length === 0) {
			return next(errorHandler(400, "At least one demo is required."));
		}

		// Check if userId is unique
		const existingSpeaker = await Speaker.findOne({ userId: req.user.id });
		if (existingSpeaker) {
			return next(
				errorHandler(400, "Speaker with this userId already exists.")
			);
		}

		// Create a new speaker
		const newSpeaker = new Speaker({
			userId: req.user.id,
			video,
			image,
			gender,
			country,
			demos,
			prices,
			about,
		});

		// Save the speaker to the database
		await newSpeaker.save();

		const updatedUser = await User.findByIdAndUpdate(
			req.user.id,
			{ $set: { isSpeaker: true } },
			{ new: true }
		);

		const { password, ...restInfo } = updatedUser._doc;

		return res.status(201).json({
			speaker: newSpeaker,
			user: restInfo,
		});
	} catch (error) {
		return next(errorHandler("Server error. Please try again later."));
	}
};

export const updateSpeaker = async (req, res, next) => {
	try {
		if (req.user.id !== req.params.userId) {
			return next(
				errorHandler(403, "You are not allowed to update this account")
			);
		}
		const validUser = await User.findById(req.params.userId);
		if (!validUser) {
			return next(errorHandler(404, "Oops! User not found."));
		}

		const validSpeaker = await Speaker.findById(req.params.speakerId);
		if (!validSpeaker) {
			return next(errorHandler(404, "Oops! Speaker not found."));
		}

		const checkSpeaker = await Speaker.findOne({ userId: req.user.id });
		// console.log(checkSpeaker);
		// console.log(req.params.speakerId);
		if (!checkSpeaker._id.equals(req.params.speakerId)) {
			return next(errorHandler(404, "This speaker account is not users"));
		}

		const { video, image, gender, country, demos, prices, about } = req.body;

		if (!image) {
			return next(errorHandler(400, "Image is required."));
		}
		if (!gender) {
			return next(errorHandler(400, "Gender is required."));
		}
		if (!country) {
			return next(errorHandler(400, "Country is required."));
		}
		if (
			!prices ||
			typeof prices !== "object" ||
			!prices.small ||
			!prices.medium ||
			!prices.large
		) {
			return next(errorHandler(400, "All prices are required."));
		}
		if (!Array.isArray(demos) || demos.length === 0) {
			return next(errorHandler(400, "At least one demo is required."));
		}

		const updatedSpeaker = await Speaker.findByIdAndUpdate(
			req.params.speakerId,
			{
				$set: {
					video,
					image,
					gender,
					country,
					demos,
					prices,
					about,
				},
			},
			{ new: true }
		);

		return res.status(201).json({
			speaker: updatedSpeaker._doc,
		});
	} catch (error) {
		return next(errorHandler("Server error. Please try again later."));
	}
};

export const getSpeaker = async (req, res, next) => {
	try {
		const speaker = await Speaker.findOne({ userId: req.params.userId });
		if (!speaker) {
			return next(errorHandler(404, "Oops! Speaker not found."));
		}
		res.status(200).json(speaker);
	} catch (error) {
		next(error);
	}
};

export const getSpeakerrr = async (req, res) => {
	const { id } = req.params;
	try {
		const speaker = await Speaker.findById(id).populate("userId", "name email");
		if (!speaker) {
			return res.status(404).json({ message: "Speaker not found" });
		}
		res.json(speaker);
	} catch (error) {
		console.error("Failed to fetch speaker", error);
		res.status(500).json({ error: "Failed to fetch speaker" });
	}
};
