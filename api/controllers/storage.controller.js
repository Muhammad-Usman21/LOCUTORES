import Storage from "../models/storage.model.js";

export const storeInfo = async (req, res, next) => {
	try {
		if (req.user.isAdmin) {
		const { youtubeLink, recommended } = req.body;

		const newStorage = new Storage({
			youtubeLink,
			recommended,
		});

		await newStorage.save();

		return res.status(201).json({
			storage: newStorage,
		});
		}
	} catch (error) {
		next(error);
	}
};

export const updateInfo = async (req, res, next) => {
	try {
		if (req.user.isAdmin) {
		const { youtubeLink, recommended } = req.body;

		const updatedStorage = await Storage.findOneAndUpdate(
			{},
			{
				$set: {
					youtubeLink,
					recommended,
				},
			},
			{ new: true }
		);

		return res.status(201).json({
			storage: updatedStorage._doc,
		});
		}
	} catch (error) {
		next(error);
	}
};

export const getInfo = async (req, res, next) => {
	try {
		// Retrieve all documents from the 'Storage' collection
		const data = await Storage.find();

		// Check if any documents are found and respond accordingly
		if (data.length > 0) {
			res.json({
				youtubeLink: data[0].youtubeLink,
				recommended: data[0].recommended,
				found: true,
			});
		} else {
			res.json({ found: false });
		}
	} catch (error) {
		// Handle any errors that occur during the process
		next(error); // Pass the error to the next middleware (error handler)
	}
};
