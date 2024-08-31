import Storage from "../models/storage.model.js";

export const storeInfo = async (req, res, next) => {
	try {
		if (req.user.isAdmin) {
			const { youtubeLink, recommended, pdfs } = req.body;

			const newStorage = new Storage({
				youtubeLink,
				recommended,
				pdfs,
			});

			await newStorage.save();

			return res.status(201).json({
				youtubeLink: newStorage.youtubeLink,
				recommended: newStorage.recommended,
				pdfs: newStorage.pdfs,
				found: true,
			});
		}
	} catch (error) {
		next(error);
	}
};

export const updateInfo = async (req, res, next) => {
	try {
		if (req.user.isAdmin) {
			const { youtubeLink, recommended, pdfs } = req.body;

			const storage = await Storage.findOne();
			storage.youtubeLink = youtubeLink;
			storage.recommended = recommended;
			storage.pdfs = pdfs;
			const updatedStorage = await storage.save();
			//   console.log(updatedStorage);
			//   console.log(updatedStorage._doc);
			return res.status(201).json({
				youtubeLink: updatedStorage.youtubeLink,
				recommended: updatedStorage.recommended,
				pdfs: updatedStorage.pdfs,
				found: true,
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
				pdfs: data[0].pdfs,
				found: true,
			});
		} else {
			res.json({
				youtubeLink: "",
				recommended: [],
				pdfs: [],
				found: false,
			});
		}
	} catch (error) {
		// Handle any errors that occur during the process
		next(error); // Pass the error to the next middleware (error handler)
	}
};
