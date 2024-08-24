import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import paymentRoutes from "./routes/payment.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

mongoose
	.connect(process.env.MONGO)
	.then(() => {
		console.log("MongoDB is connected");
	})
	.catch((err) => {
		console.log(err);
	});

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.listen(3000, () => {
	console.log("Server is running on port 3000!");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/become-a-seller', async (req, res) => {
    const { name, email, address } = req.body;

    try {
        // Create a new seller document (but don't save the Stripe account ID yet)
        const seller = new Seller({ name, email, address });
        await seller.save();

        // Generate the Stripe OAuth link
        const state = seller._id.toString(); // Use the seller's MongoDB ID as state to retrieve it later
        const clientId = process.env.STRIPE_CLIENT_ID;

        const redirectUri = stripe.oauth.authorizeUrl({
            response_type: 'code',
            client_id: clientId,
            scope: 'read_write',
            redirect_uri: 'http://localhost:5000/stripe/callback',
            state: state,
        });

        res.status(200).send({ url: redirectUri });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Handle the OAuth callback from Stripe
app.get('/stripe/callback', async (req, res) => {
    const { code, state } = req.query;

    try {
        const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code: code,
        });

        const stripeAccountId = response.stripe_user_id;

        // Find the seller using the state (which is the seller's ID)
        const seller = await Seller.findByIdAndUpdate(state, { stripeAccountId: stripeAccountId }, { new: true });

        if (!seller) {
            return res.status(404).send({ error: 'Seller not found' });
        }

        res.redirect('http://localhost:3000/success'); // Redirect to a success page on your frontend
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";
	res.status(statusCode).json({
		success: false,
		statusCode,
		message,
	});
});
