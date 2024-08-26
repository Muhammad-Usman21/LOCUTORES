import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import Speaker from "../models/speaker.model.js";
dotenv.config();

export const getOrders = async (req, res) => {
	try {
		const userId = req.user.id;
		const speakerId = await Speaker.find({ userId });

		const { startIndex, limit } = req.query;

		const orders = await Order.find({
			$or: [{ userId }, { speakerId }],
		})
			.populate({
				path: "speakerId",
				populate: {
					path: "userId",
					model: "User",
				},
			})
			.populate("userId")
			.sort({ updatedAt: -1 })
			.skip(startIndex || 0)
			.limit(limit || 10);
		console.log(orders);

		res.status(200).json(orders);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch orders", error });
	}
};

export const getOrderNotification = async (req, res) => {
	try {
		const userId = req.user.id;
		const speakerId = await Speaker.find({ userId });

		const orderInfo = await Order.find(
			{
				$or: [{ userId }, { speakerId }],
			},
			"_id status updatedAt"
		)
			.sort({ updatedAt: -1 })
			.limit(10);

		res.status(200).json(orderInfo);
	} catch (error) {
		console.error("Error retrieving order status info:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

export const createNewOrder = async (req, res, next) => {
	const data = req.body;
	if (req.user.id !== data.user._id) {
		return res.status(403).send({ error: "Unauthorized" });
	}

	if (!data.user || !data.speaker || !data.data || !data.amount) {
		return res.status(400).send({ error: "Invalid order data" });
	}

	const duration = {
		small: "10 ~ 20 seconds",
		medium: "30 ~ 40 seconds",
		large: "1 minute",
	};

	const order = new Order({
		userId: data.user._id,
		speakerId: data.speaker._id,
		userPhone: data.data.number,
		userComapny: data.data.company,
		userContry: data.data.country,
		userCity: data.data.city,
		service: data.data.service,
		audioDuration: data.data.duration,
		specs: data.data.specs,
		amount: data.amount,
		status: "Pending Payment",
		quote: data.data.quote,
	});
	await order.save();

	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: `${data.data.service} (${data.speaker.gender} voiceover)`,
						description: `${duration[data.data.duration]} duration by ${
							data.speaker.userId.name
						} from ${data.speaker.country}`,
						images: [data.speaker.image],
					},
					unit_amount: data.amount * 100,
				},
				quantity: 1,
			},
		],
		payment_intent_data: {
			capture_method: "manual",
			transfer_data: {
				destination: data.speaker.stripeAccountId,
			},
		},
		mode: "payment",
		success_url: `${process.env.CLIENT_URL}/api/order/status?orderId=${order._id}&status=Pending Delivery`,
		cancel_url: `${process.env.CLIENT_URL}/api/order/status?orderId=${order._id}&status=Cancelled`,
	});

	order.paymentIntentId = session.id;
	await order.save();

	res.status(200).json(session);
};

export const updateOrderStatus = async (req, res) => {
	const { orderId, status } = req.query;
	const { audioFile, rejectMessage, speakerMessage } = req.body;

	try {
		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).send({ error: "Order not found" });
		}

		order.status = status;
		order.audioFile = audioFile;
		order.rejectMessage = rejectMessage;
		order.speakerMessage = speakerMessage;
		await order.save();

		if (status === "Completed") {
			const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

			const sessionDetails = await stripe.checkout.sessions.retrieve(
				order.paymentIntentId
			);

			const paymentIntent = await stripe.paymentIntents.capture(
				sessionDetails.payment_intent
			);
		}

		res.status(200).send({ message: "Order status updated" });
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};

export const updateOrderPaymentStatus = async (req, res) => {
	const { orderId, status } = req.query;

	try {
		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).send({ error: "Order not found" });
		}

		order.status = status;
		await order.save();

		// res.redirect("http://localhost:5173/orders");
		res.redirect("https://locutores-project.onrender.com/orders");
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};
