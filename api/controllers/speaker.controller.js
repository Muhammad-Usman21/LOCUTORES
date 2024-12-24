import Speaker from "../models/speaker.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const getSpeakers = async (req, res) => {
	try {
		var { voiceType, country, startIndex, limit, sort, speakerId, searchTerm } =
			req.query;
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
		if (speakerId) {
			query._id = speakerId;
		}
		if (searchTerm) {
			query.demos = {
				$elemMatch: {
					keywords: { $regex: searchTerm, $options: "i" },
				},
			};
		}

		console.log(searchTerm);

		const speakers = await Speaker.find(query)
			.sort({ createdAt: sort || "desc" })
			.skip(startIndex || 0)
			.limit(limit || 9)
			.populate({
				path: "userId", // Field in Speaker schema that references User
				select: "name email isPremium", // Select only the name field from the User document
			});

		console.log(speakers);

		if (searchTerm) {
			// Filter demos based on search term
			const filteredSpeakers = speakers.map((speaker) => {
				const filteredDemos = (speaker.demos || []).filter((demo) =>
					demo.keywords.toLowerCase().includes(searchTerm.toLowerCase())
				);
				return {
					...speaker.toObject(),
					demos: filteredDemos, // Replace demos with filtered demos
				};
			});
			res.json(filteredSpeakers);
		} else {
			res.json(speakers);
		}
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

		console.log(req.body);
		const {
			videos,
			image,
			gender,
			country,
			demos,
			prices,
			about,
			stripeAccountId,
			socialMedia,
			mail,
		} = req.body;

		// Extract the username from the email (before the @ symbol)
		const username = mail.split("@")[0];
		// Remove periods and convert the username to lowercase
		const slug = username.replace(/\./g, "").toLowerCase();

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
		// if (!stripeAccountId) {
		// 	return next(errorHandler(400, "Stripe account is required."));
		// }
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
			videos,
			image,
			gender,
			country,
			demos,
			prices,
			about,
			// stripeAccountId,
			socialMedia,
			slug,
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

		console.log(req.body);
		const {
			videos,
			image,
			gender,
			country,
			demos,
			prices,
			about,
			// stripeAccountId,
			socialMedia,
		} = req.body;

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
		// if (!stripeAccountId) {
		// 	return next(errorHandler(400, "Stripe account is required."));
		// }
		if (!Array.isArray(demos) || demos.length === 0) {
			return next(errorHandler(400, "At least one demo is required."));
		}

		const updatedSpeaker = await Speaker.findByIdAndUpdate(
			req.params.speakerId,
			{
				$set: {
					videos,
					image,
					gender,
					country,
					demos,
					prices,
					about,
					// stripeAccountId,
					socialMedia,
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
	const { slug } = req.params; // Extract the slug from the request parameters
	try {
		// Find the speaker by slug
		const speaker = await Speaker.findOne({ slug }).populate(
			"userId",
			"name email isPremium"
		);
		if (!speaker) {
			return res.status(404).json({ message: "Speaker not found" });
		}
		res.json(speaker);
	} catch (error) {
		console.error("Failed to fetch speaker", error);
		res.status(500).json({ error: "Failed to fetch speaker" });
	}
};
