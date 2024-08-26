import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import dotenv from "dotenv";
import Speaker from "../models/speaker.model.js";

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

export const signinWithStripe = async (req, res) => {
  try {
    const speakerId = req.query.speakerId;
    console.log(speakerId);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const state = speakerId.toString();
    const clientId = process.env.STRIPE_CLIENT_ID;

    const redirectUri = stripe.oauth.authorizeUrl({
      response_type: "code",
      client_id: clientId,
      scope: "read_write",
      redirect_uri: `${process.env.CLIENT_URL}/api/auth/stripe-callback`,
      state: state,
    });

    console.log(redirectUri);

    res.status(200).send({ url: redirectUri });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const stripeCallback = async (req, res) => {
  const { code, state } = req.query;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code: code,
    });

    const stripeAccountId = response.stripe_user_id;

    const speaker = await Speaker.findByIdAndUpdate(
      state,
      { stripeAccountId: stripeAccountId },
      { new: true }
    );

    if (!speaker) {
      return res.status(404).send({ error: "Speaker not found" });
    }

    res.redirect("http://localhost:5173/");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
