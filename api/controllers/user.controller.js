import Stripe from "stripe";
import Speaker from "../models/speaker.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

export const test = (req, res) => {
  res.json({ message: "API is working!" });
};

export const updateUser = async (req, res, next) => {
  // console.log(req.user);
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }

  // let hashedPassword;
  const {
    name,
    email,
    currentPassword,
    password,
    confirmPassword,
    profilePicture,
    forgetPassword,
  } = req.body;

  const validUser = await User.findById(req.params.userId);
  if (!validUser) {
    return next(errorHandler(404, "Oops! User not found."));
  }

  // if (!validUser.googleAuth && !forgetPassword) {
  // 	if (!currentPassword || currentPassword === "") {
  // 		return next(
  // 			errorHandler(
  // 				400,
  // 				"Enter your current password for update your profile."
  // 			)
  // 		);
  // 	} else {
  // 		const validPassword = bcryptjs.compareSync(
  // 			currentPassword,
  // 			validUser.password
  // 		);
  // 		if (!validPassword) {
  // 			return next(errorHandler(400, "Invalid password. Try again!"));
  // 		}
  // 	}
  // }

  // if (password || password === "") {
  // 	if (password !== confirmPassword) {
  // 		return next(errorHandler(400, "Your password isn't same. Try again!"));
  // 	}
  // 	if (password.length < 8) {
  // 		return next(errorHandler(400, "Password must be atleast 8 characters!"));
  // 	}

  // 	hashedPassword = bcryptjs.hashSync(password, 10);
  // }

  // if (name || name === "") {
  // 	if (name === "") {
  // 		return next(errorHandler(400, "Name required!"));
  // 	}
  // }

  // if (email || email === "") {
  // 	if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  // 		return next(errorHandler(400, "Enter a valid email (name@company.com)"));
  // 	}
  // 	if (email !== email.toLowerCase()) {
  // 		return next(errorHandler(400, "Email must be lowercase!"));
  // 	}

  // 	const checkEmail = await User.findOne({ email });
  // 	if (checkEmail) {
  // 		return next(errorHandler(400, "Email already exists. Try another one!"));
  // 	}
  // }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          name,
          // email,
          // password: hashedPassword,
          profilePicture,
        },
      },
      { new: true }
    );

    // const { password: pass, ...restInfo } = updatedUser._doc;
    res.status(200).json(updatedUser._doc);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }

  const { inputPassword } = req.body;

  const validUser = await User.findById(req.user.id);
  if (!validUser) {
    return next(errorHandler(404, "Oops! User not found."));
  }

  if (!validUser.googleAuth) {
    if (!inputPassword || inputPassword === "") {
      return next(errorHandler(400, "Password required!"));
    } else {
      const validPassword = bcryptjs.compareSync(
        inputPassword,
        validUser.password
      );
      if (!validPassword) {
        return next(errorHandler(400, "Invalid password. Try again!"));
      }
    }
  }

  try {
    await User.findByIdAndDelete(req.params.userId);
    if (req.params.userId === req.user.id) {
      res.clearCookie("access_token");
    }
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    // const usersWithoutPassword = users.map((user) => {
    // 	const { password, ...rest } = user._doc;
    // 	return rest;
    // });

    res.status(200).json({
      users,
      // users: usersWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler("User not found!"));
    }

    // const { password, ...restInfo } = user._doc;
    res.status(200).json(user._doc);
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (req, res, next) => {
  const { userId } = req.query;

  if (req.user.id !== userId) {
    return res.status(403).send({ error: "Unauthorized" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Subscription",
            },
            unit_amount: process.env.VITE_PREMIUM_AMOUNT * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/api/user/subscribe-callback?userId=${userId}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?tab=premium`,
    });

    await User.findByIdAndUpdate(userId, {
      premiumSessionId: session.id,
    });

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};

export const subscribeCallback = async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(errorHandler(400, "User not found"));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(
      user.premiumSessionId
    );

    if (session.payment_status === "paid") {
      user.isPremium = true;
      await user.save();
    }

    res.redirect(`/dashboard?tab=premium&updateUser=true`);
  } catch (error) {
    next(error);
  }
};