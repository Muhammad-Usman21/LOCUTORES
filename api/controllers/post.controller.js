import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

export const createPost = async (req, res, next) => {
	if (!req.body.title || !req.body.content) {
		return next(errorHandler(400, "Title and Content are required fields!"));
	}

	const newPost = new Post({
		...req.body,
		userId: req.user.id,
	});

	try {
		const savedPost = await newPost.save();
		res.status(201).json(savedPost);
	} catch (error) {
		next(error);
	}
};

export const getPostsPublic = async (req, res, next) => {
	try {
		const startIndex = parseInt(req.query.startIndex) || 0;
		const limit = parseInt(req.query.limit) || 9;
		const sortDirection = req.query.sort === "asc" ? 1 : -1;

		const posts = await Post.find({
			...(req.query.userId && { userId: req.query.userId }),
			...(req.query.postId && { _id: req.query.postId }),
			...(req.query.searchTerm && {
				$or: [
					{ title: { $regex: req.query.searchTerm, $options: "i" } },
					{ content: { $regex: req.query.searchTerm, $options: "i" } },
				],
			}),
		})
			.populate("userId")
			.sort({ createdAt: sortDirection })
			.skip(startIndex)
			.limit(limit);

		res.status(200).json(posts);
	} catch (error) {
		next(error);
	}
};

export const deletePost = async (req, res, next) => {
	if (!req.user.isAdmin || req.user.id !== req.params.userId) {
		return next(errorHandler("You are not allowed to delete this post"));
	}
	try {
		await Post.findByIdAndDelete(req.params.postId);
		res.status(200).json("The post has been deleted");
	} catch (error) {
		next(error);
	}
};
