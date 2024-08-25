import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import speakerRoutes from "./routes/speaker.route.js";
import orderRoutes from "./routes/order.route.js";
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
app.use("/api/speaker", speakerRoutes);
app.use("/api/order", orderRoutes);

// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// app.post('/become-a-speaker', async (req, res) => {
//     const { name, email, address } = req.body;

//     try {
//         // Create a new speaker document (but don't save the Stripe account ID yet)
//         const speaker = new Speaker({ name, email, address });
//         await speaker.save();

//         // Generate the Stripe OAuth link
//         const state = speaker._id.toString(); // Use the speaker's MongoDB ID as state to retrieve it later
//         const clientId = process.env.STRIPE_CLIENT_ID;

//         const redirectUri = stripe.oauth.authorizeUrl({
//             response_type: 'code',
//             client_id: clientId,
//             scope: 'read_write',
//             redirect_uri: `${process.env.CLIENT_URL}/stripe/callback`,
//             state: state,
//         });

//         res.status(200).send({ url: redirectUri });
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });

// // Handle the OAuth callback from Stripe
// app.get('/stripe/callback', async (req, res) => {
//     const { code, state } = req.query;

//     try {
//         const response = await stripe.oauth.token({
//             grant_type: 'authorization_code',
//             code: code,
//         });

//         const stripeAccountId = response.stripe_user_id;

//         // Find the speaker using the state (which is the speaker's ID)
//         const speaker = await Speaker.findByIdAndUpdate(state, { stripeAccountId: stripeAccountId }, { new: true });

//         if (!speaker) {
//             return res.status(404).send({ error: 'Speaker not found' });
//         }

//         res.redirect('http://localhost:3000/success'); // Redirect to a success page on your frontend
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
