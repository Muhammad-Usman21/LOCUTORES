import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
	const { name, email, password, confirmPassword } = req.body;

	if (password !== confirmPassword) {
		return next(errorHandler(400, "Your password isn't same. Try again!"));
	}

	if (!name || !email || !password || !confirmPassword) {
		return next(errorHandler(400, "All fields are required"));
	}

	if (name === "") {
		return next(errorHandler(400, "Name required!"));
	}

	if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
		return next(errorHandler(400, "Enter a valid email (name@company.com)"));
	}
	if (email !== email.toLowerCase()) {
		return next(errorHandler(400, "Email must be lowercase!"));
	}

	if (password.length < 8) {
		return next(errorHandler(400, "Password must be atleast 8 characters!"));
	}

	const checkEmail = await User.findOne({ email });
	if (checkEmail) {
		return next(errorHandler(400, "Email already exists. Try another one!"));
	}

	const hashedPassword = bcryptjs.hashSync(password, 10);

	const newUser = new User({
		name,
		email,
		password: hashedPassword,
	});

	try {
		await newUser.save();
		res.status(201).json("User created successfully");
	} catch (error) {
		next(error);
	}
};

export const signin = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password || email === "" || password === "") {
		return next(errorHandler(400, "All fields are required!"));
	}

	try {
		const validUser = await User.findOne({
			email: email,
		});

		if (!validUser) {
			return next(errorHandler(404, "Oops! User not found."));
		}

		const validPassword = bcryptjs.compareSync(password, validUser.password);
		if (!validPassword) {
			return next(errorHandler(400, "Invalid password. Try again!"));
		}

		const token = jwt.sign(
			{
				id: validUser._id,
			},
			process.env.JWT_SECRET
		);

		const { password: pass, ...restInfo } = validUser._doc;
		res
			.status(200)
			.cookie("access_token", token, {
				httpOnly: true,
			})
			.json(restInfo);
	} catch (error) {
		next(error);
	}
};

export const signout = (req, res, next) => {
	try {
		res
			.clearCookie("access_token")
			.status(200)
			.json("User has been signed out");
	} catch (error) {
		next(error);
	}
};
