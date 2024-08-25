import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import Speaker from "../models/speaker.model.js";
dotenv.config();

export const getOrders = async (req, res) => {
	try {
		const userId = req.user.id;
		const speakerId = await Speaker.find({ userId });

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
			.sort({ createdAt: -1 });

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
		);

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
		mode: "payment",
		success_url: `${process.env.CLIENT_URL}/api/order/status?orderId=${order._id}&status=Pending Delivery`,
		cancel_url: `${process.env.CLIENT_URL}/api/order/status?orderId=${order._id}&status=Cancelled`,
	});

	res.status(200).json(session);
};

export const updateOrderStatus = async (req, res) => {
	const { orderId, status } = req.query;

	try {
		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).send({ error: "Order not found" });
		}

		order.status = status;
		await order.save();

		res.redirect("http://localhost:5173/orders");
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};

export const orderDelivered = async (req, res) => {
	const { orderId, speakerStripeAccountId } = req.body;

	try {
		// Find the order by ID
		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).send({ error: "Order not found" });
		}

		if (order.status !== "Pending Delivery") {
			return res.status(400).send({ error: "Order is not pending delivery" });
		}

		order.status = "Completed";
		await order.save();

		// Transfer funds to the speaker's Stripe-connected account
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

		const transfer = await stripe.transfers.create({
			amount: order.amount * 100, // amount in cents
			currency: "usd",
			destination: speakerStripeAccountId,
			transfer_group: `ORDER_${order._id}`,
		});

		res
			.status(200)
			.send({ message: "Order delivered and funds transferred", transfer });
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};
