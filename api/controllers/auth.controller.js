import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
	// console.log(req.body);
	const { username, email, password, confirmPassword } = req.body;

	if (password !== confirmPassword) {
		return next(errorHandler(400, "Your password isn't same. Try again!"));
	}

	if (!username || !email || !password || !confirmPassword) {
		return next(errorHandler(400, "All fields are required"));
	}

	if (username.includes(" ")) {
		return next(errorHandler(400, "Username cannot contains spaces!"));
	}
	if (username !== username.toLowerCase()) {
		return next(errorHandler(400, "Username must be lowercase!"));
	}
	if (username.length < 5 || username.length > 30) {
		return next(
			errorHandler(400, "Username must be between 5 to 30 characters!")
		);
	}
	if (!username.match(/^[a-z0-9]+$/)) {
		return next(
			errorHandler(400, "Username can only contains letters and numbers!")
		);
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
	if (
		!(
			/[a-z]/.test(password) &&
			/[A-Z]/.test(password) &&
			/[0-9]/.test(password)
		)
	) {
		return next(
			errorHandler(
				400,
				"The password must contain numbers, and also both uppercase and lowercase letters.\nAnd some special characters are recommended too!"
			)
		);
	}

	const checkUsername = await User.findOne({ username });
	if (checkUsername) {
		return next(errorHandler(400, "Username already taken. Try another one!"));
	}

	const checkEmail = await User.findOne({ email });
	if (checkEmail) {
		return next(errorHandler(400, "Email already exists. Try another one!"));
	}

	const hashedPassword = bcryptjs.hashSync(password, 10);

	const newUser = new User({
		username,
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
	const { userInfo, password } = req.body;

	if (!userInfo || !password || userInfo === "" || password === "") {
		return next(errorHandler(400, "All fields are required!"));
	}

	try {
		const validUser = await User.findOne({
			$or: [{ email: userInfo }, { username: userInfo }],
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
